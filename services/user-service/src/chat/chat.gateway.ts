import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      // Join user's personal room
      client.join(`user:${userId}`);

      // Notify others that user is online
      this.server.emit('userOnline', { userId });

      console.log(`User ${userId} connected to chat`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.server.emit('userOffline', { userId });
      console.log(`User ${userId} disconnected from chat`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    try {
      const userId = client.data.userId;
      const message = await this.chatService.sendMessage(userId, data);

      // Get conversation to find the other participant
      const conversations = await this.chatService.getUserConversations(userId);
      const conversation = conversations.find((c) => c.id === data.conversationId);

      if (conversation) {
        const otherUserId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        // Send to both users
        this.server.to(`user:${userId}`).emit('message', message);
        this.server.to(`user:${otherUserId}`).emit('message', message);
      }

      return message;
    } catch (error) {
      console.error('Send message error:', error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    // Broadcast to conversation participants except sender
    client.to(`conversation:${data.conversationId}`).emit('typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const userId = client.data.userId;
      const message = await this.chatService.markAsRead(data.messageId, userId);

      // Notify sender that message was read
      this.server.to(`user:${message.senderId}`).emit('messageRead', {
        messageId: message.id,
        conversationId: message.conversationId,
      });

      return message;
    } catch (error) {
      console.error('Mark as read error:', error);
      return { error: error.message };
    }
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
