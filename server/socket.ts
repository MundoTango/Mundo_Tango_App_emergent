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

  // Initialize WebSocket with proper error handling
  const initializeWebSocket = async () => {
    try {
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

        // === GROUP REAL-TIME FEATURES (Layer 22: Group Management) ===

        // Handle joining group rooms
        socket.on('join:group', (groupId: string) => {
          socket.join(`group:${groupId}`);
          console.log(`User joined group room: ${groupId}`);
        });

        socket.on('leave:group', (groupId: string) => {
          socket.leave(`group:${groupId}`);
          console.log(`User left group room: ${groupId}`);
        });

        // Handle member joining group - broadcast to all viewers
        socket.on('group:memberJoined', (data: any) => {
          console.log(`👥 Member joined group:`, data);

          // Broadcast to all users viewing this group
          socket.to(`group:${data.groupId}`).emit('group:member_joined', {
            groupId: data.groupId,
            userId: data.userId,
            username: data.username,
            memberCount: data.memberCount,
            timestamp: new Date().toISOString()
          });

          // Also broadcast to main groups list page
          io.emit('groups:membership_changed', {
            groupId: data.groupId,
            action: 'joined',
            memberCount: data.memberCount
          });
        });

        // Handle member leaving group - broadcast to all viewers
        socket.on('group:memberLeft', (data: any) => {
          console.log(`👋 Member left group:`, data);

          // Broadcast to all users viewing this group
          socket.to(`group:${data.groupId}`).emit('group:member_left', {
            groupId: data.groupId,
            userId: data.userId,
            username: data.username,
            memberCount: data.memberCount,
            timestamp: new Date().toISOString()
          });

          // Also broadcast to main groups list page
          io.emit('groups:membership_changed', {
            groupId: data.groupId,
            action: 'left',
            memberCount: data.memberCount
          });
        });

        // Handle new post created in group
        socket.on('group:postCreated', (data: any) => {
          console.log(`📝 New post in group:`, data);

          // Broadcast to all group members
          socket.to(`group:${data.groupId}`).emit('group:new_post', {
            groupId: data.groupId,
            postId: data.postId,
            userId: data.userId,
            username: data.username,
            content: data.content,
            timestamp: new Date().toISOString()
          });

          // Send notifications to group members
          socket.to(`group:${data.groupId}`).emit('notification:new', {
            type: 'group_post',
            groupId: data.groupId,
            postId: data.postId,
            fromUserId: data.userId,
            message: `${data.username} posted in ${data.groupName}`
          });
        });

        // Handle group typing indicators for posts
        socket.on('group:typing', (data: any) => {
          console.log(`⌨️ Group typing:`, data);

          socket.to(`group:${data.groupId}`).emit('group:user_typing', {
            groupId: data.groupId,
            userId: data.userId,
            username: data.username,
            isTyping: data.isTyping,
            timestamp: new Date().toISOString()
          });
        });

        // Handle group update (name, description, image, etc.)
        socket.on('group:updated', (data: any) => {
          console.log(`✏️ Group updated:`, data);

          socket.to(`group:${data.groupId}`).emit('group:details_updated', {
            groupId: data.groupId,
            updates: data.updates,
            timestamp: new Date().toISOString()
          });

          // Broadcast to groups list page
          io.emit('groups:updated', {
            groupId: data.groupId,
            updates: data.updates
          });
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
    } catch (error) {
      console.error('❌ WebSocket initialization failed:', error);
    }
  };

  initializeWebSocket();


  // Handle server-level events
  io.engine.on("connection_error", (err) => {
    console.error("🚨 Connection error:", err);
  });

  console.log('✅ Socket.io server setup complete');
  return io;
}

// Export types for use in other files
export type { MemoryEvent, TypingEvent };