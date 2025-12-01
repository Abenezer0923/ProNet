'use client';

import { useEffect, useState, useRef, FormEvent, ChangeEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useCommunitySocket } from '@/hooks/useCommunitySocket';
import ArticleCard from '@/components/articles/ArticleCard';
import GroupMessage from '@/components/community/GroupMessage';
import PinnedMessages from '@/components/community/PinnedMessages';
import StartMeetingButton from '@/components/communities/StartMeetingButton';
import PostCard from '@/components/posts/PostCard';
import { PhotoIcon } from '@heroicons/react/24/outline';
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
import { Logo } from '@/components/Logo';

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
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [isPostingSubmitting, setIsPostingSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleMessageReceived = useCallback((message: any) => {
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
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  // WebSocket connection
  const { isConnected, sendMessage: sendSocketMessage, startTyping, stopTyping, typingUsers } = useCommunitySocket({
    groupId: selectedGroup?.id || null,
    onMessageReceived: handleMessageReceived,
  });

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

  useEffect(() => {
    if (activeTab === 'posts' && communityId) {
      fetchPosts();
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
      // Messages come in ASC order (oldest first) from backend
      setMessages(response.data);
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

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/posts?communityId=${communityId}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postContent.trim() && !postImage) return;

    setIsPostingSubmitting(true);
    try {
      let imageUrl = '';

      // Upload image if selected
      if (postImage) {
        const formData = new FormData();
        formData.append('file', postImage);

        const uploadResponse = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadResponse.data.url;
      }

      const postData: any = {
        content: postContent,
        communityId,
        visibility: 'community',
      };

      if (imageUrl) {
        postData.images = [imageUrl];
      }

      await api.post('/posts', postData);

      setPostContent('');
      setPostImage(null);
      fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create post';
      alert(errorMessage);
    } finally {
      setIsPostingSubmitting(false);
    }
  };

  const handlePostImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPostImage(e.target.files[0]);
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
              <Link href="/dashboard">
                <Logo />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Cover Photo */}
      <div className="relative group">
        <div
          className="h-80 w-full bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 relative overflow-hidden"
          style={{
            backgroundImage: community.coverImage ? `url(${community.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!community.coverImage && (
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Community Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-32 flex flex-col md:flex-row items-end gap-8 pb-8">
            {/* Logo Section */}
            <div className="relative z-10">
              {community.logo ? (
                <div className="relative group/logo">
                  <div className="absolute inset-0 bg-black/20 rounded-3xl blur-xl transform translate-y-4"></div>
                  <img
                    src={community.logo}
                    alt={community.name}
                    className="relative w-48 h-48 rounded-3xl border-[6px] border-white shadow-2xl object-cover bg-white transition-transform duration-300 transform hover:scale-105 hover:rotate-3"
                  />
                </div>
              ) : (
                <div className="relative w-48 h-48 group/logo cursor-default">
                  <div className="absolute inset-0 bg-black/20 rounded-3xl blur-xl transform translate-y-4"></div>
                  <div className="relative w-full h-full bg-primary-800 rounded-3xl flex items-center justify-center transform rotate-3 transition-transform duration-300 hover:rotate-6 hover:scale-105 shadow-2xl border-[6px] border-white">
                    <div className="w-[85%] h-[85%] border-2 border-primary-300/30 rounded-2xl transform -rotate-6 flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
                      <span className="font-bold text-white text-6xl tracking-tighter drop-shadow-lg">
                        {community.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 text-white md:mb-2 z-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight">
                  {community.name}
                </h1>
                <p className="text-white/90 text-xl font-medium max-w-2xl leading-relaxed drop-shadow-md line-clamp-2">
                  {community.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                  <UsersIcon className="w-5 h-5 text-primary-200" />
                  <span className="font-semibold text-white">{community.members?.length || 0}</span>
                  <span className="text-primary-100 text-sm">members</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm capitalize">
                  <span className={`w-2.5 h-2.5 rounded-full ${community.privacy === 'public' ? 'bg-green-400' : 'bg-amber-400'} shadow-[0_0_8px_rgba(74,222,128,0.5)]`}></span>
                  <span className="font-medium text-white">{community.privacy} Group</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4 md:mt-0 md:mb-4">
              {isMember ? (
                <>
                  <button
                    onClick={handleLeaveCommunity}
                    className="px-6 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-white hover:text-red-600 font-semibold shadow-sm transition-all duration-200"
                  >
                    Leave
                  </button>
                  {['owner', 'admin'].includes(userRole) && (
                    <Link
                      href={`/communities/${communityId}/settings`}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
                    >
                      Settings
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={handleJoinCommunity}
                  className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg hover:shadow-primary-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
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
                  py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap flex items-center
                  ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
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
                      className="text-primary-600 hover:text-primary-700 p-1 hover:bg-primary-50 rounded-full transition"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value)}
                      placeholder="Category (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <select
                      value={newGroupType}
                      onChange={(e) => setNewGroupType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="chat">Chat</option>
                      <option value="announcement">Announcement</option>
                      <option value="meeting">Meeting</option>
                      <option value="mentorship">Mentorship</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
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
                              return 'text-accent-orange-600 bg-accent-orange-50';
                            case 'meeting':
                              return 'text-primary-600 bg-primary-50';
                            case 'mentorship':
                              return 'text-accent-green-600 bg-accent-green-50';
                            default:
                              return 'text-gray-600 bg-gray-100';
                          }
                        };

                        return (
                          <button
                            key={group.id}
                            onClick={() => setSelectedGroup(group)}
                            className={`
                              w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-3
                              ${selectedGroup?.id === group.id
                                ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                          >
                            <span className={`p-1.5 rounded-lg ${selectedGroup?.id === group.id ? 'bg-primary-100 text-primary-700' : getGroupColor()}`}>
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
                  <div className="p-6 bg-primary-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-1">{community.members?.length || 0}</div>
                    <div className="text-sm font-medium text-gray-600">Members</div>
                  </div>
                  <div className="p-6 bg-accent-orange-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-accent-orange-600 mb-1">{community.groups?.length || 0}</div>
                    <div className="text-sm font-medium text-gray-600">Groups</div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-gray-700 mb-1 capitalize">{community.privacy}</div>
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
                        <button onClick={handleJoinCommunity} className="mt-4 text-primary-600 font-semibold hover:underline">
                          Join Now
                        </button>
                      </div>
                    )}

                    {isMember && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-primary-50 to-accent-orange-50 rounded-xl p-6 border border-primary-100">
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
                          <span className="text-primary-500">#</span> {selectedGroup.name}
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
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || !isMember}
                          className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Group</h3>
                <p className="text-gray-500 max-w-sm">Choose a group from the sidebar to start chatting with other community members.</p>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-6">
                {/* Create Post - Only for Community Owner */}
                {isMember && userRole === 'owner' && (
                  <div className="bg-gradient-to-br from-white via-white to-primary-50/30 rounded-2xl shadow-lg border-2 border-primary-100/50 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Create Post</h3>
                    <form onSubmit={handleCreatePost}>
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Share something with your community..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-primary-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white resize-none"
                      />

                      {postImage && (
                        <div className="mt-4 relative inline-block group">
                          <img
                            src={URL.createObjectURL(postImage)}
                            alt="Selected"
                            className="h-32 w-auto rounded-xl border-2 border-primary-100 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => setPostImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transform"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <button
                          type="button"
                          onClick={() => postImageInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition"
                        >
                          <PhotoIcon className="w-5 h-5" />
                          <span className="font-medium">Add Photo</span>
                        </button>

                        <button
                          type="submit"
                          disabled={(!postContent.trim() && !postImage) || isPostingSubmitting}
                          className={`px-6 py-2.5 rounded-xl font-semibold transition ${(!postContent.trim() && !postImage) || isPostingSubmitting
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-700 hover:to-primary-900 shadow-lg hover:shadow-xl'
                            }`}
                        >
                          {isPostingSubmitting ? 'Posting...' : 'Share Post'}
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={postImageInputRef}
                        onChange={handlePostImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                    </form>
                  </div>
                )}

                {/* Posts Feed */}
                {isMember ? (
                  posts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                      <NewspaperIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-500">
                        {userRole === 'owner'
                          ? 'Be the first to share something with your community!'
                          : 'The community owner hasn\'t posted anything yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onPostUpdated={fetchPosts}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <NewspaperIcon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Join to see posts</h3>
                    <p className="text-gray-500 mb-4">Become a member to view and interact with community posts</p>
                    <button
                      onClick={handleJoinCommunity}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold shadow-sm"
                    >
                      Join Community
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
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg border border-primary-200">
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
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm font-medium"
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
