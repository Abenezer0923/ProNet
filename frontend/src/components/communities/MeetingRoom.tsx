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
    const [isLoading, setIsLoading] = useState(true);
    const [showPolls, setShowPolls] = useState(false);
    const [showQA, setShowQA] = useState(false);
    const jitsiApiRef = useRef<any>(null);

    // Load Jitsi script
    const loadJitsiScript = () => {
        return new Promise((resolve) => {
            if (window.JitsiMeetExternalAPI) {
                resolve(window.JitsiMeetExternalAPI);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = () => resolve(window.JitsiMeetExternalAPI);
            document.body.appendChild(script);
        });
    };

    // Join meeting
    useEffect(() => {
        const joinMeeting = async () => {
            if (!user) return;

            try {
                const response = await meetingsApi.joinMeeting(meetingId);
                const { roomUrl, roomName, meeting: meetingData } = response.data;

                setMeeting(meetingData);

                await loadJitsiScript();

                const domain = 'meet.jit.si';
                const options = {
                    roomName: roomName || meetingData.dailyRoomName,
                    width: '100%',
                    height: '100%',
                    parentNode: document.getElementById('jitsi-container'),
                    userInfo: {
                        displayName: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                    },
                    configOverwrite: {
                        startWithAudioMuted: true,
                        startWithVideoMuted: true,
                        prejoinPageEnabled: false,
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'security'
                        ],
                    },
                };

                const api = new window.JitsiMeetExternalAPI(domain, options);
                jitsiApiRef.current = api;

                // Handle meeting end
                api.addEventListeners({
                    videoConferenceLeft: () => {
                        router.back();
                    },
                    readyToClose: () => {
                        router.back();
                    }
                });

                setIsLoading(false);

            } catch (error) {
                console.error('Failed to join meeting:', error);
                alert('Failed to join meeting');
                router.back();
            }
        };

        joinMeeting();

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, [meetingId, router, user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-white text-xl">Joining meeting...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 relative">
            {/* Main video area */}
            <div className="flex-1 flex flex-col h-full">
                <div id="jitsi-container" className="w-full h-full" />
            </div>

            {/* Floating Action Buttons for Custom Features */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                    onClick={() => { setShowPolls(!showPolls); setShowQA(false); }}
                    className={`p-3 rounded-full ${showPolls ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} text-white shadow-lg transition`}
                    title="Polls"
                >
                    <BarChart3 size={20} />
                </button>
                <button
                    onClick={() => { setShowQA(!showQA); setShowPolls(false); }}
                    className={`p-3 rounded-full ${showQA ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} text-white shadow-lg transition`}
                    title="Q&A"
                >
                    <MessageSquare size={20} />
                </button>
            </div>

            {/* Side panels */}
            {(showPolls || showQA) && (
                <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col absolute right-0 top-0 bottom-0 z-20 shadow-xl">
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
                            {/* Polls component would go here */}
                        </div>
                    )}

                    {showQA && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="text-gray-400 text-sm text-center py-8">
                                No questions yet
                            </div>
                            {/* Q&A component would go here */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
