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

# Layer 21: Notification Agent
**Division:** Core Layer | **Category:** User Communication  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** Real-Time Notification Management  
**Responsibility:** Create notifications, mark as read, real-time delivery via WebSocket

**Core Operations:**
```typescript
// Create notification
async function createNotification(userId: number, type: string, content: string, metadata?: any) {
  const [notification] = await db.insert(notifications).values({
    userId,
    type,
    content,
    metadata,
  }).returning();

  // Send via WebSocket
  io.to(`user:${userId}`).emit('notification', notification);

  return notification;
}

// Mark as read
await db.update(notifications)
  .set({ isRead: true })
  .where(eq(notifications.id, notificationId));
```

**Notification Types:** new_post, new_comment, new_follower, event_reminder, like, mention  
**Features:** Real-time delivery, unread count, batch mark as read  
**Related:** Layer 04 (WebSocket), Layer 16 (User)
