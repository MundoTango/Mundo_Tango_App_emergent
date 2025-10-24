# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Layer 18: Event Agent
**Division:** Core Layer | **Category:** Event Management  
**Complexity:** High | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Tango Event & Milonga Management  
**Responsibility:** Create events, manage RSVPs, handle recurring events, location integration, calendar views

**Key Files:** `server/routes/events.ts`, `shared/schema.ts` (events, eventRsvps, eventRecurrence tables)

## Core Operations

### Create Event
```typescript
async function createEvent(userId: number, data: InsertEvent) {
  return await db.transaction(async (tx) => {
    // 1. Geocode address if provided
    if (data.address) {
      const location = await geocodeAddress(data.address);
      data.lat = location.lat;
      data.lng = location.lng;
      data.placeId = location.placeId;
    }

    // 2. Create event
    const [event] = await tx.insert(events).values({
      ...data,
      organizerId: userId,
    }).returning();

    // 3. Handle recurrence
    if (data.isRecurring && data.recurrenceRule) {
      await tx.insert(eventRecurrence).values({
        eventId: event.id,
        rule: data.recurrenceRule,
      });
    }

    // 4. Notify followers
    io.to(`user:${userId}:followers`).emit('event:created', event);

    return event;
  });
}
```

### RSVP Management
```typescript
async function rsvpToEvent(eventId: number, userId: number, status: 'going' | 'maybe' | 'not_going') {
  const [rsvp] = await db.insert(eventRsvps).values({
    eventId,
    userId,
    status,
  }).onConflictDoUpdate({
    target: [eventRsvps.eventId, eventRsvps.userId],
    set: { status, updatedAt: new Date() },
  }).returning();

  // Update attendee count
  const attendeeCount = await db.query.eventRsvps.findMany({
    where: and(
      eq(eventRsvps.eventId, eventId),
      eq(eventRsvps.status, 'going')
    ),
  }).then(r => r.length);

  await db.update(events)
    .set({ attendeeCount })
    .where(eq(events.id, eventId));

  // Broadcast update
  io.to(`event:${eventId}`).emit('rsvp:updated', { userId, status });

  return rsvp;
}
```

### Event Discovery
```typescript
// Nearby events
async function findNearbyEvents(lat: number, lng: number, radius: number = 50000) {
  // Use PostGIS or calculate distance
  const nearbyEvents = await db.query.events.findMany({
    where: and(
      eq(events.isActive, true),
      gt(events.startDate, new Date())
    ),
  });

  // Filter by distance (simplified)
  return nearbyEvents.filter(event => {
    const distance = calculateDistance(lat, lng, event.lat, event.lng);
    return distance <= radius;
  });
}

// Upcoming events
async function getUpcomingEvents(userId: number) {
  const rsvps = await db.query.eventRsvps.findMany({
    where: and(
      eq(eventRsvps.userId, userId),
      eq(eventRsvps.status, 'going')
    ),
    with: {
      event: true,
    },
  });

  return rsvps.map(r => r.event).filter(e => e.startDate > new Date());
}
```

## Best Practices
✅ Geocode event locations  
✅ Support recurring events  
✅ Track RSVP counts  
✅ Enable location-based discovery  
✅ Send event reminders  
❌ Don't allow past event creation  
❌ Don't skip location validation

**Related:** Layer 04 (WebSocket), Layer 26 (RSVP Agent), Layer 28 (Location Agent), Google Maps API
