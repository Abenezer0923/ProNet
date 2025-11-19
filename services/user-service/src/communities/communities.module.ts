import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { Group } from './entities/group.entity';
import { GroupMessage } from './entities/group-message.entity';
import { Article } from './entities/article.entity';
import { ArticleClap } from './entities/article-clap.entity';
import { ArticleComment } from './entities/article-comment.entity';
import { CommunityEvent } from './entities/community-event.entity';
import { EventAttendee } from './entities/event-attendee.entity';

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
    ]),
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
