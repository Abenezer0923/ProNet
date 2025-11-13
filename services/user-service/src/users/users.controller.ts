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
}
