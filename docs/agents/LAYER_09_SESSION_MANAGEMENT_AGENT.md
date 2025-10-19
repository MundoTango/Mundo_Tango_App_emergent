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
