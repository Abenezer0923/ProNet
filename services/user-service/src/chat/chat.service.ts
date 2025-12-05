import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private notificationsService: NotificationsService,
  ) {}

  async createOrGetConversation(
    userId: string,
    createConversationDto: CreateConversationDto,
  ) {
    const { participantId } = createConversationDto;

    // Check if conversation already exists
    const existing = await this.conversationRepository.findOne({
      where: [
        { participant1Id: userId, participant2Id: participantId },
        { participant1Id: participantId, participant2Id: userId },
      ],
      relations: ['participant1', 'participant2'],
    });

    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversation = this.conversationRepository.create({
      participant1Id: userId,
      participant2Id: participantId,
    });

    const saved = await this.conversationRepository.save(conversation);

    return this.conversationRepository.findOne({
      where: { id: saved.id },
      relations: ['participant1', 'participant2'],
    });
  }

  async getUserConversations(userId: string) {
    const conversations = await this.conversationRepository.find({
      where: [{ participant1Id: userId }, { participant2Id: userId }],
      relations: ['participant1', 'participant2', 'messages'],
      order: { lastMessageAt: 'DESC' },
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conv.id,
            senderId: conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id,
            isRead: false,
          },
        });

        const lastMessage = conv.messages?.[conv.messages.length - 1];

        return {
          ...conv,
          unreadCount,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
        };
      }),
    );

    return conversationsWithUnread;
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is participant
    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });

    return messages;
  }

  async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
    const { conversationId, content } = sendMessageDto;

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is participant
    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      throw new NotFoundException('Conversation not found');
    }

    const message = this.messageRepository.create({
      conversationId,
      senderId: userId,
      content,
    });

    const saved = await this.messageRepository.save(message);

    // Update conversation lastMessageAt
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    // Create notification for the recipient
    const recipientId =
      conversation.participant1Id === userId
        ? conversation.participant2Id
        : conversation.participant1Id;

    const sender = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    if (sender && sender.sender) {
      await this.notificationsService.createMessageNotification(
        userId,
        recipientId,
        `${sender.sender.firstName} ${sender.sender.lastName}`,
      );
    }

    return sender;
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only the receiver can mark as read
    if (message.senderId === userId) {
      return message;
    }

    message.isRead = true;
    return this.messageRepository.save(message);
  }

  async markConversationAsRead(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      throw new NotFoundException('Conversation not found');
    }

    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();

    return { success: true };
  }

  async markAllConversationsAsRead(userId: string) {
    const conversations = await this.conversationRepository.find({
      where: [{ participant1Id: userId }, { participant2Id: userId }],
      select: ['id'],
    });

    if (conversations.length === 0) {
      return { success: true };
    }

    const conversationIds = conversations.map((conversation) => conversation.id);

    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversationId IN (:...conversationIds)', { conversationIds })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.conversationRepository.find({
      where: [{ participant1Id: userId }, { participant2Id: userId }],
    });

    const conversationIds = conversations.map((c) => c.id);

    if (conversationIds.length === 0) {
      return { count: 0 };
    }

    const count = await this.messageRepository.count({
      where: {
        conversationId: In(conversationIds),
        isRead: false,
        senderId: Not(userId),
      },
    });

    return { count };
  }
}
