
import { useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { EventSocketEvent, EventSocketHookReturn } from '@shared/socketEvents';

export const useEventSocket = (eventId?: string): EventSocketHookReturn => {
  const { socket, isConnected, connectionError } = useSocket();

  useEffect(() => {
    if (socket && isConnected && eventId) {
      // Join event room
      socket.emit('join:event', eventId);

      return () => {
        // Leave event room on cleanup
        socket.emit('leave:event', eventId);
      };
    }
  }, [socket, isConnected, eventId]);

  const emitRSVP = useCallback((data: Omit<EventSocketEvent, 'userId' | 'timestamp' | 'type'>) => {
    if (socket && isConnected) {
      socket.emit('event:rsvp', {
        ...data,
        userId: 'current-user-id', // Get from auth context
        timestamp: new Date().toISOString(),
        type: 'rsvp',
      });
    }
  }, [socket, isConnected]);

  const emitUpdate = useCallback((data: Omit<EventSocketEvent, 'userId' | 'timestamp' | 'type'>) => {
    if (socket && isConnected) {
      socket.emit('event:update', {
        ...data,
        userId: 'current-user-id', // Get from auth context
        timestamp: new Date().toISOString(),
        type: 'update',
      });
    }
  }, [socket, isConnected]);

  const emitComment = useCallback((data: Omit<EventSocketEvent, 'userId' | 'timestamp' | 'type'>) => {
    if (socket && isConnected) {
      socket.emit('event:comment', {
        ...data,
        userId: 'current-user-id', // Get from auth context
        timestamp: new Date().toISOString(),
        type: 'comment',
      });
    }
  }, [socket, isConnected]);

  const emitTyping = useCallback((isTyping: boolean, targetId: string) => {
    if (socket && isConnected) {
      socket.emit('event:typing', {
        userId: 'current-user-id', // Get from auth context
        timestamp: new Date().toISOString(),
        type: 'typing',
        targetId,
        targetType: 'event',
        isTyping,
        username: 'current-username', // Get from auth context
      });
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    connectionError,
    emitRSVP,
    emitUpdate,
    emitComment,
    emitTyping,
  };
};
