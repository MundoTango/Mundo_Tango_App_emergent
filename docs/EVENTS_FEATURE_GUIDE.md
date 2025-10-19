# Events Feature Guide
**Owner:** Layer #23 (Event Management)  
**Created:** October 19, 2025  
**Purpose:** Complete guide to Mundo Tango events system

---

## 🎯 Overview

The Events system enables tango community members to create, discover, and manage tango events worldwide. Features include:

- Event creation and management
- RSVP and attendance tracking
- Recurring events support
- Location-based discovery
- Calendar integration
- Real-time updates via WebSocket

---

## 📊 Database Schema

```typescript
// shared/schema.ts
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  // Organizer
  userId: integer('user_id').references(() => users.id).notNull(),
  organizerId: integer('organizer_id').references(() => users.id),
  
  // Date/Time
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  timezone: varchar('timezone', { length: 100 }),
  
  // Location
  location: varchar('location', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  
  // Event Details
  eventType: varchar('event_type', { length: 50 }), // milonga, practica, class, festival
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: text('recurrence_pattern'), // JSON: { frequency, interval, endDate }
  maxAttendees: integer('max_attendees'),
  
  // Visibility
  isPublic: boolean('is_public').default(true),
  requiresApproval: boolean('requires_approval').default(false),
  
  // Media
  coverImage: varchar('cover_image', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }),
  
  // Pricing
  price: numeric('price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  
  // Status
  status: varchar('status', { length: 50 }).default('active'), // active, cancelled, completed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const eventRsvps = pgTable('event_rsvps', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).default('going'), // going, maybe, not_going
  createdAt: timestamp('created_at').defaultNow()
});
```

---

## 🔌 API Endpoints

### Create Event
```typescript
POST /api/events
Content-Type: application/json

{
  "title": "Friday Milonga",
  "description": "Traditional milonga with live orchestra",
  "startTime": "2025-11-01T20:00:00Z",
  "endTime": "2025-11-01T23:00:00Z",
  "location": "Salon Canning",
  "city": "Buenos Aires",
  "country": "Argentina",
  "eventType": "milonga",
  "price": 15.00,
  "isPublic": true
}

Response: 201 Created
{
  "id": 123,
  "title": "Friday Milonga",
  ...
}
```

### Get Event
```typescript
GET /api/events/:id

Response: 200 OK
{
  "id": 123,
  "title": "Friday Milonga",
  "organizer": {
    "id": 1,
    "name": "Elena Rodriguez",
    "profileImage": "..."
  },
  "rsvpCount": 45,
  "attendees": [...]
}
```

### List Events
```typescript
GET /api/events?city=Buenos Aires&type=milonga&date=2025-11-01

Response: 200 OK
{
  "events": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### RSVP to Event
```typescript
POST /api/events/:id/rsvp
Content-Type: application/json

{
  "status": "going"  // or "maybe", "not_going"
}

Response: 200 OK
{
  "message": "RSVP recorded",
  "rsvpStatus": "going"
}
```

### Update Event
```typescript
PATCH /api/events/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "startTime": "2025-11-01T21:00:00Z"
}

Response: 200 OK
```

### Delete Event
```typescript
DELETE /api/events/:id

Response: 204 No Content
```

---

## 🎨 Frontend Components

### Event Creation Form

```typescript
// client/src/pages/CreateEvent.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEventSchema } from '@shared/schema';

export default function CreateEvent() {
  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: 'milonga',
      isPublic: true
    }
  });
  
  const createEvent = useMutation({
    mutationFn: (data) => apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Event created!' });
    }
  });
  
  return (
    <Form {...form}>
      <FormField name="title" label="Event Title" />
      <FormField name="description" label="Description" />
      <FormField name="startTime" label="Start Time" type="datetime-local" />
      <FormField name="location" label="Location" />
      <Button onClick={form.handleSubmit(createEvent.mutate)}>
        Create Event
      </Button>
    </Form>
  );
}
```

### Event List

```typescript
// client/src/pages/Events.tsx
export default function Events() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events'],
  });
  
  if (isLoading) return <Skeleton count={5} />;
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### RSVP Button

```typescript
// client/src/components/events/RsvpButton.tsx
export function RsvpButton({ eventId, currentStatus }) {
  const rsvp = useMutation({
    mutationFn: (status) => apiRequest(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
    }
  });
  
  return (
    <div>
      <Button onClick={() => rsvp.mutate('going')}>
        Going
      </Button>
      <Button onClick={() => rsvp.mutate('maybe')}>
        Maybe
      </Button>
    </div>
  );
}
```

---

## 🔄 Real-Time Updates

### WebSocket Event Emissions

```typescript
// server/routes/events.ts
socket.emit('event:created', { eventId, event });
socket.emit('event:updated', { eventId, changes });
socket.emit('event:rsvp', { eventId, userId, status });
```

### Frontend WebSocket Listeners

```typescript
// client/src/hooks/useEventUpdates.ts
export function useEventUpdates(eventId) {
  const { socket } = useWebSocket();
  
  useEffect(() => {
    socket.on('event:updated', (data) => {
      if (data.eventId === eventId) {
        queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      }
    });
    
    return () => socket.off('event:updated');
  }, [eventId]);
}
```

---

## 📅 Recurring Events

### Recurrence Pattern Schema

```json
{
  "frequency": "weekly",  // daily, weekly, monthly
  "interval": 1,          // every 1 week
  "daysOfWeek": [5],      // Friday (0=Sunday, 6=Saturday)
  "endDate": "2025-12-31",
  "exceptions": ["2025-11-25"]  // Skip Thanksgiving
}
```

### Generating Recurring Event Instances

```typescript
// server/services/eventService.ts
function generateRecurringInstances(event, startDate, endDate) {
  const pattern = JSON.parse(event.recurrencePattern);
  const instances = [];
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (matchesPattern(currentDate, pattern)) {
      instances.push({
        ...event,
        startTime: currentDate,
        isRecurringInstance: true,
        parentEventId: event.id
      });
    }
    currentDate = addInterval(currentDate, pattern);
  }
  
  return instances;
}
```

---

## 🔍 Event Discovery

### Location-Based Search

```typescript
// Find events within 50km radius
GET /api/events/nearby?lat=34.0522&lng=-118.2437&radius=50

// City-based search
GET /api/events?city=Buenos Aires

// Country-based search
GET /api/events?country=Argentina
```

### Filtering & Sorting

```typescript
GET /api/events
  ?eventType=milonga
  &date=2025-11-01
  &city=Buenos Aires
  &sort=startTime
  &order=asc
  &page=1
  &limit=20
```

---

## 🎯 Event Types

- **milonga** - Social tango dance
- **practica** - Practice session
- **class** - Tango class/workshop
- **festival** - Multi-day tango festival
- **concert** - Tango concert/performance
- **other** - Custom event type

---

## 📊 Analytics

### Event Metrics

- Total RSVPs (going/maybe/not_going)
- Attendance rate (actual vs RSVP)
- Event views
- Share count
- Average rating (future)

---

## 🔒 Privacy & Security

### Event Visibility

- **Public:** Visible to all users
- **Private:** Invite-only (requires approval)
- **Group-only:** Visible to group members

### RSVP Approval

- Auto-approve for public events
- Manual approval for private events
- Group admin approval for group events

---

## 🚀 Future Enhancements

- [ ] Calendar export (iCal, Google Calendar)
- [ ] Event reminders (email, push, SMS)
- [ ] Payment integration for paid events
- [ ] Waitlist for sold-out events
- [ ] Event ratings and reviews
- [ ] Photo galleries
- [ ] Live streaming integration

---

## 📚 Related Documentation

- Layer #23 (Event Management) - Agent documentation
- `API_REFERENCE.md` - Complete API specs
- `DATABASE_SCHEMA.md` - Full schema reference

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #23 (Event Management)
