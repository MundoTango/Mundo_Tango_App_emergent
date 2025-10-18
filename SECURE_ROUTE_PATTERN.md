# Secure Route Pattern - Mundo Tango

**Purpose:** Establish security best practices for API route development  
**Applies To:** All backend routes in `/server/routes/`  
**Created:** October 18, 2025  
**Status:** ACTIVE - All Phase 11 routes follow this pattern

---

## Executive Summary

This document defines the **Secure Route Pattern** - a standardized approach to building production-grade API routes with built-in security, validation, error handling, and performance monitoring. All routes developed during Phase 11 backend completion follow this pattern.

**Key Principles:**
- **Security by Default:** Authentication, authorization, input validation
- **Fail Securely:** Errors don't expose sensitive information
- **Performance Monitoring:** Response times tracked
- **Type Safety:** TypeScript + Zod validation
- **Direct Database Access:** No abstraction layers (Drizzle ORM directly)

---

## Standard Route Structure

### Template

```typescript
import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@db';
import * as schema from '@shared/schema';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../utils/rateLimiter';

const router = Router();

// ============================================
// ROUTE: POST /api/resource
// PURPOSE: Create a new resource
// AUTH: Required
// RATE LIMIT: 10 requests / minute
// ============================================

router.post(
  '/resource',
  authenticateToken,           // 1. Authentication
  rateLimiter(10, 60),         // 2. Rate limiting
  async (req, res) => {
    try {
      // 3. Input validation (Zod schema)
      const createSchema = z.object({
        field1: z.string().min(1).max(255),
        field2: z.number().positive(),
        field3: z.enum(['option1', 'option2']).optional(),
      });
      
      const validatedData = createSchema.parse(req.body);
      
      // 4. Authorization check (if needed)
      if (req.user!.id !== validatedData.userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden - Access denied'
        });
      }
      
      // 5. Business logic
      const newResource = await db.insert(schema.resources)
        .values({
          ...validatedData,
          createdBy: req.user!.id,
          createdAt: new Date(),
        })
        .returning();
      
      // 6. Success response
      res.status(201).json({
        success: true,
        data: newResource[0]
      });
      
    } catch (error) {
      // 7. Error handling
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      console.error('[POST /api/resource] Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

export default router;
```

---

## Security Layers

### Layer 1: Authentication

**Middleware:** `authenticateToken`  
**Purpose:** Verify user identity via JWT  
**Location:** `server/middleware/auth.ts`

**Implementation:**
```typescript
import { authenticateToken } from '../middleware/auth';

router.post('/protected-route', authenticateToken, async (req, res) => {
  // req.user is guaranteed to exist here
  const userId = req.user!.id;
  // ... route logic
});
```

**What It Does:**
1. Extracts JWT from `Authorization: Bearer <token>` header
2. Verifies token signature with `JWT_SECRET`
3. Checks token expiration
4. Attaches user object to `req.user`
5. Rejects invalid/expired tokens with 401 Unauthorized

**User Object:**
```typescript
req.user = {
  id: number;
  email: string;
  username: string | null;
  role: 'user' | 'admin' | 'super_admin';
}
```

### Layer 2: Rate Limiting

**Middleware:** `rateLimiter(max, windowSeconds)`  
**Purpose:** Prevent abuse and DDoS  
**Location:** `server/utils/rateLimiter.ts`

**Usage Examples:**
```typescript
// Strict: Authentication endpoints
router.post('/login', rateLimiter(5, 60), ...);  // 5 per minute

// Moderate: Write operations
router.post('/posts', rateLimiter(10, 60), ...);  // 10 per minute

// Lenient: Read operations
router.get('/feed', rateLimiter(100, 60), ...);  // 100 per minute
```

**Configuration by Route Type:**
- **Auth/Password:** 5 requests/minute
- **Create/Update:** 10 requests/minute
- **Search/Filter:** 30 requests/minute
- **Read/Get:** 100 requests/minute

### Layer 3: Input Validation

**Library:** Zod  
**Purpose:** Type-safe input validation  
**Pattern:** Validate before database operations

**Best Practices:**

**1. Define Schema Inline or Import:**
```typescript
// Option A: Inline schema
const updateSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(10000).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

// Option B: Import from shared/schema.ts
import { insertMemorySchema } from '@shared/schema';
const validatedData = insertMemorySchema.parse(req.body);
```

**2. Handle Validation Errors:**
```typescript
try {
  const validated = schema.parse(req.body);
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors  // Detailed field-level errors
    });
  }
}
```

**3. Common Validation Patterns:**
```typescript
// String constraints
title: z.string().min(1).max(255).trim()

// Email validation
email: z.string().email()

// Enums
visibility: z.enum(['public', 'friends', 'private'])

// Arrays
tags: z.array(z.string()).min(1).max(10)

// Optional with default
featured: z.boolean().optional().default(false)

// Custom validation
username: z.string().refine(
  (val) => /^[a-zA-Z0-9_]+$/.test(val),
  'Username must be alphanumeric with underscores only'
)

// Nested objects
location: z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  name: z.string().optional(),
}).optional()
```

### Layer 4: Authorization (RBAC/ABAC)

**Purpose:** Verify user has permission for action  
**Pattern:** Check after authentication, before business logic

**Role-Based Access Control (RBAC):**
```typescript
// Admin-only routes
router.delete('/users/:id', authenticateToken, async (req, res) => {
  if (req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - Admin access required'
    });
  }
  // ... admin logic
});
```

**Attribute-Based Access Control (ABAC):**
```typescript
// Resource ownership check
router.put('/posts/:id', authenticateToken, async (req, res) => {
  const post = await db.query.memories.findFirst({
    where: eq(schema.memories.id, parseInt(req.params.id))
  });
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Only post author or admin can edit
  if (post.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - You can only edit your own posts'
    });
  }
  
  // ... update logic
});
```

**Group Membership Authorization:**
```typescript
// Check group membership
const membership = await db.query.groupMembers.findFirst({
  where: and(
    eq(schema.groupMembers.groupId, groupId),
    eq(schema.groupMembers.userId, req.user!.id)
  )
});

if (!membership) {
  return res.status(403).json({
    success: false,
    error: 'Forbidden - You must be a group member'
  });
}

// Check specific role within group
if (membership.role !== 'admin') {
  return res.status(403).json({
    success: false,
    error: 'Forbidden - Admin access required'
  });
}
```

### Layer 5: SSRF Protection

**Purpose:** Prevent Server-Side Request Forgery attacks  
**Pattern:** Validate URLs before fetching external resources

**Protected Endpoints:**
```typescript
// Image proxy endpoints
// Event link unfurling
// Any external URL fetching
```

**Validation:**
```typescript
function validateUrlSafety(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Block private IPs
    const privateRanges = [
      '127.0.0.0/8',    // localhost
      '10.0.0.0/8',     // private
      '172.16.0.0/12',  // private
      '192.168.0.0/16', // private
      '169.254.0.0/16', // link-local
    ];
    
    // Block internal services
    const blockedHosts = ['metadata.google.internal', 'localhost'];
    
    if (blockedHosts.includes(parsed.hostname)) {
      return false;
    }
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Usage
if (!validateUrlSafety(imageUrl)) {
  return res.status(400).json({
    success: false,
    error: 'Invalid or unsafe URL'
  });
}
```

---

## Error Handling

### Standard Error Response Format

```typescript
{
  "success": false,
  "error": "Human-readable error message",
  "details": [...],  // Optional: validation errors, etc.
  "code": "ERROR_CODE"  // Optional: machine-readable code
}
```

### Error Categories

**1. Validation Errors (400 Bad Request)**
```typescript
return res.status(400).json({
  success: false,
  error: 'Validation failed',
  details: zodError.errors
});
```

**2. Authentication Errors (401 Unauthorized)**
```typescript
return res.status(401).json({
  success: false,
  error: 'Authentication required'
});
```

**3. Authorization Errors (403 Forbidden)**
```typescript
return res.status(403).json({
  success: false,
  error: 'Forbidden - Access denied'
});
```

**4. Not Found Errors (404)**
```typescript
return res.status(404).json({
  success: false,
  error: 'Resource not found'
});
```

**5. Server Errors (500 Internal Server Error)**
```typescript
console.error('[POST /api/endpoint] Error:', error);
return res.status(500).json({
  success: false,
  error: 'Internal server error'
});
// NEVER expose error details in production
```

### Error Logging

**What to Log:**
```typescript
console.error('[METHOD /api/endpoint] Error:', {
  message: error.message,
  stack: error.stack,
  userId: req.user?.id,
  params: req.params,
  timestamp: new Date().toISOString()
});
```

**What NOT to Log:**
- Passwords
- JWT tokens
- API keys
- Credit card numbers
- Personal identification numbers

---

## Success Response Format

### Standard Success Response

```typescript
{
  "success": true,
  "data": { ... },  // The actual data
  "meta": { ... }   // Optional: pagination, counts, etc.
}
```

### Examples

**Single Resource:**
```typescript
res.status(200).json({
  success: true,
  data: {
    id: 123,
    title: "My Post",
    content: "...",
    createdAt: "2025-10-18T10:00:00Z"
  }
});
```

**List with Pagination:**
```typescript
res.status(200).json({
  success: true,
  data: [
    { id: 1, ... },
    { id: 2, ... },
  ],
  meta: {
    total: 45,
    page: 1,
    limit: 20,
    hasMore: true
  }
});
```

**Creation Response:**
```typescript
res.status(201).json({
  success: true,
  data: newResource
});
```

**Deletion Response:**
```typescript
res.status(200).json({
  success: true,
  message: 'Resource deleted successfully'
});
```

---

## Database Patterns

### Direct Drizzle Queries (Recommended)

**Why Direct Queries:**
- Better performance (no abstraction overhead)
- Type safety with TypeScript
- Clearer data flow
- Easier to optimize

**Insert:**
```typescript
const newPost = await db.insert(schema.memories)
  .values({
    userId: req.user!.id,
    content: validated.content,
    visibility: validated.visibility,
    createdAt: new Date(),
  })
  .returning();
```

**Select:**
```typescript
const post = await db.query.memories.findFirst({
  where: eq(schema.memories.id, postId),
  with: {
    user: {
      columns: { id: true, username: true, profilePicture: true }
    }
  }
});
```

**Update:**
```typescript
const updated = await db.update(schema.memories)
  .set({
    content: validated.content,
    updatedAt: new Date(),
  })
  .where(eq(schema.memories.id, postId))
  .returning();
```

**Delete:**
```typescript
await db.delete(schema.memories)
  .where(eq(schema.memories.id, postId));
```

### Complex Queries

**With Joins:**
```typescript
const feed = await db.query.memories.findMany({
  where: and(
    eq(schema.memories.visibility, 'public'),
    gte(schema.memories.createdAt, yesterday)
  ),
  with: {
    user: true,
    likes: true,
    comments: {
      limit: 3,
      orderBy: desc(schema.comments.createdAt)
    }
  },
  orderBy: desc(schema.memories.createdAt),
  limit: 20
});
```

**Aggregations:**
```typescript
const stats = await db
  .select({
    count: sql<number>`count(*)`,
    avgLikes: sql<number>`avg(like_count)`
  })
  .from(schema.memories)
  .where(eq(schema.memories.userId, userId));
```

---

## Performance Optimization

### 1. Pagination

**Cursor-Based (Recommended for feeds):**
```typescript
router.get('/feed', authenticateToken, async (req, res) => {
  const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : null;
  const limit = 20;
  
  const memories = await db.query.memories.findMany({
    where: cursor ? lt(schema.memories.id, cursor) : undefined,
    orderBy: desc(schema.memories.id),
    limit: limit + 1  // Fetch one extra to check if there's more
  });
  
  const hasMore = memories.length > limit;
  const data = hasMore ? memories.slice(0, limit) : memories;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  
  res.json({
    success: true,
    data,
    meta: { nextCursor, hasMore }
  });
});
```

**Offset-Based (For simple lists):**
```typescript
const page = parseInt(req.query.page as string) || 1;
const limit = 20;
const offset = (page - 1) * limit;

const [data, [{ count }]] = await Promise.all([
  db.query.memories.findMany({
    limit,
    offset,
    orderBy: desc(schema.memories.createdAt)
  }),
  db.select({ count: sql<number>`count(*)` }).from(schema.memories)
]);

res.json({
  success: true,
  data,
  meta: {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  }
});
```

### 2. Response Time Monitoring

**Middleware:** Already included globally  
**Usage:** Automatic via `server/middleware/responseTime.ts`

**Manual Timing:**
```typescript
const startTime = Date.now();

// ... route logic ...

const duration = Date.now() - startTime;
console.log(`[GET /api/feed] Response time: ${duration}ms`);
```

### 3. Caching Strategies

**Not Implemented Yet - Future Enhancement**

Planned patterns:
- Redis caching for frequently accessed data
- ETags for HTTP caching
- Cache invalidation on mutations

---

## Security Checklist

Use this checklist for every new route:

- [ ] Authentication middleware added (`authenticateToken`)
- [ ] Rate limiting configured appropriately
- [ ] Input validation with Zod schema
- [ ] Authorization checks for protected resources
- [ ] SSRF protection for external URLs
- [ ] Error handling with try/catch
- [ ] Sensitive data not logged
- [ ] Success/error response format standardized
- [ ] No userId=7 auth bypasses (development shortcuts removed)
- [ ] Direct database queries (no mock data)
- [ ] TypeScript types defined
- [ ] No console.log debugging left in code

---

## Examples from Production Routes

### Example 1: POST /api/memories (Memory Creation)

**File:** `server/routes/memoryRoutes.ts`

**Security Features:**
- ✅ Authentication required
- ✅ Rate limit: 10/minute
- ✅ Zod validation
- ✅ SSRF protection on media URLs
- ✅ Hashtag sanitization
- ✅ Location validation

### Example 2: POST /api/groups/:slug/join (Group Membership)

**File:** `server/routes/groupRoutes.ts`

**Security Features:**
- ✅ Authentication required
- ✅ Rate limit: 10/minute
- ✅ Authorization: Check existing membership
- ✅ Authorization: Respect group privacy settings
- ✅ Duplicate prevention
- ✅ Transaction safety

### Example 3: POST /api/messages (Direct Messages)

**File:** `server/routes/messagesRoutes.ts`

**Security Features:**
- ✅ Authentication required
- ✅ Rate limit: 20/minute
- ✅ Zod validation
- ✅ Authorization: Can't message blocked users
- ✅ Authorization: Respect privacy settings
- ✅ Content length limits
- ✅ Real-time WebSocket integration

---

## Related Documentation

- `MT_MASTER_REBUILD_PLAN.md` - Overall project architecture
- `DEPLOYMENT_STABILITY_PLAN.md` - File integrity protection
- `FILE_DELETION_INCIDENT_REPORT.md` - Security incident reports
- `replit.md` - Project overview

---

**Document Status:** ACTIVE  
**Last Updated:** October 18, 2025  
**Applies To:** All routes in Phase 11 and beyond  
**Maintained By:** Backend Team + Layer 52 Documentation Agent
