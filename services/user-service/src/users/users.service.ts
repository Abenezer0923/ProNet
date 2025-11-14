import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSkill } from './entities/user-skill.entity';
import { Connection } from './entities/connection.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    private notificationsService: NotificationsService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['skills'],
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
}
