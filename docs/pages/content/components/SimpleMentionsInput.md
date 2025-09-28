# SimpleMentionsInput Component

## Overview
The SimpleMentionsInput is a specialized text input component that provides @mention functionality for tagging users in posts, integrated with the ESA LIFE CEO framework.

## Features

### Core Functionality
- **Trigger Character**: '@' activates mention mode
- **User Search**: Real-time search as you type
- **Suggestion Dropdown**: Shows matching users
- **Keyboard Navigation**: Arrow keys to navigate suggestions
- **Auto-completion**: Tab/Enter to select user
- **Visual Highlighting**: Mentioned users appear highlighted

## Technical Implementation

### Component Location
`client/src/components/memory/SimpleMentionsInput.tsx`

### Props Interface
```typescript
interface SimpleMentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}
```

### State Management
- `showSuggestions`: Boolean for dropdown visibility
- `suggestions`: Array of matching users
- `selectedIndex`: Current selection in dropdown
- `mentionStart`: Position where @ was typed
- `searchTerm`: Current search query

## API Integration

### User Search Endpoint
`GET /api/users/search?q={searchTerm}`
- Returns array of matching users
- Searches by username and full name
- Limited to 10 results for performance
- Excludes blocked users

### Response Format
```json
[
  {
    "id": 1,
    "username": "elena_rodriguez",
    "fullName": "Elena Rodriguez",
    "profileImage": "/uploads/profile.jpg"
  }
]
```

## Mention Format

### Storage Format
Mentions are stored in the database as:
```
Hello @[Elena Rodriguez](user:1), how are you?
```

### Display Format
Rendered in the UI as clickable links:
```html
<span class="mention" data-user-id="1">@Elena Rodriguez</span>
```

## Event Handlers

### onInputChange
- Detects @ character typing
- Triggers user search after @
- Updates mention suggestions
- Handles text replacement on selection

### onKeyDown
- Arrow Up/Down: Navigate suggestions
- Enter/Tab: Select current suggestion
- Escape: Close suggestions dropdown

### onSuggestionClick
- Replaces @searchTerm with selected user
- Inserts formatted mention
- Closes suggestion dropdown
- Moves cursor after mention

## Styling

### CSS Classes
- `.mentions-input-container`: Main container
- `.mentions-textarea`: Text input area
- `.mentions-suggestions`: Dropdown container
- `.mention-item`: Individual suggestion
- `.mention-item-selected`: Highlighted suggestion
- `.mention-highlight`: Rendered mention in text

## Performance Optimizations

### Debouncing
- 300ms delay before API search
- Prevents excessive API calls
- Cancels previous pending searches

### Caching
- Recent searches cached for 5 minutes
- Reduces redundant API calls
- Improves suggestion speed

### Virtual Scrolling
- For large suggestion lists
- Only renders visible items
- Maintains smooth scrolling

## Integration with BeautifulPostCreator

```jsx
import SimpleMentionsInput from '@/components/memory/SimpleMentionsInput';

function BeautifulPostCreator() {
  const [content, setContent] = useState('');
  
  return (
    <SimpleMentionsInput
      value={content}
      onChange={setContent}
      placeholder="Share your thoughts... Use @ to mention friends"
      className="w-full min-h-[100px]"
      maxLength={500}
    />
  );
}
```

## Notification System

When a mention is created:
1. Parse mentions from post content
2. Extract user IDs from mention format
3. Create notifications for mentioned users
4. Send real-time alerts via WebSocket
5. Queue email notifications if enabled

## Accessibility Features
- ARIA labels for screen readers
- Keyboard-only navigation support
- Focus management for dropdown
- Announcement of selected mentions
- High contrast mode support

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers supported

## Known Limitations
- Maximum 10 mentions per post
- Cannot mention users who blocked you
- Mentions in edited posts don't re-notify
- Search limited to active users only

## Testing Checklist
- [ ] @ character triggers suggestions
- [ ] Search returns relevant users
- [ ] Keyboard navigation works
- [ ] Mentions are properly formatted
- [ ] Notifications are sent
- [ ] Performance with many mentions
- [ ] Mobile touch interaction
- [ ] Accessibility compliance

## Related Documentation
- [BeautifulPostCreator](./BeautifulPostCreator.md)
- [User Search API](../../api/user-search.md)
- [Notification System](../../notifications/mentions.md)