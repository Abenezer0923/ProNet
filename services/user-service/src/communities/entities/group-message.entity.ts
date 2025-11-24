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
import { Group } from './group.entity';
import { User } from '../../users/entities/user.entity';
import { MessageReaction } from './message-reaction.entity';

@Entity('group_messages')
export class GroupMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @ManyToOne(() => Group, group => group.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  authorId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb" })
  attachments: object[];

  @Column({ nullable: true })
  parentMessageId: string;

  @ManyToOne(() => GroupMessage, { nullable: true })
  @JoinColumn({ name: 'parentMessageId' })
  parentMessage: GroupMessage;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @OneToMany(() => MessageReaction, reaction => reaction.message)
  reactions: MessageReaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
