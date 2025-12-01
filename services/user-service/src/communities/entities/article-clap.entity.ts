import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { User } from '../../users/entities/user.entity';

@Entity('article_claps')
export class ArticleClap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  articleId: string;

  @ManyToOne(() => Article)
  article: Article;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: 1 })
  count: number;

  @CreateDateColumn()
  createdAt: Date;
}
