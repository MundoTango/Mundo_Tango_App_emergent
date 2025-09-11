
/**
 * ESA LIFE CEO 61×21 - Shared Socket.io Event Types
 * For coordination between Memories, Events, and Groups agents
 */

// Base event interface
export interface BaseSocketEvent {
  userId: string;
  timestamp: string;
  type: string;
}

// Memory-specific events
export interface MemoryEvent extends BaseSocketEvent {
  memoryId: string;
  type: 'like' | 'comment' | 'share' | 'create';
  data?: {
    username: string;
    content?: string;
    commentId?: string;
    memoryOwnerId: string;
  };
}

// Event-specific events (for Emergent's Events Agent)
export interface EventSocketEvent extends BaseSocketEvent {
  eventId: string;
  type: 'rsvp' | 'update' | 'reminder' | 'create' | 'cancel';
  data?: {
    username: string;
    rsvpStatus?: 'going' | 'interested' | 'not_going';
    eventOwnerId: string;
    eventTitle?: string;
  };
}

// Group-specific events
export interface GroupSocketEvent extends BaseSocketEvent {
  groupId: string;
  type: 'join' | 'leave' | 'post' | 'announcement';
  data?: {
    username: string;
    groupName?: string;
    content?: string;
  };
}

// Typing indicators
export interface TypingEvent extends BaseSocketEvent {
  targetId: string; // memoryId, eventId, or groupId
  targetType: 'memory' | 'event' | 'group';
  isTyping: boolean;
  username: string;
}

// WebSocket Room Structure
export type SocketRoom = 
  | `user:${string}`      // Personal notifications
  | `memory:${string}`    // Memory-specific updates
  | `event:${string}`     // Event-specific updates (for Events Agent)
  | `group:${string}`     // Group-specific updates
  | `city:${string}`      // City-based broadcasts
  | 'global'              // Platform-wide announcements

// Client-to-Server Events
export interface ClientToServerEvents {
  // Authentication
  'join:user': (userId: string) => void;
  
  // Room management
  'join:memory': (memoryId: string) => void;
  'leave:memory': (memoryId: string) => void;
  'join:event': (eventId: string) => void;
  'leave:event': (eventId: string) => void;
  'join:group': (groupId: string) => void;
  'leave:group': (groupId: string) => void;
  
  // Memory interactions
  'memory:like': (data: MemoryEvent) => void;
  'memory:comment': (data: MemoryEvent) => void;
  'memory:share': (data: MemoryEvent) => void;
  'memory:typing': (data: TypingEvent) => void;
  
  // Event interactions (for Events Agent)
  'event:rsvp': (data: EventSocketEvent) => void;
  'event:update': (data: EventSocketEvent) => void;
  'event:comment': (data: EventSocketEvent) => void;
  'event:typing': (data: TypingEvent) => void;
  
  // Group interactions
  'group:message': (data: GroupSocketEvent) => void;
  'group:typing': (data: TypingEvent) => void;
}

// Server-to-Client Events
export interface ServerToClientEvents {
  // Memory broadcasts
  'memory:liked': (data: MemoryEvent) => void;
  'memory:commented': (data: MemoryEvent) => void;
  'memory:shared': (data: MemoryEvent) => void;
  'memory:new': (data: MemoryEvent) => void;
  'memory:user_typing': (data: TypingEvent) => void;
  
  // Event broadcasts (for Events Agent)
  'event:rsvp_updated': (data: EventSocketEvent) => void;
  'event:updated': (data: EventSocketEvent) => void;
  'event:commented': (data: EventSocketEvent) => void;
  'event:new': (data: EventSocketEvent) => void;
  'event:user_typing': (data: TypingEvent) => void;
  
  // Group broadcasts
  'group:message_received': (data: GroupSocketEvent) => void;
  'group:user_typing': (data: TypingEvent) => void;
  
  // Notifications
  'notification:new': (data: {
    type: string;
    message: string;
    targetId?: string;
    fromUserId: string;
  }) => void;
  
  // User presence
  'user:presence': (data: {
    userId: string;
    status: 'online' | 'offline';
    timestamp: string;
  }) => void;
}

// API Response Format (shared across all agents)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Socket.io Hook Types
export interface SocketHookReturn {
  socket: any;
  isConnected: boolean;
  connectionError: string | null;
}

export interface MemorySocketHookReturn extends SocketHookReturn {
  emitLike: (data: Omit<MemoryEvent, 'userId' | 'timestamp' | 'type'>) => void;
  emitComment: (data: Omit<MemoryEvent, 'userId' | 'timestamp' | 'type'>) => void;
  emitShare: (data: Omit<MemoryEvent, 'userId' | 'timestamp' | 'type'>) => void;
  emitTyping: (isTyping: boolean, targetId: string) => void;
}

// For Events Agent integration
export interface EventSocketHookReturn extends SocketHookReturn {
  emitRSVP: (data: Omit<EventSocketEvent, 'userId' | 'timestamp' | 'type'>) => void;
  emitUpdate: (data: Omit<EventSocketEvent, 'userId' | 'timestamp' | 'type'>) => void;
  emitComment: (data: Omit<EventSocketEvent, 'userId' | 'timestamp' | 'type'>) => void;
  emitTyping: (isTyping: boolean, targetId: string) => void;
}
