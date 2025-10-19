# Layer 14: Rate Limiting Agent
**Division:** Foundation Layer | **Category:** Security Infrastructure  
**Complexity:** Medium | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** API Rate Limiting & Abuse Prevention  
**Responsibility:** Prevent API abuse, limit request rates, protect against DDoS

**Key Files:** `server/middleware/rateLimit.ts` (planned)

## Core Patterns

### Rate Limiter Middleware
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
});

// Usage
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
```

### Redis-Based Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

## Rate Limits by Endpoint
- `/api/auth/login` - 5 requests / 15 min
- `/api/auth/register` - 3 requests / hour
- `/api/posts` - 100 requests / 15 min
- `/api/upload/*` - 10 uploads / hour
- `/api/*` - 100 requests / 15 min (general)

**Related:** Layer 03 (Authentication), Layer 15 (Security/CORS)
