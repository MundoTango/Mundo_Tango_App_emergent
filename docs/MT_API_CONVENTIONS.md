# Mundo Tango API Conventions
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Active - Mandatory for all API development

## Overview

This document defines the REST API conventions, request/response patterns, authentication, and error handling for Mundo Tango's backend (Express.js + TypeScript).

**Current Scale:**
- 100-150 RESTful API endpoints
- JWT-based authentication
- WebSocket for real-time features

---

## API Design Principles

### **1. RESTful Resource-Oriented**

**Resources (nouns, not verbs):**
- `/api/users` - User collection
- `/api/posts` - Post collection
- `/api/groups` - Group collection

**HTTP Methods (actions):**
- `GET` - Retrieve resource(s)
- `POST` - Create new resource
- `PATCH` - Update existing resource (partial)
- `PUT` - Replace existing resource (full)
- `DELETE` - Delete resource

---

### **2. Consistent URL Structure**

```
/api/{resource}              - Collection (list all)
/api/{resource}/{id}         - Specific resource
/api/{resource}/{id}/{sub}   - Sub-resource

Examples:
GET    /api/posts              - List posts
GET    /api/posts/123          - Get specific post
POST   /api/posts              - Create post
PATCH  /api/posts/123          - Update post
DELETE /api/posts/123          - Delete post

GET    /api/posts/123/comments - List comments on post
POST   /api/posts/123/comments - Add comment to post
```

**Naming Rules:**
- ✅ Use plural nouns (`/api/users`, not `/api/user`)
- ✅ Use kebab-case (`/api/city-groups`, not `/api/cityGroups`)
- ✅ Keep URLs short and readable
- ❌ Don't use verbs (`/api/getUserProfile` ← BAD)

---

## Standard Endpoints

### **1. List Resources (GET Collection)**

```typescript
// GET /api/posts?page=1&limit=20&sort=-createdAt&filter=public

router.get('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const sortParam = req.query.sort as string || '-createdAt';
    const filter = req.query.filter as string;
    
    // ⚠️ SECURITY: Whitelist sortable fields (prevent SQL injection)
    const sortableFields = {
      'createdAt': posts.createdAt,
      '-createdAt': posts.createdAt,
      'title': posts.title,
      '-title': posts.title,
      'updatedAt': posts.updatedAt,
      '-updatedAt': posts.updatedAt,
    } as const;
    
    // Validate sort field
    const sortField = sortableFields[sortParam as keyof typeof sortableFields];
    if (!sortField) {
      return res.status(400).json(apiError('Invalid sort field', 400));
    }
    
    const orderBy = sortParam.startsWith('-') 
      ? [desc(sortField)]
      : [asc(sortField)];
    
    // Fetch data
    const postsData = await db.query.posts.findMany({
      where: filter ? eq(posts.privacy, filter) : undefined,
      limit,
      offset: (page - 1) * limit,
      orderBy,
    });
    
    // Get total count for pagination
    const [{ total }] = await db.select({ total: sql<number>`count(*)` })
      .from(posts)
      .where(filter ? eq(posts.privacy, filter) : undefined);
    
    // Return with pagination metadata
    res.json(apiSuccess({
      data: postsData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }));
  } catch (error) {
    next(error);
  }
});
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "Post 1", "..." },
    { "id": 2, "title": "Post 2", "..." }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### **2. Get Single Resource (GET Item)**

```typescript
// GET /api/posts/:id

router.get('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json(apiError('Invalid post ID', 400));
    }
    
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        user: true,
        comments: true,
      },
    });
    
    if (!post) {
      return res.status(404).json(apiError('Post not found', 404));
    }
    
    // Authorization check
    if (post.privacy === 'private' && post.userId !== req.user.id) {
      return res.status(403).json(apiError('Access denied', 403));
    }
    
    res.json(apiSuccess(post));
  } catch (error) {
    next(error);
  }
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Post",
    "content": "...",
    "user": { "id": 5, "name": "Alice" },
    "comments": [...]
  }
}
```

---

### **3. Create Resource (POST)**

```typescript
// POST /api/posts

import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  privacy: z.enum(['public', 'friends', 'private']).default('public'),
});

router.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    // Validate request body
    const data = createPostSchema.parse(req.body);
    
    // Create resource
    const [post] = await db.insert(posts).values({
      ...data,
      userId: req.user.id, // From auth middleware
    }).returning();
    
    // Return created resource with 201 status
    res.status(201).json(apiSuccess(post));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(apiError('Validation failed', 400, error.errors));
    }
    next(error);
  }
});
```

**Request:**
```json
{
  "title": "My First Post",
  "content": "Hello world!",
  "privacy": "public"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "My First Post",
    "content": "Hello world!",
    "privacy": "public",
    "userId": 5,
    "createdAt": "2025-10-19T12:00:00Z"
  }
}
```

---

### **4. Update Resource (PATCH)**

```typescript
// PATCH /api/posts/:id

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  privacy: z.enum(['public', 'friends', 'private']).optional(),
});

router.patch('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const data = updatePostSchema.parse(req.body);
    
    // Check ownership
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });
    
    if (!post) {
      return res.status(404).json(apiError('Post not found', 404));
    }
    
    if (post.userId !== req.user.id) {
      return res.status(403).json(apiError('Access denied', 403));
    }
    
    // Update
    const [updated] = await db.update(posts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();
    
    res.json(apiSuccess(updated));
  } catch (error) {
    next(error);
  }
});
```

**Request:**
```json
{
  "title": "Updated Title"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Updated Title",
    "content": "...",
    "updatedAt": "2025-10-19T12:30:00Z"
  }
}
```

---

### **5. Delete Resource (DELETE)**

```typescript
// DELETE /api/posts/:id

router.delete('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Check ownership
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });
    
    if (!post) {
      return res.status(404).json(apiError('Post not found', 404));
    }
    
    if (post.userId !== req.user.id) {
      return res.status(403).json(apiError('Access denied', 403));
    }
    
    // Soft delete (recommended for important data)
    await db.update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, postId));
    
    // Or hard delete
    // await db.delete(posts).where(eq(posts.id, postId));
    
    res.status(204).send(); // No content
  } catch (error) {
    next(error);
  }
});
```

**Response (204 No Content):**
```
(empty body)
```

---

## Request/Response Patterns

### **1. Success Response (apiSuccess)**

```typescript
// server/utils/apiResponse.ts
export function apiSuccess<T>(data: T, meta?: Record<string, any>) {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

// Usage
res.json(apiSuccess({ id: 1, name: 'Alice' }));

// With metadata
res.json(apiSuccess(posts, { page: 1, total: 100 }));
```

**Standard Structure:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "meta": { /* optional metadata */ }
}
```

---

### **2. Error Response (apiError)**

```typescript
// server/utils/apiResponse.ts
export function apiError(message: string, statusCode: number, details?: any) {
  return {
    success: false,
    error: {
      message,
      statusCode,
      ...(details && { details }),
    },
  };
}

// Usage
res.status(400).json(apiError('Invalid input', 400));
res.status(404).json(apiError('User not found', 404));
res.status(403).json(apiError('Access denied', 403));
```

**Standard Structure:**
```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "statusCode": 404,
    "details": { /* optional details */ }
  }
}
```

---

## HTTP Status Codes

### **Success (2xx)**

- **200 OK** - Request successful (GET, PATCH, PUT)
- **201 Created** - Resource created (POST)
- **204 No Content** - Request successful, no body (DELETE)

---

### **Client Errors (4xx)**

- **400 Bad Request** - Invalid input, validation failed
- **401 Unauthorized** - Not authenticated (missing/invalid token)
- **403 Forbidden** - Authenticated but not authorized
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity** - Validation error (use 400 instead for simplicity)
- **429 Too Many Requests** - Rate limit exceeded

---

### **Server Errors (5xx)**

- **500 Internal Server Error** - Unexpected error
- **503 Service Unavailable** - Service temporarily down (maintenance)

---

## Authentication & Authorization

### **1. JWT Authentication**

```typescript
// server/middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(apiError('Missing authentication token', 401));
    }
    
    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    
    // Load user
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });
    
    if (!user) {
      return res.status(401).json(apiError('Invalid token', 401));
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(apiError('Invalid token', 401));
  }
}
```

**Usage:**
```typescript
router.get('/api/profile', authMiddleware, (req, res) => {
  res.json(apiSuccess(req.user)); // req.user available
});
```

---

### **2. Role-Based Authorization**

```typescript
// server/middleware/roleMiddleware.ts
export function roleMiddleware(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json(apiError('Access denied', 403));
    }
    next();
  };
}

// Usage
router.delete('/api/admin/users/:id', 
  authMiddleware, 
  roleMiddleware('admin'), 
  async (req, res) => {
    // Only admins can access
  }
);
```

---

### **3. Resource Ownership Check**

```typescript
// Check if user owns the resource
async function checkPostOwnership(postId: number, userId: number): Promise<boolean> {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });
  
  return post?.userId === userId;
}

// Usage
router.patch('/api/posts/:id', authMiddleware, async (req, res) => {
  const postId = parseInt(req.params.id);
  
  if (!await checkPostOwnership(postId, req.user.id)) {
    return res.status(403).json(apiError('Access denied', 403));
  }
  
  // Proceed with update
});
```

---

## Input Validation (Zod)

### **1. Request Body Validation**

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  age: z.number().int().min(0).max(150),
  bio: z.string().max(1000).optional(),
});

router.post('/api/users', async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    
    // data is now type-safe and validated
    const user = await createUser(data);
    
    res.status(201).json(apiSuccess(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(apiError('Validation failed', 400, error.errors));
    }
    next(error);
  }
});
```

**Validation Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "details": [
      {
        "path": ["email"],
        "message": "Invalid email address"
      },
      {
        "path": ["age"],
        "message": "Number must be greater than or equal to 0"
      }
    ]
  }
}
```

---

### **2. Query Parameter Validation**

```typescript
const listPostsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  sort: z.enum(['createdAt', '-createdAt', 'title', '-title']).default('-createdAt'),
});

router.get('/api/posts', async (req, res) => {
  const params = listPostsQuerySchema.parse(req.query);
  
  // params is type-safe: { page: number, limit: number, sort: string }
});
```

---

## Rate Limiting

```typescript
// server/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 min
  message: 'Too many login attempts, please try again later',
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

---

## CORS Configuration

```typescript
// server/middleware/cors.ts
import cors from 'cors';

const isDev = process.env.NODE_ENV === 'development';

export const corsMiddleware = cors({
  origin: isDev 
    ? '*' // Allow all in development
    : process.env.REPLIT_DOMAINS?.split(','), // Whitelist in production
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.use(corsMiddleware);
```

---

## Error Handling

### **Centralized Error Handler**

```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', error);
  
  // Log to Sentry (production)
  if (process.env.NODE_ENV === 'production') {
    logToSentry(error);
  }
  
  // Determine response
  if (error.name === 'ValidationError') {
    return res.status(400).json(apiError('Validation failed', 400));
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json(apiError('Unauthorized', 401));
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json(apiError('Not found', 404));
  }
  
  // Default: 500
  res.status(500).json(apiError('Internal server error', 500));
}

// Apply at end of middleware chain
app.use(errorHandler);
```

---

## API Versioning

### **URL-Based Versioning (Recommended)**

```typescript
// v1 routes
app.use('/api/v1', v1Router);

// v2 routes (new version)
app.use('/api/v2', v2Router);

// Default to latest
app.use('/api', v2Router);
```

**When to version:**
- Breaking API changes (removed fields, changed types)
- Major behavior changes
- Don't version for additive changes (new fields, new endpoints)

---

## API Documentation

### **Inline JSDoc Comments**

```typescript
/**
 * @route POST /api/posts
 * @description Create a new post
 * @access Private (requires authentication)
 * 
 * @param {string} title - Post title (1-200 chars)
 * @param {string} content - Post content (1-10000 chars)
 * @param {string} [privacy=public] - Privacy setting (public|friends|private)
 * 
 * @returns {Post} The created post
 * 
 * @example
 * POST /api/posts
 * {
 *   "title": "My First Post",
 *   "content": "Hello world!",
 *   "privacy": "public"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "title": "My First Post",
 *     "..."
 *   }
 * }
 */
router.post('/api/posts', authMiddleware, async (req, res, next) => {
  // Implementation
});
```

---

## Testing API Endpoints

### **Integration Tests**

```typescript
// server/__tests__/posts.test.ts
import request from 'supertest';
import app from '../index';

describe('POST /api/posts', () => {
  it('creates post with valid data', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        title: 'Test Post',
        content: 'Test content',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      title: 'Test Post',
      content: 'Test content',
    });
  });
  
  it('returns 401 without auth', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ title: 'Test', content: 'Test' });
    
    expect(response.status).toBe(401);
  });
  
  it('returns 400 with invalid data', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ title: '' }); // Missing content
    
    expect(response.status).toBe(400);
  });
});
```

---

## Performance Best Practices

### **1. Pagination (Always)**

```typescript
// ❌ BAD: No pagination
router.get('/api/posts', async (req, res) => {
  const posts = await db.query.posts.findMany(); // Could return 100,000 rows!
  res.json(apiSuccess(posts));
});

// ✅ GOOD: Paginated
router.get('/api/posts', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (parseInt(req.query.page as string) || 1 - 1) * limit;
  
  const posts = await db.query.posts.findMany({ limit, offset });
  res.json(apiSuccess(posts));
});
```

---

### **2. Caching Headers**

```typescript
// Cache static data (rarely changes)
router.get('/api/cities', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
  res.json(apiSuccess(cities));
});

// Don't cache user-specific data
router.get('/api/profile', authMiddleware, (req, res) => {
  res.set('Cache-Control', 'private, no-cache');
  res.json(apiSuccess(req.user));
});
```

---

## Integration with ESA Protocols

**CHECK_BEFORE_BUILD:**
- Verify API compiles before deploy
- Test authentication middleware
- Validate all routes return correct status codes

**PERFORMANCE_METRICS:**
- Track API response times (target <500ms p95)
- Monitor error rates (target <1%)

**PARALLEL_BY_DEFAULT:**
- Client can make multiple API calls in parallel (React Query)

---

**Document Owner:** Backend Team + API Guild  
**Review Cycle:** Quarterly or when API changes  
**Last Updated:** October 19, 2025
