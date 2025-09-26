# EnhancedPostFeed Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: Feed container component (not a direct route)
- **Purpose**: High-performance feed container with virtual scrolling, real-time updates, and batch loading for displaying large numbers of posts efficiently
- **ESA Framework Layer**: 
  - Layer 28 (Performance Optimization)
  - Layer 11 (Real-time Updates)
  - Layer 9 (Content Management)

## 2. Technical Implementation

### Components
```typescript
// Child components
import EnhancedPostItem from './EnhancedPostItem';
import CleanMemoryCard from './CleanMemoryCard';
import VideoMemoryCard from './VideoMemoryCard';
import MemoryCardFixed from './MemoryCardFixed';
import { VariableSizeList } from 'react-window'; // Virtual scrolling
```

### APIs
- `GET /api/posts/feed` - Paginated feed endpoint
- Query parameters: `page`, `limit`, `filterType`, `tags[]`, `visibility`
- Response: `{ posts: [], hasMore: boolean, total: number }`

### Real-time Features
```javascript
// Real-time post updates
useEffect(() => {
  socket.on('new-post', (post) => {
    setPosts(prev => [post, ...prev]);
  });
  socket.on('post-updated', (updatedPost) => {
    setPosts(prev => prev.map(p => 
      p.id === updatedPost.id ? updatedPost : p
    ));
  });
}, [socket]);
```

## 3. Database Schema

### Tables
- **posts**: Main feed content source
- **users**: User information for post authors
- **likes**: Aggregated like counts
- **comments**: Aggregated comment counts
- **shares**: Aggregated share counts

### Relationships
```sql
-- Optimized query for feed
SELECT 
  p.*,
  u.name, u.avatar, u.role,
  COUNT(DISTINCT l.id) as likesCount,
  COUNT(DISTINCT c.id) as commentsCount,
  COUNT(DISTINCT s.id) as sharesCount
FROM posts p
LEFT JOIN users u ON p.userId = u.id
LEFT JOIN likes l ON p.id = l.postId
LEFT JOIN comments c ON p.id = c.postId
LEFT JOIN shares s ON p.id = s.postId
GROUP BY p.id
ORDER BY p.createdAt DESC
LIMIT :limit OFFSET :offset;
```

## 4. User Permissions
- **Access Control**: Respects post visibility settings
- **Roles**:
  - Public posts: Visible to all
  - Friends posts: Visible to friends only
  - Private posts: Visible to owner only
- **Feed Filtering**: Server-side filtering based on user relationships

## 5. MT Ocean Theme
- **Design Implementation**:
  - Smooth scroll with custom scrollbar
  - Gradient fade at top/bottom of feed
  - Card spacing with gap-4
  - Loading skeletons with shimmer effect
- **Animations**:
  - Staggered card entrance animation
  - Smooth virtual scroll
  - Pull-to-refresh animation (mobile)
  - Infinite scroll spinner

## 6. Test Coverage
- **Current Status**: Basic tests only
- **Requirements**:
  - Performance tests with 1000+ posts
  - Virtual scroll measurement tests
  - Memory leak detection tests
  - Real-time update tests
  - Batch loading tests

## 7. Known Issues

### Data Extraction Fix Applied
```typescript
// Fixed: API response structure handling
const { data: response } = useQuery({
  queryKey: ['/api/posts/feed', filters, page],
});
// Extract posts array from response object
const posts = response?.posts || [];
const hasMore = response?.hasMore ?? true;
```

### Current Issues
- **Memory consumption**: Large feeds can consume significant memory
- **Virtual scroll jumping**: Height calculation issues with dynamic content
- **Duplicate posts**: Can occur during real-time updates
- **Scroll position loss**: On feed refresh

## 8. Agent Responsibilities
- **Performance Agent (Layer 28)**: Optimizes rendering and memory usage
- **Real-time Agent (Layer 11)**: Manages WebSocket updates
- **Content Agent (Layer 9)**: Handles feed composition
- **Caching Agent (Layer 28)**: Manages React Query cache
- **Analytics Agent (Layer 30)**: Tracks scroll depth and engagement

## 9. Integration Points
- **External Services**:
  - React Window for virtualization
  - React Query for data fetching
  - Intersection Observer for infinite scroll
  - Socket.io for real-time updates
- **Internal Systems**:
  - Post item components
  - Filter system
  - Authentication context
  - Theme system

## 10. Performance Metrics
- **Load Times**:
  - Initial render: <100ms for 50 posts
  - Scroll FPS: 60 FPS with 1000+ posts
  - Memory usage: <50MB for 500 posts
  - Update latency: <50ms for real-time updates
- **Optimization**:
  - Virtual scrolling with react-window
  - Dynamic row height calculation
  - Overscan of 5 items for smooth scrolling
  - Batch updates every 100ms
  - Image lazy loading
  - Component memoization
  - Request deduplication

## Code Example - Virtual Scrolling Implementation
```typescript
const EnhancedPostFeed = ({ posts, onLoadMore }) => {
  const listRef = useRef<VariableSizeList>(null);
  const [heights, setHeights] = useState<Record<number, number>>({});
  
  // Dynamic height calculation
  const getItemSize = (index: number) => {
    return heights[index] || 400; // Default height
  };
  
  // Row renderer with memoization
  const Row = memo(({ index, style }) => {
    const post = posts[index];
    const rowRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        if (heights[index] !== height) {
          setHeights(prev => ({ ...prev, [index]: height }));
          listRef.current?.resetAfterIndex(index);
        }
      }
    }, [post]);
    
    return (
      <div ref={rowRef} style={style}>
        <EnhancedPostItem post={post} />
      </div>
    );
  });
  
  return (
    <VariableSizeList
      ref={listRef}
      height={window.innerHeight}
      itemCount={posts.length}
      itemSize={getItemSize}
      width="100%"
      overscanCount={5}
    >
      {Row}
    </VariableSizeList>
  );
};
```

## Implementation Notes
1. **Virtual Scrolling**: Uses react-window for handling 1000+ posts
2. **Dynamic Heights**: Calculates and caches post heights
3. **Batch Loading**: Loads 20 posts at a time
4. **Real-time Updates**: Integrates seamlessly with WebSocket events
5. **Error Boundaries**: Wrapped to catch render errors
6. **Accessibility**: Maintains focus and scroll position