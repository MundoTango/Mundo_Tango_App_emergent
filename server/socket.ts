import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface MemoryEvent {
  memoryId: string;
  userId: string;
  type: 'like' | 'comment' | 'share';
  data?: any;
}

interface TypingEvent {
  memoryId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

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

  console.log('🚀 Socket.io server initializing...');

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);
    
    // Join user to their personal room for private notifications
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined personal room`);
    });

    // Join memory-specific room for real-time updates
    socket.on('join:memory', (memoryId: string) => {
      socket.join(`memory:${memoryId}`);
      console.log(`User joined memory room: ${memoryId}`);
    });

    // Handle memory likes with real-time broadcasting
    socket.on('memory:like', (data: MemoryEvent) => {
      console.log(`📍 Memory like event:`, data);
      
      // Broadcast to all users viewing this memory
      socket.to(`memory:${data.memoryId}`).emit('memory:liked', {
        memoryId: data.memoryId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
        type: data.type
      });
      
      // Send notification to memory owner
      socket.to(`user:${data.data?.memoryOwnerId}`).emit('notification:new', {
        type: 'like',
        memoryId: data.memoryId,
        fromUserId: data.userId,
        message: `${data.data?.username} liked your memory`
      });
    });

    // Handle real-time comments
    socket.on('memory:comment', (data: MemoryEvent) => {
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
        socket.to(`user:${data.data?.memoryOwnerId}`).emit('notification:new', {
          type: 'comment',
          memoryId: data.memoryId,
          fromUserId: data.userId,
          message: `${data.data?.username} commented on your memory`
        });
      }
    });

    // Handle typing indicators for comments
    socket.on('memory:typing', (data: TypingEvent) => {
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
    socket.on('memory:share', (data: MemoryEvent) => {
      console.log(`🔄 Memory share event:`, data);
      
      // Broadcast share activity
      io.emit('memory:shared', {
        memoryId: data.memoryId,
        userId: data.userId,
        username: data.data?.username,
        timestamp: new Date().toISOString()
      });
      
      // Notify memory owner
      socket.to(`user:${data.data?.memoryOwnerId}`).emit('notification:new', {
        type: 'share',
        memoryId: data.memoryId,
        fromUserId: data.userId,
        message: `${data.data?.username} shared your memory`
      });
    });

    // Handle event RSVP updates (for Events Agent)
    socket.on('event:rsvp', (data: any) => {
      console.log(`🎫 Event RSVP:`, data);
      
      // Broadcast to all event viewers
      socket.to(`event:${data.eventId}`).emit('event:rsvp_updated', {
        eventId: data.eventId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
        type: 'rsvp',
        data: data.data
      });
      
      // Notify event organizer
      socket.to(`user:${data.data?.eventOwnerId}`).emit('notification:new', {
        type: 'event_rsvp',
        eventId: data.eventId,
        fromUserId: data.userId,
        message: `${data.data?.username} RSVPed ${data.data?.rsvpStatus} to your event`
      });
    });

    // Handle event updates (for Events Agent)
    socket.on('event:update', (data: any) => {
      console.log(`📝 Event update:`, data);
      
      socket.to(`event:${data.eventId}`).emit('event:updated', {
        eventId: data.eventId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
        type: 'update',
        data: data.data
      });
    });

    // Handle event comments (for Events Agent)
    socket.on('event:comment', (data: any) => {
      console.log(`💬 Event comment:`, data);
      
      socket.to(`event:${data.eventId}`).emit('event:commented', {
        eventId: data.eventId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
        data: data.data
      });
      
      // Notify event owner if not self-commenting
      if (data.userId !== data.data?.eventOwnerId) {
        socket.to(`user:${data.data?.eventOwnerId}`).emit('notification:new', {
          type: 'event_comment',
          eventId: data.eventId,
          fromUserId: data.userId,
          message: `${data.data?.username} commented on your event`
        });
      }
    });

    // Handle event typing indicators (for Events Agent)
    socket.on('event:typing', (data: any) => {
      console.log(`⌨️ Event typing:`, data);
      
      socket.to(`event:${data.targetId}`).emit('event:user_typing', {
        eventId: data.targetId,
        userId: data.userId,
        username: data.username,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString()
      });
    });

    // Handle joining event rooms (for Events Agent)
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`User joined event room: ${eventId}`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
      console.log(`User left event room: ${eventId}`);
    });

    // Handle new memory creation broadcasts
    socket.on('memory:created', (data: any) => {
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

    // Handle user presence
    socket.on('user:online', (userId: string) => {
      socket.broadcast.emit('user:presence', {
        userId,
        status: 'online',
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
      
      // Could emit offline status if we track user ID
      // socket.broadcast.emit('user:presence', { userId, status: 'offline' });
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

  console.log('✅ Socket.io server setup complete');
  return io;
}

// Export types for use in other files
export type { MemoryEvent, TypingEvent };