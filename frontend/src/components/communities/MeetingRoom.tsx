'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { meetingsApi } from '@/lib/api/meetings';
import { useAuth } from '@/contexts/AuthContext';
import DailyIframe from '@daily-co/daily-js';

interface MeetingRoomProps {
    meetingId: string;
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();
    const { user } = useAuth();
    const callFrameRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const initializeMeeting = async () => {
            try {
                console.log('Fetching meeting data for:', meetingId);
                const response = await meetingsApi.joinMeeting(meetingId);
                const { roomUrl } = response.data;

                console.log('Daily.co room URL:', roomUrl);

                if (!containerRef.current) return;

                // Create Daily call frame
                const callFrame = DailyIframe.createFrame(containerRef.current, {
                    iframeStyle: {
                        width: '100%',
                        height: '100%',
                        border: '0',
                    },
                    showLeaveButton: true,
                    showFullscreenButton: true,
                });

                callFrameRef.current = callFrame;

                // Join the room
                await callFrame.join({
                    url: roomUrl,
                    userName: `${user.firstName} ${user.lastName}`,
                });

                console.log('Joined Daily.co meeting');

                // Handle meeting events
                callFrame
                    .on('left-meeting', () => {
                        console.log('Left meeting');
                        router.back();
                    })
                    .on('error', (error: any) => {
                        console.error('Daily.co error:', error);
                    });

            } catch (error) {
                console.error('Failed to initialize meeting:', error);
                alert('Failed to join meeting');
                router.back();
            }
        };

        initializeMeeting();

        // Cleanup
        return () => {
            if (callFrameRef.current) {
                callFrameRef.current.destroy();
            }
        };
    }, [meetingId, user, router]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                Please log in to join the meeting.
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
