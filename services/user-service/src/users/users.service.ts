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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
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

  async deleteAccount(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all user's connections (as follower and following)
    await this.connectionRepository.delete({ followerId: userId });
    await this.connectionRepository.delete({ followingId: userId });

    // Delete all user's skills
    await this.userSkillRepository.delete({ userId });

    // Delete the user
    await this.userRepository.remove(user);

    return { message: 'Account deleted successfully' };
  }
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
    const validation = validateUsername(newUsername);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const normalized = normalizeUsername(newUsername);
    const existing = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username: normalized })
      .andWhere('user.id != :userId', { userId })
      .getOne();

    if (existing) {
      throw new ConflictException('Username is already taken');
    }

    await this.userRepository.update(userId, { username: newUsername });
    return { message: 'Username updated successfully', username: newUsername };
  }

  async getUserByUsername(username: string) {
    const normalized = normalizeUsername(username);
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skills')
      .where('LOWER(user.username) = LOWER(:username)', { username: normalized })
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
