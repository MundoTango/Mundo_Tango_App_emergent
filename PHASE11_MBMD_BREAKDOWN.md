# Phase 11: Backend Completion - MB.MD BREAKDOWN

**Date:** October 18, 2025  
**Methodology:** MB.MD Step 2/4 - BREAKDOWN  
**Phase:** 11 - Backend Completion  
**Estimated Time:** 6 hours  

---

## 🎯 **BREAKDOWN METHODOLOGY**

This document breaks Phase 11 into **specific, actionable sub-tasks** with:
- Clear success criteria
- Estimated time per task
- Risk assessment
- Testing requirements
- Agent updates needed

---

## 📋 **TASK BREAKDOWN**

### **PRIORITY 0: Error Handling Infrastructure** (1.5 hours)

#### **Task 3.1: Create Global Error Handler Middleware** (30 min)
**File:** `server/middleware/errorHandler.ts` (NEW)

**Actions:**
1. Create error types enum (ValidationError, AuthError, NotFoundError, ServerError)
2. Build error handler middleware
3. Sanitize error messages for production
4. Log full errors to console/file
5. Return standardized error format:
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "User-friendly message",
       "statusCode": 400,
       "timestamp": "2025-10-18T07:00:00Z"
     }
   }
   ```

**Success Criteria:**
- ✅ All errors return standardized format
- ✅ Stack traces NEVER exposed to clients
- ✅ Errors logged with context
- ✅ HTTP status codes correct

**Tests:**
- Trigger validation error → Check response format
- Trigger auth error → Verify sanitized message
- Trigger server error → Check logging

---

#### **Task 3.2: Wrap All Routes in Try/Catch** (45 min)
**Files:** All 42 route files in `server/routes/`

**Actions:**
1. Add try/catch to routes missing it (38 files)
2. Use standardized error throwing:
   ```typescript
   throw new ValidationError("Invalid input");
   throw new NotFoundError("User not found");
   ```
3. Let global error handler catch and format

**Success Criteria:**
- ✅ All routes have try/catch or async error handling
- ✅ No unhandled promise rejections
- ✅ Server doesn't crash on errors

**Priority Routes (Fix First):**
- authRoutes.ts - Auth errors critical
- userRoutes.ts - High traffic
- eventsRoutes.ts - Core feature
- postsRoutes.ts - Main content

---

#### **Task 3.3: Register Error Handler in Server** (15 min)
**File:** `server/routes.ts`

**Actions:**
1. Import error handler middleware
2. Register AFTER all routes: `app.use(errorHandler)`
3. Add 404 handler for unknown routes
4. Test error propagation

**Success Criteria:**
- ✅ Error handler catches all route errors
- ✅ 404s return proper format
- ✅ No errors slip through

---

### **PRIORITY 0: Authentication Hardening** (1.5 hours)

#### **Task 4.1: Remove Hardcoded JWT Secret** (15 min)
**File:** `server/middleware/auth.ts`, `server/services/socketService.ts`

**Actions:**
1. Remove fallback: `JWT_SECRET || "mundo-tango-secret-key"` → `JWT_SECRET`
2. Add startup check: Exit if JWT_SECRET not set
3. Update documentation: Require JWT_SECRET in .env

**Success Criteria:**
- ✅ Server exits with clear error if no JWT_SECRET
- ✅ No hardcoded secret anywhere
- ✅ Documentation updated

**Risk:** Users get locked out if secret changes
**Mitigation:** Document in deployment guide, use environment variable

---

#### **Task 4.2: Implement Token Refresh Endpoint** (45 min)
**File:** `server/routes/authRoutes.ts`, `server/services/authService.ts`

**Actions:**
1. Create refresh token schema (longer expiry, separate secret)
2. Add `/api/auth/refresh` endpoint
3. Store refresh tokens in database (users table)
4. Return new access + refresh token pair
5. Implement token rotation (invalidate old refresh token)

**Success Criteria:**
- ✅ Access token expires in 15 minutes
- ✅ Refresh token expires in 7 days
- ✅ Refresh endpoint returns new token pair
- ✅ Old refresh token invalidated on use
- ✅ Frontend can refresh before expiry

**Flow:**
```
1. User logs in → Get access (15m) + refresh (7d) tokens
2. Access expires → Frontend calls /api/auth/refresh
3. Server validates refresh token → Issues new pair
4. Old refresh token marked as used
```

---

#### **Task 4.3: Add Rate Limiting to Auth Endpoints** (30 min)
**File:** `server/middleware/rateLimiter.ts`, `server/routes/authRoutes.ts`

**Actions:**
1. Create auth rate limiter: 5 attempts per 15 minutes
2. Apply to `/api/auth/login`, `/api/auth/register`
3. Return 429 Too Many Requests with retry-after header
4. Track by IP address + username

**Success Criteria:**
- ✅ Login attempts limited to 5 per 15min
- ✅ Proper 429 response with retry time
- ✅ Legitimate users not affected

**Configuration:**
```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: "Too many login attempts, try again in 15 minutes" }
});
```

---

### **PRIORITY 0: API Endpoint Optimization** (2 hours)

#### **Task 5.1: Create Request Validation Middleware** (30 min)
**File:** `server/middleware/requestValidator.ts` (NEW)

**Actions:**
1. Create validation middleware factory:
   ```typescript
   export const validateRequest = (schema: z.ZodSchema) => {
     return (req, res, next) => {
       const result = schema.safeParse(req.body);
       if (!result.success) {
         throw new ValidationError(result.error.message);
       }
       next();
     };
   };
   ```
2. Export common patterns (pagination, IDs, dates)

**Success Criteria:**
- ✅ Easy to apply to routes
- ✅ Works with Zod schemas from shared/schema.ts
- ✅ Returns user-friendly validation errors

---

#### **Task 5.2: Add Validation to Critical Routes** (45 min)
**Files:** authRoutes, userRoutes, eventsRoutes, postsRoutes, groupRoutes

**Actions:**
1. Apply validateRequest to POST/PUT/PATCH endpoints
2. Ensure all create/update routes validated
3. Use existing insertSchemas from shared/schema.ts

**Example:**
```typescript
router.post('/api/events', 
  authMiddleware,
  validateRequest(insertEventSchema),
  async (req, res) => { /* ... */ }
);
```

**Success Criteria:**
- ✅ All critical routes validated
- ✅ Invalid requests rejected with clear errors
- ✅ No SQL injection vulnerabilities

---

#### **Task 5.3: Standardize API Response Format** (30 min)
**Files:** Create `server/utils/apiResponse.ts`

**Actions:**
1. Create response helper functions:
   ```typescript
   export const success = (data: any, message?: string) => ({
     success: true,
     data,
     message
   });

   export const error = (code: string, message: string, statusCode: number) => ({
     success: false,
     error: { code, message, statusCode }
   });
   ```
2. Document response format
3. Apply to 5-10 high-traffic routes as examples

**Success Criteria:**
- ✅ Consistent response structure
- ✅ Easier for frontend to parse
- ✅ Clear success/error indicators

---

#### **Task 5.4: Add Response Time Logging** (15 min)
**File:** `server/middleware/responseTime.ts` (NEW)

**Actions:**
1. Create middleware to log request duration
2. Track slow endpoints (>500ms warning)
3. Register early in middleware chain

**Success Criteria:**
- ✅ All requests logged with duration
- ✅ Slow endpoints identified
- ✅ Performance baseline established

**Output:**
```
[2025-10-18 07:00:00] GET /api/events - 234ms ✅
[2025-10-18 07:00:05] GET /api/feed - 1250ms ⚠️ SLOW
```

---

### **PRIORITY 1: Real-time Features Polish** (1 hour)

#### **Task 6.1: Add WebSocket Reconnection Logic** (20 min)
**File:** `server/services/socketService.ts`

**Actions:**
1. Send heartbeat ping every 30 seconds
2. Client responds with pong
3. Track last pong time
4. Close dead connections after 90s no pong
5. Document client reconnection pattern

**Success Criteria:**
- ✅ Dead connections cleaned up
- ✅ Server resources freed
- ✅ Heartbeat visible in logs

---

#### **Task 6.2: Implement Proper Room Management** (25 min)
**File:** `server/services/socketService.ts`

**Actions:**
1. Create room tracking data structure:
   ```typescript
   private rooms: Map<string, Set<number>> = new Map();
   ```
2. Add users to rooms on join
3. Remove users on leave/disconnect
4. Broadcast only to room members

**Success Criteria:**
- ✅ Users tracked per room
- ✅ Messages only to room members
- ✅ Cleanup on disconnect

---

#### **Task 6.3: Add Message Delivery Confirmation** (15 min)
**File:** `server/services/socketService.ts`

**Actions:**
1. Generate message ID on send
2. Send confirmation to sender:
   ```json
   { "type": "message_sent", "messageId": "123", "timestamp": 1234567890 }
   ```
3. Allow client to track delivery

**Success Criteria:**
- ✅ Sender gets confirmation
- ✅ Message ID included
- ✅ Timestamp for ordering

---

### **DEPLOYMENT: Testing & Documentation** (1 hour)

#### **Task 7.1: Integration Testing** (30 min)

**Test Cases:**
1. **Error Handling:**
   - Send invalid data → Check error format
   - Trigger server error → Verify sanitized response
   - 404 unknown route → Check format

2. **Authentication:**
   - Login with no JWT_SECRET → Server exits
   - Login 6 times → Check rate limit
   - Refresh token → Get new pair

3. **Real-time:**
   - Connect WebSocket → Check heartbeat
   - Disconnect → Verify cleanup
   - Join room → Send message → Verify delivery

**Success Criteria:**
- ✅ All tests pass
- ✅ No errors in logs
- ✅ Performance acceptable

---

#### **Task 7.2: Update Documentation** (20 min)

**Files to Update:**
1. `replit.md` - Mark Phase 11 complete
2. `MT_MASTER_REBUILD_PLAN.md` - Update Phase 11 status
3. `PHASE11_COMPLETE.md` - NEW: Summary document

**Document:**
- What changed
- New environment variables required (JWT_SECRET)
- Migration guide for token refresh
- Performance improvements

---

#### **Task 7.3: Agent Updates** (10 min)

**Agents to Update:**
1. **Layer 13 (File Management)** - Knows new middleware files
2. **Layer 2 (API Structure)** - Knows standardized responses
3. **Layer 3 (Auth Agent)** - Knows token refresh flow
4. **Layer 51 (Testing)** - Knows new test requirements

**Actions:**
- Update agent documentation
- Add prevention logic for identified issues
- Document "what this prevents"

---

## 📊 **TASK SUMMARY**

| Priority | Task | Time | Files |
|----------|------|------|-------|
| P0 | Error Handler Infrastructure | 1.5h | 3 new, 42 updated |
| P0 | Authentication Hardening | 1.5h | 3 files |
| P0 | API Optimization | 2h | 3 new, 15 updated |
| P1 | Real-time Polish | 1h | 1 file |
| Deploy | Testing & Docs | 1h | 5 files |
| **TOTAL** | | **7 hours** | **~70 files** |

*Revised from 6h to 7h to include proper testing*

---

## ✅ **ACCEPTANCE CRITERIA**

**Phase 11 is DONE when:**

1. ✅ Global error handler catches all errors
2. ✅ All routes have try/catch protection
3. ✅ JWT secret required (no fallback)
4. ✅ Token refresh endpoint working
5. ✅ Auth rate limiting active
6. ✅ Request validation on critical routes
7. ✅ Standardized API responses
8. ✅ Response time logging
9. ✅ WebSocket heartbeat working
10. ✅ Room management complete
11. ✅ All tests passing
12. ✅ Documentation updated
13. ✅ Architect review complete ✅

---

## 🚨 **RISKS IDENTIFIED**

1. **Token refresh breaks existing clients** → Test thoroughly, document migration
2. **Error handler catches too much** → Log everything, only sanitize user messages
3. **Rate limiting too strict** → Monitor metrics, adjust if needed
4. **Performance regression** → Benchmark before/after

---

**Breakdown Status:** ✅ COMPLETE  
**Ready for:** Mitigation (implementation) phase  
**Confidence:** High - Clear tasks, well-defined success criteria
