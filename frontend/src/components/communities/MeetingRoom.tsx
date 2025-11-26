'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { meetingsApi } from '@/lib/api/meetings';
import { useAuth } from '@/contexts/AuthContext';

interface MeetingRoomProps {
    meetingId: string;
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [roomUrl, setRoomUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const initializeMeeting = async () => {
            try {
                console.log('Fetching meeting data for:', meetingId);
                const response = await meetingsApi.joinMeeting(meetingId);
                const { roomUrl: url } = response.data;

                console.log('Jitsi room URL:', url);

                // Jitsi iframe embed with user name
                const displayName = `${user.firstName} ${user.lastName}`;
                const embedUrl = `${url}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false`;

                setRoomUrl(embedUrl);
                setLoading(false);

            } catch (error) {
                console.error('Failed to initialize meeting:', error);
                alert('Failed to join meeting');
                router.back();
            }
        };

        initializeMeeting();
    }, [meetingId, user, router]);

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
                <div className="text-white text-lg animate-pulse">Loading meeting...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Info Banner */}
            <div className="bg-blue-600 text-white px-4 py-2 text-sm text-center">
                <strong>Note:</strong> The meeting host needs to join first to admit participants.
                This is a limitation of Jitsi's free tier.
            </div>

            {/* Meeting iframe */}
            <div className="flex-1">
                <iframe
                    src={roomUrl}
                    allow="camera; microphone; fullscreen; speaker; display-capture"
                    className="w-full h-full border-0"
                    title="Meeting Room"
                />
            </div>
        </div>
    );
}
