import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { MeetingPoll } from './meeting-poll.entity';
import { User } from '../../users/entities/user.entity';

@Entity('meeting_poll_votes')
export class MeetingPollVote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MeetingPoll, poll => poll.votes)
    @JoinColumn({ name: 'poll_id' })
    poll: MeetingPoll;

    @Column({ name: 'poll_id' })
    pollId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'option_id' })
    optionId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
