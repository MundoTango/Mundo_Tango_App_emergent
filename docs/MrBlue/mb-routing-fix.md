# MB.MD: Fix 166 Critical Routing Issues
**Phase:** Phase 1 Completion - Integration Health Fix  
**Goal:** Improve platform health score from 26% → 100%  
**Method:** MB.MD Parallel Execution (7 tracks)  
**Agent:** ESA106 Integration Validator

---

## 🎯 MISSION OBJECTIVE

**Fix all 166 routing bugs discovered by ESA106 Integration Validator**

### Current Status:
- ❌ **Health Score: 26%** (57/223 routes verified)
- ❌ **143 Missing Backend Routes**
- ❌ **23 Method Mismatches**
- ✅ **All 166 Auto-Fixable**

### Target Status:
- ✅ **Health Score: 100%** (223/223 routes verified)
- ✅ **0 Missing Routes**
- ✅ **0 Method Mismatches**
- ✅ **All Integration Tests Pass**

---

## 📊 ISSUE BREAKDOWN (By Category)

### Category 1: Missing Backend Routes (143 Issues)
**Problem:** Frontend calls endpoints that don't exist in backend

**Top Offenders:**
1. `/api/user/travel-details` - Missing route
2. `/api/upload/complete` - Missing route
3. `/api/daily-activities` - Missing route
4. `/api/guest-profiles` - Missing route
5. `/api/roles/community` - Missing route
6. `/api/chat/rooms` - Missing route
7. `/api/bookings` - Missing route
8. `/api/travel-plans` - Missing route
9. `/api/payments/subscribe` - Missing route
10. `/api/resume` - Missing route

**Fix Strategy:**
- Create missing backend routes in appropriate route files
- Match HTTP methods (GET/POST/PUT/DELETE/PATCH)
- Add authentication middleware where needed
- Validate request bodies with Zod schemas

---

### Category 2: Method Mismatches (23 Issues)
**Problem:** Frontend uses different HTTP method than backend

**Examples:**
1. `/api/upload/chunk` - Frontend uses GET, backend expects POST
2. `/api/search` - Frontend uses POST, backend expects GET
3. `/api/user/settings` - Frontend uses POST, backend expects GET
4. `/api/events/invite-participant` - Frontend uses GET, backend expects POST
5. `/api/notifications/mark-all-read` - Frontend uses GET, backend expects PUT

**Fix Strategy:**
- Update frontend to use correct HTTP method
- OR add missing method handler to backend (if frontend is correct)
- Prefer backend changes for destructive operations (POST/PUT/DELETE)

---

## 🔧 PARALLEL EXECUTION PLAN (7 Tracks)

Execute all tracks simultaneously using MB.MD methodology:

### **TRACK 1: User & Profile Routes** (25 issues)
**Files Affected:**
- `utils/profileCache.ts` - `/api/user/travel-details`
- `pages/groups-old.tsx` - `/api/user/auto-join-city-groups`
- `pages/groups-old.tsx` - `/api/user/city-group`
- `pages/UserSettings.tsx` - `/api/user/settings` (method mismatch)
- `pages/profile.tsx` - `/api/guest-profiles`
- `pages/ResumePage.tsx` - `/api/resume`

**Actions:**
1. Create `userRoutes.ts` additions:
   - `GET /user/travel-details`
   - `GET /user/auto-join-city-groups`
   - `GET /user/city-group`
   - `PUT /user/settings` (add missing method)
2. Create `profileRoutes.ts` additions:
   - `GET /guest-profiles`
   - `GET /resume`

---

### **TRACK 2: Upload & Media Routes** (15 issues)
**Files Affected:**
- `utils/chunkedUpload.ts` - `/api/upload/chunk` (method mismatch)
- `utils/chunkedUpload.ts` - `/api/upload/complete`
- `utils/esa-memory-optimizer.ts` - `/api/upload/chunk` (method mismatch)
- `services/upload.ts` - `/api/upload` (method mismatch)

**Actions:**
1. Fix method mismatches in frontend:
   - Update all `GET` calls to `POST` for upload operations
2. Create missing route:
   - `POST /upload/complete` in `chunkedUploadRoutes.ts`

---

### **TRACK 3: Chat & Messaging Routes** (12 issues)
**Files Affected:**
- `pages/messages.tsx` - `/api/chat/rooms`
- `pages/Messages.tsx` - `/api/chat/rooms`

**Actions:**
1. Create `chatRoutes.ts`:
   - `GET /chat/rooms`
   - `POST /chat/rooms`
   - `GET /chat/rooms/:id`
   - `POST /chat/rooms/:id/messages`

---

### **TRACK 4: Events & Bookings Routes** (18 issues)
**Files Affected:**
- `pages/listing-detail.tsx` - `/api/bookings`
- `pages/RoleInvitations.tsx` - `/api/events/invite-participant` (method mismatch)

**Actions:**
1. Create `bookingRoutes.ts`:
   - `POST /bookings`
   - `GET /bookings`
   - `GET /bookings/:id`
2. Fix method mismatch:
   - Update frontend to use `POST` for `/api/events/invite-participant`

---

### **TRACK 5: Payments & Subscriptions Routes** (20 issues)
**Files Affected:**
- `pages/Subscription.tsx` - `/api/payments/subscribe`
- `pages/Subscribe.tsx` - `/api/payments/subscribe`
- `pages/PromoCodesAdmin.tsx` - `/api/payments/promo-codes`
- `pages/PaymentMethods.tsx` - `/api/payments/payment-method`
- `pages/PaymentMethods.tsx` - `/api/payments/payment-method/default`

**Actions:**
1. Create `paymentRoutes.ts` additions:
   - `POST /payments/subscribe`
   - `POST /payments/promo-codes`
   - `GET /payments/promo-codes`
   - `POST /payments/payment-method`
   - `POST /payments/payment-method/default`

---

### **TRACK 6: Travel & Activities Routes** (15 issues)
**Files Affected:**
- `services/activityLoggingService.ts` - `/api/daily-activities`
- `pages/TripPlannerView.tsx` - `/api/travel-plans`
- `pages/TravelPlanner.tsx` - `/api/travel-plans`

**Actions:**
1. Create `travelRoutes.ts`:
   - `POST /travel-plans`
   - `GET /travel-plans`
   - `GET /travel-plans/:id`
   - `PUT /travel-plans/:id`
2. Create `activityRoutes.ts`:
   - `POST /daily-activities`
   - `GET /daily-activities`

---

### **TRACK 7: Miscellaneous Routes** (28 issues)
**Files Affected:**
- `pages/onboarding.tsx` - `/api/roles/community`
- `pages/onboarding.tsx` - `/api/onboarding`
- `pages/friends.tsx` - `/api/friend/send-friend-request`
- `pages/enhanced-timeline-v2.tsx` - `/api/posts/enhanced`
- `pages/create-community.tsx` - `/api/groups/create`
- `pages/code-of-conduct.tsx` - `/api/code-of-conduct/accept`
- `pages/NotionHomePage.tsx` - `/api/notion/filters`
- `pages/Notifications.tsx` - `/api/notifications/mark-all-read` (method mismatch)
- `pages/search.tsx` - `/api/search` (method mismatch)

**Actions:**
1. Create missing routes in appropriate files
2. Fix method mismatches
3. Update route mounts in `server/routes.ts`

---

## 🔍 VALIDATION PROTOCOL

### Pre-Fix Validation:
```bash
npm run validate:integrations
# Current: 26% health score, 166 issues
```

### During Fix (After Each Track):
```bash
npm run validate:integrations
# Track health score improvement
```

### Post-Fix Validation:
```bash
npm run validate:integrations
# Target: 100% health score, 0 issues
```

### Final Quality Gates:
- [ ] Health score = 100%
- [ ] 0 critical issues
- [ ] 0 method mismatches
- [ ] All 223 routes verified
- [ ] End-to-end tests pass
- [ ] No console errors

---

## 📝 FIX TEMPLATES

### Template 1: Create Missing GET Route
```typescript
// server/routes/[feature]Routes.ts
router.get('/endpoint', authenticateUser, async (req, res) => {
  try {
    const data = await storage.getFeatureData(req.user!.id);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Template 2: Create Missing POST Route
```typescript
// server/routes/[feature]Routes.ts
import { insertFeatureSchema } from '@shared/schema';

router.post('/endpoint', authenticateUser, async (req, res) => {
  try {
    const validatedData = insertFeatureSchema.parse(req.body);
    const result = await storage.createFeature(req.user!.id, validatedData);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Template 3: Fix Method Mismatch (Frontend)
```typescript
// Before (Wrong method):
const response = await fetch('/api/endpoint', { method: 'GET' });

// After (Correct method):
const response = await fetch('/api/endpoint', { method: 'POST' });
```

### Template 4: Fix Method Mismatch (Backend)
```typescript
// Add missing method handler:
router.post('/endpoint', handler); // If frontend uses POST
router.get('/endpoint', handler);  // If frontend uses GET
router.put('/endpoint', handler);  // If frontend uses PUT
```

---

## 🎯 SUCCESS CRITERIA

### Track Completion (Per Track):
- [ ] All routes created
- [ ] All method mismatches fixed
- [ ] Integration validation passes for track
- [ ] Manual testing confirms functionality
- [ ] No new console errors

### Overall Completion:
- [ ] All 7 tracks complete
- [ ] Health score = 100%
- [ ] 0 integration issues
- [ ] Full platform regression test passes
- [ ] Documentation updated

---

## 📈 PROGRESS TRACKING

### Health Score Milestones:
- Start: 26% (57/223)
- Track 1: ~35% (78/223)
- Track 2: ~42% (93/223)
- Track 3: ~47% (105/223)
- Track 4: ~55% (123/223)
- Track 5: ~64% (143/223)
- Track 6: ~71% (158/223)
- Track 7: 100% (223/223) ✅

### Expected Velocity:
- 7 tracks × parallel execution = 2-3 hours total
- ~25 routes per track
- ~10-15 minutes per track

---

## 🚨 CRITICAL REMINDERS

1. **ALWAYS run `npm run validate:integrations` after changes**
2. **Match HTTP methods exactly** (GET/POST/PUT/DELETE/PATCH)
3. **Add authentication middleware** where needed (`authenticateUser`)
4. **Validate request bodies** with Zod schemas
5. **Test end-to-end** - don't just fix the route, test the feature
6. **Update route mounts** in `server/routes.ts` if needed

---

## 📚 REFERENCE FILES

**Integration Report:**
- `docs/integration-reports/integration-validation-2025-10-13.json`

**Lessons Learned:**
- `docs/esa-lessons-learned.md` (Mr Blue bug pattern)

**Quality Gates:**
- `docs/platform-handoff/ESA_NEW_AGENT_GUIDE.md` (Quality Gate #5)

**Route Registry:**
- `server/routes.ts` (main router)
- `server/routes/*.ts` (individual route files)

---

## 🎬 EXECUTION ORDER

1. **START:** Run baseline validation
2. **PARALLEL:** Execute Tracks 1-7 simultaneously
3. **VALIDATE:** Check health score after each track
4. **TEST:** Manual verification of fixed routes
5. **COMPLETE:** Final validation (100% health score)
6. **DOCUMENT:** Update mb.md with results

---

**Let's systematically fix every single routing bug and achieve 100% integration health!** 🚀
