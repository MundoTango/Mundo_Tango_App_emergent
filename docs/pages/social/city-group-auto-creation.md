# City Group Auto-Creation System

**Last Updated**: October 3, 2025  
**Status**: Production Ready ✅  
**Services**: `CityAutoCreationService`, `eventGroupService`

## Overview

The City Group Auto-Creation System automatically creates and manages city-based community groups when users interact with location-based features. This includes event creation, user registration, and recommendation submissions. The system ensures every city mentioned in the platform has a corresponding group with accurate geocoding data.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Event/User/Recommendation                 │
│                    (Triggers city creation)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CityAutoCreationService                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Normalize city name                              │  │
│  │  2. Check cache for existing group                   │  │
│  │  3. Query database with NULL-safe comparison         │  │
│  │  4. Geocode via Nominatim API (with cache/throttle)  │  │
│  │  5. Create group with retry logic                    │  │
│  │  6. Handle race conditions gracefully                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  Unique Constraint: (type, LOWER(city), LOWER(country))    │
│  With NULL handling: COALESCE(country, '')                  │
└─────────────────────────────────────────────────────────────┘
```

## Critical Fixes (October 3, 2025)

### 1. Country Parameter Disambiguation

**Problem**: City names alone are ambiguous (Paris, France vs Paris, Texas).

**Solution**: Thread country parameter through entire call chain:

```typescript
// Event creation flow
autoAssociateEventWithCityGroup(event) 
  → processEventCity(city, userId, country) 
  → createOrGetCityGroup(city, trigger, userId, country)
  → geocodeCity(`${city}, ${country}`)
```

**Implementation**:
```typescript
static async processEventCity(
  cityName: string, 
  userId: number, 
  country?: string  // ✅ Now accepts country
): Promise<number | null> {
  const result = await this.createOrGetCityGroup(
    cityName, 
    'event', 
    userId, 
    country  // ✅ Passed to geocoding
  );
  return result?.groupId || null;
}
```

### 2. Geocoding Cache & Rate Limiting

**Problem**: Every event creation hit OpenStreetMap Nominatim API directly, risking account blocks.

**Solution**: In-memory cache with rate limiting:

```typescript
private static geocodeCache: Map<string, { 
  data: GeocodingResult | null; 
  timestamp: number 
}> = new Map();

private static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
private static MIN_GEOCODING_DELAY = 1000; // 1 second
private static lastGeocodingCall = 0;
```

**Cache Behavior**:
- ✅ Caches both successful and failed geocoding attempts
- ✅ 24-hour TTL prevents stale data while minimizing API calls
- ✅ 1-second minimum delay between API calls (Nominatim usage policy)
- ✅ Prevents retry storms on geocoding failures

**Example Flow**:
```typescript
// First request: Paris, France
geocodeCity("Paris, France")  
  → API call (wait 1s)
  → Cache result
  → Return { lat: 48.8566, lon: 2.3522 }

// Second request: Paris, France (5 minutes later)
geocodeCity("Paris, France")
  → Cache hit! ✅
  → Return { lat: 48.8566, lon: 2.3522 }
  → No API call made
```

### 3. Race Condition Protection

**Problem**: Two simultaneous events for the same city could create duplicate groups.

**Database Constraint**:
```sql
CREATE UNIQUE INDEX unique_city_group_idx 
ON groups (
  type, 
  LOWER(city), 
  LOWER(COALESCE(country, ''))  -- ✅ NULL-safe
) 
WHERE type = 'city';
```

**Application-Level Retry Logic**:
```typescript
try {
  [newGroup] = await db.insert(groups).values({...}).returning();
} catch (error: any) {
  // Detect duplicate key violation (PostgreSQL error 23505)
  if (error.code === '23505' || 
      error.message?.includes('duplicate key')) {
    
    // Retry: fetch existing group with NULL-safe comparison
    const retryCheck = await db
      .select()
      .from(groups)
      .where(
        and(
          eq(groups.type, 'city'),
          sql`LOWER(${groups.city}) = LOWER(${normalizedCity})`,
          sql`LOWER(COALESCE(${groups.country}, '')) = 
              LOWER(COALESCE(${resolvedCountry || ''}, ''))`
        )
      )
      .limit(1);
    
    if (retryCheck.length > 0) {
      return { groupId: retryCheck[0].id, created: false };
    }
  }
  throw error;
}
```

**NULL Handling**: The constraint uses `COALESCE(country, '')` to treat NULL countries as empty strings, ensuring NULL-based duplicates are prevented.

## Trigger Points

### 1. Event Creation (`eventGroupService.ts`)

```typescript
export async function autoAssociateEventWithCityGroup(
  event: { city: string; country?: string; userId?: number }
): Promise<void> {
  const cityGroup = await db
    .select()
    .from(groups)
    .where(
      and(
        eq(groups.type, 'city'),
        sql`LOWER(${groups.city}) = LOWER(${event.city})`,
        sql`LOWER(COALESCE(${groups.country}, '')) = 
            LOWER(COALESCE(${event.country || ''}, ''))`
      )
    )
    .limit(1);

  if (cityGroup.length === 0) {
    // Auto-create city group
    const createdGroupId = await CityAutoCreationService.processEventCity(
      event.city,
      event.userId || 1,
      event.country || undefined  // ✅ Pass country
    );
    
    if (createdGroupId) {
      event.groupId = createdGroupId;
    }
  }
}
```

### 2. User Registration

Automatically adds users to their city group during onboarding:

```typescript
static async processRegistrationCity(
  cityName: string, 
  userId: number
): Promise<boolean> {
  const result = await this.createOrGetCityGroup(
    cityName, 
    'registration', 
    userId
  );
  
  if (result?.created) {
    // Make user admin of newly created city group
    await this.addUserToGroup(result.groupId, userId, 'admin');
  }
  
  return !!result;
}
```

### 3. Recommendation Submissions

Links recommendations to city groups:

```typescript
static async processRecommendationCity(
  cityName: string, 
  userId: number
): Promise<number | null> {
  const result = await this.createOrGetCityGroup(
    cityName, 
    'recommendation', 
    userId
  );
  return result?.groupId || null;
}
```

## Data Flow

### Successful Creation (No Conflicts)

```
Event created in Paris, France
  ↓
Check database: Paris + France exists?
  ↓ NO
Check geocoding cache: "Paris, France"
  ↓ MISS
Rate limit check: 1s since last call? YES
  ↓
API call: Nominatim → {lat: 48.8566, lon: 2.3522}
  ↓
Cache result (24h TTL)
  ↓
Insert into database
  ↓
SUCCESS: Group ID 123 created
  ↓
event.groupId = 123
```

### Race Condition Scenario

```
Event A created (Paris)     Event B created (Paris)
     ↓                            ↓
Check DB: Not found         Check DB: Not found
     ↓                            ↓
Geocode: SUCCESS            Geocode: CACHE HIT ✅
     ↓                            ↓
Insert into DB              Insert into DB
     ↓                            ↓
SUCCESS ✅                   ERROR 23505 (duplicate)
Group ID 123                     ↓
                            Retry: Query DB for Paris
                                 ↓
                            Found: Group ID 123
                                 ↓
                            Return existing group ✅
```

## API Endpoints

### Get Events for City Group

```http
GET /api/groups/:slug/events
```

Returns all events associated with a city group. Supports both slug and numeric ID.

**Example**:
```bash
curl https://api.mundotango.life/api/groups/buenos-aires-argentina/events
```

**Response**:
```json
{
  "success": true,
  "events": [
    {
      "id": 1,
      "title": "Milonga at Salon Canning",
      "city": "Buenos Aires",
      "country": "Argentina",
      "groupId": 1,
      "startDate": "2025-10-15T20:00:00Z"
    }
  ]
}
```

## Database Schema

### Groups Table

```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'city',
  city VARCHAR(100),
  country VARCHAR(100),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraint prevents duplicate city groups
CREATE UNIQUE INDEX unique_city_group_idx 
ON groups (
  type, 
  LOWER(city), 
  LOWER(COALESCE(country, ''))
) 
WHERE type = 'city';

-- Performance indexes
CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_groups_city ON groups(city);
```

### Events Table

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  group_id INTEGER REFERENCES groups(id),  -- ✅ Links to city group
  user_id INTEGER REFERENCES users(id),
  start_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance index for group lookups
CREATE INDEX idx_events_group_id ON events(group_id);
```

## Configuration

### OpenStreetMap Nominatim API

**Endpoint**: `https://nominatim.openstreetmap.org/search`

**Usage Policy**:
- ✅ Maximum 1 request per second (enforced by rate limiter)
- ✅ User-Agent header required: `MundoTango/1.0 (https://mundotango.life)`
- ✅ Caching required for production use (implemented with 24h TTL)

**Query Format**:
```
https://nominatim.openstreetmap.org/search?
  q=Paris%2C%20France
  &format=json
  &addressdetails=1
  &limit=1
```

**Response**:
```json
{
  "lat": "48.8566",
  "lon": "2.3522",
  "display_name": "Paris, Île-de-France, France",
  "address": {
    "city": "Paris",
    "state": "Île-de-France",
    "country": "France",
    "country_code": "fr"
  }
}
```

## Testing

### Manual Testing

```bash
# Test event-to-group association
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "city": "Tokyo",
    "country": "Japan",
    "startDate": "2025-11-01T19:00:00Z"
  }'

# Verify city group was created
psql $DATABASE_URL -c "
  SELECT id, name, city, country, latitude, longitude 
  FROM groups 
  WHERE type = 'city' AND LOWER(city) = 'tokyo';
"

# Check event was linked to group
psql $DATABASE_URL -c "
  SELECT e.id, e.title, e.city, e.group_id, g.name as group_name
  FROM events e
  LEFT JOIN groups g ON e.group_id = g.id
  WHERE e.city = 'Tokyo';
"
```

### Race Condition Test

```bash
# Create two simultaneous events for same city
for i in {1..2}; do
  curl -X POST http://localhost:5000/api/events \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Race Test '$i'",
      "city": "Berlin",
      "country": "Germany",
      "startDate": "2025-11-01T19:00:00Z"
    }' &
done
wait

# Should only create ONE Berlin group
psql $DATABASE_URL -c "
  SELECT COUNT(*) as group_count 
  FROM groups 
  WHERE type = 'city' AND LOWER(city) = 'berlin';
"
# Expected: group_count = 1
```

### Cache Verification

```bash
# Enable debug logging
export LOG_LEVEL=debug

# First request (API call)
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "city": "Madrid", "country": "Spain"}'
# Check logs: "[Geocode] Cached result for: Madrid"

# Second request (cache hit)
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Test 2", "city": "Madrid", "country": "Spain"}'
# Check logs: "[Geocode] Using cached result for: Madrid"
```

## Monitoring

### Key Metrics

```typescript
// Geocoding cache hit rate
const cacheHitRate = cacheHits / (cacheHits + cacheMisses);
// Target: > 80%

// Duplicate group attempts
const duplicateAttempts = error23505Count;
// Target: < 1% of creation attempts

// Average geocoding time
const avgGeocodingTime = totalGeocodingTime / geocodingCount;
// Target: < 500ms (with cache)
```

### Log Examples

```
✅ SUCCESS: Created new city group: Tokyo (ID: 8) via event trigger
[Geocode] Cached result for: Tokyo
[Race condition] City group created by another request: Paris, France
[Race condition resolved] Using existing group ID: 3
```

## Troubleshooting

### Issue: Duplicate City Groups

**Symptom**: Multiple groups for the same city exist in database.

**Diagnosis**:
```sql
SELECT city, country, COUNT(*) as count
FROM groups
WHERE type = 'city'
GROUP BY city, country
HAVING COUNT(*) > 1;
```

**Resolution**:
1. Identify which group has more events/members (keep this one)
2. Delete the duplicate group
3. Ensure unique constraint is active:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'groups' 
   AND indexname = 'unique_city_group_idx';
   ```

### Issue: Geocoding Failures

**Symptom**: City groups created without latitude/longitude.

**Diagnosis**: Check logs for "Could not geocode city" messages.

**Causes**:
- Nominatim API rate limiting (> 1 request/second)
- Invalid city name
- Network timeout

**Resolution**:
1. Verify cache is working (check for "Using cached result" logs)
2. Manually geocode and update:
   ```sql
   UPDATE groups 
   SET latitude = 48.8566, longitude = 2.3522 
   WHERE id = 123;
   ```

### Issue: Race Condition Errors

**Symptom**: Error 23505 (duplicate key violation) logged repeatedly.

**Diagnosis**: Check for "[Race condition]" log messages.

**Expected Behavior**: Retry logic should resolve these automatically.

**Action Required**: None if "[Race condition resolved]" follows. If errors persist, check:
1. Unique constraint is active
2. NULL-safe comparison used in retry query
3. COALESCE function in constraint matches query logic

## Performance Considerations

### Geocoding Cache

**Memory Usage**: ~100 bytes per cached city
- 1,000 cities = ~100 KB
- 10,000 cities = ~1 MB

**Eviction Strategy**: 24-hour TTL, no LRU (coordinates don't change frequently)

### Database Queries

**Indexed Lookups**: All city group queries use index on `(type, city, country)`

**Query Plan Example**:
```sql
EXPLAIN ANALYZE
SELECT * FROM groups 
WHERE type = 'city' 
AND LOWER(city) = LOWER('Paris')
AND LOWER(COALESCE(country, '')) = LOWER('France');

-- Expected: Index Scan using unique_city_group_idx
-- Cost: ~0.1-1.0 (very fast)
```

## Future Enhancements

- [ ] Add city aliases (NYC → New York City)
- [ ] Support for multi-city events (Paris + Berlin tour)
- [ ] Automatic group merging for nearby cities
- [ ] Geocoding fallback to Google Maps API
- [ ] City group templates with pre-populated content
- [ ] Analytics: most active cities, growth trends

## Related Documentation

- [Event-Group Integration](./events-groups-integration.md)
- [Group Management (ESA Layer 22)](../esa-layers/layer-22-group-management.md)
- [PostFeed Architecture](../content/MemoryFeedUnified.md)
- [Groups API](../api/groups-api.md)

## Changelog

### October 3, 2025
- ✅ Added country parameter to prevent ambiguous city matching
- ✅ Implemented geocoding cache with 24-hour TTL
- ✅ Added 1-second rate limiting for Nominatim API compliance
- ✅ Implemented race condition protection with retry logic
- ✅ Created NULL-safe unique constraint on (type, city, country)
- ✅ Cleaned up duplicate Buenos Aires group before constraint
- ✅ All database lookups use COALESCE for NULL-safe comparison

### October 3, 2025 (Initial)
- ✅ Events automatically associate with city groups on creation
- ✅ Schema migration: events.groupId from UUID to INTEGER
- ✅ New API endpoint: GET /api/groups/:slug/events
- ✅ Database index on events.group_id
