import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { User } from '../../users/entities/user.entity';

@Entity('article_comments')
export class ArticleComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  articleId: string;

  @ManyToOne(() => Article)
  article: Article;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  author: User;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => ArticleComment, { nullable: true })
  parent: ArticleComment;

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
