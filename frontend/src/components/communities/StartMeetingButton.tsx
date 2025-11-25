'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { meetingsApi, CreateMeetingDto } from '@/lib/api/meetings';
import { Video, X } from 'lucide-react';

interface StartMeetingButtonProps {
    groupId: string;
    groupName: string;
}

export default function StartMeetingButton({ groupId, groupName }: StartMeetingButtonProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateMeetingDto>({
        title: `${groupName} Meeting`,
        description: '',
        maxParticipants: 100,
        enableRecording: false,
        enableScreenShare: true,
        enableChat: true,
        enableBreakoutRooms: true,
        settings: {
            muteOnEntry: false,
            videoOnEntry: true,
            allowUnmute: true,
            recordingLayout: 'grid',
        },
    });

    const handleStartMeeting = async () => {
        setIsLoading(true);
        try {
            const response = await meetingsApi.createMeeting(groupId, formData);
            const meeting = response.data;

            // Join the meeting immediately
            router.push(`/meetings/${meeting.id}`);
        } catch (error) {
            console.error('Failed to create meeting:', error);
            alert('Failed to start meeting');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
                <Video size={20} />
                Start Meeting
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Start Meeting</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.enableRecording}
                                        onChange={(e) => setFormData({ ...formData, enableRecording: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Enable Recording</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.enableScreenShare}
                                        onChange={(e) => setFormData({ ...formData, enableScreenShare: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Enable Screen Sharing</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.enableBreakoutRooms}
                                        onChange={(e) => setFormData({ ...formData, enableBreakoutRooms: e.target.checked })}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Enable Breakout Rooms</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStartMeeting}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Starting...' : 'Start Meeting'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
