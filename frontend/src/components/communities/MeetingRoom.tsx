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
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface MeetingRoomProps {
    meetingId: string;
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const initializeMeeting = async () => {
            try {
                console.log('Fetching meeting data for:', meetingId);
                const response = await meetingsApi.joinMeeting(meetingId);
                const { token, roomUrl: callId, apiKey, user: streamUser } = response.data;

                console.log('Initializing Stream client for call:', callId);

                if (!apiKey || apiKey === 'your_api_key') {
                    setError('Stream API key is missing. Please configure it in the backend.');
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
                setLoading(false);

            } catch (error) {
                console.error('Failed to initialize meeting:', error);
                setError('Failed to join meeting. Please try again.');
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
                Please log in to join the meeting.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-white text-lg animate-pulse">Setting up your meeting...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center">
                    <h3 className="text-xl font-bold mb-2">Error</h3>
                    <p>{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-white text-red-600 rounded hover:bg-gray-100"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!client || !call) return null;

    return (
        <StreamVideo client={client}>
            <StreamTheme>
                <StreamCall call={call}>
                    <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
                        <div className="flex-1 relative">
                            <SpeakerLayout />
                            <div className="absolute top-4 right-4 z-10">
                                <CallParticipantsList onClose={() => { }} />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-800 flex justify-center">
                            <CallControls onLeave={() => router.back()} />
                        </div>
                    </div>
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
}
