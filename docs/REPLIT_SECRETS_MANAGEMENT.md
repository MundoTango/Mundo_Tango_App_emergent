# Replit Secrets Management at Scale
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Audience:** All agents working with API keys and sensitive data

## Overview

Mundo Tango integrates with 10+ external services (OpenAI, Gemini, Anthropic, PostHog, Cloudinary, etc.), each requiring secure API keys and secrets. This guide covers best practices for managing secrets at scale on Replit.

---

## Current Secrets Inventory

**Platform Secrets (from environment):**
```bash
# AI/ML Services
ANTHROPIC_API_KEY        # Claude AI (Mr Blue, Life CEO agents)
GEMINI_API_KEY           # Google Gemini (multi-model routing)
OPENAI_API_KEY           # (Not currently set - would need if using GPT-4)

# Project Management
JIRA_API_TOKEN           # Jira integration
JIRA_DOMAIN              # Jira workspace URL
JIRA_EMAIL               # Jira user email

# Location Services
LOCATIONIQ_API_KEY       # Geolocation and maps

# 3D/Media
MESHY_API_KEY            # 3D avatar generation

# Database (Auto-provided by Replit)
DATABASE_URL             # Neon PostgreSQL connection
PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

# Replit Platform
REPL_ID, REPL_OWNER, REPL_SLUG, REPLIT_DOMAINS
```

**Missing Secrets (Need to Add):**
```bash
# Recommended additions:
POSTHOG_API_KEY          # Analytics (Task #48)
CLOUDINARY_URL           # Media storage (Task #67)
STRIPE_SECRET_KEY        # Payments (future)
SENDGRID_API_KEY         # Transactional emails (future)
JWT_SECRET               # Session signing (should rotate)
ENCRYPTION_KEY           # Data encryption at rest
```

---

## Secrets Management Patterns

### **1. Access via Environment Variables**

```typescript
// ✅ CORRECT: Access from process.env
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY - please set in Replit Secrets');
}

// Use the key
const client = new AnthropicClient(apiKey);
```

**Never:**
```typescript
// ❌ WRONG: Hardcoded
const apiKey = 'sk-ant-1234567890abcdef'; // NEVER DO THIS!

// ❌ WRONG: Committed to Git
// config.ts
export const config = {
  anthropicKey: 'sk-ant-...' // Git history exposes this forever!
};
```

---

### **2. Validation on Startup**

```typescript
// server/config.ts
interface Config {
  anthropic: { apiKey: string };
  gemini: { apiKey: string };
  database: { url: string };
  jira: { token: string; domain: string; email: string };
}

export function loadConfig(): Config {
  const required = [
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'DATABASE_URL',
    'JIRA_API_TOKEN',
    'JIRA_DOMAIN',
    'JIRA_EMAIL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set these in Replit Secrets (Tools → Secrets)');
    process.exit(1);
  }
  
  return {
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY! },
    gemini: { apiKey: process.env.GEMINI_API_KEY! },
    database: { url: process.env.DATABASE_URL! },
    jira: {
      token: process.env.JIRA_API_TOKEN!,
      domain: process.env.JIRA_DOMAIN!,
      email: process.env.JIRA_EMAIL!,
    },
  };
}

// server/index.ts
const config = loadConfig(); // Fails fast if secrets missing
```

---

### **3. Type-Safe Secret Access**

```typescript
// server/secrets.ts
import { z } from 'zod';

const secretsSchema = z.object({
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  GEMINI_API_KEY: z.string().min(20),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  JIRA_API_TOKEN: z.string(),
  JIRA_DOMAIN: z.string().url(),
  JIRA_EMAIL: z.string().email(),
  LOCATIONIQ_API_KEY: z.string().optional(),
  MESHY_API_KEY: z.string().optional(),
});

export type Secrets = z.infer<typeof secretsSchema>;

export function getSecrets(): Secrets {
  const result = secretsSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid secrets:', result.error.format());
    throw new Error('Secret validation failed');
  }
  
  return result.data;
}

// Usage
const secrets = getSecrets();
const anthropic = new AnthropicClient(secrets.ANTHROPIC_API_KEY);
```

**Benefits:**
- ✅ Compile-time type safety
- ✅ Runtime validation
- ✅ Clear error messages if secrets malformed

---

## Multi-Environment Secrets

### **Development vs Production**

```typescript
// Different secrets for different environments
const isDev = process.env.NODE_ENV === 'development';

const config = {
  openai: {
    apiKey: isDev 
      ? process.env.OPENAI_DEV_KEY  // Test key (limited quota)
      : process.env.OPENAI_PROD_KEY // Production key
  },
  database: {
    url: isDev
      ? process.env.DEV_DATABASE_URL  // Local/test DB
      : process.env.DATABASE_URL      // Production DB
  },
};
```

**Replit Environment Detection:**
```typescript
// Detect if running in Replit
const isReplit = process.env.REPL_ID !== undefined;

// Detect deployment vs development
const isDeployed = process.env.REPLIT_DEPLOYMENT !== undefined;

if (isDeployed) {
  // Use production secrets
} else {
  // Use development secrets
}
```

---

## Secret Rotation

### **When to Rotate:**
- 🔴 **Immediately:** Secret exposed in Git, logs, or error messages
- 🟡 **Quarterly:** Proactive rotation for high-security keys (payments, auth)
- 🟢 **Annually:** Low-risk keys (analytics, monitoring)

### **Rotation Process:**

**Step 1: Generate New Secret**
```bash
# Example: Rotate JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 32)
echo $NEW_JWT_SECRET
```

**Step 2: Add New Secret to Replit**
```
Replit UI → Tools → Secrets
Add: JWT_SECRET_NEW = <new value>
```

**Step 3: Support Both Keys (Transition Period)**
```typescript
// Verify with new key first, fallback to old
function verifyJWT(token: string): User | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_NEW!);
  } catch (err) {
    // Fallback to old key (for existing sessions)
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return null;
    }
  }
}
```

**Step 4: Wait for Transition (7-30 days)**
```
// All active sessions now use new key
// Old sessions expired naturally
```

**Step 5: Remove Old Secret**
```
Replit UI → Delete JWT_SECRET
Rename JWT_SECRET_NEW → JWT_SECRET
```

---

## Secrets in Frontend

### **❌ NEVER Expose Backend Secrets**

```typescript
// ❌ BAD: Exposing secret to client
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.ANTHROPIC_API_KEY': JSON.stringify(process.env.ANTHROPIC_API_KEY)
  }
});

// This makes the secret visible in client JavaScript!
// Anyone can see it in browser DevTools → Sources
```

---

### **✅ Use Public/Client-Specific Keys**

Some services provide separate client-side keys:

```typescript
// ✅ GOOD: Public keys safe for client
// PostHog public key (safe to expose)
export const posthogConfig = {
  apiKey: import.meta.env.VITE_POSTHOG_PUBLIC_KEY, // Prefixed with VITE_
  apiHost: 'https://app.posthog.com',
};

// Cloudinary public key (read-only)
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};
```

**Replit Secrets:**
```bash
# Backend (secret)
ANTHROPIC_API_KEY=sk-ant-...

# Frontend (public, prefixed with VITE_)
VITE_POSTHOG_PUBLIC_KEY=phc_...
VITE_CLOUDINARY_CLOUD_NAME=mundotango
```

---

### **✅ Proxy Through Backend**

```typescript
// ❌ BAD: Client calls AI directly
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': ANTHROPIC_API_KEY // Exposed!
  }
});

// ✅ GOOD: Client calls backend, backend uses secret
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { Authorization: `Bearer ${userToken}` },
  body: JSON.stringify({ message: 'Hello AI' })
});

// server/routes.ts
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  const { message } = req.body;
  
  // Backend uses secret (never exposed to client)
  const aiResponse = await anthropic.messages.create({
    model: 'claude-3-5-sonnet',
    messages: [{ role: 'user', content: message }],
  }, {
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY }
  });
  
  res.json(aiResponse);
});
```

---

## Secrets Leakage Prevention

### **1. Logging Sanitization**

```typescript
// ❌ BAD: Logging secrets
console.log('Config:', process.env); // Leaks all secrets!

// ✅ GOOD: Redact secrets
function sanitizeLogs(obj: any): any {
  const sanitized = { ...obj };
  const secretKeys = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'];
  
  for (const key in sanitized) {
    if (secretKeys.some(s => key.includes(s))) {
      sanitized[key] = '***REDACTED***';
    }
  }
  
  return sanitized;
}

console.log('Config:', sanitizeLogs(process.env));
// Output: { ANTHROPIC_API_KEY: '***REDACTED***', ... }
```

---

### **2. Error Message Sanitization**

```typescript
// ❌ BAD: Error exposes secret
try {
  await fetch('https://api.example.com', {
    headers: { Authorization: `Bearer ${process.env.SECRET_KEY}` }
  });
} catch (error) {
  console.error(error); // May contain Authorization header!
}

// ✅ GOOD: Sanitize error before logging
function sanitizeError(error: any): any {
  if (error.config?.headers?.Authorization) {
    error.config.headers.Authorization = '***REDACTED***';
  }
  return error;
}

try {
  await fetch(...);
} catch (error) {
  console.error(sanitizeError(error));
}
```

---

### **3. Git Pre-Commit Hooks**

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Scan for potential secrets
if git diff --cached | grep -E "(api[_-]?key|secret|password|token).*=.*['\"][a-zA-Z0-9]{20,}"; then
  echo "❌ Potential secret detected in commit!"
  echo "Please remove hardcoded secrets and use Replit Secrets instead."
  exit 1
fi

exit 0
```

**Install:**
```bash
chmod +x .git/hooks/pre-commit
```

---

## Secrets in CI/CD

**Replit Deployments:**
Secrets automatically available in deployed environments (no extra config needed).

**External CI/CD (GitHub Actions, etc.):**

```yaml
# .github/workflows/test.yml
name: Test

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        env:
          # GitHub Secrets → CI environment
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
        run: npm test
```

**Add secrets in GitHub:**
```
Repository → Settings → Secrets → Actions
Add: ANTHROPIC_API_KEY, DATABASE_URL, etc.
```

---

## Secrets Audit and Compliance

### **Regular Audit Checklist:**

**Monthly:**
- [ ] Review all active secrets in Replit
- [ ] Remove unused/expired secrets
- [ ] Verify no secrets in Git history
- [ ] Check logs for accidental exposure

**Quarterly:**
- [ ] Rotate high-risk secrets (payments, auth)
- [ ] Audit secret access (who has access?)
- [ ] Update documentation (this file!)

**Annually:**
- [ ] Full security review
- [ ] Penetration testing
- [ ] Compliance check (GDPR, SOC2, etc.)

---

### **Secret Access Tracking**

```typescript
// Log when secrets are accessed (audit trail)
function getSecret(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(`Secret ${key} not found`);
  }
  
  // Audit log (send to monitoring)
  auditLog.info('secret_access', {
    key,
    timestamp: new Date(),
    service: 'mundo-tango',
    environment: process.env.NODE_ENV,
  });
  
  return value;
}

// Usage
const anthropicKey = getSecret('ANTHROPIC_API_KEY');
```

---

## Integration with ask_secrets Tool

**When a new secret is needed:**

1. **Agent detects missing secret:**
```typescript
const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
  // Use ask_secrets tool to request from user
  throw new Error('OPENAI_API_KEY required - agent should use ask_secrets tool');
}
```

2. **Agent calls ask_secrets tool:**
```typescript
ask_secrets({
  secret_keys: ['OPENAI_API_KEY'],
  user_message: 'To enable OpenAI integration for Mr Blue AI chat, we need your OpenAI API key. You can get this from https://platform.openai.com/api-keys. This key will be used to power AI conversations with GPT-4.'
});
```

3. **User adds secret via Replit UI**
4. **Agent verifies and continues:**
```typescript
const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
  throw new Error('Still missing OPENAI_API_KEY');
}
console.log('✅ OpenAI API key configured');
```

---

## Best Practices Summary

**DO:**
- ✅ Store all secrets in Replit Secrets (Tools → Secrets)
- ✅ Validate secrets on application startup
- ✅ Use type-safe secret access (Zod schemas)
- ✅ Rotate secrets regularly
- ✅ Sanitize logs and error messages
- ✅ Use separate dev/prod secrets
- ✅ Proxy client requests through backend

**DON'T:**
- ❌ Commit secrets to Git (NEVER!)
- ❌ Log secrets to console/files
- ❌ Expose backend secrets to frontend
- ❌ Hardcode secrets in code
- ❌ Share secrets via email/Slack
- ❌ Reuse secrets across services
- ❌ Store secrets in database

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
```typescript
// Verify all required secrets present
const requiredSecrets = ['ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'DATABASE_URL'];
const missing = requiredSecrets.filter(k => !process.env[k]);

if (missing.length > 0) {
  console.error(`❌ Missing secrets: ${missing.join(', ')}`);
  process.exit(1);
}
```

**AGENT_CERTIFICATION:**
- Level 2 agents must understand secret management
- Level 3 agents can rotate secrets
- Level 4 agents design secret architecture

---

**Document Owner:** Security Layer (Layer #12) + Platform Division  
**Review Cycle:** Monthly  
**Last Updated:** October 19, 2025
