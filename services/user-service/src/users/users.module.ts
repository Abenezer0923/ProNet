import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserSkill } from './entities/user-skill.entity';
import { Connection } from './entities/connection.entity';
import { Experience } from './entities/experience.entity';
import { Education } from './entities/education.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../posts/entities/comment.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { CommunityMember } from '../communities/entities/community-member.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Community } from '../communities/entities/community.entity';
import { Article } from '../communities/entities/article.entity';
import { GroupMessage } from '../communities/entities/group-message.entity';
import { ArticleComment } from '../communities/entities/article-comment.entity';
import { ArticleClap } from '../communities/entities/article-clap.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      UserSkill, 
      Connection, 
      Experience, 
      Education,
      Post,
      Comment,
      PostLike,
      CommunityMember,
      Conversation,
      Message,
      Notification,
      Community,
      Article,
      GroupMessage,
      ArticleComment,
      ArticleClap
    ]),
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
