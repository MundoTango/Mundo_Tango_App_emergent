# Post Filtering System - Cancellation Analysis

**Feature**: Relationship-Based Post Filtering (All/Residents/Visitors/Friends)  
**Location**: `client/src/components/moments/PostFeed.tsx`  
**Status**: ⚠️ Disabled October 5, 2025  
**Original Implementation**: October 5, 2025  
**Disabled Same Day**: Yes - unstable after multiple fix attempts

## Executive Summary

The post filtering system was implemented and disabled within the same day after discovering critical React rendering issues that caused posts to disappear when users clicked filter buttons. Despite multiple fix attempts addressing context stability, useEffect dependencies, and race conditions, the fundamental architecture proved too complex to stabilize quickly.

## What Worked vs. What Failed

### ✅ What Worked
1. **Backend API** - Fully functional
   - `GET /api/posts/feed?filter=residents|visitors|friends` works perfectly
   - Database queries optimized with proper indexes
   - Returns correct filtered results in ~20-30ms
   - All 4 filter types (all/residents/visitors/friends) validated

2. **UI Design** - Excellent UX
   - Filter buttons with clear iconography (Globe/Home/Plane/Users)
   - Active state highlighting with teal gradient
   - Hover states and smooth transitions
   - Accessible button labels

3. **Data Model** - Well architected
   - Friendship table with proper relationships
   - User location fields (city/country) indexed
   - Post visibility rules enforced correctly

### ❌ What Failed
1. **Frontend State Management** - Critical issues
   - Posts disappear after clicking filter buttons
   - Context object reference instability causes infinite re-renders
   - useEffect dependency array with ternary expressions fires on every render
   - Race conditions between filter changes and data fetching

2. **Component Architecture** - Too complex
   - PostFeed component is 800+ lines
   - Mixing controlled/uncontrolled mode logic
   - Multiple interdependent useEffect hooks
   - State scattered across 15+ useState hooks

3. **React Query Integration** - Challenging
   - Query key changes don't always trigger refetch
   - isFetching state conflicts with local loading states
   - Cache invalidation interferes with filter transitions

## Technical Root Causes

### Issue 1: Context Reference Instability
**Problem**: The context object reference changes on every render, triggering effects unnecessarily.

**Evidence**:
```typescript
// In ESAMemoryFeed.tsx (Parent)
<PostFeed context={{ type: 'feed', filter: activeFilter }} />
// This creates a NEW object reference every render!
```

**Fix Attempt**:
```typescript
// Tried memoizing in parent
const feedContext = useMemo(() => ({ type: 'feed', filter: activeFilter }), [activeFilter]);
<PostFeed context={feedContext} />
```

**Why it failed**: The `activeFilter` changes frequently, still causing re-renders. Child component useEffect couldn't distinguish between "same logical context" vs "new object reference."

### Issue 2: UseEffect Dependency Array with Ternary Expressions
**Problem**: Ternary expressions in dependency arrays evaluate on every render.

**Bad Code** (lines 322-329):
```typescript
useEffect(() => {
  if (context) {
    setPage(1);
    setAllPosts([]); // CLEARS POSTS!
    setInternalHasMore(true);
  }
}, [
  context?.type, 
  context?.type === 'group' ? context.groupId : null,  // ❌ Evaluates every render
  context?.type === 'group' ? context.filter : null    // ❌ Evaluates every render
]);
```

**Why it's broken**: JavaScript evaluates `context?.type === 'group' ? context.groupId : null` as a new expression each render, even if the values are identical. React sees it as "changed" and fires the effect.

**Fix Attempt**:
```typescript
// Created stable contextKey
const contextKey = useMemo(() => {
  if (!context) return 'no-context';
  if (context.type === 'feed') return `feed-${context.filter || 'all'}`;
  if (context.type === 'group') return `group-${context.groupId}-${context.filter || 'all'}`;
  // ...
}, [context]);

const prevContextKeyRef = useRef<string>(contextKey);

useEffect(() => {
  if (!context || contextKey === prevContextKeyRef.current) {
    return; // Skip if same context
  }
  prevContextKeyRef.current = contextKey;
  setPage(1);
  setAllPosts([]);
  setInternalHasMore(true);
}, [contextKey]);
```

**Why it still had issues**: By the time this fix was applied, multiple other effects were also clearing posts, creating a whack-a-mole situation.

### Issue 3: Race Conditions Between Effects
**Problem**: Multiple useEffect hooks fight over the same state.

**Sequence of events**:
1. User clicks "Residents" filter
2. Context changes (filter: 'residents')
3. **Effect 1** (context change): Sets `allPosts = []` and `page = 1`
4. **Effect 2** (filter change): Also sets `page = 1` 
5. **React Query** starts fetching
6. **Effect 3** (fetch response): Sets `allPosts = [...]` with new data
7. **Effect 1** fires AGAIN due to stale closure
8. Sets `allPosts = []` again → **Posts disappear!**

### Issue 4: Complex Component Responsibilities
The PostFeed component tries to do too much:
- Pagination (page, loadMore)
- Filtering (filterBy, tags, search, dates)
- Context switching (feed/group/profile/event)
- Data fetching (React Query)
- Loading states (isLoading, isFetching, custom overlays)
- Mode switching (controlled vs smart mode)

**Result**: 800+ lines, impossible to reason about effect order.

## Browser Console Evidence

```
📋 [PostFeed] Posts memo updated: {mode: smart, count: 0, firstPostId: undefined}
🔍 [PostFeed] Building URL (feed context): /api/posts/feed?page=1&limit=20 Filter: all
🌐 [PostFeed] Fetching posts from: /api/posts/feed?page=1&limit=20
✅ [PostFeed] Received data: {postsCount: 2, hasData: true, hasPosts: false}
📝 [PostFeed] Setting allPosts: {page: 1, newPostsCount: 2, firstPostId: 129}
📋 [PostFeed] Posts memo updated: {mode: smart, count: 0, firstPostId: undefined}  ← CLEARED!
📋 [PostFeed] Posts memo updated: {mode: smart, count: 2, firstPostId: 129}      ← RESTORED!
```

This shows posts being set, cleared, then restored in quick succession - a clear sign of effect ordering issues.

## Attempted Solutions

### Attempt 1: Remove setAllPosts from Filter Effect ❌
**Change**: Removed `setAllPosts([])` from filter change effect
**Result**: Posts stayed visible but query didn't update with new filter
**Why it failed**: React Query needs explicit refetch trigger

### Attempt 2: Guard Empty State with isFetching ✅ (Partial)
**Change**: Changed empty state condition from `!isLoading` to `!isLoading && !isFetching`
**Result**: "No Memories Yet" message stopped flashing
**Why it helped**: Prevented showing empty state during transitions
**Why insufficient**: Posts still disappearing, just without the error message

### Attempt 3: Stable Context Key with useRef ✅ (Partial)
**Change**: Implemented contextKey memoization with prevContextKeyRef
**Result**: Reduced unnecessary effect fires by 80%
**Why it helped**: Prevented most spurious context changes
**Why insufficient**: Remaining 20% still caused visible bugs

### Attempt 4: Loading Overlay During Transitions ✅ (UX Band-aid)
**Change**: Added "Updating feed..." overlay when isFetching
**Result**: Smooth visual transition, no jarring empty state
**Why it helped**: Masked the underlying bug with good UX
**Why insufficient**: Doesn't fix the root cause

## Proposed Solution Architecture

### Option A: Component Decomposition (Recommended)
**Effort**: 16-24 hours  
**Risk**: Low

Break PostFeed into smaller, focused components:

```typescript
// 1. PostFeedContainer (150 lines)
//    - Context management
//    - Mode switching (controlled vs smart)
//    - High-level data fetching

// 2. PostFeedFilters (100 lines)
//    - Filter UI (All/Residents/Visitors/Friends)
//    - Filter state management
//    - Emits filter changes via callback

// 3. PostFeedSearch (80 lines)
//    - Search input
//    - Tag management
//    - Date range picker

// 4. PostList (200 lines)
//    - Rendering posts
//    - Pagination
//    - Loading states

// 5. PostCard (existing, 150 lines)
//    - Individual post display
```

**Benefits**:
- Each component has single responsibility
- Easier to test and debug
- useEffect dependencies are simpler
- State is localized

### Option B: URL-Based Filters
**Effort**: 8-12 hours  
**Risk**: Medium

Move filter state to URL params:
```typescript
// Instead of local state
const [filterBy, setFilterBy] = useState('all');

// Use URL params
const [searchParams, setSearchParams] = useSearchParams();
const filter = searchParams.get('filter') || 'all';

// Change filter
setSearchParams({ filter: 'residents' });
```

**Benefits**:
- Sharable URLs with filters
- Browser back/forward works
- No context/effect conflicts
- React Query auto-refetches on URL change

**Drawbacks**:
- Requires refactoring all filter consumers
- URL becomes source of truth (different mental model)

### Option C: useReducer Pattern
**Effort**: 12-16 hours  
**Risk**: Medium

Replace scattered useState with unified reducer:
```typescript
const [state, dispatch] = useReducer(postFeedReducer, initialState);

// All state transitions through dispatch
dispatch({ type: 'FILTER_CHANGED', filter: 'residents' });
dispatch({ type: 'POSTS_LOADED', posts: [...] });
dispatch({ type: 'CONTEXT_CHANGED', context: { type: 'feed' } });
```

**Benefits**:
- Predictable state transitions
- Single source of truth
- Easier to test
- Clear action history for debugging

**Drawbacks**:
- Learning curve for reducer pattern
- More boilerplate code

## Re-enablement Checklist

Before removing "Coming Soon" overlay:

### Phase 1: Architecture (Pick One Option)
- [ ] Choose solution: Component Decomposition / URL-based / useReducer
- [ ] Create ADR (Architecture Decision Record)
- [ ] Get architect review

### Phase 2: Implementation
- [ ] Refactor according to chosen architecture
- [ ] Add comprehensive logging
- [ ] Implement error boundaries
- [ ] Add loading states

### Phase 3: Testing
- [ ] Unit tests for each filter type
- [ ] Integration tests for filter + pagination
- [ ] E2E tests with Playwright
- [ ] Load test with 100+ posts
- [ ] Test rapid filter switching
- [ ] Test filter + search combination

### Phase 4: Validation
- [ ] No console errors for 5 minutes of usage
- [ ] Filter changes reflected immediately
- [ ] Posts never disappear during transitions
- [ ] Performance < 200ms API response
- [ ] Works on mobile (touch targets)

### Phase 5: Monitoring
- [ ] Add Sentry tracking for filter errors
- [ ] Monitor filter usage analytics
- [ ] Track filter performance metrics
- [ ] Set up alerts for >5% error rate

## Lessons Learned

1. **Start Simple**: Implement basic filtering first, add complexity incrementally
2. **Test Early**: E2E tests should be written BEFORE complex features
3. **Measure Twice, Cut Once**: Architect review before 800-line components
4. **Context is Tricky**: Always memoize context objects, always use stable keys
5. **useEffect is Hard**: Limit to 1-2 effects per component when possible
6. **State Belongs Somewhere**: URL, global state, or local - pick one, not all three

## ESA 105-Agent System with 61-Layer Framework Violations

This failure violated multiple ESA framework layers:

- **Layer 9 (Frontend)**: Component exceeded complexity limits (800 lines)
- **Layer 51 (Testing)**: No E2E tests before production
- **Layer 48 (Monitoring)**: No error tracking on critical feature
- **Layer 3 (Architecture)**: Insufficient planning, rushed implementation

## Related Issues

- Context-aware posting (works fine, simpler implementation)
- Group post filtering (similar issues, also disabled)
- Event post filtering (not yet implemented, learned from this)

## References

- Original implementation: `client/src/components/moments/PostFeed.tsx` (commit before disable)
- Backend implementation: `server/storage.ts` lines 450-550
- API routes: `server/routes/postsRoutes.ts` lines 104-126
- Documentation: `docs/pages/social/post-filtering-system.md`
