import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @InjectRepository(CommunityMember)
    private memberRepository: Repository<CommunityMember>,
  ) {}

  async create(userId: string, createCommunityDto: CreateCommunityDto) {
    const community = this.communityRepository.create({
      ...createCommunityDto,
      createdBy: userId,
      memberCount: 1,
    });

    const savedCommunity = await this.communityRepository.save(community);

    // Add creator as admin
    const member = this.memberRepository.create({
      communityId: savedCommunity.id,
      userId,
      role: 'admin',
    });

    await this.memberRepository.save(member);

    return savedCommunity;
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
      relations: ['creator'],
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community;
  }

  async update(
    id: string,
    userId: string,
    updateCommunityDto: UpdateCommunityDto,
  ) {
    const community = await this.findOne(id);

    // Check if user is admin
    const member = await this.memberRepository.findOne({
      where: { communityId: id, userId, role: 'admin' },
    });

    if (!member) {
      throw new ForbiddenException('Only admins can update the community');
    }

    Object.assign(community, updateCommunityDto);
    return await this.communityRepository.save(community);
  }

  async remove(id: string, userId: string) {
    const community = await this.findOne(id);

    // Check if user is admin
    const member = await this.memberRepository.findOne({
      where: { communityId: id, userId, role: 'admin' },
    });

    if (!member) {
      throw new ForbiddenException('Only admins can delete the community');
    }

    await this.communityRepository.remove(community);
    return { message: 'Community deleted successfully' };
  }

  async join(communityId: string, userId: string) {
    const community = await this.findOne(communityId);

    const existingMember = await this.memberRepository.findOne({
      where: { communityId, userId },
    });

    if (existingMember) {
      throw new Error('Already a member of this community');
    }

    const member = this.memberRepository.create({
      communityId,
      userId,
      role: 'member',
    });

    await this.memberRepository.save(member);

    // Update member count
    community.memberCount += 1;
    await this.communityRepository.save(community);

    return member;
  }

  async leave(communityId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { communityId, userId },
    });

    if (!member) {
      throw new NotFoundException('Not a member of this community');
    }

    if (member.role === 'admin') {
      throw new ForbiddenException('Admins cannot leave their community');
    }

    await this.memberRepository.remove(member);

    // Update member count
    const community = await this.findOne(communityId);
    community.memberCount -= 1;
    await this.communityRepository.save(community);

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
}
