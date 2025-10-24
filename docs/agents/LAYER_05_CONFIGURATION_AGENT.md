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

# Layer 05: Configuration Agent
**Division:** Foundation Layer | **Category:** System Infrastructure  
**Complexity:** Medium | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Environment & Configuration Management  
**Responsibility:** Manage environment variables, secrets, feature flags, and application configuration

**Key Files:** `.env`, `server/config.ts`, Environment variable access patterns

## Core Patterns

### Environment Variables
```typescript
// Access environment variables
const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiration: process.env.JWT_EXPIRATION || '15m',
  },
  external: {
    openaiKey: process.env.OPENAI_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY,
  },
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000'),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5000',
  },
};
```

### Feature Flags
```typescript
export const features = {
  enablePostHog: process.env.POSTHOG_ENABLE === 'true',
  enableCloudinary: process.env.CLOUDINARY_ENABLE === 'true',
  enableN8N: process.env.N8N_ENABLE === 'true',
};
```

## Best Practices
✅ Use `.env` for local development  
✅ Use Replit Secrets for production  
✅ Validate required variables on startup  
✅ Use type-safe config objects  
❌ Don't commit `.env` to git  
❌ Don't expose secrets in error messages

**Related:** Layer 03 (Authentication), Layer 15 (Security/CORS)
