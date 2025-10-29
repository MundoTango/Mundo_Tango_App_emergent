# Query Key Conventions & Standards

**Date:** October 7, 2025  
**Status:** Active Standard  
**ESA Layer:** Layer 14 (Caching Strategy)

---

## Overview

This document defines the standardized query key patterns for the Life CEO & Mundo Tango platform. Consistent query keys are critical for:
- Cross-surface cache synchronization
- Efficient invalidation patterns
- Optimistic update reliability
- Preventing cache bugs

---

## Core Principles

### 1. Hierarchical Structure
```typescript
// ✅ CORRECT - Hierarchical with optional params
['/api/posts/feed']                    // Base feed
['/api/posts/feed', { userId: 123 }]   // User-specific feed
['/api/posts/feed', { groupId: 456 }]  // Group-specific feed

// ❌ WRONG - Flat string concatenation
['/api/posts/feed/user/123']           // Hard to match with predicates
```

### 2. Consistent Base Paths
```typescript
// Posts & Social
['/api/posts/feed']          // Main post feed
['/api/posts', postId]       // Individual post
['/api/posts/${postId}/comments']  // Post comments

// Events
['/api/events/feed']         // Main event feed
['/api/events/feed', { groupId }]  // Group events
['/api/user/events']         // User's events

// Friends
['/api/friends/list']        // Friend list
['/api/friends/requests']    // Friend requests
['/api/friends/suggestions'] // Friend suggestions

// Housing
['/api/housing/listings']    // All listings
['/api/housing/listings', { cityId }]  // City listings
['/api/housing/bookings']    // User bookings
```

### 3. Parameter Objects (Not Strings)
```typescript
// ✅ CORRECT - Object params for easy matching
['/api/posts/feed', { userId: 123, filter: 'recent' }]

// ❌ WRONG - String interpolation
[`/api/posts/feed?userId=123&filter=recent`]
```

---

## Standard Patterns by Domain

### Posts & Social Media

```typescript
// Feeds
['/api/posts/feed']                      // Main timeline
['/api/posts/feed', { userId }]          // User profile posts
['/api/posts/feed', { groupId }]         // Group posts
['/api/posts/feed', { eventId }]         // Event posts
['/api/feed']                            // Legacy feed (migrate to /api/posts/feed)
['/api/timeline']                        // Legacy timeline (migrate to /api/posts/feed)
['/api/memories']                        // Memories feed

// Individual Posts
['/api/posts', postId]                   // Single post detail
['/api/posts/${postId}/comments']        // Post comments

// Likes & Reactions
// (Embedded in post data, no separate queries)
```

**Predicate Matcher:**
```typescript
predicate: (query) => {
  const key = query.queryKey;
  return Array.isArray(key) && (
    key[0] === '/api/posts/feed' ||
    key[0] === '/api/posts' ||
    key[0] === '/api/feed' ||
    key[0] === '/api/timeline' ||
    key[0] === '/api/memories' ||
    String(key[0]).startsWith('/api/posts/') ||
    String(key[0]).includes('/posts')
  );
}
```

---

### Events & Calendar

```typescript
// Event Feeds
['/api/events/feed']                     // All events
['/api/events/feed', { groupId }]        // Group events
['/api/events/upcoming']                 // Upcoming events (sidebar)
['/api/user/events']                     // User's events (RSVPs)

// Individual Events
['/api/events', eventId]                 // Event detail
```

**Predicate Matcher:**
```typescript
predicate: (query) => {
  const key = query.queryKey;
  return Array.isArray(key) && (
    key[0] === '/api/events/feed' ||
    key[0] === '/api/events/upcoming' ||
    key[0] === '/api/user/events' ||
    key[0] === '/api/events'
  );
}
```

---

### Friends & Connections

```typescript
// Friend Lists
['/api/friends/list']                    // User's friends
['/api/friends/list', { userId }]        // Another user's friends
['/api/friends/requests']                // Pending requests
['/api/friends/suggestions']             // Friend suggestions

// Connection Levels
['/api/friends/network', { userId }]     // Connection graph
```

**Predicate Matcher:**
```typescript
predicate: (query) => {
  const key = query.queryKey;
  return Array.isArray(key) && (
    key[0] === '/api/friends/list' ||
    key[0] === '/api/friends/requests' ||
    key[0] === '/api/friends/suggestions' ||
    String(key[0]).startsWith('/api/friends/')
  );
}
```

---

### Housing & Marketplace

```typescript
// Listings
['/api/housing/listings']                // All listings
['/api/housing/listings', { cityId }]    // City-specific
['/api/housing/listings', { hostId }]    // Host's properties

// Bookings
['/api/housing/bookings']                // Guest bookings
['/api/housing/bookings/host']           // Host's bookings

// Reviews
['/api/housing/reviews', { propertyId }] // Property reviews
```

---

### Notifications

```typescript
['/api/notifications']                   // User notifications
['/api/notifications', { type: 'unread' }] // Filtered notifications
```

---

## Migration Patterns

### Consolidating Legacy Keys

**Before (Multiple inconsistent keys):**
```typescript
// ❌ Scattered keys
['/api/posts']
['/api/feed']
['/api/timeline']
['/api/user/posts', userId]
```

**After (Unified hierarchical keys):**
```typescript
// ✅ Standardized
['/api/posts/feed']                    // Main feed
['/api/posts/feed', { userId }]        // User posts
```

**Migration Steps:**
1. Update all queries to use new keys
2. Update mutation invalidation to match new keys
3. Keep legacy keys for 1 release (backwards compatibility)
4. Remove legacy keys after confirming no usage

---

## Predicate Patterns

### Exact Match
```typescript
// Match specific query
queryClient.invalidateQueries({ 
  queryKey: ['/api/posts/feed']
});
```

### Prefix Match (All Variants)
```typescript
// Match all posts queries
queryClient.invalidateQueries({ 
  predicate: (query) => {
    const key = query.queryKey;
    return Array.isArray(key) && key[0] === '/api/posts/feed';
  }
});
```

### Broad Match (Multiple Domains)
```typescript
// Match posts across all surfaces
queryClient.invalidateQueries({ 
  predicate: (query) => {
    const key = query.queryKey;
    return Array.isArray(key) && (
      key[0] === '/api/posts/feed' ||
      key[0] === '/api/feed' ||
      key[0] === '/api/timeline'
    );
  }
});
```

---

## Anti-Patterns to Avoid

### ❌ String Interpolation in Keys
```typescript
// BAD - Hard to match with predicates
queryKey: [`/api/posts/${userId}/feed`]

// GOOD - Hierarchical structure
queryKey: ['/api/posts/feed', { userId }]
```

### ❌ Inconsistent Naming
```typescript
// BAD - Mixed conventions
['/api/getPosts']      // camelCase
['/api/fetch-events']  // kebab-case
['/api/UserFriends']   // PascalCase

// GOOD - Consistent REST-style
['/api/posts/feed']
['/api/events/feed']
['/api/friends/list']
```

### ❌ Query Params in String
```typescript
// BAD - Can't programmatically filter
['/api/posts?userId=123&filter=recent']

// GOOD - Separate params
['/api/posts/feed', { userId: 123, filter: 'recent' }]
```

---

## Testing Query Key Matches

### Helper Function
```typescript
/**
 * Test if a query key matches a pattern
 */
function matchesQueryKey(
  queryKey: unknown[], 
  pattern: { base?: string; params?: object }
): boolean {
  if (!Array.isArray(queryKey)) return false;
  
  if (pattern.base && queryKey[0] !== pattern.base) {
    return false;
  }
  
  if (pattern.params && queryKey[1]) {
    const params = queryKey[1];
    return Object.entries(pattern.params).every(
      ([key, value]) => params[key] === value
    );
  }
  
  return true;
}

// Usage
matchesQueryKey(
  ['/api/posts/feed', { userId: 123 }],
  { base: '/api/posts/feed', params: { userId: 123 } }
); // true
```

---

## ESA Framework Compliance

### Layer 14 (Caching Strategy) ✅
- Consistent query key structure
- Efficient invalidation patterns
- Cross-surface cache synchronization

### Layer 7 (State Management) ✅
- Single source of truth per resource
- Hierarchical data organization
- Predictable cache behavior

---

## Best Practices

1. **Always use array format**: `['/api/resource', params]`
2. **Keep base path at index 0**: `/api/domain/resource`
3. **Use objects for params**: `{ userId, filter, page }`
4. **Document new patterns**: Update this guide
5. **Test predicates**: Verify invalidation matches intended queries

---

## References

- **RSVP Pattern:** `docs/pages/events/rsvp-cache-architecture.md`
- **Mutation Hooks:** `docs/pages/architecture/standardized-mutation-hooks.md`
- **ESA Framework:** `ESA_MASTER_ORCHESTRATION.md`
- **TanStack Query Docs:** https://tanstack.com/query/latest/docs/framework/react/guides/query-keys

---

*Last Updated: October 7, 2025*  
*Status: Active Standard - All new queries must follow these conventions*
