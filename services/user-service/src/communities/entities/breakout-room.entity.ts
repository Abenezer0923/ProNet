import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { MeetingRoom } from './meeting-room.entity';

@Entity('breakout_rooms')
export class BreakoutRoom {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MeetingRoom, meetingRoom => meetingRoom.breakoutRooms)
    @JoinColumn({ name: 'meeting_room_id' })
    meetingRoom: MeetingRoom;

    @Column({ name: 'meeting_room_id' })
    meetingRoomId: string;

    @Column()
    name: string;

    // Daily.co room URL for breakout room
    @Column({ name: 'daily_room_url', nullable: true })
    dailyRoomUrl: string;

    @Column({ name: 'daily_room_name', unique: true })
    dailyRoomName: string;

    @Column({ type: 'enum', enum: ['active', 'closed'], default: 'active' })
    status: string;

    // Array of user IDs assigned to this breakout room
    @Column({ type: 'jsonb', default: '[]' })
    participantIds: string[];

    @Column({ name: 'max_participants', default: 10 })
    maxParticipants: number;

    @Column({ name: 'duration_minutes', nullable: true })
    durationMinutes: number;

    @Column({ name: 'started_at', type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
    endedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
