import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) { }

  @Post()
  async create(@Request() req, @Body() createCommunityDto: CreateCommunityDto) {
    console.log('Create community request received:', {
      userId: req.user.sub,
      dto: createCommunityDto
    });
    try {
      const result = await this.communitiesService.create(req.user.sub, createCommunityDto);
      console.log('Community created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Controller caught error:', error);
      throw error;
    }
  }

  @Get('test-db')
  async testDatabase(@Request() req) {
    return {
      message: 'Database connection test',
      userId: req.user.sub,
      timestamp: new Date().toISOString()
    };
  }

  @Get()
  async findAll() {
    return this.communitiesService.findAll();
  }

  @Get('my')
  async getMyCommunities(@Request() req) {
    return this.communitiesService.getMyCommunities(req.user.sub);
  }

  @Get('creator/:userId')
  async getCommunitiesByCreator(@Param('userId') userId: string) {
    return this.communitiesService.getCommunitiesByCreator(userId);
  }

  @Get('categories')
  async getCategories() {
    return this.communitiesService.getCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return this.communitiesService.update(id, req.user.sub, updateCommunityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.communitiesService.remove(id, req.user.sub);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Request() req) {
    return this.communitiesService.join(id, req.user.sub);
  }

  @Post(':id/leave')
  async leave(@Param('id') id: string, @Request() req) {
    return this.communitiesService.leave(id, req.user.sub);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.communitiesService.getMembers(id);
  }

  @Get(':id/is-member')
  async isMember(@Param('id') id: string, @Request() req) {
    const isMember = await this.communitiesService.isMember(id, req.user.sub);
    return { isMember };
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.communitiesService.removeMember(id, userId, req.user.sub);
  }

  @Patch(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Request() req,
  ) {
    return this.communitiesService.updateMemberRole(id, userId, updateMemberRoleDto.role, req.user.sub);
  }

  // Group endpoints
  @Post(':id/groups')
  async createGroup(
    @Param('id') communityId: string,
    @Body() createGroupDto: CreateGroupDto,
    @Request() req,
  ) {
    return this.communitiesService.createGroup(communityId, req.user.sub, createGroupDto);
  }

  @Get(':id/groups')
  async getGroups(@Param('id') communityId: string) {
    return this.communitiesService.getGroups(communityId);
  }

  @Get('groups/:groupId')
  async getGroup(@Param('groupId') groupId: string) {
    return this.communitiesService.getGroup(groupId);
  }

  @Delete('groups/:groupId')
  async deleteGroup(@Param('groupId') groupId: string, @Request() req) {
    return this.communitiesService.deleteGroup(groupId, req.user.sub);
  }

  @Post('groups/:groupId/messages')
  async sendMessage(
    @Param('groupId') groupId: string,
    @Body() createMessageDto: CreateGroupMessageDto,
    @Request() req,
  ) {
    return this.communitiesService.sendMessage(groupId, req.user.sub, createMessageDto);
  }

  @Get('groups/:groupId/messages')
  async getMessages(
    @Param('groupId') groupId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.communitiesService.getMessages(groupId, page, limit);
  }

  // Message Reactions
  @Post('groups/:groupId/messages/:messageId/react')
  async addReaction(
    @Param('messageId') messageId: string,
    @Body('emoji') emoji: string,
    @Request() req,
  ) {
    return this.communitiesService.addReaction(messageId, req.user.sub, emoji);
  }

  @Delete('groups/:groupId/messages/:messageId/react')
  async removeReaction(
    @Param('messageId') messageId: string,
    @Body('emoji') emoji: string,
    @Request() req,
  ) {
    return this.communitiesService.removeReaction(messageId, req.user.sub, emoji);
  }

  // Pinned Messages
  @Post('groups/:groupId/messages/:messageId/pin')
  async pinMessage(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    return this.communitiesService.pinMessage(messageId, req.user.sub);
  }

  @Delete('groups/:groupId/messages/:messageId/pin')
  async unpinMessage(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    return this.communitiesService.unpinMessage(messageId, req.user.sub);
  }

  @Get('groups/:groupId/messages/pinned')
  async getPinnedMessages(@Param('groupId') groupId: string) {
    return this.communitiesService.getPinnedMessages(groupId);
  }

  // Message Editing
  @Put('groups/:groupId/messages/:messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.communitiesService.editMessage(messageId, req.user.sub, content);
  }

  // Message Threading
  @Get('groups/:groupId/messages/:messageId/thread')
  async getThread(@Param('messageId') messageId: string) {
    return this.communitiesService.getThread(messageId);
  }

  @Post('groups/:groupId/messages/:messageId/thread')
  async replyToThread(
    @Param('messageId') messageId: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.communitiesService.replyToThread(messageId, req.user.sub, content);
  }
}
