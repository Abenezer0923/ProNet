import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { CommunityEvent } from './community-event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('event_attendees')
export class EventAttendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CommunityEvent)
  event: CommunityEvent;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: ['going', 'maybe', 'not_going'], default: 'going' })
  status: string;

  @CreateDateColumn()
  rsvpAt: Date;
}
