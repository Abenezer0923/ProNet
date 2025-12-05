import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { api } from '@/lib/api';

export interface Conversation {
    id: string;
    participant1: any;
    participant2: any;
    lastMessage: {
        content: string;
        createdAt: string;
        senderId: string;
    } | null;
    unreadCount: number;
    lastMessageAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    senderId: string;
    sender: any;
    createdAt: string;
    isRead: boolean;
}

export const useChat = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const selectedConversationRef = useRef<Conversation | null>(null);

    const computeConversationTimestamp = (conversation: Conversation) => {
        if (conversation.lastMessage?.createdAt) {
            return new Date(conversation.lastMessage.createdAt).getTime();
        }

        if (conversation.lastMessageAt) {
            return new Date(conversation.lastMessageAt).getTime();
        }

        if (conversation.updatedAt) {
            return new Date(conversation.updatedAt).getTime();
        }

        if (conversation.createdAt) {
            return new Date(conversation.createdAt).getTime();
        }

        return 0;
    };

    const syncUnreadBadge = useCallback((count: number) => {
        if (typeof window === 'undefined') return;
        window.dispatchEvent(new CustomEvent('messages:unread-sync', { detail: { count } }));
    }, []);

    const updateConversationState = useCallback((list: Conversation[]) => {
        const sorted = [...list].sort((a, b) => computeConversationTimestamp(b) - computeConversationTimestamp(a));
        const unreadTotal = sorted.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);
        setConversations(sorted);
        setTotalUnread(unreadTotal);
        syncUnreadBadge(unreadTotal);
    }, [syncUnreadBadge]);

    const fetchConversations = useCallback(async () => {
        if (!user) {
            setConversations([]);
            setLoading(false);
            setTotalUnread(0);
            syncUnreadBadge(0);
            return;
        }
        try {
            const response = await api.get('/chat/conversations');
            updateConversationState(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [user, updateConversationState, syncUnreadBadge]);

    const markConversationAsRead = useCallback(async (conversationId: string) => {
        if (!user) return;

        try {
            await api.put(`/chat/conversations/${conversationId}/read`);
            setConversations((prev) => {
                const updated = prev.map((conversation) =>
                    conversation.id === conversationId
                        ? { ...conversation, unreadCount: 0 }
                        : conversation,
                );
                const unreadTotal = updated.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);
                setTotalUnread(unreadTotal);
                syncUnreadBadge(unreadTotal);
                return updated;
            });
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    }, [user, syncUnreadBadge]);

    useEffect(() => {
        if (!user) {
            setConversations([]);
            setSelectedConversation(null);
            setMessages([]);
            setTotalUnread(0);
            syncUnreadBadge(0);
        }
    }, [user, syncUnreadBadge]);

    const fetchMessages = useCallback(async (conversationId: string) => {
        if (!user) return;
        setLoadingMessages(true);
        try {
            const response = await api.get(`/chat/conversations/${conversationId}/messages`);
            setMessages(response.data);

            if (socket) {
                socket.emit('joinConversation', { conversationId });
            }

            const hasUnreadFromOthers = response.data.some(
                (message: Message) => message.senderId !== user.id && !message.isRead,
            );

            if (hasUnreadFromOthers) {
                void markConversationAsRead(conversationId);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, [user, socket, markConversationAsRead]);

    const sendMessage = async (content: string, conversationId?: string) => {
        if (!content.trim() || !socket) return;

        const targetConversationId = conversationId || selectedConversation?.id;
        if (!targetConversationId) return;

        try {
            socket.emit('sendMessage', {
                conversationId: targetConversationId,
                content,
            });
            // Optimistic update could be added here, but for now we rely on the socket event
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const selectConversation = useCallback((conversation: Conversation) => {
        setSelectedConversation(conversation);
        selectedConversationRef.current = conversation;
        fetchMessages(conversation.id);
    }, [fetchMessages]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (message: Message) => {
            if (
                selectedConversationRef.current &&
                message.conversationId === selectedConversationRef.current.id
            ) {
                setMessages((prev) => [...prev, message]);

                if (message.senderId !== user?.id) {
                    void markConversationAsRead(message.conversationId);
                }
            }
            // Update conversation list to show new last message/unread count
            fetchConversations();
        };

        socket.on('message', handleMessage);

        return () => {
            socket.off('message', handleMessage);
        };
    }, [socket, fetchConversations, markConversationAsRead, user?.id]);

    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    const getOtherParticipant = useCallback((conversation: Conversation) => {
        if (!user) return null;
        return conversation.participant1.id === user.id
            ? conversation.participant2
            : conversation.participant1;
    }, [user]);

    const clearSelectedConversation = useCallback(() => {
        setSelectedConversation(null);
        selectedConversationRef.current = null;
    }, []);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post('/upload/post-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.url;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    return {
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
        fetchConversations, // Exported in case manual refresh is needed
        totalUnread,
        markConversationAsRead,
    };
};
