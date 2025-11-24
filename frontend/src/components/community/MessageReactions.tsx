'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface Reaction {
    id: string;
    emoji: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

interface MessageReactionsProps {
    messageId: string;
    groupId: string;
    reactions: Reaction[];
    currentUserId: string;
    onReactionUpdate: () => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

export default function MessageReactions({
    messageId,
    groupId,
    reactions,
    currentUserId,
    onReactionUpdate,
}: MessageReactionsProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
    }, {} as Record<string, Reaction[]>);

    const handleReactionClick = async (emoji: string) => {
        const userReacted = groupedReactions[emoji]?.some(
            (r) => r.user.id === currentUserId
        );

        try {
            if (userReacted) {
                // Remove reaction
                await api.delete(
                    `/communities/groups/${groupId}/messages/${messageId}/react`,
                    { data: { emoji } }
                );
            } else {
                // Add reaction
                await api.post(
                    `/communities/groups/${groupId}/messages/${messageId}/react`,
                    { emoji }
                );
            }
            onReactionUpdate();
            setShowPicker(false);
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    };

    const getUsersWhoReacted = (emoji: string) => {
        const users = groupedReactions[emoji] || [];
        if (users.length === 0) return '';
        if (users.length === 1) return users[0].user.firstName;
        if (users.length === 2)
            return `${users[0].user.firstName} and ${users[1].user.firstName}`;
        return `${users[0].user.firstName}, ${users[1].user.firstName} and ${users.length - 2
            } others`;
    };

    return (
        <div className="flex items-center gap-2 flex-wrap mt-2">
            {/* Existing Reactions */}
            {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
                const userReacted = reactionList.some((r) => r.user.id === currentUserId);
                return (
                    <button
                        key={emoji}
                        onClick={() => handleReactionClick(emoji)}
                        onMouseEnter={() => setHoveredReaction(emoji)}
                        onMouseLeave={() => setHoveredReaction(null)}
                        className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${userReacted
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300'
                                : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                            }`}
                    >
                        <span className="text-base">{emoji}</span>
                        <span className="font-semibold text-gray-700">{reactionList.length}</span>

                        {/* Tooltip */}
                        {hoveredReaction === emoji && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                {getUsersWhoReacted(emoji)}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                    <div className="border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                    </button>
                );
            })}

            {/* Add Reaction Button */}
            <div className="relative">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110"
                    title="Add reaction"
                >
                    <span className="text-lg">😊</span>
                </button>

                {/* Emoji Picker */}
                {showPicker && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white shadow-2xl rounded-2xl p-3 border-2 border-purple-100 z-20 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-4 gap-2">
                            {COMMON_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReactionClick(emoji)}
                                    className="text-2xl hover:scale-125 transition-transform p-2 rounded-lg hover:bg-purple-50"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowPicker(false)}
                            className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
