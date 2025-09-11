
import { useSocket } from './useSocket';
import { useCallback } from 'react';
import type { EventSocketEvent, EventSocketHookReturn } from '../../../shared/socketEvents';

/**
 * Events Agent Socket.io Hook
 * Ready for integration with Emergent's Events Agent
 */
export function useEventSocket(eventId: string, userId?: string): EventSocketHookReturn {
  const { socket, isConnected, connectionError } = useSocket(userId);
  
  // Join event-specific room when socket connects
  useEffect(() => {
    if (socket && isConnected && eventId) {
      console.log(`🏠 Joining event room: ${eventId}`);
      socket.emit('join:event', eventId);
      
      return () => {
        console.log(`🚪 Leaving event room: ${eventId}`);
        socket.emit('leave:event', eventId);
      };
    }
  }, [socket, isConnected, eventId]);

  // Event RSVP interaction
  const emitRSVP = useCallback((data: {
    eventId: string;
    rsvpStatus: 'going' | 'interested' | 'not_going';
    username: string;
    eventOwnerId: string;
  }) => {
    if (socket && isConnected && userId) {
      console.log('✅ Emitting RSVP event:', data);
      socket.emit('event:rsvp', {
        eventId: data.eventId,
        userId,
        timestamp: new Date().toISOString(),
        type: 'rsvp',
        data: {
          username: data.username,
          rsvpStatus: data.rsvpStatus,
          eventOwnerId: data.eventOwnerId
        }
      } as EventSocketEvent);
    }
  }, [socket, isConnected, userId]);

  // Event update interaction
  const emitUpdate = useCallback((data: {
    eventId: string;
    username: string;
    eventOwnerId: string;
    eventTitle?: string;
  }) => {
    if (socket && isConnected && userId) {
      console.log('📝 Emitting event update:', data);
      socket.emit('event:update', {
        eventId: data.eventId,
        userId,
        timestamp: new Date().toISOString(),
        type: 'update',
        data: {
          username: data.username,
          eventOwnerId: data.eventOwnerId,
          eventTitle: data.eventTitle
        }
      } as EventSocketEvent);
    }
  }, [socket, isConnected, userId]);

  // Event comment interaction
  const emitComment = useCallback((data: {
    eventId: string;
    username: string;
    comment: string;
    eventOwnerId: string;
  }) => {
    if (socket && isConnected && userId) {
      console.log('💬 Emitting event comment:', data);
      socket.emit('event:comment', {
        eventId: data.eventId,
        userId,
        timestamp: new Date().toISOString(),
        type: 'comment',
        data: {
          username: data.username,
          content: data.comment,
          eventOwnerId: data.eventOwnerId
        }
      } as EventSocketEvent);
    }
  }, [socket, isConnected, userId]);

  // Typing indicator for events
  const emitTyping = useCallback((isTyping: boolean, targetId: string) => {
    if (socket && isConnected && eventId && userId) {
      socket.emit('event:typing', {
        userId,
        timestamp: new Date().toISOString(),
        type: 'typing',
        targetId,
        targetType: 'event' as const,
        isTyping,
        username: 'current_user' // Should be passed from auth context
      });
    }
  }, [socket, isConnected, eventId, userId]);

  return {
    socket,
    isConnected,
    connectionError,
    emitRSVP,
    emitUpdate,
    emitComment,
    emitTyping
  };
}

// Real-time event listeners for Events Agent
export function useEventRealtimeEvents() {
  const { socket } = useSocket();
  const [liveUpdates, setLiveUpdates] = useState<{
    rsvps: Array<{eventId: string; userId: string; status: string; timestamp: string}>;
    comments: Array<{eventId: string; userId: string; comment: string; timestamp: string}>;
    updates: Array<{eventId: string; title?: string; timestamp: string}>;
    typing: Array<{eventId: string; userId: string; username: string; isTyping: boolean}>;
  }>({
    rsvps: [],
    comments: [],
    updates: [],
    typing: []
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for event RSVP updates
    socket.on('event:rsvp_updated', (data: EventSocketEvent) => {
      console.log('✅ Received RSVP update:', data);
      setLiveUpdates(prev => ({
        ...prev,
        rsvps: [...prev.rsvps.slice(-9), {
          eventId: data.eventId,
          userId: data.userId,
          status: data.data?.rsvpStatus || 'going',
          timestamp: data.timestamp
        }]
      }));
    });

    // Listen for event comments
    socket.on('event:commented', (data: EventSocketEvent) => {
      console.log('💬 Received event comment:', data);
      setLiveUpdates(prev => ({
        ...prev,
        comments: [...prev.comments.slice(-19), {
          eventId: data.eventId,
          userId: data.userId,
          comment: data.data?.content || '',
          timestamp: data.timestamp
        }]
      }));
    });

    // Listen for event updates
    socket.on('event:updated', (data: EventSocketEvent) => {
      console.log('📝 Received event update:', data);
      setLiveUpdates(prev => ({
        ...prev,
        updates: [...prev.updates.slice(-9), {
          eventId: data.eventId,
          title: data.data?.eventTitle,
          timestamp: data.timestamp
        }]
      }));
    });

    // Listen for typing in event comments
    socket.on('event:user_typing', (data: any) => {
      console.log('⌨️ Event typing indicator:', data);
      setLiveUpdates(prev => ({
        ...prev,
        typing: data.isTyping 
          ? [...prev.typing.filter(t => t.userId !== data.userId), data]
          : prev.typing.filter(t => t.userId !== data.userId)
      }));
    });

    // New event creation
    socket.on('event:new', (data: EventSocketEvent) => {
      console.log('✨ New event created:', data);
      // Events Agent can handle this for live feed updates
    });

    return () => {
      socket.off('event:rsvp_updated');
      socket.off('event:commented');
      socket.off('event:updated');
      socket.off('event:user_typing');
      socket.off('event:new');
    };
  }, [socket]);

  return liveUpdates;
}
