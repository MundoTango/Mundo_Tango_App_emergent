# Geocoding System - API Reference

## Overview

This document provides detailed API reference for the geocoding system, including service methods, REST endpoints, and data structures.

## Service Layer

### CityAutoCreationService

Located: `server/services/cityAutoCreationService.ts`

#### `geocodeEventLocation(city, location, address)`

Geocodes an event location using OpenStreetMap Nominatim API.

**Parameters:**
- `city` (string): City name (e.g., "Buenos Aires")
- `location` (string, optional): Venue or location name (e.g., "Salon Canning")
- `address` (string, optional): Full address

**Returns:**
```typescript
{
  latitude: string,  // "-34.6095579"
  longitude: string  // "-58.3887904"
} | null
```

**Example:**
```typescript
const coords = await CityAutoCreationService.geocodeEventLocation(
  "Buenos Aires",
  "Salon Canning",
  "Buenos Aires, Argentina"
);

if (coords) {
  console.log(`Lat: ${coords.latitude}, Lng: ${coords.longitude}`);
}
```

**Features:**
- 24-hour caching (prevents duplicate API calls)
- Rate limiting: 2 requests/second (500ms delay)
- Smart query building (avoids city name duplication)
- Graceful error handling

**Error Handling:**
- Returns `null` on failure (no throwing)
- Logs warnings for debugging
- Continues execution (non-blocking)

---

## REST API Endpoints

### Events API

#### `GET /api/events/feed`

Fetches events with geocoded coordinates.

**Query Parameters:**
- `groupId` (integer, optional): Filter by group ID
- `limit` (integer, optional): Number of events (default: 20)
- `offset` (integer, optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Weekly Milonga at Salon Canning",
      "description": "...",
      "startDate": "2025-07-04T21:00:00.000Z",
      "endDate": "2025-07-05T02:00:00.000Z",
      "location": "Buenos Aires, Argentina",
      "city": "Buenos Aires",
      "latitude": "-34.6095579",
      "longitude": "-58.3887904",
      "eventType": "milonga",
      "maxAttendees": 150,
      "currentAttendees": 4,
      "userRsvpStatus": "going"
    }
  ]
}
```

**Notes:**
- `latitude` and `longitude` are returned as strings
- Frontend should parse as floats: `parseFloat(event.latitude)`

#### `POST /api/events`

Creates a new event with automatic geocoding.

**Request Body:**
```json
{
  "title": "Weekly Milonga",
  "description": "...",
  "startDate": "2025-07-04T21:00:00Z",
  "location": "Buenos Aires, Argentina",
  "city": "Buenos Aires",
  "eventType": "milonga",
  "groupId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "title": "Weekly Milonga",
    "latitude": "-34.6095579",
    "longitude": "-58.3887904",
    ...
  }
}
```

**Geocoding Flow:**
1. Extract `city`, `location` from request
2. Call `CityAutoCreationService.geocodeEventLocation()`
3. Store coordinates in database
4. Return event with coordinates

#### `PUT /api/events/:id`

Updates an event with automatic re-geocoding.

**Parameters:**
- `id` (integer): Event ID

**Request Body:**
```json
{
  "city": "Paris",
  "location": "Parisian Milonga Hall"
}
```

**Behavior:**
- If `city` or `location` changes, re-geocode
- Update coordinates in database
- Return updated event

---

### Housing API

#### `GET /api/host-homes`

Fetches housing listings with coordinates.

**Query Parameters:**
- `city` (string, optional): Filter by city
- `country` (string, optional): Filter by country
- `groupSlug` (string, optional): Filter by group

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Cozy Apartment in Palermo",
      "city": "Buenos Aires",
      "lat": -34.5881,
      "lng": -58.4204,
      "pricePerNight": 50,
      "maxGuests": 2,
      "host": {
        "id": 5,
        "firstName": "Elena",
        "lastName": "Rodriguez"
      }
    }
  ]
}
```

**Notes:**
- Housing uses `lat`/`lng` (REAL type) instead of `latitude`/`longitude` (TEXT)
- No type conversion needed

**⚠️ Missing Endpoints:**
- `POST /api/host-homes` - To be implemented with geocoding
- `PUT /api/host-homes/:id` - To be implemented with geocoding

---

### City Groups API

#### `GET /api/community/city-groups`

Fetches city groups with coordinates for World Map.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Buenos Aires",
      "city": "Buenos Aires",
      "country": "Argentina",
      "lat": -34.6037,
      "lng": -58.3816,
      "memberCount": 245,
      "eventCount": 12,
      "hostCount": 8
    }
  ]
}
```

**Usage:**
- Powers Tango World Map
- Already geocoded during city group creation

---

## Data Structures

### Geocoding Result (Internal)

```typescript
interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}
```

### Event Schema (Database)

```typescript
{
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }),
  latitude: text("latitude"),   // Stored as TEXT
  longitude: text("longitude"),  // Stored as TEXT
  // ... other fields
}
```

### HostHome Schema (Database)

```typescript
{
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  lat: real("lat"),    // Stored as REAL
  lng: real("lng"),    // Stored as REAL
  // ... other fields
}
```

---

## Configuration

### Environment Variables

No environment variables required. Geocoding uses OpenStreetMap's public API.

### Rate Limits

```typescript
MIN_GEOCODING_DELAY = 500  // milliseconds between requests
MAX_REQUESTS_PER_SECOND = 2
```

### Cache TTL

```typescript
CACHE_TTL = 24 * 60 * 60 * 1000  // 24 hours
```

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `null` coordinates | Geocoding failed | Event created without coordinates |
| `400` | Invalid request | Check city/location format |
| `429` | Rate limit exceeded | Internal - service handles retry |
| `500` | Server error | Check server logs |

---

## Testing

### Geocoding Test Endpoint

```bash
# Test geocoding directly
curl http://localhost:5000/api/test/geocode?city=Paris&location=Eiffel%20Tower
```

### Migration Endpoint

```bash
# Geocode all existing events
curl -X POST http://localhost:5000/api/events/geocode-all
```

**Response:**
```json
{
  "success": true,
  "geocoded": 10,
  "failed": 0,
  "results": [...]
}
```

---

## Migration Scripts

### Geocode Existing Events

```typescript
// Run via admin endpoint or script
const events = await db.select().from(events).where(eq(events.latitude, null));

for (const event of events) {
  const coords = await CityAutoCreationService.geocodeEventLocation(
    event.city,
    event.location,
    event.address
  );
  
  if (coords) {
    await db.update(events)
      .set({ 
        latitude: coords.latitude,
        longitude: coords.longitude 
      })
      .where(eq(events.id, event.id));
  }
}
```

---

## Best Practices

1. **Always validate input**: Check city/location not empty
2. **Handle null coordinates**: Display fallback UI if no coordinates
3. **Parse coordinates**: Frontend must `parseFloat()` string coordinates
4. **Respect rate limits**: Don't bypass caching
5. **Log failures**: Track geocoding failures for debugging

---

## Support

For API questions or issues, refer to:
- [Main Documentation](./index.md)
- [Component Guide](./map-components.md)
- [ESA Framework](/docs/ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md)
