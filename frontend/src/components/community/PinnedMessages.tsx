'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface PinnedMessage {
    id: string;
    content: string;
    author: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    createdAt: string;
}

interface PinnedMessagesProps {
    groupId: string;
    isAdmin: boolean;
    onUnpin?: () => void;
}

export default function PinnedMessages({ groupId, isAdmin, onUnpin }: PinnedMessagesProps) {
    const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPinnedMessages();
    }, [groupId]);

    const fetchPinnedMessages = async () => {
        try {
            const response = await api.get(`/communities/groups/${groupId}/messages/pinned`);
            setPinnedMessages(response.data);
        } catch (error) {
            console.error('Error fetching pinned messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnpin = async (messageId: string) => {
        try {
            await api.delete(`/communities/groups/${groupId}/messages/${messageId}/pin`);
            await fetchPinnedMessages();
            if (onUnpin) onUnpin();
        } catch (error) {
            console.error('Error unpinning message:', error);
        }
    };

    const nextMessage = () => {
        setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length);
    };

    const prevMessage = () => {
        setCurrentIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length);
    };

    if (loading || pinnedMessages.length === 0) return null;

    const currentMessage = pinnedMessages[currentIndex];

    return (
        <div
            className={`bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200 transition-all duration-300 ${isCollapsed ? 'h-12' : 'h-auto'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Pin Icon and Message */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="flex-shrink-0 text-yellow-600 hover:text-yellow-700"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                            </svg>
                        </button>

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <img
                                        src={
                                            currentMessage.author.avatar ||
                                            `https://ui-avatars.com/api/?name=${currentMessage.author.firstName}+${currentMessage.author.lastName}`
                                        }
                                        alt={currentMessage.author.firstName}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className="text-sm font-semibold text-gray-900">
                                        {currentMessage.author.firstName} {currentMessage.author.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(currentMessage.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                    {currentMessage.content}
                                </p>
                            </div>
                        )}

                        {isCollapsed && (
                            <span className="text-sm font-medium text-yellow-700">
                                {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Right: Navigation and Actions */}
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {pinnedMessages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevMessage}
                                        className="p-1 hover:bg-yellow-100 rounded-full transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5 text-yellow-700" />
                                    </button>
                                    <span className="text-xs text-yellow-700 font-medium">
                                        {currentIndex + 1} / {pinnedMessages.length}
                                    </span>
                                    <button
                                        onClick={nextMessage}
                                        className="p-1 hover:bg-yellow-100 rounded-full transition-colors"
                                    >
                                        <ChevronRightIcon className="w-5 h-5 text-yellow-700" />
                                    </button>
                                </>
                            )}

                            {isAdmin && (
                                <button
                                    onClick={() => handleUnpin(currentMessage.id)}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors ml-2"
                                    title="Unpin message"
                                >
                                    <XMarkIcon className="w-5 h-5 text-red-600" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
