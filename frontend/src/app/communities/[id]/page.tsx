'use client';

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useCommunitySocket } from '@/hooks/useCommunitySocket';
import ArticleCard from '@/components/articles/ArticleCard';
import GroupMessage from '@/components/community/GroupMessage';
import PinnedMessages from '@/components/community/PinnedMessages';
import StartMeetingButton from '@/components/communities/StartMeetingButton';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  NewspaperIcon,
  UsersIcon,
  HomeIcon,
  ArrowLeftIcon,
  PlusIcon,
  PaperAirplaneIcon,
  MegaphoneIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

type TabType = 'home' | 'groups' | 'posts' | 'members' | 'articles';

interface Community {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  logo?: string;
  privacy: string;
  memberCount: number;
  owner: any;
  members: any[];
  groups: Group[];
}

interface Group {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  privacy: string;
  position: number;
}

interface Message {
  id: string;
  content: string;
  author: any;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isPinned: boolean;
  reactions: any[];
  attachments?: any[];
  parentMessageId?: string;
}

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const communityId = params?.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('chat');
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // WebSocket connection
  const { isConnected, sendMessage: sendSocketMessage, startTyping, stopTyping, typingUsers } = useCommunitySocket({
    groupId: selectedGroup?.id || null,
    onMessageReceived: (message: any) => {
      // Ensure message has all required fields
      const fullMessage: Message = {
        ...message,
        updatedAt: message.updatedAt || message.createdAt,
        isEdited: message.isEdited || false,
        isPinned: message.isPinned || false,
        reactions: message.reactions || [],
        attachments: message.attachments || [],
        parentMessageId: message.parentMessageId || undefined,
      };
      setMessages((prev: Message[]) => [...prev, fullMessage]);
      scrollToBottom();
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  useEffect(() => {
    if (!community) {
      setIsMember(false);
      setUserRole('');
      return;
    }

    if (!user) {
      setIsMember(false);
      setUserRole('');
      return;
    }

    const member = community.members?.find((m: any) => {
      return m.user?.id === user.id || m.userId === user.id;
    });

    setIsMember(!!member);
    setUserRole(member?.role || '');
  }, [community, user]);

  useEffect(() => {
    if (selectedGroup) {
      setMessages([]); // Clear previous messages
      fetchMessages();
    }
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'articles' && communityId) {
      fetchArticles();
    }
  }, [activeTab, communityId]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${communityId}`);
      setCommunity(response.data);
    } catch (error) {
      console.error('Error fetching community:', error);
      router.push('/communities');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedGroup) return;
    try {
      const response = await api.get(`/communities/groups/${selectedGroup.id}/messages`);
      // Messages come in DESC order, reverse for display (oldest first)
      const reversedMessages = response.data.reverse();
      setMessages(reversedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await api.get(`/communities/${communityId}/articles`);
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await api.post(`/communities/${communityId}/join`);
      // Optimistic update
      setIsMember(true);
      fetchCommunity(); // Refresh to get updated member count/list
    } catch (error: any) {
      console.error('Error joining community:', error);
      console.log('Error response status:', error.response?.status);

      // If already a member (403), update state anyway
      if (error.response && error.response.status === 403) {
        console.log('User already a member (403), updating UI state...');
        setIsMember(true);
        fetchCommunity();
        return;
      }

      alert('Failed to join community. Please try again.');
    }
  };

  const handleLeaveCommunity = async () => {
    if (!confirm('Are you sure you want to leave this community?')) return;

    try {
      await api.post(`/communities/${communityId}/leave`);
      setIsMember(false);
      setUserRole('');
      fetchCommunity();
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  const handleCreateGroup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post(`/communities/${communityId}/groups`, {
        name: newGroupName,
        type: newGroupType,
        category: newGroupCategory || 'General',
        privacy: 'public',
      });
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupType('chat');
      setNewGroupCategory('');
      fetchCommunity();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    if (!isMember) {
      alert('Join this community to participate in group chats.');
      return;
    }

    try {
      // Send via WebSocket if connected, otherwise use HTTP
      if (isConnected) {
        sendSocketMessage(newMessage);
      } else {
        const response = await api.post(`/communities/groups/${selectedGroup.id}/messages`, {
          content: newMessage,
        });
        // Ensure response has all required fields
        const fullMessage: Message = {
          ...response.data,
          updatedAt: response.data.updatedAt || response.data.createdAt,
          isEdited: response.data.isEdited || false,
          isPinned: response.data.isPinned || false,
          reactions: response.data.reactions || [],
          attachments: response.data.attachments || [],
          parentMessageId: response.data.parentMessageId || undefined,
        };
        setMessages((prev: Message[]) => [...prev, fullMessage]);
      }
      setNewMessage('');
      stopTyping();
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      alert(errorMessage);

      if (errorMessage.includes('member')) {
        fetchCommunity();
      }
    }
  };

  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (e.target.value && isConnected) {
      startTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else if (!e.target.value) {
      stopTyping();
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    if (!selectedGroup) return;
    try {
      await api.put(`/communities/groups/${selectedGroup.id}/messages/${messageId}`, {
        content,
      });
      await fetchMessages();
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message');
    }
  };

  const handlePinMessage = async (messageId: string) => {
    if (!selectedGroup) return;
    try {
      const message = messages.find((m) => m.id === messageId);
      if (message?.isPinned) {
        await api.delete(`/communities/groups/${selectedGroup.id}/messages/${messageId}/pin`);
      } else {
        await api.post(`/communities/groups/${selectedGroup.id}/messages/${messageId}/pin`);
      }
      await fetchMessages();
    } catch (error) {
      console.error('Error pinning message:', error);
      alert('Failed to pin message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!community) return null;

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'groups', label: 'Groups', icon: ChatBubbleLeftRightIcon },
    { id: 'posts', label: 'Posts', icon: NewspaperIcon },
    { id: 'articles', label: 'Articles', icon: NewspaperIcon },
    { id: 'members', label: 'Members', icon: UsersIcon },
  ];

  const groupsByCategory = (community.groups || []).reduce<Record<string, Group[]>>(
    (acc: Record<string, Group[]>, group: Group) => {
      const category = group.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(group);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/communities" className="flex items-center text-gray-500 hover:text-gray-700 transition">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Communities
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">ProNet</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Cover Photo */}
      <div className="relative">
        <div
          className="h-64 bg-gradient-to-r from-indigo-600 to-purple-600"
          style={{
            backgroundImage: community.coverImage ? `url(${community.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        {/* Community Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 flex flex-col md:flex-row items-start md:items-end gap-6 pb-6">
            <div className="relative">
              <img
                src={community.logo || `https://ui-avatars.com/api/?name=${community.name}&size=160&background=random`}
                alt={community.name}
                className="w-40 h-40 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
              />
            </div>

            <div className="flex-1 text-white md:text-gray-900 md:mb-4">
              <h1 className="text-3xl font-bold drop-shadow-md md:drop-shadow-none">{community.name}</h1>
              <p className="text-white/90 md:text-gray-600 mt-1 text-lg drop-shadow-md md:drop-shadow-none max-w-2xl">
                {community.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm font-medium text-white/90 md:text-gray-500">
                <span className="flex items-center gap-1 bg-black/20 md:bg-transparent px-2 py-1 rounded-full md:p-0 backdrop-blur-sm md:backdrop-blur-none">
                  <UsersIcon className="w-4 h-4" />
                  {community.members?.length || 0} members
                </span>
                <span className="flex items-center gap-1 bg-black/20 md:bg-transparent px-2 py-1 rounded-full md:p-0 backdrop-blur-sm md:backdrop-blur-none capitalize">
                  {community.privacy} Group
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4 md:mt-0 md:mb-4">
              {isMember ? (
                <>
                  <button
                    onClick={handleLeaveCommunity}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold shadow-sm transition"
                  >
                    Leave
                  </button>
                  {['owner', 'admin'].includes(userRole) && (
                    <Link
                      href={`/communities/${communityId}/settings`}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm transition"
                    >
                      Settings
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={handleJoinCommunity}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap flex items-center
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Groups (Only visible on Groups tab or desktop) */}
          {(activeTab === 'groups') && (
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-32">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">Groups</h3>
                  {['owner', 'admin', 'moderator'].includes(userRole) && (
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="text-indigo-600 hover:text-indigo-700 p-1 hover:bg-indigo-50 rounded-full transition"
                      title="Create Group"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {showCreateGroup && (
                  <form onSubmit={handleCreateGroup} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value)}
                      placeholder="Category (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <select
                      value={newGroupType}
                      onChange={(e) => setNewGroupType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="chat">Chat</option>
                      <option value="announcement">Announcement</option>
                      <option value="meeting">Meeting</option>
                      <option value="mentorship">Mentorship</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateGroup(false)}
                        className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {(Object.entries(groupsByCategory) as [string, Group[]][]).map(([category, groups]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                      {category}
                    </h4>
                    <div className="space-y-1">
                      {groups.map((group: Group) => {
                        // Get icon and color based on group type
                        const getGroupIcon = () => {
                          switch (group.type) {
                            case 'announcement':
                              return <MegaphoneIcon className="w-5 h-5" />;
                            case 'meeting':
                              return <VideoCameraIcon className="w-5 h-5" />;
                            case 'mentorship':
                              return <AcademicCapIcon className="w-5 h-5" />;
                            default:
                              return <HashtagIcon className="w-5 h-5" />;
                          }
                        };

                        const getGroupColor = () => {
                          switch (group.type) {
                            case 'announcement':
                              return 'text-orange-600 bg-orange-50';
                            case 'meeting':
                              return 'text-purple-600 bg-purple-50';
                            case 'mentorship':
                              return 'text-green-600 bg-green-50';
                            default:
                              return 'text-indigo-600 bg-indigo-50';
                          }
                        };

                        return (
                          <button
                            key={group.id}
                            onClick={() => setSelectedGroup(group)}
                            className={`
                              w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-3
                              ${selectedGroup?.id === group.id
                                ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                          >
                            <span className={`p-1.5 rounded-lg ${selectedGroup?.id === group.id ? 'bg-indigo-100 text-indigo-700' : getGroupColor()}`}>
                              {getGroupIcon()}
                            </span>
                            <span className="truncate">{group.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'home' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About {community.name}</h2>
                  <p className="text-gray-600 leading-relaxed">{community.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="p-6 bg-indigo-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{community.members?.length || 0}</div>
                    <div className="text-sm font-medium text-gray-600">Members</div>
                  </div>
                  <div className="p-6 bg-purple-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{community.groups?.length || 0}</div>
                    <div className="text-sm font-medium text-gray-600">Groups</div>
                  </div>
                  <div className="p-6 bg-pink-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-1 capitalize">{community.privacy}</div>
                    <div className="text-sm font-medium text-gray-600">Privacy</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'groups' && selectedGroup && (
              <>
                {selectedGroup.type === 'meeting' ? (
                  // Meeting Room UI
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <span className="text-2xl">🎥</span> {selectedGroup.name}
                        </h2>
                        {selectedGroup.description && (
                          <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                        )}
                      </div>
                      {isMember && (
                        <StartMeetingButton
                          groupId={selectedGroup.id}
                          groupName={selectedGroup.name}
                        />
                      )}
                    </div>

                    {!isMember && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">Join the community to start or join meetings</p>
                        <button onClick={handleJoinCommunity} className="mt-4 text-indigo-600 font-semibold hover:underline">
                          Join Now
                        </button>
                      </div>
                    )}

                    {isMember && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                          <h3 className="font-semibold text-gray-900 mb-2">About Meeting Rooms</h3>
                          <p className="text-gray-600 text-sm">
                            Start instant video meetings with up to 100 participants. Features include screen sharing,
                            recording, breakout rooms, polls, and Q&A.
                          </p>
                        </div>

                        {/* Upcoming/Active Meetings List */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Recent Meetings</h3>
                          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm">No recent meetings</p>
                            <p className="text-xs mt-1">Click "Start Meeting" to create a new meeting room</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular Chat UI
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    {/* Pinned Messages Bar */}
                    <PinnedMessages
                      groupId={selectedGroup.id}
                      isAdmin={['owner', 'admin', 'moderator'].includes(userRole)}
                      onUnpin={fetchMessages}
                    />

                    {/* Group Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span className="text-indigo-500">#</span> {selectedGroup.name}
                        </h2>
                        {selectedGroup.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{selectedGroup.description}</p>
                        )}
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ChatBubbleLeftRightIcon className="w-12 h-12 mb-2 opacity-50" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message: Message) => (
                          <GroupMessage
                            key={message.id}
                            message={message}
                            groupId={selectedGroup.id}
                            currentUserId={user?.id || ''}
                            isAdmin={['owner', 'admin', 'moderator'].includes(userRole)}
                            onEdit={handleEditMessage}
                            onPin={handlePinMessage}
                            onRefresh={fetchMessages}
                          />
                        ))
                      )}

                      {/* Typing Indicator */}
                      {typingUsers.length > 0 && (
                        <div className="flex gap-2 items-center text-gray-400 text-xs ml-12">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span>Someone is typing...</span>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={handleTyping}
                          placeholder={isMember ? `Message #${selectedGroup.name}` : "Join community to chat"}
                          disabled={!isMember}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || !isMember}
                          className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'groups' && !selectedGroup && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center h-[600px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Group</h3>
                <p className="text-gray-500 max-w-sm">Choose a group from the sidebar to start chatting with other community members.</p>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-6">Community Posts</h2>
                {isMember ? (
                  <div className="space-y-8">
                    {/* Create Post */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <textarea
                        placeholder="Share something with the community..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      />
                      <div className="flex justify-end mt-3">
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Posts Feed */}
                    <div className="text-center py-12 text-gray-500">
                      <NewspaperIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No posts yet. Be the first to share something!</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">Join the community to see and create posts</p>
                    <button onClick={handleJoinCommunity} className="mt-4 text-indigo-600 font-semibold hover:underline">
                      Join Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <UsersIcon className="w-6 h-6 text-gray-400" />
                  Members
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {community.members?.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-200">
                        {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize px-2 py-0.5 bg-gray-100 rounded-full inline-block mt-1">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
                  {isMember && (
                    <Link
                      href={`/communities/${communityId}/articles/new`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                    >
                      Write Article
                    </Link>
                  )}
                </div>

                <div className="grid gap-6">
                  {articles.length > 0 ? (
                    articles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        communityId={communityId}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                      <NewspaperIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 text-lg font-medium">No articles yet.</p>
                      {isMember && (
                        <p className="text-gray-400 mt-2">
                          Be the first to share your knowledge!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
