# Mundo Tango - API Documentation
## Complete REST API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api` (development)  
**Authentication:** Session-based (Replit OAuth)  
**Format:** JSON

---

## 📋 Table of Contents

1. [Event API](#event-api) (7 endpoints)
2. [Profile API](#profile-api) (6 endpoints)
3. [Groups API](#groups-api) (8 endpoints)

**Total Endpoints:** 21 production-ready APIs

---

## 🎫 Event API

### Overview
The Event API manages tango events including milongas, workshops, festivals, and practice sessions. Supports CRUD operations, RSVP functionality, and search capabilities.

**Base Path:** `/api/events`

---

### 1. Create Event
**Endpoint:** `POST /api/events`  
**Authentication:** Required  
**Description:** Create a new tango event

**Request Body:**
```json
{
  "title": "Buenos Aires Milonga Night",
  "description": "Traditional milonga with live orchestra",
  "eventType": "milonga",
  "startDate": "2025-11-01T20:00:00Z",
  "endDate": "2025-11-02T02:00:00Z",
  "city": "Buenos Aires",
  "country": "Argentina",
  "venue": "Salon Canning",
  "address": "Scalabrini Ortiz 1331",
  "latitude": -34.5875,
  "longitude": -58.4207,
  "price": 500,
  "currency": "ARS",
  "maxAttendees": 200,
  "imageUrl": "https://example.com/event.jpg",
  "isPublic": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Buenos Aires Milonga Night",
    "eventType": "milonga",
    "startDate": "2025-11-01T20:00:00Z",
    "city": "Buenos Aires",
    "country": "Argentina",
    "attendeeCount": 0,
    "createdAt": "2025-10-20T05:30:00Z"
  }
}
```

**Validation Rules:**
- `title`: Required, 3-200 characters
- `eventType`: Required, enum: `milonga`, `workshop`, `festival`, `practice`
- `startDate`: Required, ISO 8601 format, must be future date
- `endDate`: Optional, must be after startDate
- `city`: Required, 2-100 characters
- `country`: Required, 2-100 characters
- `price`: Optional, number ≥ 0
- `maxAttendees`: Optional, number ≥ 1

**Error Responses:**
```json
// 400 Bad Request - Validation Error
{
  "error": "Validation failed",
  "details": ["title is required", "startDate must be in the future"]
}

// 401 Unauthorized
{
  "error": "Authentication required"
}

// 500 Internal Server Error
{
  "error": "Failed to create event"
}
```

---

### 2. Get All Events
**Endpoint:** `GET /api/events`  
**Authentication:** Optional  
**Description:** List all public events with optional filtering

**Query Parameters:**
- `city` (string): Filter by city name
- `country` (string): Filter by country
- `eventType` (string): Filter by type (milonga, workshop, festival, practice)
- `startDate` (ISO date): Filter events after this date
- `limit` (number): Maximum results (default: 50, max: 100)
- `offset` (number): Pagination offset (default: 0)

**Example Request:**
```
GET /api/events?city=Buenos Aires&eventType=milonga&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Buenos Aires Milonga Night",
      "description": "Traditional milonga with live orchestra",
      "eventType": "milonga",
      "startDate": "2025-11-01T20:00:00Z",
      "endDate": "2025-11-02T02:00:00Z",
      "city": "Buenos Aires",
      "country": "Argentina",
      "venue": "Salon Canning",
      "price": 500,
      "currency": "ARS",
      "attendeeCount": 45,
      "maxAttendees": 200,
      "imageUrl": "https://example.com/event.jpg"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Performance:**
- Indexed by: `city`, `country`, `eventType`, `startDate`
- Response time: <100ms typical
- Cached: Yes (5 minutes)

---

### 3. Get Event by ID
**Endpoint:** `GET /api/events/:id`  
**Authentication:** Optional  
**Description:** Get detailed information about a specific event

**Path Parameters:**
- `id` (number): Event ID

**Example Request:**
```
GET /api/events/123
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Buenos Aires Milonga Night",
    "description": "Traditional milonga with live orchestra. Join us for an unforgettable night of tango!",
    "eventType": "milonga",
    "startDate": "2025-11-01T20:00:00Z",
    "endDate": "2025-11-02T02:00:00Z",
    "city": "Buenos Aires",
    "country": "Argentina",
    "venue": "Salon Canning",
    "address": "Scalabrini Ortiz 1331",
    "latitude": -34.5875,
    "longitude": -58.4207,
    "price": 500,
    "currency": "ARS",
    "attendeeCount": 45,
    "maxAttendees": 200,
    "imageUrl": "https://example.com/event.jpg",
    "organizerId": 7,
    "organizerName": "Elena Rodriguez",
    "isPublic": true,
    "createdAt": "2025-10-15T10:00:00Z",
    "updatedAt": "2025-10-18T14:30:00Z"
  }
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "error": "Event not found"
}
```

---

### 4. Update Event
**Endpoint:** `PATCH /api/events/:id`  
**Authentication:** Required (must be event organizer or admin)  
**Description:** Update an existing event

**Path Parameters:**
- `id` (number): Event ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Event Title",
  "price": 600,
  "maxAttendees": 250
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Updated Event Title",
    "price": 600,
    "maxAttendees": 250,
    "updatedAt": "2025-10-20T05:30:00Z"
  }
}
```

**Error Responses:**
```json
// 403 Forbidden
{
  "error": "Not authorized to update this event"
}

// 404 Not Found
{
  "error": "Event not found"
}
```

---

### 5. Delete Event
**Endpoint:** `DELETE /api/events/:id`  
**Authentication:** Required (must be event organizer or admin)  
**Description:** Delete an event (soft delete)

**Path Parameters:**
- `id` (number): Event ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Error Responses:**
```json
// 403 Forbidden
{
  "error": "Not authorized to delete this event"
}

// 404 Not Found
{
  "error": "Event not found"
}

// 409 Conflict
{
  "error": "Cannot delete event with confirmed attendees"
}
```

---

### 6. RSVP to Event
**Endpoint:** `POST /api/events/:id/rsvp`  
**Authentication:** Required  
**Description:** RSVP to an event (create or update attendance)

**Path Parameters:**
- `id` (number): Event ID

**Request Body:**
```json
{
  "status": "going"
}
```

**Status Options:**
- `going`: Confirmed attendance
- `maybe`: Tentative
- `not_going`: Declined

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "eventId": 123,
    "userId": 45,
    "status": "going",
    "attendeeCount": 46
  }
}
```

**Error Responses:**
```json
// 409 Conflict - Event Full
{
  "error": "Event is at maximum capacity"
}

// 400 Bad Request - Event Passed
{
  "error": "Cannot RSVP to past events"
}
```

---

### 7. Search Events
**Endpoint:** `GET /api/events/search`  
**Authentication:** Optional  
**Description:** Full-text search across events

**Query Parameters:**
- `q` (string): Search query (searches title, description, venue)
- `city` (string): Filter by city
- `eventType` (string): Filter by type
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `startDate` (ISO date): Events after this date
- `endDate` (ISO date): Events before this date

**Example Request:**
```
GET /api/events/search?q=tango&city=Buenos Aires&maxPrice=1000
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Buenos Aires Milonga Night",
      "description": "Traditional milonga...",
      "relevanceScore": 0.95,
      "matchedFields": ["title", "description"]
    }
  ],
  "total": 23
}
```

**Performance:**
- Indexed: Full-text search on title, description, venue
- Response time: <200ms typical
- Max results: 100 per request

---

## 👤 Profile API

### Overview
The Profile API manages user profiles, follow relationships, and profile statistics.

**Base Path:** `/api/profiles`

---

### 1. Get User Profile
**Endpoint:** `GET /api/profiles/:id`  
**Authentication:** Optional  
**Description:** Get public profile information for a user

**Path Parameters:**
- `id` (number): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "name": "Elena Rodriguez",
    "username": "elena_tango",
    "bio": "Professional tango instructor from Buenos Aires",
    "profileImage": "https://example.com/avatar.jpg",
    "backgroundImage": "https://example.com/cover.jpg",
    "city": "Buenos Aires",
    "country": "Argentina",
    "tangoRoles": ["instructor", "performer"],
    "leaderLevel": 9,
    "followerLevel": 8,
    "yearsOfDancing": 20,
    "followerCount": 1250,
    "followingCount": 380,
    "eventCount": 45,
    "postCount": 128,
    "isVerified": true,
    "joinedAt": "2023-05-15T10:00:00Z"
  }
}
```

---

### 2. Update Profile
**Endpoint:** `PATCH /api/profiles/:id`  
**Authentication:** Required (must be profile owner)  
**Description:** Update user profile information

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "city": "New York",
  "leaderLevel": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "bio": "Updated bio text",
    "city": "New York",
    "updatedAt": "2025-10-20T05:30:00Z"
  }
}
```

---

### 3. Follow User
**Endpoint:** `POST /api/profiles/:id/follow`  
**Authentication:** Required  
**Description:** Follow a user

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "followerId": 45,
    "followingId": 123,
    "isFollowing": true
  }
}
```

---

### 4. Unfollow User
**Endpoint:** `DELETE /api/profiles/:id/follow`  
**Authentication:** Required  
**Description:** Unfollow a user

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "followerId": 45,
    "followingId": 123,
    "isFollowing": false
  }
}
```

---

### 5. Get Profile Stats
**Endpoint:** `GET /api/profiles/:id/stats`  
**Authentication:** Optional  
**Description:** Get detailed statistics for a profile

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 45,
    "followers": 1250,
    "following": 380,
    "posts": 128,
    "events": 45,
    "groups": 12,
    "engagement": {
      "totalLikes": 5680,
      "totalComments": 1240,
      "averageLikesPerPost": 44.4
    }
  }
}
```

---

### 6. Search Profiles
**Endpoint:** `GET /api/profiles/search`  
**Authentication:** Optional  
**Description:** Search for users by name, username, or location

**Query Parameters:**
- `q` (string): Search query
- `city` (string): Filter by city
- `country` (string): Filter by country
- `tangoRole` (string): Filter by tango role

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "name": "Elena Rodriguez",
      "username": "elena_tango",
      "profileImage": "https://example.com/avatar.jpg",
      "city": "Buenos Aires",
      "followerCount": 1250
    }
  ],
  "total": 42
}
```

---

## 👥 Groups API

### Overview
The Groups API manages tango communities and groups, including city-based auto-groups.

**Base Path:** `/api/groups`

---

### 1. Create Group
**Endpoint:** `POST /api/groups`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "NYC Tango Lovers",
  "description": "Community for tango dancers in New York City",
  "city": "New York",
  "country": "USA",
  "isPublic": true,
  "rules": "Be respectful, share the love of tango"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 78,
    "name": "NYC Tango Lovers",
    "memberCount": 1,
    "createdAt": "2025-10-20T05:30:00Z"
  }
}
```

---

### 2. Get All Groups
**Endpoint:** `GET /api/groups`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 78,
      "name": "NYC Tango Lovers",
      "description": "Community for tango dancers...",
      "city": "New York",
      "memberCount": 245,
      "postCount": 89,
      "eventCount": 12
    }
  ]
}
```

---

### 3. Get Group by ID
**Endpoint:** `GET /api/groups/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 78,
    "name": "NYC Tango Lovers",
    "description": "Full description...",
    "memberCount": 245,
    "isMember": true,
    "isAdmin": false
  }
}
```

---

### 4. Join Group
**Endpoint:** `POST /api/groups/:id/join`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupId": 78,
    "userId": 45,
    "isMember": true,
    "memberCount": 246
  }
}
```

---

### 5. Leave Group
**Endpoint:** `POST /api/groups/:id/leave`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupId": 78,
    "userId": 45,
    "isMember": false,
    "memberCount": 245
  }
}
```

---

### 6. Get Group Members
**Endpoint:** `GET /api/groups/:id/members`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "name": "Elena Rodriguez",
      "username": "elena_tango",
      "profileImage": "https://example.com/avatar.jpg",
      "role": "admin",
      "joinedAt": "2025-05-10T10:00:00Z"
    }
  ],
  "total": 245
}
```

---

### 7. Get Group Posts
**Endpoint:** `GET /api/groups/:id/posts`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 567,
      "content": "Great milonga last night!",
      "authorId": 45,
      "authorName": "Elena Rodriguez",
      "createdAt": "2025-10-19T22:00:00Z",
      "likeCount": 23,
      "commentCount": 5
    }
  ],
  "total": 89
}
```

---

### 8. Get Group Events
**Endpoint:** `GET /api/groups/:id/events`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "NYC Milonga Night",
      "startDate": "2025-11-01T20:00:00Z",
      "attendeeCount": 45
    }
  ],
  "total": 12
}
```

---

## 🔐 Authentication

All authenticated endpoints require a valid session cookie obtained through Replit OAuth.

**Session Header:**
```
Cookie: connect.sid=<session_id>
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}

// 403 Forbidden
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

---

## 📊 Rate Limiting

- **Anonymous users:** 100 requests/15 minutes
- **Authenticated users:** 1000 requests/15 minutes
- **Headers:**
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## 🐛 Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": ["Additional context"],
  "timestamp": "2025-10-20T05:30:00Z"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Business logic conflict
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

**Last Updated:** October 20, 2025  
**API Version:** 1.0.0  
**Maintained By:** Mundo Tango Development Team
