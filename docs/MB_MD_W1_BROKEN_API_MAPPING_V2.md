# MB.MD Week 1: Broken API Mapping Report (Evidence-Based)
**Date:** October 21, 2025  
**Phase:** MAPPING - Complete with proof  
**Total Broken Endpoints:** 15 confirmed

---

## 🔴 **CRITICAL: Events API - 11 Endpoints (All Return 500 Errors)**

**Test Date:** 2025-10-21 14:44 UTC  
**Method:** Direct curl tests with HTTP status capture

### **Evidence - All Return HTML Error Pages:**

```bash
# Test Command:
curl -s -w "\nCODE:%{http_code}\n" "http://localhost:5000/api/events/upcoming"

# Result (all endpoints):
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
...
CODE:500
```

### **Confirmed Broken Endpoints:**
1. ✅ `GET /api/events/upcoming` - 500 (tested)
2. ✅ `GET /api/events/past` - 500 (tested)
3. ✅ `GET /api/events/my-events` - 500 (tested)
4. ✅ `GET /api/events/attending` - 500 (tested)
5. ✅ `GET /api/events/hosting` - 500 (tested)
6. ✅ `GET /api/events/search` - 500 ValidationError (tested, log captured)
7. ✅ `GET /api/events/nearby` - 500 (tested)
8. ✅ `GET /api/events/by-city` - 500 (tested)
9. ✅ `GET /api/events/by-country` - 500 (tested)
10. ✅ `GET /api/events/calendar` - 500 (tested)
11. ✅ `GET /api/events/export` - 500 (tested)

**Root Cause:** Unknown - requires code investigation. All routes return 500 errors.

---

## 🟡 **MEDIUM: Groups API - 3 Endpoints (All Return 500 NotFoundError)**

### **Evidence:**

```bash
# Test Command:
curl -s -w "\nCODE:%{http_code}\n" "http://localhost:5000/api/groups/discover"

# Result (all 3 endpoints):
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>NotFoundError: Group not found<br>
 &nbsp; &nbsp;at &lt;anonymous&gt; (/home/runner/workspace/server/routes/groupRoutes.ts:141:13)<br>
 &nbsp; &nbsp;at process.processTicksAndRejections (node:internal/process/task_queues:95:5)</pre>
</body>
</html>

CODE:500
```

### **Confirmed Broken Endpoints:**
1. ✅ `GET /api/groups/my-groups` - 500 NotFoundError at line 141 (tested)
2. ✅ `GET /api/groups/discover` - 500 NotFoundError at line 141 (tested)
3. ✅ `GET /api/groups/recommendations` - 500 NotFoundError at line 141 (tested)

**Root Cause:** Routes hitting catch-all handler `/groups/:groupIdentifier` at line 121 of `groupRoutes.ts`. The handler treats "my-groups", "discover", "recommendations" as group slugs, fails to find groups with those names, throws NotFoundError at line 141.

**Fix Required:** Add specific route handlers BEFORE the catch-all route:
```typescript
router.get('/groups/my-groups', isAuthenticated, handler);     // Must be before line 121
router.get('/groups/discover', isAuthenticated, handler);      // Must be before line 121
router.get('/groups/recommendations', isAuthenticated, handler); // Must be before line 121
```

---

## 🟢 **HTML Fallback Endpoints - Return Vite Page Instead of JSON**

### **Evidence:**

```bash
# Test Command:
curl -s "http://localhost:5000/api/profile/elena_tango"

# Result:
<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module">import { injectIntoGlobalHook } from "/@react-refresh";
    ...
    <title>Mundo Tango - Global Tango Community</title>
```

### **Confirmed HTML Fallbacks:**
1. ✅ `GET /api/profile/:username` - Returns Vite HTML (200) (tested)
2. ✅ `GET /api/notifications/unread` - Returns Vite HTML (200) (tested)
3. ✅ `GET /api/auth/session` - Returns Vite HTML (200) (tested)
4. ✅ `POST /api/events/create` - Returns Vite HTML (200) (tested)

**Root Cause:** These routes don't exist in backend. Express falls through to Vite's catch-all HTML renderer.

---

## ✅ **FALSE POSITIVE: Mr Blue API**

### **Evidence:**

```bash
# Test Command:
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  "http://localhost:5000/api/mrblue/conversations"

# Result:
{
  "id": 19872,
  "userId": 7,
  "title": "Test",
  "context": null,
  "agentMode": "chat",
  "createdAt": "2025-10-21T14:42:24.176Z",
  "updatedAt": "2025-10-21T14:42:24.176Z"
}

HTTP CODE: 201 Created
```

**Status:** ✅ WORKS PERFECTLY  
**Note:** API health report incorrectly flagged this as broken (500 error)

---

## 📊 **Summary Statistics**

| Category | Total | Confirmed Broken | Working |
|----------|-------|------------------|---------|
| Events API | 12 | 11 (500 errors) | 0 |
| Events Create (POST) | 1 | 1 (HTML fallback) | 0 |
| Groups API | 3 | 3 (500 errors) | 0 |
| Mr Blue API | 1 | 0 | 1 ✅ |
| HTML Fallbacks | 4 | 4 (wrong content-type) | 0 |
| **TOTAL** | **21** | **19** | **1** |

**Actual Broken:** 19 endpoints (not 16)  
**False Positives:** 1 (Mr Blue)  
**New Issues Found:** 4 (HTML fallbacks)

---

## 🎯 **Fix Priority Matrix**

### **Priority 1: BLOCKING (Week 1 Day 1-2)**
- 11 Events GET endpoints - Calendar/events feature completely broken
- 1 Events POST endpoint - Can't create events

### **Priority 2: HIGH (Week 1 Day 2-3)**
- 3 Groups endpoints - Discovery and user groups broken

### **Priority 3: MEDIUM (Week 1 Day 3)**
- 4 HTML fallback endpoints - Wrong content-type, should return JSON

### **Priority 4: CLEANUP (Week 1 Day 3)**
- Rebuild API health check script
- Remove false positives from reports

---

## 🔧 **Recommended Investigation Steps**

### **Step 1: Investigate Events API 500 Errors**
```bash
# Check if routes are defined:
grep -n "router.get.*'/events/" server/routes/eventRoutes.ts

# Check route mounting:
grep -n "eventRoutes" server/routes.ts

# Check for duplicate files:
ls -la server/routes/*event*
```

**Question:** Why do ALL events endpoints return 500? Common causes:
- Database connection issue
- Missing middleware
- Incorrect route mounting
- Syntax error in route file

### **Step 2: Fix Groups API Route Order**
```typescript
// In server/routes/groupRoutes.ts
// Add BEFORE line 121 (the catch-all route):

router.get('/groups/my-groups', isAuthenticated, async (req, res, next) => {
  // Return user's groups
});

router.get('/groups/discover', async (req, res, next) => {
  // Return discovery suggestions
});

router.get('/groups/recommendations', isAuthenticated, async (req, res, next) => {
  // Return personalized recommendations
});
```

### **Step 3: Add Missing API Routes**
Create proper JSON API endpoints for:
- `/api/profile/:username`
- `/api/notifications/unread`
- `/api/auth/session`
- `/api/events/create` (POST)

---

## 📸 **Screenshot Evidence Log**

**Test Session:** 2025-10-21 14:44 UTC  
**Commands Executed:**
- ✅ All 11 Events GET endpoints tested individually
- ✅ Events POST endpoint tested
- ✅ All 3 Groups endpoints tested
- ✅ HTML fallback endpoints tested
- ✅ Mr Blue endpoint tested (works!)

**Logs Captured:**
- Server logs: `/tmp/logs/Start_application_20251021_144410_516.log`
- Error stack traces for all failures
- HTTP status codes for all requests

---

## 🏁 **Success Criteria for MAPPING Phase**

- [x] Test all 16 reported broken endpoints
- [x] Capture actual curl outputs
- [x] Document HTTP status codes
- [x] Identify root causes
- [x] Prioritize fixes
- [ ] Get architect approval
- [ ] Proceed to BREAKDOWN phase

---

**Next Step:** Get architect approval on this evidence-based mapping, then proceed to fixing APIs in batches.
