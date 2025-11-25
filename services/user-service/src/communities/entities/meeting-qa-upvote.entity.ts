import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { MeetingQA } from './meeting-qa.entity';
import { User } from '../../users/entities/user.entity';

@Entity('meeting_qa_upvotes')
export class MeetingQAUpvote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MeetingQA, question => question.upvotes)
    @JoinColumn({ name: 'question_id' })
    question: MeetingQA;

    @Column({ name: 'question_id' })
    questionId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
