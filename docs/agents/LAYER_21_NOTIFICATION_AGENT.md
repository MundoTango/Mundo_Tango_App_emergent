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
