# ESA LIFE CEO 61x21 - API Reference

## Base URL
```
Production: https://api.mundotango.life
Development: http://localhost:5000
```

## Authentication

All API requests require authentication except public endpoints. The API supports two authentication methods:

### JWT Bearer Token
```http
Authorization: Bearer <token>
```

### Session Cookie
Session-based authentication using secure HTTP-only cookies.

## Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Upload | 10 requests | 15 minutes |
| Payment | 3 requests | 15 minutes |

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Endpoints

### Health & Monitoring

#### GET /health
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-14T15:00:00Z",
  "service": "ESA LIFE CEO 61x21",
  "environment": "production"
}
```

#### GET /ready
Comprehensive system readiness check.

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" },
    "supabase": { "status": "healthy" },
    "diskSpace": { "status": "healthy", "freeGB": "45.2" },
    "memory": { "status": "healthy", "usedPercentage": "65.3" }
  }
}
```

#### GET /metrics
System metrics for monitoring.

---

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /api/auth/logout
Logout current user.

#### POST /api/auth/refresh
Refresh authentication token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

#### POST /api/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePass123!"
}
```

---

### User Management

#### GET /api/users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "bio": "Tango enthusiast",
    "profileImage": "https://...",
    "city": "Buenos Aires",
    "country": "Argentina",
    "tangoRoles": ["leader", "follower"],
    "yearsOfDancing": 5
  }
}
```

#### PUT /api/users/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "city": "Buenos Aires",
  "tangoRoles": ["leader"]
}
```

#### POST /api/users/profile-image
Upload profile image.

**Request:** Multipart form data with `image` field

#### GET /api/users/:id
Get user by ID (public profile).

#### GET /api/users/search
Search users.

**Query Parameters:**
- `q` - Search query
- `limit` - Results limit (default: 20)
- `offset` - Pagination offset

---

### Posts & Content

#### GET /api/posts
Get feed posts.

**Query Parameters:**
- `limit` - Number of posts (default: 20)
- `offset` - Pagination offset
- `tags` - Filter by tags (comma-separated)

#### POST /api/posts
Create new post.

**Request Body:**
```json
{
  "content": "Post content here",
  "hashtags": ["tango", "milonga"],
  "mediaUrls": ["https://..."],
  "visibility": "public"
}
```

#### GET /api/posts/:id
Get single post.

#### PUT /api/posts/:id
Update post.

#### DELETE /api/posts/:id
Delete post.

#### POST /api/posts/:id/like
Like a post.

#### DELETE /api/posts/:id/like
Unlike a post.

#### GET /api/posts/:id/comments
Get post comments.

#### POST /api/posts/:id/comments
Add comment to post.

**Request Body:**
```json
{
  "content": "Great post!"
}
```

---

### Events

#### GET /api/events
Get events list.

**Query Parameters:**
- `type` - Event type (milonga, workshop, festival)
- `city` - Filter by city
- `startDate` - Events after date
- `endDate` - Events before date

#### POST /api/events
Create new event.

**Request Body:**
```json
{
  "title": "Friday Milonga",
  "description": "Weekly milonga",
  "type": "milonga",
  "startDate": "2025-09-20T20:00:00Z",
  "endDate": "2025-09-21T02:00:00Z",
  "location": {
    "name": "Tango Club",
    "address": "123 Main St",
    "city": "Buenos Aires",
    "country": "Argentina"
  },
  "price": 15,
  "capacity": 100
}
```

#### GET /api/events/:id
Get event details.

#### PUT /api/events/:id
Update event.

#### DELETE /api/events/:id
Cancel event.

#### POST /api/events/:id/rsvp
RSVP to event.

**Request Body:**
```json
{
  "status": "going",
  "guests": 1
}
```

---

### Groups

#### GET /api/groups
Get groups list.

#### POST /api/groups
Create new group.

**Request Body:**
```json
{
  "name": "Buenos Aires Tango",
  "description": "Local tango community",
  "type": "city",
  "privacy": "public",
  "rules": []
}
```

#### GET /api/groups/:id
Get group details.

#### POST /api/groups/:id/join
Join group.

#### DELETE /api/groups/:id/leave
Leave group.

#### GET /api/groups/:id/members
Get group members.

#### POST /api/groups/:id/posts
Post to group.

---

### Messages

#### GET /api/messages/conversations
Get user conversations.

#### GET /api/messages/conversations/:id
Get conversation messages.

#### POST /api/messages/send
Send message.

**Request Body:**
```json
{
  "recipientId": 2,
  "content": "Hello!",
  "type": "text"
}
```

#### PUT /api/messages/:id/read
Mark message as read.

---

### Friends & Follows

#### GET /api/friends
Get friends list.

#### POST /api/friends/request
Send friend request.

**Request Body:**
```json
{
  "userId": 2
}
```

#### PUT /api/friends/request/:id
Accept/reject friend request.

**Request Body:**
```json
{
  "action": "accept"
}
```

#### POST /api/follows/:userId
Follow user.

#### DELETE /api/follows/:userId
Unfollow user.

---

### Notifications

#### GET /api/notifications
Get user notifications.

#### PUT /api/notifications/:id/read
Mark notification as read.

#### PUT /api/notifications/read-all
Mark all notifications as read.

#### GET /api/notifications/preferences
Get notification preferences.

#### PUT /api/notifications/preferences
Update notification preferences.

**Request Body:**
```json
{
  "email": {
    "messages": true,
    "events": true,
    "follows": false
  },
  "push": {
    "messages": true,
    "events": false,
    "follows": false
  }
}
```

---

### Payments

#### GET /api/payments/plans
Get subscription plans.

#### POST /api/payments/create-subscription
Create subscription.

**Request Body:**
```json
{
  "planId": "enthusiast",
  "paymentMethodId": "pm_..."
}
```

#### GET /api/payments/subscription
Get current subscription.

#### PUT /api/payments/subscription
Update subscription.

#### DELETE /api/payments/subscription
Cancel subscription.

#### GET /api/payments/invoices
Get payment history.

---

### File Upload

#### POST /api/upload/image
Upload image file.

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.mundotango.life/images/...",
    "thumbnailUrl": "https://cdn.mundotango.life/thumbnails/...",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

#### POST /api/upload/video
Upload video file (max 100MB).

#### POST /api/upload/chunk
Chunked upload for large files.

**Headers:**
- `X-Upload-Id`: Unique upload ID
- `X-Chunk-Index`: Current chunk index
- `X-Total-Chunks`: Total number of chunks

---

### Search

#### GET /api/search
Global search.

**Query Parameters:**
- `q` - Search query
- `type` - Filter by type (users, posts, events, groups)
- `limit` - Results per type

---

### AI Features

#### POST /api/ai/chat
Chat with AI assistant.

**Request Body:**
```json
{
  "message": "How do I improve my tango?",
  "context": "beginner"
}
```

#### POST /api/ai/translate
Translate content.

**Request Body:**
```json
{
  "text": "Hello world",
  "targetLanguage": "es"
}
```

---

## Webhooks

### Event Types

- `user.created`
- `user.updated`
- `user.deleted`
- `payment.success`
- `payment.failed`
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `event.created`
- `event.updated`
- `event.cancelled`

### Webhook Payload

```json
{
  "id": "webhook_123",
  "type": "user.created",
  "timestamp": "2025-09-14T15:00:00Z",
  "data": {},
  "signature": "sha256=..."
}
```

### Webhook Security

All webhooks include a signature header for verification:
```
X-Webhook-Signature: sha256=<signature>
```

---

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_INVALID_CREDENTIALS | Invalid email or password |
| AUTH_TOKEN_EXPIRED | Authentication token expired |
| AUTH_INSUFFICIENT_PERMISSIONS | Insufficient permissions |
| VALIDATION_ERROR | Request validation failed |
| RESOURCE_NOT_FOUND | Requested resource not found |
| RESOURCE_ALREADY_EXISTS | Resource already exists |
| RATE_LIMIT_EXCEEDED | Too many requests |
| PAYMENT_FAILED | Payment processing failed |
| SERVICE_UNAVAILABLE | External service unavailable |

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { MundoTangoAPI } from '@mundotango/sdk';

const api = new MundoTangoAPI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Authenticate
const { user, token } = await api.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get posts
const posts = await api.posts.list({ limit: 20 });

// Create event
const event = await api.events.create({
  title: 'Friday Milonga',
  type: 'milonga',
  startDate: new Date('2025-09-20T20:00:00Z')
});
```

### Python
```python
from mundotango import MundoTangoAPI

api = MundoTangoAPI(
    api_key='your-api-key',
    environment='production'
)

# Authenticate
auth = api.auth.login(
    email='user@example.com',
    password='password'
)

# Get posts
posts = api.posts.list(limit=20)

# Create event
event = api.events.create(
    title='Friday Milonga',
    type='milonga',
    start_date='2025-09-20T20:00:00Z'
)
```

---

## Support

For API support, contact: api-support@mundotango.life

API Status Page: https://status.mundotango.life

Developer Portal: https://developers.mundotango.life