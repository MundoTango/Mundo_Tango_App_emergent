# RSVP Cache Architecture - ESA Layer 14 Implementation

**Last Updated:** October 7, 2025  
**Status:** ✅ Production-Ready  
**ESA Framework:** Layer 7 (State Management) + Layer 14 (Caching) + Layer 26 (Events & Calendar)

---

## Executive Summary

This document details the **single QueryClient cache architecture** that powers instant RSVP updates across all platform surfaces. On October 7, 2025, we identified and fixed a critical **dual QueryClient bug** where separate cache instances prevented UI updates. This architecture now ensures that clicking an RSVP button anywhere on the platform updates **all surfaces instantly** without page refresh.

---

## The Dual QueryClient Bug (Root Cause Analysis)

### Problem Statement

**Symptom:** RSVP buttons didn't update in real-time. Clicking "Going" in the Upcoming Events Sidebar showed no visual change, despite successful API calls.

**Root Cause:** Two separate `QueryClient` instances with independent caches:

1. **App.tsx** (Line 37) - Created its own QueryClient with different settings
2. **lib/queryClient.ts** (Line 128) - Shared QueryClient with ESA Layer 14 configuration

### Why This Broke Everything

```typescript
// ❌ PROBLEM: App.tsx created separate cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,  // 60 seconds
      retry: 1
    }
  }
});

// ❌ Mutations used different cache from lib/queryClient.ts
import { queryClient } from '@/lib/queryClient'; // Different instance!
```

**The Flow:**
1. User clicks RSVP button
2. `useEventRSVP` mutation updates cache in `lib/queryClient.ts` ✅
3. Components read from cache in `App.tsx` ❌
4. **Caches never sync → UI never updates**

### The Fix

**Solution:** Single shared QueryClient across entire application

```typescript
// ✅ FIXED: App.tsx imports shared instance
import { queryClient } from "@/lib/queryClient";

// Now ALL components and mutations use the SAME cache
```

---

## ESA Layer 14 Cache Configuration

### Single QueryClient Pattern

**Location:** `client/src/lib/queryClient.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // ✅ Allow immediate updates after mutations
      gcTime: 30 * 60 * 1000, // ✅ ESA Layer 14: Keep cache for 30min
      retry: false,
      structuralSharing: false // ✅ Clean cache updates
    },
    mutations: {
      retry: false
    }
  }
});
```

### Configuration Rationale

| Setting | Value | Reason |
|---------|-------|--------|
| `staleTime` | `0` | Immediate updates after mutations - no stale data |
| `gcTime` | `30min` | Prevents premature garbage collection during active sessions |
| `refetchOnWindowFocus` | `false` | Manual control over refetching |
| `structuralSharing` | `false` | Ensures clean cache updates without reference conflicts |

### Query Key Conventions

**Pattern:** Hierarchical array-based keys for granular invalidation

```typescript
// Main event feed (sidebar, general events)
['/api/events/feed']

// Group-specific events
['/api/events/feed', { groupId: 123 }]

// Upcoming events
['/api/events/upcoming']

// User's personal events  
['/api/user/events', { userId: 456 }]

// Specific event detail
['/api/events', eventId]
```

**Why Arrays?** Enables predicate-based invalidation:
```typescript
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === '/api/events/feed'
  // Matches BOTH ['/api/events/feed'] and ['/api/events/feed', { groupId: X }]
});
```

---

## Optimistic Update Pattern (useEventRSVP)

### Complete Flow

**Location:** `client/src/hooks/useEventRSVP.ts`

```typescript
export function useEventRSVP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, status }) => {
      return await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        body: { status }
      });
    },
    
    // Step 1: Save & Cancel
    onMutate: async ({ eventId, status }) => {
      // CRITICAL: Save BEFORE cancelling to avoid race conditions
      const previousData = new Map();
      
      queryClient.getQueriesData({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/events/feed' ||
            key[0] === '/api/events/upcoming' ||
            key[0] === '/api/user/events'
          );
        }
      }).forEach(([queryKey, data]) => {
        if (data) {
          previousData.set(JSON.stringify(queryKey), { queryKey, data });
        }
      });
      
      // Cancel in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/events/feed' ||
            key[0] === '/api/events/upcoming' ||
            key[0] === '/api/user/events'
          );
        }
      });
      
      // Step 2: Optimistic Update
      previousData.forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          
          const dataArray = old?.data || old;
          
          if (Array.isArray(dataArray)) {
            const updated = dataArray.map(event => {
              if (event.id.toString() === eventId) {
                const oldStatus = event.userRsvpStatus;
                const oldAttendees = event.current_attendees || 0;
                
                let attendeeChange = 0;
                if (oldStatus === 'going' && status !== 'going') {
                  attendeeChange = -1;
                } else if (oldStatus !== 'going' && status === 'going') {
                  attendeeChange = 1;
                }
                
                return { 
                  ...event, 
                  userRsvpStatus: status,
                  current_attendees: Math.max(0, oldAttendees + attendeeChange),
                  attendeesCount: Math.max(0, oldAttendees + attendeeChange)
                };
              }
              return event;
            });
            
            return old?.data ? { ...old, data: updated } : updated;
          }
          
          return old;
        });
      });
      
      return { previousData };
    },
    
    // Step 3: Rollback on Error
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive"
      });
    },
    
    // Step 4: Invalidate on Success
    onSuccess: (data, { eventId, status }) => {
      toast({
        title: "RSVP Updated",
        description: `You're now marked as ${status}`,
      });
      
      // ESA Layer 14: Invalidate with immediate refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/events/feed' ||
            key[0] === '/api/events/upcoming' ||
            key[0] === `/api/events/${eventId}` ||
            key[0] === '/api/user/events'
          );
        },
        refetchType: 'active' // Force immediate refetch of active queries
      });
    }
  });
}
```

### Execution Order (Critical!)

1. **Save previous data** → Before cancelling (prevents data loss)
2. **Cancel in-flight queries** → Prevent race conditions
3. **Apply optimistic updates** → Instant UI feedback
4. **Send API request** → Server-side persistence
5. **On Success:** Invalidate + refetch → Sync with server
6. **On Error:** Rollback → Restore previous state

---

## Cross-Surface Update Pattern

### How It Works

When a user clicks RSVP in **any** surface, **all** surfaces update instantly:

```
User clicks "Going" in Sidebar
         ↓
  useEventRSVP mutation
         ↓
  Optimistic update to shared cache
         ↓
  All components re-render with new data:
    ✅ Upcoming Events Sidebar
    ✅ Group Events Page  
    ✅ Event Detail Page
    ✅ User Profile Events
    ✅ Event Discovery Feed
    ✅ Memories Feed (if event linked)
```

### Component Integration

**All RSVP surfaces must:**

1. Import shared `queryClient` via `useQueryClient()` hook
2. Use `useEventRSVP()` mutation hook (never create custom mutations)
3. Show loading state with `isPending` from mutation
4. Display updated RSVP status from cache immediately

**Example Implementation:**

```typescript
// ✅ CORRECT Pattern
import { useEventRSVP } from '@/hooks/useEventRSVP';

function EventCard({ event }) {
  const { mutate, isPending } = useEventRSVP();
  
  const handleRSVP = (status: string) => {
    mutate({ eventId: event.id, status });
  };
  
  return (
    <Button 
      onClick={() => handleRSVP('going')}
      disabled={isPending}
      variant={event.userRsvpStatus === 'going' ? 'default' : 'outline'}
    >
      {isPending ? 'Updating...' : 'Going'} ({event.current_attendees})
    </Button>
  );
}
```

---

## Common Pitfalls & Solutions

### 1. Dual QueryClient Instances

**❌ NEVER DO THIS:**
```typescript
// Creating a new QueryClient in component/page files
const queryClient = new QueryClient({ ... });
```

**✅ ALWAYS DO THIS:**
```typescript
// Import shared instance
import { queryClient } from '@/lib/queryClient';
// OR use hook in components
const queryClient = useQueryClient();
```

### 2. Query Key Mismatches

**❌ Problem:** Different key structures prevent cache updates
```typescript
// Component uses:
queryKey: [`/api/events/${eventId}`]

// Mutation invalidates:
key[0] === '/api/events/feed' // MISMATCH!
```

**✅ Solution:** Use consistent hierarchical keys
```typescript
// Component:
queryKey: ['/api/events', eventId]

// Mutation:
key[0] === '/api/events' // MATCH!
```

### 3. Premature Garbage Collection

**❌ Problem:** Cache cleared before mutation completes
```typescript
gcTime: 0 // Cache cleared immediately when component unmounts
```

**✅ Solution:** Set appropriate garbage collection time
```typescript
gcTime: 30 * 60 * 1000 // 30 minutes - survives navigation
```

### 4. Wrong Data Structure Assumptions

**❌ Problem:** Assuming wrapped response
```typescript
queryClient.setQueryData(key, (old: any) => {
  if (!old?.data) return old; // Assumes { data: [...] }
  return { ...old, data: old.data.map(...) };
});
```

**✅ Solution:** Handle both direct arrays and wrapped responses
```typescript
queryClient.setQueryData(key, (old: any) => {
  if (!old) return old;
  
  const dataArray = old?.data || old; // ✅ Works for both
  
  if (Array.isArray(dataArray)) {
    const updated = dataArray.map(...);
    return old?.data ? { ...old, data: updated } : updated;
  }
  
  return old;
});
```

### 5. Missing Rollback Logic

**❌ Problem:** UI stays in broken state on error
```typescript
onError: (err) => {
  toast({ title: "Error" }); // UI still shows optimistic update!
}
```

**✅ Solution:** Always rollback on error
```typescript
onError: (err, variables, context) => {
  if (context?.previousData) {
    context.previousData.forEach(({ queryKey, data }: any) => {
      queryClient.setQueryData(queryKey, data);
    });
  }
  toast({ title: "Error", variant: "destructive" });
}
```

---

## Testing & Validation

### Manual Testing Checklist

- [ ] Click RSVP in Sidebar → Verify button updates instantly
- [ ] Navigate to Group Events → Verify same event shows updated RSVP
- [ ] Open Event Detail → Verify RSVP status matches
- [ ] Check User Profile Events → Verify attendee count updated
- [ ] Test error case (disconnect network) → Verify rollback works
- [ ] Test rapid clicks → Verify no race conditions

### Automated Testing (Future)

**Unit Test Pattern:**
```typescript
describe('useEventRSVP', () => {
  it('updates cache optimistically', async () => {
    const { result } = renderHook(() => useEventRSVP());
    
    act(() => {
      result.current.mutate({ eventId: '123', status: 'going' });
    });
    
    const cachedData = queryClient.getQueryData(['/api/events/feed']);
    expect(cachedData[0].userRsvpStatus).toBe('going');
  });
  
  it('rolls back on error', async () => {
    // Mock API failure
    server.use(
      rest.post('/api/events/:id/rsvp', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    const { result } = renderHook(() => useEventRSVP());
    
    act(() => {
      result.current.mutate({ eventId: '123', status: 'going' });
    });
    
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(['/api/events/feed']);
      expect(cachedData[0].userRsvpStatus).toBe(null); // Rolled back
    });
  });
});
```

**E2E Test Pattern (Playwright):**
```typescript
test('RSVP updates across surfaces', async ({ page }) => {
  await page.goto('/groups/1');
  
  // Click RSVP in sidebar
  await page.getByTestId('sidebar-rsvp-going-9').click();
  
  // Verify sidebar updates instantly (no page refresh)
  await expect(page.getByTestId('sidebar-rsvp-going-9')).toHaveClass(/bg-teal-500/);
  
  // Navigate to event detail
  await page.getByTestId('event-card-9').click();
  
  // Verify event detail shows same RSVP (from shared cache)
  await expect(page.getByTestId('detail-rsvp-going-9')).toHaveClass(/bg-teal-500/);
});
```

---

## Platform-Wide Application

### Other Mutation Systems to Refactor

This pattern applies to **any mutation requiring instant UI updates:**

1. **Post Likes** - Update like count across feed, profile, detail pages
2. **Comments** - Show new comment immediately in all feeds
3. **Friend Requests** - Update friend lists, notifications, profile pages
4. **Housing Bookings** - Update availability, booking lists, calendar
5. **Profile Updates** - Reflect changes across navbar, profile, cards

### Migration Checklist

For each mutation system:

- [ ] Create dedicated mutation hook (e.g., `usePostLike`)
- [ ] Use shared `queryClient` from `@/lib/queryClient`
- [ ] Implement optimistic updates with rollback
- [ ] Use predicate-based invalidation for all related queries
- [ ] Add `isPending` loading states to UI
- [ ] Test cross-surface updates
- [ ] Document query key patterns

---

## Performance Considerations

### Cache Monitoring (ESA Layer 48)

**Metrics to Track:**
- Cache hit rate (target: >80%)
- Mutation success rate (target: >95%)
- Optimistic update latency (target: <50ms)
- Rollback frequency (target: <5%)
- Cache size (monitor for memory leaks)

**Dashboard Integration:**
```typescript
// Add to /admin/agent-metrics
const cacheStats = {
  hitRate: queryClient.getQueryCache().getAll().filter(q => q.state.data).length / 
           queryClient.getQueryCache().getAll().length,
  mutationSuccessRate: // Track from mutation metrics
  averageOptimisticUpdateTime: // Track with performance.now()
};
```

### Memory Management

**30min gcTime Rationale:**
- Typical session: 15-45 minutes
- Prevents cache loss during navigation
- Auto-cleanup after user leaves
- Balance between UX and memory usage

**When to Adjust:**
- Sessions >45min: Increase to 60min
- Memory constraints: Decrease to 15min
- High navigation: Increase to 60min

---

## Deployment Checklist

Before deploying RSVP changes:

- [ ] Verify single QueryClient in `App.tsx`
- [ ] Confirm `gcTime: 30min` in `lib/queryClient.ts`
- [ ] Test all 7 RSVP surfaces update together
- [ ] Remove debugging `console.log` statements
- [ ] Run ESLint to catch `new QueryClient(` in components
- [ ] Monitor cache metrics for 24h post-deploy
- [ ] Document any edge cases discovered

---

## References

- **ESA Master Orchestration:** `ESA_ORCHESTRATION.md`
- **ESA Layer 14 (Caching):** `ESA.md`
- **Aurora Tide Design:** `docs/pages/design-systems/aurora-tide.md`
- **TanStack Query Docs:** https://tanstack.com/query/latest/docs/react/overview

---

**Document Status:** ✅ Complete - October 7, 2025  
**Next Review:** Post-deployment metrics analysis  
**Maintainer:** Platform Architecture Team
