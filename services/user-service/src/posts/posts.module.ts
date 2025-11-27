import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Community } from '../communities/entities/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, PostLike, Community]),
    NotificationsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule { }
