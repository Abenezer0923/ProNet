import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Brackets } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import { Post } from '../posts/entities/post.entity';
import {
  SearchQueryDto,
  UserSearchDto,
  CommunitySearchDto,
  PostSearchDto,
  SearchType,
} from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async globalSearch(query: SearchQueryDto) {
    const { q, type, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const results = {
      users: [],
      communities: [],
      posts: [],
      total: 0,
    };

    if (type === SearchType.ALL || type === SearchType.USERS) {
      const users = await this.searchUsers({ q, page, limit: Math.ceil(limit / 3) });
      results.users = users.data;
      results.total += users.total;
    }

    if (type === SearchType.ALL || type === SearchType.COMMUNITIES) {
      const communities = await this.searchCommunities({ q, page, limit: Math.ceil(limit / 3) });
      results.communities = communities.data;
      results.total += communities.total;
    }

    if (type === SearchType.ALL || type === SearchType.POSTS) {
      const posts = await this.searchPosts({ q, page, limit: Math.ceil(limit / 3) });
      results.posts = posts.data;
      results.total += posts.total;
    }

    return results;
  }

  async searchUsers(query: UserSearchDto) {
    const { q, skills, location, industry, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skills');

    // Search by name or email
    if (q) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('LOWER(user.firstName) LIKE LOWER(:q)', { q: `%${q}%` })
            .orWhere('LOWER(user.lastName) LIKE LOWER(:q)', { q: `%${q}%` })
            .orWhere('LOWER(user.email) LIKE LOWER(:q)', { q: `%${q}%` })
            .orWhere('LOWER(user.bio) LIKE LOWER(:q)', { q: `%${q}%` });
        }),
      );
    }

    // Filter by location
    if (location) {
      queryBuilder.andWhere('LOWER(user.location) LIKE LOWER(:location)', {
        location: `%${location}%`,
      });
    }

    // Filter by skills
    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      queryBuilder.andWhere('skills.name IN (:...skills)', { skills: skillArray });
    }

    const [data, total] = await queryBuilder
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.bio',
        'user.location',
        'user.profilePicture',
        'user.createdAt',
        'skills',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchCommunities(query: CommunitySearchDto) {
    const { q, category, minMembers, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.communityRepository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.creator', 'creator')
      .loadRelationCountAndMap('community.memberCount', 'community.members');

    // Search by name or description
    if (q) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('LOWER(community.name) LIKE LOWER(:q)', { q: `%${q}%` })
            .orWhere('LOWER(community.description) LIKE LOWER(:q)', { q: `%${q}%` });
        }),
      );
    }

    // Filter by category
    if (category) {
      queryBuilder.andWhere('LOWER(community.category) = LOWER(:category)', { category });
    }

    // Only show public communities in search
    queryBuilder.andWhere('community.isPrivate = :isPrivate', { isPrivate: false });

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('community.createdAt', 'DESC')
      .getManyAndCount();

    // Filter by member count if specified
    let filteredData = data;
    if (minMembers) {
      filteredData = data.filter((c: any) => c.memberCount >= minMembers);
    }

    return {
      data: filteredData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchPosts(query: PostSearchDto) {
    const { q, authorId, communityId, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.community', 'community')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('post.commentCount', 'post.comments');

    // Search by content
    if (q) {
      queryBuilder.where('LOWER(post.content) LIKE LOWER(:q)', { q: `%${q}%` });
    }

    // Filter by author
    if (authorId) {
      queryBuilder.andWhere('post.authorId = :authorId', { authorId });
    }

    // Filter by community
    if (communityId) {
      queryBuilder.andWhere('post.communityId = :communityId', { communityId });
    }

    // Filter by date range
    if (dateFrom) {
      queryBuilder.andWhere('post.createdAt >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      queryBuilder.andWhere('post.createdAt <= :dateTo', { dateTo });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('post.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSuggestions(query: string) {
    const limit = 5;

    const [users, communities] = await Promise.all([
      this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.firstName) LIKE LOWER(:q)', { q: `${query}%` })
        .orWhere('LOWER(user.lastName) LIKE LOWER(:q)', { q: `${query}%` })
        .select(['user.id', 'user.firstName', 'user.lastName', 'user.profilePicture'])
        .take(limit)
        .getMany(),
      this.communityRepository
        .createQueryBuilder('community')
        .where('LOWER(community.name) LIKE LOWER(:q)', { q: `${query}%` })
        .andWhere('community.isPrivate = :isPrivate', { isPrivate: false })
        .select(['community.id', 'community.name', 'community.coverImage'])
        .take(limit)
        .getMany(),
    ]);

    return {
      users,
      communities,
    };
  }

  async getRecommendedUsers(userId: string, limit: number = 10) {
    // Get current user
    const currentUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['skills'],
    });

    if (!currentUser) {
      return [];
    }

    // Get connected user IDs from Connection table
    const connections = await this.userRepository.query(
      `SELECT "followingId" FROM connections WHERE "followerId" = $1
       UNION
       SELECT "followerId" FROM connections WHERE "followingId" = $1`,
      [userId]
    );
    
    const connectedUserIds = connections.map((c: any) => c.followingId || c.followerId);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skills')
      .where('user.id != :userId', { userId });

    // Exclude already connected users
    if (connectedUserIds.length > 0) {
      queryBuilder.andWhere('user.id NOT IN (:...connectedUserIds)', {
        connectedUserIds,
      });
    }

    // Prioritize users from same location
    if (currentUser.location) {
      queryBuilder.andWhere('user.location = :location', { location: currentUser.location });
    }

    const users = await queryBuilder
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.bio',
        'user.location',
        'user.profilePicture',
        'skills',
      ])
      .take(limit)
      .getMany();

    return users;
  }

  async getRecommendedCommunities(userId: string, limit: number = 10) {
    // Get joined community IDs from CommunityMember table
    const memberships = await this.communityRepository.query(
      `SELECT "communityId" FROM community_members WHERE "userId" = $1`,
      [userId]
    );
    
    const joinedCommunityIds = memberships.map((m: any) => m.communityId);

    const queryBuilder = this.communityRepository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.creator', 'creator')
      .loadRelationCountAndMap('community.memberCount', 'community.members')
      .where('community.isPrivate = :isPrivate', { isPrivate: false });

    if (joinedCommunityIds.length > 0) {
      queryBuilder.andWhere('community.id NOT IN (:...joinedCommunityIds)', {
        joinedCommunityIds,
      });
    }

    const communities = await queryBuilder
      .take(limit)
      .orderBy('community.createdAt', 'DESC')
      .getMany();

    return communities;
  }
}
