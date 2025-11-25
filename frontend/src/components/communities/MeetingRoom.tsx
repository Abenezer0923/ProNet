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

                console.log('Whereby room URL:', url);

                // Add embed parameters to Whereby URL
                const embedUrl = `${url}?embed&displayName=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`;
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
        <div className="flex h-screen bg-gray-900">
            <iframe
                src={roomUrl}
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="w-full h-full border-0"
            />
        </div>
    );
}
