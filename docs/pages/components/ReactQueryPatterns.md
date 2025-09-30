# React Query Best Practices & Cache Management

## 1. Overview

This guide documents React Query cache management patterns, real-time update strategies, and best practices learned from implementing the RSVP system and post creation features.

**Key Principles:**
- Instant UI feedback through optimistic updates
- Proper cache invalidation for real-time updates  
- Efficient query patterns and data fetching
- Error handling with automatic rollback

## 2. Core Configuration

### Query Client Setup

**Location:** `client/src/lib/queryClient.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // ✅ CRITICAL: Enables real-time updates
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### Why `staleTime: 0` is Critical

❌ **WRONG - Prevents UI Updates:**
```typescript
staleTime: Infinity  // Data never becomes stale
```

**Problems:**
- React Query marks data as "fresh" forever
- `refetchQueries` fetches new data but doesn't trigger re-render
- Structural sharing makes React think data is unchanged
- UI stays stale until manual page refresh

✅ **CORRECT - Enables Real-Time Updates:**
```typescript
staleTime: 0  // Data immediately becomes stale
```

**Benefits:**
- Mutations can invalidate queries successfully
- Fresh data triggers re-renders
- UI updates without page refresh
- Optimal UX for real-time features

## 3. Mutation Patterns

### Standard Mutation with Cache Invalidation

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    return await apiRequest('/api/resource', {
      method: 'POST',
      body: data
    });
  },
  
  onSuccess: () => {
    // Invalidate affected queries (synchronous, batched)
    queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
    queryClient.invalidateQueries({ queryKey: ['/api/resource-list'] });
    
    // Show success feedback
    toast({ title: "Success!", description: "Resource created" });
  },
  
  onError: (error) => {
    toast({ 
      title: "Error", 
      description: error.message,
      variant: "destructive"
    });
  }
});
```

### Optimistic Updates Pattern

**Use When:** You want instant UI feedback before server confirms

```typescript
const rsvpMutation = useMutation({
  mutationFn: async ({ eventId, status }) => {
    return await apiRequest(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: { status }
    });
  },
  
  // 1. Optimistic update
  onMutate: async ({ eventId, status }) => {
    // Cancel in-flight queries to prevent race conditions
    await queryClient.cancelQueries({ queryKey: ['/api/events/feed'] });
    
    // Snapshot current data for rollback
    const previousEvents = queryClient.getQueryData(['/api/events/feed']);
    
    // Update cache optimistically
    queryClient.setQueryData(['/api/events/feed'], (old: any) => {
      if (!old) return old;
      
      return old.map((event: any) => {
        if (event.id === eventId) {
          return { ...event, userRsvpStatus: status };
        }
        return event;
      });
    });
    
    // Return snapshot for rollback
    return { previousEvents };
  },
  
  // 2. Rollback on error
  onError: (err, variables, context) => {
    if (context?.previousEvents) {
      queryClient.setQueryData(['/api/events/feed'], context.previousEvents);
    }
    toast({ title: "Error", description: "Failed to update", variant: "destructive" });
  },
  
  // 3. Invalidate for server reconciliation
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
  }
});
```

### When to Use Each Approach

| Pattern | Use Case | Pros | Cons |
|---------|----------|------|------|
| **Simple Invalidation** | Most mutations | Simple, reliable | Brief loading state |
| **Optimistic Updates** | Frequent user actions (RSVP, likes) | Instant feedback | Requires rollback logic |
| **setQueryData with Result** | Server returns updated resource | No refetch needed | Complex merging logic |

## 4. Cache Invalidation Strategies

### invalidateQueries vs refetchQueries vs setQueryData

**invalidateQueries (Recommended):**
```typescript
// ✅ Best for most cases
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
}
```
- Marks query as stale
- Triggers refetch if query is currently active
- Batches multiple invalidations efficiently
- No await needed

**refetchQueries (Use Sparingly):**
```typescript
// ⚠️ Only when you need to force refetch inactive queries
onSuccess: async () => {
  await queryClient.refetchQueries({ queryKey: ['/api/posts'] });
}
```
- Forces immediate refetch
- Refetches even inactive queries
- Requires await (slower)
- Use for critical data that must be fresh

**setQueryData (Advanced):**
```typescript
// 🔧 When you have the exact new data
onSuccess: (newPost) => {
  queryClient.setQueryData(['/api/posts'], (old: any) => {
    return [newPost, ...(old || [])];
  });
}
```
- No network request
- Instant update
- Requires careful merging logic
- Risk of stale data if merge is wrong

### Query Key Patterns

**Hierarchical Keys (Recommended):**
```typescript
// ✅ Allows granular invalidation
queryKey: ['/api/posts']              // All posts
queryKey: ['/api/posts', id]          // Specific post
queryKey: ['/api/posts', { filter }]  // Filtered posts

// Invalidate all posts (including filtered):
queryClient.invalidateQueries({ queryKey: ['/api/posts'] });

// Invalidate only specific post:
queryClient.invalidateQueries({ queryKey: ['/api/posts', id] });
```

**String Interpolation (Avoid):**
```typescript
// ❌ Hard to invalidate partial matches
queryKey: [`/api/posts/${id}`]
queryKey: [`/api/posts?filter=${filter}`]
```

## 5. Real-Time Update Checklist

When implementing any mutation that should update UI immediately:

- [ ] **Set `staleTime: 0`** in query configuration
- [ ] **Use optimistic updates** for instant feedback
- [ ] **Cancel in-flight queries** in `onMutate`
- [ ] **Snapshot data for rollback** in `onMutate`
- [ ] **Invalidate all affected queries** in `onSuccess`
- [ ] **Implement rollback** in `onError`
- [ ] **Test without page refresh** to verify real-time behavior
- [ ] **Add loading states** during mutations
- [ ] **Show success/error toasts** for user feedback

## 6. Common Pitfalls & Solutions

### Pitfall 1: UI Not Updating After Mutation

**Symptom:** Mutation succeeds but UI shows stale data until refresh

**Cause:** `staleTime: Infinity` or missing invalidation

**Solution:**
```typescript
// Fix query client config
staleTime: 0

// Always invalidate in onSuccess
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
}
```

### Pitfall 2: Data Structure Mismatch

**Symptom:** Optimistic update doesn't work, console shows type errors

**Cause:** Assuming wrapped response `{data: [...]}` when API returns direct array

**Solution:**
```typescript
// ❌ WRONG: Assumes wrapped data
queryClient.setQueryData(['/api/events'], (old: any) => {
  return { ...old, data: old.data.map(...) };
});

// ✅ CORRECT: Match actual structure
queryClient.setQueryData(['/api/events'], (old: any) => {
  return old?.map(...);
});
```

### Pitfall 3: Race Conditions

**Symptom:** Inconsistent UI state when multiple mutations fire

**Cause:** Not canceling in-flight queries

**Solution:**
```typescript
onMutate: async (variables) => {
  // ✅ Cancel to prevent race conditions
  await queryClient.cancelQueries({ queryKey: ['/api/resource'] });
  
  // ... rest of optimistic update
}
```

### Pitfall 4: Missing Rollback

**Symptom:** UI shows success but mutation failed, data inconsistent

**Cause:** No error handling with rollback

**Solution:**
```typescript
onMutate: async () => {
  const previousData = queryClient.getQueryData(['/api/resource']);
  // ... optimistic update
  return { previousData };
},

onError: (err, variables, context) => {
  // ✅ Rollback on error
  if (context?.previousData) {
    queryClient.setQueryData(['/api/resource'], context.previousData);
  }
}
```

## 7. Testing Patterns

### Unit Test: Mutation Logic

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

test('mutation updates cache correctly', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 0 } }
  });
  
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  
  const { result } = renderHook(() => useMyMutation(), { wrapper });
  
  act(() => {
    result.current.mutate({ id: 1, status: 'going' });
  });
  
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
  
  const cached = queryClient.getQueryData(['/api/resource']);
  expect(cached).toMatchObject({ id: 1, status: 'going' });
});
```

### E2E Test: Real-Time Updates

```typescript
test('UI updates without page refresh', async ({ page }) => {
  await page.goto('/');
  
  // Perform mutation
  await page.click('[data-testid="button-submit"]');
  
  // Verify instant update (NO page.reload())
  await expect(page.locator('[data-testid="status"]')).toHaveText('Updated');
  
  // Navigate away and back
  await page.goto('/other-page');
  await page.goto('/');
  
  // Verify persistence
  await expect(page.locator('[data-testid="status"]')).toHaveText('Updated');
});
```

## 8. Performance Optimization

### Batch Invalidations

```typescript
// ❌ Triggers 3 separate refetches
queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
queryClient.invalidateQueries({ queryKey: ['/api/users'] });

// ✅ React Query automatically batches
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
  queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
  queryClient.invalidateQueries({ queryKey: ['/api/users'] });
}
// Results in single batched refetch per query
```

### Selective Refetching

```typescript
// Invalidate only active queries
queryClient.invalidateQueries({ 
  queryKey: ['/api/posts'],
  refetchType: 'active' // Don't refetch inactive queries
});

// Or invalidate but don't refetch at all
queryClient.invalidateQueries({ 
  queryKey: ['/api/posts'],
  refetchType: 'none' // Just mark as stale
});
```

## 9. Migration Guide

### Upgrading from staleTime: Infinity to staleTime: 0

**Step 1:** Update query client configuration
```typescript
// client/src/lib/queryClient.ts
staleTime: Infinity  →  staleTime: 0
```

**Step 2:** Review all mutations
```typescript
// Change refetchQueries to invalidateQueries
onSuccess: async () => {
  await queryClient.refetchQueries({ queryKey: [...] });
}
↓
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [...] });
}
```

**Step 3:** Test all features without page refresh
- RSVP buttons
- Post creation
- Comments
- Likes/reactions
- Any user-triggered data changes

**Step 4:** Monitor for issues
- Check browser console for errors
- Verify no infinite refetch loops
- Confirm data consistency

## 10. Quick Reference

### When to Use Each Pattern

| Feature | Pattern | Code |
|---------|---------|------|
| Simple form submission | Basic invalidation | `invalidateQueries()` |
| Like/favorite button | Optimistic update | `onMutate + onError rollback` |
| RSVP, voting | Optimistic + invalidate | Both patterns combined |
| Create with server ID | setQueryData with result | Use returned data directly |
| Delete operation | Remove from cache | Filter out in setQueryData |
| Bulk operations | Batch invalidations | Multiple invalidateQueries |

### Code Templates

**Template 1: Basic Mutation**
```typescript
const mutation = useMutation({
  mutationFn: async (data) => await apiRequest('/api/resource', { method: 'POST', body: data }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/resource'] }),
  onError: (error) => toast({ title: "Error", description: error.message })
});
```

**Template 2: Optimistic Mutation**
```typescript
const mutation = useMutation({
  mutationFn: async (data) => await apiRequest('/api/resource', { method: 'POST', body: data }),
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['/api/resource'] });
    const previous = queryClient.getQueryData(['/api/resource']);
    queryClient.setQueryData(['/api/resource'], (old) => ({ ...old, ...newData }));
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['/api/resource'], context.previous);
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/resource'] })
});
```

## 11. Related Documentation

- [Event RSVP System](../events/EventRSVP.md) - Real-world RSVP implementation
- [Upcoming Events Sidebar](../events/UpcomingEventsSidebar.md) - Optimistic updates example
- [Post Creation](./PostCreator.md) - Cache invalidation patterns
- [TanStack Query v5 Docs](https://tanstack.com/query/v5) - Official documentation

## 12. Changelog

### September 30, 2025 - Initial Guide
- Created comprehensive React Query best practices guide
- Documented real-time update patterns from RSVP fix
- Added migration guide from staleTime: Infinity to staleTime: 0
- Included code templates and testing patterns
