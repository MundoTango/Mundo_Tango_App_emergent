# API Documentation - Mundo Tango Platform
**Version**: 2.0  
**Base URL**: `https://mundo-tango.repl.co` (Production)  
**Base URL**: `http://localhost:5000` (Development)  
**Date**: October 17, 2025

---

## 🎯 **API OVERVIEW**

Mundo Tango provides a comprehensive RESTful API with WebSocket support for real-time features.

### **API Architecture**:
- **Main Platform API**: Port 5000 (unified app)
- **Server API**: Port 4000 (for Marketing Site + Talent Match)
- **Authentication**: Replit OAuth + JWT
- **Real-time**: Socket.io (WebSocket)
- **Response Format**: Standard JSON with `{success, data, error, message}`

---

## 🔐 **AUTHENTICATION**

### **Login Endpoints**:

#### **POST** `/api/auth/login`
Login with Replit OAuth or credentials

**Request**:
```json
{
  "email": "user@example.com",
  "password": "hashedpassword"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "tangodancer",
      "email": "user@example.com",
      "role": "dancer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### **POST** `/api/auth/register`
Create new account

**Request**:
```json
{
  "username": "tangodancer",
  "email": "user@example.com",
  "password": "securepassword",
  "role": "dancer"
}
```

#### **GET** `/api/auth/me`
Get current user (requires JWT)

**Headers**:
```
Authorization: Bearer {token}
```

---

## 👤 **USER MANAGEMENT**

### **User Endpoints**:

#### **GET** `/api/users/:id`
Get user profile

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "tangodancer",
    "displayName": "Maria Rodriguez",
    "bio": "Passionate tango dancer from Buenos Aires",
    "city": "Buenos Aires",
    "country": "Argentina",
    "role": "dancer",
    "experience": "intermediate",
    "profilePicture": "/uploads/users/123/avatar.jpg",
    "stats": {
      "posts": 45,
      "friends": 128,
      "eventsAttended": 23
    }
  }
}
```

#### **PATCH** `/api/users/:id`
Update user profile (requires JWT, own profile only)

**Request**:
```json
{
  "displayName": "Maria Elena Rodriguez",
  "bio": "Updated bio",
  "city": "Barcelona"
}
```

---

## 📝 **POSTS & MEMORIES**

### **Post Endpoints**:

#### **GET** `/api/posts`
Get posts feed (paginated)

**Query Parameters**:
- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `privacy` (public | friends | private)
- `userId` (filter by user)
- `city` (filter by location)

**Response**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 456,
        "content": "Amazing milonga last night! 💃",
        "userId": 123,
        "user": {
          "username": "tangodancer",
          "displayName": "Maria Rodriguez"
        },
        "media": [
          {
            "type": "image",
            "url": "/uploads/posts/123/photo1.jpg"
          }
        ],
        "location": {
          "venueName": "La Catedral Club de Tango",
          "city": "Buenos Aires",
          "country": "Argentina"
        },
        "likes": 42,
        "comments": 8,
        "privacy": "public",
        "createdAt": "2025-10-17T20:30:00Z"
      }
    ],
    "pagination": {
      "total": 1234,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### **POST** `/api/posts`
Create new post (requires JWT)

**Content-Type**: `multipart/form-data` (for media uploads)

**Request**:
```json
{
  "content": "Amazing milonga last night!",
  "privacy": "public",
  "location": {
    "venueName": "La Catedral Club de Tango",
    "city": "Buenos Aires",
    "country": "Argentina"
  },
  "hashtags": ["#tango", "#milonga", "#buenosaires"]
}
```

**Files**: `media[]` (up to 30 files, 500MB total)

#### **POST** `/api/posts/:id/like`
Like a post

#### **DELETE** `/api/posts/:id/like`
Unlike a post

---

## 🎉 **EVENTS**

### **Event Endpoints**:

#### **GET** `/api/events`
Get events (filterable, paginated)

**Query Parameters**:
- `city` - Filter by city
- `startDate` - Events after date (ISO 8601)
- `endDate` - Events before date
- `type` - Event type (milonga, festival, workshop)
- `limit`, `offset` - Pagination

**Response**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 789,
        "title": "Weekly Milonga at La Catedral",
        "description": "Traditional milonga with live music",
        "eventType": "milonga",
        "startTime": "2025-10-20T21:00:00Z",
        "endTime": "2025-10-21T02:00:00Z",
        "location": {
          "venueName": "La Catedral Club de Tango",
          "address": "Sarmiento 4006",
          "city": "Buenos Aires",
          "country": "Argentina"
        },
        "organizerId": 456,
        "organizer": {
          "username": "lacatedral",
          "displayName": "La Catedral Official"
        },
        "rsvpCount": {
          "attending": 87,
          "maybe": 23,
          "notAttending": 5
        },
        "price": {
          "amount": 500,
          "currency": "ARS"
        },
        "image": "/uploads/events/789/poster.jpg"
      }
    ]
  }
}
```

#### **POST** `/api/events`
Create event (requires JWT, organizer role)

**Request**:
```json
{
  "title": "Weekly Milonga",
  "description": "...",
  "eventType": "milonga",
  "startTime": "2025-10-20T21:00:00Z",
  "endTime": "2025-10-21T02:00:00Z",
  "location": { ... },
  "price": { "amount": 500, "currency": "ARS" },
  "isRecurring": true,
  "recurrence": {
    "frequency": "weekly",
    "dayOfWeek": 6,
    "endDate": "2026-01-01"
  }
}
```

#### **POST** `/api/events/:id/rsvp`
RSVP to event

**Request**:
```json
{
  "status": "attending" // or "maybe" or "not_attending"
}
```

---

## 👥 **FRIENDS & SOCIAL**

#### **GET** `/api/users/:id/friends`
Get user's friends list

#### **POST** `/api/friends/request`
Send friend request

**Request**:
```json
{
  "userId": 999
}
```

#### **POST** `/api/friends/:requestId/accept`
Accept friend request

#### **DELETE** `/api/friends/:userId`
Remove friend

---

## 💬 **COMMENTS**

#### **GET** `/api/posts/:postId/comments`
Get comments for post

#### **POST** `/api/posts/:postId/comments`
Add comment

**Request**:
```json
{
  "content": "Great photo! Where was this?"
}
```

---

## 🔔 **NOTIFICATIONS**

#### **GET** `/api/notifications`
Get user notifications

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-123",
        "type": "like",
        "actorId": 456,
        "actor": {
          "username": "johndoe",
          "displayName": "John Doe"
        },
        "targetType": "post",
        "targetId": 789,
        "message": "liked your post",
        "read": false,
        "createdAt": "2025-10-17T22:30:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

#### **PATCH** `/api/notifications/:id/read`
Mark notification as read

---

## 🌐 **REAL-TIME (WEBSOCKET)**

### **Socket.io Events**:

**Connect**:
```javascript
const socket = io('https://mundo-tango.repl.co', {
  auth: {
    token: jwtToken
  }
});
```

**Events to Listen**:
```javascript
// New post in feed
socket.on('post:new', (post) => {
  console.log('New post:', post);
});

// Post liked
socket.on('post:liked', ({ postId, userId, likeCount }) => {
  console.log(`Post ${postId} liked by ${userId}`);
});

// New comment
socket.on('comment:new', ({ postId, comment }) => {
  console.log('New comment:', comment);
});

// Event RSVP update
socket.on('event:rsvp', ({ eventId, userId, status }) => {
  console.log(`${userId} is ${status} for event ${eventId}`);
});

// Notification
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

**Events to Emit**:
```javascript
// Join user room (for targeted notifications)
socket.emit('join:user', { userId: 123 });

// Join city room (for local content)
socket.emit('join:city', { city: 'Buenos Aires' });

// Typing indicator
socket.emit('typing:start', { conversationId: 456 });
socket.emit('typing:stop', { conversationId: 456 });
```

---

## 🛠️ **SERVER API (PORT 4000)** **[NEW]**

### **For Marketing Site & Talent Match**:

#### **GET** `/api/v1/health`
Health check

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T23:00:00Z",
  "uptime": 86400,
  "agents": {
    "total": 276,
    "active": 245
  }
}
```

#### **GET** `/api/v1/esa`
Get ESA agent registry

**Response**:
```json
{
  "success": true,
  "data": {
    "version": "2.0",
    "agentCount": 276,
    "layers": [ ... ],
    "agents": [ ... ]
  }
}
```

---

### **Volunteer/Resume Endpoints**:

#### **POST** `/api/v1/volunteers/resumes`
Upload resume

**Content-Type**: `multipart/form-data`

**Request**:
```
volunteerId: uuid
file: [resume.pdf]
```

#### **POST** `/api/v1/volunteers/clarifier/session`
Start AI Clarifier interview

**Request**:
```json
{
  "volunteerId": "uuid",
  "resumeId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "signals": [
      {
        "domain": "backend",
        "confidence": 0.85
      }
    ],
    "firstQuestion": "Hi! Thanks for offering to help..."
  }
}
```

#### **POST** `/api/v1/volunteers/clarifier/message`
Continue interview (send answer, get next question)

**Request**:
```json
{
  "sessionId": "uuid",
  "message": "I prefer smaller tasks, 2-3 hours each"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nextQuestion": "How many hours per week can you contribute?",
    "questionsRemaining": 3
  }
}
```

#### **POST** `/api/v1/volunteers/match/suggest`
Get task recommendations

**Request**:
```json
{
  "sessionId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "taskId": "t-express-hardening",
        "title": "Harden Express endpoints",
        "hours": 3,
        "matchScore": 0.92,
        "reason": "Perfect match! You have strong Express..."
      }
    ]
  }
}
```

#### **GET** `/api/v1/tasks`
Get open tasks

#### **GET** `/api/v1/admin/assignments`
Get pending assignments (JWT admin required)

#### **POST** `/api/v1/admin/assignments/:id/status`
Approve/reject assignment (JWT admin required)

---

## 📊 **STANDARD RESPONSE FORMAT**

### **Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### **Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  },
  "statusCode": 401
}
```

### **Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "statusCode": 400
}
```

---

## ⚡ **RATE LIMITING**

- **Authenticated requests**: 1000/hour
- **Unauthenticated requests**: 100/hour
- **File uploads**: 50/hour
- **WebSocket connections**: 10 concurrent per user

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1697584800
```

---

## 🔒 **SECURITY**

### **Authentication**:
- JWT tokens expire in 24 hours
- Refresh tokens expire in 30 days
- Include token in header: `Authorization: Bearer {token}`

### **CORS**:
- Allowed origins configured in environment
- Credentials enabled for authenticated requests

### **Content Security Policy**:
- Images: self + CDN
- Scripts: self only (no inline scripts)
- Styles: self + inline (with nonce)

---

## 📚 **PAGINATION**

All list endpoints support pagination:

**Query Parameters**:
```
?limit=20&offset=0
```

**Response includes pagination metadata**:
```json
{
  "data": [...],
  "pagination": {
    "total": 1234,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "nextOffset": 20
  }
}
```

---

## 🧪 **TESTING**

**Base URL for testing**: `http://localhost:5000`

**Test credentials**:
```
Email: test@mundotango.com
Password: TestPassword123!
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mundotango.com","password":"TestPassword123!"}'
```

---

**For full API testing, see Postman collection or Swagger docs (coming soon)**

*Questions? Contact Layer 2 (API Structure Agent) or consult ESA.md*
