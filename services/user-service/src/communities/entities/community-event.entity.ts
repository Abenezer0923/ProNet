import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Community } from './community.entity';
import { User } from '../../users/entities/user.entity';

@Entity('community_events')
export class CommunityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community)
  community: Community;

  @ManyToOne(() => User)
  organizer: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['webinar', 'workshop', 'meeting', 'networking', 'social'] })
  type: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  meetingLink: string;

  @Column({ default: 0 })
  maxAttendees: number;

  @Column({ default: 0 })
  attendeeCount: number;

  @Column({ type: 'enum', enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' })
  status: string;

  @Column({ nullable: true })
  coverImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
