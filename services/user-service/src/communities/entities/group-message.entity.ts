import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../users/entities/user.entity';

@Entity('group_messages')
export class GroupMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, group => group.messages)
  group: Group;

  @ManyToOne(() => User)
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: object[];

  @Column({ nullable: true })
  threadId: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
