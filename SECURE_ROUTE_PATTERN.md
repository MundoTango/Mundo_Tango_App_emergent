# Secure Route Pattern - Phase 11 Backend Hardening

**Purpose:** Standardized secure pattern for all API route files  
**Status:** ✅ Active - Apply to all remaining routes  
**Created:** October 18, 2025

---

## ✅ **SECURE ROUTE PATTERN CHECKLIST**

Every route file MUST implement ALL of these security measures:

### 1. **Zod Validation**
- ✅ Create Zod schemas for ALL POST/PATCH/PUT request bodies
- ✅ Validate BEFORE database operations
- ✅ Never spread `req.body` directly into database inserts
- ✅ Use `.parse()` to throw ValidationError on invalid input

### 2. **Authentication & Authorization**
- ✅ Use `isAuthenticated` middleware on protected routes
- ✅ Get user from `req.user.claims.sub` (Replit ID)
- ✅ Query database to verify user exists and is active
- ✅ Never use hardcoded fallback IDs (e.g., `userId=7`)
- ✅ Verify user has permission to access the resource

### 3. **Error Handling**
- ✅ Import custom error classes from `../middleware/errorHandler`
- ✅ Use `next(error)` to pass errors to global handler
- ✅ Wrap Zod errors: `if (error instanceof z.ZodError) next(new ValidationError(...))`
- ✅ Never send raw error objects to client

### 4. **Response Format**
- ✅ Import `success` helper from `../utils/apiResponse`
- ✅ Use `success(data, message)` for all successful responses
- ✅ Use `successWithPagination()` for paginated endpoints
- ✅ Consistent structure: `{ success: true, data: ..., message?: ... }`

### 5. **Slug Generation**
- ✅ Truncate to 240 chars BEFORE appending timestamp
- ✅ Never exceed VARCHAR(255) limit
- ✅ Use `substring(0, 240)` for safety margin
- ✅ Add timestamp for uniqueness: `${slug}_${Date.now()}`

### 6. **Database Queries**
- ✅ Use direct DB queries (no storage layer)
- ✅ Explicit field mapping (never `select().from(table)` without specifying fields)
- ✅ Use parameterized queries (Drizzle ORM prevents SQL injection)
- ✅ Add indexes for frequently queried fields

---

## 📝 **IMPLEMENTATION EXAMPLE**

```typescript
/**
 * Mundo Tango ESA LIFE CEO - Example Routes
 * Phase 11: Secure pattern implementation
 */

import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { exampleTable, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { ValidationError, AuthenticationError, NotFoundError } from '../middleware/errorHandler';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { z } from 'zod';

const router = Router();

// 1. Zod Validation Schema
const createExampleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).max(10, 'Too many tags').optional()
});

// 2. Slug Generation with 240-char safeguard
function generateSlug(text: string): string {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
  
  // Truncate to 240 chars to leave room for timestamp
  const truncated = baseSlug.substring(0, 240);
  return `${truncated}_${Date.now()}`;
}

// 3. CREATE endpoint with full security
router.post('/api/examples', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    // Security: Validate input
    const validated = createExampleSchema.parse(req.body);
    
    // Security: Get authenticated user
    const replitId = req.user.claims.sub;
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.replitId, replitId))
      .limit(1);
    
    if (!userResult[0]) {
      throw new AuthenticationError('User not found');
    }
    
    // Security: Explicit field mapping (NEVER spread req.body)
    const newExample = await db
      .insert(exampleTable)
      .values({
        slug: generateSlug(validated.title),
        title: validated.title,
        description: validated.description || null,
        isPublic: validated.isPublic,
        tags: validated.tags || [],
        userId: userResult[0].id,
        createdAt: new Date()
      })
      .returning();
    
    res.status(201).json(success(newExample[0], 'Example created successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

// 4. READ endpoint with pagination
router.get('/api/examples', async (req, res, next: NextFunction) => {
  try {
    const { page, pageSize, offset } = parsePagination(req.query);
    
    const [items, [{ count }]] = await Promise.all([
      db.select().from(exampleTable).limit(pageSize).offset(offset).orderBy(desc(exampleTable.createdAt)),
      db.select({ count: sql<number>`count(*)` }).from(exampleTable)
    ]);
    
    res.json(successWithPagination(items, page, pageSize, Number(count)));
  } catch (error) {
    next(error);
  }
});

// 5. UPDATE endpoint with ownership check
router.patch('/api/examples/:id', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const validated = createExampleSchema.partial().parse(req.body);
    
    // Get authenticated user
    const replitId = req.user.claims.sub;
    const userResult = await db.select().from(users).where(eq(users.replitId, replitId)).limit(1);
    if (!userResult[0]) throw new AuthenticationError('User not found');
    
    // Verify ownership
    const existing = await db.select().from(exampleTable).where(eq(exampleTable.id, id)).limit(1);
    if (!existing[0]) throw new NotFoundError('Example not found');
    if (existing[0].userId !== userResult[0].id) {
      throw new AuthenticationError('You can only edit your own examples');
    }
    
    // Update with explicit fields
    const updated = await db
      .update(exampleTable)
      .set({
        ...( validated.title && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.isPublic !== undefined && { isPublic: validated.isPublic }),
        updatedAt: new Date()
      })
      .where(eq(exampleTable.id, id))
      .returning();
    
    res.json(success(updated[0], 'Example updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

export default router;
```

---

## 🚨 **COMMON SECURITY MISTAKES TO AVOID**

### ❌ **NEVER DO THIS:**

```typescript
// 1. Spreading req.body (security vulnerability!)
await db.insert(table).values(req.body); // DANGEROUS!

// 2. Hardcoded user fallback (auth bypass!)
const userId = getUserId(req) || 7; // CRITICAL BUG!

// 3. No validation
router.post('/api/route', async (req, res) => {
  // Using req.body without validation - UNSAFE!
});

// 4. Assuming req.user exists
const userId = req.user.id; // Will crash if not authenticated!

// 5. Ignoring LSP errors
// "I'll fix those TypeScript errors later" - NO! Fix immediately!

// 6. No ownership verification
// Allowing any authenticated user to edit any resource - INSECURE!
```

---

## ✅ **VERIFICATION CHECKLIST**

Before marking a route "complete":

- [ ] All endpoints have Zod validation schemas
- [ ] Authentication middleware applied where needed
- [ ] User fetched from database (not assumed from req.user)
- [ ] Ownership/authorization checks in place
- [ ] Explicit field mapping (no req.body spreading)
- [ ] Error handling with custom error classes
- [ ] Success responses use apiResponse helpers
- [ ] Slug generation doesn't exceed VARCHAR(255)
- [ ] LSP shows 0 errors for this file
- [ ] Server restarts successfully
- [ ] Architect review completed

---

## 📊 **PROGRESS TRACKER**

**Routes Refactored (Batch 2):**
- ✅ groupRoutes.ts
- ✅ eventsRoutes.ts
- ✅ messagesRoutes.ts
- ✅ searchRoutes.ts
- ✅ authRoutes.ts
- ✅ userRoutes.ts

**Routes Remaining:**
- ⏸️ postsRoutes.ts (10 LSP errors - needs full refactor)
- ⏸️ 38 other routes (see Phase 11 plan)

---

**Next Steps:**
1. Continue Batch 3 route optimization
2. Fix postsRoutes.ts storage layer issues
3. Add rate limiting to sensitive endpoints
4. Implement comprehensive input sanitization

**Document Updated:** October 18, 2025 9:32 AM
