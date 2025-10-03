# PostFeed Component Documentation

**Last Updated:** October 3, 2025  
**Component Path:** `client/src/components/moments/PostFeed.tsx`  
**ESA Framework Layer:** Layer 22 - Social Feed Management  
**Status:** ✅ PRODUCTION READY

---

## Overview

PostFeed is a **context-based, smart feed component** that eliminates code duplication across all post feeds in the platform (Memories, Groups, Events, Profiles). It handles data fetching, pagination, infinite scroll, loading states, and mutation cache invalidation internally based on a feed context prop.

### Key Principle

**"One component, zero duplication"** - Any feed that displays posts should use PostFeed with a context prop, rather than implementing its own fetch/pagination logic.

---

## Architecture Pattern

### Before (Legacy Pattern - ❌ DON'T USE)

```tsx
// Parent component had to manage everything:
const [posts, setPosts] = useState([]);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

const fetchPosts = async () => {
  setLoading(true);
  const response = await fetch(`/api/posts?page=${page}`);
  const data = await response.json();
  setPosts(prev => [...prev, ...data.posts]);
  setHasMore(data.hasMore);
  setLoading(false);
};

useEffect(() => { fetchPosts(); }, [page]);

// Socket handlers for real-time updates
// Mutation handlers for like/comment/delete
// Filter/search state management
// 200+ lines of duplicate code...

return <PostFeed posts={posts} loading={loading} />;
```

### After (Unified Pattern - ✅ USE THIS)

```tsx
// Parent component is now a thin wrapper:
<PostFeed 
  context={{ 
    type: 'group', 
    groupId: 7,
    filter: 'all'
  }} 
/>

// PostFeed handles EVERYTHING internally:
// - Data fetching
// - Pagination & infinite scroll
// - Loading states
// - Cache invalidation
// - Filter/search reset
// - Mutation updates
```

**Result:** ~430 lines of duplicate code eliminated across Memories and Groups feeds.

---

## Context Types

PostFeed supports four context types, each with its own data source and query keys:

### 1. Feed Context (Memories Feed)

```tsx
<PostFeed 
  context={{ 
    type: 'feed' 
  }}
  showFilters={true}
  showSearch={true}
/>
```

- **Fetches from:** `/api/posts/feed`
- **Query Key:** `['/api/posts/feed', page]`
- **Use Case:** Main Memories feed on `/memories` page
- **Features:** All filters (photos/videos, links, all posts, friends only)

### 2. Group Context (Group Posts)

```tsx
<PostFeed 
  context={{ 
    type: 'group',
    groupId: 7,
    filter: 'all' // or 'residents', 'visitors', 'members', 'non-members'
  }}
  showFilters={false}
  showSearch={false}
/>
```

- **Fetches from:** `/api/groups/${groupId}/posts?filter=${filter}`
- **Query Key:** `['/api/groups', groupId, 'posts', filter, page]`
- **Use Case:** Group detail page Posts tab
- **Features:** Group-specific filtering by member status

#### Known Issues Fixed

**Group Filter Bug (October 3, 2025)**  
Early implementation incorrectly built group filter URLs as `/api/groups/7/posts/filter/residents` (filter in path) instead of `/api/groups/7/posts?filter=residents` (filter as query parameter). This caused filter buttons (Residents, Visitors, Members, Non-members) to appear non-functional as requests went to non-existent endpoints.

**Root Cause:** `buildFetchUrl()` was concatenating filter into URL path instead of appending via URLSearchParams.

**Fix:** Changed lines 217-224 to append filter as query parameter:
```typescript
if (context.filter && context.filter !== 'all') {
  params.append('filter', context.filter);
}
return `/api/groups/${context.groupId}/posts?${params.toString()}`;
```

**Impact:** All group filters now work correctly across both city groups (residents/visitors) and professional groups (members/non-members).

### 3. Profile Context (User Posts)

```tsx
<PostFeed 
  context={{ 
    type: 'profile',
    userId: 123
  }}
  showFilters={false}
  showSearch={false}
/>
```

- **Fetches from:** `/api/users/${userId}/posts`
- **Query Key:** `['/api/users', userId, 'posts', page]`
- **Use Case:** User profile page Posts tab
- **Features:** Shows only that user's posts

### 4. Event Context (Event Posts)

```tsx
<PostFeed 
  context={{ 
    type: 'event',
    eventId: 456,
    filter: 'all' // or 'participants', 'guests'
  }}
  showFilters={false}
  showSearch={false}
/>
```

- **Fetches from:** `/api/events/${eventId}/posts?filter=${filter}`
- **Query Key:** `['/api/events', eventId, 'posts', filter, page]`
- **Use Case:** Event detail page Posts tab
- **Features:** Shows event-related posts with optional filtering:
  - `'all'`: All event posts (default)
  - `'participants'`: Only posts from RSVPed users
  - `'guests'`: Only posts from non-RSVPed users

---

## Internal Architecture

### Smart vs Controlled Modes

PostFeed operates in two modes:

#### Smart Mode (Recommended)
```tsx
// Pass context, component fetches data internally
<PostFeed context={{ type: 'feed' }} />
```

#### Controlled Mode (Legacy Compatibility)
```tsx
// Parent passes posts prop for custom control
<PostFeed posts={customPosts} />
```

**New implementations should always use Smart Mode.**

### Data Flow

```
Parent Component
    ↓ (passes context prop)
PostFeed
    ↓ (builds query URL from context)
useQuery with React Query
    ↓ (fetches from API)
Internal State Management
    ↓ (manages page, posts, hasMore)
Infinite Scroll Observer
    ↓ (triggers page increment)
Re-fetch with new page
    ↓ (appends to posts array)
Renders PostCreator + PostItems
```

### Internal State

```tsx
// PostFeed manages these internally:
const [page, setPage] = useState(1);
const [allPosts, setAllPosts] = useState([]);
const [internalHasMore, setInternalHasMore] = useState(true);
const [activeFilters, setActiveFilters] = useState({...});
const [debouncedSearch, setDebouncedSearch] = useState('');
```

### Pagination Reset Logic

**Critical Feature:** When filters or search change, pagination automatically resets to page 1:

```tsx
useEffect(() => {
  if (context) {
    console.log('[Framework] Filters/search changed - resetting pagination');
    setPage(1);
    setAllPosts([]);
    setInternalHasMore(true);
  }
}, [activeFilters.filterType, activeFilters.tags, activeFilters.visibility, 
    activeFilters.startDate, activeFilters.endDate, debouncedSearch]);
```

This prevents bugs where users scroll to page 3, change a filter, and see empty results because the component was still querying page 3 of the new filter.

---

## Cache Invalidation

PostFeed provides a context-aware cache invalidation helper:

```tsx
const invalidateQueriesForContext = () => {
  if (!context) return;

  switch (context.type) {
    case 'feed':
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      break;
    case 'group':
      queryClient.invalidateQueries({ 
        queryKey: ['/api/groups', context.groupId, 'posts'] 
      });
      break;
    case 'profile':
      queryClient.invalidateQueries({ 
        queryKey: ['/api/users', context.userId, 'posts'] 
      });
      break;
    case 'event':
      queryClient.invalidateQueries({ 
        queryKey: ['/api/events', context.eventId, 'posts'] 
      });
      break;
  }
};
```

**When to invalidate:**
- After creating a new post
- After editing a post
- After deleting a post
- After any mutation that affects the feed

All mutations (like, comment, share, delete) automatically call this helper.

---

## Props Interface

```typescript
interface PostFeedProps {
  // CONTEXT MODE (smart fetching)
  context?: FeedContext;
  
  // CONTROLLED MODE (legacy compatibility)
  posts?: any[];
  
  // UI CONTROLS
  showFilters?: boolean;      // Default: true (feed), false (group/profile/event)
  showSearch?: boolean;       // Default: true (feed), false (group/profile/event)
  showPostCreator?: boolean;  // Default: true
  
  // STYLING
  className?: string;
  
  // CALLBACKS
  onPostCreated?: (post: any) => void;
  onPostDeleted?: (postId: number) => void;
  onPostUpdated?: (post: any) => void;
}

type FeedContext = 
  | { type: 'feed' }
  | { type: 'group'; groupId: number; filter?: string }
  | { type: 'profile'; userId: number }
  | { type: 'event'; eventId: number; filter?: 'all' | 'participants' | 'guests' };
```

---

## Migration Guide

### From Legacy Pattern to PostFeed

#### Step 1: Identify Duplicate Code

Look for these patterns in your component:
- `useState` for posts, page, loading, hasMore
- `useEffect` with fetch logic
- `useInfiniteScroll` or manual scroll handlers
- Socket listeners for real-time updates
- Mutation handlers for like/comment/delete

#### Step 2: Remove Duplicate State

```tsx
// DELETE THESE:
const [posts, setPosts] = useState([]);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

const fetchPosts = async () => { /* ... */ };
useEffect(() => { fetchPosts(); }, [page]);
```

#### Step 3: Add Context Prop

```tsx
// REPLACE WITH:
<PostFeed 
  context={{ 
    type: 'group',  // or 'feed', 'profile', 'event'
    groupId: groupData.id  // if type === 'group'
  }}
/>
```

#### Step 4: Remove Mutation Handlers

PostFeed handles these internally:
- `handlePostCreated` - DELETE
- `handlePostUpdated` - DELETE  
- `handlePostDeleted` - DELETE
- `handleLikeToggle` - DELETE
- Socket listeners - DELETE

#### Step 5: Verify Context-Aware Queries

Ensure your backend API returns data in the expected format:

```typescript
{
  posts: Post[],
  hasMore: boolean,
  total?: number
}
```

---

## Real-World Examples

### Example 1: Memories Feed (ESAMemoryFeed.tsx)

```tsx
export default function ESAMemoryFeed() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-turquoise-50 to-white dark:from-cobalt-950 dark:to-black">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-turquoise-500" />
            <h1 className="text-3xl font-bold text-cobalt-900 dark:text-turquoise-100">
              Memories
            </h1>
          </div>
          
          {/* That's it! PostFeed does everything else */}
          <PostFeed 
            context={{ type: 'feed' }}
            showFilters={true}
            showSearch={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
```

**Lines of code:** ~50 (previously ~280)

### Example 2: Group Posts Tab (GroupDetailPageMT.tsx)

```tsx
{activeTab === 'posts' && (
  <div className="space-y-6">
    {/* Simple mention filter toggle */}
    <div className="flex justify-end">
      <Button
        variant={mentionFilter === 'all' ? 'default' : 'outline'}
        onClick={() => setMentionFilter(mentionFilter === 'all' ? 'mentions-only' : 'all')}
      >
        {mentionFilter === 'all' ? 'Show All Posts' : 'Show @Mentions Only'}
      </Button>
    </div>

    {/* PostFeed with group context */}
    <PostFeed
      context={{
        type: 'group',
        groupId: groupData.id,
        filter: mentionFilter
      }}
      showFilters={false}
      showSearch={false}
    />
  </div>
)}
```

**Lines of code for posts tab:** ~20 (previously ~220)

### Example 3: Profile Posts Tab

```tsx
{activeTab === 'posts' && user?.id && (
  <PostFeed
    context={{
      type: 'profile',
      userId: user.id
    }}
    showFilters={false}
    showSearch={false}
    showPostCreator={true}
  />
)}
```

**Note:** Profile feed guards rendering until `user.id` is available to prevent `undefined` in API calls.

### Example 4: Event Detail Posts Tab

```tsx
const [postFilter, setPostFilter] = useState<'all' | 'participants' | 'guests'>('all');

{activeTab === 'posts' && (
  <div className="space-y-4">
    {/* Filter buttons */}
    <div className="flex gap-2">
      <Button 
        variant={postFilter === 'all' ? 'default' : 'outline'}
        onClick={() => setPostFilter('all')}
      >
        All Posts
      </Button>
      <Button 
        variant={postFilter === 'participants' ? 'default' : 'outline'}
        onClick={() => setPostFilter('participants')}
      >
        Participants
      </Button>
      <Button 
        variant={postFilter === 'guests' ? 'default' : 'outline'}
        onClick={() => setPostFilter('guests')}
      >
        Guests
      </Button>
    </div>

    {/* Unified PostFeed with event context */}
    <PostFeed
      context={{
        type: 'event',
        eventId: eventData.id,
        filter: postFilter
      }}
      showFilters={false}
      showSearch={false}
    />
  </div>
)}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('PostFeed', () => {
  it('should fetch posts from correct endpoint based on context', () => {
    // Test feed context
    render(<PostFeed context={{ type: 'feed' }} />);
    expect(mockFetch).toHaveBeenCalledWith('/api/posts/feed?page=1&limit=20');
    
    // Test group context
    render(<PostFeed context={{ type: 'group', groupId: 7 }} />);
    expect(mockFetch).toHaveBeenCalledWith('/api/groups/7/posts?page=1&limit=20');
  });

  it('should reset pagination when filters change', () => {
    const { rerender } = render(
      <PostFeed context={{ type: 'group', groupId: 7, filter: 'all' }} />
    );
    
    // Simulate scroll to page 3
    scrollToBottom();
    expect(currentPage).toBe(3);
    
    // Change filter
    rerender(
      <PostFeed context={{ type: 'group', groupId: 7, filter: 'residents' }} />
    );
    
    // Should reset to page 1
    expect(currentPage).toBe(1);
  });
});
```

### Integration Tests

Use Playwright to test end-to-end:

```typescript
test('should load more posts on scroll in group feed', async ({ page }) => {
  await page.goto('/groups/buenos-aires');
  await page.click('[data-testid="tab-posts"]');
  
  // Wait for initial posts
  await page.waitForSelector('[data-testid^="card-post-"]');
  const initialPosts = await page.locator('[data-testid^="card-post-"]').count();
  
  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Wait for more posts to load
  await page.waitForTimeout(1000);
  const afterScrollPosts = await page.locator('[data-testid^="card-post-"]').count();
  
  expect(afterScrollPosts).toBeGreaterThan(initialPosts);
});
```

---

## Performance Considerations

### Infinite Scroll Optimization

PostFeed uses IntersectionObserver for efficient scroll detection:

```tsx
const observerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && internalHasMore && !isLoadingMore) {
        setPage(prev => prev + 1);
      }
    },
    { threshold: 0.1 }
  );

  if (observerRef.current) observer.observe(observerRef.current);
  return () => observer.disconnect();
}, [internalHasMore, isLoadingMore]);
```

### Query Caching

React Query automatically caches feed data:
- **Stale Time:** 30 seconds
- **Cache Time:** 5 minutes
- **Refetch on Focus:** Enabled

### Bundle Size

PostFeed is code-split with React.lazy():

```tsx
const PostFeed = React.lazy(() => 
  import('@/components/moments/PostFeed')
);
```

---

## Troubleshooting

### Issue: Posts not loading

**Check:**
1. Is context prop passed correctly?
2. Does API endpoint return `{ posts: [], hasMore: boolean }`?
3. Are query keys unique per context?

### Issue: Pagination reset not working

**Check:**
1. Are filters stored in local state?
2. Is useEffect dependency array correct?
3. Does filter change trigger re-render?

### Issue: Cache not invalidating after mutation

**Check:**
1. Is `invalidateQueriesForContext()` called after mutation?
2. Do query keys match between fetch and invalidate?
3. Is queryClient imported correctly?

---

## Future Enhancements

- [ ] Add virtualization for feeds with 1000+ posts
- [ ] Implement optimistic updates for mutations
- [ ] Add skeleton loading states
- [ ] Support custom post renderers per context
- [ ] Add feed analytics tracking
- [ ] Implement feed preferences per user
- [ ] Add export feed data functionality

---

## Related Documentation

- [Feed Architecture Overview](../social/feed-architecture.md)
- [Unified Groups Architecture](../social/UNIFIED-GROUPS-ARCHITECTURE.md)
- [Group Detail Page](../social/GroupDetailPageMT.md)
- [Memories Feed Testing](../../testing/memories-feed-component-testing.md)

---

## Summary

PostFeed represents a major architectural improvement that:
- ✅ Eliminates ~450 lines of duplicate code across ALL 6 platform feeds
- ✅ Provides consistent UX across all feeds (Memories, Groups, Events, Profiles, Home, Public Profiles)
- ✅ Simplifies parent components to thin wrappers
- ✅ Centralizes pagination, caching, and mutation logic
- ✅ Makes adding new feed types trivial (20-30 lines of code)
- ✅ Supports advanced filtering (event participant/guest filters, group member filters)

**Unified Feeds:**
1. ✅ Memories Feed (ESAMemoryFeed)
2. ✅ Groups Posts Tab (GroupDetailPageMT)
3. ✅ Profile Posts Tab (profile.tsx) - with auth guard
4. ✅ Event Detail Posts Tab (event-detail.tsx) - with filter support
5. ✅ Public Profile Feed (PublicProfilePage)
6. ✅ Home Feed (home.tsx)

**Pattern:** `<PostFeed context={{type, ...params}} />`

**Status:** ✅ 100% Production Ready - Full Platform Unification Completed October 3, 2025
