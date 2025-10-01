# Groups API Documentation

**Last Updated:** October 1, 2025  
**Base URL:** `/api`  
**Authentication:** JWT (most endpoints require authentication)

---

## Group Endpoints

### List All Groups
```http
GET /api/groups
```

**Authentication:** Optional (shows membership status if authenticated)

**Query Parameters:**
- None (returns all groups)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Buenos Aires Tango Community",
      "slug": "buenos-aires-tango",
      "description": "The heart of tango culture",
      "type": "city",
      "role_type": "member",
      "city": "Buenos Aires",
      "country": "Argentina",
      "latitude": -34.6037,
      "longitude": -58.3816,
      "emoji": "🌟",
      "member_count": 3456,
      "image_url": "/images/groups/buenos-aires.jpg",
      "is_private": false,
      "membership_status": "member",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Group by Slug
```http
GET /api/groups/:slug
```

**Authentication:** Optional (shows restricted content if authenticated)

**URL Parameters:**
- `slug` (string, required) - Group slug identifier

**Response:**
```json
{
  "id": 1,
  "name": "Buenos Aires Tango Community",
  "slug": "buenos-aires-tango",
  "type": "city",
  "city": "Buenos Aires",
  "country": "Argentina",
  "description": "Welcome to the Buenos Aires tango community...",
  "member_count": 3456,
  "event_count": 127,
  "is_private": false,
  "visibility": "public",
  "membership_status": "member",
  "user_role": "admin"
}
```

---

### Join Group (Slug-based)
```http
POST /api/user/join-group/:slug
```

**Authentication:** Required

**URL Parameters:**
- `slug` (string, required) - Group slug identifier

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Joined group successfully"
}
```

**Error Responses:**
- `400` - Already a member
- `401` - User not found
- `404` - Group not found

---

### Leave Group (Slug-based)
```http
POST /api/user/leave-group/:slug
```

**Authentication:** Required

**URL Parameters:**
- `slug` (string, required) - Group slug identifier

**Response:**
```json
{
  "success": true,
  "message": "Left group successfully"
}
```

---

### Follow City (City Groups Only)
```http
POST /api/user/follow-city/:slug
```

**Authentication:** Required

**URL Parameters:**
- `slug` (string, required) - City group slug identifier

**Response:**
```json
{
  "success": true,
  "message": "Following city successfully"
}
```

**Error Responses:**
- `400` - Already following this city
- `404` - City group not found

---

### Get Group Members
```http
GET /api/groups/:groupId/members
```

**Authentication:** Optional

**URL Parameters:**
- `groupId` (integer, required) - Group ID

**Response:**
```json
[
  {
    "user": {
      "id": 7,
      "name": "Elena Rodriguez",
      "username": "elena_tango",
      "profileImage": "/uploads/profiles/elena.jpg",
      "firstName": "Elena",
      "lastName": "Rodriguez"
    },
    "role": "admin",
    "joinedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Group Posts
```http
GET /api/groups/:groupId/posts
```

**Authentication:** Optional

**URL Parameters:**
- `groupId` (string, required) - Group slug or ID

**Query Parameters:**
- `filter` (string, optional) - Filter type: `all`, `residents`, `visitors`, `members`, `non-members`
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Posts per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "userId": 7,
      "content": "Amazing milonga tonight!",
      "imageUrl": "/uploads/posts/123.jpg",
      "videoUrl": null,
      "mediaEmbeds": [],
      "mentions": ["@group:buenos-aires-tango"],
      "location": "Buenos Aires, Argentina",
      "visibility": "public",
      "likesCount": 42,
      "commentsCount": 8,
      "createdAt": "2025-10-01T20:00:00Z",
      "user": {
        "id": 7,
        "firstName": "Elena",
        "lastName": "Rodriguez",
        "profileImage": "/uploads/profiles/elena.jpg"
      }
    }
  ]
}
```

---

## Host Homes Endpoints (City Groups Only)

### List Host Homes
```http
GET /api/host-homes
```

**Authentication:** Optional

**Query Parameters:**
- `city` (string, optional) - Filter by city name
- `country` (string, optional) - Filter by country
- `groupSlug` (string, optional) - Associated group slug

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "hostId": 7,
      "title": "Cozy Apartment in San Telmo",
      "description": "Perfect for tango enthusiasts...",
      "address": "Defensa 1234",
      "city": "Buenos Aires",
      "state": "Buenos Aires",
      "country": "Argentina",
      "lat": -34.6212,
      "lng": -58.3731,
      "pricePerNight": 5000,
      "maxGuests": 2,
      "amenities": ["wifi", "kitchen", "air-conditioning"],
      "photos": ["/uploads/homes/1/photo1.jpg"],
      "availability": {},
      "isActive": true,
      "createdAt": "2024-08-15T00:00:00Z",
      "host": {
        "id": 7,
        "firstName": "Elena",
        "lastName": "Rodriguez",
        "profileImage": "/uploads/profiles/elena.jpg"
      }
    }
  ]
}
```

---

### Get Host Home Details
```http
GET /api/host-homes/:id
```

**Authentication:** Optional

**URL Parameters:**
- `id` (integer, required) - Host home ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "hostId": 7,
    "title": "Cozy Apartment in San Telmo",
    "description": "Perfect for tango enthusiasts visiting Buenos Aires...",
    "address": "Defensa 1234",
    "city": "Buenos Aires",
    "state": "Buenos Aires",
    "country": "Argentina",
    "lat": -34.6212,
    "lng": -58.3731,
    "pricePerNight": 5000,
    "maxGuests": 2,
    "amenities": ["wifi", "kitchen", "air-conditioning", "parking"],
    "photos": [
      "/uploads/homes/1/photo1.jpg",
      "/uploads/homes/1/photo2.jpg"
    ],
    "availability": {
      "2025-10": ["2025-10-15", "2025-10-16", "2025-10-17"]
    },
    "isActive": true,
    "createdAt": "2024-08-15T00:00:00Z",
    "host": {
      "id": 7,
      "firstName": "Elena",
      "lastName": "Rodriguez",
      "profileImage": "/uploads/profiles/elena.jpg",
      "email": "elena@example.com"
    }
  }
}
```

**Error Responses:**
- `404` - Host home not found

---

## Recommendations Endpoint

### Get Recommendations
```http
GET /api/recommendations
```

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "recommendations": []
}
```

**Note:** Currently returns empty array. AI-powered recommendations are in development.

---

## Group Type Reference

### City Groups
- **type:** `city`
- **role_type:** `member`
- **Features:** Housing, Recommendations, location-based content
- **Example:** Buenos Aires Tango Community

### Professional Groups
- **type:** `professional`
- **role_type:** `dj`, `instructor`, `organizer`, `musician`, `performer`
- **Features:** Role-specific networking, events, discussions
- **Example:** Tango DJs Network

### Practice Groups
- **type:** `practice`
- **Features:** Practice sessions, technique sharing

### Festival Groups
- **type:** `festival`
- **Features:** Festival coordination, attendee management

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid data, already member, etc.) |
| 401 | Unauthorized (authentication required) |
| 404 | Not Found (group/resource doesn't exist) |
| 500 | Internal Server Error |

---

## Rate Limiting

All endpoints are subject to rate limiting:
- Anonymous requests: 100 requests per 15 minutes
- Authenticated requests: 1000 requests per 15 minutes

---

## Notes

1. **Slug vs ID:** Most user-facing endpoints use slugs, while internal endpoints may use numeric IDs
2. **Membership Status:** Returned when user is authenticated
3. **City-Specific Features:** Housing and recommendations endpoints are designed for city groups
4. **Real-time Updates:** Join/leave actions trigger WebSocket events for live member count updates
