'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    EllipsisVerticalIcon,
    ChatBubbleLeftIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import MessageReactions from './MessageReactions';
import FileAttachment from './FileAttachment';
import MessageThread from './MessageThread';

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
    updatedAt: string;
    isEdited: boolean;
    isPinned: boolean;
    reactions: any[];
    attachments?: any[];
    parentMessageId?: string;
}

interface GroupMessageProps {
    message: Message;
    groupId: string;
    currentUserId: string;
    isAdmin: boolean;
    onEdit?: (messageId: string, content: string) => void;
    onDelete?: (messageId: string) => void;
    onPin?: (messageId: string) => void;
    onRefresh?: () => void;
}

export default function GroupMessage({
    message,
    groupId,
    currentUserId,
    isAdmin,
    onEdit,
    onDelete,
    onPin,
    onRefresh,
}: GroupMessageProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showThread, setShowThread] = useState(false);
    const [threadCount, setThreadCount] = useState(0);

    const isOwnMessage = message.author.id === currentUserId;

    const handleEdit = () => {
        if (onEdit) {
            onEdit(message.id, editContent);
            setIsEditing(false);
        }
    };

    const handlePin = () => {
        if (onPin) {
            onPin(message.id);
            setShowMenu(false);
        }
    };

    return (
        <>
            <div
                className={`group flex items-start gap-3 p-4 hover:bg-gray-50 rounded-xl transition-all ${message.isPinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                    }`}
            >
                {/* Avatar */}
                <img
                    src={
                        message.author.avatar ||
                        `https://ui-avatars.com/api/?name=${message.author.firstName}+${message.author.lastName}`
                    }
                    alt={message.author.firstName}
                    className="w-10 h-10 rounded-full ring-2 ring-purple-100"
                />

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                            {message.author.firstName} {message.author.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                            })}
                        </span>
                        {message.isEdited && (
                            <span className="text-xs text-gray-400 italic">(edited)</span>
                        )}
                        {message.isPinned && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                                Pinned
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                rows={3}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(message.content);
                                    }}
                                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, index) => (
                                <FileAttachment key={index} attachment={attachment} />
                            ))}
                        </div>
                    )}

                    {/* Reactions */}
                    <MessageReactions
                        messageId={message.id}
                        groupId={groupId}
                        reactions={message.reactions || []}
                        currentUserId={currentUserId}
                        onReactionUpdate={onRefresh || (() => { })}
                    />

                    {/* Thread Button */}
                    {!message.parentMessageId && (
                        <button
                            onClick={() => setShowThread(true)}
                            className="mt-2 flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline"
                        >
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            {threadCount > 0 ? `${threadCount} replies` : 'Reply in thread'}
                        </button>
                    )}
                </div>

                {/* Actions Menu */}
                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-2xl border-2 border-purple-100 py-2 z-10">
                            {isOwnMessage && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Edit message
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onDelete) onDelete(message.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete message
                                    </button>
                                </>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={handlePin}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 flex items-center gap-2 text-yellow-700"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                                    </svg>
                                    {message.isPinned ? 'Unpin message' : 'Pin message'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Thread Panel */}
            {showThread && (
                <MessageThread
                    parentMessage={message}
                    groupId={groupId}
                    currentUserId={currentUserId}
                    onClose={() => setShowThread(false)}
                />
            )}
        </>
    );
}
