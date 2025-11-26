import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { Group } from './entities/group.entity';
import { GroupMessage } from './entities/group-message.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { User } from '../users/entities/user.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { MeetingsService } from './meetings.service';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @InjectRepository(CommunityMember)
    private memberRepository: Repository<CommunityMember>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMessage)
    private messageRepository: Repository<GroupMessage>,
    @InjectRepository(MessageReaction)
    private reactionRepository: Repository<MessageReaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private meetingsService: MeetingsService,
  ) { }

  async create(userId: string, createCommunityDto: CreateCommunityDto) {
    console.log(`Creating community for user ${userId}`, createCommunityDto);
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.error(`User not found: ${userId}`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      console.log('User verified:', user.email);

      const community = this.communityRepository.create({
        ...createCommunityDto,
        createdBy: userId,
        memberCount: 1,
      });

      console.log('Community entity created, attempting to save...');
      const savedCommunity = await this.communityRepository.save(community);
      console.log('Community saved:', savedCommunity.id);

      // Add creator as owner
      const member = this.memberRepository.create({
        communityId: savedCommunity.id,
        userId,
        role: 'owner',
      });

      console.log('Member entity created, attempting to save...');
      await this.memberRepository.save(member);
      console.log('Creator added as owner');

      return savedCommunity;
    } catch (error) {
      console.error('Error creating community - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);

      // Re-throw with more context
      if (error.code === '23505') {
        throw new ForbiddenException('Duplicate entry detected');
      }
      if (error.code === '23503') {
        throw new NotFoundException('Referenced user not found');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.communityRepository.find({
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator', 'groups'],
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Also fetch members with user details
    const members = await this.memberRepository.find({
      where: { communityId: id },
      relations: ['user'],
    });

    return {
      ...community,
      members,
    };
  }

  async update(
    id: string,
    userId: string,
    updateCommunityDto: UpdateCommunityDto,
  ) {
    // Check if user is admin
    const member = await this.memberRepository.findOne({
      where: { communityId: id, userId },
    });

    if (!member || !['admin', 'owner'].includes(member.role)) {
      throw new ForbiddenException('Only admins can update the community');
    }

    const community = await this.communityRepository.findOne({
      where: { id },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    Object.assign(community, updateCommunityDto);
    return await this.communityRepository.save(community);
  }

  async remove(id: string, userId: string) {
    // Check if user is admin/owner
    const member = await this.memberRepository.findOne({
      where: { communityId: id, userId },
    });

    if (!member || !['admin', 'owner'].includes(member.role)) {
      throw new ForbiddenException('Only admins can delete the community');
    }

    const community = await this.communityRepository.findOne({
      where: { id },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    await this.communityRepository.remove(community);
    return { message: 'Community deleted successfully' };
  }

  async join(communityId: string, userId: string) {
    console.log(`User ${userId} attempting to join community ${communityId}`);

    try {
      const community = await this.communityRepository.findOne({
        where: { id: communityId },
      });

      if (!community) {
        console.log('Community not found');
        throw new NotFoundException('Community not found');
      }

      const existingMember = await this.memberRepository.findOne({
        where: { communityId, userId },
      });

      if (existingMember) {
        console.log(`User ${userId} is already a member of community ${communityId}`);
        throw new ForbiddenException('Already a member of this community');
      }

      const member = this.memberRepository.create({
        communityId,
        userId,
        role: 'member',
      });

      await this.memberRepository.save(member);

      // Update member count
      community.memberCount = (community.memberCount || 0) + 1;
      await this.communityRepository.save(community);

      console.log(`User ${userId} successfully joined community ${communityId}`);
      return member;
    } catch (error) {
      console.error('Error in join community:', error);
      // Handle unique constraint violation (Postgres code 23505)
      if (error.code === '23505') {
        throw new ForbiddenException('Already a member of this community');
      }
      throw error;
    }
  }

  async leave(communityId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { communityId, userId },
    });

    if (!member) {
      throw new NotFoundException('Not a member of this community');
    }

    if (member.role === 'owner') {
      throw new ForbiddenException('Owner cannot leave their community');
    }

    await this.memberRepository.remove(member);

    // Update member count
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (community) {
      community.memberCount = Math.max(0, (community.memberCount || 0) - 1);
      await this.communityRepository.save(community);
    }

    return { message: 'Left community successfully' };
  }

  async getMembers(communityId: string) {
    const members = await this.memberRepository.find({
      where: { communityId },
      relations: ['user'],
      order: { joinedAt: 'DESC' },
    });

    return members.map((member) => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
        profession: member.user.profession,
        avatar: member.user.avatar,
      },
    }));
  }

  async getMyCommunities(userId: string) {
    const memberships = await this.memberRepository.find({
      where: { userId },
      relations: ['community', 'community.creator'],
      order: { joinedAt: 'DESC' },
    });

    return memberships.map((m) => ({
      ...m.community,
      myRole: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async getCommunitiesByCreator(userId: string) {
    return await this.communityRepository.find({
      where: { createdBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async isMember(communityId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { communityId, userId },
    });

    return !!member;
  }

  async getCategories() {
    return [
      'Technology',
      'Business',
      'Marketing',
      'Design',
      'Healthcare',
      'Education',
      'Finance',
      'Engineering',
      'Sales',
      'HR',
      'Other',
    ];
  }

  async removeMember(communityId: string, userIdToRemove: string, requestingUserId: string) {
    // Check if requesting user is admin/owner
    const requestingMember = await this.memberRepository.findOne({
      where: { communityId, userId: requestingUserId },
    });

    if (!requestingMember || !['admin', 'owner'].includes(requestingMember.role)) {
      throw new ForbiddenException('Only admins can remove members');
    }

    const memberToRemove = await this.memberRepository.findOne({
      where: { communityId, userId: userIdToRemove },
    });

    if (!memberToRemove) {
      throw new NotFoundException('Member not found');
    }

    if (memberToRemove.role === 'owner') {
      throw new ForbiddenException('Cannot remove the owner');
    }

    await this.memberRepository.remove(memberToRemove);

    // Update member count
    const community = await this.communityRepository.findOne({ where: { id: communityId } });
    if (community) {
      community.memberCount -= 1;
      await this.communityRepository.save(community);
    }

    return { message: 'Member removed successfully' };
  }

  async updateMemberRole(communityId: string, userIdToUpdate: string, newRole: string, requestingUserId: string) {
    // Check if requesting user is admin/owner
    const requestingMember = await this.memberRepository.findOne({
      where: { communityId, userId: requestingUserId },
    });

    if (!requestingMember || !['admin', 'owner'].includes(requestingMember.role)) {
      throw new ForbiddenException('Only admins can update member roles');
    }

    const memberToUpdate = await this.memberRepository.findOne({
      where: { communityId, userId: userIdToUpdate },
    });

    if (!memberToUpdate) {
      throw new NotFoundException('Member not found');
    }

    if (memberToUpdate.role === 'owner') {
      throw new ForbiddenException('Cannot change owner role');
    }

    memberToUpdate.role = newRole;
    return await this.memberRepository.save(memberToUpdate);
  }

  // Group methods
  async createGroup(communityId: string, userId: string, createGroupDto: CreateGroupDto) {
    // Check if user is admin/moderator
    const member = await this.memberRepository.findOne({
      where: { communityId, userId },
    });

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions to create group');
    }

    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const group = this.groupRepository.create({
      ...createGroupDto,
      community,
    });

    return this.groupRepository.save(group);
  }

  async getGroups(communityId: string) {
    return this.groupRepository.find({
      where: { community: { id: communityId } },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async getGroup(groupId: string) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['community'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async sendMessage(groupId: string, userId: string, createMessageDto: CreateGroupMessageDto) {
    const group = await this.getGroup(groupId);

    // Check if user is member of the community
    const member = await this.memberRepository.findOne({
      where: { communityId: group.community.id, userId },
    });

    if (!member) {
      throw new ForbiddenException('You must be a member to send messages');
    }

    const message = this.messageRepository.create({
      ...createMessageDto,
      group,
      groupId: group.id,
      author: { id: userId } as any,
      authorId: userId,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Fetch the complete message with author details
    const completeMessage = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['author', 'group'],
    });

    return completeMessage;
  }

  async getMessages(groupId: string, page: number | string = 0, limit: number | string = 50) {
    try {
      // Parse parameters to ensure they're numbers
      let pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page);
      if (isNaN(pageNum)) pageNum = 0;

      let limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);
      if (isNaN(limitNum)) limitNum = 50;

      if (!groupId) {
        console.warn('getMessages called with empty groupId');
        return [];
      }

      console.log(`Fetching messages for group ${groupId}, page ${pageNum}, limit ${limitNum}`);

      const messages = await this.messageRepository.find({
        where: { groupId },
        relations: ['author', 'reactions', 'reactions.user'],
        order: { createdAt: 'ASC' },
        take: limitNum,
        skip: pageNum * limitNum,
      });

      console.log(`Found ${messages.length} messages for group ${groupId}`);
      return messages;
    } catch (error) {
      console.error(`Error fetching messages for group ${groupId}:`, error);
      // Return empty array instead of crashing if it's a UUID error
      if (error.code === '22P02') { // Postgres invalid text representation
        console.warn(`Invalid UUID format for groupId: ${groupId}`);
        return [];
      }
      throw error;
    }
  }

  // Message Reactions
  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if reaction already exists
    const existingReaction = await this.reactionRepository.findOne({
      where: { messageId, userId, emoji },
    });

    if (existingReaction) {
      throw new ForbiddenException('Already reacted with this emoji');
    }

    const reaction = this.reactionRepository.create({
      messageId,
      userId,
      emoji,
    });

    return await this.reactionRepository.save(reaction);
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    const reaction = await this.reactionRepository.findOne({
      where: { messageId, userId, emoji },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.reactionRepository.remove(reaction);
    return { message: 'Reaction removed successfully' };
  }

  // Pinned Messages
  async pinMessage(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['group', 'group.community'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is admin/moderator
    const member = await this.memberRepository.findOne({
      where: { communityId: message.group.community.id, userId },
    });

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      throw new ForbiddenException('Only admins can pin messages');
    }

    message.isPinned = true;
    return await this.messageRepository.save(message);
  }

  async unpinMessage(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['group', 'group.community'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is admin/moderator
    const member = await this.memberRepository.findOne({
      where: { communityId: message.group.community.id, userId },
    });

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      throw new ForbiddenException('Only admins can unpin messages');
    }

    message.isPinned = false;
    return await this.messageRepository.save(message);
  }

  async getPinnedMessages(groupId: string) {
    return this.messageRepository.find({
      where: { groupId, isPinned: true },
      relations: ['author', 'reactions', 'reactions.user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Message Editing
  async editMessage(messageId: string, userId: string, content: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = content;
    message.isEdited = true;
    return await this.messageRepository.save(message);
  }

  // Message Threading
  async getThread(messageId: string) {
    return this.messageRepository.find({
      where: { parentMessageId: messageId },
      relations: ['author', 'reactions', 'reactions.user'],
      order: { createdAt: 'ASC' },
    });
  }

  async replyToThread(messageId: string, userId: string, content: string) {
    const parentMessage = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['group'],
    });

    if (!parentMessage) {
      throw new NotFoundException('Parent message not found');
    }

    const message = this.messageRepository.create({
      content,
      groupId: parentMessage.groupId,
      authorId: userId,
      parentMessageId: messageId,
    });

    const savedMessage = await this.messageRepository.save(message);

    return await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['author', 'parentMessage'],
    });
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await this.getGroup(groupId);

    // Check if user is admin/moderator
    const member = await this.memberRepository.findOne({
      where: { communityId: group.community.id, userId },
    });

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions to delete group');
    }

    await this.groupRepository.remove(group);
    return { message: 'Group deleted successfully' };
  }

  // ==================== MEETING METHODS (Delegated to MeetingsService) ====================

  async createMeetingRoom(groupId: string, userId: string, dto: any) {
    return this.meetingsService.createMeetingRoom(groupId, userId, dto);
  }

  async getMeetingRooms(groupId: string) {
    return this.meetingsService.getMeetingRooms(groupId);
  }

  async getActiveMeetings(groupId: string) {
    return this.meetingsService.getActiveMeetings(groupId);
  }

  async getMeetingRoom(meetingId: string) {
    return this.meetingsService.getMeetingRoom(meetingId);
  }

  async joinMeeting(meetingId: string, userId: string) {
    return this.meetingsService.joinMeeting(meetingId, userId);
  }

  async endMeeting(meetingId: string, userId: string) {
    return this.meetingsService.endMeeting(meetingId, userId);
  }

  async startRecording(meetingId: string, userId: string) {
    return this.meetingsService.startRecording(meetingId, userId);
  }

  async stopRecording(meetingId: string, userId: string) {
    return this.meetingsService.stopRecording(meetingId, userId);
  }

  async createBreakoutRooms(meetingId: string, userId: string, dto: any) {
    return this.meetingsService.createBreakoutRooms(meetingId, userId, dto);
  }

  async getBreakoutRooms(meetingId: string) {
    return this.meetingsService.getBreakoutRooms(meetingId);
  }

  async closeBreakoutRooms(meetingId: string, userId: string) {
    return this.meetingsService.closeBreakoutRooms(meetingId, userId);
  }

  async createPoll(meetingId: string, userId: string, dto: any) {
    return this.meetingsService.createPoll(meetingId, userId, dto);
  }

  async votePoll(pollId: string, userId: string, optionId: string) {
    return this.meetingsService.votePoll(pollId, userId, optionId);
  }

  async getPollResults(pollId: string) {
    return this.meetingsService.getPollResults(pollId);
  }

  async closePoll(pollId: string, userId: string) {
    return this.meetingsService.closePoll(pollId, userId);
  }

  async submitQuestion(meetingId: string, userId: string, dto: any) {
    return this.meetingsService.submitQuestion(meetingId, userId, dto);
  }

  async getQuestions(meetingId: string) {
    return this.meetingsService.getQuestions(meetingId);
  }

  async upvoteQuestion(questionId: string, userId: string) {
    return this.meetingsService.upvoteQuestion(questionId, userId);
  }

  async answerQuestion(questionId: string, userId: string, dto: any) {
    return this.meetingsService.answerQuestion(questionId, userId, dto);
  }
}
