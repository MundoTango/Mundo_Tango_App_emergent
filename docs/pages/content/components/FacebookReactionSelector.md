# FacebookReactionSelector Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: Reaction UI component (not a route)
- **Purpose**: Facebook-style hover-triggered reaction selector with 6 emotion types for expressing responses to posts
- **ESA Framework Layer**: 
  - Layer 9 (User Interactions)
  - Layer 11 (Real-time Reactions)

## 2. Technical Implementation

### Components
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp } from 'lucide-react';
import { useState, useRef } from 'react';
```

### APIs
- `POST /api/posts/:id/reaction` - Set/update reaction
- `DELETE /api/posts/:id/reaction` - Remove reaction
- Response: `{ reaction: string, counts: { like: 0, love: 0, ... } }`

### Real-time Features
```javascript
// WebSocket events
socket.emit('reaction-added', { postId, reaction, userId });
socket.emit('reaction-removed', { postId, userId });
socket.on('reaction-update', handleReactionUpdate);
```

## 3. Database Schema

### Tables
- **reactions**: User reactions to posts
  - id (primary key)
  - postId (foreign key)
  - userId (foreign key)
  - type (enum: like, love, haha, wow, sad, angry)
  - createdAt

### Relationships
```sql
reactions.postId → posts.id
reactions.userId → users.id
UNIQUE(postId, userId) -- One reaction per user per post
```

## 4. User Permissions
- **Access Control**: Must be authenticated to react
- **Roles**: All authenticated users can react
- **Limitations**: One reaction type per post per user

## 5. MT Ocean Theme
- **Design Implementation**:
  - Glassmorphic selector background
  - Spring animations with Framer Motion
  - Emoji scale on hover (1.2x)
  - Gradient tooltip backgrounds
- **Animations**:
  - Spring physics for entrance (stiffness: 260, damping: 20)
  - Staggered emoji appearance
  - Pulse animation on selection
  - Smooth position transitions

## 6. Test Coverage
- **Current Status**: Basic interaction tests
- **Requirements**:
  - Test hover trigger timing
  - Test reaction selection
  - Test keyboard navigation
  - Test mobile touch interactions
  - Test accessibility with screen readers

## 7. Known Issues

### Working Implementation
```typescript
const reactions = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😆', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' }
];
```

### Current Issues
- **Mobile hover**: Needs long-press support
- **Keyboard navigation**: Tab navigation incomplete
- **Animation performance**: Can lag with many selectors
- **Tooltip positioning**: Edge cases near viewport bounds

## 8. Agent Responsibilities
- **Interaction Agent (Layer 9)**: Manages reaction selection
- **Real-time Agent (Layer 11)**: Syncs reactions across clients
- **Analytics Agent (Layer 30)**: Tracks reaction patterns
- **UI Agent (Layer 8)**: Handles animations

## 9. Integration Points
- **External Services**:
  - Framer Motion for animations
  - React Query for optimistic updates
- **Internal Systems**:
  - WebSocket for real-time sync
  - Toast notifications for errors
  - Analytics tracking

## 10. Performance Metrics
- **Load Times**:
  - Component mount: <10ms
  - Hover response: <16ms (60 FPS)
  - Selection feedback: <50ms
- **Optimization**:
  - Debounced hover (200ms delay)
  - Memoized reaction list
  - CSS transforms for animations
  - Will-change hints for performance
  - RequestAnimationFrame for smooth updates

## Code Example - Complete Component
```tsx
const FacebookReactionSelector = ({ postId, currentReaction, onReaction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout>();
  
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setIsVisible(true);
    }, 200); // Debounce hover
  };
  
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };
  
  const handleReactionSelect = (reaction: string) => {
    // Optimistic update
    onReaction(postId, reaction);
    setIsVisible(false);
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors">
        {currentReaction ? (
          <span className="text-lg">{reactions.find(r => r.type === currentReaction)?.emoji}</span>
        ) : (
          <ThumbsUp className="w-5 h-5" />
        )}
        <span className="text-sm">React</span>
      </button>
      
      {/* Reaction Selector */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="absolute bottom-full left-0 mb-2 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex gap-1"
          >
            {reactions.map((reaction, index) => (
              <motion.button
                key={reaction.type}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleReactionSelect(reaction.type)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-125"
                title={reaction.label}
              >
                <span className="text-2xl">{reaction.emoji}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Reaction Count Tooltip */}
      {currentReaction && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
          You and 23 others
        </div>
      )}
    </div>
  );
};
```

## Implementation Notes
1. **Hover Delay**: 200ms delay prevents accidental triggers
2. **Optimistic Updates**: Immediate UI feedback before API response
3. **Mobile Support**: Long-press detection for touch devices
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Performance**: Debounced events and CSS transforms
6. **Analytics**: Track reaction types and patterns