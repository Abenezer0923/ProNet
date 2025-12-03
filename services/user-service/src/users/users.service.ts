import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSkill } from './entities/user-skill.entity';
import { Connection } from './entities/connection.entity';
import { Experience } from './entities/experience.entity';
import { Education } from './entities/education.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../posts/entities/comment.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { CommunityMember } from '../communities/entities/community-member.entity';
import { Community } from '../communities/entities/community.entity';
import { Article } from '../communities/entities/article.entity';
import { GroupMessage } from '../communities/entities/group-message.entity';
import { ArticleComment } from '../communities/entities/article-comment.entity';
import { ArticleClap } from '../communities/entities/article-clap.entity';
import { MessageReaction } from '../communities/entities/message-reaction.entity';
import { MeetingRoom } from '../communities/entities/meeting-room.entity';
import { MeetingParticipant } from '../communities/entities/meeting-participant.entity';
import { MeetingPoll } from '../communities/entities/meeting-poll.entity';
import { MeetingPollVote } from '../communities/entities/meeting-poll-vote.entity';
import { MeetingQA } from '../communities/entities/meeting-qa.entity';
import { MeetingQAUpvote } from '../communities/entities/meeting-qa-upvote.entity';
import { CommunityEvent } from '../communities/entities/community-event.entity';
import { EventAttendee } from '../communities/entities/event-attendee.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { NotificationsService } from '../notifications/notifications.service';
import {
  validateUsername,
  normalizeUsername,
  generateUniqueUsername,
} from './utils/username.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
    @InjectRepository(Education)
    private educationRepository: Repository<Education>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    @InjectRepository(CommunityMember)
    private communityMemberRepository: Repository<CommunityMember>,
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(GroupMessage)
    private groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(ArticleComment)
    private articleCommentRepository: Repository<ArticleComment>,
    @InjectRepository(ArticleClap)
    private articleClapRepository: Repository<ArticleClap>,
    @InjectRepository(MessageReaction)
    private messageReactionRepository: Repository<MessageReaction>,
    @InjectRepository(MeetingRoom)
    private meetingRoomRepository: Repository<MeetingRoom>,
    @InjectRepository(MeetingParticipant)
    private meetingParticipantRepository: Repository<MeetingParticipant>,
    @InjectRepository(MeetingPoll)
    private meetingPollRepository: Repository<MeetingPoll>,
    @InjectRepository(MeetingPollVote)
    private meetingPollVoteRepository: Repository<MeetingPollVote>,
    @InjectRepository(MeetingQA)
    private meetingQARepository: Repository<MeetingQA>,
    @InjectRepository(MeetingQAUpvote)
    private meetingQAUpvoteRepository: Repository<MeetingQAUpvote>,
    @InjectRepository(CommunityEvent)
    private communityEventRepository: Repository<CommunityEvent>,
    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsService: NotificationsService,
  ) { }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['skills', 'experiences', 'educations'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async addSkill(userId: string, addSkillDto: AddSkillDto) {
    const skill = this.userSkillRepository.create({
      userId,
      ...addSkillDto,
    });

    return await this.userSkillRepository.save(skill);
  }

  async removeSkill(userId: string, skillId: string) {
    const skill = await this.userSkillRepository.findOne({
      where: { id: skillId, userId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    await this.userSkillRepository.remove(skill);
    return { message: 'Skill removed successfully' };
  }

  async getSkills(userId: string) {
    return await this.userSkillRepository.find({ where: { userId } });
  }

  // Connections
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existingConnection = await this.connectionRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingConnection) {
      throw new Error('Already following this user');
    }

    const connection = this.connectionRepository.create({
      followerId,
      followingId,
    });

    const saved = await this.connectionRepository.save(connection);

    // Create notification for the user being followed
    const follower = await this.userRepository.findOne({ where: { id: followerId } });
    if (follower) {
      await this.notificationsService.createFollowNotification(
        followerId,
        followingId,
        `${follower.firstName} ${follower.lastName}`,
      );
    }

    return saved;
  }

  async unfollowUser(followerId: string, followingId: string) {
    const connection = await this.connectionRepository.findOne({
      where: { followerId, followingId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    await this.connectionRepository.remove(connection);
    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string) {
    const connections = await this.connectionRepository.find({
      where: { followingId: userId },
      relations: ['follower'],
    });

    return connections.map((conn) => {
      const { password, ...user } = conn.follower;
      return user;
    });
  }

  async getFollowing(userId: string) {
    const connections = await this.connectionRepository.find({
      where: { followerId: userId },
      relations: ['following'],
    });

    return connections.map((conn) => {
      const { password, ...user } = conn.following;
      return user;
    });
  }

  async getConnectionStats(userId: string) {
    const followersCount = await this.connectionRepository.count({
      where: { followingId: userId },
    });

    const followingCount = await this.connectionRepository.count({
      where: { followerId: userId },
    });

    return {
      followers: followersCount,
      following: followingCount,
    };
  }

  async isFollowing(followerId: string, followingId: string) {
    const connection = await this.connectionRepository.findOne({
      where: { followerId, followingId },
    });

    return !!connection;
  }

  async deleteAccount(userId: string) {
    console.log(`Starting comprehensive account deletion for user ${userId}...`);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Delete Community Memberships
    await this.communityMemberRepository.delete({ userId });

    // 2. Delete Post Likes
    await this.postLikeRepository.delete({ userId });

    // 3. Delete Comments
    await this.commentRepository.delete({ authorId: userId });

    // 4. Delete Posts (and their related comments/likes)
    const userPosts = await this.postRepository.find({ where: { authorId: userId } });
    for (const post of userPosts) {
      await this.commentRepository.delete({ postId: post.id });
      await this.postLikeRepository.delete({ postId: post.id });
      await this.postRepository.remove(post);
    }

    // 5. Delete Experience & Education
    await this.experienceRepository.delete({ user: { id: userId } });
    await this.educationRepository.delete({ user: { id: userId } });

    // 6. Delete Chat Data (Conversations and Messages)
    // Find conversations where user is a participant
    const conversations = await this.conversationRepository.find({
      where: [
        { participant1Id: userId },
        { participant2Id: userId }
      ]
    });

    for (const conversation of conversations) {
      // Delete all messages in the conversation
      await this.messageRepository.delete({ conversationId: conversation.id });
      // Delete the conversation itself
      await this.conversationRepository.remove(conversation);
    }

    // 7. Delete Notifications
    await this.notificationRepository.delete({ userId: userId }); // Notifications received
    await this.notificationRepository.delete({ actorId: userId }); // Notifications triggered

    // 8. Delete Articles created by user
    // First delete comments and claps by user on ANY article
    await this.articleCommentRepository.delete({ userId: userId });
    await this.articleClapRepository.delete({ userId: userId });
    
    // Then delete articles authored by user
    // Note: We should also delete comments/claps on these articles by OTHER users to avoid orphans/FK issues
    const userArticles = await this.articleRepository.find({ where: { authorId: userId } });
    for (const article of userArticles) {
      await this.articleCommentRepository.delete({ articleId: article.id });
      await this.articleClapRepository.delete({ articleId: article.id });
      await this.articleRepository.remove(article);
    }

    // 9. Delete Communities created by user
    // Note: This is a destructive action. It will delete the community and all its content.
    // Alternatively, we could transfer ownership or just set createdBy to null (which is handled by DB constraint usually)
    // But user requested "commuinty were created" to be deleted.
    const communities = await this.communityRepository.find({ where: { createdBy: userId } });
    for (const community of communities) {
      // Delete community members
      await this.communityMemberRepository.delete({ communityId: community.id });
      
      // Delete community articles
      // (Need to clean up article comments/claps first)
      const communityArticles = await this.articleRepository.find({ where: { communityId: community.id } });
      for (const article of communityArticles) {
        await this.articleCommentRepository.delete({ articleId: article.id });
        await this.articleClapRepository.delete({ articleId: article.id });
        await this.articleRepository.remove(article);
      }

      // Delete community posts (if any linked to community)
      const communityPosts = await this.postRepository.find({ where: { communityId: community.id } });
      for (const post of communityPosts) {
        await this.commentRepository.delete({ postId: post.id });
        await this.postLikeRepository.delete({ postId: post.id });
        await this.postRepository.remove(post);
      }

      // Delete Group Messages in this community's groups?
      // Groups are deleted by cascade usually if defined in entity, but let's be safe if we can access them.
      // Since we don't have GroupRepository injected, we rely on DB cascade or manual cleanup if needed.
      // However, we MUST delete messages sent by THIS user in ANY group.
      
      // Finally delete the community
      await this.communityRepository.remove(community);
    }

    // 9.5 Delete Group Messages sent by user (in any group)
    // First delete reactions by user
    await this.messageReactionRepository.delete({ userId: userId });
    // Then delete messages
    await this.groupMessageRepository.delete({ authorId: userId });

    // 9.6 Delete Meeting & Event Interactions
    // Delete votes and upvotes
    await this.meetingPollVoteRepository.delete({ userId: userId });
    await this.meetingQAUpvoteRepository.delete({ userId: userId });
    
    // Delete participation records
    await this.meetingParticipantRepository.delete({ userId: userId });
    await this.eventAttendeeRepository.delete({ user: { id: userId } });

    // Delete Q&A questions asked by user
    await this.meetingQARepository.delete({ askedById: userId });
    // Note: We might also need to handle answers by user, but MeetingQA entity structure for answers is simple string or relation?
    // Looking at entity: answeredBy is a relation. We should set it to null or delete? 
    // Usually we keep the answer but remove the link, or delete. Let's set to null if possible, or delete if strict.
    // Since we can't easily set to null with delete(), let's update.
    await this.meetingQARepository.update({ answeredById: userId }, { answeredById: null });

    // Delete Polls created by user
    // First delete votes on these polls
    const userPolls = await this.meetingPollRepository.find({ where: { createdBy: userId } });
    for (const poll of userPolls) {
        await this.meetingPollVoteRepository.delete({ pollId: poll.id });
        await this.meetingPollRepository.remove(poll);
    }

    // Delete Events organized by user
    const userEvents = await this.communityEventRepository.find({ where: { organizer: { id: userId } } });
    for (const event of userEvents) {
        await this.eventAttendeeRepository.delete({ event: { id: event.id } });
        await this.communityEventRepository.remove(event);
    }

    // Delete Meeting Rooms hosted by user
    const userMeetings = await this.meetingRoomRepository.find({ where: { hostId: userId } });
    for (const meeting of userMeetings) {
        // Delete participants
        await this.meetingParticipantRepository.delete({ meetingRoomId: meeting.id });
        
        // Delete polls and their votes
        const meetingPolls = await this.meetingPollRepository.find({ where: { meetingRoomId: meeting.id } });
        for (const poll of meetingPolls) {
            await this.meetingPollVoteRepository.delete({ pollId: poll.id });
            await this.meetingPollRepository.remove(poll);
        }

        // Delete QAs and their upvotes
        const meetingQAs = await this.meetingQARepository.find({ where: { meetingRoomId: meeting.id } });
        for (const qa of meetingQAs) {
            await this.meetingQAUpvoteRepository.delete({ questionId: qa.id });
            await this.meetingQARepository.remove(qa);
        }

        await this.meetingRoomRepository.remove(meeting);
    }

    // 10. Delete all user's connections (as follower and following)
    await this.connectionRepository.delete({ followerId: userId });
    await this.connectionRepository.delete({ followingId: userId });

    // 11. Delete all user's skills
    await this.userSkillRepository.delete({ userId });

    // 12. Delete the user
    await this.userRepository.remove(user);

    return { message: 'Account deleted successfully' };
  }

  // Username methods
  async checkUsernameAvailability(username: string) {
    const validation = validateUsername(username);
    if (!validation.valid) {
      return { available: false, error: validation.error };
    }

    const normalized = normalizeUsername(username);
    const existing = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username: normalized })
      .getOne();

    return { available: !existing, username };
  }

  async updateUsername(userId: string, newUsername: string) {
    console.log(`Updating username for user ${userId} to ${newUsername}`);

    try {
      const validation = validateUsername(newUsername);
      if (!validation.valid) {
        console.log('Username validation failed:', validation.error);
        throw new BadRequestException(validation.error);
      }

      const normalized = normalizeUsername(newUsername);
      console.log('Checking for existing username:', normalized);

      const existing = await this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.username) = LOWER(:username)', { username: normalized })
        .andWhere('user.id != :userId', { userId })
        .getOne();

      if (existing) {
        console.log('Username already taken by:', existing.id);
        throw new ConflictException('Username is already taken');
      }

      console.log('Updating user record...');
      await this.userRepository.update(userId, { username: newUsername });
      console.log('Username updated successfully');

      return { message: 'Username updated successfully', username: newUsername };
    } catch (error) {
      console.error('Error in UsersService.updateUsername:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    const normalized = normalizeUsername(username);
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skills')
      .leftJoinAndSelect('user.experiences', 'experiences')
      .leftJoinAndSelect('user.educations', 'educations')
      .where('LOWER(user.username) = LOWER(:username)', { username: normalized })
      .orderBy('experiences.startDate', 'DESC')
      .addOrderBy('educations.startDate', 'DESC')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async migrateUsernames() {
    const users = await this.userRepository.find();
    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      if (!user.username) {
        try {
          const username = await this.generateAvailableUsername(
            user.firstName,
            user.lastName,
          );
          user.username = username;
          await this.userRepository.save(user);
          migrated++;
        } catch (error) {
          console.error(`Failed to migrate user ${user.id}:`, error);
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    return { message: 'Username migration complete', migrated, skipped, total: users.length };
  }

  private async generateAvailableUsername(firstName: string, lastName: string): Promise<string> {
    let username = generateUniqueUsername(firstName, lastName);
    let attempts = 0;

    while (attempts < 10) {
      const existing = await this.userRepository.findOne({ where: { username } });
      if (!existing) return username;

      const random = Math.floor(Math.random() * 9999);
      username = `${generateUniqueUsername(firstName, lastName)}-${random}`;
      attempts++;
    }

    return `${generateUniqueUsername(firstName, lastName)}-${Date.now()}`;
  }

  // Experience methods
  async addExperience(userId: string, dto: CreateExperienceDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const experience = this.experienceRepository.create({ ...dto, user });
    return this.experienceRepository.save(experience);
  }

  async updateExperience(userId: string, id: string, dto: UpdateExperienceDto) {
    const experience = await this.experienceRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!experience) throw new NotFoundException('Experience not found');

    Object.assign(experience, dto);
    return this.experienceRepository.save(experience);
  }

  async deleteExperience(userId: string, id: string) {
    const result = await this.experienceRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0) throw new NotFoundException('Experience not found');
    return { message: 'Experience deleted successfully' };
  }

  async getExperiences(userId: string) {
    return this.experienceRepository.find({
      where: { user: { id: userId } },
      order: { startDate: 'DESC' },
    });
  }

  // Education methods
  async addEducation(userId: string, dto: CreateEducationDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const education = this.educationRepository.create({ ...dto, user });
    return this.educationRepository.save(education);
  }

  async updateEducation(userId: string, id: string, dto: UpdateEducationDto) {
    const education = await this.educationRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!education) throw new NotFoundException('Education not found');

    Object.assign(education, dto);
    return this.educationRepository.save(education);
  }

  async deleteEducation(userId: string, id: string) {
    const result = await this.educationRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0) throw new NotFoundException('Education not found');
    return { message: 'Education deleted successfully' };
  }

  async getEducations(userId: string) {
    return this.educationRepository.find({
      where: { user: { id: userId } },
      order: { startDate: 'DESC' },
    });
  }
}
