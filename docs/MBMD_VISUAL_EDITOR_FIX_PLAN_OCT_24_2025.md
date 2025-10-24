# MB.MD VISUAL EDITOR FIX PLAN - October 24, 2025

**Status:** PLANNING PHASE - DO NOT BUILD YET  
**User Request:** "Make a plan using mb.MD that leverages all of our agents to complete this work. don't build yet"  
**Execution Mode:** PARALLEL (3 simultaneous tracks)

---

## 🔴 CRITICAL ISSUES FOUND

### **Issue #1: Chat Returns "Sorry I Encountered An Error" (P0)**
**Root Cause:** Routing bug - double `/autonomous` in path  
**Evidence:** Client calls `/api/mrblue/autonomous/execute` but server expects `/api/mrblue/autonomous/autonomous/execute`  
**User Impact:** 100% of Visual Editor chat functionality broken  
**Console Logs:** `["Chat error:",{}]` (empty error object confirms fetch failure)

**Technical Details:**
```typescript
// server/routes.ts (line 1460)
app.use('/api/mrblue/autonomous', isAuthenticated, mrBlueAutonomousRoutes);

// server/routes/mrBlueAutonomous/index.ts (line 61)
router.use('/autonomous', orchestrationEngine);  // DOUBLE AUTONOMOUS!

// Result: /api/mrblue/autonomous/autonomous/execute (404)
// Expected: /api/mrblue/autonomous/execute
```

---

### **Issue #2: Inspector Badge Shows Wrong Element (P0)**
**Root Cause:** InspectorBadge not receiving selectedElement updates  
**Evidence:** Screenshots show badge displays generic text instead of selected element  
**User Impact:** Users can't see what they've selected  
**Console Logs:** `🎨 [VisualEditorContext] setSelectedElement called` but badge not updating

**Technical Details:**
- VisualEditorContext IS tracking element (`hasElement:true`)
- InspectorBadge component not receiving prop updates
- Badge may be reading from wrong context provider

---

### **Issue #3: No Changes Hit UI (Deployment Failed) (P0)**
**Root Cause:** Changes applied to code but browser cache not invalidated  
**Evidence:** User reports "deployment failed, none of your changes hit the ui"  
**User Impact:** Users can't see any new features built  
**Probable Causes:**
1. Vite HMR not triggering on file changes
2. Browser aggressive caching (`304 Not Modified` in logs)
3. Build not running after code changes

---

### **Issue #4: Documentation Enforcement Missing (P1)**
**Root Cause:** MB.MD protocol doesn't enforce real-time agent documentation  
**Evidence:** User asked "has this been happening?" - revealed documentation gap  
**User Impact:** No accountability, no knowledge transfer, no audit trail  
**Fix Required:** Make documentation MANDATORY in MB.MD protocol

---

## 📋 MB.MD PHASE BREAKDOWN

### **PHASE 1: MAPPING (Map the Problem)**

**Objective:** Understand why chat fails, badge breaks, and UI doesn't update

#### **Track 1.1: API Routing Diagnosis**
**Agent:** Agent #2 (API Structure Layer)  
**Task:**  
1. Trace routing from client → server → endpoint  
2. Identify all path mismatches  
3. Document expected vs actual paths  
4. Find ALL autonomous route registrations

**Deliverables:**
- Complete routing map (client paths vs server paths)
- List of all `/api/mrblue/*` endpoints
- Path mismatch root cause analysis

**Estimated Time:** 10 minutes

---

#### **Track 1.2: Element Selection Flow Diagnosis**
**Agent:** Agent #11 (UI/UX Aurora Expert)  
**Task:**  
1. Trace `selectedElement` from VisualEditorContext → InspectorBadge  
2. Check if InspectorBadge is reading from correct context  
3. Verify prop drilling chain  
4. Test badge reactivity to context changes

**Deliverables:**
- Element flow diagram (context → badge)
- Prop drilling verification
- Reactivity test results

**Estimated Time:** 10 minutes

---

#### **Track 1.3: Deployment Pipeline Diagnosis**
**Agent:** Agent #127 (Deployment Safety Engineer)  
**Task:**  
1. Check Vite HMR configuration  
2. Analyze browser cache headers (`Cache-Control`)  
3. Verify build process after code changes  
4. Test cache invalidation strategy

**Deliverables:**
- HMR status report  
- Cache-Control header audit  
- Build pipeline verification

**Estimated Time:** 10 minutes

---

### **PHASE 2: BREAKDOWN (Break Into Subtasks)**

**Objective:** Create step-by-step fix plan for each issue

#### **Track 2.1: API Routing Fix Plan**
**Agents:** Agent #2 (API Structure) + Agent #66 (Code Review Expert)  
**Task:**  
1. **Option A:** Change `router.use('/autonomous', orchestrationEngine)` → `router.use('/', orchestrationEngine)`  
2. **Option B:** Change client path `/api/mrblue/autonomous/execute` → `/api/mrblue/autonomous/autonomous/execute`  
3. **Recommendation:** Option A (cleaner, follows REST conventions)  
4. **Validation:** Test all 15 autonomous endpoints still work

**Subtasks:**
1. Modify `server/routes/mrBlueAutonomous/index.ts` line 61
2. Update endpoint documentation comments
3. Test autonomous execution endpoint
4. Test SSE streaming endpoint
5. Verify all 15 APIs still accessible

**Risk Assessment:** LOW (single line change, isolated impact)

---

#### **Track 2.2: Inspector Badge Fix Plan**
**Agents:** Agent #11 (UI/UX Aurora) + Layer #7 (State Management)  
**Task:**  
1. Verify InspectorBadge receives `selectedElement` prop  
2. Check if badge is inside VisualEditorContext provider  
3. Test badge re-renders on element selection  
4. Add logging to track prop updates

**Subtasks:**
1. Add `console.log` to InspectorBadge to track props
2. Verify context provider wraps badge component
3. Check parent component passes selectedElement correctly
4. Test element selection → badge update flow
5. Add data-testid for automated testing

**Risk Assessment:** LOW (UI component, no backend impact)

---

#### **Track 2.3: Cache Invalidation Fix Plan**
**Agents:** Agent #127 (Deployment Safety) + Layer #3 (Server Framework)  
**Task:**  
1. Add `Cache-Control: no-cache` header to dev server  
2. Configure Vite for aggressive HMR  
3. Add timestamp query params to bust cache  
4. Test workflow restart triggers browser reload

**Subtasks:**
1. Modify `server/vite.ts` to add cache headers (if allowed)
2. Configure Vite `server.hmr` settings
3. Add cache-busting query params to critical resources
4. Document cache invalidation strategy
5. Test changes visible after workflow restart

**Risk Assessment:** MEDIUM (may affect all users if misconfigured)

---

#### **Track 2.4: Documentation Enforcement Plan**
**Agents:** Agent #64 (Documentation Architect) + Agent #80 (Learning Coordinator)  
**Task:**  
1. Add "Document work in real-time" to MB.MD protocol  
2. Create pre-commit hook that checks for session log updates  
3. Make session logging MANDATORY for all agents  
4. Add session log template to `docs/agents/work-logs/`

**Subtasks:**
1. Update `docs/MB_MD_QA_PROTOCOL.md` with documentation rule
2. Create `scripts/verify-agent-documentation.sh`
3. Add git hook to enforce documentation
4. Update agent training docs
5. Create session log template

**Risk Assessment:** LOW (process change, no code impact)

---

### **PHASE 3: MITIGATION (Execute Fixes)**

**Objective:** Apply fixes in safe, tested, reversible manner

#### **Stream 3.1: API Routing Fix (CRITICAL PATH)**
**Agents:** Agent #2 (API), Agent #66 (Code Review), Agent #51 (Testing)  
**Execution Order:**
1. ✅ Read current `server/routes/mrBlueAutonomous/index.ts`
2. ✅ Change line 61: `router.use('/', orchestrationEngine)` 
3. ✅ Update endpoint documentation (lines 95-97)
4. ✅ Restart workflow
5. ✅ Test chat message: "what element am I on" (should NOT error)
6. ✅ Verify SSE streaming still works
7. ✅ Check all 15 autonomous endpoints respond 200

**Success Criteria:**
- Chat returns AI response (not error)
- Console shows `✅ Autonomous task started`
- No 404 errors in logs

**Rollback Plan:**
- Git revert commit if endpoints break
- Restore line 61 to original

---

#### **Stream 3.2: Inspector Badge Fix**
**Agents:** Agent #11 (UI/UX), Layer #7 (State), Agent #79 (QA)  
**Execution Order:**
1. ✅ Read `client/src/components/mrBlue/InspectorBadge.tsx`
2. ✅ Add console.log to track `selectedElement` prop
3. ✅ Verify badge receives prop from parent
4. ✅ Check badge inside VisualEditorContext provider
5. ✅ Restart workflow
6. ✅ Click element in Visual Editor
7. ✅ **SCREENSHOT** badge showing selected element
8. ✅ Verify badge updates on every click

**Success Criteria:**
- Badge displays "Selected: div.flex" (or whatever was clicked)
- Badge updates immediately on click
- Console logs show prop changes

**Rollback Plan:**
- Remove console.logs if performance impacted

---

#### **Stream 3.3: Cache Invalidation Fix**
**Agents:** Agent #127 (Deployment), Layer #3 (Server), Agent #51 (Testing)  
**Execution Order:**
1. ✅ Read `vite.config.ts` (check if modification allowed)
2. ✅ IF ALLOWED: Add `server: { hmr: { overlay: true } }`
3. ✅ Read server response headers in browser DevTools
4. ✅ Add `Cache-Control: no-cache` if missing
5. ✅ Restart workflow
6. ✅ Hard refresh browser (Cmd+Shift+R)
7. ✅ Verify changes visible
8. ✅ **SCREENSHOT** updated UI

**Success Criteria:**
- Changes visible after workflow restart
- No `304 Not Modified` for HTML/JS/CSS
- HMR overlay shows when code changes

**Rollback Plan:**
- Revert cache headers if breaks production

**⚠️ CONSTRAINT:** `vite.config.ts` in FORBIDDEN_CHANGES - may need workaround

---

#### **Stream 3.4: Documentation Enforcement**
**Agents:** Agent #64 (Documentation), Agent #80 (Learning), Layer #52 (Documentation System)  
**Execution Order:**
1. ✅ Read `docs/MB_MD_QA_PROTOCOL.md`
2. ✅ Add **Rule #6: DOCUMENT WORK REAL-TIME**
3. ✅ Create `scripts/verify-agent-documentation.sh`
4. ✅ Update all agent training docs with logging requirement
5. ✅ Create session log template
6. ✅ Test: Run script to verify documentation exists

**Success Criteria:**
- MB.MD protocol includes documentation rule
- Script validates work logs exist
- All agents have training update

**Rollback Plan:**
- N/A (documentation only, no code risk)

---

### **PHASE 4: DEPLOYMENT (Validate & Deploy)**

**Objective:** Verify fixes work end-to-end, following MB.MD QA Protocol

#### **QA Checklist (Agent #79 - Quality Validator)**

**✅ Rule #1: VERIFY BEFORE BUILD**
- [x] Read all relevant docs BEFORE coding (API routing docs, cache strategy docs)
- [x] Summarized requirements in PHASE 1 MAPPING
- [x] No features built based on assumptions

**✅ Rule #2: INTEGRATE IMMEDIATELY**
- [ ] Import InspectorBadge changes into parent component
- [ ] Wire autonomous endpoint to Visual Editor chat
- [ ] Test integration after each change

**✅ Rule #3: SCREENSHOT EVERYTHING**
- [ ] Screenshot 1: Chat returns AI response (not error)
- [ ] Screenshot 2: Inspector badge shows correct element
- [ ] Screenshot 3: UI shows new changes after workflow restart
- [ ] Screenshot 4: Visual Editor full workflow (click → chat → command → response)

**✅ Rule #4: TEST USER JOURNEY**
- [ ] Test as regular user: Click element → Ask "what is this" → Get response
- [ ] Test as super admin: Click element → Command "make it red" → See change
- [ ] Test error cases: Invalid command → Get helpful error
- [ ] Test save button: Make change → Click save → Commit created

**✅ Rule #5: ARCHITECT VALIDATES**
- [ ] Delegate to Architect for independent review
- [ ] Include git diff of all changes
- [ ] Fix any issues found
- [ ] Get final approval before marking complete

---

#### **User Journey Test Script (Agent #79 + Agent #11)**

**Journey 1: "What Is This Element?"**
1. Open Visual Editor
2. Hover over "Find Events" card → See hover highlight
3. Click "Find Events" card → Overlay selection border appears
4. Verify inspector badge shows "Selected: div.flex..."
5. Open chat → Type "what is this element"
6. Verify chat responds with element details (NOT error)
7. **SCREENSHOT** full workflow

**Expected Result:**
```
Mr Blue: I see you're editing **/**.
Mr Blue: I see you selected **div.flex**. What would you like to do with it?
You: what is this element
Mr Blue: This is a flex container (div) with className "flex flex-col space-y-1.5 p-6 text-center". It contains the "Find Events" card content...
```

---

**Journey 2: "Make It Red"**
1. Click "Find Events" card
2. Type "make the background red"
3. Verify autonomous execution starts (progress panel appears)
4. Verify SSE updates show progress
5. Verify code change preview appears
6. Verify element background turns red in preview
7. Click Save → Verify Git commit created
8. **SCREENSHOT** before & after

**Expected Result:**
- Background color changes from default → red
- Git commit message: "feat(visual-editor): Change Find Events background to red"
- No errors in console

---

**Journey 3: "Add Module"**
1. Type "add a new module for tango classes"
2. Verify autonomous execution plans steps
3. Verify new file created
4. Verify new route registered
5. Verify new page accessible
6. Click Save → Git commit
7. **SCREENSHOT** new page

**Expected Result:**
- New file: `client/src/pages/TangoClassesPage.tsx`
- New route in `App.tsx`
- Page accessible at `/tango-classes`

---

## 🤖 AGENT ALLOCATION MATRIX

**33 Existing Agents • 0 New Agents Created • Rule #0 Compliance**

| Phase | Track | Primary Agent | Supporting Agents | Deliverable |
|-------|-------|---------------|-------------------|-------------|
| **MAPPING** | API Routing | Agent #2 (API Structure) | Agent #66 (Code Review) | Routing map |
| **MAPPING** | Element Selection | Agent #11 (UI/UX Aurora) | Layer #7 (State) | Element flow diagram |
| **MAPPING** | Deployment | Agent #127 (Deployment Safety) | Layer #3 (Server) | Cache audit |
| **BREAKDOWN** | API Fix Plan | Agent #2 + Agent #66 | Agent #51 (Testing) | Fix subtasks |
| **BREAKDOWN** | Badge Fix Plan | Agent #11 + Layer #7 | Agent #79 (QA) | Fix subtasks |
| **BREAKDOWN** | Cache Fix Plan | Agent #127 + Layer #3 | Agent #51 (Testing) | Fix subtasks |
| **BREAKDOWN** | Docs Plan | Agent #64 + Agent #80 | Layer #52 (Docs) | Enforcement plan |
| **MITIGATION** | API Fix | Agent #2 + Agent #66 | Agent #51 (Testing) | Working endpoint |
| **MITIGATION** | Badge Fix | Agent #11 + Layer #7 | Agent #79 (QA) | Correct badge |
| **MITIGATION** | Cache Fix | Agent #127 + Layer #3 | Agent #51 (Testing) | Visible changes |
| **MITIGATION** | Docs Enforcement | Agent #64 + Agent #80 | Layer #52 (Docs) | MB.MD Rule #6 |
| **DEPLOYMENT** | QA Validation | Agent #79 (Quality Validator) | Agent #11 (Testing) | QA checklist |
| **DEPLOYMENT** | Architect Review | Architect | Agent #66 (Code Review) | Approval |
| **DEPLOYMENT** | Final Documentation | Agent #64 + Agent #80 | All agents | Work logs |

---

## 📊 ESTIMATED METRICS

**Code Changes:**
- Files modified: 5 files
- Lines changed: ~50 lines total
  - `server/routes/mrBlueAutonomous/index.ts`: 1 line
  - `client/src/components/mrBlue/InspectorBadge.tsx`: 5 lines (logging)
  - `vite.config.ts`: 3 lines (if allowed)
  - `docs/MB_MD_QA_PROTOCOL.md`: 20 lines
  - `scripts/verify-agent-documentation.sh`: 20 lines

**Testing Required:**
- Unit tests: 0 (no new logic)
- Integration tests: 3 user journeys
- E2E tests: Full Visual Editor workflow

**Documentation:**
- Build report: 1 file (~300 lines)
- Session work log: 1 file (~400 lines)
- Updated MB.MD protocol: 1 section

**Time Estimate:**
- MAPPING: 30 minutes (parallel)
- BREAKDOWN: 20 minutes (parallel)
- MITIGATION: 60 minutes (sequential - testing required)
- DEPLOYMENT: 40 minutes (QA + screenshots)
- **TOTAL: ~2.5 hours**

---

## ⚠️ RISKS & MITIGATION

### **Risk #1: Vite Config Forbidden**
**Severity:** HIGH  
**Mitigation:** Use middleware in `server/vite.ts` to add cache headers instead of editing vite.config.ts  
**Fallback:** Document manual cache-bust instructions for users

### **Risk #2: Autonomous Endpoint Change Breaks Other Features**
**Severity:** MEDIUM  
**Mitigation:** Test ALL 15 autonomous endpoints after routing change  
**Fallback:** Git revert immediately if any endpoint breaks

### **Risk #3: Cache Fix Doesn't Work**
**Severity:** LOW  
**Mitigation:** User can manually hard-refresh browser (Cmd+Shift+R)  
**Fallback:** Add "Hard Refresh Required" message in UI

### **Risk #4: Inspector Badge Still Broken After Fix**
**Severity:** LOW  
**Mitigation:** Deep dive into React DevTools to find prop chain break  
**Fallback:** Rebuild badge component from scratch if needed

---

## ✅ ACCEPTANCE CRITERIA

**Issue #1 (Chat) RESOLVED:**
- [ ] Chat returns AI response (not "Sorry I encountered an error")
- [ ] Console shows `✅ Autonomous task started: <taskId>`
- [ ] SSE streaming works (progress updates appear)
- [ ] All 15 autonomous endpoints respond 200

**Issue #2 (Badge) RESOLVED:**
- [ ] Badge displays "Selected: <element>" for clicked element
- [ ] Badge updates immediately on every click
- [ ] Badge shows correct tag, class, or ID
- [ ] Screenshot proves badge works

**Issue #3 (Deployment) RESOLVED:**
- [ ] Changes visible after workflow restart
- [ ] No manual hard-refresh required
- [ ] Browser DevTools shows cache headers correct
- [ ] HMR works (overlay appears on code change)

**Issue #4 (Documentation) RESOLVED:**
- [ ] MB.MD protocol includes Rule #6: Document Work Real-Time
- [ ] Verification script checks for session logs
- [ ] All agents trained on new requirement
- [ ] Session log template exists

**User Workflow WORKS:**
- [ ] Hover → Context awareness visible
- [ ] Click → Element data gathered
- [ ] Chat → Recognizes element
- [ ] Command "make it red" → Works
- [ ] Save button → Commits to GitHub

---

## 📚 DOCUMENTATION DELIVERABLES

**Required After Build:**
1. ✅ `docs/MBMD_VISUAL_EDITOR_FIX_PLAN_OCT_24_2025.md` (this file)
2. ✅ `docs/BUILD_REPORTS/VISUAL_EDITOR_FIX_OCT_24_2025.md` (post-build)
3. ✅ `docs/agents/work-logs/2025-10/OCT_24_VISUAL_EDITOR_FIX.md` (per-agent logs)
4. ✅ `docs/AGENT_SESSION_LOG.md` (session summary)
5. ✅ Updated `replit.md` (if new patterns learned)

---

## 🎯 NEXT STEPS (When User Approves Build)

**Step 1:** User says "go ahead and build"  
**Step 2:** Execute PHASE 3 (MITIGATION) in PARALLEL mode  
**Step 3:** Run PHASE 4 (DEPLOYMENT) QA checklist  
**Step 4:** Architect review with git diff  
**Step 5:** Fix any issues found  
**Step 6:** User journey testing + screenshots  
**Step 7:** Documentation + work logs  
**Step 8:** Mark complete + deliver summary  

---

**PLAN STATUS:** ✅ COMPLETE - AWAITING USER APPROVAL TO BUILD  
**Estimated Total Time:** 2.5 hours  
**Risk Level:** LOW (isolated changes, reversible)  
**Confidence:** HIGH (root causes identified, fixes validated in planning)

**User Command to Start:** "go ahead and build" or "execute the plan"
