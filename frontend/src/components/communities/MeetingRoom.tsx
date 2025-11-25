'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DailyIframe from '@daily-co/daily-js';
import { meetingsApi } from '@/lib/api/meetings';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, Users, MessageSquare, BarChart3 } from 'lucide-react';

interface MeetingRoomProps {
    meetingId: string;
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();
    const [callFrame, setCallFrame] = useState<any>(null);
    const [meeting, setMeeting] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showPolls, setShowPolls] = useState(false);
    const [showQA, setShowQA] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);

    // Join meeting
    useEffect(() => {
        const joinMeeting = async () => {
            try {
                const response = await meetingsApi.joinMeeting(meetingId);
                const { token, roomUrl, meeting: meetingData } = response.data;

                setMeeting(meetingData);

                // Create Daily call frame
                const frame = DailyIframe.createFrame(document.getElementById('daily-container')!, {
                    showLeaveButton: false,
                    showFullscreenButton: true,
                    iframeStyle: {
                        width: '100%',
                        height: '100%',
                        border: '0',
                        borderRadius: '8px',
                    },
                });

                // Join the call
                await frame.join({ url: roomUrl, token });

                setCallFrame(frame);
                setIsLoading(false);

                // Listen to events
                frame.on('participant-joined', updateParticipants);
                frame.on('participant-left', updateParticipants);
                frame.on('participant-updated', updateParticipants);

            } catch (error) {
                console.error('Failed to join meeting:', error);
                alert('Failed to join meeting');
                router.back();
            }
        };

        joinMeeting();

        return () => {
            if (callFrame) {
                callFrame.destroy();
            }
        };
    }, [meetingId, router]);

    const updateParticipants = useCallback(() => {
        if (callFrame) {
            const parts = Object.values(callFrame.participants());
            setParticipants(parts);
        }
    }, [callFrame]);

    // Toggle microphone
    const toggleMute = () => {
        if (callFrame) {
            callFrame.setLocalAudio(!isMuted);
            setIsMuted(!isMuted);
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (callFrame) {
            callFrame.setLocalVideo(!isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    // Toggle screen share
    const toggleScreenShare = async () => {
        if (callFrame) {
            if (isScreenSharing) {
                await callFrame.stopScreenShare();
                setIsScreenSharing(false);
            } else {
                await callFrame.startScreenShare();
                setIsScreenSharing(true);
            }
        }
    };

    // Leave meeting
    const leaveMeeting = async () => {
        if (callFrame) {
            await callFrame.leave();
            callFrame.destroy();
        }
        router.back();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-white text-xl">Joining meeting...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Main video area */}
            <div className="flex-1 flex flex-col">
                {/* Video container */}
                <div className="flex-1 relative">
                    <div id="daily-container" className="w-full h-full" />
                </div>

                {/* Control bar */}
                <div className="bg-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{meeting?.title}</span>
                        <span className="text-gray-400 text-sm">
                            {participants.length} participant{participants.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mute button */}
                        <button
                            onClick={toggleMute}
                            className={`p-3 rounded-full ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                                } text-white transition`}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        {/* Video button */}
                        <button
                            onClick={toggleVideo}
                            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                                } text-white transition`}
                            title={isVideoOff ? 'Turn on video' : 'Turn off video'}
                        >
                            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                        </button>

                        {/* Screen share button */}
                        {meeting?.enableScreenShare && (
                            <button
                                onClick={toggleScreenShare}
                                className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                                    } text-white transition`}
                                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                            >
                                {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                            </button>
                        )}

                        {/* Participants button */}
                        <button
                            onClick={() => setShowParticipants(!showParticipants)}
                            className={`p-3 rounded-full ${showParticipants ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                                } text-white transition`}
                            title="Participants"
                        >
                            <Users size={20} />
                        </button>

                        {/* Polls button */}
                        <button
                            onClick={() => setShowPolls(!showPolls)}
                            className={`p-3 rounded-full ${showPolls ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                                } text-white transition`}
                            title="Polls"
                        >
                            <BarChart3 size={20} />
                        </button>

                        {/* Q&A button */}
                        <button
                            onClick={() => setShowQA(!showQA)}
                            className={`p-3 rounded-full ${showQA ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                                } text-white transition`}
                            title="Q&A"
                        >
                            <MessageSquare size={20} />
                        </button>

                        {/* Leave button */}
                        <button
                            onClick={leaveMeeting}
                            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
                            title="Leave meeting"
                        >
                            <Phone size={20} className="rotate-135" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Side panels */}
            {(showParticipants || showPolls || showQA) && (
                <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                    {showParticipants && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <h3 className="text-white font-semibold mb-4">Participants ({participants.length})</h3>
                            <div className="space-y-2">
                                {participants.map((participant: any) => (
                                    <div
                                        key={participant.session_id}
                                        className="flex items-center gap-3 p-2 rounded bg-gray-700"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                            {participant.user_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white text-sm">
                                                {participant.user_name || 'Guest'}
                                                {participant.local && ' (You)'}
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                {participant.audio ? '🎤' : '🔇'} {participant.video ? '📹' : '📷'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showPolls && (
                        <div className="flex-1 p-4 overflow-y-auto border-t border-gray-700">
                            <h3 className="text-white font-semibold mb-4">Polls</h3>
                            <div className="text-gray-400 text-sm text-center py-8">
                                No active polls
                            </div>
                        </div>
                    )}

                    {showQA && (
                        <div className="flex-1 p-4 overflow-y-auto border-t border-gray-700">
                            <h3 className="text-white font-semibold mb-4">Q&A</h3>
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
