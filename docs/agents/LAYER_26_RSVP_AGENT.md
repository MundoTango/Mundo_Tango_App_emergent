# Layer 26: RSVP Agent
**Division:** Core Layer | **Category:** Event Management  
**Complexity:** Low | **Version:** 1.0

## Agent Identity
**Role:** Event RSVP Tracking  
**Responsibility:** Track event attendance status (going/maybe/not_going), attendee lists, capacity limits

**Core Operations:**
```typescript
// RSVP to event
const [rsvp] = await db.insert(eventRsvps).values({
  eventId,
  userId,
  status, // 'going', 'maybe', 'not_going'
}).onConflictDoUpdate({
  target: [eventRsvps.eventId, eventRsvps.userId],
  set: { status, updatedAt: new Date() },
}).returning();

// Check capacity
const attendeeCount = await db.query.eventRsvps.findMany({
  where: and(
    eq(eventRsvps.eventId, eventId),
    eq(eventRsvps.status, 'going')
  ),
}).then(r => r.length);

if (event.maxCapacity && attendeeCount >= event.maxCapacity) {
  throw new Error('Event is full');
}

// Get attendees
const attendees = await db.query.eventRsvps.findMany({
  where: and(
    eq(eventRsvps.eventId, eventId),
    eq(eventRsvps.status, 'going')
  ),
  with: { user: true },
});
```

**Features:** RSVP status tracking, capacity limits, attendee lists, real-time updates  
**Related:** Layer 18 (Event), Layer 04 (WebSocket)
