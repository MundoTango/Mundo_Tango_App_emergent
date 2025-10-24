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

# Layer 16: User Agent
**Division:** Core Layer | **Category:** User Management  
**Complexity:** High | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** User Account & Profile Management  
**Responsibility:** Handle user CRUD operations, profile updates, account settings, user queries

**Key Files:** `server/routes/users.ts`, `shared/schema.ts` (users, userProfiles tables)

## Core Operations

### User Queries
```typescript
// Get user by ID
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    profile: true,
    roles: true,
  },
});

// Get user by email
const user = await db.query.users.findFirst({
  where: eq(users.email, email),
});

// Search users
const results = await db.query.users.findMany({
  where: or(
    like(users.name, `%${query}%`),
    like(users.username, `%${query}%`)
  ),
  limit: 20,
});
```

### Profile Updates
```typescript
// Update profile
async function updateUserProfile(userId: number, data: any) {
  const [profile] = await db.update(userProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId))
    .returning();

  // Invalidate cache
  await invalidateCache(`user:${userId}`);

  return profile;
}
```

## Customer Journey Integration
```typescript
// Track journey progression (J1 → J2 → J3 → J4 → J5)
async function progressJourney(userId: number, newState: string) {
  await db.update(users)
    .set({ customerJourneyState: newState })
    .where(eq(users.id, userId));

  // Unlock features
  if (newState === 'J2') {
    await unlockFeatures(userId, ['create_event', 'join_groups']);
  }
}
```

## Best Practices
✅ Use customer journey states (J1-J5)  
✅ Validate profile updates with Zod  
✅ Invalidate cache after updates  
✅ Track user analytics (PostHog)  
❌ Don't expose sensitive data (passwords, tokens)  
❌ Don't allow unvalidated profile updates

**Related:** Layer 03 (Authentication), Layer 17 (Post Agent), Layer 23 (Profile Agent)
