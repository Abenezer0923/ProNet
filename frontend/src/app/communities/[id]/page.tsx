'use client';

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useCommunitySocket } from '@/hooks/useCommunitySocket';

type TabType = 'home' | 'groups' | 'posts' | 'members';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // WebSocket connection
  const { isConnected, sendMessage: sendSocketMessage, startTyping, stopTyping, typingUsers } = useCommunitySocket({
    groupId: selectedGroup?.id || null,
    onMessageReceived: (message) => {
      setMessages((prev: Message[]) => [...prev, message]);
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
      console.log('Selected group changed, fetching messages for:', selectedGroup.id);
      setMessages([]); // Clear previous messages
      fetchMessages();
    }
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      console.log('Fetching messages for group:', selectedGroup.id);
      const response = await api.get(`/communities/groups/${selectedGroup.id}/messages`);
      console.log('Received messages:', response.data.length);
      // Messages come in DESC order, reverse for display (oldest first)
      const reversedMessages = response.data.reverse();
      setMessages(reversedMessages);
      console.log('Messages set:', reversedMessages.length);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await api.post(`/communities/${communityId}/join`);
      setIsMember(true);
      fetchCommunity();
    } catch (error) {
      console.error('Error joining community:', error);
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

    console.log('Sending message:', newMessage, 'via', isConnected ? 'WebSocket' : 'HTTP');

    try {
      // Send via WebSocket if connected, otherwise use HTTP
      if (isConnected) {
        console.log('Sending via WebSocket to group:', selectedGroup.id);
        sendSocketMessage(newMessage);
        console.log('Message sent via WebSocket');
      } else {
        console.log('Sending via HTTP to group:', selectedGroup.id);
        const response = await api.post(`/communities/groups/${selectedGroup.id}/messages`, {
          content: newMessage,
        });
        console.log('Message saved via HTTP:', response.data);
        setMessages((prev: Message[]) => [...prev, response.data]);
      }
      setNewMessage('');
      stopTyping();
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      alert(errorMessage);

      // If not a member, refresh community data
      if (errorMessage.includes('member')) {
        fetchCommunity();
      }
    }
  };

  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Start typing indicator
    if (e.target.value && isConnected) {
      startTyping();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else if (!e.target.value) {
      stopTyping();
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
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'groups', label: 'Groups', icon: '💬' },
    { id: 'posts', label: 'Posts', icon: '📱' },
    { id: 'members', label: 'Members', icon: '👥' },
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
      {/* Cover Photo */}
      <div className="relative">
        <div
          className="h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          style={{
            backgroundImage: community.coverImage ? `url(${community.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Community Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16">
            <div className="flex items-end space-x-5">
              <div className="relative">
                <img
                  src={community.logo || `https://ui-avatars.com/api/?name=${community.name}&size=128&background=4F46E5&color=fff`}
                  alt={community.name}
                  className="w-32 h-32 rounded-lg border-4 border-white shadow-xl object-cover"
                />
              </div>

              <div className="flex-1 pb-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                      <p className="text-gray-600 mt-2">{community.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {community.members?.length || 0} members
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {community.privacy}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {isMember ? (
                        <>
                          <button
                            onClick={handleLeaveCommunity}
                            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-semibold transition"
                          >
                            Leave
                          </button>
                          {['owner', 'admin'].includes(userRole) && (
                            <Link
                              href={`/communities/${communityId}/settings`}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-semibold transition"
                            >
                              Settings
                            </Link>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={handleJoinCommunity}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-semibold transition"
                        >
                          Join Community
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Groups */}
          {activeTab === 'groups' && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Groups</h3>
                  {['owner', 'admin', 'moderator'].includes(userRole) && (
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      + Add
                    </button>
                  )}
                </div>

                {showCreateGroup && (
                  <form onSubmit={handleCreateGroup} className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name"
                      className="w-full px-3 py-2 border rounded-md mb-2"
                      required
                    />
                    <input
                      type="text"
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value)}
                      placeholder="Category (optional)"
                      className="w-full px-3 py-2 border rounded-md mb-2"
                    />
                    <select
                      value={newGroupType}
                      onChange={(e) => setNewGroupType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md mb-2"
                    >
                      <option value="chat">Chat</option>
                      <option value="announcement">Announcement</option>
                      <option value="meeting">Meeting</option>
                      <option value="mentorship">Mentorship</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateGroup(false)}
                        className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {(Object.entries(groupsByCategory) as [string, Group[]][]).map(([category, groups]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {category}
                    </h4>
                    <div className="space-y-1">
                      {groups.map((group: Group) => (
                        <button
                          key={group.id}
                          onClick={() => setSelectedGroup(group)}
                          className={`
                            w-full text-left px-3 py-2 rounded-md text-sm transition
                            ${selectedGroup?.id === group.id
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {group.type === 'announcement' ? '📢' :
                                group.type === 'meeting' ? '🎥' :
                                  group.type === 'mentorship' ? '🤝' : '💬'}
                            </span>
                            <span className="truncate">{group.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'home' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-4">Welcome to {community.name}</h2>
                <p className="text-gray-600 mb-6">{community.description}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-3xl font-bold text-indigo-600">{community.members?.length || 0}</div>
                    <div className="text-sm text-gray-600">Members</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{community.groups?.length || 0}</div>
                    <div className="text-sm text-gray-600">Groups</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="text-3xl font-bold text-pink-600">{community.privacy}</div>
                    <div className="text-sm text-gray-600">Privacy</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'groups' && selectedGroup && (
              <div className="bg-white rounded-lg shadow-sm flex flex-col h-[calc(100vh-300px)]">
                {/* Group Header */}
                <div className="p-4 border-b">
                  <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                  {selectedGroup.description && (
                    <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message: Message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {message.author?.firstName?.[0]}{message.author?.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-sm">
                              {message.author?.firstName} {message.author?.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex gap-3 items-center text-gray-500 text-sm italic">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span>Someone is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                  <div className="flex items-center gap-2">
                    {/* Connection Status */}
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />

                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      disabled={!isMember}
                      className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!isMember ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !isMember}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                  {!isMember && (
                    <p className="text-xs text-yellow-600 mt-2 text-center">
                      ⚠️ Join this community to participate in group chats
                    </p>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'groups' && !selectedGroup && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">Select a group to start chatting</p>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Community Posts</h2>
                {isMember ? (
                  <div className="space-y-6">
                    {/* Create Post */}
                    <div className="border-b pb-6">
                      <textarea
                        placeholder="Share something with the community..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <div className="flex justify-end mt-3">
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Posts Feed */}
                    <div className="text-center py-12 text-gray-500">
                      <p>No posts yet. Be the first to share something!</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Join the community to see and create posts</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Members</h2>
                <div className="space-y-3">
                  {community.members?.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                          {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {member.user?.firstName} {member.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
