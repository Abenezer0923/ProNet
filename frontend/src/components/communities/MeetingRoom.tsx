'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { meetingsApi } from '@/lib/api/meetings';
import { useAuth } from '@/contexts/AuthContext';
import {
    Call,
    CallControls,
    CallParticipantsList,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient,
    User,
    useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface MeetingRoomProps {
    meetingId: string;
}

// Meeting Info Header Component
function MeetingInfoHeader({ meeting }: { meeting: any }) {
    const { useParticipantCount } = useCallStateHooks();
    const participantCount = useParticipantCount();

    const getDuration = () => {
        if (!meeting.actualStartTime) return '0:00';
        const start = new Date(meeting.actualStartTime);
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const [duration, setDuration] = useState(getDuration());

    useEffect(() => {
        const interval = setInterval(() => {
            setDuration(getDuration());
        }, 1000);
        return () => clearInterval(interval);
    }, [meeting.actualStartTime]);

    return (
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">{meeting.title}</h2>
                    {meeting.description && (
                        <p className="text-sm text-gray-400">{meeting.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-gray-300">LIVE</span>
                    </div>
                    <div className="text-gray-300">
                        <span className="font-medium">{participantCount}</span> participant{participantCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-gray-300">
                        {duration}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const initializeMeeting = async () => {
            try {
                console.log('Fetching meeting data for:', meetingId);
                const response = await meetingsApi.joinMeeting(meetingId);
                const { token, roomUrl: callId, apiKey, user: streamUser, meeting: meetingData } = response.data;

                console.log('Initializing Stream client for call:', callId);

                if (!apiKey) {
                    setError('Video service is not configured. Please contact support.');
                    setLoading(false);
                    return;
                }

                const userObj: User = {
                    id: streamUser.id,
                    name: streamUser.name,
                    image: streamUser.image,
                };

                const streamClient = new StreamVideoClient({
                    apiKey,
                    user: userObj,
                    token
                });

                const streamCall = streamClient.call('default', callId);
                await streamCall.join({ create: true });

                setClient(streamClient);
                setCall(streamCall);
                setMeeting(meetingData);
                setLoading(false);

            } catch (error: any) {
                console.error('Failed to initialize meeting:', error);

                // Handle specific error cases
                if (error.response?.status === 403) {
                    setError('You do not have permission to join this meeting. Only community members can participate.');
                } else if (error.response?.status === 404) {
                    setError('This meeting could not be found. It may have been deleted.');
                } else if (error.response?.data?.message?.includes('ended')) {
                    setError('This meeting has already ended.');
                } else {
                    setError('Failed to join meeting. Please try again or contact support.');
                }
                setLoading(false);
            }
        };

        initializeMeeting();

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [meetingId, user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
                    <p className="text-gray-400">Please log in to join the meeting.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-white text-lg">Setting up your meeting...</p>
                    <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="bg-red-600/10 border border-red-600 text-white p-8 rounded-lg max-w-md text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Unable to Join Meeting</h3>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!client || !call || !meeting) return null;

    return (
        <StreamVideo client={client}>
            <StreamTheme>
                <StreamCall call={call}>
                    <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
                        <MeetingInfoHeader meeting={meeting} />
                        <div className="flex-1 relative">
                            <SpeakerLayout />
                        </div>
                        <div className="p-4 bg-gray-800 flex justify-center border-t border-gray-700">
                            <CallControls onLeave={() => router.back()} />
                        </div>
                    </div>
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
}
