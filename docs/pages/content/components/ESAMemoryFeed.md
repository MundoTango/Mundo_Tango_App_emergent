# ESAMemoryFeed Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: `/memories` (Main memories page)
- **Purpose**: Central hub for content creation, discovery, and interaction across user memories. Serves as the platform's primary social feed implementing the ESA LIFE CEO 61×21 AGENTS Framework specifications.
- **ESA Framework Layer**: 
  - Layer 9 (Content Management System)
  - Layer 11 (Real-time Features & WebSocket)
  - Layer 13 (Media Management)
  - Layer 28 (Performance Optimization)

## ⚠️ CRITICAL CHANGE: Layer 53 (Internationalization) REMOVED

**Status**: As of October 2025, Layer 53 internationalization has been **completely removed** from this component.

**What Changed:**
- All `useTranslation()` hooks removed
- All `t()` translation calls replaced with hardcoded English strings
- Component now operates in **English-only mode**
- `useTheme` import changed from old `@/contexts/theme-context` to new `@/lib/theme/theme-provider`
- `useAuth` import changed from `@/hooks/useAuth` to `@/contexts/auth-context`

**Affected Dependencies:**
- ❌ `react-i18next` - No longer used
- ✅ `@/lib/theme/theme-provider` - Now using shadcn theme provider
- ✅ `@/contexts/auth-context` - Unified auth context

**Why This Change:**
Layer 53 had critical failures (language switching broken, components not re-rendering, translation keys not loading). Rather than block functionality, we removed i18n dependencies and switched to English-only operation until Layer 53 can be properly re-implemented.

## 2. Technical Implementation

### Provider Requirements
**CRITICAL:** ESAMemoryFeed requires these providers in App.tsx:
```typescript
<QueryClientProvider>
  <ThemeProvider>        {/* Required for useTheme hook */}
    <AuthProvider>       {/* Required for useAuth hook */}
      <CsrfProvider>
        <TenantProvider>
          <Router />
        </TenantProvider>
      </CsrfProvider>
    </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### Components
```typescript
// Core Components
import DashboardLayout from '@/layouts/DashboardLayout';
import PostCreator from '@/components/universal/PostCreator';
import UnifiedPostFeed from '@/components/moments/UnifiedPostFeed';
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

## 6. Layout Structure

### Responsive Grid
```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Posts Feed - 2/3 width on large screens */}
  <div className="lg:col-span-2">
    <PostCreator />
    <UnifiedPostFeed />
  </div>
  
  {/* Events Sidebar - 1/3 width on large screens */}
  <div className="lg:col-span-1">
    <UpcomingEventsSidebar />
  </div>
</div>
```

**Breakpoint Behavior:**
- **Mobile/Tablet** (< lg): Single column, stacks vertically
- **Desktop** (≥ lg): 3-column grid with 2:1 ratio

## 7. Test Coverage
- **Current Status**: 15% covered (needs improvement)
- **Requirements**:
  - Unit tests for state management
  - Integration tests for API calls
  - E2E tests for post creation flow
  - WebSocket event testing
  - Performance tests for 1000+ posts

## 8. Known Issues

### Recent Fixes (October 2025)
✅ **Fixed: Missing ThemeProvider** - Added to App.tsx provider tree
✅ **Fixed: useAuth import mismatch** - Now imports from `@/contexts/auth-context`
✅ **Fixed: Layer 53 crashes** - Completely removed, using English-only strings
✅ **Fixed: Page routing** - `/memories` now correctly loads ESAMemoryFeed instead of ModernMemoriesPage

### Current Issues
- **Feed refresh lag**: Optimistic updates partially implemented
- **Duplicate posts**: Deduplication logic needed
- **Memory leaks**: WebSocket listeners need cleanup
- **Safari compatibility**: Backdrop-filter fallback implemented

## 9. Agent Responsibilities
- **Content Creation Agent (Layer 9)**: Manages PostCreator
- **Real-time Agent (Layer 11)**: Handles WebSocket connections
- **Media Agent (Layer 13)**: Processes uploads and compressions
- **Performance Agent (Layer 28)**: Optimizes virtual scrolling
- **Moderation Agent (Layer 11)**: Reviews reported content
- **Analytics Agent (Layer 30)**: Tracks engagement metrics

## 10. Integration Points
- **External Services**:
  - Socket.io for real-time updates
  - Cloudinary for media storage
  - Google Maps API for location tagging
  - React Query for state management
  - Intersection Observer for infinite scroll
- **Internal Systems**:
  - Authentication via useAuth hook (`@/contexts/auth-context`)
  - Theme system via useTheme hook (`@/lib/theme/theme-provider`)
  - Toast notifications via useToast

## 11. Performance Metrics
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

## Code Example - English-Only Implementation
```typescript
// Translation calls REMOVED - now using English strings directly
toast({
  title: "✨ Memory Created!",
  description: "Your memory with media has been shared"
});

// Was previously:
// title: t('memories.toasts.postCreatedEmoji'),
// description: t('memories.toasts.memoryWithMedia')
```

## Implementation Notes
1. **State Management**: Uses React Query for server state, useState for UI state
2. **Infinite Scroll**: Intersection Observer with loadMoreRef
3. **Real-time Updates**: Socket.io with room-based subscriptions
4. **Error Boundaries**: Wrapped in ResilientBoundary with fallback UI
5. **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
6. **English-Only**: All user-facing text is hardcoded in English (Layer 53 removed)
