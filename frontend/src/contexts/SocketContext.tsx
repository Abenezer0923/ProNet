'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to WebSocket
    // Use the API URL but replace the gateway port with user-service port
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // For production, we need to connect directly to the user-service
    // In production: https://pronet-user-service.onrender.com (if deployed separately)
    // Or use the same backend URL if WebSocket is proxied through API gateway
    let socketUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (!socketUrl) {
      // If no WS_URL is set, derive it from API_URL
      if (apiUrl.includes('localhost')) {
        socketUrl = 'http://localhost:3001';
      } else {
        // For production, try to use the API URL (assuming WebSocket is on same server)
        socketUrl = apiUrl.replace('api-gateway', 'user-service');
      }
    }
    
    console.log('Connecting to WebSocket:', socketUrl);
    
    const newSocket = io(`${socketUrl}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
      });
      console.log('Attempting to connect to:', `${socketUrl}/chat`);
      console.log('Token exists:', !!token);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
