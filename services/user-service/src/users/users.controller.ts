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
  Patch,
  SetMetadata,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Public } from '../auth/decorators/public.decorator';

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

  @Public()
  @Get('connections/stats/:userId')
  async getUserConnectionStats(@Param('userId') userId: string) {
    return this.usersService.getConnectionStats(userId);
  }

  @Delete('account')
  async deleteAccount(@Request() req) {
    return this.usersService.deleteAccount(req.user.sub);
  }

  // Username endpoints
  @Public()
  @Get('username/:username/available')
  async checkUsernameAvailability(@Param('username') username: string) {
    return this.usersService.checkUsernameAvailability(username);
  }

  @Patch('username')
  async updateUsername(
    @Request() req,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return this.usersService.updateUsername(
      req.user.sub,
      updateUsernameDto.username,
    );
  }

  @Public()
  @Get('in/:username')
  async getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  // Migration endpoint - generate usernames for existing users
  @Post('migrate-usernames')
  async migrateUsernames() {
    return this.usersService.migrateUsernames();
  }

  // Experience endpoints
  @Post('experiences')
  async addExperience(@Request() req, @Body() dto: CreateExperienceDto) {
    return this.usersService.addExperience(req.user.sub, dto);
  }

  @Put('experiences/:id')
  async updateExperience(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.usersService.updateExperience(req.user.sub, id, dto);
  }

  @Delete('experiences/:id')
  async deleteExperience(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteExperience(req.user.sub, id);
  }

  @Get('experiences')
  async getExperiences(@Request() req) {
    return this.usersService.getExperiences(req.user.sub);
  }

  // Education endpoints
  @Post('educations')
  async addEducation(@Request() req, @Body() dto: CreateEducationDto) {
    return this.usersService.addEducation(req.user.sub, dto);
  }

  @Put('educations/:id')
  async updateEducation(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.usersService.updateEducation(req.user.sub, id, dto);
  }

  @Delete('educations/:id')
  async deleteEducation(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteEducation(req.user.sub, id);
  }

  @Get('educations')
  async getEducations(@Request() req) {
    return this.usersService.getEducations(req.user.sub);
  }
}
