import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  author: any;
  createdAt: string;
  groupId?: string;
  group?: { id: string };
}

interface UseCommunitySocketProps {
  groupId: string | null;
  onMessageReceived?: (message: Message) => void;
  onUserJoined?: (data: { userId: string; groupId: string }) => void;
  onUserLeft?: (data: { userId: string; groupId: string }) => void;
  onUserTyping?: (data: { userId: string; groupId: string }) => void;
  onUserStoppedTyping?: (data: { userId: string; groupId: string }) => void;
}

export const useCommunitySocket = ({
  groupId,
  onMessageReceived,
  onUserJoined,
  onUserLeft,
  onUserTyping,
  onUserStoppedTyping,
}: UseCommunitySocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const groupIdRef = useRef<string | null>(groupId);

  useEffect(() => {
    groupIdRef.current = groupId;
  }, [groupId]);

  useEffect(() => {
    setTypingUsers(new Set());
  }, [groupId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let socketBaseUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (!socketBaseUrl) {
      if (apiUrl.includes('localhost')) {
        socketBaseUrl = 'http://localhost:3001';
      } else {
        socketBaseUrl = apiUrl.replace('api-gateway', 'user-service');
      }
    }

    const socket = io(`${socketBaseUrl}/communities`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to community socket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from community socket');
      setIsConnected(false);
    });

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    socket.on('message_received', (message: Message) => {
      const messageGroupId = message.groupId || message.group?.id;
      const currentGroupId = groupIdRef.current;
      if (currentGroupId && messageGroupId && messageGroupId !== currentGroupId) {
        return;
      }
      console.log('Message received:', message);
      onMessageReceived?.({ ...message, groupId: messageGroupId || currentGroupId || undefined });
    });

    socket.on('user_joined', (data: { userId: string; groupId: string }) => {
      console.log('User joined:', data);
      onUserJoined?.(data);
    });

    socket.on('user_left', (data: { userId: string; groupId: string }) => {
      console.log('User left:', data);
      onUserLeft?.(data);
    });

    socket.on('user_typing', (data: { userId: string; groupId: string }) => {
      setTypingUsers((prev: Set<string>) => {
        const updated = new Set(prev);
        updated.add(data.userId);
        return updated;
      });
      onUserTyping?.(data);
    });

    socket.on('user_stopped_typing', (data: { userId: string; groupId: string }) => {
      setTypingUsers((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
      onUserStoppedTyping?.(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [onMessageReceived, onUserJoined, onUserLeft, onUserTyping, onUserStoppedTyping]);

  // Join group when groupId changes
  useEffect(() => {
    if (!socketRef.current || !groupId || !isConnected) return;

    console.log('Joining group:', groupId);
    socketRef.current.emit('join_group', { groupId });

    return () => {
      if (socketRef.current && groupId) {
        console.log('Leaving group:', groupId);
        socketRef.current.emit('leave_group', { groupId });
      }
    };
  }, [groupId, isConnected]);

  const sendMessage = (content: string, attachments?: any[]) => {
    if (!socketRef.current || !groupId) return;

    socketRef.current.emit('send_message', {
      groupId,
      content,
      attachments,
    });
  };

  const startTyping = () => {
    if (!socketRef.current || !groupId) return;
    socketRef.current.emit('typing_start', { groupId });
  };

  const stopTyping = () => {
    if (!socketRef.current || !groupId) return;
    socketRef.current.emit('typing_stop', { groupId });
  };

  const markAsRead = (messageId: string) => {
    if (!socketRef.current || !groupId) return;
    socketRef.current.emit('message_read', { messageId, groupId });
  };

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    typingUsers: Array.from(typingUsers),
  };
};
