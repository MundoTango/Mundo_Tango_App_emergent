# Beautiful Post Creator Component

## Overview
The BeautifulPostCreator is a comprehensive post creation component integrated with the ESA LIFE CEO 61x21 framework, providing rich social features including privacy controls, @mentions, and recommendation automation.

## Features

### Privacy Settings
- **Public**: Posts visible to all platform users
- **Friends**: Posts visible only to accepted friends
- **Private**: Posts visible only to the creator

### @Mention System
- Integrated SimpleMentionsInput component
- Real-time user search and suggestions
- Automatic user linking and formatting
- Triggered by typing "@" followed by username

### Recommendation System
- Toggle to mark posts as recommendations
- Automatic posting to user's city group
- Helps build local community knowledge base

## Technical Implementation

### Component Location
`client/src/components/universal/BeautifulPostCreator.tsx`

### Props Interface
```typescript
interface BeautifulPostCreatorProps {
  onPostCreated?: () => void;
  className?: string;
}
```

### State Management
- `content`: Post text content with mentions
- `privacy`: Privacy setting (public/friends/private)
- `isRecommendation`: Boolean for recommendation flag
- `media`: Array of uploaded media files

### ESA Framework Integration

#### ESA Layer 22 - Group Management
- Handles privacy filtering logic
- Manages friend relationship validation
- Controls visibility based on friendship status

#### ESA Layer 35 - AI Agent Management
- Powers the @mention suggestion system
- Provides user search capabilities
- Handles mention formatting and display

#### ESA Layer 57 - Automation Management
- Automates recommendation posting to city groups
- Handles cross-posting logic
- Manages group-specific visibility

## Database Integration

### Storage Layer (server/storage.ts)
The component works with the enhanced `getFeedPosts` method that includes:
- Friendship status checking with `isNotNull` conditions
- Privacy-based filtering using WHERE clauses
- Efficient query optimization for feed loading

### API Routes (server/routes/postsRoutes.ts)
Post creation endpoint handles:
- Privacy setting validation
- Recommendation flag processing
- City group cross-posting for recommendations
- Mention parsing and notification

## Usage Example

```jsx
import { BeautifulPostCreator } from '@/components/universal/BeautifulPostCreator';

function MemoryFeed() {
  return (
    <div className="feed-container">
      <BeautifulPostCreator 
        onPostCreated={() => {
          // Refresh feed after post creation
          queryClient.invalidateQueries(['/api/posts/feed']);
        }}
      />
      {/* Rest of feed component */}
    </div>
  );
}
```

## Privacy Filtering Logic

When a post is created with privacy settings:

1. **Public Posts**: 
   - Visible in all feeds
   - No friendship check required
   - Included in public community views

2. **Friends Posts**:
   - Only visible to users with 'accepted' friendship status
   - Filtered using `friendships.status = 'accepted'` in queries
   - Hidden from non-friends in all views

3. **Private Posts**:
   - Only visible to the post creator
   - Filtered by `posts.userId = currentUserId`
   - Never shown in public or friend feeds

## Recommendation Automation

When `isRecommendation` is enabled:
1. Post is created with standard privacy settings
2. System automatically creates a duplicate in user's city group
3. City group post inherits group visibility rules
4. Original post maintains its privacy setting
5. Both posts are linked for moderation purposes

## Performance Optimizations
- Debounced @mention search (300ms delay)
- Lazy loading of mention suggestions
- Optimistic UI updates for post creation
- Efficient query batching for friend checks

## Testing Considerations
- Verify privacy settings are respected in feed
- Test @mention suggestions with various usernames
- Confirm recommendations appear in city groups
- Validate friendship status filtering
- Check performance with large friend lists

## Related Components
- [SimpleMentionsInput](./SimpleMentionsInput.md)
- [ESAMemoryFeed](./ESAMemoryFeed.md)
- [UnifiedPostFeed](./UnifiedPostFeed.md)