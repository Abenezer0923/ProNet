import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private likeRepository: Repository<PostLike>,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId,
    });

    return await this.postRepository.save(post);
  }

  async findAll() {
    return await this.postRepository.find({
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCommunity(communityId: string) {
    return await this.postRepository.find({
      where: { communityId },
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    return await this.postRepository.find({
      where: { authorId: userId },
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'community'],
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
  async likePost(postId: string, userId: string) {
    const post = await this.findOne(postId);

    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      throw new Error('Already liked this post');
    }

    const like = this.likeRepository.create({ postId, userId });
    await this.likeRepository.save(like);

    post.likeCount += 1;
    await this.postRepository.save(post);

    // Create notification for post author
    if (post.author) {
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
    post.likeCount -= 1;
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
    if (post.author) {
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
    return await this.commentRepository.find({
      where: { postId },
      relations: ['author'],
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
    post.commentCount -= 1;
    await this.postRepository.save(post);

    return { message: 'Comment deleted successfully' };
  }
}
