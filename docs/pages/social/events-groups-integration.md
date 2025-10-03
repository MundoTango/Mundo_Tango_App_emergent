# Events-Groups Integration

**Last Updated**: October 3, 2025  
**Status**: Production Ready ✅  
**Related**: City Group Auto-Creation System

## Overview

Events are now automatically associated with their corresponding city groups when created. This integration enables unified event displays within group pages, better event discovery, and automatic city group creation when events are created in cities without existing groups.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  Event Creation                           │
│  (User creates event with city + country)                │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│           eventGroupService.ts                            │
│  autoAssociateEventWithCityGroup(event)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 1. Check if city group exists (city + country)     │ │
│  │ 2. If not found → CityAutoCreationService          │ │
│  │ 3. Associate event.groupId with city group         │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              Database: events table                       │
│  event.groupId → groups.id (INTEGER FK)                 │
└──────────────────────────────────────────────────────────┘
```

## Schema Changes

### Before (October 3, 2025)

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  group_id UUID,  -- ❌ UUID, not linked to groups table
  ...
);
```

**Issues**:
- `group_id` was UUID type but `groups.id` is INTEGER
- No foreign key constraint
- No database index for lookups
- All existing values were NULL (safe to migrate)

### After (October 3, 2025)

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  group_id INTEGER REFERENCES groups(id),  -- ✅ INTEGER FK
  ...
);

-- Performance index
CREATE INDEX idx_events_group_id ON events(group_id);
```

**Migration Safety**: All `group_id` values were NULL before migration, so type change from UUID → INTEGER was safe with no data loss.

## Implementation

### Event-to-Group Association

```typescript
// server/services/eventGroupService.ts
export async function autoAssociateEventWithCityGroup(
  event: { 
    city: string; 
    country?: string; 
    userId?: number;
    groupId?: number;
  }
): Promise<{ groupId: number | null; groupName: string | null }> {
  
  // Case-insensitive lookup with NULL-safe country comparison
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

  if (cityGroup.length > 0) {
    // Group exists - associate event
    event.groupId = cityGroup[0].id;
    return {
      groupId: cityGroup[0].id,
      groupName: cityGroup[0].name
    };
  } else {
    // Group doesn't exist - auto-create it
    const createdGroupId = await CityAutoCreationService.processEventCity(
      event.city,
      event.userId || 1,
      event.country || undefined
    );
    
    if (createdGroupId) {
      event.groupId = createdGroupId;
      return {
        groupId: createdGroupId,
        groupName: null  // Name will be resolved by caller
      };
    }
  }
  
  return { groupId: null, groupName: null };
}
```

### Trigger Points

#### 1. Event Creation (POST /api/events)

```typescript
// server/routes/eventsRoutes.ts
router.post('/', async (req, res) => {
  const eventData = req.body;
  
  // Auto-associate with city group
  if (eventData.city) {
    const association = await autoAssociateEventWithCityGroup({
      city: eventData.city,
      country: eventData.country,
      userId: req.user?.id
    });
    
    if (association.groupId) {
      eventData.groupId = association.groupId;
    }
  }
  
  // Insert event with groupId
  const [newEvent] = await db
    .insert(events)
    .values(eventData)
    .returning();
  
  res.json({ success: true, event: newEvent });
});
```

#### 2. Event Update (PATCH /api/events/:id)

```typescript
router.patch('/:id', async (req, res) => {
  const { city, country } = req.body;
  
  // If city/country changed, re-associate with group
  if (city) {
    const association = await autoAssociateEventWithCityGroup({
      city,
      country,
      userId: req.user?.id
    });
    
    req.body.groupId = association.groupId;
  }
  
  // Update event
  const [updated] = await db
    .update(events)
    .set(req.body)
    .where(eq(events.id, parseInt(req.params.id)))
    .returning();
  
  res.json({ success: true, event: updated });
});
```

## API Endpoints

### Get Events for City Group

```http
GET /api/groups/:slug/events
```

Retrieves all events associated with a city group. Supports both slug and numeric ID.

**Parameters**:
- `slug` (path): Group slug (e.g., "buenos-aires-argentina") or numeric ID

**Response**:
```json
{
  "success": true,
  "events": [
    {
      "id": 1,
      "title": "Milonga at Salon Canning",
      "description": "Weekly milonga with live orchestra",
      "city": "Buenos Aires",
      "country": "Argentina",
      "groupId": 1,
      "startDate": "2025-10-15T20:00:00Z",
      "endDate": "2025-10-16T02:00:00Z",
      "venue": "Salon Canning",
      "rsvpCount": 45
    }
  ],
  "count": 1
}
```

**Implementation**:
```typescript
// server/routes/groupRoutes.ts
router.get('/:slugOrId/events', async (req, res) => {
  const { slugOrId } = req.params;
  
  // Find group by slug or ID
  const group = await db
    .select()
    .from(groups)
    .where(
      or(
        eq(groups.slug, slugOrId),
        isNaN(Number(slugOrId)) 
          ? sql`false` 
          : eq(groups.id, parseInt(slugOrId))
      )
    )
    .limit(1);
  
  if (group.length === 0) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  // Fetch events for this group
  const groupEvents = await db
    .select()
    .from(events)
    .where(eq(events.groupId, group[0].id))
    .orderBy(events.startDate);
  
  res.json({
    success: true,
    events: groupEvents,
    count: groupEvents.length
  });
});
```

### Backfill Existing Events

For events created before the integration:

```http
POST /api/admin/events/backfill-groups
```

Associates all unlinked events with their city groups.

**Response**:
```json
{
  "success": true,
  "associated": 5,
  "created": 3,
  "failed": 0
}
```

## Database Queries

### Find All Events for a City

```sql
SELECT 
  e.id,
  e.title,
  e.city,
  e.country,
  g.name as group_name,
  g.id as group_id
FROM events e
LEFT JOIN groups g ON e.group_id = g.id
WHERE g.type = 'city' 
  AND LOWER(g.city) = LOWER('Buenos Aires');
```

### Find Events Without Groups

```sql
SELECT 
  e.id,
  e.title,
  e.city,
  e.country
FROM events e
WHERE e.group_id IS NULL
  AND e.city IS NOT NULL;
```

### Group Statistics

```sql
SELECT 
  g.name,
  g.city,
  g.country,
  COUNT(e.id) as event_count,
  MIN(e.start_date) as first_event,
  MAX(e.start_date) as last_event
FROM groups g
LEFT JOIN events e ON e.group_id = g.id
WHERE g.type = 'city'
GROUP BY g.id, g.name, g.city, g.country
ORDER BY event_count DESC;
```

## Frontend Integration

### Display Events in Group Page

```typescript
// client/src/pages/social/GroupDetailPageMT.tsx
const EventsTab = ({ groupId }: { groupId: number }) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/groups', groupId, 'events'],
    enabled: !!groupId
  });

  if (isLoading) return <EventsSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upcoming Events</h2>
      {events?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
```

### Event Creation Form

```typescript
// client/src/components/events/EventCreator.tsx
const EventCreator = () => {
  const createEvent = useMutation({
    mutationFn: async (eventData) => {
      const response = await apiRequest('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
      return response;
    },
    onSuccess: () => {
      // Auto-association happens server-side
      queryClient.invalidateQueries(['/api/events']);
      toast.success('Event created and linked to city group!');
    }
  });

  return (
    <Form onSubmit={createEvent.mutate}>
      <Input name="title" label="Event Title" />
      <Input name="city" label="City" />  {/* ✅ Auto-links to group */}
      <Input name="country" label="Country" />
      <DatePicker name="startDate" label="Start Date" />
      <Button type="submit">Create Event</Button>
    </Form>
  );
};
```

## Testing

### Test Event-Group Association

```bash
# Create event in existing city
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Milonga",
    "city": "Buenos Aires",
    "country": "Argentina",
    "startDate": "2025-11-01T20:00:00Z"
  }'

# Verify event has groupId
psql $DATABASE_URL -c "
  SELECT e.id, e.title, e.group_id, g.name 
  FROM events e 
  LEFT JOIN groups g ON e.group_id = g.id 
  WHERE e.title = 'Test Milonga';
"
```

### Test Auto-Creation

```bash
# Create event in non-existent city
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New City Event",
    "city": "Melbourne",
    "country": "Australia",
    "startDate": "2025-11-01T20:00:00Z"
  }'

# Verify city group was auto-created
psql $DATABASE_URL -c "
  SELECT id, name, city, country 
  FROM groups 
  WHERE LOWER(city) = 'melbourne';
"
```

### Test Backfill

```bash
# Count unlinked events
psql $DATABASE_URL -c "
  SELECT COUNT(*) FROM events 
  WHERE group_id IS NULL AND city IS NOT NULL;
"

# Run backfill
curl -X POST http://localhost:5000/api/admin/events/backfill-groups

# Verify all linked
psql $DATABASE_URL -c "
  SELECT COUNT(*) FROM events 
  WHERE group_id IS NULL AND city IS NOT NULL;
"
# Expected: 0
```

## Performance Considerations

### Database Indexes

```sql
-- ✅ Fast lookup: events by group
CREATE INDEX idx_events_group_id ON events(group_id);

-- ✅ Fast lookup: city groups
CREATE INDEX idx_groups_city ON groups(city);

-- ✅ Unique constraint (prevents duplicates)
CREATE UNIQUE INDEX unique_city_group_idx 
ON groups (type, LOWER(city), LOWER(COALESCE(country, ''))) 
WHERE type = 'city';
```

### Query Performance

**Event Lookup by Group**:
```sql
EXPLAIN ANALYZE
SELECT * FROM events WHERE group_id = 1;
-- Index Scan using idx_events_group_id
-- Cost: 0.1-1.0 (very fast)
```

**Group Lookup by City**:
```sql
EXPLAIN ANALYZE
SELECT * FROM groups 
WHERE type = 'city' 
AND LOWER(city) = LOWER('Paris')
AND LOWER(COALESCE(country, '')) = LOWER('France');
-- Index Scan using unique_city_group_idx
-- Cost: 0.1-1.0 (very fast)
```

## Troubleshooting

### Issue: Events Not Linking to Groups

**Diagnosis**:
```sql
-- Check for events without groups
SELECT id, title, city, country, group_id 
FROM events 
WHERE city IS NOT NULL AND group_id IS NULL;
```

**Resolution**:
1. Verify city group exists:
   ```sql
   SELECT * FROM groups 
   WHERE type = 'city' AND LOWER(city) = LOWER('YourCity');
   ```
2. If missing, city group should auto-create on next event
3. Run backfill endpoint to link existing events

### Issue: Multiple Groups for Same City

**Diagnosis**:
```sql
SELECT city, country, COUNT(*) 
FROM groups 
WHERE type = 'city' 
GROUP BY city, country 
HAVING COUNT(*) > 1;
```

**Resolution**: See [City Group Auto-Creation → Troubleshooting](./city-group-auto-creation.md#troubleshooting)

## Related Documentation

- [City Group Auto-Creation System](./city-group-auto-creation.md)
- [Group Management (ESA Layer 22)](../esa-layers/layer-22-group-management.md)
- [Events System](../events/Events.md)

## Changelog

### October 3, 2025
- ✅ Events automatically associate with city groups on creation
- ✅ Schema migration: `events.groupId` from UUID to INTEGER with FK
- ✅ New API endpoint: `GET /api/groups/:slug/events`
- ✅ Database index on `events.group_id` for performance
- ✅ Backfill successful: All existing events linked to city groups
- ✅ NULL-safe country comparison in group matching
