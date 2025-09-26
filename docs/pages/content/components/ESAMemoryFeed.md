# ESAMemoryFeed Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: `/` (Main memories page, root route)
- **Purpose**: Central hub for content creation, discovery, and interaction across user memories. Serves as the platform's primary social feed implementing the ESA LIFE CEO 61×21 AGENTS Framework specifications.
- **ESA Framework Layer**: 
  - Layer 9 (Content Management System)
  - Layer 11 (Real-time Features & WebSocket)
  - Layer 13 (Media Management)
  - Layer 28 (Performance Optimization)

## 2. Technical Implementation

### Components
```typescript
// Core Components
import DashboardLayout from '@/layouts/DashboardLayout';
import BeautifulPostCreator from '@/components/universal/BeautifulPostCreator';
import EnhancedPostFeed from '@/components/moments/EnhancedPostFeed';
import UpcomingEventsSidebar from '@/components/esa/UpcomingEventsSidebar';
import FloatingCreateButton from '@/components/esa/FloatingCreateButton';
import ShareModal from '@/components/modern/ShareModal';
```

### APIs
- `GET /api/posts/feed` - Fetch paginated posts with filters
- `POST /api/posts` - Create new memory post
- `PUT /api/posts/:id` - Update existing post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Toggle like/reaction
- `POST /api/posts/:id/comment` - Add comment
- `POST /api/posts/:id/share` - Share post

### Real-time Features
```javascript
// WebSocket Events
socket.emit('join-feed', { room: 'global-memories' });
socket.on('new-post', handleNewPost);
socket.on('post-liked', handlePostLiked);
socket.on('post-commented', handlePostCommented);
socket.on('post-deleted', handlePostDeleted);
socket.on('user-typing', handleUserTyping);
```

## 3. Database Schema

### Tables
- **posts**: Main posts table with content, media, location
- **users**: User information and roles
- **likes**: Post reactions and likes
- **comments**: Post comments with threading
- **shares**: Post sharing records
- **post_reports**: Content moderation reports

### Relationships
```sql
posts.userId → users.id (Many-to-One)
likes.postId → posts.id (Many-to-One)
likes.userId → users.id (Many-to-One)
comments.postId → posts.id (Many-to-One)
comments.userId → users.id (Many-to-One)
shares.postId → posts.id (Many-to-One)
```

## 4. User Permissions
- **Access Control**: Authentication required via JWT
- **Roles**:
  - **Guest**: Can view public posts only
  - **Member**: Can create, like, comment, share posts
  - **Moderator**: Can report and flag content
  - **Admin**: Can delete any post, manage reports
- **Visibility Settings**: Public, Friends-only, Private

## 5. MT Ocean Theme
- **Design Implementation**:
  - Gradient background: `#5EEAD4 → #155E75` (turquoise to cyan)
  - Glassmorphic cards with backdrop blur
  - Floating orbs for depth perception
  - Animated sparkles and hearts for engagement
- **Animations**:
  - Spring-based reaction animations
  - Magnetic hover effects on buttons
  - Smooth scroll with virtual scrolling
  - Particle effects on interactions

## 6. Test Coverage
- **Current Status**: 15% covered (needs improvement)
- **Requirements**:
  - Unit tests for state management
  - Integration tests for API calls
  - E2E tests for post creation flow
  - WebSocket event testing
  - Performance tests for 1000+ posts

## 7. Known Issues

### Critical Fix Applied
```typescript
// Fixed TypeError: url.toLowerCase is not a function
// Applied to all media processing
if (typeof url === 'string' && url.toLowerCase) {
  // Safe to process URL
}
```

### Current Issues
- **Feed refresh lag**: Optimistic updates partially implemented
- **Duplicate posts**: Deduplication logic needed
- **Memory leaks**: WebSocket listeners need cleanup
- **Safari compatibility**: Backdrop-filter fallback implemented

## 8. Agent Responsibilities
- **Content Creation Agent (Layer 9)**: Manages BeautifulPostCreator
- **Real-time Agent (Layer 11)**: Handles WebSocket connections
- **Media Agent (Layer 13)**: Processes uploads and compressions
- **Performance Agent (Layer 28)**: Optimizes virtual scrolling
- **Moderation Agent (Layer 11)**: Reviews reported content
- **Analytics Agent (Layer 30)**: Tracks engagement metrics

## 9. Integration Points
- **External Services**:
  - Socket.io for real-time updates
  - Cloudinary for media storage
  - Google Maps API for location tagging
  - React Query for state management
  - Intersection Observer for infinite scroll
- **Internal Systems**:
  - Authentication via useAuth hook
  - Theme system via useTheme context
  - Toast notifications via useToast

## 10. Performance Metrics
- **Load Times**:
  - Initial page load: <2s target
  - Post creation: <3s including media
  - Feed refresh: <100ms
- **Optimization**:
  - Lazy loading with React.lazy()
  - Virtual scrolling for 1000+ posts
  - Debounced API calls (300ms)
  - Memoized filter objects
  - Image compression client-side
  - WebP format with fallbacks
  - Service Worker caching (planned)

## Code Example - Critical Data Extraction Fix
```typescript
// Before (broken):
const { data: posts = [] } = useQuery({
  queryKey: ['/api/posts/feed', filters],
  enabled: !!currentUserId
});

// After (fixed):
const { data: response } = useQuery({
  queryKey: ['/api/posts/feed', filters],
  enabled: !!currentUserId
});
const posts = response?.posts || []; // Extract posts array from response
```

## Implementation Notes
1. **State Management**: Uses React Query for server state, useState for UI state
2. **Infinite Scroll**: Intersection Observer with loadMoreRef
3. **Real-time Updates**: Socket.io with room-based subscriptions
4. **Error Boundaries**: Wrapped in Suspense with fallback UI
5. **Accessibility**: ARIA labels, semantic HTML, keyboard navigation