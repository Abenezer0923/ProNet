import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { MeetingRoom } from './meeting-room.entity';
import { User } from '../../users/entities/user.entity';

@Entity('meeting_participants')
export class MeetingParticipant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MeetingRoom, meetingRoom => meetingRoom.participants)
    @JoinColumn({ name: 'meeting_room_id' })
    meetingRoom: MeetingRoom;

    @Column({ name: 'meeting_room_id', nullable: true })
    meetingRoomId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'enum', enum: ['host', 'co-host', 'participant'], default: 'participant' })
    role: string;

    @Column({ name: 'can_share_screen', default: true })
    canShareScreen: boolean;

    @Column({ name: 'can_record', default: false })
    canRecord: boolean;

    @Column({ name: 'is_muted', default: false })
    isMuted: boolean;

    @Column({ name: 'is_video_off', default: false })
    isVideoOff: boolean;

    @Column({ name: 'joined_at', type: 'timestamp' })
    joinedAt: Date;

    @Column({ name: 'left_at', type: 'timestamp', nullable: true })
    leftAt: Date;

    @Column({ name: 'duration_minutes', default: 0 })
    durationMinutes: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
