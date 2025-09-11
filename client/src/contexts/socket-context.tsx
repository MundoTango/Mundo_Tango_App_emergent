import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { SOCKET_EVENTS } from '@/shared/socketEvents';
import type {
  EventRSVPEvent,
  EventCreatedEvent,
  EventWaitlistEvent,
  EventCheckInEvent,
  MemoryEvent,
  TypingEvent
} from '@/shared/socketEvents';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  // Event-related methods
  joinEventRoom: (eventId: number) => void;
  leaveEventRoom: (eventId: number) => void;
  joinCityRoom: (cityName: string) => void;
  leaveCityRoom: (cityName: string) => void;
  // Memory-related methods (existing)
  joinMemoryRoom: (memoryId: string) => void;
  leaveMemoryRoom: (memoryId: string) => void;
  // Emit methods
  emitEventRSVP: (data: EventRSVPEvent) => void;
  emitEventCreated: (data: EventCreatedEvent) => void;
  emitEventWaitlist: (data: EventWaitlistEvent) => void;
  emitEventCheckIn: (data: EventCheckInEvent) => void;
  emitMemoryLike: (data: MemoryEvent) => void;
  emitMemoryComment: (data: MemoryEvent) => void;
  emitMemoryTyping: (data: TypingEvent) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user?.id) return;

    console.log('🔌 Initializing socket connection...');

    // Get backend URL from environment
    const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || 
                      process.env.REACT_APP_BACKEND_URL || 
                      'http://localhost:8001';

    const socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Join user's personal room
      socketInstance.emit(SOCKET_EVENTS.JOIN_USER_ROOM, user.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      setIsConnected(false);
    });

    // Event listeners for real-time updates
    socketInstance.on('event:rsvp_updated', (data) => {
      console.log('📅 RSVP updated:', data);
      // You can dispatch custom events here for components to listen to
      window.dispatchEvent(new CustomEvent('eventRSVPUpdated', { detail: data }));
    });

    socketInstance.on('event:new_in_city', (data) => {
      console.log('🏙️ New event in city:', data);
      window.dispatchEvent(new CustomEvent('newEventInCity', { detail: data }));
    });

    socketInstance.on('event:new_global', (data) => {
      console.log('🌍 New event globally:', data);
      window.dispatchEvent(new CustomEvent('newEventGlobal', { detail: data }));
    });

    socketInstance.on('event:waitlist_updated', (data) => {
      console.log('⏳ Waitlist updated:', data);
      window.dispatchEvent(new CustomEvent('eventWaitlistUpdated', { detail: data }));
    });

    socketInstance.on('event:checkin_updated', (data) => {
      console.log('✅ Check-in updated:', data);
      window.dispatchEvent(new CustomEvent('eventCheckInUpdated', { detail: data }));
    });

    socketInstance.on('event:details_updated', (data) => {
      console.log('📝 Event details updated:', data);
      window.dispatchEvent(new CustomEvent('eventDetailsUpdated', { detail: data }));
    });

    socketInstance.on('event:cancelled', (data) => {
      console.log('❌ Event cancelled:', data);
      window.dispatchEvent(new CustomEvent('eventCancelled', { detail: data }));
    });

    // Memory-related events (existing)
    socketInstance.on('memory:liked', (data) => {
      console.log('❤️ Memory liked:', data);
      window.dispatchEvent(new CustomEvent('memoryLiked', { detail: data }));
    });

    socketInstance.on('memory:commented', (data) => {
      console.log('💬 Memory commented:', data);
      window.dispatchEvent(new CustomEvent('memoryCommented', { detail: data }));
    });

    socketInstance.on('memory:new', (data) => {
      console.log('✨ New memory:', data);
      window.dispatchEvent(new CustomEvent('newMemory', { detail: data }));
    });

    socketInstance.on('memory:user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      window.dispatchEvent(new CustomEvent('memoryUserTyping', { detail: data }));
    });

    // Notification events
    socketInstance.on(SOCKET_EVENTS.NOTIFICATION_NEW, (data) => {
      console.log('🔔 New notification:', data);
      window.dispatchEvent(new CustomEvent('newNotification', { detail: data }));
    });

    // User presence events
    socketInstance.on(SOCKET_EVENTS.USER_PRESENCE, (data) => {
      console.log('👤 User presence:', data);
      window.dispatchEvent(new CustomEvent('userPresence', { detail: data }));
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [user?.id]);

  // Room management methods
  const joinEventRoom = (eventId: number) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.JOIN_EVENT_ROOM, eventId);
      console.log(`🎉 Joined event room: ${eventId}`);
    }
  };

  const leaveEventRoom = (eventId: number) => {
    if (socket && isConnected) {
      socket.emit('leave', `event:${eventId}`);
      console.log(`🚪 Left event room: ${eventId}`);
    }
  };

  const joinCityRoom = (cityName: string) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.JOIN_CITY_ROOM, cityName);
      console.log(`🏙️ Joined city room: ${cityName}`);
    }
  };

  const leaveCityRoom = (cityName: string) => {
    if (socket && isConnected) {
      socket.emit('leave', `city:${cityName}`);
      console.log(`🚪 Left city room: ${cityName}`);
    }
  };

  const joinMemoryRoom = (memoryId: string) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.JOIN_MEMORY_ROOM, memoryId);
      console.log(`💭 Joined memory room: ${memoryId}`);
    }
  };

  const leaveMemoryRoom = (memoryId: string) => {
    if (socket && isConnected) {
      socket.emit('leave', `memory:${memoryId}`);
      console.log(`🚪 Left memory room: ${memoryId}`);
    }
  };

  // Event emission methods
  const emitEventRSVP = (data: EventRSVPEvent) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.EVENT_RSVP, data);
    }
  };

  const emitEventCreated = (data: EventCreatedEvent) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.EVENT_CREATED, data);
    }
  };

  const emitEventWaitlist = (data: EventWaitlistEvent) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.EVENT_WAITLIST, data);
    }
  };

  const emitEventCheckIn = (data: EventCheckInEvent) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.EVENT_CHECKIN, data);
    }
  };

  const emitMemoryLike = (data: MemoryEvent) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.MEMORY_LIKE, data);
    }
  };

  const emitMemoryComment = (data: MemoryEvent) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.MEMORY_COMMENT, data);
    }
  };

  const emitMemoryTyping = (data: TypingEvent) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.MEMORY_TYPING, data);
    }
  };

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    joinEventRoom,
    leaveEventRoom,
    joinCityRoom,
    leaveCityRoom,
    joinMemoryRoom,
    leaveMemoryRoom,
    emitEventRSVP,
    emitEventCreated,
    emitEventWaitlist,
    emitEventCheckIn,
    emitMemoryLike,
    emitMemoryComment,
    emitMemoryTyping,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};