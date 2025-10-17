import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

export function useSocket(userId?: string): SocketContextType {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Get backend URL from environment or default
    const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    console.log('🔌 Connecting to Socket.io server:', backendUrl);
    
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Join user's personal room for notifications
      if (userId) {
        newSocket.emit('join:user', userId);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      setIsConnected(false);
      
      // Auto-reconnect on unexpected disconnection
      if (reason === 'io server disconnect') {
        // Server initiated disconnect - reconnect manually
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          newSocket.connect();
        }, 2000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚨 Socket.io connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket.io reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🚨 Socket.io reconnection failed:', error);
      setConnectionError('Reconnection failed');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up Socket.io connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      newSocket.close();
    };
  }, [userId]);

  return { socket, isConnected, connectionError };
}

// Memory-specific Socket.io hooks
export function useMemorySocket(memoryId: string, userId?: string) {
  const { socket, isConnected, connectionError } = useSocket(userId);
  
  // Join memory-specific room when socket connects
  useEffect(() => {
    if (socket && isConnected && memoryId) {
      console.log(`🏠 Joining memory room: ${memoryId}`);
      socket.emit('join:memory', memoryId);
      
      return () => {
        console.log(`🚪 Leaving memory room: ${memoryId}`);
        socket.emit('leave:memory', memoryId);
      };
    }
  }, [socket, isConnected, memoryId]);

  // Memory interaction methods
  const emitLike = useCallback((data: {
    memoryId: string;
    userId: string;
    username: string;
    memoryOwnerId: string;
  }) => {
    if (socket && isConnected) {
      console.log('👍 Emitting like event:', data);
      socket.emit('memory:like', {
        memoryId: data.memoryId,
        userId: data.userId,
        type: 'like',
        data: {
          username: data.username,
          memoryOwnerId: data.memoryOwnerId
        }
      });
    }
  }, [socket, isConnected]);

  const emitComment = useCallback((data: {
    memoryId: string;
    userId: string;
    username: string;
    comment: string;
    commentId: string;
    memoryOwnerId: string;
  }) => {
    if (socket && isConnected) {
      console.log('💬 Emitting comment event:', data);
      socket.emit('memory:comment', {
        memoryId: data.memoryId,
        userId: data.userId,
        type: 'comment',
        data: {
          username: data.username,
          comment: data.comment,
          commentId: data.commentId,
          memoryOwnerId: data.memoryOwnerId
        }
      });
    }
  }, [socket, isConnected]);

  const emitTyping = useCallback((isTyping: boolean, username: string) => {
    if (socket && isConnected && memoryId && userId) {
      socket.emit('memory:typing', {
        memoryId,
        userId,
        username,
        isTyping
      });
    }
  }, [socket, isConnected, memoryId, userId]);

  const emitShare = useCallback((data: {
    memoryId: string;
    userId: string;
    username: string;
    memoryOwnerId: string;
  }) => {
    if (socket && isConnected) {
      console.log('🔄 Emitting share event:', data);
      socket.emit('memory:share', {
        memoryId: data.memoryId,
        userId: data.userId,
        type: 'share',
        data: {
          username: data.username,
          memoryOwnerId: data.memoryOwnerId
        }
      });
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    connectionError,
    emitLike,
    emitComment,
    emitTyping,
    emitShare
  };
}

// Real-time event listeners hook
export function useMemoryRealtimeEvents() {
  const { socket } = useSocket();
  const [liveUpdates, setLiveUpdates] = useState<{
    likes: Array<{memoryId: string; userId: string; timestamp: string}>;
    comments: Array<{memoryId: string; userId: string; comment: string; timestamp: string}>;
    typing: Array<{memoryId: string; userId: string; username: string; isTyping: boolean}>;
  }>({
    likes: [],
    comments: [],
    typing: []
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time like events
    socket.on('memory:liked', (data) => {
      console.log('👍 Received like event:', data);
      setLiveUpdates(prev => ({
        ...prev,
        likes: [...prev.likes.slice(-9), data] // Keep last 10
      }));
    });

    // Listen for real-time comment events
    socket.on('memory:commented', (data) => {
      console.log('💬 Received comment event:', data);
      setLiveUpdates(prev => ({
        ...prev,
        comments: [...prev.comments.slice(-19), data] // Keep last 20
      }));
    });

    // Listen for typing indicators
    socket.on('memory:user_typing', (data) => {
      console.log('⌨️ Received typing event:', data);
      setLiveUpdates(prev => ({
        ...prev,
        typing: data.isTyping 
          ? [...prev.typing.filter(t => t.userId !== data.userId), data]
          : prev.typing.filter(t => t.userId !== data.userId)
      }));
    });

    // Listen for new memory creation
    socket.on('memory:new', (data) => {
      console.log('✨ New memory created:', data);
      // This can trigger feed refresh or live insertion
    });

    // Cleanup listeners
    return () => {
      socket.off('memory:liked');
      socket.off('memory:commented');
      socket.off('memory:user_typing');
      socket.off('memory:new');
    };
  }, [socket]);

  return liveUpdates;
}