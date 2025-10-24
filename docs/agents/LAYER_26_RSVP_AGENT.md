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
