import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Get('profile')
  async getMyProfile(@Request() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, updateProfileDto);
  }

  @Post('skills')
  async addSkill(@Request() req, @Body() addSkillDto: AddSkillDto) {
    return this.usersService.addSkill(req.user.sub, addSkillDto);
  }

  @Delete('skills/:id')
  async removeSkill(@Request() req, @Param('id') skillId: string) {
    return this.usersService.removeSkill(req.user.sub, skillId);
  }

  @Get('skills')
  async getSkills(@Request() req) {
    return this.usersService.getSkills(req.user.sub);
  }

  // Connections
  @Post('follow/:userId')
  async followUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.followUser(req.user.sub, userId);
  }

  @Delete('unfollow/:userId')
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.unfollowUser(req.user.sub, userId);
  }

  @Get('followers')
  async getFollowers(@Request() req) {
    return this.usersService.getFollowers(req.user.sub);
  }

  @Get('following')
  async getFollowing(@Request() req) {
    return this.usersService.getFollowing(req.user.sub);
  }

  @Get('connections/stats')
  async getConnectionStats(@Request() req) {
    return this.usersService.getConnectionStats(req.user.sub);
  }

  @Get('connections/is-following/:userId')
  async isFollowing(@Request() req, @Param('userId') userId: string) {
    const following = await this.usersService.isFollowing(req.user.sub, userId);
    return { isFollowing: following };
  }
}
