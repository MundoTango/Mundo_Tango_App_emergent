import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Initialize Socket.IO connection with reconnection strategy
const getSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socket;
};

export const useMemoriesFeed = () => {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  
  // Fetch initial data using React Query
  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data.posts || [];
    },
  });

  useEffect(() => {
    const socketInstance = getSocket();
    socketInstance.connect();

    // Connection handlers
    const handleConnect = () => {
      setConnectionStatus('connected');
      console.log('✅ Real-time feed connected:', socketInstance.id);
    };

    const handleDisconnect = (reason: string) => {
      setConnectionStatus('disconnected');
      console.log('⚠️ Feed disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server kicked us - manual reconnect needed
        socketInstance.connect();
      }
    };

    const handleConnectError = (error: Error) => {
      console.error('❌ Connection error:', error);
      setConnectionStatus('disconnected');
    };

    // Real-time feed update handler
    const handleNewMemory = (memory: any) => {
      console.log('🆕 New memory received:', memory);
      
      // Optimistically update the cache
      queryClient.setQueryData(['/api/posts'], (old: any[] = []) => {
        return [memory, ...old];
      });
    };

    // Register event listeners
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);
    socketInstance.on('memory:new', handleNewMemory);

    // Cleanup
    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleConnectError);
      socketInstance.off('memory:new', handleNewMemory);
      // Don't disconnect - keep connection alive across component remounts
    };
  }, [queryClient]);

  return {
    memories,
    isLoading,
    connectionStatus,
  };
};
