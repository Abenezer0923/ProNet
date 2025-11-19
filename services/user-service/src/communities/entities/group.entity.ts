import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Community } from './community.entity';
import { GroupMessage } from './group-message.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, community => community.groups)
  community: Community;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['chat', 'mentorship', 'meeting', 'announcement'], default: 'chat' })
  type: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'enum', enum: ['public', 'private', 'members-only'], default: 'public' })
  privacy: string;

  @Column({ default: 0 })
  position: number;

  @OneToMany(() => GroupMessage, message => message.group)
  messages: GroupMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
