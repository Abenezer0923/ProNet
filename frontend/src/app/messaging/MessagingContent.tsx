'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/hooks/useChat';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function MessagingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const { user, loading: authLoading } = useAuth();
    const { isConnected } = useSocket();
    const {
        conversations,
        selectedConversation,
        messages,
        loading,
        selectConversation,
        sendMessage,
        getOtherParticipant,
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    const [targetUser, setTargetUser] = useState<any>(null);
    const [loadingTargetUser, setLoadingTargetUser] = useState(false);

    useEffect(() => {
        setTargetUser(null);
        setIsCreatingConversation(false);
    }, [userId]);

    const fetchUserInfo = useCallback(async (userId: string) => {
        setLoadingTargetUser(true);
        try {
            const response = await api.get(`/users/profile/${userId}`);
            setTargetUser(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
            alert('Failed to load user information');
            router.push('/messaging');
        } finally {
            setLoadingTargetUser(false);
            setIsCreatingConversation(false);
        }
    }, [router]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Handle userId parameter - find existing conversation or show prompt to start new one
    useEffect(() => {
        if (!userId || loading || selectedConversation) return;

        // Find existing conversation with this user
        const existingConversation = conversations.find((conv) => {
            const otherUser = getOtherParticipant(conv);
            return otherUser?.id === userId;
        });

        if (existingConversation) {
            selectConversation(existingConversation);
            return;
        }

        if (targetUser || isCreatingConversation) return;

        setIsCreatingConversation(true);
        fetchUserInfo(userId);
    }, [userId, conversations, loading, selectedConversation, isCreatingConversation, targetUser, getOtherParticipant, selectConversation, fetchUserInfo]);

    const startConversationWithMessage = async (message: string) => {
        if (!targetUser) return;

        try {
            const response = await api.post('/chat/conversations', {
                participantId: targetUser.id,
            });
            selectConversation(response.data);
            // Send the first message
            await sendMessage(message);
            setTargetUser(null);
        } catch (error: any) {
            console.error('Error starting conversation:', error);
            alert(`Failed to start conversation: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        sendMessage(newMessage);
        setNewMessage('');
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Messaging</h1>
                        <p className="text-sm text-gray-500">Stay connected with your network in real time.</p>
                    </div>
                    <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${isConnected
                            ? 'bg-green-50 border-green-100 text-green-600'
                            : 'bg-red-50 border-red-100 text-red-600'
                            }`}
                    >
                        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span>{isConnected ? 'Connected' : 'Reconnecting…'}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row min-h-[500px] md:h-[650px]">
                        {/* Conversations List */}
                        <aside className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100">
                            <div className="flex flex-col h-64 md:h-full">
                                <div className="p-4 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
                                    <p className="text-xs text-gray-500 mt-1">Your recent conversations</p>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {conversations.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500">
                                            <p className="font-medium">No conversations yet</p>
                                            <Link
                                                href="/connections"
                                                className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
                                            >
                                                Start chatting with your connections
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {conversations.map((conversation) => {
                                                const otherUser = getOtherParticipant(conversation);
                                                if (!otherUser) return null;

                                                return (
                                                    <button
                                                        key={conversation.id}
                                                        onClick={() => selectConversation(conversation)}
                                                        className={`w-full px-4 py-3 text-left transition-smooth hover:bg-primary-50/60 focus:outline-none ${selectedConversation?.id === conversation.id ? 'bg-primary-50/80' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white font-semibold flex items-center justify-center flex-shrink-0">
                                                                {otherUser.firstName[0]}{otherUser.lastName[0]}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="font-semibold text-gray-900 truncate">
                                                                        {otherUser.firstName} {otherUser.lastName}
                                                                    </p>
                                                                    {conversation.unreadCount > 0 && (
                                                                        <span className="bg-primary-600 text-white text-[11px] rounded-full px-2 py-0.5">
                                                                            {conversation.unreadCount}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {conversation.lastMessage && (
                                                                    <p className="text-sm text-gray-500 truncate">
                                                                        {conversation.lastMessage.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Messages Area */}
                        <section className="flex-1 flex flex-col">
                            {selectedConversation ? (
                                <>
                                    <header className="p-4 border-b border-gray-100 bg-white/60 backdrop-blur">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center">
                                                {getOtherParticipant(selectedConversation)?.firstName[0]}
                                                {getOtherParticipant(selectedConversation)?.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {getOtherParticipant(selectedConversation)?.firstName}{' '}
                                                    {getOtherParticipant(selectedConversation)?.lastName}
                                                </p>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-gray-50">
                                        {messages.map((message) => {
                                            const isOwn = message.senderId === user?.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] md:max-w-[65%] px-4 py-3 rounded-2xl shadow-sm ${isOwn
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-white text-gray-900 border border-gray-100'
                                                            }`}
                                                    >
                                                        <p className="text-sm sm:text-base break-words">{message.content}</p>
                                                        <p
                                                            className={`text-[11px] mt-2 ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}
                                                        >
                                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <footer className="p-4 border-t border-gray-100 bg-white">
                                        <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || !isConnected}
                                                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-smooth ${!newMessage.trim() || !isConnected
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600'
                                                    }`}
                                            >
                                                Send
                                            </button>
                                        </form>
                                    </footer>
                                </>
                            ) : loadingTargetUser ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                                </div>
                            ) : targetUser ? (
                                <>
                                    <header className="p-4 border-b border-gray-100 bg-white/60 backdrop-blur">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center">
                                                {targetUser.firstName[0]}{targetUser.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {targetUser.firstName} {targetUser.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">Start a conversation</p>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="flex-1 flex items-center justify-center px-6 text-center bg-gray-50">
                                        <div className="max-w-sm">
                                            <p className="text-lg font-medium text-gray-900 mb-1">Say hello 👋</p>
                                            <p className="text-sm text-gray-500">
                                                Send a message to start chatting with {targetUser.firstName}.
                                            </p>
                                        </div>
                                    </div>

                                    <footer className="p-4 border-t border-gray-100 bg-white">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (newMessage.trim()) {
                                                    startConversationWithMessage(newMessage);
                                                    setNewMessage('');
                                                }
                                            }}
                                            className="flex flex-col sm:flex-row gap-3"
                                        >
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your first message..."
                                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || !isConnected}
                                                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-smooth ${!newMessage.trim() || !isConnected
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600'
                                                    }`}
                                            >
                                                Send
                                            </button>
                                        </form>
                                    </footer>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                                    <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-2xl font-semibold">
                                        💬
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">Select a conversation</p>
                                        <p className="text-sm text-gray-500">Choose someone from your inbox to start messaging.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
