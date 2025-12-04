import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string, limit: number = 50) {
    return await this.notificationRepository.find({
      where: { userId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted' };
  }

  async clearAll(userId: string) {
    await this.notificationRepository.delete({ userId });
    return { message: 'All notifications cleared' };
  }

  // Helper methods to create specific notification types
  async createFollowNotification(followerId: string, followingId: string, actorName: string) {
    return await this.create({
      userId: followingId,
      type: NotificationType.FOLLOW,
      title: 'New Follower',
      message: `${actorName} started following you`,
      actionUrl: `/profile/${followerId}`,
      actorId: followerId,
    });
  }

  async createMessageNotification(senderId: string, recipientId: string, senderName: string) {
    return await this.create({
      userId: recipientId,
      type: NotificationType.MESSAGE,
      title: 'New Message',
      message: `${senderName} sent you a message`,
      actionUrl: '/chat',
      actorId: senderId,
    });
  }

  async createLikeNotification(likerId: string, postAuthorId: string, postId: string, likerName: string) {
    // Don't notify if user likes their own post
    if (likerId === postAuthorId) return null;

    return await this.create({
      userId: postAuthorId,
      type: NotificationType.LIKE,
      title: 'Post Liked',
      message: `${likerName} liked your post`,
      actionUrl: `/posts/${postId}`,
      actorId: likerId,
      relatedId: postId,
    });
  }

  async createCommentNotification(
    commenterId: string,
    postAuthorId: string,
    postId: string,
    commenterName: string,
  ) {
    // Don't notify if user comments on their own post
    if (commenterId === postAuthorId) return null;

    return await this.create({
      userId: postAuthorId,
      type: NotificationType.COMMENT,
      title: 'New Comment',
      message: `${commenterName} commented on your post`,
      actionUrl: `/posts/${postId}`,
      actorId: commenterId,
      relatedId: postId,
    });
  }

  async createJobPostedNotification(
    organizationId: string,
    recipientId: string,
    jobId: string,
    organizationName: string,
    jobTitle: string,
  ) {
    if (organizationId === recipientId) return null;

    return await this.create({
      userId: recipientId,
      type: NotificationType.JOB_POSTED,
      title: 'New Job Opportunity',
      message: `${organizationName} posted ${jobTitle}`,
      actionUrl: `/jobs/${jobId}`,
      actorId: organizationId,
      relatedId: jobId,
    });
  }

  async createJobApplicationNotification(
    applicantId: string,
    organizationId: string,
    jobId: string,
    applicantName: string,
    jobTitle: string,
  ) {
    if (applicantId === organizationId) return null;

    return await this.create({
      userId: organizationId,
      type: NotificationType.JOB_APPLICATION,
      title: 'New Job Application',
      message: `${applicantName} applied for ${jobTitle}`,
      actionUrl: `/jobs/${jobId}`,
      actorId: applicantId,
      relatedId: jobId,
    });
  }
}
