import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import type { Message } from './useChat';

interface UnreadSyncDetail {
  count?: number;
}

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loadingUnreadMessages, setLoadingUnreadMessages] = useState(false);

  const fetchUnreadMessages = useCallback(async () => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }

    try {
      setLoadingUnreadMessages(true);
      const response = await api.get('/chat/unread-count');
      setUnreadMessages(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread messages count:', error);
    } finally {
      setLoadingUnreadMessages(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadMessages();
  }, [fetchUnreadMessages]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleIncoming = (message: Message) => {
      if (message.senderId !== user.id) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    socket.on('message', handleIncoming);

    return () => {
      socket.off('message', handleIncoming);
    };
  }, [socket, user]);

  useEffect(() => {
    const handleUnreadSync = (event: Event) => {
      const detail = (event as CustomEvent<UnreadSyncDetail>).detail;
      if (typeof detail?.count === 'number') {
        setUnreadMessages(detail.count);
      }
    };

    window.addEventListener('messages:unread-sync', handleUnreadSync);

    return () => {
      window.removeEventListener('messages:unread-sync', handleUnreadSync);
    };
  }, []);

  return {
    unreadMessages,
    loadingUnreadMessages,
    refreshUnreadMessages: fetchUnreadMessages,
  };
};
