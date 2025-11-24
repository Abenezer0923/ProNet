'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import MessageReactions from './MessageReactions';

interface Message {
    id: string;
    content: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    createdAt: string;
    reactions: any[];
}

interface MessageThreadProps {
    parentMessage: Message;
    groupId: string;
    currentUserId: string;
    onClose: () => void;
}

export default function MessageThread({
    parentMessage,
    groupId,
    currentUserId,
    onClose,
}: MessageThreadProps) {
    const [replies, setReplies] = useState<Message[]>([]);
    const [newReply, setNewReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchThread();
    }, [parentMessage.id]);

    const fetchThread = async () => {
        try {
            const response = await api.get(
                `/communities/groups/${groupId}/messages/${parentMessage.id}/thread`
            );
            setReplies(response.data);
        } catch (error) {
            console.error('Error fetching thread:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || sending) return;

        setSending(true);
        try {
            await api.post(
                `/communities/groups/${groupId}/messages/${parentMessage.id}/thread`,
                { content: newReply }
            );
            setNewReply('');
            await fetchThread();
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="font-bold text-gray-900">Thread</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Parent Message */}
            <div className="p-4 border-b-2 border-gray-100 bg-gray-50">
                <div className="flex items-start gap-3">
                    <img
                        src={
                            parentMessage.author.avatar ||
                            `https://ui-avatars.com/api/?name=${parentMessage.author.firstName}+${parentMessage.author.lastName}`
                        }
                        alt={parentMessage.author.firstName}
                        className="w-10 h-10 rounded-full ring-2 ring-purple-100"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                                {parentMessage.author.firstName} {parentMessage.author.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(parentMessage.createdAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </div>
                        <p className="text-gray-800 text-sm">{parentMessage.content}</p>
                        <MessageReactions
                            messageId={parentMessage.id}
                            groupId={groupId}
                            reactions={parentMessage.reactions || []}
                            currentUserId={currentUserId}
                            onReactionUpdate={fetchThread}
                        />
                    </div>
                </div>
            </div>

            {/* Replies */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : replies.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p className="text-sm">No replies yet</p>
                        <p className="text-xs mt-1">Be the first to reply!</p>
                    </div>
                ) : (
                    replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                            <img
                                src={
                                    reply.author.avatar ||
                                    `https://ui-avatars.com/api/?name=${reply.author.firstName}+${reply.author.lastName}`
                                }
                                alt={reply.author.firstName}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-gray-900">
                                        {reply.author.firstName} {reply.author.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(reply.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800">{reply.content}</p>
                                <MessageReactions
                                    messageId={reply.id}
                                    groupId={groupId}
                                    reactions={reply.reactions || []}
                                    currentUserId={currentUserId}
                                    onReactionUpdate={fetchThread}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Reply Input */}
            <form
                onSubmit={handleSendReply}
                className="p-4 border-t-2 border-purple-100 bg-white"
            >
                <div className="flex items-end gap-2">
                    <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Reply to thread..."
                        className="flex-1 px-4 py-2 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={3}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newReply.trim() || sending}
                        className={`p-3 rounded-xl transition-all ${!newReply.trim() || sending
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                            }`}
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
