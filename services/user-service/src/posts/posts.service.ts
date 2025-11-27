import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Community } from '../communities/entities/community.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private likeRepository: Repository<PostLike>,
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    private notificationsService: NotificationsService,
  ) { }

  async create(userId: string, createPostDto: CreatePostDto) {
    // If posting to a community, verify user is the owner
    if (createPostDto.communityId) {
      const community = await this.communityRepository.findOne({
        where: { id: createPostDto.communityId },
        select: ['id', 'createdBy'],
      });

      if (!community) {
        throw new NotFoundException('Community not found');
      }

      if (community.createdBy !== userId) {
        throw new Error('Only community owners can create posts in their community');
      }
    }

    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId,
    });

    return await this.postRepository.save(post);
  }

  async repost(userId: string, originalPostId: string, content?: string) {
    const originalPost = await this.findOne(originalPostId);

    const repost = this.postRepository.create({
      content: content || '',
      authorId: userId,
      isRepost: true,
      originalPostId,
      visibility: 'public', // Default to public for reposts
    });

    const savedRepost = await this.postRepository.save(repost);

    // Increment repost count on original post
    originalPost.repostCount += 1;
    await this.postRepository.save(originalPost);

    return savedRepost;
  }

  async findAll() {
    return await this.postRepository.find({
      relations: ['author', 'community', 'originalPost', 'originalPost.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCommunity(communityId: string) {
    return await this.postRepository.find({
      where: { communityId },
      relations: ['author', 'community', 'originalPost', 'originalPost.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    return await this.postRepository.find({
      where: { authorId: userId },
      relations: ['author', 'community', 'originalPost', 'originalPost.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'community', 'originalPost', 'originalPost.author', 'comments', 'comments.author', 'comments.replies', 'comments.replies.author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async remove(id: string, userId: string) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new Error('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
    return { message: 'Post deleted successfully' };
  }

  // Likes
  async likePost(postId: string, userId: string, reactionType: string = 'LIKE') {
    const post = await this.findOne(postId);

    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      if (existingLike.reactionType !== reactionType) {
        // Update reaction type
        existingLike.reactionType = reactionType;
        return await this.likeRepository.save(existingLike);
      }
      throw new Error('Already reacted to this post');
    }

    const like = this.likeRepository.create({ postId, userId, reactionType });
    await this.likeRepository.save(like);

    post.likeCount += 1;
    await this.postRepository.save(post);

    // Create notification for post author
    if (post.author && post.authorId !== userId) {
      await this.notificationsService.createLikeNotification(
        userId,
        post.authorId,
        postId,
        `${post.author.firstName} ${post.author.lastName}`,
      );
    }

    return like;
  }

  async unlikePost(postId: string, userId: string) {
    const like = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);

    const post = await this.findOne(postId);
    post.likeCount = Math.max(0, post.likeCount - 1);
    await this.postRepository.save(post);

    return { message: 'Post unliked successfully' };
  }

  async hasLiked(postId: string, userId: string) {
    const like = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    return !!like;
  }

  // Comments
  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.findOne(postId);

    const comment = this.commentRepository.create({
      ...createCommentDto,
      postId,
      authorId: userId,
    });

    const saved = await this.commentRepository.save(comment);

    post.commentCount += 1;
    await this.postRepository.save(post);

    // Create notification for post author
    if (post.author && post.authorId !== userId) {
      await this.notificationsService.createCommentNotification(
        userId,
        post.authorId,
        postId,
        `${post.author.firstName} ${post.author.lastName}`,
      );
    }

    return saved;
  }

  async getComments(postId: string) {
    // Fetch only top-level comments (no parentId)
    return await this.commentRepository.find({
      where: { postId, parentId: null } as any,
      relations: ['author', 'replies', 'replies.author'],
      order: { createdAt: 'ASC' },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);

    const post = await this.findOne(comment.postId);
    post.commentCount = Math.max(0, post.commentCount - 1);
    await this.postRepository.save(post);

    return { message: 'Comment deleted successfully' };
  }
}
