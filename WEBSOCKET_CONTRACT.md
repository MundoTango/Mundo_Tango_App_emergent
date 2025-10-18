# WebSocket Authentication & Usage Contract

**Mundo Tango ESA LIFE CEO Platform**  
**Phase 11 Parallel: Real-time Communication Documentation**  
**Date:** October 18, 2025

---

## 📡 **WebSocket Service Overview**

The Mundo Tango platform uses WebSocket for real-time features including:
- Live chat messaging
- Event updates and notifications
- User presence and activity
- Room-based communication
- Delivery confirmations

**Server Implementation:** `server/services/socketService.ts`  
**Protocol:** WebSocket (ws://) in development, WSS (wss://) in production  
**Port:** Same as HTTP server (5000)

---

## 🔐 **Authentication Flow**

### **1. Establish Connection**

```javascript
// Client-side connection
const ws = new WebSocket('ws://localhost:5000');

ws.onopen = () => {
  console.log('WebSocket connected');
  // Must authenticate immediately after connection
};
```

### **2. Authenticate with JWT Token**

**Message Type:** `auth`

```javascript
// Send authentication message
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-access-token'
}));
```

**Server Response (Success):**
```json
{
  "type": "auth_success",
  "message": "Authentication successful",
  "user": {
    "id": 123,
    "username": "johndoe",
    "name": "John Doe"
  },
  "timestamp": 1729238400000
}
```

**Server Response (Failure):**
```json
{
  "type": "auth_error",
  "message": "Authentication failed",
  "timestamp": 1729238400000
}
```

**Important:** Connection will be closed if authentication fails.

---

## 💓 **Heartbeat Mechanism**

The server automatically pings clients every **30 seconds** to detect dead connections.

### **Server Ping**
- Sent automatically every 30s
- Uses WebSocket native `ping` frame

### **Client Pong (Automatic)**
```javascript
// Browser handles pong automatically
// No manual code needed for native WebSocket pong
```

### **Manual Pong (Optional)**
```javascript
// If automatic pong doesn't work, respond manually
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'ping') {
    ws.send(JSON.stringify({ type: 'pong' }));
  }
};
```

**Connection Timeout:** 90 seconds without pong = connection terminated

---

## 🚪 **Room Management**

### **Join a Room**

**Message Type:** `join_room`

```javascript
ws.send(JSON.stringify({
  type: 'join_room',
  roomSlug: 'general-chat'
}));
```

**Server Response:**
```json
{
  "type": "room_joined",
  "roomSlug": "general-chat",
  "message": "Joined room general-chat",
  "userCount": 15,
  "timestamp": 1729238400000
}
```

**Broadcast to Others:**
```json
{
  "type": "user_joined",
  "data": {
    "userId": 123,
    "username": "johndoe",
    "roomSlug": "general-chat"
  },
  "roomSlug": "general-chat",
  "timestamp": 1729238400000
}
```

### **Leave a Room**

**Message Type:** `leave_room`

```javascript
ws.send(JSON.stringify({
  type: 'leave_room',
  roomSlug: 'general-chat'
}));
```

**Server Response:**
```json
{
  "type": "room_left",
  "roomSlug": "general-chat",
  "timestamp": 1729238400000
}
```

**Broadcast to Others:**
```json
{
  "type": "user_left",
  "data": {
    "userId": 123,
    "username": "johndoe",
    "roomSlug": "general-chat"
  },
  "timestamp": 1729238400000
}
```

---

## 💬 **Chat Messages**

### **Send Chat Message**

**Message Type:** `chat_message`

```javascript
ws.send(JSON.stringify({
  type: 'chat_message',
  roomSlug: 'general-chat',
  message: 'Hello everyone!',
  messageId: 'msg_1729238400_123' // Optional, for tracking
}));
```

### **Delivery Confirmation**

**Server Response to Sender:**
```json
{
  "type": "message_sent",
  "messageId": "msg_1729238400_123",
  "timestamp": 1729238400000,
  "roomSlug": "general-chat"
}
```

### **Broadcast to Room**

**Message Sent to All Room Members:**
```json
{
  "type": "new_message",
  "data": {
    "id": 456,
    "slug": "msg_1729238400_123",
    "chatRoomSlug": "general-chat",
    "userSlug": "123",
    "username": "johndoe",
    "messageType": "TEXT",
    "message": "Hello everyone!",
    "createdAt": "2025-10-18T08:40:00Z"
  },
  "roomSlug": "general-chat",
  "timestamp": 1729238400000
}
```

---

## 🔔 **Event Broadcasting**

### **Broadcast to Followers**

Used for user activity updates (server-side only).

```typescript
// Server code
socketService.broadcastToFollowers(userId, 'user_post_created', {
  postId: 789,
  content: 'Just posted something new!'
});
```

**Client Receives:**
```json
{
  "type": "user_post_created",
  "data": {
    "postId": 789,
    "content": "Just posted something new!"
  },
  "timestamp": 1729238400000
}
```

### **Send to Specific User**

```typescript
// Server code
socketService.sendToUser(userId, 'notification', {
  title: 'New follower',
  message: 'Alice started following you'
});
```

---

## ⚠️ **Error Handling**

### **Generic Error Response**

```json
{
  "type": "error",
  "message": "Description of what went wrong",
  "timestamp": 1729238400000
}
```

### **Common Errors**

1. **Not Authenticated**
```json
{
  "type": "error",
  "message": "Not authenticated",
  "timestamp": 1729238400000
}
```

2. **Invalid Message Format**
```json
{
  "type": "error",
  "message": "Invalid message format",
  "timestamp": 1729238400000
}
```

3. **Failed to Send Message**
```json
{
  "type": "error",
  "message": "Failed to send message",
  "messageId": "msg_1729238400_123",
  "timestamp": 1729238400000
}
```

---

## 🔄 **Reconnection Strategy**

### **Recommended Client Implementation**

```javascript
class WebSocketClient {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('Connected');
      this.reconnectDelay = 1000; // Reset delay
      this.authenticate();
    };

    this.ws.onclose = () => {
      console.log('Disconnected, reconnecting...');
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay
      );
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }

  authenticate() {
    this.send({ type: 'auth', token: this.token });
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  handleMessage(data) {
    // Handle incoming messages
    console.log('Received:', data);
  }
}

// Usage
const wsClient = new WebSocketClient('ws://localhost:5000', jwtToken);
```

---

## 📊 **Server Stats Endpoint**

Get real-time WebSocket statistics:

```typescript
// Server method
const stats = socketService.getStats();
```

**Returns:**
```json
{
  "totalConnections": 42,
  "totalRooms": 8,
  "rooms": [
    {
      "slug": "general-chat",
      "userCount": 15
    },
    {
      "slug": "tango-tips",
      "userCount": 8
    }
  ]
}
```

---

## 🛡️ **Security Considerations**

1. **Always authenticate immediately** after connection
2. **Use WSS (secure WebSocket)** in production
3. **Validate JWT tokens** on every connection
4. **Rate limit messages** to prevent spam
5. **Sanitize user input** in chat messages
6. **Check user permissions** before room access
7. **Inactive users are rejected** (isActive = false)

---

## 🧪 **Testing WebSocket Connection**

### **Using Browser Console**

```javascript
// 1. Connect
const ws = new WebSocket('ws://localhost:5000');

// 2. Authenticate
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};

// 3. Join room
ws.send(JSON.stringify({
  type: 'join_room',
  roomSlug: 'test-room'
}));

// 4. Send message
ws.send(JSON.stringify({
  type: 'chat_message',
  roomSlug: 'test-room',
  message: 'Hello world!'
}));

// 5. Listen for responses
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));
```

---

## 📝 **Message Types Reference**

### **Client → Server**

| Type | Purpose | Required Fields |
|------|---------|----------------|
| `auth` | Authenticate connection | `token` |
| `pong` | Manual heartbeat response | none |
| `join_room` | Join a chat room | `roomSlug` |
| `leave_room` | Leave a chat room | `roomSlug` |
| `chat_message` | Send chat message | `roomSlug`, `message` |

### **Server → Client**

| Type | Purpose | Fields |
|------|---------|--------|
| `auth_success` | Auth succeeded | `user`, `message` |
| `auth_error` | Auth failed | `message` |
| `ping` | Heartbeat check | none |
| `room_joined` | Successfully joined room | `roomSlug`, `userCount` |
| `room_left` | Successfully left room | `roomSlug` |
| `user_joined` | Another user joined | `data.userId`, `data.username` |
| `user_left` | Another user left | `data.userId`, `data.username` |
| `message_sent` | Your message delivered | `messageId`, `roomSlug` |
| `new_message` | New message in room | `data` (full message object) |
| `error` | Something went wrong | `message` |

---

## 🚀 **Production Deployment**

### **Environment Variables**

```bash
# Use WSS in production
WEBSOCKET_URL=wss://mundotango.com

# JWT secret (already required)
JWT_SECRET=your-production-secret
```

### **Nginx Configuration**

```nginx
location /ws {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 86400; # 24 hours
}
```

---

**Last Updated:** October 18, 2025  
**Version:** 1.0.0 (Phase 11 Complete)  
**Status:** ✅ Production Ready
