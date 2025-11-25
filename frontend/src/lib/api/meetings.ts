import { api } from '../api';

export interface CreateMeetingDto {
    title: string;
    description?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    maxParticipants?: number;
    enableRecording?: boolean;
    enableScreenShare?: boolean;
    enableChat?: boolean;
    enableBreakoutRooms?: boolean;
    settings?: {
        waitingRoom?: boolean;
        muteOnEntry?: boolean;
        videoOnEntry?: boolean;
        allowUnmute?: boolean;
        recordingLayout?: 'grid' | 'speaker' | 'presentation';
    };
}

export interface CreatePollDto {
    question: string;
    options: string[];
    allowMultiple?: boolean;
    anonymous?: boolean;
}

export interface CreateBreakoutRoomsDto {
    numberOfRooms: number;
    durationMinutes?: number;
    assignmentType?: 'auto' | 'manual';
    roomAssignments?: {
        roomName: string;
        participantIds: string[];
    }[];
}

export const meetingsApi = {
    // Meeting room operations
    createMeeting: (groupId: string, data: CreateMeetingDto) =>
        api.post(`/communities/groups/${groupId}/meetings`, data),

    getMeetings: (groupId: string) =>
        api.get(`/communities/groups/${groupId}/meetings`),

    getMeeting: (meetingId: string) =>
        api.get(`/communities/meetings/${meetingId}`),

    joinMeeting: (meetingId: string) =>
        api.post(`/communities/meetings/${meetingId}/join`),

    endMeeting: (meetingId: string) =>
        api.post(`/communities/meetings/${meetingId}/end`),

    // Recording
    startRecording: (meetingId: string) =>
        api.post(`/communities/meetings/${meetingId}/recording/start`),

    stopRecording: (meetingId: string) =>
        api.post(`/communities/meetings/${meetingId}/recording/stop`),

    // Breakout rooms
    createBreakoutRooms: (meetingId: string, data: CreateBreakoutRoomsDto) =>
        api.post(`/communities/meetings/${meetingId}/breakout-rooms`, data),

    getBreakoutRooms: (meetingId: string) =>
        api.get(`/communities/meetings/${meetingId}/breakout-rooms`),

    closeBreakoutRooms: (meetingId: string) =>
        api.post(`/communities/meetings/${meetingId}/breakout-rooms/close`),

    // Polls
    createPoll: (meetingId: string, data: CreatePollDto) =>
        api.post(`/communities/meetings/${meetingId}/polls`, data),

    votePoll: (pollId: string, optionId: string) =>
        api.post(`/communities/meetings/polls/${pollId}/vote`, { optionId }),

    getPollResults: (pollId: string) =>
        api.get(`/communities/meetings/polls/${pollId}/results`),

    closePoll: (pollId: string) =>
        api.post(`/communities/meetings/polls/${pollId}/close`),

    // Q&A
    submitQuestion: (meetingId: string, question: string) =>
        api.post(`/communities/meetings/${meetingId}/qa`, { question }),

    getQuestions: (meetingId: string) =>
        api.get(`/communities/meetings/${meetingId}/qa`),

    upvoteQuestion: (questionId: string) =>
        api.post(`/communities/meetings/qa/${questionId}/upvote`),

    answerQuestion: (questionId: string, answer: string) =>
        api.post(`/communities/meetings/qa/${questionId}/answer`, { answer }),
};
