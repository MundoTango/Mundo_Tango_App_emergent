# Event RSVP System Documentation

## 1. Overview
- **Purpose**: Comprehensive event attendance management system
- **ESA Framework Layer**: Layer 26 - Events & Calendar Agent
- **Components**: RSVP buttons, status tracking, attendee counting, notifications
- **Database**: `event_rsvps` table with user-event relationships

## 2. RSVP Status Values

The platform supports 4 distinct RSVP states to capture user intent:

### Status Definitions

| Status | Value | Icon | Color | Meaning | Counts Toward Attendance |
|--------|-------|------|-------|---------|-------------------------|
| **Going** | `going` | ✅ Check | Turquoise (`#5EEAD4`) | Confirmed attendance | ✅ Yes |
| **Interested** | `interested` | ⭐ Star | Yellow (`#FCD34D`) | Interested but not committed | ❌ No |
| **Maybe** | `maybe` | ❓ Question | Purple (`#A78BFA`) | Tentatively attending | ❌ No |
| **Not Going** | `not_going` | ❌ X | Red (`#F87171`) | Declined invitation | ❌ No |
| **No Response** | `null` | - | - | User hasn't responded | ❌ No |

### Status Behavior

```typescript
// Only "going" status increments attendee count
const countsAsAttendance = (status: string | null) => status === 'going';

// Status transitions
const statusTransitions = {
  null → 'going': +1 attendee,
  null → 'interested': 0 change,
  null → 'maybe': 0 change,
  null → 'not_going': 0 change,
  'going' → 'interested': -1 attendee,
  'going' → 'maybe': -1 attendee,
  'going' → 'not_going': -1 attendee,
  'interested' → 'going': +1 attendee,
  'maybe' → 'going': +1 attendee,
  'not_going' → 'going': +1 attendee
};
```

## 3. API Endpoints

### POST /api/events/:eventId/rsvp

Update user's RSVP status for an event.

**Request**:
```json
POST /api/events/123/rsvp
Content-Type: application/json

{
  "status": "going"
}
```

**Validation**:
```typescript
const rsvpStatusSchema = z.object({
  status: z.enum(['going', 'interested', 'maybe', 'not_going'])
});
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 456,
    "eventId": 123,
    "userId": 789,
    "status": "going",
    "createdAt": "2025-09-30T14:30:00Z",
    "updatedAt": "2025-09-30T14:30:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "error": "Invalid RSVP status. Must be one of: going, interested, maybe, not_going"
}
```

### GET /api/events/:eventId/rsvps

Retrieve all RSVPs for an event with user details.

**Response**:
```json
{
  "data": [
    {
      "id": 456,
      "status": "going",
      "user": {
        "id": 789,
        "username": "maria_dancer",
        "displayName": "María García",
        "avatar": "/uploads/avatars/789.jpg"
      },
      "createdAt": "2025-09-30T14:30:00Z"
    }
  ],
  "counts": {
    "going": 45,
    "interested": 23,
    "maybe": 12,
    "not_going": 3
  }
}
```

### GET /api/events/feed

Events feed with user's RSVP status included.

**Response**:
```json
{
  "data": [
    {
      "id": 123,
      "title": "Weekly Milonga",
      "startDate": "2025-09-30T20:00:00Z",
      "current_attendees": 45,
      "userRsvpStatus": "going",
      "rsvpCounts": {
        "going": 45,
        "interested": 23,
        "maybe": 12,
        "not_going": 3
      }
    }
  ]
}
```

## 4. Database Schema

### event_rsvps Table

```sql
CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('going', 'interested', 'maybe', 'not_going')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX idx_event_rsvps_status ON event_rsvps(status);
```

### Drizzle Schema

```typescript
export const eventRsvps = pgTable('event_rsvps', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  uniqueEventUser: unique().on(table.eventId, table.userId)
}));
```

## 5. Frontend Implementation

### UpcomingEventsSidebar Quick RSVP

Located: `client/src/components/esa/UpcomingEventsSidebar.tsx`

```tsx
const rsvpMutation = useMutation({
  mutationFn: async ({ eventId, status }) => {
    return await apiRequest(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  // Optimistic updates for instant UI feedback
  onMutate: async ({ eventId, status }) => {
    await queryClient.cancelQueries({ queryKey: ['/api/events/feed'] });
    const previousEvents = queryClient.getQueryData(['/api/events/feed']);
    
    queryClient.setQueryData(['/api/events/feed'], (old: any) => {
      if (!old) return old;
      
      return old.map((event: any) => {
        if (event.id.toString() === eventId) {
          const oldStatus = event.userRsvpStatus;
          let attendeeChange = 0;
          
          if (oldStatus === 'going' && status !== 'going') {
            attendeeChange = -1;
          } else if (oldStatus !== 'going' && status === 'going') {
            attendeeChange = 1;
          }
          
          return { 
            ...event, 
            userRsvpStatus: status, 
            current_attendees: Math.max(0, (event.current_attendees || 0) + attendeeChange)
          };
        }
        return event;
      });
    });
    
    return { previousEvents };
  },
  onError: (err, variables, context) => {
    if (context?.previousEvents) {
      queryClient.setQueryData(['/api/events/feed'], context.previousEvents);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
  }
});
```

### Event Detail Page RSVP

Located: `client/src/pages/event-detail.tsx`

```tsx
<div className="flex gap-3">
  <Button 
    onClick={() => handleRSVP('going')}
    disabled={isPending}
    variant={userRsvp === 'going' ? 'default' : 'outline'}
  >
    <Check className="w-4 h-4 mr-2" />
    Going ({counts.going})
  </Button>
  
  <Button 
    onClick={() => handleRSVP('interested')}
    disabled={isPending}
    variant={userRsvp === 'interested' ? 'default' : 'outline'}
  >
    <Star className="w-4 h-4 mr-2" />
    Interested ({counts.interested})
  </Button>
  
  <Button 
    onClick={() => handleRSVP('maybe')}
    disabled={isPending}
    variant={userRsvp === 'maybe' ? 'default' : 'outline'}
  >
    <HelpCircle className="w-4 h-4 mr-2" />
    Maybe ({counts.maybe})
  </Button>
  
  <Button 
    onClick={() => handleRSVP('not_going')}
    disabled={isPending}
    variant={userRsvp === 'not_going' ? 'destructive' : 'outline'}
  >
    <X className="w-4 h-4 mr-2" />
    Can't Go
  </Button>
</div>
```

## 6. Optimistic Updates Pattern

### Why Optimistic Updates?

Optimistic updates provide instant feedback before server confirmation:
- ✅ Immediate UI response (no loading spinner)
- ✅ Better perceived performance
- ✅ Automatic rollback on error
- ✅ Seamless user experience

### Implementation Flow

```
1. User clicks RSVP button
   ↓
2. Cancel in-flight queries
   ↓
3. Snapshot current data
   ↓
4. Update UI optimistically
   ↓
5. Send request to server
   ↓
6a. Success: Invalidate & refetch
6b. Error: Rollback to snapshot
```

### Common Pitfalls

❌ **Wrong**: Assuming wrapped data structure
```typescript
// DON'T DO THIS
queryClient.setQueryData(['/api/events/feed'], (old: any) => {
  if (!old?.data) return old; // Assumes {data: [...]}
  return { ...old, data: old.data.map(...) };
});
```

✅ **Correct**: Match actual query data structure
```typescript
// DO THIS
queryClient.setQueryData(['/api/events/feed'], (old: any) => {
  if (!old) return old; // Direct array
  return old.map((event) => ...);
});
```

## 7. Attendee Count Logic

### Calculation Rules

Only `'going'` status contributes to attendee count:

```typescript
function calculateAttendeeChange(oldStatus: string | null, newStatus: string): number {
  const oldIsAttending = oldStatus === 'going';
  const newIsAttending = newStatus === 'going';
  
  if (!oldIsAttending && newIsAttending) return 1;  // +1
  if (oldIsAttending && !newIsAttending) return -1; // -1
  return 0; // No change
}

// Update attendees
const newCount = Math.max(0, currentCount + calculateAttendeeChange(oldStatus, newStatus));
```

### Edge Cases

- User changes from `null` → `going`: **+1**
- User changes from `going` → `interested`: **-1**
- User changes from `interested` → `maybe`: **0**
- User changes from `maybe` → `going`: **+1**
- Attendee count never goes below **0**

## 8. Real-time Updates

### WebSocket Integration

```typescript
// Server broadcasts RSVP changes
socket.emit('event:rsvp', {
  eventId: 123,
  userId: 789,
  status: 'going',
  newAttendeeCount: 46
});

// Client listens and updates cache
socket.on('event:rsvp', (data) => {
  queryClient.setQueryData(['/api/events/feed'], (old: any) => {
    return old?.map((event: any) => 
      event.id === data.eventId 
        ? { ...event, current_attendees: data.newAttendeeCount }
        : event
    );
  });
});
```

## 9. Notification System

### RSVP Notifications

**Organizer Notifications**:
- User RSVPs `going` → Notify organizer
- Threshold reached (e.g., 50 attendees) → Notify organizer

**User Notifications**:
- Event reminder 24h before (if status = `going`)
- Event updated (if status = `going` or `interested`)
- Event cancelled (all RSVP'd users)

### Email Templates

```typescript
// RSVP Confirmation
const rsvpConfirmationEmail = {
  to: user.email,
  subject: `You're going to ${event.title}!`,
  template: 'rsvp-confirmation',
  data: {
    userName: user.displayName,
    eventTitle: event.title,
    eventDate: formatDate(event.startDate),
    eventLocation: event.location,
    calendarLink: generateCalendarLink(event)
  }
};

// Organizer Alert
const organizerAlertEmail = {
  to: organizer.email,
  subject: `New RSVP for ${event.title}`,
  template: 'organizer-rsvp-alert',
  data: {
    organizerName: organizer.displayName,
    userName: user.displayName,
    userAvatar: user.avatar,
    eventTitle: event.title,
    newAttendeeCount: event.current_attendees
  }
};
```

## 10. Analytics & Reporting

### RSVP Metrics

Track key engagement metrics:

```sql
-- RSVP conversion rate
SELECT 
  COUNT(CASE WHEN status = 'going' THEN 1 END)::FLOAT / COUNT(*) * 100 AS conversion_rate
FROM event_rsvps
WHERE event_id = $1;

-- Status distribution
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::FLOAT / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM event_rsvps
WHERE event_id = $1
GROUP BY status;

-- RSVP timeline
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as rsvps
FROM event_rsvps
WHERE event_id = $1
GROUP BY date
ORDER BY date;
```

## 11. Access Control

### Permission Rules

```typescript
// Who can RSVP?
const canRSVP = (user: User, event: Event): boolean => {
  // Public events: any authenticated user
  if (event.visibility === 'public') return user.isAuthenticated;
  
  // Private events: invited users only
  if (event.visibility === 'private') {
    return event.invitees.includes(user.id);
  }
  
  // Group events: group members only
  if (event.groupId) {
    return user.groups.includes(event.groupId);
  }
  
  return false;
};

// Who can see RSVPs?
const canViewRSVPs = (user: User, event: Event): boolean => {
  // Organizer always sees
  if (event.organizerId === user.id) return true;
  
  // Going/Interested users see full list
  if (user.rsvpStatus && ['going', 'interested'].includes(user.rsvpStatus)) {
    return true;
  }
  
  // Others see count only
  return false;
};
```

## 12. Testing

### Unit Tests

```typescript
describe('RSVP System', () => {
  test('updates attendee count on going status', () => {
    const result = calculateAttendeeChange(null, 'going');
    expect(result).toBe(1);
  });
  
  test('decrements count when changing from going', () => {
    const result = calculateAttendeeChange('going', 'maybe');
    expect(result).toBe(-1);
  });
  
  test('no change when both non-going statuses', () => {
    const result = calculateAttendeeChange('interested', 'maybe');
    expect(result).toBe(0);
  });
  
  test('validates status enum', () => {
    expect(() => validateRSVPStatus('invalid')).toThrow();
  });
});
```

### E2E Tests

```typescript
test('complete RSVP flow', async ({ page }) => {
  await page.goto('/events/123');
  
  // Click "Going" button
  await page.click('[data-testid="rsvp-going"]');
  
  // Verify optimistic update
  await expect(page.locator('[data-testid="attendee-count"]')).toHaveText('46');
  
  // Verify toast notification
  await expect(page.locator('.toast')).toContainText("You're now marked as attending");
  
  // Change to "Maybe"
  await page.click('[data-testid="rsvp-maybe"]');
  
  // Verify count decreased
  await expect(page.locator('[data-testid="attendee-count"]')).toHaveText('45');
});
```

## 13. Troubleshooting

### Issue: Attendee count not updating
**Cause**: Optimistic update logic incorrect  
**Solution**: Verify calculation logic and data structure

### Issue: RSVP reverts after refresh
**Cause**: Server mutation failed silently  
**Solution**: Check network tab, verify API response

### Issue: Duplicate RSVPs created
**Cause**: Missing UNIQUE constraint  
**Solution**: Add `UNIQUE(event_id, user_id)` to schema

### Issue: Stale RSVP status displayed
**Cause**: Cache not invalidating  
**Solution**: Call `queryClient.invalidateQueries()` after mutation

## 14. Future Enhancements

- [ ] **Guest RSVP**: Allow +1/+2 for events with `allowGuests: true`
- [ ] **Waitlist**: Auto-promote from waitlist when capacity opens
- [ ] **RSVP Reminders**: Email users who haven't responded
- [ ] **Social Proof**: "5 friends are going" notifications
- [ ] **RSVP Import**: Sync from Google Calendar, Facebook Events
- [ ] **Smart Suggestions**: AI-powered event recommendations based on RSVP history
- [ ] **RSVP Analytics Dashboard**: Organizer insights (conversion rates, drop-off analysis)

## 15. Real-Time UI Updates (Sept 30, 2025 Fix)

### Problem: Stale UI After Mutations

Initially, RSVP mutations worked correctly on the backend but required page refresh to see changes. This affected user experience across RSVPs, post creation, and all mutations.

### Root Cause

```typescript
// ❌ PROBLEM: staleTime: Infinity prevented UI updates
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity // Query never becomes stale
    }
  }
});
```

**Why it failed:**
1. React Query marked data as "fresh" forever due to `staleTime: Infinity`
2. Even after `refetchQueries`, structural sharing made React think data was unchanged
3. No re-render triggered despite backend having updated data
4. User saw stale UI until manual page refresh

### Solution: Real-Time Cache Updates

```typescript
// ✅ SOLUTION: staleTime: 0 enables immediate updates
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0 // Data becomes stale immediately
    }
  }
});
```

**How it works:**
1. Mutation completes successfully
2. `invalidateQueries` marks query as stale
3. With `staleTime: 0`, React Query immediately refetches
4. New data triggers re-render
5. UI updates without page refresh

### Optimized Mutation Pattern

**Before (slow, redundant):**
```typescript
onSuccess: async () => {
  await queryClient.refetchQueries({ queryKey: ['/api/events/feed'] });
  await queryClient.refetchQueries({ queryKey: [`/api/events/${eventId}`] });
}
```

**After (fast, efficient):**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
  queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
}
```

**Benefits:**
- ✅ No await needed - invalidation is synchronous
- ✅ React Query handles refetch timing automatically
- ✅ Batches multiple invalidations efficiently
- ✅ Works with optimistic updates

### Complete RSVP Mutation (Current)

```typescript
const rsvpMutation = useMutation({
  mutationFn: async ({ eventId, status }) => {
    return await apiRequest(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: { status }
    });
  },
  
  // Optimistic update for instant feedback
  onMutate: async ({ eventId, status }) => {
    await queryClient.cancelQueries({ queryKey: ['/api/events/feed'] });
    const previousEvents = queryClient.getQueryData(['/api/events/feed']);
    
    queryClient.setQueryData(['/api/events/feed'], (old: any) => {
      if (!old) return old;
      return old.map((event: any) => {
        if (event.id.toString() === eventId) {
          // Calculate attendee change
          const oldStatus = event.userRsvpStatus;
          let attendeeChange = 0;
          if (oldStatus === 'going' && status !== 'going') attendeeChange = -1;
          else if (oldStatus !== 'going' && status === 'going') attendeeChange = 1;
          
          return { 
            ...event, 
            userRsvpStatus: status,
            current_attendees: Math.max(0, (event.current_attendees || 0) + attendeeChange)
          };
        }
        return event;
      });
    });
    
    return { previousEvents };
  },
  
  // Rollback on error
  onError: (err, variables, context) => {
    if (context?.previousEvents) {
      queryClient.setQueryData(['/api/events/feed'], context.previousEvents);
    }
  },
  
  // Invalidate for real-time updates
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
    queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
  }
});
```

### Testing Real-Time Updates

**E2E Test:**
```typescript
test('RSVP updates UI immediately without refresh', async ({ page }) => {
  await page.goto('/events/123');
  
  // Initial state
  await expect(page.locator('[data-testid="rsvp-going"]')).not.toHaveClass(/gradient/);
  
  // Click RSVP
  await page.click('[data-testid="rsvp-going"]');
  
  // Verify instant visual update (no page.reload())
  await expect(page.locator('[data-testid="rsvp-going"]')).toHaveClass(/gradient/);
  await expect(page.locator('[data-testid="attendee-count"]')).toHaveText('46');
  
  // Navigate away and back
  await page.goto('/events');
  await page.goto('/events/123');
  
  // Verify persistence
  await expect(page.locator('[data-testid="rsvp-going"]')).toHaveClass(/gradient/);
});
```

### Best Practices for Real-Time UX

1. **Always use optimistic updates** for instant feedback
2. **Invalidate all affected queries** after success
3. **Never use `staleTime: Infinity`** unless data is truly static
4. **Prefer `invalidateQueries` over `refetchQueries`** (let React Query decide when to fetch)
5. **Include rollback logic** in `onError` handler
6. **Test without page refresh** to ensure real-time behavior

## 16. Unified Event Feed Architecture (October 2025)

### Architectural Unification

All event contexts now use a **single unified endpoint** (`/api/events/feed`) with query parameters:

```
Before (fragmented):
- Upcoming Events: /api/events/feed ✅
- Group Events: /api/groups/:slug/events ❌ (doesn't exist)
- Event Discovery: /api/events/feed ✅
- User Profile: /api/events/feed?userId=X ✅

After (unified):
- All contexts: /api/events/feed?[contextParam]=value ✅
```

### Query Key Pattern

```typescript
// Upcoming Events Sidebar
queryKey: ['/api/events/feed']

// Group Events Tab
queryKey: ['/api/events/feed', { groupId: 7 }]

// User Profile Events
queryKey: ['/api/events/feed', { userId: 123 }]

// Event Discovery
queryKey: ['/api/events/feed', { featured: true }]
```

### useEventRSVP Hook Update

The RSVP hook now uses **predicate matching** to update ALL event contexts:

```typescript
// ✅ Updates all /api/events/feed queries (any parameters)
queryClient.setQueriesData(
  { predicate: (query) => query.queryKey[0] === '/api/events/feed' },
  (old: any) => { /* optimistic update logic */ }
);
```

**Benefits:**
- ✅ RSVP updates work instantly in Upcoming Events
- ✅ RSVP updates work instantly in Group Events
- ✅ RSVP updates work instantly in Event Discovery
- ✅ RSVP updates work instantly in User Profile Events
- ✅ Single mutation hook for all contexts

### Implementation Example

```tsx
import { useEventRSVP } from '@/hooks/useEventRSVP';

function GroupEventsTab({ group }) {
  const eventRsvpMutation = useEventRSVP();
  
  // Unified endpoint with context parameter
  const { data: eventsResponse } = useQuery({
    queryKey: ['/api/events/feed', { groupId: group?.id }],
    enabled: !!group?.id
  });
  
  const events = eventsResponse?.data || [];
  
  return (
    <>
      {events.map(event => (
        <UnifiedEventCard
          key={event.id}
          event={event}
          eventRsvpMutation={eventRsvpMutation}
        />
      ))}
    </>
  );
}
```

**See:** [Unified Event Feed Architecture](./UnifiedEventFeedArchitecture.md) for complete details

---

## 17. Related Documentation

- [Unified Event Feed Architecture](./UnifiedEventFeedArchitecture.md) - **NEW** Architectural overview
- [Upcoming Events Sidebar](./UpcomingEventsSidebar.md) - Quick RSVP widget
- [Event Detail Page](./event-detail.md) - Full RSVP interface
- [Events Management](./Events.md) - Event creation and discovery
- [ESA Layer 26](../esa-layers/layer-26-events-calendar.md) - Events architecture
- [React Query Patterns](../components/ReactQueryPatterns.md) - Cache management best practices
