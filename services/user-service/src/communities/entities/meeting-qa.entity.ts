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
import { MeetingQAUpvote } from './meeting-qa-upvote.entity';

@Entity('meeting_qa')
export class MeetingQA {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MeetingRoom, meetingRoom => meetingRoom.qaQuestions)
    @JoinColumn({ name: 'meeting_room_id' })
    meetingRoom: MeetingRoom;

    @Column({ name: 'meeting_room_id' })
    meetingRoomId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'asked_by' })
    askedBy: User;

    @Column({ name: 'asked_by' })
    askedById: string;

    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'text', nullable: true })
    answer: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'answered_by' })
    answeredBy: User;

    @Column({ name: 'answered_by', nullable: true })
    answeredById: string;

    @Column({ name: 'answered_at', type: 'timestamp', nullable: true })
    answeredAt: Date;

    @Column({ name: 'upvote_count', default: 0 })
    upvoteCount: number;

    @Column({ name: 'is_answered', default: false })
    isAnswered: boolean;

    @OneToMany(() => MeetingQAUpvote, upvote => upvote.question)
    upvotes: MeetingQAUpvote[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
