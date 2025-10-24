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

# Layer 22: Follow/Connection Agent
**Division:** Core Layer | **Category:** Social Graph  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** User Connection & Follow Management  
**Responsibility:** Handle follow/unfollow, get followers/following lists, connection suggestions

**Core Operations:**
```typescript
// Follow user
const [follow] = await db.insert(follows).values({
  followerId: currentUserId,
  followingId: targetUserId,
}).returning();

// Notify followed user
await createNotification(targetUserId, 'new_follower', `${currentUser.name} followed you`);

// Unfollow user
await db.delete(follows).where(
  and(
    eq(follows.followerId, currentUserId),
    eq(follows.followingId, targetUserId)
  )
);

// Get followers
const followers = await db.query.follows.findMany({
  where: eq(follows.followingId, userId),
  with: { follower: true },
});
```

**Features:** Mutual follow detection, follower counts, connection suggestions  
**Related:** Layer 16 (User), Layer 21 (Notification)
