import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommunitiesModule } from './communities/communities.module';
import { User } from './users/entities/user.entity';
import { UserSkill } from './users/entities/user-skill.entity';
import { Connection } from './users/entities/connection.entity';
import { Community } from './communities/entities/community.entity';
import { CommunityMember } from './communities/entities/community-member.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'profession_db',
      entities: [User, UserSkill, Connection, Community, CommunityMember],
      synchronize: true, // Set to false in production
      logging: true, // Enable SQL logging
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
    AuthModule,
    UsersModule,
    CommunitiesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
