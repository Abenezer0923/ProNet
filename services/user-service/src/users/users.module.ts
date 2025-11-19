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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSkill, Connection, Experience, Education]),
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
