'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { meetingsApi, CreateMeetingDto } from '@/lib/api/meetings';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  initialType?: 'instant' | 'schedule';
  onMeetingCreated?: () => void;
}

export default function CreateMeetingModal({ 
  isOpen, 
  onClose, 
  groupId, 
  groupName, 
  initialType = 'instant',
  onMeetingCreated 
}: CreateMeetingModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduled, setIsScheduled] = useState(initialType === 'schedule');
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

  if (!isOpen) return null;

  const handleStartMeeting = async () => {
    setIsLoading(true);
    try {
      const response = await meetingsApi.createMeeting(groupId, formData);
      const meeting = response.data;

      if (isScheduled) {
        onClose();
        if (onMeetingCreated) {
          onMeetingCreated();
        }
        alert('Meeting scheduled successfully!');
      } else {
        // Join the meeting immediately
        router.push(`/meetings/${meeting.id}`);
      }
    } catch (error: any) {
      console.error('Failed to create meeting:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start meeting';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isScheduled ? 'Schedule Meeting' : 'Start Instant Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="font-medium text-gray-700">Schedule for later</span>
            </label>

            {isScheduled && (
              <div className="space-y-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledStartTime || ''}
                      onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledEndTime || ''}
                      onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                    // Add recurring logic here if backend supports it, for now just UI
                  />
                  Recurring Meeting
                </label>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.enableRecording}
                onChange={(e) => setFormData({ ...formData, enableRecording: e.target.checked })}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm text-gray-600">Enable Recording</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.enableScreenShare}
                onChange={(e) => setFormData({ ...formData, enableScreenShare: e.target.checked })}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm text-gray-600">Enable Screen Sharing</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:shadow-sm transition font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleStartMeeting}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isScheduled ? 'Schedule Meeting' : 'Start Meeting')}
          </button>
        </div>
      </div>
    </div>
  );
}
