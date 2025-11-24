import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Community } from '../../communities/entities/community.entity';
import { Comment } from './comment.entity';
import { PostLike } from './post-like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ nullable: true })
  communityId: string;

  @ManyToOne(() => Community)
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @Column({ nullable: true })
  video: string;

  @Column({ default: false })
  isRepost: boolean;

  @Column({ nullable: true })
  originalPostId: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ name: 'originalPostId' })
  originalPost: Post;

  @Column({
    type: 'enum',
    enum: ['public', 'community', 'connections'],
    default: 'public',
  })
  visibility: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  repostCount: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
