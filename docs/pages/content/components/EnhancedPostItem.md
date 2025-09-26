# EnhancedPostItem Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: Component used within feed displays (not a route itself)
- **Purpose**: Rich post display component with full social interactions including role emojis, Facebook-style reactions, rich text commenting, sharing, reporting, and post management
- **ESA Framework Layer**: 
  - Layer 9 (Rich Content Display)
  - Layer 11 (User Interactions & Moderation)
  - Layer 13 (Media Management)

## 2. Technical Implementation

### Components
```typescript
// Sub-components integrated
import RoleEmojiDisplay from '@/components/ui/RoleEmojiDisplay';
import FacebookReactionSelector from '@/components/ui/FacebookReactionSelector';
import RichTextCommentEditor from '@/components/ui/RichTextCommentEditor';
import PostActionsMenu from '@/components/ui/PostActionsMenu';
import ShareModal from '@/components/modern/ShareModal';
import ReportModal from '@/components/ui/ReportModal';
```

### APIs
- `POST /api/posts/:id/like` - Toggle reactions
- `POST /api/posts/:id/comment` - Add comments
- `DELETE /api/posts/:id/comment/:commentId` - Delete comment
- `PUT /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/share` - Share post
- `POST /api/admin/reports` - Report post (missing backend)

### Real-time Features
```javascript
// Real-time updates via props
onLike={handleLike}
onComment={handleComment}
onShare={handleShare}
onDelete={handleDelete}
// Updates propagated through parent feed component
```

## 3. Database Schema

### Tables
- **posts**: Main content with userId, content, media
- **users**: User info with role field
- **likes**: Reaction types (like, love, haha, wow, sad, angry)
- **comments**: Nested comments with parentId
- **shares**: Share tracking
- **post_reports**: Report records with reason, description

### Relationships
```sql
posts.userId → users.id
likes.postId → posts.id
comments.postId → posts.id
post_reports.post_id → posts.id
post_reports.reporter_id → users.id
```

## 4. User Permissions
- **Access Control**:
  - View: Based on post visibility settings
  - Edit/Delete: Post owner only
  - Report: Any authenticated user
  - Moderate: Admin/Moderator roles
- **Roles**: Displayed via RoleEmojiDisplay component
  - 🎓 Teacher
  - 💃 Dancer
  - 🎵 DJ
  - 📸 Photographer
  - 🏢 Organizer

## 5. MT Ocean Theme
- **Design Implementation**:
  - Glassmorphic card with `backdrop-blur-md`
  - Semi-transparent background `bg-white/90`
  - Hover effects with scale transforms
  - Gradient accents matching #5EEAD4 → #155E75
- **Animations**:
  - Reaction selector spring animation
  - Ripple effects on interactions
  - Smooth transitions on hover
  - Loading skeletons during updates

## 6. Test Coverage
- **Current Status**: Partially tested
- **Requirements**:
  - Unit tests for media URL type guards
  - Integration tests for all API mutations
  - E2E tests for user interactions
  - Test reaction selector accessibility
  - Test report modal flow

## 7. Known Issues

### Critical Fixes Applied
```typescript
// TypeError Fix: url.toLowerCase is not a function
const processMediaUrl = (url: any) => {
  if (typeof url !== 'string') return null;
  if (url.toLowerCase().includes('youtube')) {
    // Process YouTube URL
  }
  return url;
};
```

### Current Issues
- **Report API Missing**: Frontend calls `/api/admin/reports` but endpoint doesn't exist
- **"See Friendship" Button**: Placeholder without functionality
- **Comment Threading**: UI exists but backend support incomplete
- **Share Statistics**: Not tracking share counts

## 8. Agent Responsibilities
- **Content Display Agent (Layer 9)**: Renders post content and media
- **Interaction Agent (Layer 11)**: Manages reactions and comments
- **Moderation Agent (Layer 11)**: Handles reporting flow
- **Media Agent (Layer 13)**: Processes different media types
- **Permission Agent (Layer 4)**: Enforces edit/delete access

## 9. Integration Points
- **External Services**:
  - YouTube/Vimeo embed APIs
  - Social media share APIs
  - React Query for mutations
  - Lucide React for icons
- **Internal Systems**:
  - Toast notifications for feedback
  - Theme context for styling
  - Auth context for permissions
  - API client for requests

## 10. Performance Metrics
- **Load Times**:
  - Component render: <50ms
  - Reaction update: <200ms
  - Comment submission: <500ms
  - Share modal: <100ms
- **Optimization**:
  - React.memo for re-render prevention
  - Debounced reaction updates
  - Optimistic UI for all interactions
  - Lazy loaded modals
  - Image lazy loading with intersection observer

## Code Example - Media Type Guards
```typescript
// Safe media processing with type guards
const renderMedia = () => {
  if (!post.media || !Array.isArray(post.media)) return null;
  
  return post.media.map((mediaItem, index) => {
    // Type guard for URL
    if (typeof mediaItem.url !== 'string') {
      console.warn('Invalid media URL type:', mediaItem);
      return null;
    }
    
    // Safe to use string methods
    const isYouTube = mediaItem.url.toLowerCase().includes('youtube');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaItem.url);
    
    return isYouTube ? <YouTubeEmbed /> : <img />;
  });
};
```

## Implementation Features
1. **Role Emoji Display**: Shows user role with appropriate emoji
2. **Facebook-style Reactions**: 6 reaction types with hover selector
3. **Rich Text Comments**: Markdown, mentions, emojis
4. **Post Actions Menu**: Edit, delete, report dropdown
5. **Share Modal**: Social media integration
6. **Report Modal**: 8 categories for content moderation
7. **Media Gallery**: Supports images, videos, YouTube embeds
8. **Engagement Metrics**: Real-time like/comment/share counts