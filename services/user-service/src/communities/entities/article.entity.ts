import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Community } from './community.entity';
import { User } from '../../users/entities/user.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, community => community.articles)
  community: Community;

  @ManyToOne(() => User)
  author: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  clapCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ type: 'jsonb', nullable: true })
  seoMetadata: object;

  @Column({ default: 0 })
  readingTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
