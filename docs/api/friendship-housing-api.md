# Friendship-Based Housing Access Control API

**ESA LIFE CEO 61x21 Framework - Layer 59: Documentation Steward**

This document specifies the API endpoints for the friendship-based housing access control system integrated with Mundo Tango platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Schemas](#data-schemas)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Overview

The Friendship-Based Housing API provides three core endpoints for managing friendship-aware property access controls:

- **Connection Information**: Retrieve friendship connection details between users
- **Booking Restrictions**: Manage property-level access restrictions based on friendship
- **Enhanced Booking Validation**: Validate booking requests against friendship requirements

**Base URL**: `/api`

**Version**: 1.0.0

**Date**: October 2025

---

## Authentication

All endpoints require authentication via session cookies or JWT tokens. Unauthenticated requests will receive `401 Unauthorized`.

**Authentication Methods:**
- Session-based (primary): Cookie `connect.sid`
- JWT (secondary): Header `Authorization: Bearer <token>`
- Replit OAuth (auto-login in development)

---

## API Endpoints

### 1. Get Connection Information

Retrieves friendship connection details between a user and a property host.

#### Endpoint

```
GET /api/users/:userId/connection-info/:hostId
```

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `userId` | integer | path | Yes | ID of the requesting user |
| `hostId` | integer | path | Yes | ID of the property host |

#### Response Schema

**Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "connectionDegree": 1,
    "closenessScore": 85,
    "mutualFriends": 3,
    "sharedMemories": 12,
    "isConnected": true,
    "lastInteraction": "2025-10-01T14:30:00.000Z",
    "interactionCount": 25
  }
}
```

#### Field Definitions

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `connectionDegree` | integer | -1, 1, 2, 3 | Friendship degree: -1 (not connected), 1 (direct friend), 2 (friend of friend), 3 (3rd degree) |
| `closenessScore` | integer | 0-100 | Calculated friendship closeness score with temporal decay |
| `mutualFriends` | integer | 0+ | Number of mutual friends between user and host |
| `sharedMemories` | integer | 0+ | Number of shared memories/posts mentioning both users |
| `isConnected` | boolean | - | True if connectionDegree >= 1 |
| `lastInteraction` | string (ISO 8601) | - | Timestamp of last friendship interaction |
| `interactionCount` | integer | 0+ | Total number of tracked interactions |

#### Closeness Score Calculation

**Formula:**
```
closenessScore = Σ(activity_weight × temporal_decay_factor)
```

**Activity Weights:**
- `became_friends`: 1.0 (base friendship)
- `danced_together`: 2.0 (high engagement)
- `attended_event`: 1.5 (medium engagement)
- `messaged`: 0.5 (low engagement)
- `shared_memory`: 2.5 (highest engagement)

**Temporal Decay:**
- 0-30 days: 100% weight
- 31-90 days: 75% weight
- 91-180 days: 50% weight
- 180+ days: 25% weight

#### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "error": "USER_NOT_FOUND"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "UNAUTHORIZED"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to retrieve connection information",
  "error": "INTERNAL_ERROR"
}
```

#### Example Usage

**Request:**
```bash
curl -X GET \
  'http://localhost:5000/api/users/7/connection-info/1' \
  -H 'Cookie: connect.sid=...' \
  -H 'Accept: application/json'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connectionDegree": 1,
    "closenessScore": 85,
    "mutualFriends": 3,
    "sharedMemories": 12,
    "isConnected": true,
    "lastInteraction": "2025-10-01T14:30:00.000Z",
    "interactionCount": 25
  }
}
```

---

### 2. Update Booking Restrictions

Update friendship-based booking restrictions for a property.

#### Endpoint

```
PATCH /api/host-homes/:id/booking-restrictions
```

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Property ID |

#### Request Body Schema

```json
{
  "whoCanBook": "1st_degree",
  "minimumClosenessScore": 50,
  "allowUnconnected": false
}
```

#### Request Fields

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| `whoCanBook` | string | Yes | `anyone`, `1st_degree`, `2nd_degree`, `3rd_degree`, `custom` | Who can book this property |
| `minimumClosenessScore` | integer | Conditional | 0-100 | Required if `whoCanBook` is `custom` |
| `allowUnconnected` | boolean | No | true, false | Allow bookings from unconnected users (default: true for `anyone`, false otherwise) |

#### Booking Restriction Types

| Type | Description | Requirements |
|------|-------------|--------------|
| `anyone` | Anyone can book | No friendship required |
| `1st_degree` | Direct friends only | `connectionDegree === 1` |
| `2nd_degree` | Friends & friends of friends | `connectionDegree >= 1 && connectionDegree <= 2` |
| `3rd_degree` | Extended network | `connectionDegree >= 1 && connectionDegree <= 3` |
| `custom` | Custom closeness score | `closenessScore >= minimumClosenessScore` |

#### Response Schema

**Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "whoCanBook": "1st_degree",
    "minimumClosenessScore": 50,
    "allowUnconnected": false
  }
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid booking restriction type",
  "error": "INVALID_RESTRICTION"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You are not the host of this property",
  "error": "FORBIDDEN"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Property not found",
  "error": "PROPERTY_NOT_FOUND"
}
```

#### Example Usage

**Request:**
```bash
curl -X PATCH \
  'http://localhost:5000/api/host-homes/1/booking-restrictions' \
  -H 'Cookie: connect.sid=...' \
  -H 'Content-Type: application/json' \
  -d '{
    "whoCanBook": "1st_degree",
    "minimumClosenessScore": null,
    "allowUnconnected": false
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "whoCanBook": "1st_degree",
    "minimumClosenessScore": null,
    "allowUnconnected": false
  }
}
```

---

### 3. Create Booking (Enhanced with Friendship Validation)

Create a booking request with automatic friendship-based eligibility validation.

#### Endpoint

```
POST /api/bookings
```

#### Request Body Schema

```json
{
  "hostHomeId": 1,
  "checkInDate": "2025-11-01",
  "checkOutDate": "2025-11-05",
  "guestCount": 2,
  "purpose": "Tango Festival",
  "message": "Excited to attend the tango festival!",
  "agreedToRules": true
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hostHomeId` | integer | Yes | Property ID to book |
| `checkInDate` | string (YYYY-MM-DD) | Yes | Check-in date |
| `checkOutDate` | string (YYYY-MM-DD) | Yes | Check-out date |
| `guestCount` | integer | Yes | Number of guests (must be <= property maxGuests) |
| `purpose` | string | Yes | Purpose of stay |
| `message` | string | Yes | Message to host |
| `agreedToRules` | boolean | Yes | Must be true |

#### Automatic Validation

The endpoint performs these validations:

1. **Date Validation**: Check-out must be after check-in, no past dates
2. **Guest Count**: Must not exceed property max guests
3. **Availability**: Property must not be blocked/booked for requested dates
4. **Friendship Eligibility**: Validates against property's `whoCanBook` setting

**Friendship Validation Logic:**

```javascript
if (whoCanBook === 'anyone') {
  // No friendship check
} else if (whoCanBook === '1st_degree') {
  if (connectionDegree !== 1) throw Error('1st degree friends only');
} else if (whoCanBook === '2nd_degree') {
  if (connectionDegree < 1 || connectionDegree > 2) throw Error('2nd degree or closer');
} else if (whoCanBook === '3rd_degree') {
  if (connectionDegree < 1 || connectionDegree > 3) throw Error('3rd degree or closer');
} else if (whoCanBook === 'custom') {
  if (closenessScore < minimumClosenessScore) throw Error('Minimum closeness score not met');
}
```

#### Response Schema

**Success (201 Created):**

```json
{
  "success": true,
  "booking": {
    "id": 42,
    "hostHomeId": 1,
    "guestId": 7,
    "checkInDate": "2025-11-01T00:00:00.000Z",
    "checkOutDate": "2025-11-05T00:00:00.000Z",
    "guestCount": 2,
    "purpose": "Tango Festival",
    "message": "Excited to attend the tango festival!",
    "status": "pending",
    "connectionInfo": {
      "connectionDegree": 1,
      "closenessScore": 85,
      "snapshotAt": "2025-10-04T22:45:00.000Z"
    },
    "createdAt": "2025-10-04T22:45:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors:**

```json
{
  "success": false,
  "message": "Guest count exceeds maximum",
  "error": "GUEST_COUNT_EXCEEDED"
}
```

**403 Forbidden - Friendship Not Met:**

```json
{
  "success": false,
  "message": "This property requires 1st degree friendship. Your connection: Not connected",
  "error": "FRIENDSHIP_REQUIREMENT_NOT_MET",
  "details": {
    "required": "1st_degree",
    "actual": -1,
    "minimumClosenessScore": null
  }
}
```

**409 Conflict - Property Unavailable:**

```json
{
  "success": false,
  "message": "Property is not available for the selected dates",
  "error": "PROPERTY_UNAVAILABLE"
}
```

#### Example Usage

**Request:**
```bash
curl -X POST \
  'http://localhost:5000/api/bookings' \
  -H 'Cookie: connect.sid=...' \
  -H 'Content-Type: application/json' \
  -d '{
    "hostHomeId": 1,
    "checkInDate": "2025-11-01",
    "checkOutDate": "2025-11-05",
    "guestCount": 2,
    "purpose": "Tango Festival",
    "message": "Excited to attend the tango festival!",
    "agreedToRules": true
  }'
```

**Success Response:**
```json
{
  "success": true,
  "booking": {
    "id": 42,
    "status": "pending",
    "connectionInfo": {
      "connectionDegree": 1,
      "closenessScore": 85
    }
  }
}
```

---

## Data Schemas

### Connection Degree Type

```typescript
type ConnectionDegree = -1 | 1 | 2 | 3;

// -1: Not connected
//  1: 1st degree (direct friend)
//  2: 2nd degree (friend of friend)
//  3: 3rd degree (extended network)
```

### Booking Restriction Types

```typescript
type WhoCanBook = 'anyone' | '1st_degree' | '2nd_degree' | '3rd_degree' | 'custom';
```

### Database Schema Additions

**Table: `friends`**
```sql
ALTER TABLE friends ADD COLUMN last_interaction_at TIMESTAMP;
ALTER TABLE friends ADD COLUMN interaction_count INTEGER DEFAULT 0;
```

**Table: `host_homes`**
```sql
ALTER TABLE host_homes ADD COLUMN who_can_book VARCHAR(20) DEFAULT 'anyone';
ALTER TABLE host_homes ADD COLUMN minimum_closeness_score INTEGER;
ALTER TABLE host_homes ADD COLUMN allow_unconnected BOOLEAN DEFAULT TRUE;
```

**Table: `guest_bookings`**
```sql
ALTER TABLE guest_bookings ADD COLUMN connection_info JSONB;
```

---

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "details": { /* Optional additional context */ }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | User lacks permission |
| `USER_NOT_FOUND` | 404 | User ID does not exist |
| `PROPERTY_NOT_FOUND` | 404 | Property ID does not exist |
| `INVALID_RESTRICTION` | 400 | Invalid whoCanBook value |
| `GUEST_COUNT_EXCEEDED` | 400 | Too many guests for property |
| `INVALID_DATES` | 400 | Check-in/out dates invalid |
| `PROPERTY_UNAVAILABLE` | 409 | Property booked/blocked |
| `FRIENDSHIP_REQUIREMENT_NOT_MET` | 403 | User doesn't meet friendship criteria |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

**Current Implementation:** None (planned for future)

**Recommended Limits:**
- Connection info endpoint: 100 requests/minute per user
- Booking creation: 10 requests/minute per user
- Restriction updates: 20 requests/minute per host

---

## Integration Examples

### Frontend React Integration

**Fetching Connection Info with TanStack Query:**

```typescript
import { useQuery } from '@tanstack/react-query';

const { data: connectionData } = useQuery({
  queryKey: [`/api/users/${userId}/connection-info/${hostId}`],
  enabled: !!userId && !!hostId,
});

const { connectionDegree, closenessScore } = connectionData?.data || {};
```

**Updating Booking Restrictions:**

```typescript
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@lib/queryClient';

const updateRestrictionsMutation = useMutation({
  mutationFn: async (data) => {
    return apiRequest(`/api/host-homes/${propertyId}/booking-restrictions`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries([`/api/host-homes/${propertyId}`]);
  },
});
```

---

## Changelog

**Version 1.0.0 - October 2025**
- Initial release of friendship-based housing API
- Three core endpoints implemented
- Closeness score algorithm with temporal decay
- Connection degree standardization (numeric system)

---

## Support

For questions or issues:
- **Technical Support**: support@mundotango.life
- **Developer Documentation**: docs.mundotango.life
- **GitHub Issues**: github.com/mundotango/platform

---

**Document Version**: 1.0.0  
**Last Updated**: October 4, 2025  
**Framework**: ESA LIFE CEO 61x21 - Layer 59: Documentation Steward
