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
