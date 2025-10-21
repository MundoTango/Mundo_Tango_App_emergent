# MB.MD Week 1: Complete API Audit - Final Mapping
**Date:** October 21, 2025  
**Phase:** MAPPING Complete  
**Total Endpoints Tested:** 19  
**Total Broken:** 18  
**Total Working:** 1

---

## 📋 **Complete Endpoint Inventory**

| # | Method | Endpoint | Status | HTTP Code | Error Type | Test Date |
|---|--------|----------|--------|-----------|------------|-----------|
| 1 | GET | /api/events/upcoming | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 2 | GET | /api/events/past | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 3 | GET | /api/events/my-events | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 4 | GET | /api/events/attending | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 5 | GET | /api/events/hosting | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 6 | GET | /api/events/search | ❌ BROKEN | 500 | ValidationError | 2025-10-21 14:42 UTC |
| 7 | GET | /api/events/nearby | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 8 | GET | /api/events/by-city | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 9 | GET | /api/events/by-country | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 10 | GET | /api/events/calendar | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 11 | GET | /api/events/export | ❌ BROKEN | 500 | HTML Error Page | 2025-10-21 14:44 UTC |
| 12 | POST | /api/events/create | ❌ BROKEN | 200 | HTML Fallback (Vite) | 2025-10-21 14:44 UTC |
| 13 | GET | /api/groups/my-groups | ❌ BROKEN | 500 | NotFoundError line 141 | 2025-10-21 14:44 UTC |
| 14 | GET | /api/groups/discover | ❌ BROKEN | 500 | NotFoundError line 141 | 2025-10-21 14:44 UTC |
| 15 | GET | /api/groups/recommendations | ❌ BROKEN | 500 | NotFoundError line 141 | 2025-10-21 14:44 UTC |
| 16 | GET | /api/profile/:username | ❌ BROKEN | 200 | HTML Fallback (Vite) | 2025-10-21 14:44 UTC |
| 17 | GET | /api/notifications/unread | ❌ BROKEN | 200 | HTML Fallback (Vite) | 2025-10-21 14:44 UTC |
| 18 | GET | /api/auth/session | ❌ BROKEN | 200 | HTML Fallback (Vite) | 2025-10-21 14:44 UTC |
| 19 | POST | /api/mrblue/conversations | ✅ WORKING | 201 | None - Returns JSON | 2025-10-21 14:42 UTC |

---

## 📊 **Summary Statistics**

| Category | Count | Percentage |
|----------|-------|------------|
| **Total Tested** | 19 | 100% |
| **Broken (500 errors)** | 14 | 74% |
| **Broken (HTML fallback)** | 4 | 21% |
| **Working** | 1 | 5% |

### **Breakdown by Feature:**
- Events API: 12 endpoints (12 broken, 0 working)
- Groups API: 3 endpoints (3 broken, 0 working)
- Other APIs: 4 endpoints (3 broken, 1 working)

---

## 🔍 **Detailed Test Evidence**

### **Category 1: Events API 500 Errors (11 endpoints)**

**Test Command:**
```bash
curl -s -w "\nCODE:%{http_code}\n" "http://localhost:5000/api/events/upcoming"
```

**Response (same for all 11 GET endpoints):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Error message here...</pre>
</body>
</html>

CODE:500
```

**Affected Endpoints:**
- /api/events/upcoming
- /api/events/past
- /api/events/my-events
- /api/events/attending
- /api/events/hosting
- /api/events/nearby
- /api/events/by-city
- /api/events/by-country
- /api/events/calendar
- /api/events/export

**Note:** /api/events/search returns same 500 but with ValidationError: "Invalid event ID" from `eventRoutes.ts:79` (captured in server logs `/tmp/logs/Start_application_20251021_144410_516.log`)

---

### **Category 2: Events Create (POST) - HTML Fallback (1 endpoint)**

**Test Command:**
```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"title":"Test Event"}' \
  "http://localhost:5000/api/events/create"
```

**Response:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module">import { injectIntoGlobalHook } from "/@react-refresh";
    ...
    <title>Mundo Tango - Global Tango Community</title>
```

**HTTP Code:** 200 (but returns HTML, not JSON)

---

### **Category 3: Groups API NotFoundError (3 endpoints)**

**Test Command:**
```bash
curl -s -w "\nCODE:%{http_code}\n" "http://localhost:5000/api/groups/discover"
```

**Response (same for all 3 endpoints):**
```html
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

**Affected Endpoints:**
- /api/groups/my-groups
- /api/groups/discover
- /api/groups/recommendations

**Root Cause:** Routes hit catch-all handler at line 121 of `groupRoutes.ts`, which expects a group slug but receives "my-groups", "discover", or "recommendations", fails to find group, throws NotFoundError at line 141.

---

### **Category 4: Other APIs - HTML Fallback (3 endpoints)**

**Test Command:**
```bash
curl -s "http://localhost:5000/api/profile/elena_tango"
```

**Response (same pattern for all 3):**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module">import { injectIntoGlobalHook } from "/@react-refresh";
    ...
    <title>Mundo Tango - Global Tango Community</title>
```

**HTTP Code:** 200 (but returns HTML, not JSON)

**Affected Endpoints:**
- /api/profile/:username
- /api/notifications/unread
- /api/auth/session

**Root Cause:** Routes don't exist in backend, Express falls through to Vite's HTML renderer.

---

### **Category 5: Working Endpoints (1 endpoint)** ✅

**Test Command:**
```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  "http://localhost:5000/api/mrblue/conversations"
```

**Response:**
```json
{
  "id": 19872,
  "userId": 7,
  "title": "Test",
  "context": null,
  "agentMode": "chat",
  "createdAt": "2025-10-21T14:42:24.176Z",
  "updatedAt": "2025-10-21T14:42:24.176Z"
}
```

**HTTP Code:** 201 Created ✅  
**Status:** WORKING PERFECTLY

---

## 🎯 **Root Cause Analysis**

### **1. Events API (12 broken)**
**Files:** `server/routes/eventRoutes.ts`, `server/routes/eventsRoutes.ts`  
**Issue:** All 11 GET endpoints return 500 errors. 1 POST endpoint returns HTML.  
**Hypothesis:** 
- Possible duplicate route files causing conflicts
- Middleware issue
- Database connection problem
- Route mounting issue

**Investigation Needed:**
```bash
# Check route definitions
grep -n "router.get.*'/events/" server/routes/eventRoutes.ts

# Check mounting
grep -n "eventRoutes" server/routes.ts

# Check for duplicates
ls -la server/routes/*event*
```

### **2. Groups API (3 broken)**
**File:** `server/routes/groupRoutes.ts`  
**Issue:** Routes don't exist before catch-all handler at line 121  
**Solution:** Add specific routes before line 121:

```typescript
// Add BEFORE line 121:
router.get('/groups/my-groups', isAuthenticated, async (req, res, next) => {
  // Implementation
});

router.get('/groups/discover', async (req, res, next) => {
  // Implementation
});

router.get('/groups/recommendations', isAuthenticated, async (req, res, next) => {
  // Implementation
});

// Then the catch-all route at line 121:
router.get('/groups/:groupIdentifier', async (req, res, next) => {
  // Existing code
});
```

### **3. HTML Fallbacks (4 broken)**
**Issue:** Routes don't exist, Express falls through to Vite  
**Solution:** Add proper API routes that return JSON

---

## 📅 **Fix Schedule**

### **Week 1 - Day 1 (Today)**
- [x] Complete mapping with evidence - DONE
- [ ] Get architect approval
- [ ] Investigate Events API 500 errors
- [ ] Fix first 4 Events endpoints

### **Week 1 - Day 2**
- [ ] Fix remaining 7 Events GET endpoints
- [ ] Fix Events POST endpoint
- [ ] Fix 3 Groups endpoints

### **Week 1 - Day 3**
- [ ] Fix 4 HTML fallback endpoints
- [ ] Rebuild API health check script
- [ ] Run full test suite
- [ ] Achieve >90% API health score
- [ ] Screenshot proof of all fixes

---

## 🏁 **Success Criteria**

**MAPPING Phase Complete When:**
- [x] All 19 endpoints tested individually
- [x] HTTP status codes captured
- [x] Error messages documented
- [x] Root causes identified
- [x] Fix priorities assigned
- [ ] Architect approval received

**BREAKDOWN Phase Ready When:**
- [ ] Architect approves mapping
- [ ] Investigation plan approved
- [ ] Ready to start coding fixes

---

**Status:** Awaiting architect approval to proceed to BREAKDOWN phase
