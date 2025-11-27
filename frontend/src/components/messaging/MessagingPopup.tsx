'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import {
    MessageSquare,
    X,
    Minimize2,
    Maximize2,
    Send,
    ChevronUp,
    ChevronDown,
    MoreHorizontal,
    Image as ImageIcon,
    Paperclip
} from 'lucide-react';
import Link from 'next/link';

export default function MessagingPopup() {
    const { user } = useAuth();
    const {
        conversations,
        selectedConversation,
        messages,
        loading,
        loadingMessages,
        selectConversation,
        clearSelectedConversation,
        sendMessage,
        getOtherParticipant,
    } = useChat();

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isExpanded]);

    const handleToggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setIsExpanded(true);
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleSelectConversation = (conversation: any) => {
        selectConversation(conversation);
        if (!isExpanded) setIsExpanded(true);
    };

    const handleBackToList = () => {
        clearSelectedConversation();
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessage(newMessage);
        setNewMessage('');
    };

    if (!user) return null;

    // Minimized State (Bottom Bar)
    if (!isOpen) {
        return (
            <div className="fixed bottom-0 right-4 z-50">
                <button
                    onClick={handleToggleOpen}
                    className="bg-white border border-gray-200 shadow-lg rounded-t-lg px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors w-64"
                >
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=5e372b&color=fff`}
                                alt={user.firstName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="font-semibold text-gray-700 flex-1 text-left">Messaging</span>
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                </button>
            </div>
        );
    }

    // Expanded State
    return (
        <div
            className={`fixed bottom-0 right-4 z-50 bg-white border border-gray-200 shadow-xl rounded-t-lg flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'h-[600px]' : 'h-14'
                } w-80 sm:w-96`}
        >
            {/* Header */}
            <div
                className="px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer bg-white rounded-t-lg hover:bg-gray-50"
                onClick={handleToggleExpand}
            >
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=5e372b&color=fff`}
                                alt={user.firstName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="font-semibold text-gray-700">Messaging</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleOpen();
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                    {selectedConversation ? (
                        // Chat View
                        <>
                            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
                                <button
                                    onClick={handleBackToList}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-500 mr-1"
                                >
                                    <ChevronDown className="w-5 h-5 rotate-90" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {getOtherParticipant(selectedConversation)?.firstName} {getOtherParticipant(selectedConversation)?.lastName}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate">
                                        {getOtherParticipant(selectedConversation)?.profession || 'Professional'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message) => {
                                            const isOwn = message.senderId === user.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isOwn
                                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                                                            }`}
                                                    >
                                                        <p>{message.content}</p>
                                                        <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
                                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            <div className="p-3 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Write a message..."
                                        className="w-full resize-none border-none focus:ring-0 text-sm max-h-24 bg-transparent p-0"
                                        rows={2}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex space-x-2">
                                            <button type="button" className="text-gray-400 hover:text-gray-600">
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                            <button type="button" className="text-gray-400 hover:text-gray-600">
                                                <Paperclip className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="bg-primary-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        // Conversation List
                        <>
                            <div className="bg-white border-b border-gray-200 px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Search messages"
                                    className="w-full bg-gray-100 border-none rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm">No messages yet</p>
                                        <Link href="/connections" className="text-primary-600 text-sm hover:underline mt-1 block">
                                            Find connections
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
                                                    onClick={() => handleSelectConversation(conversation)}
                                                    className="w-full p-3 hover:bg-gray-50 flex items-start space-x-3 text-left bg-white transition-colors"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&background=5e372b&color=fff`}
                                                            alt={otherUser.firstName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        {/* Online status indicator could go here if we had that data in the conversation list */}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-baseline mb-0.5">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {otherUser.firstName} {otherUser.lastName}
                                                            </p>
                                                            {conversation.lastMessage && (
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(conversation.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {conversation.lastMessage?.content || 'Start a conversation'}
                                                        </p>
                                                    </div>
                                                    {conversation.unreadCount > 0 && (
                                                        <div className="flex-shrink-0 self-center">
                                                            <span className="w-2 h-2 bg-primary-600 rounded-full block"></span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
