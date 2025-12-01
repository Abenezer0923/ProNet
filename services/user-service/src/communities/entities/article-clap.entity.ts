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

  @Column()
  articleId: string;

  @ManyToOne(() => Article)
  article: Article;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: 1 })
  count: number;

  @CreateDateColumn()
  createdAt: Date;
}
