# Troubleshooting Process V2.0 - October 22, 2025
## Enhanced Debugging Methodology with Improvements

---

## 🔍 **CURRENT TROUBLESHOOTING PROCESS**

### **Phase 1: Information Gathering**

#### **1.1 Capture Current State**
```bash
# ALWAYS run these three in parallel
1. screenshot (get visual proof)
2. refresh_all_logs (get browser + server logs)
3. User description (what they expected vs what happened)
```

#### **1.2 Analyze Logs for Patterns**
```bash
# Common error patterns and their meanings:

Pattern: "No queryFn was passed as an option"
→ Cause: React Query cache rehydration without queryFn
→ Fix: Add explicit queryFn to the query

Pattern: "404 Not Found" on /api/* route
→ Cause: Route not registered in server/routes.ts
→ Fix: Import route and add app.use()

Pattern: "403 Forbidden" on /api/* route  
→ Cause: Missing authentication or wrong permissions
→ Fix: Check isAuthenticated middleware or user role

Pattern: Component renders but is blank
→ Cause: Missing rendering case in parent component
→ Fix: Add {condition && <Component />}

Pattern: "Cannot read property X of undefined"
→ Cause: Missing data or prop not passed
→ Fix: Check data flow and prop passing

Pattern: "Module not found"
→ Cause: Missing import statement
→ Fix: Add import at top of file
```

#### **1.3 Search Codebase**
```bash
# Use in parallel:
1. grep -pattern "error message text" (find where error occurs)
2. search_codebase "feature name" (find relevant files)
3. read known files (check current implementation)
```

### **Phase 2: Root Cause Analysis**

#### **2.1 The Integration Triple-Check**
For ANY feature, verify all three layers:

**Layer 1: Backend**
- [ ] Route file exists in `server/routes/[name]Routes.ts`
- [ ] Route imported at top of `server/routes.ts`
- [ ] Route registered with `app.use('/api/path', routeFile)`
- [ ] Console log confirms registration on server start
- [ ] Test with curl: `curl http://localhost:5000/api/path`

**Layer 2: Frontend**
- [ ] Component file exists
- [ ] Component imported in parent file
- [ ] Component rendered in parent JSX
- [ ] Props passed correctly
- [ ] Data-testid attributes added

**Layer 3: Connection**
- [ ] React Query configured with explicit queryFn
- [ ] Credentials: 'include' for authenticated requests
- [ ] Error handling implemented (try/catch)
- [ ] Loading states shown (isLoading)
- [ ] Cache invalidation after mutations

#### **2.2 Common Failure Patterns**

**Pattern A: Feature Defined But Not Implemented**
```
Symptom: Tab/button exists but does nothing
Diagnosis: Check if rendering case exists in parent
Fix: Add rendering case + import component
```

**Pattern B: API Exists But Not Registered**
```
Symptom: 404 on API call, route file exists
Diagnosis: Check server/routes.ts for app.use()
Fix: Import and register route
```

**Pattern C: Cache Rehydration Failure**
```
Symptom: Works on first load, breaks after refresh
Diagnosis: React Query lost queryFn from cache
Fix: Add explicit queryFn to query definition
```

### **Phase 3: Systematic Fix**

#### **3.1 Fix Order (Always Follow This Sequence)**
```
1. Backend First
   - Create/fix API endpoint
   - Test with curl
   - Verify returns expected data

2. Registration
   - Import in server/routes.ts
   - Add app.use()
   - Restart server
   - Verify console log

3. Frontend Integration
   - Create component
   - Import in parent
   - Add rendering case
   - Add explicit queryFn

4. Visual Verification
   - Screenshot component rendering
   - Test interaction (click buttons)
   - Screenshot results
   - Check console for errors
```

#### **3.2 After Every Change**
```bash
# Verification checklist:
1. Save file
2. Wait for HMR/restart
3. Check logs for errors
4. Take screenshot
5. Test functionality
6. Check console logs

DO NOT batch changes! Test after each fix.
```

### **Phase 4: Comprehensive Verification**

#### **4.1 User Journey Testing**
```
Test as Regular User:
1. Can they access the feature?
2. Can they perform intended action?
3. Do they see expected result?
4. Are errors handled gracefully?

Test as Super Admin:
1. All regular user tests +
2. Can they access admin features?
3. Are admin-only features hidden from regular users?
```

#### **4.2 Edge Case Testing**
```
1. Page refresh (catches cache bugs)
2. Incognito mode (catches localStorage bugs)
3. Empty state (no data yet)
4. Error state (API down)
5. Loading state (slow network)
6. Multiple tabs (concurrent requests)
```

---

## 🚀 **IMPROVEMENTS TO IMPLEMENT**

### **Improvement 1: Always Check Logs FIRST**
**Problem**: Previous agents claimed things worked without checking logs  
**Solution**: Make log checking mandatory before claiming completion

```
New Rule: Cannot mark task complete without:
1. Server logs showing no errors
2. Browser logs showing no errors
3. Screenshot showing functionality working
```

### **Improvement 2: Use Grep Over Logs When Truncated**
**Problem**: refresh_all_logs truncates large output  
**Solution**: Read log files directly or grep for patterns

```bash
# Instead of trusting truncated preview:
grep "error" /tmp/logs/Start_application_*.log
grep "No queryFn" /tmp/logs/browser_console_*.log
```

### **Improvement 3: Test After EVERY Change**
**Problem**: Batching changes makes debugging harder  
**Solution**: Test-Driven Fixing (TDF)

```
1. Make ONE change
2. Save file
3. Check logs
4. Screenshot
5. Verify fix
6. Move to next change

This catches regressions immediately!
```

### **Improvement 4: Screenshot RESULTS Not Just Components**
**Problem**: Screenshot shows component rendered, but not functionality  
**Solution**: Screenshot the ACTION RESULT

```
❌ BAD: Screenshot of button existing
✅ GOOD: Screenshot of modal opened after clicking button

❌ BAD: Screenshot of tab visible
✅ GOOD: Screenshot of tab content populated with data

❌ BAD: Screenshot of form rendered
✅ GOOD: Screenshot of success message after form submission
```

### **Improvement 5: Verify Route Registration Immediately**
**Problem**: Create API but forget to register, waste time debugging  
**Solution**: Registration verification checklist

```
After creating route file:
1. [ ] Add import at top of server/routes.ts
2. [ ] Add app.use() registration
3. [ ] Add console.log confirmation
4. [ ] Restart server
5. [ ] Check logs for confirmation
6. [ ] Test with curl
7. [ ] ONLY THEN move to frontend
```

---

## 📋 **ENHANCED TROUBLESHOOTING CHECKLIST**

### **When User Reports Bug:**

**Step 1: Gather Evidence (parallel)**
```bash
- [ ] Take screenshot of current state
- [ ] Get browser logs (refresh_all_logs)
- [ ] Get server logs (refresh_all_logs)
- [ ] Ask user what they expected
```

**Step 2: Identify Pattern**
```bash
- [ ] Search logs for error message
- [ ] Identify error type (see patterns above)
- [ ] Form hypothesis about root cause
```

**Step 3: Locate Code**
```bash
- [ ] grep for error message
- [ ] search_codebase for feature
- [ ] Read relevant files
- [ ] Check Integration Triple-Check layers
```

**Step 4: Fix Systematically**
```bash
- [ ] Fix backend first
- [ ] Test with curl
- [ ] Register route
- [ ] Fix frontend
- [ ] Add explicit queryFn if needed
- [ ] Screenshot after each step
```

**Step 5: Verify Fix**
```bash
- [ ] Screenshot showing functionality works
- [ ] Test user journey end-to-end
- [ ] Test as different user roles
- [ ] Check logs for no errors
- [ ] Test edge cases
```

**Step 6: Document Learning**
```bash
- [ ] What was the root cause?
- [ ] How was it fixed?
- [ ] How to prevent in future?
- [ ] Update docs/AGENT_LEARNINGS.md
```

---

## 🎯 **WHEN TO USE WHICH TOOL**

### **Logs (refresh_all_logs)**
Use when:
- User reports error
- Feature not working as expected
- Need to see what requests are being made
- Before claiming task complete

### **Screenshot**
Use when:
- Need visual proof of state
- Testing UI layout/styling
- Verifying buttons/modals exist
- After fixing bug to show it works

### **Grep**
Use when:
- Looking for specific error message
- Finding where function is called
- Checking if route is registered
- Logs are truncated

### **Search Codebase**
Use when:
- Need to understand feature architecture
- Looking for similar implementations
- Finding all files related to feature
- Unsure where to start debugging

### **Read File**
Use when:
- Need to see exact implementation
- Checking imports and exports
- Understanding data flow
- Verifying changes were applied

---

## 🔄 **CONTINUOUS IMPROVEMENT**

### **After Every Debugging Session:**
1. What was the root cause?
2. How long did it take to find?
3. What tool/technique worked best?
4. What would have found it faster?
5. How to prevent this in future?
6. Document in AGENT_LEARNINGS.md

### **Track These Metrics:**
- Time to identify root cause
- Time to implement fix
- Number of test iterations needed
- Number of false starts
- Tools that were most helpful

### **Monthly Review:**
- What error patterns are most common?
- Which tools are underused?
- What new tools would help?
- What documentation is missing?
- What checklists need updating?

---

**Version**: 2.0  
**Date**: October 22, 2025  
**Focus**: Systematic debugging with mandatory verification  
**Key Principle**: "Test after every change, screenshot the results"
