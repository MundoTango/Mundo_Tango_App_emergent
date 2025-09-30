# Upcoming Events Sidebar Documentation

## 1. Overview
- **Component**: `UpcomingEventsSidebar`
- **Location**: `client/src/components/esa/UpcomingEventsSidebar.tsx`
- **Purpose**: Smart event discovery widget with quick RSVP functionality and intelligent categorization
- **ESA Framework Layer**: Layer 9 - UI Framework Agent
- **Integration**: ESAMemoryFeed sidebar, event pages

## 2. Component Features

### Quick RSVP System (4 States)
The sidebar provides one-click RSVP updates without navigating to event detail pages:

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| **Going** | ✅ Check | Turquoise gradient | User confirmed attendance |
| **Interested** | ⭐ Star | Yellow/amber gradient | User interested but not committed |
| **Maybe** | ❓ Question | Purple gradient | User tentatively attending |
| **Not Going** | ❌ X | Red gradient | User declined |

### Smart Event Categorization

Events are automatically organized into 4 priority sections:

1. **RSVP'ed Events** - Events user has responded to (going/interested/maybe)
2. **In Your City** - Events in the user's home city
3. **Events You Follow** - Events from organizers/groups user follows
4. **Cities You Follow** - Events in cities user is tracking

### ESA Ocean Theme Integration

```css
/* Deep ocean titles */
color: #0B3C49;

/* Medium ocean text */
color: #146778;

/* Light ocean metadata */
color: #3BA0AF;

/* Turquoise gradients */
background: linear-gradient(135deg, #5EEAD4 0%, #2CB5E8 100%);

/* Glassmorphic cards */
background: rgba(255,255,255,0.78);
border-color: rgba(94,234,212,0.55);
backdrop-filter: blur(sm);
```

## 3. Technical Implementation

### Component Interface

```typescript
interface UpcomingEventsSidebarProps {
  onEventClick?: (eventId: string) => void;
}

interface Event {
  id: string;
  title: string;
  type: 'milonga' | 'workshop' | 'festival' | 'practica';
  date: string;
  time: string;
  location: string;
  city?: string;
  attendees: number;
  userRsvpStatus?: 'going' | 'interested' | 'maybe' | 'not_going' | null;
  isFeatured?: boolean;
}
```

### API Integration

**Endpoint**: `GET /api/events/feed?limit=20&visibility=public`

**Response Format**:
```json
{
  "data": [
    {
      "id": 123,
      "title": "Weekly Milonga at Salon Canning",
      "event_type": "milonga",
      "startDate": "2025-09-30T20:00:00Z",
      "location": "Salon Canning",
      "city": "Buenos Aires",
      "current_attendees": 45,
      "userRsvpStatus": "going",
      "is_featured": true
    }
  ]
}
```

### RSVP Mutation

**Endpoint**: `POST /api/events/:eventId/rsvp`

**Request Body**:
```json
{
  "status": "going" | "interested" | "maybe" | "not_going"
}
```

**Features**:
- Optimistic UI updates for instant feedback
- Automatic attendee count adjustment
- Real-time cache invalidation
- Error rollback on failure

### Optimistic Update Logic

```typescript
// Correct implementation (FIXED)
queryClient.setQueryData(['/api/events/feed'], (old: any) => {
  if (!old) return old; // Direct array, not {data: [...]}
  
  return old.map((event: any) => {
    if (event.id.toString() === eventId) {
      const oldStatus = event.userRsvpStatus;
      const oldAttendees = event.current_attendees || 0;
      
      // Smart attendee count calculation
      let attendeeChange = 0;
      if (oldStatus === 'going' && status !== 'going') {
        attendeeChange = -1; // Decrement
      } else if (oldStatus !== 'going' && status === 'going') {
        attendeeChange = 1; // Increment
      }
      
      return { 
        ...event, 
        userRsvpStatus: status, 
        current_attendees: Math.max(0, oldAttendees + attendeeChange)
      };
    }
    return event;
  });
});
```

## 4. Collapsible Sections

Each category section can be expanded/collapsed:

```tsx
const [expandedSections, setExpandedSections] = useState({
  rsvpedEvents: true,
  yourCity: true,
  eventsYouFollow: true,
  citiesYouFollow: true
});
```

**Visual Design**:
- Aqua background headers (`rgba(209,250,250,0.65)`)
- Ocean accent on hover (`rgba(94,234,212,0.28)`)
- Chevron icons (up/down) for expand/collapse state
- Event count badge in deep ocean color

## 5. Event Type Badges

```typescript
const eventTypeColors = {
  milonga: { 
    bg: 'bg-[rgba(94,234,212,0.24)]', 
    text: 'text-[#0E7490]', 
    border: 'border-[rgba(94,234,212,0.55)]' 
  },
  workshop: { 
    bg: 'bg-[rgba(43,178,232,0.24)]', 
    text: 'text-[#0369A1]', 
    border: 'border-[rgba(43,178,232,0.55)]' 
  },
  festival: { 
    bg: 'bg-[rgba(236,72,153,0.24)]', 
    text: 'text-[#BE185D]', 
    border: 'border-[rgba(236,72,153,0.55)]' 
  },
  practica: { 
    bg: 'bg-[rgba(16,185,129,0.24)]', 
    text: 'text-[#047857]', 
    border: 'border-[rgba(16,185,129,0.55)]' 
  }
};
```

## 6. Accessibility Features

### ARIA Labels
- All RSVP buttons have descriptive `aria-label` attributes
- Section toggle buttons include context labels
- View All Events button has clear action label

### Loading States
- Disabled state during mutations (`disabled={rsvpMutation.isPending}`)
- Visual feedback with opacity reduction (`.disabled:opacity-50`)
- Cursor changes to `not-allowed` during loading

### Keyboard Navigation
- Full keyboard support via button elements
- Tooltip delays optimized for hover/focus (200ms)
- Tab order follows logical RSVP sequence

## 7. User Experience Patterns

### Hover Effects
```tsx
onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(222,252,255,0.82)'}
onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.78)'}
```

### RSVP Buttons
- Scale transform on hover (`.hover:scale-110`)
- Gradient backgrounds when active
- Smooth transitions (200ms)
- Prevents event bubbling (`e.stopPropagation()`)

### Event Cards
- Click anywhere on card to view details
- Gentle scale on hover (`.hover:scale-[1.01]`)
- Title color transition to turquoise
- Shadow elevation on hover

## 8. Data Flow

### Query Flow
```
User Opens Feed
    ↓
Query: GET /api/events/feed
    ↓
Transform API → Component Format
    ↓
Categorize by RSVP/City/Following
    ↓
Render Collapsible Sections
```

### RSVP Flow
```
User Clicks RSVP Icon
    ↓
Mutation Starts (optimistic update)
    ↓
UI Updates Immediately
    ↓
POST /api/events/:id/rsvp
    ↓
Success → Toast + Cache Invalidation
    ↓
Error → Rollback + Error Toast
```

## 9. Integration Points

### ESAMemoryFeed Integration
```tsx
import UpcomingEventsSidebar from '@/components/esa/UpcomingEventsSidebar';

<div className="flex gap-6">
  <div className="flex-1">
    <UnifiedPostFeed />
  </div>
  <div className="w-80">
    <UpcomingEventsSidebar onEventClick={(id) => console.log(id)} />
  </div>
</div>
```

### Event Detail Page
- Clicking event card navigates to `/events/:id`
- Uses `wouter` for client-side routing
- Optional callback for parent handling

## 10. Database Schema

### Events Table
```sql
events (
  id SERIAL PRIMARY KEY,
  title VARCHAR,
  event_type VARCHAR,
  startDate TIMESTAMP,
  location VARCHAR,
  city VARCHAR,
  current_attendees INTEGER,
  is_featured BOOLEAN
)
```

### Event RSVPs Table
```sql
event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  user_id INTEGER REFERENCES users(id),
  status VARCHAR CHECK (status IN ('going', 'interested', 'maybe', 'not_going')),
  created_at TIMESTAMP,
  UNIQUE(event_id, user_id)
)
```

## 11. Performance Optimizations

### React Query Caching
- Query key: `['/api/events/feed']`
- Automatic background refetch
- Stale-while-revalidate pattern
- Optimistic updates for instant feedback

### Render Optimizations
- Section filtering happens at data transformation
- `.slice(0, 3)` limits non-RSVP'd events
- Conditional rendering for empty sections
- Event card memoization candidates

### Network Efficiency
- Single API call for all events
- Limit parameter (`?limit=20`)
- Cache invalidation only on success
- Mutation batching via React Query

## 12. Test Coverage

### Unit Tests Needed
```typescript
describe('UpcomingEventsSidebar', () => {
  test('displays all 4 RSVP icons', () => {});
  test('categorizes events correctly', () => {});
  test('handles optimistic updates', () => {});
  test('rolls back on error', () => {});
  test('calculates attendee counts accurately', () => {});
});
```

### E2E Test Scenarios
- RSVP flow for all 4 states
- Section expand/collapse
- Navigation to event detail
- Loading states
- Error handling

### Data Test IDs
```typescript
`rsvp-attending-${event.id}`
`rsvp-interested-${event.id}`
`rsvp-maybe-${event.id}`
`rsvp-not-going-${event.id}`
`event-card-${event.id}`
`button-view-all-events`
```

## 13. Known Limitations

### Current State
- ❌ Hard-coded user city (`Barcelona`)
- ❌ Hard-coded followed cities (`['Buenos Aires', 'Paris', 'Milan']`)
- ❌ "Events You Follow" needs group/organizer follow logic
- ⚠️ Section limits (3 events each for non-RSVP'd)

### Future Enhancements
- [ ] Dynamic user preferences from profile
- [ ] Followed cities from user settings
- [ ] Organizer/group follow system integration
- [ ] Infinite scroll within sections
- [ ] Event recommendations AI agent
- [ ] Calendar view toggle
- [ ] Filter by date range

## 14. Troubleshooting

### RSVP Not Updating UI
**Issue**: Optimistic update not reflecting  
**Solution**: Ensure query data structure matches (array vs `{data: [...]}`)

### Attendee Count Incorrect
**Issue**: Count incrementing on all status changes  
**Solution**: Check increment/decrement logic (only +1 for 'going', -1 when leaving 'going')

### Events Not Categorizing
**Issue**: All events in "Other Events"  
**Solution**: Verify city matching logic and user preferences data

### Section Not Expanding
**Issue**: Click not toggling section  
**Solution**: Check `expandedSections` state and `toggleSection` handler

## 15. ESA Framework Compliance

### Layer 9: UI Framework
✅ Single responsibility component  
✅ Reusable across platform  
✅ Proper state management  
✅ Accessibility standards  

### Layer 11: Real-time
✅ React Query integration  
✅ Optimistic updates  
✅ WebSocket ready (cache invalidation)  

### Layer 26: Events & Calendar
✅ Event discovery  
✅ RSVP management  
✅ Category organization  
✅ Calendar integration ready  

### ESA Ocean Theme
✅ Color palette compliance  
✅ Glassmorphic design  
✅ Gradient consistency  
✅ Typography hierarchy  

## 16. Related Documentation

- [Event Detail Page](./event-detail.md) - Full event view
- [Events Main Page](./Events.md) - Event discovery hub
- [ESA Layer 26](../esa-layers/layer-26-events-calendar.md) - Events architecture
- [Memory Feed](../content/MemoryFeedUnified.md) - Parent integration
- [Event RSVP System](./EventRSVP.md) - RSVP flow details

## 17. Real-Time Updates Fix (Sept 30, 2025)

### Problem: Gradient Not Updating

Initially, RSVP buttons worked (mutations fired, backend saved data), but the ocean/turquoise gradient highlighting didn't appear until page refresh.

### Root Cause

**React Query Cache Configuration:**
```typescript
// ❌ PROBLEM in client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Prevented UI updates
    }
  }
});
```

**Why gradients didn't show:**
1. `staleTime: Infinity` told React Query data was always "fresh"
2. After mutation, `refetchQueries` fetched updated data from backend
3. But structural sharing made React think data was unchanged
4. No re-render occurred, so gradients never appeared
5. Manual refresh forced full reload, showing correct state

### Solution

**Fixed Query Client Configuration:**
```typescript
// ✅ SOLUTION in client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Data immediately stale, allows updates
    }
  }
});
```

**Updated Mutation Strategy:**
```typescript
// Before: refetchQueries (redundant, awaited)
onSuccess: async () => {
  await queryClient.refetchQueries({ queryKey: ['/api/events/feed'] });
}

// After: invalidateQueries (efficient, synchronous)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
}
```

### Current RSVP Button Behavior

✅ **Instant Visual Feedback:**
- Click RSVP button → gradient appears immediately
- Optimistic update shows change before server responds
- No loading spinner, no delay

✅ **Gradient Styles Applied:**
```tsx
// Ocean/turquoise gradient when selected
className={`
  ${userRsvpStatus === 'going' ? 'bg-gradient-to-br from-[#5EEAD4] to-[#2CB5E8]' : ''}
  ${userRsvpStatus === 'interested' ? 'bg-gradient-to-br from-[#FCD34D] to-[#F59E0B]' : ''}
  ${userRsvpStatus === 'maybe' ? 'bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6]' : ''}
`}
```

✅ **Real-Time Updates:**
- Attendee count updates without refresh
- Status persists after navigation
- Works across all event cards simultaneously

### Testing Real-Time Behavior

**E2E Test:**
```typescript
test('RSVP gradient updates without page refresh', async ({ page }) => {
  await page.goto('/');
  
  // Click "going" on sidebar event
  await page.click('[data-testid="rsvp-attending-3"]');
  
  // Verify gradient appears instantly
  await expect(page.locator('[data-testid="rsvp-attending-3"]')).toHaveClass(/from-\[#5EEAD4\]/);
  
  // Navigate to event detail page
  await page.click('[data-testid="event-card-3"]');
  
  // Verify status persisted (no page.reload needed)
  await expect(page.locator('[data-testid="rsvp-going"]')).toHaveClass(/gradient/);
});
```

### Performance Impact

**Before Fix:**
- Mutation: ~200ms
- UI update: Requires manual refresh (infinite wait)
- User experience: Confusing, appears broken

**After Fix:**
- Mutation: ~200ms
- UI update: Instant (0ms perceived delay)
- User experience: Smooth, professional

### Best Practices Learned

1. **Never use `staleTime: Infinity`** unless data is truly immutable
2. **Prefer `invalidateQueries` over `refetchQueries`** for better performance
3. **Test UI updates without page refresh** during development
4. **Optimistic updates** provide instant feedback even if refetch fails
5. **Always include rollback logic** in `onError` for data consistency

## 18. Changelog

### September 30, 2025 - Real-Time Updates Fix
- ✅ Fixed React Query cache configuration (`staleTime: Infinity` → `staleTime: 0`)
- ✅ Updated mutation strategy (refetchQueries → invalidateQueries)
- ✅ RSVP gradients now update instantly without page refresh
- ✅ Attendee counts update in real-time
- ✅ Removed debug console.log statements
- ✅ Cleaned up mutation callbacks

### September 30, 2025 - Major Refactor
- ✅ Added "interested" RSVP status with Star icon (⭐)
- ✅ Fixed broken optimistic updates (`old?.data` → `old`)
- ✅ Fixed attendee count increment/decrement logic
- ✅ Reordered sections: RSVP'ed → Your City → Events You Follow → Cities You Follow
- ✅ Added aria-labels for accessibility
- ✅ Added loading states during mutations
- ✅ Applied proper ESA ocean theme colors
- ✅ Consolidated duplicate components (archived NewFeedEvents.tsx)

### September 26, 2025 - Initial Implementation
- Created UpcomingEventsSidebar component
- Integrated with ESAMemoryFeed
- Basic RSVP functionality (3 states)
- Event categorization logic
