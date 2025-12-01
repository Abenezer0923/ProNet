'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { meetingsApi } from '@/lib/api/meetings';
import { VideoCameraIcon, CalendarIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

interface MeetingListProps {
  groupId: string;
}

export default function MeetingList({ groupId }: MeetingListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ended' | 'recordings'>('upcoming');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [groupId, activeTab]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await meetingsApi.getMeetings(groupId);
      // Filter based on tab
      const allMeetings = response.data;
      const now = new Date();
      
      let filtered = [];
      if (activeTab === 'upcoming') {
        filtered = allMeetings.filter((m: any) => 
          m.status === 'active' || new Date(m.scheduledStartTime || m.createdAt) > now
        );
      } else if (activeTab === 'ended') {
        filtered = allMeetings.filter((m: any) => 
          m.status === 'ended' || (m.scheduledEndTime && new Date(m.scheduledEndTime) < now)
        );
      } else {
        // Recordings - assuming backend returns them or we filter meetings with recordings
        filtered = allMeetings.filter((m: any) => m.hasRecording);
      }
      
      setMeetings(filtered);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (activeTab) {
      case 'upcoming': return <CalendarIcon className="w-12 h-12 text-primary-500" />;
      case 'ended': return <VideoCameraIcon className="w-12 h-12 text-gray-500" />;
      case 'recordings': return <PlayCircleIcon className="w-12 h-12 text-orange-500" />;
    }
  };

  return (
    <div className="mt-8">
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['upcoming', 'ended', 'recordings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 px-1 capitalize font-medium text-sm transition ${
              activeTab === tab
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            {getIcon()}
          </div>
          <h3 className="text-lg font-medium text-gray-900">No {activeTab} meetings</h3>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab === 'upcoming' 
              ? 'Schedule a new meeting to get started' 
              : activeTab === 'ended' 
                ? 'Past meetings will appear here' 
                : 'Meeting recordings will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex justify-between items-center">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${activeTab === 'upcoming' ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                  <VideoCameraIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{meeting.description || 'No description'}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(meeting.scheduledStartTime || meeting.createdAt).toLocaleString()}
                    </span>
                    {meeting.status === 'active' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium animate-pulse">
                        Live Now
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => router.push(`/meetings/${meeting.id}`)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition"
                  >
                    {meeting.status === 'active' ? 'Join Now' : 'Start'}
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/meetings/${meeting.id}`);
                    alert('Link copied!');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition"
                >
                  Copy Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
