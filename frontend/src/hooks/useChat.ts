import { useState, useEffect, useCallback } from 'react';
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

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchMessages = useCallback(async (conversationId: string) => {
        if (!user) return;
        setLoadingMessages(true);
        try {
            const response = await api.get(`/chat/conversations/${conversationId}/messages`);
            setMessages(response.data);

            if (socket) {
                socket.emit('joinConversation', { conversationId });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, [user, socket]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || !selectedConversation || !socket) return;

        try {
            socket.emit('sendMessage', {
                conversationId: selectedConversation.id,
                content,
            });
            // Optimistic update could be added here, but for now we rely on the socket event
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const selectConversation = useCallback((conversation: Conversation) => {
        setSelectedConversation(conversation);
        fetchMessages(conversation.id);
    }, [fetchMessages]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (message: Message) => {
            if (selectedConversation && message.conversationId === selectedConversation.id) {
                setMessages((prev) => [...prev, message]);
            }
            // Update conversation list to show new last message/unread count
            fetchConversations();
        };

        socket.on('message', handleMessage);

        return () => {
            socket.off('message', handleMessage);
        };
    }, [socket, selectedConversation, fetchConversations]);

    const getOtherParticipant = useCallback((conversation: Conversation) => {
        if (!user) return null;
        return conversation.participant1.id === user.id
            ? conversation.participant2
            : conversation.participant1;
    }, [user]);

    const clearSelectedConversation = useCallback(() => {
        setSelectedConversation(null);
    }, []);

    return {
        conversations,
        selectedConversation,
        messages,
        loading,
        loadingMessages,
        selectConversation,
        clearSelectedConversation,
        sendMessage,
        getOtherParticipant,
        fetchConversations, // Exported in case manual refresh is needed
    };
};
