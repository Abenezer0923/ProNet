import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { User } from '../users/entities/user.entity';
import { Community } from './entities/community.entity';
import { ArticleClap } from './entities/article-clap.entity';
import { ArticleComment } from './entities/article-comment.entity';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private articlesRepository: Repository<Article>,
        @InjectRepository(Community)
        private communitiesRepository: Repository<Community>,
        @InjectRepository(ArticleClap)
        private clapsRepository: Repository<ArticleClap>,
        @InjectRepository(ArticleComment)
        private commentsRepository: Repository<ArticleComment>,
    ) { }

    async create(communityId: string, userId: string, createArticleDto: CreateArticleDto): Promise<Article> {
        try {
            const community = await this.communitiesRepository.findOne({ where: { id: communityId } });
            if (!community) {
                throw new NotFoundException('Community not found');
            }

            const slug = this.generateSlug(createArticleDto.title);
            const publishedAt = createArticleDto.status === 'published' ? new Date() : null;

            const article = this.articlesRepository.create({
                ...createArticleDto,
                communityId,
                community,
                authorId: userId,
                author: { id: userId } as User,
                slug,
                publishedAt,
                readingTime: this.calculateReadingTime(createArticleDto.content),
            });

            return await this.articlesRepository.save(article);
        } catch (error) {
            console.error('Error creating article:', error);
            throw error;
        }
    }

    async findAll(communityId: string, query: any): Promise<Article[]> {
        let page = query.page ? parseInt(query.page.toString()) : 1;
        if (isNaN(page) || page < 1) page = 1;

        let limit = query.limit ? parseInt(query.limit.toString()) : 10;
        if (isNaN(limit) || limit < 1) limit = 10;

        const status = query.status || 'published';

        const skip = (page - 1) * limit;

        return this.articlesRepository.find({
            where: { community: { id: communityId }, status },
            relations: ['author'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip,
        });
    }

    async findOne(id: string): Promise<Article> {
        const article = await this.articlesRepository.findOne({
            where: { id },
            relations: ['author', 'community'],
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        // Increment view count
        await this.articlesRepository.increment({ id }, 'viewCount', 1);

        return article;
    }

    async update(id: string, userId: string, updateData: Partial<CreateArticleDto>): Promise<Article> {
        const article = await this.findOne(id);

        if (article.author.id !== userId) {
            throw new ForbiddenException('You can only update your own articles');
        }

        if (updateData.title) {
            article.slug = this.generateSlug(updateData.title);
        }

        if (updateData.content) {
            article.readingTime = this.calculateReadingTime(updateData.content);
        }

        Object.assign(article, updateData);
        return this.articlesRepository.save(article);
    }

    async remove(id: string, userId: string): Promise<void> {
        const article = await this.findOne(id);

        if (article.author.id !== userId) {
            throw new ForbiddenException('You can only delete your own articles');
        }

        await this.articlesRepository.remove(article);
    }

    async clap(id: string, userId: string): Promise<void> {
        const article = await this.findOne(id);

        const clap = this.clapsRepository.create({
            articleId: id,
            article,
            userId,
            user: { id: userId } as User,
        });

        await this.clapsRepository.save(clap);
        await this.articlesRepository.increment({ id }, 'clapCount', 1);
    }

    async addComment(id: string, userId: string, content: string): Promise<ArticleComment> {
        const article = await this.findOne(id);

        const comment = this.commentsRepository.create({
            articleId: id,
            article,
            userId,
            author: { id: userId } as User,
            content,
        });

        const savedComment = await this.commentsRepository.save(comment);
        await this.articlesRepository.increment({ id }, 'commentCount', 1);

        return savedComment;
    }

    async getComments(id: string): Promise<ArticleComment[]> {
        return this.commentsRepository.find({
            where: { article: { id } },
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-6);
    }

    private calculateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
}
