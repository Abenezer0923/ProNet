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
import { CommunityMember } from './community-member.entity';
import { Group } from './group.entity';
import { Article } from './article.entity';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ default: 0 })
  memberCount: number;

  @OneToMany(() => CommunityMember, (member) => member.community)
  members: CommunityMember[];

  @OneToMany(() => Group, (group) => group.community)
  groups: Group[];

  @OneToMany(() => Article, (article) => article.community)
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
