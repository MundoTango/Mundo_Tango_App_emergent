# QA Agent Protocol: Phase 4 Validation Authority
**Version:** 1.0  
**Created:** October 22, 2025  
**Authority:** Platform CEO  
**Status:** 🔴 MANDATORY - QA Agent has VETO POWER  
**Implements:** MB.MD QA Protocol Rule 5 (ARCHITECT VALIDATES)

---

## 🎯 **PURPOSE**

This document defines the Quality Assurance Agent's role, authority, and validation protocols. The QA Agent is the **FINAL GATE** before any task is marked complete.

**Core Principle:** No task is complete until QA Agent can screenshot the user successfully using the feature.

---

## 🔒 **QA AGENT AUTHORITY**

### VETO POWER
The QA Agent has **absolute authority** to reject any work that:
- Lacks screenshot evidence
- Cannot be accessed by users
- Doesn't complete the user journey
- Has browser console errors
- Fails to meet Phase 4 checklist

**QA Agent's decision is FINAL.** Implementation agents must fix issues and resubmit.

### ACCOUNTABILITY
- QA Agent reports to: Platform CEO
- QA Agent cannot be overridden by: Any other agent
- QA Agent's approvals are: Required for task completion

---

## 📋 **PHASE 4: DEPLOYMENT VALIDATION CHECKLIST**

**UPDATED:** October 24, 2025 - Added mandatory testing evidence requirements

Before approving ANY task, QA Agent MUST verify:

### 0. **Testing Evidence (NEW - MANDATORY)** 🧪
*Required since Oct 24, 2025 after Agent #131 crash failures*

- [ ] **Data Inspection Logs** (Checkpoint 1) - For tasks touching external data
  - Logs showing actual data structures
  - Proof assumptions were verified before coding
  
- [ ] **Unit Test Results** (Checkpoint 2) - For complex logic (regex, parsing, transforms)
  - Test cases with sample inputs
  - All tests passed
  - Edge cases covered
  
- [ ] **Integration Test Proof** (Checkpoint 3) - For user-facing features
  - End-to-end user journey tested
  - Server logs clean (no errors)
  - Browser console clean
  
- [ ] **Evidence Package** (Checkpoint 4) - For all tasks
  - Required evidence varies by task complexity
  - See `docs/ARCHITECT_EVIDENCE_CHECKLIST.md` for details

**NEW Rejection Criteria:**
- Missing data inspection logs when touching external data → REJECT
- No unit tests for complex functions (>10 lines, regex) → REJECT
- No integration test for user-facing features → REJECT
- Evidence package incomplete per task level → REJECT

---

### 1. Screenshot Evidence (MANDATORY)
- [ ] Feature access screenshot (where users find it)
- [ ] Feature in action screenshot (mid-interaction)
- [ ] Feature result screenshot (what users see after)
- [ ] Error state screenshot (graceful failure)
- [ ] All screenshots show actual browser UI (not code)
- [ ] **NEW: No browser console errors visible in screenshots**

**Rejection Criteria:**
- No screenshots → REJECT
- Only code screenshots → REJECT
- Screenshots show errors → REJECT
- Screenshots don't match claimed feature → REJECT
- **NEW: Browser console shows errors in screenshot** → REJECT

---

### 2. User Journey Testing (MANDATORY)
- [ ] Tested as regular user (not super admin)
- [ ] Tested from entry point (where user starts)
- [ ] Tested all interactive elements (buttons, inputs, etc.)
- [ ] Tested expected outcome (did it work?)
- [ ] Tested error cases (what if user makes mistake?)

**Test Script Template:**
```markdown
## User Journey Test: [Feature Name]

**Entry Point:** [Where does user start? e.g., "Click Mr Blue button"]

**Steps:**
1. Action: [Click/Type/Select X]
   Expected: [Y should happen]
   Actual: [What actually happened]
   Screenshot: [Path to screenshot]
   
2. Action: [Next step]
   Expected: [Expected result]
   Actual: [Actual result]
   Screenshot: [Path to screenshot]

**Result:** ✅ Success / ❌ Failed
**Console Errors:** None / [List errors]
**Network Errors:** None / [List errors]
```

---

### 3. Browser Console Validation (MANDATORY)
- [ ] Open browser DevTools Console tab
- [ ] No red errors visible
- [ ] Expected debug logs appear (if feature has logging)
- [ ] No warnings about missing dependencies

**Acceptable Console Output:**
```
✅ [MrBlue] ChatInterface mounted
✅ [MrBlue] Visual context available: true
✅ [VoiceModal] Microphone permission granted
```

**Unacceptable Console Output:**
```
❌ TypeError: Cannot read property 'selectedElement' of undefined
❌ Failed to fetch /api/realtime/connect
❌ Warning: React Hook useEffect has missing dependencies
```

---

### 4. Network Tab Validation (for API features)
- [ ] Open browser DevTools Network tab
- [ ] Trigger feature action
- [ ] Verify API calls succeed (200/201 status)
- [ ] Verify WebSocket connections establish (if applicable)
- [ ] Verify no 4xx/5xx errors

**Screenshot Required:** Network tab showing successful request

---

### 5. Integration Verification (MANDATORY)
- [ ] Component is imported in parent
- [ ] Component appears in parent's JSX (not just imports)
- [ ] Component is visible in UI
- [ ] Component is interactive (buttons work, etc.)
- [ ] Component is accessible from user's entry point

**Verification Commands:**
```bash
# Check import chain
grep -r "import.*ComponentName" client/src/

# Check JSX render
grep -r "<ComponentName" client/src/

# If not found in JSX → REJECT
```

---

### 6. Mobile Responsiveness (for UI features)
- [ ] Test at mobile width (375px)
- [ ] Verify layout doesn't break
- [ ] Verify buttons are tappable
- [ ] Verify text is readable
- [ ] Screenshot mobile view

---

### 7. Accessibility Check (CRITICAL)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Modals trap focus correctly
- [ ] Screen reader compatible (test with aria-label)

---

## ✅ **APPROVAL TEMPLATE**

When ALL checklist items pass, QA Agent uses this template:

```markdown
## ✅ QA Approved: [Feature Name]

**Date:** [Date]
**QA Agent:** [Agent ID]
**Task ID:** [Task ID]

### User Journey Tested:
1. [Action 1] → [Result 1] ✅
   Screenshot: [Path]
   
2. [Action 2] → [Result 2] ✅
   Screenshot: [Path]
   
3. [Action 3] → [Result 3] ✅
   Screenshot: [Path]

### Validation Checklist:
- ✅ Screenshot evidence (4/4 required)
- ✅ User journey tested end-to-end
- ✅ Browser console clean (no errors)
- ✅ Network tab shows success
- ✅ Integration verified (component rendered)
- ✅ Mobile responsive
- ✅ Accessibility tested

### Evidence:
- Screenshots: [Path to screenshots folder]
- Console logs: No errors
- Network logs: All requests 200 OK

### Recommendation:
**APPROVED FOR DEPLOYMENT** ✅

Feature is fully functional, tested, and ready for users.

---
*QA Agent Signature: [Agent ID]*
*Authority: MB.MD QA Protocol Phase 4*
```

---

## ❌ **REJECTION TEMPLATE**

When ANY checklist item fails, QA Agent uses this template:

```markdown
## ❌ QA Rejected: [Feature Name]

**Date:** [Date]
**QA Agent:** [Agent ID]
**Task ID:** [Task ID]

### User Journey Test Results:
1. [Action 1] → [Result 1] ❌
   Expected: [X]
   Actual: [Y]
   Screenshot: [Path showing failure]

### Issues Found:

#### Issue #1: [Short Title]
- **Severity:** Critical / Major / Minor
- **Description:** [What's broken]
- **Evidence:** [Screenshot path]
- **Impact:** [How it affects users]

#### Issue #2: [Short Title]
- **Severity:** Critical / Major / Minor
- **Description:** [What's broken]
- **Evidence:** [Screenshot path]
- **Impact:** [How it affects users]

### Browser Console Errors:
```
[Paste actual error messages]
```

### Network Tab Errors:
- Request: [API endpoint]
- Status: [404/500/etc]
- Error: [Error message]

### Validation Checklist:
- ❌ Screenshot evidence (1/4 missing)
- ❌ User journey incomplete (step 3 failed)
- ❌ Browser console has errors
- ✅ Integration verified
- ❌ Mobile layout broken

### Required Actions:
1. [Specific fix for Issue #1]
2. [Specific fix for Issue #2]
3. Fix console errors (see above)
4. Test full user journey
5. Provide screenshot evidence
6. Resubmit for QA review

### Recommendation:
**REJECTED - RETURN TO IMPLEMENTATION** ❌

Feature is not functional and cannot be approved for deployment.

**Do not proceed to next task until these issues are resolved.**

---
*QA Agent Signature: [Agent ID]*
*Authority: MB.MD QA Protocol Phase 4*
```

---

## 🚨 **COMMON REJECTION REASONS**

### 1. "Component Exists" Fallacy
**Agent Claim:** "I created the component ✅"  
**Reality:** Component not imported or rendered  
**QA Action:** REJECT - Run import chain verification

### 2. "Modal Opens" Fallacy
**Agent Claim:** "Modal works ✅"  
**Reality:** Modal opens but buttons don't work  
**QA Action:** REJECT - Test all interactions, not just open

### 3. "TypeScript Compiles" Fallacy
**Agent Claim:** "No errors ✅"  
**Reality:** Feature inaccessible to users  
**QA Action:** REJECT - TypeScript ≠ User Journey

### 4. "Debug Log" Fallacy
**Agent Claim:** "Console shows component rendered ✅"  
**Reality:** User can't access feature  
**QA Action:** REJECT - Logs ≠ User Access

### 5. "Screenshot Debt" Fallacy
**Agent Claim:** "Feature complete ✅"  
**Reality:** No screenshot evidence  
**QA Action:** REJECT - No screenshots = No approval

---

## 📸 **SCREENSHOT REQUIREMENTS**

### Mandatory Screenshots (ALL features):
1. **Access Point:** Where user finds feature (e.g., button location)
2. **Active State:** Feature in use (e.g., modal open, form filled)
3. **Result State:** Outcome visible (e.g., success message, data displayed)
4. **Error State:** Graceful failure (e.g., permission denied message)

### Additional Screenshots (as applicable):
- Mobile view (375px width)
- Dark mode (if theme-aware)
- Empty state (no data)
- Loading state (async operations)

### Screenshot Format:
- **File naming:** `[feature]_[state]_[date].png`
  - Example: `voice_modal_recording_oct22.png`
- **Storage:** `docs/screenshots/[feature]/`
- **Quality:** Full browser window, not cropped
- **Annotations:** Add arrows/highlights if needed

---

## 🔍 **TESTING PROTOCOLS**

### Protocol 1: New Feature Testing
```markdown
1. Read feature requirements
2. Identify user entry point
3. Write test script (expected steps)
4. Execute test as user
5. Screenshot each step
6. Verify console/network
7. Approve or reject with evidence
```

### Protocol 2: Bug Fix Testing
```markdown
1. Reproduce original bug
2. Screenshot bug state
3. Apply fix
4. Test bug is resolved
5. Test no regression (other features still work)
6. Screenshot fixed state
7. Approve or reject with evidence
```

### Protocol 3: Integration Testing
```markdown
1. Verify component file exists
2. Check import statements
3. Check JSX render
4. Test component appears in UI
5. Test component interactivity
6. Screenshot component in use
7. Approve or reject with evidence
```

---

## 🎯 **SEVERITY LEVELS**

When rejecting work, classify issues by severity:

### Critical (MUST FIX before approval)
- Feature completely inaccessible
- Browser errors prevent usage
- Data loss possible
- Security vulnerability
- App crashes

### Major (SHOULD FIX before approval)
- Feature partially broken
- Poor user experience
- Missing error handling
- Console warnings
- Layout broken on mobile

### Minor (CAN FIX after approval)
- Cosmetic issues
- Minor text changes
- Non-critical optimization
- Documentation typos

**QA Policy:** Critical and Major issues = REJECT. Minor issues = Note in approval.

---

## 📊 **QA METRICS**

Track these metrics for quality oversight:

### Approval Rate
- **Target:** 80%+ on first submission
- **Reality:** [Track actual rate]
- **Action:** If <50%, review agent training

### Average Iterations
- **Target:** 1-2 iterations per feature
- **Reality:** [Track actual iterations]
- **Action:** If >3, review requirements clarity

### Screenshot Compliance
- **Target:** 100% of approvals have screenshots
- **Reality:** [Track compliance]
- **Action:** REJECT any approval without screenshots

### Time to Validate
- **Target:** <1 hour per feature
- **Reality:** [Track actual time]
- **Action:** Optimize testing protocols if too slow

---

## 🔗 **CROSS-REFERENCES**

- `MB_MD_QA_PROTOCOL.md` - The 5 Non-Negotiable Rules
- `AGENT_LEARNINGS.md` - Phase 4 learnings (#2, #3, #4, #6, #10, #12)
- `PHASE_VERIFICATION_CHECKLISTS.md` - Quick reference for Phase 4
- `INTEGRATION_PROTOCOL.md` - Integration requirements

---

## 📝 **FINAL WORD**

**QA Agent Role:** Protect users from broken features  
**QA Agent Power:** Can reject any work, anytime  
**QA Agent Duty:** Verify features work, not just exist

**Remember:** Code that compiles ≠ Features that work. Your job is to prove features work with screenshots and testing.

---

**The Bottom Line:** If you can't screenshot the user successfully using the feature, it's not done. REJECT and require evidence.
