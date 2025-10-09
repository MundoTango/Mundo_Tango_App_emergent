# PostFeed V2 Usage Guide

## 🎯 Overview
PostFeed V2 is a simplified, data-layer-based feed component that reduces complexity by 56% while maintaining full functionality.

## 📊 Improvement Metrics
- **Lines of Code**: 882 → 390 (56% reduction)
- **React Hooks**: 39 → 22 (44% reduction)
- **Data Transformation**: 5 layers → 1 layer (80% reduction)
- **Architecture**: Centralized data hooks vs scattered React Query logic

## 🚀 Quick Start

### Basic Usage
```tsx
import PostFeedV2 from '@/components/moments/PostFeedV2';

function MyPage() {
  return (
    <PostFeedV2 
      context="feed"  // 'feed' | 'group' | 'profile' | 'event'
    />
  );
}
```

### With Edit Handler
```tsx
import PostFeedV2 from '@/components/moments/PostFeedV2';
import { useState } from 'react';
import PostComposer from '@/components/moments/PostComposer';

function MyPage() {
  const [editingPost, setEditingPost] = useState(null);

  return (
    <>
      <PostFeedV2 
        context="feed"
        onEdit={setEditingPost}
      />
      
      {editingPost && (
        <PostComposer 
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}
    </>
  );
}
```

### Group-Specific Feed
```tsx
import PostFeedV2 from '@/components/moments/PostFeedV2';

function GroupPage({ groupId }: { groupId: number }) {
  return (
    <PostFeedV2 
      context="group"
      groupId={groupId}
    />
  );
}
```

### Event Feed
```tsx
import PostFeedV2 from '@/components/moments/PostFeedV2';

function EventPage({ eventId }: { eventId: number }) {
  return (
    <PostFeedV2 
      context="event"
      eventId={eventId}
    />
  );
}
```

## 🔌 Data Layer Hooks (Advanced)

### Using Data Hooks Directly
If you need custom UI logic, use the underlying data hooks:

```tsx
import { usePostFeed, usePostMutations } from '@/data/posts';

function CustomFeed() {
  // Fetch posts
  const { posts, hasMore, isLoading } = usePostFeed({
    context: 'feed',
    page: 1,
    limit: 20,
  });

  // Mutations
  const { likePost, addComment, deletePost } = usePostMutations('feed');

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.content}</h3>
          <button onClick={() => likePost(post.id)}>
            Like ({post.likes?.length ?? 0})
          </button>
        </div>
      ))}
    </div>
  );
}
```

### With Filters
```tsx
const { posts, hasMore, isLoading } = usePostFeed({
  context: 'feed',
  page: 1,
  limit: 20,
  filters: {
    filterType: 'recent',
    tags: ['tango', 'milonga'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
});
```

### With Search
```tsx
import { useDebounce } from '@/hooks/useDebounce';

function SearchableFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { posts } = usePostFeed({
    context: 'feed',
    page: 1,
    limit: 20,
    searchQuery: debouncedSearch,
  });

  return (
    <>
      <input 
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search posts..."
      />
      {/* Render posts */}
    </>
  );
}
```

## 🔑 Key Benefits

### 1. Centralized Data Logic
- All fetching logic in `client/src/data/posts.ts`
- Consistent query key patterns
- Single source of truth

### 2. Optimistic Updates
- Like actions update UI immediately
- Delete actions remove posts before server confirmation
- Automatic rollback on error

### 3. Cache Invalidation
- Proper cache key hierarchy: `['/api/posts', context, contextId]`
- Mutations automatically invalidate relevant caches
- No manual refetch needed

### 4. Type Safety
- Full TypeScript coverage
- Unified Post interface
- Context-aware types

## 🔄 Migration Path

### Option 1: Gradual (Recommended)
1. Import PostFeedV2 alongside existing PostFeed
2. Test on non-critical pages first
3. Monitor for issues
4. Migrate page by page

### Option 2: Feature Flag
```tsx
const USE_V2 = import.meta.env.VITE_USE_POSTFEED_V2 === 'true';

function MyPage() {
  return USE_V2 ? (
    <PostFeedV2 context="feed" />
  ) : (
    <PostFeed feedContext="feed" />
  );
}
```

## 🐛 Troubleshooting

### Posts not loading
1. Check network tab for API errors
2. Verify `context` prop is correct
3. For group/profile/event contexts, ensure contextId is provided

### Stale data after mutation
1. Verify mutation is using `usePostMutations` hook
2. Check that cache keys match between query and mutation
3. Look for console errors about cache invalidation

### TypeScript errors
1. Ensure Post type is imported from `@shared/schema`
2. Verify FeedContext type matches: 'feed' | 'group' | 'profile' | 'event'
3. Check that all required props are passed

## 📚 Related Documentation
- [Brittleness Refactoring Guide](./brittleness-refactoring.md)
- [Data Layer Architecture](./data-layer-architecture.md)
- [Cache Strategy](./cache-strategy.md)

## 🎯 Next Steps
After PostFeed V2 migration is complete:
- **Phase 3**: Split into ControlledPostFeed (props-based) and SmartPostFeed (context-based)
- **Phase 4**: Re-enable React.StrictMode
- **Phase 5**: Performance optimization with React Compiler
