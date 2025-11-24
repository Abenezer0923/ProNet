import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { GroupMessage } from './group-message.entity';
import { User } from '../../users/entities/user.entity';

@Entity('message_reactions')
@Unique(['messageId', 'userId', 'emoji'])
export class MessageReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    messageId: string;

    @ManyToOne(() => GroupMessage, message => message.reactions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'messageId' })
    message: GroupMessage;

    @Column()
    userId: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    emoji: string;

    @CreateDateColumn()
    createdAt: Date;
}
