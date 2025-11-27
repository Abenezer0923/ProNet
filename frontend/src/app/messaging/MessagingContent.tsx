'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/hooks/useChat';
import { api } from '@/lib/api';

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

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Handle userId parameter - find existing conversation or show prompt to start new one
    useEffect(() => {
        if (!userId || loading || selectedConversation || isCreatingConversation) return;

        // Find existing conversation with this user
        const existingConversation = conversations.find((conv) => {
            const otherUser = getOtherParticipant(conv);
            return otherUser?.id === userId;
        });

        if (existingConversation) {
            selectConversation(existingConversation);
        } else if (!loading) {
            // Set a flag to show "start conversation" UI
            setIsCreatingConversation(true);
            // Fetch the user info to show in the UI
            fetchUserInfo(userId);
        }
    }, [userId, conversations, loading, selectedConversation, isCreatingConversation, getOtherParticipant, selectConversation]);

    const [targetUser, setTargetUser] = useState<any>(null);

    const fetchUserInfo = async (userId: string) => {
        try {
            const response = await api.get(`/users/profile/${userId}`);
            setTargetUser(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
            alert('Failed to load user information');
            router.push('/messaging');
        } finally {
            setIsCreatingConversation(false);
        }
    };

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

    if (loading || authLoading || isCreatingConversation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
                            <span className="text-xl font-bold text-gray-900">ProNet</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                ></div>
                                <span className="text-sm text-gray-600">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '600px' }}>
                    <div className="flex h-full">
                        {/* Conversations List */}
                        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                            </div>
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No conversations yet</p>
                                    <Link
                                        href="/connections"
                                        className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
                                    >
                                        Start chatting with your connections
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    {conversations.map((conversation) => {
                                        const otherUser = getOtherParticipant(conversation);
                                        if (!otherUser) return null;

                                        return (
                                            <button
                                                key={conversation.id}
                                                onClick={() => selectConversation(conversation)}
                                                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 text-left transition ${selectedConversation?.id === conversation.id ? 'bg-primary-50' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                        {otherUser.firstName[0]}{otherUser.lastName[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {otherUser.firstName} {otherUser.lastName}
                                                            </p>
                                                            {conversation.unreadCount > 0 && (
                                                                <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
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

                        {/* Messages Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
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
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((message) => {
                                            const isOwn = message.senderId === user?.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-gray-200 text-gray-900'
                                                            }`}
                                                    >
                                                        <p>{message.content}</p>
                                                        <p
                                                            className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'
                                                                }`}
                                                        >
                                                            {new Date(message.createdAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200">
                                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || !isConnected}
                                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                            >
                                                Send
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : targetUser ? (
                                <>
                                    {/* Start Conversation Header */}
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {targetUser.firstName[0]}{targetUser.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {targetUser.firstName} {targetUser.lastName}
                                                </p>
                                                <p className="text-sm text-gray-500">Start a conversation</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Empty state */}
                                    <div className="flex-1 flex items-center justify-center p-8">
                                        <div className="text-center text-gray-500">
                                            <p className="text-lg mb-2">Say hello to {targetUser.firstName}!</p>
                                            <p className="text-sm">Send a message to start the conversation</p>
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200">
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (newMessage.trim()) {
                                                startConversationWithMessage(newMessage);
                                                setNewMessage('');
                                            }
                                        }} className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your first message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || !isConnected}
                                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                            >
                                                Send
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <p>Select a conversation to start chatting</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
