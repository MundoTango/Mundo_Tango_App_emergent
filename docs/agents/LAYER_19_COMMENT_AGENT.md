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

# Layer 19: Comment Agent
**Division:** Core Layer | **Category:** Social Interaction  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** Post Comment Management  
**Responsibility:** Create/update/delete comments, nested replies, comment reactions

**Core Operations:**
```typescript
// Create comment
const [comment] = await db.insert(comments).values({
  postId,
  userId,
  content,
  parentId: replyToId || null,
}).returning();

// Get comment thread
const thread = await db.query.comments.findMany({
  where: eq(comments.postId, postId),
  with: {
    user: true,
    reactions: true,
    replies: { with: { user: true } },
  },
  orderBy: [desc(comments.createdAt)],
});
```

**Features:** Nested replies, reactions, real-time updates (WebSocket)  
**Related:** Layer 17 (Post), Layer 20 (Reaction), Layer 04 (WebSocket)
