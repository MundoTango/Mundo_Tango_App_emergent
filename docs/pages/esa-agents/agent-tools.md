# AgentTools - Platform Operations Integration

## Overview

AgentTools is the bridge between Life CEO AI agents and real platform operations. It provides a function library that agents can call to search housing, create bookings, manage events, generate posts, and access user data.

**Location:** `server/services/AgentTools.ts`

## Architecture

### Service Structure

```typescript
export class AgentTools {
  constructor(private storage: IStorage) {}
  
  // Housing Operations
  async searchHousing(userId: number, filters: HousingFilters): Promise<Housing[]>
  async checkBookingAvailability(userId: number, params: BookingCheck): Promise<boolean>
  async createBooking(userId: number, bookingData: BookingCreate): Promise<Booking>
  
  // Event Operations  
  async searchEvents(userId: number, filters: EventFilters): Promise<Event[]>
  async createEventRSVP(userId: number, eventId: number): Promise<RSVP>
  
  // Social Operations
  async createPost(userId: number, postData: PostCreate): Promise<Post>
  async getUserFeed(userId: number, limit: number): Promise<Post[]>
  
  // User Operations
  async getUserProfile(userId: number): Promise<UserProfile>
  async getUserConnections(userId: number): Promise<Connection[]>
}
```

## Housing Operations

### searchHousing

Search for housing listings with filters and friendship-based access control.

```typescript
async searchHousing(userId: number, filters: {
  cityId?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
}): Promise<Housing[]>
```

**Process:**
1. Apply basic filters (city, price, bedrooms)
2. Check friendship-based booking restrictions
3. Calculate connection degree to host
4. Filter by maximum allowed connection degree
5. Return filtered results with availability

**Example:**
```typescript
const results = await agentTools.searchHousing(7, {
  cityId: 1,
  maxPrice: 100,
  bedrooms: 2,
  amenities: ['wifi', 'kitchen']
});
// Returns properties user can book based on friendship connections
```

**Friendship Integration:**
- Queries `friendshipConnections` table
- Calculates connection degree (1st, 2nd, 3rd)
- Respects host's `maxConnectionDegree` setting
- Uses closeness scores for ranking

### checkBookingAvailability

Verify if dates are available for booking.

```typescript
async checkBookingAvailability(userId: number, {
  housingId: number;
  checkIn: Date;
  checkOut: Date;
}): Promise<boolean>
```

**Validation:**
- Checks existing bookings for overlap
- Validates friendship connection if required
- Verifies property is active
- Returns true/false with reason

### createBooking

Create a new booking with friendship validation.

```typescript
async createBooking(userId: number, {
  housingId: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string;
}): Promise<Booking>
```

**Process:**
1. Validate availability
2. Check friendship restrictions
3. Calculate total price
4. Create booking record
5. Send notifications to host
6. Return booking details

## Event Operations

### searchEvents

Find events with filters.

```typescript
async searchEvents(userId: number, {
  cityId?: number;
  startDate?: Date;
  endDate?: Date;
  eventType?: string;
  limit?: number;
}): Promise<Event[]>
```

**Filters:**
- City/location
- Date range
- Event type (tango, workshop, social, performance)
- RSVP status
- Organizer

**Returns:**
```typescript
{
  id: number;
  title: string;
  description: string;
  cityId: number;
  cityName: string;
  startTime: Date;
  endTime: Date;
  eventType: string;
  attendeeCount: number;
  isAttending: boolean;
}
```

### createEventRSVP

RSVP to an event.

```typescript
async createEventRSVP(userId: number, eventId: number): Promise<{
  success: boolean;
  rsvp: RSVP;
  event: Event;
}>
```

**Features:**
- Prevents duplicate RSVPs
- Checks event capacity
- Sends confirmation
- Updates attendee count

## Social Operations

### createPost

Generate a post on behalf of the user.

```typescript
async createPost(userId: number, {
  content: string;
  visibility?: 'public' | 'friends' | 'private';
  entityType?: 'user' | 'group' | 'event';
  entityId?: number;
  mediaUrls?: string[];
}): Promise<Post>
```

**Agent Use Cases:**
- Create travel journal entries
- Share event recaps
- Post health updates
- Share financial milestones

**Validation:**
- Content moderation (future)
- Privacy settings
- Entity permissions
- Media upload limits

### getUserFeed

Get user's activity feed.

```typescript
async getUserFeed(userId: number, limit: number = 20): Promise<Post[]>
```

**Returns:**
- User's posts
- Friend posts
- Group posts
- Event updates
- Recommendations

## User Operations

### getUserProfile

Fetch comprehensive user profile.

```typescript
async getUserProfile(userId: number): Promise<{
  id: number;
  name: string;
  email: string;
  bio: string;
  location: string;
  interests: string[];
  tangoRole: string;
  experienceLevel: string;
  friendCount: number;
  groupCount: number;
}>
```

**Includes:**
- Basic info
- Tango profile
- Statistics
- Preferences
- Privacy settings

### getUserConnections

Get friendship network.

```typescript
async getUserConnections(userId: number): Promise<{
  id: number;
  friendId: number;
  friendName: string;
  connectionDegree: number;
  closenessScore: number;
  connectedSince: Date;
}[]>
```

**Connection Analysis:**
- Direct friends (degree 1)
- Friends of friends (degree 2)
- Extended network (degree 3)
- Closeness scores
- Common groups/events

## City & Group Operations

### getCityGroups

Get city-specific groups.

```typescript
async getCityGroups(cityId?: number): Promise<CityGroup[]>
```

### getPopularDestinations

Get trending cities for housing/travel.

```typescript
async getPopularDestinations(): Promise<{
  cityId: number;
  cityName: string;
  housingCount: number;
  eventCount: number;
  memberCount: number;
}[]>
```

## Function Calling Integration

### Tool Definitions for OpenAI

```typescript
const housingSearchTool = {
  type: 'function',
  function: {
    name: 'searchHousing',
    description: 'Search for housing listings in Mundo Tango communities with friendship-based access',
    parameters: {
      type: 'object',
      properties: {
        cityId: {
          type: 'number',
          description: 'City group ID to search in'
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum nightly price'
        },
        bedrooms: {
          type: 'number',
          description: 'Number of bedrooms needed'
        },
        amenities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required amenities (wifi, kitchen, parking, etc.)'
        }
      }
    }
  }
};
```

### Execution Flow

1. **Agent receives user request:**
   > "Find me a 2-bedroom place in Buenos Aires under $80/night"

2. **OpenAI determines function call:**
   ```json
   {
     "tool_calls": [{
       "function": {
         "name": "searchHousing",
         "arguments": "{\"cityId\": 1, \"maxPrice\": 80, \"bedrooms\": 2}"
       }
     }]
   }
   ```

3. **AgentTools executes:**
   ```typescript
   const results = await agentTools.searchHousing(userId, {
     cityId: 1,
     maxPrice: 80,
     bedrooms: 2
   });
   ```

4. **Result returned to OpenAI:**
   ```json
   {
     "role": "tool",
     "content": "[{\"id\": 5, \"title\": \"Cozy apartment in Palermo\"...}]"
   }
   ```

5. **Agent generates response:**
   > "I found 3 great options in Buenos Aires! The top choice is a cozy 2-bedroom apartment in Palermo for $75/night..."

## Security & Permissions

### User Context

All operations require valid user context:

```typescript
// Automatically validated in middleware
const userId = req.user.id;
const tools = new AgentTools(storage);
await tools.searchHousing(userId, filters);
```

### Permission Checks

```typescript
// Housing - Check if user can book
if (housing.bookingRestrictions === 'friends_only') {
  const connection = await getConnection(userId, housing.hostId);
  if (!connection || connection.degree > housing.maxConnectionDegree) {
    throw new Error('Insufficient friendship connection');
  }
}

// Events - Check if user can RSVP
if (event.requiresApproval && !event.organizerId === userId) {
  // Send RSVP request to organizer
}

// Posts - Check posting permissions
if (entityType === 'group') {
  const isMember = await checkGroupMembership(userId, entityId);
  if (!isMember) {
    throw new Error('Must be group member to post');
  }
}
```

## Error Handling

### Validation Errors

```typescript
class ValidationError extends Error {
  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Usage
if (!filters.cityId) {
  throw new ValidationError('City ID is required', 'cityId');
}
```

### Permission Errors

```typescript
class PermissionError extends Error {
  constructor(message: string, resource: string) {
    super(message);
    this.name = 'PermissionError';
    this.resource = resource;
  }
}

// Usage
if (!canAccess) {
  throw new PermissionError(
    'Insufficient permissions to access this resource',
    'housing'
  );
}
```

## Testing

### Unit Tests

```typescript
describe('AgentTools - Housing Operations', () => {
  it('should filter housing by friendship connection', async () => {
    const results = await agentTools.searchHousing(7, {
      cityId: 1,
      maxPrice: 100
    });
    
    // All results should be accessible based on friendship
    results.forEach(housing => {
      expect(housing.canBook).toBe(true);
    });
  });
});
```

### Integration Tests

```bash
# Test via agent endpoint
curl -X POST http://localhost:5000/api/life-ceo/test/global-mobility \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find me accommodation in Buenos Aires for next week"
  }'
```

## Performance Optimization

### Caching

```typescript
// Cache city groups for 1 hour
const cachedGroups = await cache.get('city_groups');
if (cachedGroups) return cachedGroups;

const groups = await storage.getAllCityGroups();
await cache.set('city_groups', groups, 3600);
```

### Query Optimization

```typescript
// Join friendship data in single query
const housingWithConnections = await db
  .select()
  .from(housing)
  .leftJoin(friendshipConnections, ...)
  .where(...)
  .limit(20);
```

### Batch Operations

```typescript
// Fetch multiple entities in parallel
const [housing, events, profile] = await Promise.all([
  agentTools.searchHousing(userId, filters),
  agentTools.searchEvents(userId, eventFilters),
  agentTools.getUserProfile(userId)
]);
```

## Monitoring

Track tool usage in metrics:

```typescript
agentToolCalls.inc({
  tool_name: 'searchHousing',
  agent_id: 'global-mobility',
  status: 'success'
});

agentToolLatency.observe({
  tool_name: 'searchHousing'
}, duration);
```

## Future Enhancements

- [ ] Recommendation engine integration
- [ ] ML-powered search ranking
- [ ] Natural language date parsing
- [ ] Multi-city itinerary planning
- [ ] Automated trip coordination
- [ ] Budget optimization across bookings
- [ ] Group booking coordination
- [ ] Payment processing integration