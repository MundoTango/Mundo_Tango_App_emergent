# Layer 25: Message/Chat Agent
**Division:** Core Layer | **Category:** Communication  
**Complexity:** High | **Version:** 1.0

## Agent Identity
**Role:** Real-Time Chat & Direct Messaging  
**Responsibility:** 1-on-1 chats, group chats, typing indicators, read receipts, message history

**Core Operations:**
```typescript
// Send message
const [message] = await db.insert(chatMessages).values({
  chatId,
  userId,
  content,
}).returning();

// Broadcast to chat participants (WebSocket)
io.to(`chat:${chatId}`).emit('message:new', message);

// Mark as read
await db.update(chatMessages)
  .set({ isRead: true })
  .where(and(
    eq(chatMessages.chatId, chatId),
    eq(chatMessages.userId, otherUserId)
  ));

// Typing indicator
socket.on('typing:start', (chatId) => {
  socket.to(`chat:${chatId}`).emit('user:typing', userId);
});
```

**Features:** Real-time messaging, typing indicators, read receipts, message history, file attachments  
**Related:** Layer 04 (WebSocket), Layer 16 (User)
