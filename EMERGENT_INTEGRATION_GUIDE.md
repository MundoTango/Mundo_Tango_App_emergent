
# ESA LIFE CEO 61×21 - Events Agent Integration Guide

## Overview
This guide provides everything needed to integrate the Events Agent with the existing Memories system and Socket.io infrastructure.

## Completed Infrastructure (Ready to Use)

### 1. Socket.io Setup (Port 5000)
- **Server**: `server/socket.ts` - Complete WebSocket server
- **Client Hook**: `client/src/hooks/useSocket.ts` - Base connection
- **Event Hook**: `client/src/hooks/useEventSocket.ts` - Ready for Events Agent
- **Types**: `shared/socketEvents.ts` - TypeScript interfaces

### 2. AI Enhancement System
- **Service**: `server/services/openaiService.ts` - GPT-4 integration
- **Endpoints**: 
  - `POST /api/posts/:id/enhance` - Enhance existing content
  - `POST /api/posts/enhance-content` - Enhance raw content
- **Fallback**: Works without OpenAI API key for development

### 3. Database Schema (PostgreSQL)
- **Events Table**: Complete with RSVP, delegation, recurring events
- **Users Table**: Role-based with tango specializations  
- **Posts Table**: Unified content system (memories + events)
- **Groups Table**: City and role-based communities

## Integration Patterns

### WebSocket Event Naming Convention
```typescript
// Memory events (implemented)
'memory:like', 'memory:comment', 'memory:share', 'memory:typing'

// Event events (for your agent)
'event:rsvp', 'event:update', 'event:comment', 'event:typing'

// Group events (future)
'group:message', 'group:typing'
```

### Socket.io Room Structure
```typescript
// User-specific notifications
`user:${userId}`

// Content-specific real-time updates
`memory:${memoryId}`
`event:${eventId}`   // ← Your Events Agent
`group:${groupId}`

// Geographic broadcasting
`city:${cityName}`

// Platform-wide
'global'
```

### API Response Format (Standardized)
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Events Agent Implementation Guide

### 1. Real-time Event Updates
```typescript
// In your event management components
import { useEventSocket } from '../hooks/useEventSocket';

const { emitRSVP, emitUpdate, isConnected } = useEventSocket(eventId, userId);

// RSVP changes broadcast to all event viewers
emitRSVP({
  eventId,
  rsvpStatus: 'going',
  username,
  eventOwnerId
});

// Event updates broadcast to attendees
emitUpdate({
  eventId,
  username,
  eventOwnerId,
  eventTitle: 'Updated Event Title'
});
```

### 2. Database Integration
```typescript
// Use existing schema from shared/schema.ts
import { events, eventRsvps, eventParticipants } from '../../../shared/schema';

// Events Agent endpoints should follow:
// POST /api/events - Create event
// GET /api/events/:id - Get event details  
// PUT /api/events/:id - Update event
// POST /api/events/:id/rsvp - RSVP to event
// GET /api/events/:id/participants - Get participants
```

### 3. AI Enhancement Integration
```typescript
// Enhance event descriptions
const enhanceEventDescription = async (description: string) => {
  const response = await fetch('/api/posts/enhance-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: description })
  });
  return response.json(); // Returns { success, data: { enhanced } }
};
```

## Shared Components (Ready to Use)

### UI Components
- `BeautifulPostCreator` - Rich content creation with AI
- `GoogleMapsAutocomplete` - Location selection
- `RoleSelector` - Tango role management
- `MediaUploader` - File upload system

### Services  
- `openaiService` - AI content enhancement
- `supabaseService` - Database operations
- `cacheService` - Performance optimization

### Hooks
- `useSocket` - Base WebSocket connection
- `useEventSocket` - Event-specific real-time features  
- `useAuth` - Authentication state
- `useDebounce` - Input optimization

## Testing Your Integration

### 1. Socket.io Connection Test
```bash
# Test WebSocket endpoint
curl -I ws://localhost:5000

# Test integration health
curl http://localhost:5000/api/integration/socket-health
```

### 2. AI Enhancement Test
```bash
curl -X POST http://localhost:5000/api/integration/test-ai-enhance \
  -H "Content-Type: application/json" \
  -d '{"content":"Join us for tango at Plaza Dorrego"}'
```

### 3. Database Schema Test
```bash
curl http://localhost:5000/api/integration/database-schema
```

## Event Naming Conventions (Avoid Conflicts)

### Memories (Implemented)
- `memory:*` - All memory-related events
- `post:*` - Generic post events

### Events (Your Domain)  
- `event:*` - All event-related WebSocket events
- `rsvp:*` - RSVP-specific events
- `venue:*` - Location-related events

### Groups (Future)
- `group:*` - Group/community events
- `city:*` - Geographic events

## Development Workflow

1. **Use existing Socket.io server** (already running on port 5000)
2. **Follow API response format** ({ success, data, error, message })
3. **Emit to appropriate rooms** (`event:${eventId}`, `user:${userId}`)
4. **Test real-time features** using provided hooks
5. **Coordinate with Memories** for unified feed display

## Files to Reference
- `server/socket.ts` - WebSocket implementation
- `shared/socketEvents.ts` - Event type definitions
- `client/src/hooks/useEventSocket.ts` - Events real-time hook
- `server/routes/integrationHelpers.ts` - Test endpoints
- `shared/schema.ts` - Database structure

## Next Steps for Events Agent
1. Build event creation/management UI
2. Implement RSVP system with real-time updates
3. Add event participant role assignments (DJ, teacher, etc.)
4. Integrate with existing city groups system
5. Add calendar export functionality
6. Test real-time notifications for event updates

All Socket.io infrastructure is ready - just emit your events and they'll broadcast to the right users! 🚀
