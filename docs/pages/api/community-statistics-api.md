# Community Statistics API Reference

## Overview

The Community Statistics API provides real-time and aggregated data about tango communities, events, and member engagement across the Mundo Tango platform. These APIs power the Global Statistics sidebar panel, City Rankings, and various analytics dashboards.

## Authentication

All endpoints support optional authentication:
- **Authenticated**: Returns user-specific data (e.g., "Your City" statistics)
- **Unauthenticated**: Returns global data only (user-specific fields return 0)

**Authentication Method**: Session-based cookies with `credentials: 'include'`

---

## Endpoints

### 1. GET `/api/community/global-stats`

Returns real-time global platform statistics for display in the sidebar and dashboard.

#### Request
```http
GET /api/community/global-stats
```

**Query Parameters**: None

**Headers**: 
```http
Cookie: connect.sid=<session-id>
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "globalPeople": 3200,
    "activeEvents": 45,
    "communities": 89,
    "yourCity": 156
  }
}
```

**Error (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Failed to fetch global statistics"
}
```

#### Field Definitions

| Field | Type | Description | Calculation |
|-------|------|-------------|-------------|
| `globalPeople` | number | Total unique users in all city communities | `COUNT(DISTINCT group_members.userId)` across city-type groups |
| `activeEvents` | number | Number of upcoming or currently active events | Events where `end_date >= NOW()` OR (`end_date IS NULL` AND `start_date >= yesterday`) |
| `communities` | number | Total number of tango city communities | `COUNT(*)` from `groups` WHERE `type = 'city'` |
| `yourCity` | number | Total members in user's city (all groups) | `COUNT(DISTINCT userId)` from groups matching user's city location |

#### Implementation Details

**File**: `server/routes/groupRoutes.ts`

**Key Features**:
- Prevents double-counting via `COUNT(DISTINCT userId)`
- Uses Drizzle ORM with type-safe queries
- Optimized with INNER JOIN on city-type groups only
- Date filtering for active events only
- Returns 0 for user-specific fields when unauthenticated

**Performance Considerations**:
- Query time: ~150-250ms (depends on database size)
- Cacheable: Recommended 5-minute staleTime
- No pagination needed (single aggregate query)

#### Example Usage

**JavaScript/TypeScript**:
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['community', 'global-stats'],
  queryFn: async () => {
    const response = await fetch('/api/community/global-stats', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch global statistics');
    }
    const result = await response.json();
    return result.data;
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 2,
});

console.log(data);
// { globalPeople: 3200, activeEvents: 45, communities: 89, yourCity: 156 }
```

**cURL**:
```bash
curl -X GET 'https://your-domain.com/api/community/global-stats' \
  -H 'Cookie: connect.sid=your-session-id'
```

---

### 2. GET `/api/community/rankings`

Returns ranked lists of cities or regions by member count or event count, with optional filtering.

#### Request
```http
GET /api/community/rankings?view=city&sortBy=members&filterBy=people
```

**Query Parameters**:

| Parameter | Type | Required | Default | Options | Description |
|-----------|------|----------|---------|---------|-------------|
| `view` | string | No | `city` | `city`, `region` | Group by city or country/region |
| `sortBy` | string | No | `members` | `members`, `events` | Sort criteria |
| `filterBy` | string | No | `people` | `people`, `events` | Display filter preference |

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Buenos Aires",
      "country": "Argentina",
      "memberCount": 3456,
      "eventCount": 89,
      "rank": 1
    },
    {
      "id": 3,
      "name": "Madrid",
      "country": "Spain",
      "memberCount": 1823,
      "eventCount": 45,
      "rank": 2
    }
  ]
}
```

**Error (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Failed to fetch rankings"
}
```

#### Implementation Details

**File**: `server/routes/groupRoutes.ts`

**Sorting Logic**:
- `sortBy=members`: Orders by `memberCount DESC`
- `sortBy=events`: Orders by `eventCount DESC`

**View Logic**:
- `view=city`: Groups by individual cities
- `view=region`: Aggregates by country (sums member/event counts)

**Filter Logic**:
- `filterBy=people`: Frontend emphasizes member counts
- `filterBy=events`: Frontend emphasizes event counts
- Note: Both counts are always returned; filter only affects UI display

#### Example Usage

**JavaScript/TypeScript**:
```typescript
const { data } = useQuery({
  queryKey: ['/api/community/rankings', 'city', 'members', 'people'],
  queryFn: async () => {
    const response = await fetch(
      '/api/community/rankings?view=city&sortBy=members&filterBy=people',
      { credentials: 'include' }
    );
    return (await response.json()).data;
  }
});
```

**cURL**:
```bash
curl -X GET 'https://your-domain.com/api/community/rankings?view=city&sortBy=members&filterBy=people'
```

---

### 3. GET `/api/community/city-groups`

Returns all city-type groups with coordinates and statistics (used by world map).

#### Request
```http
GET /api/community/city-groups
```

**Query Parameters**: None

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Buenos Aires Tango Community",
      "city": "Buenos Aires",
      "country": "Argentina",
      "lat": "-34.6095579",
      "lng": "-58.3887904",
      "slug": "buenos-aires-tango",
      "memberCount": 3456,
      "totalUsers": 3456,
      "description": "The heart of tango culture...",
      "eventCount": 89,
      "hostCount": 12,
      "recommendationCount": 245
    }
  ]
}
```

#### Implementation Details

**File**: `server/routes/groupRoutes.ts`

**Features**:
- Filters groups WHERE `type = 'city'`
- Excludes groups without coordinates (NULL lat/lng)
- Fetches member count from `group_members` table (real-time)
- Falls back to `groups.member_count` if no members exist
- Orders by member count descending

**Coordinate Format**:
- Database stores as `NUMERIC(10,7)`
- API returns as strings (Drizzle/PostgreSQL behavior)
- Frontend must parse to float for mapping: `parseFloat(group.lat)`

---

## Data Accuracy & Calculation Methods

### Preventing Double-Counting

**Problem**: Users can be members of multiple city groups, leading to inflated counts.

**Solution**: Use `COUNT(DISTINCT userId)` in all aggregation queries.

```sql
-- ✅ Correct: Counts unique users
SELECT COUNT(DISTINCT group_members.user_id) FROM group_members
INNER JOIN groups ON group_members.group_id = groups.id
WHERE groups.type = 'city';

-- ❌ Wrong: Counts memberships (inflated)
SELECT COUNT(*) FROM group_members;
```

### Active Event Detection

**Criteria**: An event is "active" if:
1. `end_date >= NOW()` (event hasn't ended yet), OR
2. `end_date IS NULL` AND `start_date >= yesterday` (single-day event without explicit end)

**Implementation**:
```typescript
const now = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

await db.select({ totalEvents: sql<number>`COUNT(*)::int` })
  .from(events)
  .where(
    or(
      gte(events.endDate, now),
      and(isNull(events.endDate), gte(events.startDate, yesterday))
    )
  );
```

### Your City Calculation

**Aggregation**: Sums members across ALL city groups in user's location (not just one group).

**Example**: If Buenos Aires has 3 separate tango groups:
- "Buenos Aires Tango A" (500 members)
- "Buenos Aires Milonga Club" (300 members)
- "BA Tango Network" (200 members)

**Result**: `yourCity = 1000` (total unique users across all 3 groups)

---

## Error Handling

### Common Errors

| Status Code | Error Message | Cause | Solution |
|-------------|---------------|-------|----------|
| 500 | "Failed to fetch global statistics" | Database connection issue | Check PostgreSQL connection, retry |
| 500 | "Failed to fetch rankings" | Query timeout or syntax error | Check server logs, optimize query |
| 401 | "Unauthorized" | Session expired | Re-authenticate user |

### Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Frontend Integration Patterns

### React Query Setup

**Recommended Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes (garbage collection)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Number Formatting

**Utility Function**:
```typescript
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Examples:
formatNumber(3200);      // "3.2K"
formatNumber(1500000);   // "1.5M"
formatNumber(945);       // "945"
```

### Loading & Error States

**Best Practice Implementation**:
```typescript
const GlobalStatsDisplay = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['community', 'global-stats'],
    // ... queryFn
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load statistics</div>;

  return (
    <div>
      <div>People: {formatNumber(data.globalPeople)}</div>
      <div>Events: {formatNumber(data.activeEvents)}</div>
      <div>Communities: {data.communities}</div>
      <div>Your City: {formatNumber(data.yourCity)}</div>
    </div>
  );
};
```

---

## Performance Optimization

### Database Indexes

**Recommended Indexes**:
```sql
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
```

### Query Optimization

**Current Performance**:
- `/api/community/global-stats`: ~150-250ms
- `/api/community/rankings`: ~200-400ms (depends on data size)
- `/api/community/city-groups`: ~100-300ms

**Optimization Strategies**:
1. Use Redis caching for frequently accessed statistics
2. Implement materialized views for heavy aggregations
3. Add query result caching with 5-minute TTL
4. Consider database read replicas for high traffic

---

## Testing

### API Testing Examples

**Test Global Stats Accuracy**:
```bash
# Test unauthenticated request
curl -X GET 'http://localhost:5000/api/community/global-stats'

# Expected: globalPeople, activeEvents, communities with values, yourCity = 0

# Test authenticated request
curl -X GET 'http://localhost:5000/api/community/global-stats' \
  -H 'Cookie: connect.sid=test-session-id'

# Expected: All fields with values including yourCity
```

**Test Rankings Filtering**:
```bash
# Test people filter
curl -X GET 'http://localhost:5000/api/community/rankings?filterBy=people'

# Test events filter
curl -X GET 'http://localhost:5000/api/community/rankings?filterBy=events'

# Test region view
curl -X GET 'http://localhost:5000/api/community/rankings?view=region&sortBy=members'
```

### Automated Testing

See comprehensive test suite in project documentation:
- ESA Layer 1 (Database Architecture): Query correctness
- ESA Layer 2 (API Structure): HTTP response validation
- ESA Layer 6 (Data Validation): Type checking
- ESA Layer 7 (State Management): React Query integration
- ESA Layer 18 (Analytics): Data accuracy verification

---

## Related Documentation

- **World Map Documentation**: `docs/pages/MUNDO_TANGO_WORLD_MAP.md`
- **ESA Layer 22 (Group Management)**: `docs/pages/esa-layers/layer-22-group-management.md`
- **ESA Layer 18 (Analytics)**: `docs/pages/esa-layers/layer-18-analytics-reporting.md`
- **Admin Global Statistics**: `docs/pages/admin/global-statistics.md`

---

## Changelog

### 2025-10-01 - Initial API Documentation
- Created comprehensive API reference for community statistics
- Documented all endpoint specifications
- Added calculation methods and accuracy guidelines
- Included frontend integration patterns
- Provided testing examples and performance optimization strategies

---

**Platform**: Mundo Tango (ESA LIFE CEO 61x21 Framework)  
**API Version**: 1.0  
**Last Updated**: October 1, 2025  
**Status**: Production ✅
