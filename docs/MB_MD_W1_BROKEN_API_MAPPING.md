# MB.MD Week 1: Broken API Mapping Report
**Date:** October 21, 2025  
**Phase:** MAPPING  
**Total Broken Endpoints:** 15 (not 16 - Mr Blue works)

---

## 🔴 **CRITICAL: Events API - 12 Endpoints (100% broken)**

**Root Cause:** Routes are defined with `/events/*` in `eventRoutes.ts` but mounted at `/api`  
**Status:** All return 500 errors with "undefined" message  
**File:** `server/routes/eventRoutes.ts` (352 lines)  
**Mount Point:** Line 1315 in `routes.ts`: `app.use('/api', eventRoutes);`

### **Broken Endpoints:**
1. `GET /api/events/upcoming` - 500
2. `GET /api/events/past` - 500
3. `GET /api/events/my-events` - 500
4. `GET /api/events/attending` - 500
5. `GET /api/events/hosting` - 500
6. `GET /api/events/search` - 500 (ValidationError: Invalid event ID)
7. `GET /api/events/nearby` - 500
8. `GET /api/events/by-city` - 500
9. `GET /api/events/by-country` - 500
10. `POST /api/events/create` - 500
11. `GET /api/events/calendar` - 500
12. `GET /api/events/export` - 500

**Note:** There are TWO event route files:
- `eventsRoutes.ts` (374 lines) - Imported but NOT mounted
- `eventRoutes.ts` (352 lines) - Mounted at `/api`

This could be causing conflicts or outdated route definitions.

---

## 🟡 **MEDIUM: Groups API - 3 Endpoints**

### **1. `/api/groups/discover` - 404 NotFoundError**
**Error:** `NotFoundError: Group not found` at `groupRoutes.ts:141`  
**Root Cause:** Route DOES NOT EXIST in code  
**What Happens:** Request hits catch-all route `/groups/:groupIdentifier`, treats "discover" as slug, fails to find group

**Fix Required:** Add new route:
```typescript
router.get('/groups/discover', isAuthenticated, async (req, res, next) => {
  // Return suggested groups based on user location, interests, activity
});
```

### **2. `/api/groups/recommendations` - 404 NotFoundError**
**Error:** `NotFoundError: Group not found` at `groupRoutes.ts:141`  
**Root Cause:** Route DOES NOT EXIST in code  
**What Happens:** Same as /discover - hits catch-all route

**Fix Required:** Add new route:
```typescript
router.get('/groups/recommendations', isAuthenticated, async (req, res, next) => {
  // Return personalized group recommendations based on user profile
});
```

### **3. `/api/groups/my-groups` - 500**
**Error:** Server error (500)  
**File:** `groupRoutes.ts`  
**Root Cause:** Unknown - needs investigation

---

## ✅ **FALSE POSITIVE: Mr Blue**

### `/api/mrblue/conversations` - WORKS!
**Status:** ✅ Returns 201 Created  
**Response:** `{"id":19872,"userId":7,"title":"Test","context":null,"agentMode":"chat","createdAt":"2025-10-21T14:42:24.176Z","updatedAt":"2025-10-21T14:42:24.176Z"}`  
**Note:** API health report incorrectly flagged this as broken

---

## 📊 **Additional HTML Fallback Issues**

These endpoints return HTML instead of JSON (framework routing fallback):

1. `/api/profile/:username` - Returns HTML (200)
2. `/api/notifications/unread` - Returns HTML (200)
3. `/api/auth/login` - Returns HTML (200)
4. `/api/auth/logout` - Returns HTML (200)
5. `/api/auth/register` - Returns HTML (200)
6. `/api/auth/session` - Returns HTML (200)
7. `/api/user/profile` - Returns HTML (200)
8. `/api/user/stats` - Returns HTML (200)
9. `/api/user/settings` - Returns HTML (200)
10. `/api/user/preferences` - Returns HTML (200)
11. `/api/user/notifications-settings` - Returns HTML (200)

**Root Cause:** These routes likely don't exist, so Express is falling through to Vite's HTML renderer.

---

## 🎯 **Fix Priority Matrix**

### **Priority 1: BLOCKING (Must fix immediately)**
- All 12 Events endpoints - Calendar feature completely broken
- `/api/groups/discover` - Discovery feature broken
- `/api/groups/recommendations` - Recommendations broken

### **Priority 2: HIGH (Fix this week)**
- `/api/groups/my-groups` - User's group list broken
- HTML fallback endpoints - Need proper API responses

### **Priority 3: MEDIUM (Fix next week)**
- Rebuild API health check script with proper HTTP methods
- Remove duplicate `eventsRoutes.ts` file (if obsolete)

---

## 🔧 **Recommended Fix Approach**

### **Batch 1: Events API (Day 1-2)**
1. Investigate why all events routes return 500
2. Check database schema for events table
3. Fix route definitions and handlers
4. Test each endpoint individually
5. Screenshot proof of working endpoints

### **Batch 2: Groups Discovery (Day 2)**
1. Implement `/groups/discover` route with algorithm
2. Implement `/groups/recommendations` route
3. Fix `/groups/my-groups` error
4. Test all 3 endpoints
5. Screenshot proof

### **Batch 3: HTML Fallbacks (Day 3)**
1. Add proper API routes for auth endpoints
2. Add proper API routes for user endpoints
3. Ensure all return JSON, not HTML
4. Test with curl/automated script
5. Screenshot proof

### **Batch 4: Validation (Day 3)**
1. Rebuild API health check script
2. Run full test suite
3. Generate new health report
4. Achieve >90% success rate
5. Screenshot dashboard

---

## 📸 **Screenshot Evidence**

**Errors Captured:**
- `/api/groups/discover` - 404 NotFoundError in logs
- `/api/groups/recommendations` - 404 NotFoundError in logs
- `/api/events/search` - ValidationError in logs
- `/api/mrblue/conversations` - ✅ 201 Created (works!)

**Log Files:**
- `/tmp/logs/Start_application_20251021_144410_516.log`
- Full error stack traces captured

---

## 🏁 **Success Criteria**

**Week 1 Complete When:**
- [ ] All 12 Events endpoints return 200/201
- [ ] All 3 Groups endpoints return 200/201
- [ ] No HTML fallbacks on API routes
- [ ] API health script rebuilt with proper methods
- [ ] Health score >90% (vs current 62%)
- [ ] Screenshot proof of all fixes
- [ ] Architect approval

---

**Next Steps:** Begin BREAKDOWN phase - Fix API Batch 1 (Events)
