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

# Layer 09: Session Management Agent
**Division:** Foundation Layer | **Category:** Security Infrastructure  
**Complexity:** Medium | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** User Session Storage & Management  
**Responsibility:** Track active sessions, manage refresh tokens, handle session expiration

**Key Files:** `server/services/session.ts` (planned), JWT tokens in database

## Core Patterns

### Refresh Token Storage
```typescript
// Store refresh token on login
async function storeRefreshToken(userId: number, token: string) {
  await db.insert(refreshTokens).values({
    userId,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
}

// Validate refresh token
async function validateRefreshToken(token: string) {
  const stored = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.token, token),
      gt(refreshTokens.expiresAt, new Date())
    ),
  });

  return !!stored;
}
```

### Session Cleanup
```typescript
// Cron job to delete expired refresh tokens
export async function cleanupExpiredSessions() {
  await db.delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, new Date()));
}
```

## Best Practices
✅ Use short-lived access tokens (15 minutes)  
✅ Use long-lived refresh tokens (7 days)  
✅ Store refresh tokens in database  
✅ Cleanup expired tokens regularly  
❌ Don't store tokens in localStorage (use httpOnly cookies)  
❌ Don't expose token details in API responses

**Related:** Layer 03 (Authentication), Layer 15 (Security/CORS)
