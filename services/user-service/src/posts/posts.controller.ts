import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user.sub, createPostDto);
  }

  @Get()
  async findAll(@Query('communityId') communityId?: string, @Query('userId') userId?: string) {
    if (communityId) {
      return this.postsService.findByCommunity(communityId);
    }
    if (userId) {
      return this.postsService.findByUser(userId);
    }
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user.sub);
  }

  // Likes
  @Post(':id/like')
  async like(@Param('id') id: string, @Request() req) {
    return this.postsService.likePost(id, req.user.sub);
  }

  @Delete(':id/unlike')
  async unlike(@Param('id') id: string, @Request() req) {
    return this.postsService.unlikePost(id, req.user.sub);
  }

  @Get(':id/has-liked')
  async hasLiked(@Param('id') id: string, @Request() req) {
    const hasLiked = await this.postsService.hasLiked(id, req.user.sub);
    return { hasLiked };
  }

  // Comments
  @Post(':id/comments')
  async createComment(
    @Param('id') id: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.createComment(id, req.user.sub, createCommentDto);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.postsService.deleteComment(commentId, req.user.sub);
  }
}
