import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommunitiesModule } from './communities/communities.module';
import { PostsModule } from './posts/posts.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { SearchModule } from './search/search.module';
import { User } from './users/entities/user.entity';
import { UserSkill } from './users/entities/user-skill.entity';
import { Connection } from './users/entities/connection.entity';
import { Experience } from './users/entities/experience.entity';
import { Education } from './users/entities/education.entity';
import { Community } from './communities/entities/community.entity';
import { CommunityMember } from './communities/entities/community-member.entity';
import { Group } from './communities/entities/group.entity';
import { GroupMessage } from './communities/entities/group-message.entity';
import { Article } from './communities/entities/article.entity';
import { ArticleClap } from './communities/entities/article-clap.entity';
import { ArticleComment } from './communities/entities/article-comment.entity';
import { CommunityEvent } from './communities/entities/community-event.entity';
import { EventAttendee } from './communities/entities/event-attendee.entity';
import { Post } from './posts/entities/post.entity';
import { Comment } from './posts/entities/comment.entity';
import { PostLike } from './posts/entities/post-like.entity';
import { Conversation } from './chat/entities/conversation.entity';
import { Message } from './chat/entities/message.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Otp } from './auth/entities/otp.entity';
import { LoginSession } from './auth/entities/login-session.entity';
import { MessageReaction } from './communities/entities/message-reaction.entity';
import { MeetingRoom } from './communities/entities/meeting-room.entity';
import { MeetingParticipant } from './communities/entities/meeting-participant.entity';
import { BreakoutRoom } from './communities/entities/breakout-room.entity';
import { MeetingPoll } from './communities/entities/meeting-poll.entity';
import { MeetingPollVote } from './communities/entities/meeting-poll-vote.entity';
import { MeetingQA } from './communities/entities/meeting-qa.entity';
import { MeetingQAUpvote } from './communities/entities/meeting-qa-upvote.entity';

import { HealthController } from './health/health.controller';
import { JobsModule } from './jobs/jobs.module';

// Helper to parse boolean env vars
const parseBoolean = (val: string | undefined) => val === 'true' || val === '1';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
  // Default to the Docker Compose service name 'postgres' when running
  // in containerized environments. Falling back to 'localhost' can
  // cause confusion when the DB runs in a separate container.
  host: process.env.DATABASE_HOST || 'postgres',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'profession_db',
        // Reduce module token serialization by avoiding a large static `entities` array.
        // Let feature modules declare their entities and load automatically.
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
        logging: (process.env.TYPEORM_LOGGING || 'true') === 'true',
        // Explicitly handle SSL for Render and other cloud providers
        ssl: parseBoolean(process.env.DATABASE_SSL) || process.env.NODE_ENV === 'production',
        extra: {
          ssl: (parseBoolean(process.env.DATABASE_SSL) || process.env.NODE_ENV === 'production')
            ? { rejectUnauthorized: false }
            : null,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    CommunitiesModule,
    PostsModule,
    ChatModule,
    NotificationsModule,
    UploadModule,
    SearchModule,
    JobsModule,
  ],
  controllers: [AppController, HealthController],
})
export class AppModule { }
