import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post(':id/articles')
    create(
        @Param('id') communityId: string,
        @Request() req,
        @Body() createArticleDto: CreateArticleDto,
    ) {
        return this.articlesService.create(communityId, req.user.sub, createArticleDto);
    }

    @Public()
    @Get(':id/articles')
    findAll(
        @Param('id') communityId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: string,
    ) {
        return this.articlesService.findAll(communityId, { page, limit, status });
    }

    @Public()
    @Get('articles/:articleId')
    findOne(@Param('articleId') articleId: string) {
        return this.articlesService.findOne(articleId);
    }

    @Patch('articles/:articleId')
    update(
        @Param('articleId') articleId: string,
        @Request() req,
        @Body() updateData: Partial<CreateArticleDto>,
    ) {
        return this.articlesService.update(articleId, req.user.sub, updateData);
    }

    @Delete('articles/:articleId')
    remove(@Param('articleId') articleId: string, @Request() req) {
        return this.articlesService.remove(articleId, req.user.sub);
    }

    @Post('articles/:articleId/clap')
    clap(@Param('articleId') articleId: string, @Request() req) {
        return this.articlesService.clap(articleId, req.user.sub);
    }

    @Post('articles/:articleId/comments')
    addComment(
        @Param('articleId') articleId: string,
        @Request() req,
        @Body('content') content: string,
    ) {
        return this.articlesService.addComment(articleId, req.user.sub, content);
    }

    @Public()
    @Get('articles/:articleId/comments')
    getComments(@Param('articleId') articleId: string) {
        return this.articlesService.getComments(articleId);
    }

    @Public()
    @Get('articles/public')
    getPublicArticles(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.articlesService.getPublicArticles({ page, limit });
    }
}
