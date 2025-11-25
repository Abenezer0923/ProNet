import MeetingRoom from '@/components/communities/MeetingRoom';

export default function MeetingPage({ params }: { params: { meetingId: string } }) {
    return <MeetingRoom meetingId={params.meetingId} />;
}
