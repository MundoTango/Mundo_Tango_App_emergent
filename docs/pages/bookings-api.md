# Bookings API Reference

## Overview

Complete API reference for the housing booking system, covering booking creation, retrieval, status updates, and enrichment.

## Base URL

All endpoints are relative to: `https://your-domain.com/api`

## Authentication

All endpoints require authentication via session or JWT token:

```http
Cookie: connect.sid=your-session-token
```

Or:

```http
Authorization: Bearer your-jwt-token
```

## Endpoints

### Create Booking Request

Create a new booking request for a property.

**Endpoint:** `POST /bookings`

**Request Body:**
```typescript
{
  hostHomeId: number;        // Required - Property ID
  checkInDate: string;       // Required - ISO 8601 date (e.g., "2025-10-15T00:00:00.000Z")
  checkOutDate: string;      // Required - ISO 8601 date
  guestCount: number;        // Required - Number of guests (1-20)
  purpose: string;           // Optional - Purpose of visit
  message: string;           // Optional - Message to host
  hasReadRules: boolean;     // Required - Must be true
}
```

**Validation Rules:**
- `checkInDate` must be in the future
- `checkOutDate` must be after `checkInDate`
- `guestCount` must be between 1 and property's max guests
- `hasReadRules` must be true
- `hostHomeId` must reference existing property

**Response:** `201 Created`
```typescript
{
  success: true;
  booking: {
    id: number;
    guestId: number;
    hostHomeId: number;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    purpose: string;
    message: string;
    hasReadRules: boolean;
    status: "pending";
    totalPrice: number;        // Calculated in cents
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}
```

**Example Request:**
```bash
curl -X POST https://your-domain.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=session-token" \
  -d '{
    "hostHomeId": 1,
    "checkInDate": "2025-10-15T00:00:00.000Z",
    "checkOutDate": "2025-10-17T00:00:00.000Z",
    "guestCount": 2,
    "purpose": "Tango workshop/festival",
    "message": "Looking forward to staying at your place!",
    "hasReadRules": true
  }'
```

**Error Responses:**

`400 Bad Request` - Validation failed
```json
{
  "success": false,
  "error": "Check-in date must be in the future"
}
```

`404 Not Found` - Property not found
```json
{
  "success": false,
  "error": "Property not found"
}
```

---

### Get Bookings

Retrieve bookings for the authenticated user.

**Endpoint:** `GET /bookings`

**Query Parameters:**
- `role` - Filter by role (optional)
  - `guest` - Bookings where user is the guest
  - `host` - Bookings where user is the host
  - Omit to get all bookings

**Response:** `200 OK`
```typescript
{
  success: true;
  bookings: EnrichedBooking[];
}

interface EnrichedBooking {
  // Core booking fields
  id: number;
  guestId: number;
  hostHomeId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  purpose: string;
  message: string;
  hasReadRules: boolean;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  hostResponse: string | null;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  
  // Enriched property data
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string | null;
  
  // Enriched guest data (flat fields)
  guestName: string;
  guestEmail: string;
  guestAvatar: string | null;
  
  // Calculated fields
  nights: number;
  
  // Full objects for navigation
  hostHome: {
    id: number;
    title: string;
    address: string;
    city: string;
    country: string;
    location: string;
    photos: string[];
    pricePerNight: number;
  } | null;
  
  // Nested guest object (added Oct 2025)
  guest: {
    id: number;
    name: string;
    profileImage: string | null;
  } | null;
}
```

**Example Request:**
```bash
# Get all bookings where user is guest
curl https://your-domain.com/api/bookings?role=guest \
  -H "Cookie: connect.sid=session-token"

# Get all bookings where user is host
curl https://your-domain.com/api/bookings?role=host \
  -H "Cookie: connect.sid=session-token"

# Get all bookings (both guest and host)
curl https://your-domain.com/api/bookings \
  -H "Cookie: connect.sid=session-token"
```

**Data Enrichment:**

The API automatically enriches each booking with:
1. **Property Information** - Title, location, primary photo from `hostHomes` table
2. **Guest Information** - Name, email, avatar from `users` table
3. **Calculated Nights** - Duration between check-in and check-out
4. **Full Property Object** - Complete property details for navigation

**Example Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 2,
      "guestId": 1,
      "hostHomeId": 1,
      "checkInDate": "2025-10-15T00:00:00.000Z",
      "checkOutDate": "2025-10-17T00:00:00.000Z",
      "guestCount": 2,
      "purpose": "Tango workshop/festival",
      "message": "Looking forward to staying!",
      "hasReadRules": true,
      "status": "pending",
      "hostResponse": null,
      "totalPrice": 15000,
      "createdAt": "2025-10-04T20:59:31.533Z",
      "updatedAt": "2025-10-04T20:59:31.533Z",
      "respondedAt": null,
      "propertyTitle": "Cozy Tango Apartment in Palermo",
      "propertyLocation": "Buenos Aires, Argentina",
      "propertyImage": "/uploads/tango-apartment-1.jpg",
      "guestName": "Elena Rodriguez",
      "guestEmail": "elena@example.com",
      "guestAvatar": null,
      "nights": 2,
      "hostHome": {
        "id": 1,
        "title": "Cozy Tango Apartment in Palermo",
        "location": "Buenos Aires, Argentina",
        "photos": [
          "/uploads/tango-apartment-1.jpg",
          "/uploads/tango-apartment-2.jpg"
        ],
        "pricePerNight": 7500
      }
    }
  ]
}
```

---

### Get Single Booking

Retrieve details for a specific booking.

**Endpoint:** `GET /bookings/:id`

**Path Parameters:**
- `id` - Booking ID (number)

**Authorization:**
- User must be either the guest or the host

**Response:** `200 OK`
```typescript
{
  success: true;
  booking: EnrichedBooking;
}
```

**Example Request:**
```bash
curl https://your-domain.com/api/bookings/2 \
  -H "Cookie: connect.sid=session-token"
```

**Error Responses:**

`404 Not Found` - Booking doesn't exist
```json
{
  "success": false,
  "error": "Booking not found"
}
```

`403 Forbidden` - User not authorized
```json
{
  "success": false,
  "error": "Not authorized to view this booking"
}
```

---

### Update Booking Status (Host Response)

Host accepts or rejects a booking request.

**Endpoint:** `PATCH /bookings/:id/respond`

**Path Parameters:**
- `id` - Booking ID (number)

**Request Body:**
```typescript
{
  status: "confirmed" | "rejected";  // Required
  hostResponse?: string;             // Optional message to guest
}
```

**Authorization:**
- User must be the property owner
- Booking must be in "pending" status

**Response:** `200 OK`
```typescript
{
  success: true;
  booking: EnrichedBooking;
  message: string;
}
```

**Example Request:**
```bash
# Accept booking
curl -X PATCH https://your-domain.com/api/bookings/2/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=session-token" \
  -d '{
    "status": "confirmed",
    "hostResponse": "Welcome! Looking forward to hosting you."
  }'

# Reject booking
curl -X PATCH https://your-domain.com/api/bookings/2/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=session-token" \
  -d '{
    "status": "rejected",
    "hostResponse": "Sorry, those dates are no longer available."
  }'
```

**Error Responses:**

`400 Bad Request` - Invalid status or booking already responded
```json
{
  "success": false,
  "error": "Booking has already been responded to"
}
```

`403 Forbidden` - User not authorized
```json
{
  "success": false,
  "error": "Only property owner can respond to booking"
}
```

---

### Cancel Booking (Guest)

Guest cancels their pending booking request.

**Endpoint:** `DELETE /bookings/:id`

**Path Parameters:**
- `id` - Booking ID (number)

**Authorization:**
- User must be the booking guest
- Booking must be in "pending" status

**Response:** `200 OK`
```typescript
{
  success: true;
  message: "Booking cancelled successfully";
}
```

**Example Request:**
```bash
curl -X DELETE https://your-domain.com/api/bookings/2 \
  -H "Cookie: connect.sid=session-token"
```

**Error Responses:**

`400 Bad Request` - Cannot cancel
```json
{
  "success": false,
  "error": "Cannot cancel confirmed booking. Please contact host."
}
```

`403 Forbidden` - User not authorized
```json
{
  "success": false,
  "error": "Only guest can cancel their booking"
}
```

---

### Get Property Calendar

Retrieve calendar events for a property (bookings, blocks).

**Endpoint:** `GET /host-homes/:propertyId/calendar`

**Path Parameters:**
- `propertyId` - Property ID (number)

**Query Parameters:**
- `month` - Month to retrieve (YYYY-MM format, default: current month)

**Authorization:**
- User must be the property owner

**Response:** `200 OK`
```typescript
{
  success: true;
  events: CalendarEvent[];
  stats: {
    occupancyRate: number;
    totalNights: number;
    bookedNights: number;
    revenue: number;
  };
}

interface CalendarEvent {
  id: number;
  type: "booking" | "pending" | "blocked";
  startDate: string;
  endDate: string;
  title: string;
  guestName?: string;
  guestCount?: number;
  status: string;
  price?: number;
}
```

**Example Request:**
```bash
curl https://your-domain.com/api/host-homes/1/calendar?month=2025-10 \
  -H "Cookie: connect.sid=session-token"
```

---

## Data Models

### Booking Schema

```typescript
interface Booking {
  id: number;
  guestId: number;
  hostHomeId: number;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  purpose: string | null;
  message: string | null;
  hasReadRules: boolean;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  hostResponse: string | null;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  respondedAt: Date | null;
}
```

### Validation Schemas (Zod)

```typescript
// Create booking validation
const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  respondedAt: true,
  status: true,
  hostResponse: true,
  totalPrice: true,
}).extend({
  guestId: z.number().optional(), // Set from auth
  checkInDate: z.string().transform(str => new Date(str)),
  checkOutDate: z.string().transform(str => new Date(str)),
  hasReadRules: z.boolean().refine(val => val === true, {
    message: "You must read and accept the house rules"
  }),
});

// Update booking status validation
const updateBookingStatusSchema = z.object({
  status: z.enum(["confirmed", "rejected"]),
  hostResponse: z.string().optional(),
});
```

## Rate Limiting

All endpoints are rate-limited:
- **Booking Creation:** 10 requests per hour per user
- **Status Updates:** 20 requests per hour per user
- **GET Requests:** 100 requests per hour per user

Rate limit headers:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1696435200
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Booking date conflict |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Webhooks (Future)

Subscribe to booking events:

```typescript
// Webhook payload structure
{
  event: "booking.created" | "booking.confirmed" | "booking.rejected" | "booking.cancelled";
  timestamp: string;
  data: {
    booking: EnrichedBooking;
  };
}
```

## See Also

- [Booking System](./booking-system.md) - Complete guest journey
- [Host Dashboard](./host-dashboard.md) - Host management interface
- [Calendar System](./calendar-system.md) - Visual calendar features
- [Housing Marketplace](./housing/index.md) - Property discovery
