/**
 * ESA LIFE CEO 61×21 - Socket Event Definitions
 * Centralized socket event types for real-time communication
 */

// Memory Events (existing)
export interface MemoryEvent {
  memoryId: string;
  userId: string;
  type: 'like' | 'comment' | 'share';
  data?: any;
}

export interface TypingEvent {
  memoryId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

// Event-related Socket Events (new for Events Agent)
export interface EventSocketEvent {
  eventId: number;
  userId: number;
  username: string;
  type: 'rsvp' | 'created' | 'updated' | 'cancelled' | 'checkin' | 'waitlist';
  data?: any;
}

export interface EventRSVPEvent {
  eventId: number;
  userId: number;
  username: string;
  status: 'going' | 'interested' | 'maybe' | 'not_going';
  profileImage?: string;
}

export interface EventCreatedEvent {
  eventId: number;
  title: string;
  userId: number;
  username: string;
  startDate: string;
  location?: string;
  eventType?: string;
  isPublic: boolean;
}

export interface EventWaitlistEvent {
  eventId: number;
  userId: number;
  username: string;
  action: 'joined' | 'left' | 'promoted';
  waitlistPosition?: number;
}

export interface EventCheckInEvent {
  eventId: number;
  userId: number;
  username: string;
  checkInTime: string;
  role?: string; // For DJs, teachers, etc.
}

export interface EventUpdateEvent {
  eventId: number;
  userId: number;
  changes: {
    title?: string;
    startDate?: string;
    location?: string;
    maxAttendees?: number;
    [key: string]: any;
  };
}

// Socket Room Types
export type SocketRoom = 
  | `user:${number}`           // Personal notifications
  | `event:${number}`          // Event-specific updates
  | `city:${string}`           // City-based events
  | `memory:${string}`;        // Memory-specific updates (existing)

// Socket Event Names
export const SOCKET_EVENTS = {
  // Memory events (existing)
  MEMORY_LIKE: 'memory:like',
  MEMORY_COMMENT: 'memory:comment',
  MEMORY_SHARE: 'memory:share',
  MEMORY_TYPING: 'memory:typing',
  MEMORY_CREATED: 'memory:created',
  
  // Event events (new)
  EVENT_RSVP: 'event:rsvp',
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_CANCELLED: 'event:cancelled',
  EVENT_WAITLIST: 'event:waitlist',
  EVENT_CHECKIN: 'event:checkin',
  
  // Room management
  JOIN_USER_ROOM: 'join:user',
  JOIN_EVENT_ROOM: 'join:event',
  JOIN_CITY_ROOM: 'join:city',
  JOIN_MEMORY_ROOM: 'join:memory',
  
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  USER_PRESENCE: 'user:presence'
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];