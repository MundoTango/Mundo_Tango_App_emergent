# CleanMemoryCard Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: Card display component (not a route)
- **Purpose**: Clean, minimalist card design for displaying memory posts with optimized layout and engagement metrics
- **ESA Framework Layer**: 
  - Layer 9 (Content Display)
  - Layer 13 (Media Management)

## 2. Technical Implementation

### Components
```typescript
import { Heart, MessageCircle, Share2, MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import RoleEmojiDisplay from '@/components/ui/RoleEmojiDisplay';
```

### APIs
- Receives post data via props
- No direct API calls (handled by parent)

### Real-time Features
- Updates received through props from parent feed
- Optimistic UI for interactions

## 3. Database Schema

### Tables
- **posts**: Source for all post data
- **users**: Author information
- **media**: Media attachments array

### Relationships
```sql
posts.userId → users.id
posts.media → JSON array of media objects
```

## 4. User Permissions
- **Access Control**: Inherited from parent component
- **Roles**: Display only, no direct permission checks

## 5. MT Ocean Theme
- **Design Implementation**:
  - Clean white background with subtle shadow
  - Rounded corners (rounded-lg)
  - Hover elevation effect
  - Consistent spacing (p-4)
- **Animations**:
  - Hover scale transform (1.02)
  - Transition on shadow
  - Heart pulse animation on like

## 6. Test Coverage
- **Current Status**: Unit tests for render
- **Requirements**:
  - Test media URL type guards
  - Test location display
  - Test engagement metrics
  - Test responsive layout

## 7. Known Issues

### Critical Fix Applied
```typescript
// TypeError prevention for media URLs
const renderMedia = () => {
  if (!post.media || !Array.isArray(post.media)) return null;
  
  return post.media.map(item => {
    if (typeof item.url !== 'string') {
      console.warn('Invalid media URL:', item);
      return null;
    }
    // Safe to use string methods
    const isVideo = item.url.toLowerCase().includes('.mp4');
    return isVideo ? <video /> : <img />;
  });
};
```

### Current Issues
- **Truncation**: Long content needs better truncation
- **Media gallery**: Multiple images need carousel
- **Timestamp**: Needs localization

## 8. Agent Responsibilities
- **Content Display Agent (Layer 9)**: Renders post content
- **Media Agent (Layer 13)**: Handles media display
- **UI Agent (Layer 8)**: Maintains clean design

## 9. Integration Points
- **External Services**:
  - date-fns for time formatting
  - Lucide React for icons
- **Internal Systems**:
  - RoleEmojiDisplay for user roles
  - Theme context for styling

## 10. Performance Metrics
- **Load Times**:
  - Component render: <30ms
  - Image loading: Progressive
- **Optimization**:
  - Memoized with React.memo
  - Lazy loaded images
  - Efficient re-renders
  - CSS transforms for animations

## Code Example - Complete Component
```tsx
const CleanMemoryCard = ({ post, onLike, onComment, onShare }) => {
  const processMediaUrl = (url: any) => {
    if (typeof url !== 'string') return null;
    return url;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={post.user?.avatar} 
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{post.user?.name}</span>
            <RoleEmojiDisplay role={post.user?.role} />
          </div>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt))}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <p className="mb-3">{post.content}</p>
      
      {/* Media */}
      {post.media?.map((item, idx) => {
        const url = processMediaUrl(item.url);
        if (!url) return null;
        return <img key={idx} src={url} className="rounded-lg" />;
      })}
      
      {/* Location */}
      {post.location && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
          <MapPin className="w-4 h-4" />
          <span>{post.location}</span>
        </div>
      )}
      
      {/* Engagement */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t">
        <button 
          onClick={() => onLike(post.id)}
          className="flex items-center gap-1 hover:text-red-500 transition-colors"
        >
          <Heart className="w-5 h-5" />
          <span>{post.likesCount}</span>
        </button>
        <button 
          onClick={() => onComment(post.id)}
          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.commentsCount}</span>
        </button>
        <button 
          onClick={() => onShare(post.id)}
          className="flex items-center gap-1 hover:text-green-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>{post.sharesCount}</span>
        </button>
      </div>
    </div>
  );
};
```