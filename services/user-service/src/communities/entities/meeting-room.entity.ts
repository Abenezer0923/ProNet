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
import { Group } from './group.entity';
import { Community } from './community.entity';
import { User } from '../../users/entities/user.entity';
import { MeetingParticipant } from './meeting-participant.entity';
import { BreakoutRoom } from './breakout-room.entity';
import { MeetingPoll } from './meeting-poll.entity';
import { MeetingQA } from './meeting-qa.entity';

@Entity('meeting_rooms')
export class MeetingRoom {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Group)
    @JoinColumn({ name: 'group_id' })
    group: Group;

    @Column({ name: 'group_id' })
    groupId: string;

    @ManyToOne(() => Community)
    @JoinColumn({ name: 'community_id' })
    community: Community;

    @Column({ name: 'community_id' })
    communityId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'host_id' })
    host: User;

    @Column({ name: 'host_id' })
    hostId: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // Daily.co room URL
    @Column({ name: 'daily_room_url', nullable: true })
    dailyRoomUrl: string;

    // Daily.co room name
    @Column({ name: 'daily_room_name', unique: true })
    dailyRoomName: string;

    @Column({ type: 'enum', enum: ['scheduled', 'active', 'ended', 'cancelled'], default: 'scheduled' })
    status: string;

    @Column({ name: 'scheduled_start_time', type: 'timestamp', nullable: true })
    scheduledStartTime: Date;

    @Column({ name: 'scheduled_end_time', type: 'timestamp', nullable: true })
    scheduledEndTime: Date;

    @Column({ name: 'actual_start_time', type: 'timestamp', nullable: true })
    actualStartTime: Date;

    @Column({ name: 'actual_end_time', type: 'timestamp', nullable: true })
    actualEndTime: Date;

    @Column({ name: 'max_participants', default: 100 })
    maxParticipants: number;

    @Column({ name: 'enable_recording', default: false })
    enableRecording: boolean;

    @Column({ name: 'is_recording', default: false })
    isRecording: boolean;

    @Column({ name: 'recording_url', nullable: true })
    recordingUrl: string;

    @Column({ name: 'enable_screen_share', default: true })
    enableScreenShare: boolean;

    @Column({ name: 'enable_chat', default: true })
    enableChat: boolean;

    @Column({ name: 'enable_breakout_rooms', default: true })
    enableBreakoutRooms: boolean;

    @Column({ type: 'jsonb', nullable: true })
    settings: {
        waitingRoom?: boolean;
        muteOnEntry?: boolean;
        videoOnEntry?: boolean;
        allowUnmute?: boolean;
        recordingLayout?: 'grid' | 'speaker' | 'presentation';
    };

    @OneToMany(() => MeetingParticipant, participant => participant.meetingRoom)
    participants: MeetingParticipant[];

    @OneToMany(() => BreakoutRoom, breakoutRoom => breakoutRoom.meetingRoom)
    breakoutRooms: BreakoutRoom[];

    @OneToMany(() => MeetingPoll, poll => poll.meetingRoom)
    polls: MeetingPoll[];

    @OneToMany(() => MeetingQA, qa => qa.meetingRoom)
    qaQuestions: MeetingQA[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
