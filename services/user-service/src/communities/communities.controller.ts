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
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  async create(@Request() req, @Body() createCommunityDto: CreateCommunityDto) {
    return this.communitiesService.create(req.user.sub, createCommunityDto);
  }

  @Get()
  async findAll() {
    return this.communitiesService.findAll();
  }

  @Get('my')
  async getMyCommunities(@Request() req) {
    return this.communitiesService.getMyCommunities(req.user.sub);
  }

  @Get('categories')
  async getCategories() {
    return this.communitiesService.getCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(id);
  }

  @Put(':id')
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

  @Delete(':id/leave')
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
}
