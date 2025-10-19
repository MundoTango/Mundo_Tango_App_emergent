# Layer 04: WebSocket Connection Agent
**Division:** Foundation Layer  
**Category:** Real-Time Infrastructure  
**Complexity:** High  
**Dependencies:** Socket.io (37,000+ refs), Redis (planned)  
**Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity

**Role:** Real-Time WebSocket Connection & Event Management  
**Responsibility:** Manage WebSocket connections, handle real-time events, enable live chat, notifications, and collaborative features

**Key Files:**
- `server/socket.ts` - Socket.io server configuration
- `client/src/hooks/use-socket.ts` - Client-side socket hook
- `docs/MT_WEBSOCKET_REALTIME_ARCHITECTURE.md` - Complete WebSocket guide

---

## Architecture

### **Socket.io Server Setup**

```typescript
// server/socket.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authentication
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    socket.disconnect();
    return;
  }

  // Join user room
  socket.join(`user:${userId}`);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

---

## Core Responsibilities

### **1. Real-Time Notifications**

```typescript
// Server-side: Send notification
export function sendNotification(userId: number, notification: Notification) {
  io.to(`user:${userId}`).emit('notification', notification);
}

// Usage after creating post
app.post('/api/posts', authMiddleware, async (req, res) => {
  const [post] = await db.insert(posts).values(req.body).returning();

  // Notify followers
  const followers = await db.query.follows.findMany({
    where: eq(follows.followingId, req.user.id),
  });

  followers.forEach(follower => {
    sendNotification(follower.followerId, {
      type: 'new_post',
      userId: req.user.id,
      message: `${req.user.name} posted: ${post.title}`,
    });
  });

  res.json(apiSuccess({ data: post }));
});

// Client-side: Receive notification
function useNotifications() {
  const socket = useSocket();

  useEffect(() => {
    socket?.on('notification', (notification) => {
      toast.success(notification.message);
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    });

    return () => {
      socket?.off('notification');
    };
  }, [socket]);
}
```

---

### **2. Live Chat**

```typescript
// Server-side: Chat room events
io.on('connection', (socket) => {
  // Join chat room
  socket.on('join:chat', (chatId: string) => {
    socket.join(`chat:${chatId}`);
    socket.to(`chat:${chatId}`).emit('user:joined', socket.id);
  });

  // Send message
  socket.on('message:send', async (data) => {
    const { chatId, content } = data;

    // Save to database
    const [message] = await db.insert(chatMessages).values({
      chatId,
      userId: socket.handshake.auth.userId,
      content,
    }).returning();

    // Broadcast to room
    io.to(`chat:${chatId}`).emit('message:new', message);
  });

  // Typing indicator
  socket.on('typing:start', (chatId: string) => {
    socket.to(`chat:${chatId}`).emit('user:typing', socket.handshake.auth.userId);
  });

  socket.on('typing:stop', (chatId: string) => {
    socket.to(`chat:${chatId}`).emit('user:stopped_typing', socket.handshake.auth.userId);
  });
});

// Client-side: Chat component
function ChatRoom({ chatId }: { chatId: string }) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  useEffect(() => {
    socket?.emit('join:chat', chatId);

    socket?.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket?.on('user:typing', (userId) => {
      setTypingUsers(prev => [...prev, userId]);
    });

    socket?.on('user:stopped_typing', (userId) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    });

    return () => {
      socket?.off('message:new');
      socket?.off('user:typing');
      socket?.off('user:stopped_typing');
    };
  }, [socket, chatId]);

  return (
    <div>
      {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      {typingUsers.length > 0 && <div>{typingUsers.length} typing...</div>}
    </div>
  );
}
```

---

### **3. Presence System**

```typescript
// Server-side: Track online users
const onlineUsers = new Map<number, string[]>(); // userId -> socketIds

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;

  // Add user to online set
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, []);
  }
  onlineUsers.get(userId)!.push(socket.id);

  // Broadcast user online
  io.emit('user:online', userId);

  socket.on('disconnect', () => {
    // Remove socket from user's connections
    const sockets = onlineUsers.get(userId) || [];
    const remaining = sockets.filter(id => id !== socket.id);

    if (remaining.length === 0) {
      // Last connection closed, user is offline
      onlineUsers.delete(userId);
      io.emit('user:offline', userId);
    } else {
      onlineUsers.set(userId, remaining);
    }
  });
});

// Client-side: Show online status
function UserAvatar({ userId }: { userId: number }) {
  const socket = useSocket();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    socket?.on('user:online', (id) => {
      if (id === userId) setIsOnline(true);
    });

    socket?.on('user:offline', (id) => {
      if (id === userId) setIsOnline(false);
    });

    return () => {
      socket?.off('user:online');
      socket?.off('user:offline');
    };
  }, [socket, userId]);

  return (
    <div className="relative">
      <Avatar />
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
      )}
    </div>
  );
}
```

---

### **4. Room-Based Broadcasting**

```typescript
// Server-side: Event RSVP updates
app.post('/api/events/:id/rsvp', authMiddleware, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { status } = req.body; // 'going', 'maybe', 'not_going'

  await db.insert(eventRsvps).values({
    eventId,
    userId: req.user.id,
    status,
  });

  // Broadcast to all users viewing this event
  io.to(`event:${eventId}`).emit('rsvp:updated', {
    userId: req.user.id,
    status,
  });

  res.json(apiSuccess({ message: 'RSVP updated' }));
});

// Client-side: Live RSVP count
function EventRSVPs({ eventId }: { eventId: number }) {
  const socket = useSocket();
  const { data: rsvps, refetch } = useQuery({
    queryKey: ['/api/events', eventId, 'rsvps'],
  });

  useEffect(() => {
    socket?.emit('join', `event:${eventId}`);

    socket?.on('rsvp:updated', () => {
      refetch(); // Refresh RSVP count
    });

    return () => {
      socket?.emit('leave', `event:${eventId}`);
      socket?.off('rsvp:updated');
    };
  }, [socket, eventId]);

  return <div>{rsvps?.length} people attending</div>;
}
```

---

## Scalability

### **Redis Adapter (Multi-Server)**

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Redis pub/sub for multi-server Socket.io
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

// Now Socket.io works across multiple servers
// Events sent on Server A reach clients on Server B
```

---

## Error Handling

```typescript
// Client-side: Reconnection logic
function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.VITE_SOCKET_URL!, {
      auth: { userId: user?.id },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  return { socket, isConnected };
}
```

---

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { io as Client } from 'socket.io-client';

describe('WebSocket Connection Agent', () => {
  it('connects and disconnects', (done) => {
    const client = Client('http://localhost:5000', {
      auth: { userId: 1 },
    });

    client.on('connect', () => {
      expect(client.connected).toBe(true);
      client.close();
    });

    client.on('disconnect', () => {
      expect(client.connected).toBe(false);
      done();
    });
  });

  it('receives notifications', (done) => {
    const client = Client('http://localhost:5000', {
      auth: { userId: 1 },
    });

    client.on('notification', (data) => {
      expect(data).toHaveProperty('message');
      client.close();
      done();
    });

    // Server sends notification to user 1
    io.to('user:1').emit('notification', { message: 'Test' });
  });
});
```

---

## Related Agents

- **Layer 03: Authentication** - Socket auth
- **Layer 17: User Agent** - User presence
- **Layer 26: Chat Agent** - Real-time messaging

**Next:** Read `docs/MT_WEBSOCKET_REALTIME_ARCHITECTURE.md` for complete patterns
