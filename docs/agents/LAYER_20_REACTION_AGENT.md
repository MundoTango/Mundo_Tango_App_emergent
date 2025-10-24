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

# Layer 20: Reaction Agent
**Division:** Core Layer | **Category:** Social Interaction  
**Complexity:** Low | **Version:** 1.0

## Agent Identity
**Role:** Like/Reaction Management  
**Responsibility:** Track likes/reactions on posts and comments, update reaction counts

**Core Operations:**
```typescript
// Toggle like
const existing = await db.query.reactions.findFirst({
  where: and(
    eq(reactions.postId, postId),
    eq(reactions.userId, userId)
  ),
});

if (existing) {
  await db.delete(reactions).where(eq(reactions.id, existing.id));
} else {
  await db.insert(reactions).values({ postId, userId, type: 'like' });
}

// Update count
await db.update(posts)
  .set({ likeCount: sql`${posts.likeCount} + ${existing ? -1 : 1}` })
  .where(eq(posts.id, postId));
```

**Features:** Like/unlike toggle, reaction counts, optimistic updates (client)  
**Related:** Layer 17 (Post), Layer 19 (Comment)
