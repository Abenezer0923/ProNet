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
    Paperclip,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ChatPopup() {
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
        uploadFile,
        getOtherParticipant,
        totalUnread,
    } = useChat();

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadFile(file);
            sendMessage(url); // Send the URL as the message content
        } catch (error) {
            console.error('Failed to upload file:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    if (!user) return null;

    // Minimized State (Floating Button)
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleToggleOpen}
                    className="relative bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                    <MessageSquare className="w-6 h-6" />
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[1.5rem] rounded-full bg-white px-1.5 py-0.5 text-xs font-semibold text-primary-700 shadow">
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    // Expanded State (Glassmorphism Panel)
    return (
        <div
            className={`fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'h-[600px] w-80 sm:w-96' : 'h-16 w-80 sm:w-96'
                }`}
        >
            {/* Header */}
            <div
                className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between cursor-pointer"
                onClick={handleToggleExpand}
            >
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random&color=fff`}
                                alt={user.firstName}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary-700 rounded-full"></div>
                    </div>
                    <span className="font-semibold text-white tracking-wide">Messaging</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleOpen();
                        }}
                        className="p-1.5 hover:bg-white/20 rounded-full text-white/90 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
                    {selectedConversation ? (
                        // Chat View
                        <>
                            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center space-x-2 shadow-sm z-10">
                                <button
                                    onClick={handleBackToList}
                                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 mr-1 transition-colors"
                                >
                                    <ChevronDown className="w-5 h-5 rotate-90" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {getOtherParticipant(selectedConversation)?.firstName} {getOtherParticipant(selectedConversation)?.lastName}
                                    </h3>
                                    <p className="text-xs text-primary-600 font-medium truncate">
                                        {getOtherParticipant(selectedConversation)?.profession || 'Professional'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message) => {
                                            const isOwn = message.senderId === user.id;
                                            const isImage = message.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isOwn
                                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                                : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                                                            }`}
                                                    >
                                                        {isImage ? (
                                                            <img
                                                                src={message.content}
                                                                alt="Attachment"
                                                                className="max-w-full rounded-lg mb-1"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <p className="leading-relaxed">{message.content}</p>
                                                        )}
                                                        <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
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

                            <div className="p-3 bg-white border-t border-gray-100">
                                <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full resize-none border-none focus:ring-0 text-sm max-h-24 bg-gray-50 rounded-xl px-3 py-2"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex space-x-1">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                            <button
                                                type="button"
                                                onClick={triggerFileUpload}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                                title="Upload Image"
                                            >
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                            >
                                                <Paperclip className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="submit"
                                                disabled={(!newMessage.trim() && !isUploading)}
                                                className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Send className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        // Conversation List
                        <>
                            <div className="bg-white px-4 py-3 border-b border-gray-100">
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto bg-white">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">No messages yet</p>
                                        <p className="text-xs text-gray-500 mt-1 mb-4">Connect with professionals to start chatting</p>
                                        <Link href="/connections" className="text-primary-600 text-sm font-medium hover:underline">
                                            Find connections
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {conversations.map((conversation) => {
                                            const otherUser = getOtherParticipant(conversation);
                                            if (!otherUser) return null;

                                            return (
                                                <button
                                                    key={conversation.id}
                                                    onClick={() => handleSelectConversation(conversation)}
                                                    className="w-full p-4 hover:bg-gray-50 flex items-start space-x-4 text-left transition-colors group"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&background=random&color=fff`}
                                                            alt={otherUser.firstName}
                                                            className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:shadow-md transition-shadow"
                                                        />
                                                        {/* Online status indicator */}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-1">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                                                                {otherUser.firstName} {otherUser.lastName}
                                                            </p>
                                                            {conversation.lastMessage && (
                                                                <span className="text-[10px] text-gray-400 font-medium">
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
                                                            <span className="w-2.5 h-2.5 bg-primary-600 rounded-full block shadow-sm shadow-primary-200"></span>
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
