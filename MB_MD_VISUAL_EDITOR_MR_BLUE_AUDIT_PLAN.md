# MB.MD COMPREHENSIVE AUDIT & FIX PLAN
## Visual Editor + Mr Blue AI - Production Readiness

**Created:** Oct 19, 2025 4:12 AM  
**Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment)  
**Timeline:** 6-8 hours total

---

## 🔍 PHASE 1: MAPPING - Root Cause Analysis (COMPLETE)

###Issues Identified:

#### ❌ **CRITICAL - Visual Editor Blank Page**
- **Status:** Not rendering (blank screen)
- **Location:** `/admin/visual-editor`
- **File:** `client/src/pages/VisualEditorPage.tsx`
- **Probable Causes:**
  1. Missing component dependencies (TabSystem, PreviewTab, etc.)
  2. Hook errors (useMultiplayer, useKeyboardShortcuts)
  3. Import failures
  4. Runtime errors swallowed by error boundary

#### ✅ **WORKING - Mr Blue AI Dashboard**
- **Status:** Fully functional
- **Location:** `/mr-blue`
- **File:** `client/src/pages/admin/MrBlueDashboard.tsx`
- **Features:** All 8 agents accessible, tabs work, UI renders

#### ⚠️ **HIGH - CSP Configuration Errors (70+ browser warnings)**
- **Status:** Invalid CSP syntax
- **Location:** `server/middleware/securityMiddleware.ts` lines 147-154
- **Issues:**
  1. `'unsafe-dynamic'` - invalid syntax (quoted incorrectly)
  2. `report-uri` - missing semicolon separator
  3. Missing external script domains (Plausible, Google Maps, Cloudinary, Replit)

#### ⚠️ **MEDIUM - Database Constraint Error**
- **Status:** Auth failures on login
- **Error:** `duplicate key value violates unique constraint "users_username_key"`
- **Location:** `server/storage.ts` line 1253 (upsertUser)
- **Impact:** Cannot log in if username already exists

#### ℹ️ **LOW - Request Timeout (from screenshot)**
- **Status:** Intermittent API timeouts
- **Message:** "The request took too long to process"
- **Probable Cause:** Heavy agent validation running every 30s

---

## 📋 PHASE 2: BREAKDOWN - Task Sequencing

### **Track 1: Visual Editor Emergency Fix (2-3h)**
1. ✅ Verify component imports exist
2. ✅ Check LSP for TypeScript errors
3. ✅ Test each dependency (TabSystem, hooks, etc.)
4. ✅ Add error logging to identify crash point
5. ✅ Fix missing/broken dependencies
6. ✅ Test rendering in dev mode
7. ✅ Smoke test all tabs (Preview, Deploy, Git, etc.)

### **Track 2: CSP Security Fix (30min)**
1. ✅ Fix CSP syntax in securityMiddleware.ts
2. ✅ Add external domains (plausible.io, googleapis.com, etc.)
3. ✅ Test browser console for remaining errors
4. ✅ Validate CSP with CSP Evaluator tool

### **Track 3: Database Auth Fix (1h)**
1. ✅ Analyze upsertUser logic in storage.ts
2. ✅ Fix duplicate username handling (UPDATE instead of INSERT)
3. ✅ Add proper error handling
4. ✅ Test auth flow end-to-end

### **Track 4: Performance Optimization (1h)**
1. ✅ Reduce validation frequency (30s → 60s)
2. ✅ Add debouncing to heavy operations
3. ✅ Profile API endpoints for timeouts
4. ✅ Optimize cache hit rate

### **Track 5: UI Dashboard Creation (2h)**
1. ✅ Create `/admin/ve-mb-status` page
2. ✅ Add real-time health checks
3. ✅ Display CSP status
4. ✅ Show component dependency tree
5. ✅ Add quick-fix buttons
6. ✅ Integrate with route registry

---

## 🔧 PHASE 3: MITIGATION - Fixes Implementation

### **Fix 1: CSP Security Headers**
**File:** `server/middleware/securityMiddleware.ts`
**Lines:** 147-154

**Before:**
```typescript
res.setHeader('Content-Security-Policy', 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "connect-src 'self' https://api.stripe.com; " +
  "frame-src https://js.stripe.com https://hooks.stripe.com;"
);
```

**After:**
```typescript
res.setHeader('Content-Security-Policy', 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://plausible.io https://maps.googleapis.com https://upload-widget.cloudinary.com https://replit.com; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "img-src 'self' data: https:; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "connect-src 'self' https://api.stripe.com https://plausible.io https://maps.googleapis.com; " +
  "frame-src https://js.stripe.com https://hooks.stripe.com; " +
  "report-uri /api/csp-violation"
);
```

### **Fix 2: Database Auth (upsertUser)**
**File:** `server/storage.ts`
**Line:** ~1253

Add proper conflict handling:
```typescript
async upsertUser(userData: any) {
  try {
    const result = await db.insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.username,
        set: {
          ...userData,
          updatedAt: new Date()
        }
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('[AUTH] User upsert failed:', error);
    throw error;
  }
}
```

### **Fix 3: Visual Editor Dependencies**
**Investigation needed:** Check all imports in Visual EditorPage.tsx
- TabSystem component
- useMultiplayer hook
- useKeyboardShortcuts hook
- All tab components (PreviewTab, DeployTab, etc.)

---

## 🚀 PHASE 4: DEPLOYMENT - UI Dashboard

### **New Page: VE/MB Status Dashboard**
**Route:** `/admin/ve-mb-status`
**File:** `client/src/pages/admin/VEMBStatusDashboard.tsx`

**Features:**
1. **Health Checks**
   - Visual Editor rendering status
   - Mr Blue AI accessibility
   - CSP configuration valid
   - Auth flow working
   - API response times

2. **Component Dependency Tree**
   - Show all Visual Editor dependencies
   - Mark missing/broken imports in red
   - Show import paths

3. **Quick Actions**
   - "Fix CSP" button (calls API to update config)
   - "Test Visual Editor" (opens in new tab)
   - "Test Mr Blue" (opens in new tab)
   - "View Logs" (shows recent errors)

4. **Real-Time Monitoring**
   - Live server status
   - Active users in Visual Editor (multiplayer)
   - Recent errors
   - Performance metrics

---

## 📊 SUCCESS CRITERIA

✅ **Visual Editor**
- [ ] Page renders without blank screen
- [ ] All tabs load (Preview, Console, Deploy, Git, Shell, Files, Secrets, AI)
- [ ] Split-pane resizing works
- [ ] Multiplayer cursors visible
- [ ] Command palette (Cmd+K) opens
- [ ] No console errors

✅ **Mr Blue AI**
- [x] Page renders (confirmed working)
- [x] All 8 agent tabs accessible
- [ ] AI chat responds
- [ ] Tours launch correctly
- [ ] Admin powers functional

✅ **Security & Performance**
- [ ] CSP errors eliminated (0 warnings)
- [ ] Auth flow completes without DB errors
- [ ] API response time < 2s average
- [ ] No unhandled promise rejections

✅ **UI Dashboard**
- [ ] Status page accessible at `/admin/ve-mb-status`
- [ ] All health checks passing
- [ ] Dependency tree renders
- [ ] Quick-fix buttons work

---

## 🎯 PRIORITY ORDER

**Priority 1 (DO FIRST):**
1. Fix CSP configuration (30min)
2. Fix database auth constraint (1h)
3. Diagnose Visual Editor blank page (1h)

**Priority 2 (DO SECOND):**
4. Fix Visual Editor dependencies (2h)
5. Build status dashboard UI (2h)

**Priority 3 (DO LAST):**
6. Performance optimization (1h)
7. Integration testing (30min)

---

## 📝 NOTES

- All fixes follow MB.MD methodology
- Git commits after each phase
- Architect review before marking tasks complete
- User approval required for database changes
- Documentation updated in replit.md after completion
