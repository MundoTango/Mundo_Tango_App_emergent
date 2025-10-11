# Beautiful Post Creator Component

## Overview
The BeautifulPostCreator is a comprehensive post creation component integrated with the ESA LIFE CEO 105-Agent System with 61-Layer Framework, providing rich social features including privacy controls, @mentions, and recommendation automation.

## Features

### Privacy Settings
- **Public**: Posts visible to all platform users
- **Friends**: Posts visible only to accepted friends
- **Private**: Posts visible only to the creator

### @Mention System (Multi-Entity Support)
- Integrated SimpleMentionsInput component with **contentEditable architecture**
- Real-time search for **users, events, groups, and cities**
- Automatic entity linking and formatting
- Triggered by typing "@" followed by name
- **Multiple mentions** supported in single post
- **Color-coded display**: 
  - 🔵 **Users** → Blue badges
  - 🟢 **Events** → Green badges
  - 🟣 **Groups** → Purple badges
  - 🟠 **Cities** → Orange badges with MapPin icon
- **Automatic Notification Creation**: Mentioned users receive instant notifications
- **Format**: Canonical `@[Display Name](type:id)` format for parsing
  - Examples: `@[Elena Rodriguez](user:1)`, `@[Milan Tango Festival](event:123)`, `@[Buenos Aires Tango](group:45)`, `@[Madrid Tango Lovers](city:7)`
- **Backend Integration**: Connected to `MentionNotificationService` on post submission
- **Viewport-Aware Positioning**: Suggestion dropdown stays on screen with z-index 9999
- **contentEditable Rendering**: Single-layer rendering eliminates text alignment issues (Sept 30, 2025)

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
- **Mention parsing and notification** (via `MentionNotificationService.processMentions()`)
  - Extracts user IDs from canonical `@[Name](user:id)` format
  - Creates database notifications for mentioned users
  - Sends real-time Socket.io events for instant delivery
  - Queues email notifications based on user preferences

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

## @Mention Notification Workflow

### Complete End-to-End Flow (Multi-Entity)
1. **User Input**: Types `@` in SimpleMentionsInput textarea (token-based component)
2. **Search**: Component queries `/api/search/multi?q={query}&limit=10`
3. **Entity Display**: Dropdown shows users, events, and groups with type badges
4. **Selection**: User picks from dropdown using keyboard or mouse
5. **Token Insertion**: `replaceTriggerWithMention()` utility inserts mention token
6. **Cursor Positioning**: Token system returns exact cursor position (no jumping!)
7. **Display Rendering**: `tokensToDisplay()` converts to readable format
8. **Canonical Export**: `tokensToCanonical()` creates storage format
   - Example: `@[Elena Rodriguez](user:1) loves @[Milan Tango Festival](event:123)`
9. **Submission**: BeautifulPostCreator extracts user IDs via `onMentionsChange` callback
10. **Post Creation**: API creates post with `mentions: ["1"]` array (user IDs only)
11. **Notification Processing**: `MentionNotificationService.processMentions()` called
12. **Parsing**: Regex extracts user IDs: `/@\[([^\]]+)\]\(user:(\d+)\)/g`
13. **Database**: Creates notification record for each mentioned user
14. **Real-time**: Emits Socket.io event to mentioned users' active sessions
15. **Email**: Queues email notification if user enabled email preferences

**Note**: Only user mentions trigger notifications. Event and group mentions are for reference only.

### Service Integration
```typescript
// In server/routes/postsRoutes.ts (lines 534-550)
if (newPost && content) {
  const { MentionNotificationService } = await import('../services/mentionNotificationService');
  await MentionNotificationService.processMentions(
    content,           // Post content with @[Name](user:id) mentions
    Number(userId),    // ID of user who created the post
    'post',           // Entity type
    newPost.id,       // Post ID for linking
    `/posts/${newPost.id}` // URL for "view post" action
  );
}
```

### Verification Status
✅ **VERIFIED PRODUCTION-READY** (September 29, 2025)
- Canonical format correctly stored in database
- Mention IDs properly extracted and stored in `mentions` array
- Notifications created successfully: `📢 Created 1 mention notifications for post 88`
- API integration tested end-to-end via curl
- All components working as expected

## Related Components
- [SimpleMentionsInput](./SimpleMentionsInput.md)
- [ESAMemoryFeed](./ESAMemoryFeed.md)
- [UnifiedPostFeed](./PostFeed.md)
- [Beautiful Post Integration Guide](../../integration/beautiful-post-integration.md)