import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { BreakoutRoom } from './entities/breakout-room.entity';
import { MeetingPoll } from './entities/meeting-poll.entity';
import { MeetingPollVote } from './entities/meeting-poll-vote.entity';
import { MeetingQA } from './entities/meeting-qa.entity';
import { MeetingQAUpvote } from './entities/meeting-qa-upvote.entity';
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { CreateBreakoutRoomsDto } from './dto/create-breakout-rooms.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { CreateQADto } from './dto/create-qa.dto';
import { AnswerQADto } from './dto/answer-qa.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MeetingsService {
    constructor(
        @InjectRepository(MeetingRoom)
        private meetingRoomRepository: Repository<MeetingRoom>,
        @InjectRepository(MeetingParticipant)
        private participantRepository: Repository<MeetingParticipant>,
        @InjectRepository(BreakoutRoom)
        private breakoutRoomRepository: Repository<BreakoutRoom>,
        @InjectRepository(MeetingPoll)
        private pollRepository: Repository<MeetingPoll>,
        @InjectRepository(MeetingPollVote)
        private pollVoteRepository: Repository<MeetingPollVote>,
        @InjectRepository(MeetingQA)
        private qaRepository: Repository<MeetingQA>,
        @InjectRepository(MeetingQAUpvote)
        private qaUpvoteRepository: Repository<MeetingQAUpvote>,
        @InjectRepository(Group)
        private groupRepository: Repository<Group>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // Create a new meeting room
    async createMeetingRoom(groupId: string, userId: string, dto: CreateMeetingRoomDto) {
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
            relations: ['community'],
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        // Generate a unique room name for Whereby
        const roomName = `ProNet-${groupId}-${uuidv4()}`;

        console.log(`Creating Whereby meeting room: ${roomName}`);

        // Whereby offers free embeddable rooms without API key
        // Format: https://subdomain.whereby.com/room-name
        // We'll use a simple room name that works with Whereby's free tier
        const wherebyRoomUrl = `https://whereby.com/${roomName}`;

        console.log(`Whereby room URL: ${wherebyRoomUrl}`);

        // Create meeting room in database
        const meetingRoom = this.meetingRoomRepository.create({
            groupId,
            communityId: group.community.id,
            hostId: userId,
            title: dto.title,
            description: dto.description,
            dailyRoomUrl: wherebyRoomUrl,
            dailyRoomName: roomName,
            scheduledStartTime: dto.scheduledStartTime ? new Date(dto.scheduledStartTime) : null,
            scheduledEndTime: dto.scheduledEndTime ? new Date(dto.scheduledEndTime) : null,
            maxParticipants: dto.maxParticipants || 100,
            enableRecording: dto.enableRecording || false,
            enableScreenShare: dto.enableScreenShare !== false,
            enableChat: dto.enableChat !== false,
            enableBreakoutRooms: dto.enableBreakoutRooms !== false,
            settings: dto.settings || {},
        });

        return await this.meetingRoomRepository.save(meetingRoom);
    }

    // Get meeting rooms for a group
    async getMeetingRooms(groupId: string) {
        return await this.meetingRoomRepository.find({
            where: { groupId },
            relations: ['host', 'participants', 'participants.user'],
            order: { createdAt: 'DESC' },
        });
    }

    // Get meeting room details
    async getMeetingRoom(meetingId: string) {
        const meeting = await this.meetingRoomRepository.findOne({
            where: { id: meetingId },
            relations: ['host', 'group', 'community', 'participants', 'participants.user'],
        });

        if (!meeting) {
            throw new NotFoundException('Meeting not found');
        }

        return meeting;
    }

    // Join a meeting (get access token)
    async joinMeeting(meetingId: string, userId: string) {
        console.log(`User ${userId} joining meeting ${meetingId}`);
        try {
            const meeting = await this.getMeetingRoom(meetingId);

            // Check if meeting is active or scheduled
            if (meeting.status === 'ended' || meeting.status === 'cancelled') {
                throw new BadRequestException('Meeting has ended or been cancelled');
            }

            const user = await this.userRepository.findOne({ where: { id: userId } });
            const userName = user ? `${user.firstName} ${user.lastName}` : userId;

            console.log(`Joining Daily.co room: ${meeting.dailyRoomName} as user: ${userName}`);

            // Track participant
            const existingParticipant = await this.participantRepository.findOne({
                where: { meetingRoomId: meetingId, userId, leftAt: null },
            });

            if (!existingParticipant) {
                console.log('Creating new participant record');
                const participant = this.participantRepository.create({
                    meetingRoomId: meetingId,
                    userId,
                    role: userId === meeting.hostId ? 'host' : 'participant',
                    canShareScreen: meeting.enableScreenShare,
                    canRecord: userId === meeting.hostId,
                    joinedAt: new Date(),
                });

                // Explicitly set the relation to ensure foreign key is populated
                participant.meetingRoom = meeting;

                await this.participantRepository.save(participant);
            }

            // Update meeting status to active if it's the first join
            if (meeting.status === 'scheduled') {
                meeting.status = 'active';
                meeting.actualStartTime = new Date();
                await this.meetingRoomRepository.save(meeting);
            }

            return {
                token: null, // No token needed for Daily.co free tier
                roomUrl: meeting.dailyRoomUrl,
                meeting,
            };
        } catch (error) {
            console.error('Error joining meeting:', error);
            throw error;
        }
    }

    // End a meeting
    async endMeeting(meetingId: string, userId: string) {
        const meeting = await this.getMeetingRoom(meetingId);

        if (meeting.hostId !== userId) {
            throw new ForbiddenException('Only the host can end the meeting');
        }

        // Update all active participants
        await this.participantRepository
            .createQueryBuilder()
            .update(MeetingParticipant)
            .set({ leftAt: new Date() })
            .where('meetingRoomId = :meetingId AND leftAt IS NULL', { meetingId })
            .execute();

        // Update meeting status
        meeting.status = 'ended';
        meeting.actualEndTime = new Date();
        await this.meetingRoomRepository.save(meeting);

        // Jitsi rooms are ephemeral, no need to delete via API

        return meeting;
    }

    // Start recording
    async startRecording(meetingId: string, userId: string) {
        const meeting = await this.getMeetingRoom(meetingId);

        if (meeting.hostId !== userId) {
            throw new ForbiddenException('Only the host can start recording');
        }

        if (!meeting.enableRecording) {
            throw new BadRequestException('Recording is not enabled for this meeting');
        }

        meeting.isRecording = true;
        await this.meetingRoomRepository.save(meeting);

        return { isRecording: true };
    }

    // Stop recording
    async stopRecording(meetingId: string, userId: string) {
        const meeting = await this.getMeetingRoom(meetingId);

        if (meeting.hostId !== userId) {
            throw new ForbiddenException('Only the host can stop recording');
        }

        meeting.isRecording = false;
        await this.meetingRoomRepository.save(meeting);

        return { isRecording: false };
    }

    // Create breakout rooms
    async createBreakoutRooms(meetingId: string, userId: string, dto: CreateBreakoutRoomsDto) {
        const meeting = await this.getMeetingRoom(meetingId);

        if (meeting.hostId !== userId) {
            throw new ForbiddenException('Only the host can create breakout rooms');
        }

        if (!meeting.enableBreakoutRooms) {
            throw new BadRequestException('Breakout rooms are not enabled for this meeting');
        }

        const breakoutRooms = [];

        for (let i = 0; i < dto.numberOfRooms; i++) {
            const roomName = `pronet-breakout-${meetingId}-${i + 1}-${uuidv4()}`;
            const roomUrl = `https://meet.jit.si/${roomName}`;

            const breakoutRoom = this.breakoutRoomRepository.create({
                meetingRoomId: meetingId,
                name: dto.roomAssignments?.[i]?.roomName || `Breakout Room ${i + 1}`,
                dailyRoomUrl: roomUrl,
                dailyRoomName: roomName,
                participantIds: dto.roomAssignments?.[i]?.participantIds || [],
                durationMinutes: dto.durationMinutes,
                startedAt: new Date(),
            });

            breakoutRooms.push(await this.breakoutRoomRepository.save(breakoutRoom));
        }

        return breakoutRooms;
    }

    // Get breakout rooms
    async getBreakoutRooms(meetingId: string) {
        return await this.breakoutRoomRepository.find({
            where: { meetingRoomId: meetingId },
            order: { createdAt: 'ASC' },
        });
    }

    // Close breakout rooms
    async closeBreakoutRooms(meetingId: string, userId: string) {
        const meeting = await this.getMeetingRoom(meetingId);

        if (meeting.hostId !== userId) {
            throw new ForbiddenException('Only the host can close breakout rooms');
        }

        const breakoutRooms = await this.getBreakoutRooms(meetingId);

        for (const room of breakoutRooms) {
            room.status = 'closed';
            room.endedAt = new Date();
            await this.breakoutRoomRepository.save(room);
        }

        return { message: 'Breakout rooms closed' };
    }

    // Create poll
    async createPoll(meetingId: string, userId: string, dto: CreatePollDto) {
        const meeting = await this.getMeetingRoom(meetingId);

        const options = dto.options.map((text, index) => ({
            id: uuidv4(),
            text,
            votes: 0,
        }));

        const poll = this.pollRepository.create({
            meetingRoomId: meetingId,
            createdBy: userId,
            question: dto.question,
            options,
            allowMultiple: dto.allowMultiple || false,
            anonymous: dto.anonymous || false,
        });

        return await this.pollRepository.save(poll);
    }

    // Vote on poll
    async votePoll(pollId: string, userId: string, optionId: string) {
        const poll = await this.pollRepository.findOne({ where: { id: pollId } });

        if (!poll) {
            throw new NotFoundException('Poll not found');
        }

        if (poll.status === 'closed') {
            throw new BadRequestException('Poll is closed');
        }

        // Check if user already voted
        const existingVote = await this.pollVoteRepository.findOne({
            where: { pollId, userId },
        });

        if (existingVote && !poll.allowMultiple) {
            throw new BadRequestException('You have already voted on this poll');
        }

        // Validate option ID
        const option = poll.options.find(opt => opt.id === optionId);
        if (!option) {
            throw new BadRequestException('Invalid option');
        }

        // Record vote
        const vote = this.pollVoteRepository.create({
            pollId,
            userId,
            optionId,
        });
        await this.pollVoteRepository.save(vote);

        // Update vote count
        poll.options = poll.options.map(opt =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        await this.pollRepository.save(poll);

        return poll;
    }

    // Get poll results
    async getPollResults(pollId: string) {
        return await this.pollRepository.findOne({
            where: { id: pollId },
            relations: ['votes', 'votes.user'],
        });
    }

    // Close poll
    async closePoll(pollId: string, userId: string) {
        const poll = await this.pollRepository.findOne({
            where: { id: pollId },
            relations: ['meetingRoom'],
        });

        if (!poll) {
            throw new NotFoundException('Poll not found');
        }

        if (poll.meetingRoom.hostId !== userId) {
            throw new ForbiddenException('Only the host can close polls');
        }

        poll.status = 'closed';
        return await this.pollRepository.save(poll);
    }

    // Submit Q&A question
    async submitQuestion(meetingId: string, userId: string, dto: CreateQADto) {
        const meeting = await this.getMeetingRoom(meetingId);

        const question = this.qaRepository.create({
            meetingRoomId: meetingId,
            askedById: userId,
            question: dto.question,
        });

        return await this.qaRepository.save(question);
    }

    // Get Q&A questions
    async getQuestions(meetingId: string) {
        return await this.qaRepository.find({
            where: { meetingRoomId: meetingId },
            relations: ['askedBy', 'answeredBy', 'upvotes'],
            order: { upvoteCount: 'DESC', createdAt: 'DESC' },
        });
    }

    // Upvote question
    async upvoteQuestion(questionId: string, userId: string) {
        const question = await this.qaRepository.findOne({ where: { id: questionId } });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        // Check if already upvoted
        const existingUpvote = await this.qaUpvoteRepository.findOne({
            where: { questionId, userId },
        });

        if (existingUpvote) {
            // Remove upvote
            await this.qaUpvoteRepository.remove(existingUpvote);
            question.upvoteCount = Math.max(0, question.upvoteCount - 1);
        } else {
            // Add upvote
            const upvote = this.qaUpvoteRepository.create({
                questionId,
                userId,
            });
            await this.qaUpvoteRepository.save(upvote);
            question.upvoteCount += 1;
        }

        return await this.qaRepository.save(question);
    }

    // Answer question
    async answerQuestion(questionId: string, userId: string, dto: AnswerQADto) {
        const question = await this.qaRepository.findOne({
            where: { id: questionId },
            relations: ['meetingRoom'],
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        if (question.meetingRoom.hostId !== userId) {
            throw new ForbiddenException('Only the host can answer questions');
        }

        question.answer = dto.answer;
        question.answeredById = userId;
        question.answeredAt = new Date();
        question.isAnswered = true;

        return await this.qaRepository.save(question);
    }
}
