import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { MeetingRoom } from './meeting-room.entity';
import { User } from '../../users/entities/user.entity';
import { MeetingPollVote } from './meeting-poll-vote.entity';

@Entity('meeting_polls')
export class MeetingPoll {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MeetingRoom, meetingRoom => meetingRoom.polls)
    @JoinColumn({ name: 'meeting_room_id' })
    meetingRoom: MeetingRoom;

    @Column({ name: 'meeting_room_id' })
    meetingRoomId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator: User;

    @Column({ name: 'created_by' })
    createdBy: string;

    @Column()
    question: string;

    @Column({ type: 'jsonb' })
    options: {
        id: string;
        text: string;
        votes: number;
    }[];

    @Column({ type: 'enum', enum: ['active', 'closed'], default: 'active' })
    status: string;

    @Column({ name: 'allow_multiple', default: false })
    allowMultiple: boolean;

    @Column({ name: 'anonymous', default: false })
    anonymous: boolean;

    @OneToMany(() => MeetingPollVote, vote => vote.poll)
    votes: MeetingPollVote[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
