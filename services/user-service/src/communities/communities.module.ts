import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CommunitiesGateway } from './communities.gateway';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { Group } from './entities/group.entity';
import { GroupMessage } from './entities/group-message.entity';
import { Article } from './entities/article.entity';
import { ArticleClap } from './entities/article-clap.entity';
import { ArticleComment } from './entities/article-comment.entity';
import { CommunityEvent } from './entities/community-event.entity';
import { EventAttendee } from './entities/event-attendee.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { MeetingRoom } from './entities/meeting-room.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { BreakoutRoom } from './entities/breakout-room.entity';
import { MeetingPoll } from './entities/meeting-poll.entity';
import { MeetingPollVote } from './entities/meeting-poll-vote.entity';
import { MeetingQA } from './entities/meeting-qa.entity';
import { MeetingQAUpvote } from './entities/meeting-qa-upvote.entity';
import { MeetingsService } from './meetings.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityMember,
      Group,
      GroupMessage,
      Article,
      ArticleClap,
      ArticleComment,
      CommunityEvent,
      EventAttendee,
      MessageReaction,
      MeetingRoom,
      MeetingParticipant,
      BreakoutRoom,
      MeetingPoll,
      MeetingPollVote,
      MeetingQA,
      MeetingQAUpvote,
      User,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CommunitiesController, ArticlesController],
  providers: [CommunitiesService, CommunitiesGateway, ArticlesService, MeetingsService],
  exports: [CommunitiesService, ArticlesService, MeetingsService],
})
export class CommunitiesModule { }
