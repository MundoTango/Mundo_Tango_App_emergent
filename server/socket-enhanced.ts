import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { SOCKET_EVENTS } from '../shared/socketEvents';
import type {
  MemoryEvent,
  TypingEvent,
  EventSocketEvent,
  EventRSVPEvent,
  EventCreatedEvent,
  EventWaitlistEvent,
  EventCheckInEvent
} from '../shared/socketEvents';

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  console.log('🚀 Enhanced Socket.io server initializing...');

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);
    
    // ==== ROOM MANAGEMENT ====
    
    // Join user to their personal room for private notifications
    socket.on(SOCKET_EVENTS.JOIN_USER_ROOM, (userId: number) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined personal room`);
    });

    // Join event-specific room for real-time updates
    socket.on(SOCKET_EVENTS.JOIN_EVENT_ROOM, (eventId: number) => {
      socket.join(`event:${eventId}`);
      console.log(`User joined event room: ${eventId}`);
    });

    // Join city room for location-based events
    socket.on(SOCKET_EVENTS.JOIN_CITY_ROOM, (cityName: string) => {
      socket.join(`city:${cityName}`);
      console.log(`User joined city room: ${cityName}`);
    });

    // Join memory-specific room (existing)
    socket.on(SOCKET_EVENTS.JOIN_MEMORY_ROOM, (memoryId: string) => {
      socket.join(`memory:${memoryId}`);
      console.log(`User joined memory room: ${memoryId}`);
    });

    // ==== MEMORY EVENTS (EXISTING) ====
    
    // Handle memory likes with real-time broadcasting
    socket.on(SOCKET_EVENTS.MEMORY_LIKE, (data: MemoryEvent) => {
      console.log(`📍 Memory like event:`, data);
      
      // Broadcast to all users viewing this memory
      socket.to(`memory:${data.memoryId}`).emit('memory:liked', {
        memoryId: data.memoryId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
        type: data.type
      });
      
      // Send notification to memory owner
      socket.to(`user:${data.data?.memoryOwnerId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        type: 'like',
        memoryId: data.memoryId,
        fromUserId: data.userId,
        message: `${data.data?.username} liked your memory`
      });
    });

    // Handle real-time comments
    socket.on(SOCKET_EVENTS.MEMORY_COMMENT, (data: MemoryEvent) => {
      console.log(`💬 Memory comment event:`, data);
      
      const commentData = {
        memoryId: data.memoryId,
        userId: data.userId,
        username: data.data?.username,
        comment: data.data?.comment,
        timestamp: new Date().toISOString(),
        commentId: data.data?.commentId
      };
      
      // Broadcast comment to all users viewing this memory
      socket.to(`memory:${data.memoryId}`).emit('memory:commented', commentData);
      
      // Send notification to memory owner (if not self-commenting)
      if (data.userId !== data.data?.memoryOwnerId) {
        socket.to(`user:${data.data?.memoryOwnerId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
          type: 'comment',
          memoryId: data.memoryId,
          fromUserId: data.userId,
          message: `${data.data?.username} commented on your memory`
        });
      }
    });

    // Handle typing indicators for comments
    socket.on(SOCKET_EVENTS.MEMORY_TYPING, (data: TypingEvent) => {
      console.log(`⌨️  Typing event:`, data);
      
      socket.to(`memory:${data.memoryId}`).emit('memory:user_typing', {
        memoryId: data.memoryId,
        userId: data.userId,
        username: data.username,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString()
      });
    });

    // Handle memory sharing
    socket.on(SOCKET_EVENTS.MEMORY_SHARE, (data: MemoryEvent) => {
      console.log(`🔄 Memory share event:`, data);
      
      // Broadcast share activity
      io.emit('memory:shared', {
        memoryId: data.memoryId,
        userId: data.userId,
        username: data.data?.username,
        timestamp: new Date().toISOString()
      });
      
      // Notify memory owner
      socket.to(`user:${data.data?.memoryOwnerId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        type: 'share',
        memoryId: data.memoryId,
        fromUserId: data.userId,
        message: `${data.data?.username} shared your memory`
      });
    });

    // Handle new memory creation broadcasts
    socket.on(SOCKET_EVENTS.MEMORY_CREATED, (data: any) => {
      console.log(`✨ New memory created:`, data);
      
      // Broadcast to all connected users for live feed updates
      socket.broadcast.emit('memory:new', {
        memoryId: data.memoryId,
        userId: data.userId,
        username: data.username,
        content: data.content,
        timestamp: new Date().toISOString()
      });
    });

    // ==== EVENT EVENTS (NEW) ====

    // Handle event RSVP updates
    socket.on(SOCKET_EVENTS.EVENT_RSVP, (data: EventRSVPEvent) => {
      console.log(`🎟️  Event RSVP:`, data);
      
      // Broadcast to event room
      socket.to(`event:${data.eventId}`).emit('event:rsvp_updated', {
        eventId: data.eventId,
        userId: data.userId,
        username: data.username,
        status: data.status,
        profileImage: data.profileImage,
        timestamp: new Date().toISOString()
      });

      // Notify event organizer
      socket.to(`user:${data.userId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        type: 'rsvp',
        eventId: data.eventId,
        fromUserId: data.userId,
        message: `${data.username} is ${data.status} to your event`
      });
    });

    // Handle new event creation
    socket.on(SOCKET_EVENTS.EVENT_CREATED, (data: EventCreatedEvent) => {
      console.log(`🎉 New event created:`, data);
      
      // Broadcast to city room if location available
      if (data.location) {
        const cityName = data.location.split(',')[0]?.trim();
        if (cityName) {
          socket.to(`city:${cityName}`).emit('event:new_in_city', {
            eventId: data.eventId,
            title: data.title,
            username: data.username,
            startDate: data.startDate,
            location: data.location,
            eventType: data.eventType,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Broadcast to all users for global feed
      if (data.isPublic) {
        socket.broadcast.emit('event:new_global', {
          eventId: data.eventId,
          title: data.title,
          username: data.username,
          startDate: data.startDate,
          location: data.location,
          eventType: data.eventType,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle event waitlist updates
    socket.on(SOCKET_EVENTS.EVENT_WAITLIST, (data: EventWaitlistEvent) => {
      console.log(`⏳ Event waitlist update:`, data);
      
      // Broadcast to event room
      socket.to(`event:${data.eventId}`).emit('event:waitlist_updated', {
        eventId: data.eventId,
        userId: data.userId,
        username: data.username,
        action: data.action,
        waitlistPosition: data.waitlistPosition,
        timestamp: new Date().toISOString()
      });

      // Notify event organizer
      socket.to(`user:${data.userId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        type: 'waitlist',
        eventId: data.eventId,
        fromUserId: data.userId,
        message: `${data.username} ${data.action} the waitlist for your event`
      });
    });

    // Handle event check-ins
    socket.on(SOCKET_EVENTS.EVENT_CHECKIN, (data: EventCheckInEvent) => {
      console.log(`✅ Event check-in:`, data);
      
      // Broadcast to event room
      socket.to(`event:${data.eventId}`).emit('event:checkin_updated', {
        eventId: data.eventId,
        userId: data.userId,
        username: data.username,
        checkInTime: data.checkInTime,
        role: data.role,
        timestamp: new Date().toISOString()
      });

      // Notify event organizer
      socket.to(`user:${data.userId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        type: 'checkin',
        eventId: data.eventId,
        fromUserId: data.userId,
        message: `${data.username} checked in to your event${data.role ? ` as ${data.role}` : ''}`
      });
    });

    // Handle event updates/cancellations
    socket.on(SOCKET_EVENTS.EVENT_UPDATED, (data: any) => {
      console.log(`📝 Event updated:`, data);
      
      // Broadcast to event room
      socket.to(`event:${data.eventId}`).emit('event:details_updated', {
        eventId: data.eventId,
        changes: data.changes,
        timestamp: new Date().toISOString()
      });
    });

    socket.on(SOCKET_EVENTS.EVENT_CANCELLED, (data: any) => {
      console.log(`❌ Event cancelled:`, data);
      
      // Broadcast to event room
      socket.to(`event:${data.eventId}`).emit('event:cancelled', {
        eventId: data.eventId,
        reason: data.reason,
        timestamp: new Date().toISOString()
      });
    });

    // ==== USER PRESENCE ====

    // Handle user presence
    socket.on('user:online', (userId: number) => {
      socket.broadcast.emit(SOCKET_EVENTS.USER_PRESENCE, {
        userId,
        status: 'online',
        timestamp: new Date().toISOString()
      });
    });

    // ==== CONNECTION MANAGEMENT ====

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`🚨 Socket error for ${socket.id}:`, error);
    });
  });

  // Handle server-level events
  io.engine.on("connection_error", (err) => {
    console.error("🚨 Connection error:", err);
  });

  console.log('✅ Enhanced Socket.io server setup complete with Events support');
  return io;
}

// Export types for use in other files
export type { 
  MemoryEvent, 
  TypingEvent, 
  EventSocketEvent,
  EventRSVPEvent,
  EventCreatedEvent,
  EventWaitlistEvent,
  EventCheckInEvent
};