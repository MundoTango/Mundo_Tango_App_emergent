# Secure Route Update Pattern

**Mundo Tango ESA LIFE CEO - Phase 11 Parallel**  
**Date:** October 18, 2025  
**Pattern Version:** 1.0 (Architect-Approved)

---

## 🎯 **OBJECTIVE**

Establish a standardized, secure pattern for all API route updates following architect feedback and security best practices.

---

## 🔒 **THE SECURE PATTERN**

### **1. Imports**

```typescript
import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { tableName, users, insertTableSchema } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { success, successWithPagination, parsePagination } from '../utils/apiResponse';
import { AuthenticationError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { z } from 'zod';
```

### **2. Validation Schemas (Top of File)**

```typescript
// Define update schema for PATCH endpoints
const updateTableSchema = insertTableSchema.partial().omit({ userId: true });

// Define create schema if needed
const createTableSchema = insertTableSchema.pick({
  field1: true,
  field2: true,
  // ... only allowed fields
});
```

### **3. GET Endpoints (List with Pagination)**

```typescript
router.get('/resource', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    const { page, pageSize, offset } = parsePagination(req.query);
    
    // Build query with optional filters
    const conditions = [];
    if (req.query.filter1) {
      conditions.push(eq(tableName.field1, req.query.filter1 as string));
    }
    
    let query = db.select().from(tableName);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const [items, [{ count: totalCount }]] = await Promise.all([
      query.orderBy(desc(tableName.createdAt)).limit(pageSize).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(tableName)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    ]);
    
    res.json(successWithPagination(items, page, pageSize, Number(totalCount)));
  } catch (error) {
    next(error);
  }
});
```

### **4. GET Endpoints (Single Item)**

```typescript
router.get('/resource/:id', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const itemId = parseInt(req.params.id);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(itemId)) {
      throw new ValidationError('Invalid ID');
    }
    
    const [item] = await db.select()
      .from(tableName)
      .where(eq(tableName.id, itemId))
      .limit(1);
    
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    
    res.json(success(item, 'Item fetched successfully'));
  } catch (error) {
    next(error);
  }
});
```

### **5. POST Endpoints (Create with Validation)**

```typescript
router.post('/resource', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    // ✅ CRITICAL: Validate with Zod before processing
    const validationResult = createTableSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(`Invalid data: ${validationResult.error.message}`);
    }
    
    const validatedData = validationResult.data;
    
    const [newItem] = await db.insert(tableName).values({
      ...validatedData,
      userId: user[0].id
    }).returning();
    
    res.json(success(newItem, 'Item created successfully'));
  } catch (error) {
    next(error);
  }
});
```

### **6. PATCH Endpoints (Update with Explicit Field Mapping)**

```typescript
router.patch('/resource/:id', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const itemId = parseInt(req.params.id);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(itemId)) {
      throw new ValidationError('Invalid ID');
    }
    
    // ✅ CRITICAL: Validate with Zod before processing
    const validationResult = updateTableSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(`Invalid update data: ${validationResult.error.message}`);
    }
    
    const validatedData = validationResult.data;
    
    // ✅ CRITICAL: Explicitly map only allowed fields (no ...req.body spread)
    const allowedUpdates: any = {
      updatedAt: new Date()
    };
    
    if (validatedData.field1 !== undefined) allowedUpdates.field1 = validatedData.field1;
    if (validatedData.field2 !== undefined) allowedUpdates.field2 = validatedData.field2;
    // ... only validated fields
    
    const [updated] = await db.update(tableName)
      .set(allowedUpdates)
      .where(and(
        eq(tableName.id, itemId),
        eq(tableName.userId, user[0].id) // Ensure user owns the resource
      ))
      .returning();
    
    if (!updated) {
      throw new NotFoundError('Item not found or you do not have permission to update it');
    }
    
    res.json(success(updated, 'Item updated successfully'));
  } catch (error) {
    next(error);
  }
});
```

### **7. DELETE Endpoints**

```typescript
router.delete('/resource/:id', isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const itemId = parseInt(req.params.id);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(itemId)) {
      throw new ValidationError('Invalid ID');
    }
    
    const [deleted] = await db.delete(tableName)
      .where(and(
        eq(tableName.id, itemId),
        eq(tableName.userId, user[0].id) // Ensure user owns the resource
      ))
      .returning();
    
    if (!deleted) {
      throw new NotFoundError('Item not found or you do not have permission to delete it');
    }
    
    res.json(success({ id: itemId }, 'Item deleted successfully'));
  } catch (error) {
    next(error);
  }
});
```

---

## ⚠️ **CRITICAL SECURITY RULES**

### **❌ NEVER DO THIS:**

```typescript
// ❌ DANGEROUS: Spreads req.body directly, allows field injection
await db.update(posts).set({
  ...req.body,
  updatedAt: new Date()
});

// ❌ DANGEROUS: No validation, accepts any payload
const newItem = await db.insert(table).values(req.body);

// ❌ DANGEROUS: Passes undefined to where(), causes Drizzle errors
const query = db.select().from(table).where(eq(table.field, optionalParam));
```

### **✅ ALWAYS DO THIS:**

```typescript
// ✅ SAFE: Validate with Zod first
const validated = schema.safeParse(req.body);
if (!validated.success) throw new ValidationError();

// ✅ SAFE: Explicitly map only allowed fields
const updates = { updatedAt: new Date() };
if (validated.data.field1) updates.field1 = validated.data.field1;

// ✅ SAFE: Conditional query building for optional filters
const conditions = [];
if (filter) conditions.push(eq(table.field, filter));
if (conditions.length > 0) query = query.where(and(...conditions));
```

---

## 📋 **VALIDATION CHECKLIST**

Before marking a route as complete, verify:

- [ ] ✅ All endpoints use `try/catch` with `next(error)`
- [ ] ✅ Custom error classes used (AuthenticationError, ValidationError, NotFoundError)
- [ ] ✅ Zod validation on all POST/PATCH endpoints
- [ ] ✅ No `...req.body` spreads (explicit field mapping only)
- [ ] ✅ User authentication checked on protected routes
- [ ] ✅ User ownership verified on update/delete operations
- [ ] ✅ Conditional query building for optional filters (no undefined in where())
- [ ] ✅ Success responses use standardized format
- [ ] ✅ ID parameters validated (parseInt + isNaN check)
- [ ] ✅ Pagination implemented on list endpoints
- [ ] ✅ TypeScript types match actual schema

---

## 📊 **ROUTES TO UPDATE**

### **✅ Completed (5/44)**
- memoryRoutes.ts
- followsRoutes.ts
- commentsRoutes.ts
- groupRoutes.ts
- routes.ts (fixed imports)

### **⚠️ In Progress (1/44)**
- postsRoutes.ts (10 LSP errors, storage layer migration needed)

### **❌ Remaining (38/44)**
- messagesRoutes.ts
- searchRoutes.ts
- storiesRoutes.ts
- uploadRoutes.ts
- eventRoutes.ts
- userRoutes.ts (2 LSP errors)
- friendRoutes.ts
- notificationRoutes.ts
- settingsRoutes.ts
- analyticsRoutes.ts
- ... and 28 more

---

## 🎓 **ARCHITECT LESSONS**

**Critical Feedback from Reviews:**

1. **Schema Alignment** - Always validate against actual schema columns, not legacy field names
2. **Field Injection** - Never spread req.body, always use explicit mapping
3. **Type Safety** - Zod validation prevents malformed types and structural issues
4. **Conditional Queries** - Never pass undefined to Drizzle where(), build conditions array
5. **Error Handling** - Use custom error classes, always call next(error) for global handler

---

## 🚀 **IMPLEMENTATION SPEED**

**Average Time per Route File:**
- Simple routes (2-3 endpoints): 10-15 minutes
- Medium routes (4-6 endpoints): 20-30 minutes
- Complex routes (7+ endpoints): 30-45 minutes

**Estimated Total Time:** 15-20 hours for all 38 remaining routes

---

**Last Updated:** October 18, 2025  
**Version:** 1.0.0 (Architect-Approved)  
**Status:** ✅ Production-Ready Pattern
