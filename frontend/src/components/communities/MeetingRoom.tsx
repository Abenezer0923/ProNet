'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { meetingsApi } from '@/lib/api/meetings';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, MessageSquare, X } from 'lucide-react';

interface MeetingRoomProps {
    meetingId: string;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [meeting, setMeeting] = useState<any>(null);
    const [initializing, setInitializing] = useState(true);
    const [showPolls, setShowPolls] = useState(false);
    const [showQA, setShowQA] = useState(false);
    const jitsiApiRef = useRef<any>(null);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [roomName, setRoomName] = useState<string | null>(null);

    // Load meeting & prepare roomName
    useEffect(() => {
        let cancelled = false;
        const fetchAndPrepare = async () => {
            if (!user) {
                console.log('Waiting for user authentication...');
                return;
            }

            console.log('Fetching meeting data for:', meetingId);

            try {
                const response = await meetingsApi.joinMeeting(meetingId);
                console.log('Meeting API response:', response);

                const { meeting: meetingData } = response.data;

                if (cancelled) return;

                console.log('Meeting data received:', meetingData);

                setMeeting(meetingData);

                // Check for room name in different possible fields
                const extractedRoomName = meetingData.dailyRoomName ||
                    meetingData.roomName ||
                    meetingData.jitsiRoomName;

                console.log('Extracted room name:', extractedRoomName);

                if (!extractedRoomName) {
                    console.error('No room name found in meeting data:', meetingData);
                    throw new Error('Meeting room name not found');
                }

                setRoomName(extractedRoomName);
            } catch (err: any) {
                console.error('Failed to join meeting:', err);
                alert('Failed to join meeting: ' + (err.message || 'Unknown error'));
                router.back();
            }
        };
        fetchAndPrepare();
        return () => { cancelled = true; };
    }, [meetingId, user, router]);

    // Load Jitsi script once
    useEffect(() => {
        if (window.JitsiMeetExternalAPI) return; // already loaded
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    // Initialize Jitsi when prerequisites ready
    useEffect(() => {
        if (!roomName || !user) {
            console.log('Waiting for prerequisites:', { roomName: !!roomName, user: !!user });
            return;
        }

        if (!jitsiContainerRef.current) {
            console.log('Waiting for Jitsi container ref...');
            return;
        }

        if (!window.JitsiMeetExternalAPI) {
            console.log('Jitsi API not loaded yet, waiting...');
            // Retry after script hopefully loads
            const timeout = setTimeout(() => {
                // Trigger effect again
                if (window.JitsiMeetExternalAPI && jitsiContainerRef.current && !jitsiApiRef.current) {
                    console.log('Jitsi API now available, retrying initialization...');
                    setRoomName(r => r); // noop to re-run
                }
            }, 500);
            return () => clearTimeout(timeout);
        }

        console.log('Initializing Jitsi with room:', roomName);

        try {
            const domain = 'meet.jit.si';
            const options = {
                roomName,
                parentNode: jitsiContainerRef.current,
                width: '100%',
                height: '100%',
                userInfo: {
                    displayName: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                    // Skip the prejoin lobby to land users straight in the room
                    prejoinPageEnabled: false,
                    // Silence third-party analytics and remote config fetches (Amplitude, etc.)
                    disableThirdPartyRequests: true,
                    analytics: { disabled: true },
                    // Avoid mobile deep-link prompts and other cross-surface nudges
                    disableDeepLinking: true,
                    // Stop gravatar lookups to prevent 404 spam when no avatar exists
                    enableGravatar: false,
                    // Disable speaker stats to reduce noise
                    disableSpeakerStats: true,
                    // Disable other noisy features
                    enableNoisyMicDetection: false,
                    enableNoAudioDetection: false,
                },
                interfaceConfigOverwrite: {
                    // Trimmed toolbar to reduce unsupported feature warnings & simplify UI
                    // Removed 'chat' (use app chat), 'settings' (source of speaker-selection error), 'desktop'
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'hangup', 'tileview', 'fullscreen'
                    ],
                    // Hide branding and extra UI
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_POWERED_BY: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Fellow Community Member',
                    DEFAULT_LOCAL_DISPLAY_NAME: 'Me',
                },
            };

            console.log('Creating Jitsi API instance...');
            const api = new window.JitsiMeetExternalAPI(domain, options);
            jitsiApiRef.current = api;
            console.log('Jitsi API instance created successfully');

            // Remove loading overlay immediately to allow user interaction with Jitsi UI
            // The public Jitsi server may show its own join screen despite prejoinPageEnabled: false
            setInitializing(false);

            api.addEventListeners({
                videoConferenceJoined: () => {
                    console.log('Video conference joined');
                },
                readyToClose: () => {
                    console.log('Meeting ended - ready to close');
                    router.back();
                },
                videoConferenceLeft: () => {
                    console.log('Left video conference');
                    router.back();
                },
            });
        } catch (e: any) {
            console.error('Jitsi init error:', e);
            alert('Video initialization failed: ' + e.message);
            router.back();
        }
    }, [roomName, user, router]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (jitsiApiRef.current) {
                try { jitsiApiRef.current.dispose(); } catch { /* ignore */ }
            }
        };
    }, []);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                Please log in to join the meeting.
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 relative">
            {/* Main video area always rendered so parentNode exists */}
            <div className="flex-1 flex flex-col h-full">
                <div ref={jitsiContainerRef} id="jitsi-container" className="w-full h-full" />
                {initializing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                        <div className="text-white text-lg animate-pulse">Joining meeting...</div>
                    </div>
                )}
            </div>

            {/* Floating Action Buttons for Custom Features */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button
                    onClick={() => { setShowPolls(p => !p); setShowQA(false); }}
                    className={`p-3 rounded-full ${showPolls ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} text-white shadow-lg transition`}
                    title="Polls"
                >
                    <BarChart3 size={20} />
                </button>
                <button
                    onClick={() => { setShowQA(p => !p); setShowPolls(false); }}
                    className={`p-3 rounded-full ${showQA ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} text-white shadow-lg transition`}
                    title="Q&A"
                >
                    <MessageSquare size={20} />
                </button>
            </div>

            {/* Side panels */}
            {(showPolls || showQA) && (
                <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col absolute right-0 top-0 bottom-0 z-30 shadow-xl">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-white font-semibold">
                            {showPolls ? 'Polls' : 'Q&A'}
                        </h3>
                        <button
                            onClick={() => { setShowPolls(false); setShowQA(false); }}
                            className="text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {showPolls && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="text-gray-400 text-sm text-center py-8">
                                No active polls
                            </div>
                        </div>
                    )}
                    {showQA && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="text-gray-400 text-sm text-center py-8">
                                No questions yet
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
