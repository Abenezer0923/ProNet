import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from './search.service';
import {
  SearchQueryDto,
  UserSearchDto,
  CommunitySearchDto,
  PostSearchDto,
} from './dto/search-query.dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  async globalSearch(@Query() query: SearchQueryDto) {
    return this.searchService.globalSearch(query);
  }

  @Get('users')
  async searchUsers(@Query() query: UserSearchDto) {
    return this.searchService.searchUsers(query);
  }

  @Get('communities')
  async searchCommunities(@Query() query: CommunitySearchDto) {
    return this.searchService.searchCommunities(query);
  }

  @Get('posts')
  async searchPosts(@Query() query: PostSearchDto) {
    return this.searchService.searchPosts(query);
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }

  @Get('recommendations/users')
  async getRecommendedUsers(@Request() req, @Query('limit') limit?: number) {
    return this.searchService.getRecommendedUsers(req.user.userId, limit);
  }

  @Get('recommendations/communities')
  async getRecommendedCommunities(@Request() req, @Query('limit') limit?: number) {
    return this.searchService.getRecommendedCommunities(req.user.userId, limit);
  }
}
