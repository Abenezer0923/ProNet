import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/communities',
})
@Injectable()
export class CommunitiesGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private groupMembers: Map<string, Set<string>> = new Map(); // groupId -> Set of socketIds

  constructor(
    private communitiesService: CommunitiesService,
    private jwtService: JwtService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store user-socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      this.socketUsers.set(client.id, userId);

      client.data.userId = userId;
      console.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (userId) {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
    }

    // Remove from all groups
    this.groupMembers.forEach((members, groupId) => {
      members.delete(client.id);
    });

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_group')
  async handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    console.log('=== JOIN_GROUP EVENT RECEIVED ===');
    console.log('Socket ID:', client.id);
    console.log('User ID:', client.data.userId);
    console.log('Data:', data);

    try {
      const userId = client.data.userId;
      const { groupId } = data;

      if (!groupId) {
        console.error('No groupId provided in join_group event');
        client.emit('error', { message: 'Group ID is required' });
        return;
      }

      console.log(`Attempting to join group ${groupId} for user ${userId}`);

      // Verify user is a member of the community
      const group = await this.communitiesService.getGroup(groupId);
      console.log('Group found:', group.id, group.name);

      const isMember = await this.communitiesService.isMember(
        group.community.id,
        userId,
      );

      console.log('Is member:', isMember);

      if (!isMember) {
        console.error(`User ${userId} is not a member of community ${group.community.id}`);
        client.emit('error', { message: 'Not a member of this community' });
        return;
      }

      // Join the group room
      client.join(`group:${groupId}`);
      console.log(`✅ User ${userId} successfully joined room: group:${groupId}`);

      // Track group membership
      if (!this.groupMembers.has(groupId)) {
        this.groupMembers.set(groupId, new Set());
      }
      this.groupMembers.get(groupId).add(client.id);

      // Notify others in the group
      client.to(`group:${groupId}`).emit('user_joined', {
        userId,
        groupId,
      });

      console.log(`User ${userId} joined group ${groupId} - Total in room: ${this.groupMembers.get(groupId).size}`);
    } catch (error) {
      console.error('Error joining group:', error);
      console.error('Error stack:', error.stack);
      client.emit('error', { message: 'Failed to join group' });
    }
  }

  @SubscribeMessage('leave_group')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const { groupId } = data;
    const userId = client.data.userId;

    client.leave(`group:${groupId}`);

    // Remove from tracking
    const members = this.groupMembers.get(groupId);
    if (members) {
      members.delete(client.id);
    }

    // Notify others
    client.to(`group:${groupId}`).emit('user_left', {
      userId,
      groupId,
    });

    console.log(`User ${userId} left group ${groupId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; content: string; attachments?: any[] },
  ) {
    console.log('=== SEND_MESSAGE EVENT RECEIVED ===');
    console.log('Socket ID:', client.id);
    console.log('User ID:', client.data.userId);
    console.log('Data:', data);

    try {
      const userId = client.data.userId;
      const { groupId, content, attachments } = data;

      if (!groupId || !content) {
        console.error('Missing groupId or content in send_message event');
        client.emit('error', { message: 'Group ID and content are required' });
        return;
      }

      console.log(`💬 Saving message to database: group=${groupId}, user=${userId}, content="${content}"`);

      // Save message to database
      const message = await this.communitiesService.sendMessage(
        groupId,
        userId,
        { content, attachments },
      );

      console.log(`✅ Message saved with ID: ${message.id}`);

      // Broadcast to all users in the group (including sender)
      this.server.to(`group:${groupId}`).emit('message_received', message);

      // Also emit to sender to ensure they receive it
      client.emit('message_received', message);

      console.log(`📡 Message broadcast to group ${groupId} by user ${userId}`);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error stack:', error.stack);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const userId = client.data.userId;
    const { groupId } = data;

    client.to(`group:${groupId}`).emit('user_typing', {
      userId,
      groupId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const userId = client.data.userId;
    const { groupId } = data;

    client.to(`group:${groupId}`).emit('user_stopped_typing', {
      userId,
      groupId,
    });
  }

  @SubscribeMessage('message_read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; groupId: string },
  ) {
    const userId = client.data.userId;
    const { messageId, groupId } = data;

    // Notify others that message was read
    client.to(`group:${groupId}`).emit('message_read', {
      messageId,
      userId,
      groupId,
    });
  }

  // Helper method to send notifications to specific users
  sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  // Helper method to get online users in a group
  getOnlineUsersInGroup(groupId: string): string[] {
    const members = this.groupMembers.get(groupId);
    if (!members) return [];

    const userIds = new Set<string>();
    members.forEach((socketId) => {
      const userId = this.socketUsers.get(socketId);
      if (userId) {
        userIds.add(userId);
      }
    });

    return Array.from(userIds);
  }
}
