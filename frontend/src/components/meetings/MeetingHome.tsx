'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard';
import MeetingList from './MeetingList';
import CreateMeetingModal from './CreateMeetingModal';
import { 
  PlusIcon, 
  CalendarIcon, 
  VideoCameraIcon, 
  PlayCircleIcon 
} from '@heroicons/react/24/outline';

interface MeetingHomeProps {
  groupId: string;
  groupName: string;
  isMember: boolean;
}

export default function MeetingHome({ groupId, groupName, isMember }: MeetingHomeProps) {
  const router = useRouter();
  const [modalState, setModalState] = useState<'instant' | 'schedule' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateString = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  const handleMeetingCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-[200px] w-full rounded-[20px] bg-gradient-to-r from-primary-900 to-primary-700 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
        <div className="relative h-full flex flex-col justify-between p-8 text-white">
          <div className="bg-white/20 backdrop-blur-md w-fit px-4 py-1 rounded-lg text-sm font-medium">
            {groupName} Meeting Room
          </div>
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight">{timeString}</h1>
            <p className="text-lg font-medium text-primary-100 mt-2">{dateString}</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      {isMember ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <HomeCard
            icon={<PlusIcon className="w-7 h-7 text-white" />}
            title="New Meeting"
            description="Start an instant meeting"
            handleClick={() => setModalState('instant')}
            color="bg-orange-500"
          />
          <HomeCard
            icon={<CalendarIcon className="w-7 h-7 text-white" />}
            title="Schedule Meeting"
            description="Plan your meeting"
            handleClick={() => setModalState('schedule')}
            color="bg-blue-500"
          />
          <HomeCard
            icon={<VideoCameraIcon className="w-7 h-7 text-white" />}
            title="Join Meeting"
            description="via invitation link"
            handleClick={() => {
              const link = prompt('Enter meeting link or ID:');
              if (link) {
                // Extract ID if full URL, or use as ID
                const id = link.split('/').pop();
                router.push(`/meetings/${id}`);
              }
            }}
            color="bg-purple-500"
          />
          <HomeCard
            icon={<PlayCircleIcon className="w-7 h-7 text-white" />}
            title="Recordings"
            description="Check out recordings"
            handleClick={() => {
              // Logic to scroll to recordings tab or navigate
              const recordingsTab = document.querySelector('button[text="recordings"]');
              if (recordingsTab) (recordingsTab as HTMLElement).click();
            }}
            color="bg-yellow-500"
          />
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">Join Community to Participate</h3>
          <p className="text-gray-500 mt-2">You need to be a member of this community to start or join meetings.</p>
        </div>
      )}

      {/* Meeting List */}
      <MeetingList key={refreshKey} groupId={groupId} />

      {/* Modals */}
      <CreateMeetingModal
        isOpen={!!modalState}
        onClose={() => setModalState(null)}
        groupId={groupId}
        groupName={groupName}
        initialType={modalState || 'instant'}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  );
}
