# MB.MD Protocol Template v3.0
**Systematic Problem-Solving Methodology for Mundo Tango Development**

## Overview

MB.MD (Mapping → Breakdown → Mitigation → Deployment) is a systematic methodology that prevents assumption-driven development and ensures root cause analysis before any code changes.

## When to Use MB.MD

**ALWAYS use MB.MD for:**
- ✅ User reports visual mismatch ("should look like Picture A, but shows Picture B")
- ✅ Feature not working as expected
- ✅ Any deployment/production issue
- ✅ Performance degradation
- ✅ Before making ANY code changes to fix a problem

**NEVER skip MB.MD when:**
- ❌ You think you know the answer (assumptions are the enemy)
- ❌ It seems like a "quick fix"
- ❌ You've seen this before (context may be different)

---

## Phase 1: MAPPING (Diagnosis) - MANDATORY FIRST STEP

**Objective:** Understand WHAT is wrong before attempting to fix it.

### Visual State Analysis
- [ ] **Screenshot current state** (what user sees now)
- [ ] **Screenshot expected state** (design spec, reference image, or previous working version)
- [ ] **Visual diff analysis**: List specific differences
  - Colors different?
  - Layout broken?
  - Content missing/invisible?
  - Wrong component rendering?

### Technical Diagnostics
- [ ] **Browser console errors** (screenshot console, copy errors to text file)
- [ ] **Server logs** (check workflow logs for errors/warnings)
- [ ] **Inspect element**
  - Check CSS classes applied
  - Verify z-index, visibility, opacity
  - Check for position: fixed/absolute conflicts
- [ ] **Route verification** (is correct component rendering for this route?)
- [ ] **State verification**
  - Light/dark mode
  - Logged in/out
  - Mobile/desktop viewport

### Root Cause Hypothesis
- [ ] Write down 2-3 possible root causes
- [ ] Eliminate impossible causes based on evidence
- [ ] Identify most likely cause

**🛑 STOP: Do NOT proceed to Breakdown until you have:**
1. Clear visual evidence of the problem
2. Console/log evidence
3. A specific hypothesis about root cause

---

## Phase 2: BREAKDOWN (Analysis)

**Objective:** Isolate the EXACT component/file/line causing the issue.

### Component Isolation
- [ ] **Identify the problematic component** (which file renders the broken UI?)
- [ ] **Test in isolation** (does component work standalone? in different route?)
- [ ] **Check dependencies**
  - Missing imports?
  - Hooks returning undefined?
  - Context providers not wrapping?

### Code Archaeology
- [ ] **Review recent changes**
  - `git diff` - what changed recently?
  - `git log --oneline -10` - recent commits
  - Check changelog/session logs
- [ ] **Identify affected areas**
  - Which other components might be affected?
  - Are there duplicate implementations?
  - Which routes use this component?

### Reproduction Steps
- [ ] Write step-by-step reproduction
  1. Navigate to X
  2. Click Y
  3. Observe Z (broken behavior)
- [ ] Verify reproduction works consistently

**🛑 STOP: Do NOT proceed to Mitigation until you have:**
1. Exact file/function causing issue
2. Understood WHY it's failing
3. Clear fix strategy

---

## Phase 3: MITIGATION (Fix)

**Objective:** Implement the MINIMAL fix that addresses root cause.

### Fix Planning
- [ ] **Document fix strategy**
  - What files will change?
  - What approach will be used?
  - What are potential side effects?
- [ ] **Get architect approval** (for non-trivial fixes)

### Implementation
- [ ] **Implement fix in smallest possible scope**
  - Change only what's necessary
  - Avoid "while we're here" refactors
  - Keep changes focused
- [ ] **Test fix locally**
  - Screenshot the fixed state
  - Console clean (no new errors)
  - Server logs clean (no new warnings)

### Verification
- [ ] **LSP check** (zero TypeScript errors)
- [ ] **Build test** (if touching build system)
- [ ] **Regression check** (did we break anything else?)

**🛑 STOP: Do NOT proceed to Deployment until:**
1. Fix verified working locally
2. Screenshot shows expected appearance
3. No new errors introduced

---

## Phase 4: DEPLOYMENT (Verification)

**Objective:** Confirm fix works for user and document learnings.

### Visual Verification
- [ ] **Screenshot after fix** (actual render)
- [ ] **Compare to design spec** (side-by-side comparison)
- [ ] **Verify Aurora Tide colors** (cyan/turquoise gradients present)
- [ ] **Check dark mode** (if applicable)
- [ ] **Check mobile responsiveness** (if applicable)

### Technical Verification
- [ ] **Browser console clean** (no errors)
- [ ] **Server logs clean** (no warnings)
- [ ] **Performance check** (no degradation)

### User Validation
- [ ] **User confirms fix** ("yes, I see it now")
- [ ] **User tests edge cases** (different browsers, states)

### Documentation
- [ ] **Update replit.md** (if architecture changed)
- [ ] **Create incident report** (if significant issue)
- [ ] **Update AGENT_SESSION_LOG.md** (learnings for next agent)

---

## Anti-Patterns (What NOT to Do)

### ❌ Assumption-Driven Development
**Bad:** "I see the word 'sidebar' → must be a sidebar import issue"  
**Good:** Screenshot the page, inspect element, verify which component is rendering

### ❌ Skipping MAPPING
**Bad:** User says "black screen" → immediately edit CSS  
**Good:** Screenshot black screen, inspect console, check if content exists but is invisible

### ❌ Fixing Symptoms Instead of Root Cause
**Bad:** Page loads slow → add loading spinner  
**Good:** Diagnose WHY it's slow (heavy query? large bundle? memory leak?)

### ❌ Not Comparing Screenshots
**Bad:** Make changes → assume it worked → mark complete  
**Good:** Screenshot before → make changes → screenshot after → compare to spec

### ❌ Marking Complete Without User Validation
**Bad:** "I see it works in my preview, marking done"  
**Good:** "User confirmed they see the fix, marking done"

---

## MB.MD Examples

### Example 1: Black Screen Issue

**User Report:** "Memories page should look like Picture A (Aurora Tide design), but I see Picture B (black screen)"

#### ✅ CORRECT MB.MD Approach:

**MAPPING:**
1. Screenshot `/memories` route → see black screen
2. Inspect element → find `<div className="min-h-screen bg-black">`
3. Browser console → no errors
4. Hypothesis: Dark mode CSS applying black background incorrectly

**BREAKDOWN:**
1. Check MemoriesPage.tsx → has `bg-gradient-to-br from-cyan-50` (correct)
2. Check index.css dark mode → find `.dark { background: black !important; }`
3. Root cause: Global dark mode override conflicting with component gradients

**MITIGATION:**
1. Remove `!important` from global dark mode background
2. Use specific dark mode classes per component
3. Test in light/dark mode → both work

**DEPLOYMENT:**
1. Screenshot `/memories` → Aurora Tide colors visible
2. User confirms "Yes! I see the cyan gradients now"
3. Document in incident report

#### ❌ INCORRECT Approach:

1. See "memories" in report → assume sidebar issue
2. Fix all sidebar imports
3. Mark complete without screenshot
4. User still sees black screen
5. **Problem not solved!**

---

### Example 2: Button Not Clickable

**User Report:** "Submit button doesn't do anything when clicked"

#### ✅ CORRECT MB.MD Approach:

**MAPPING:**
1. Screenshot button → appears normal
2. Click button → nothing happens
3. Console → `TypeError: onSubmit is not a function`
4. Hypothesis: onClick handler not connected

**BREAKDOWN:**
1. Check Button component → `onClick={props.onSubmit}`
2. Check parent → `<Button />` (missing onSubmit prop!)
3. Root cause: Prop not passed from parent

**MITIGATION:**
1. Add `onSubmit={handleSubmit}` to Button usage
2. Test click → works!

**DEPLOYMENT:**
1. User confirms button submits form
2. Mark complete

---

## MB.MD Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  MB.MD QUICK CHECKLIST                      │
├─────────────────────────────────────────────┤
│  1. MAPPING                                 │
│     □ Screenshot current + expected         │
│     □ Browser console + server logs         │
│     □ Identify root cause hypothesis        │
│                                             │
│  2. BREAKDOWN                               │
│     □ Isolate exact component/file          │
│     □ Review recent changes (git diff)      │
│     □ Write reproduction steps              │
│                                             │
│  3. MITIGATION                              │
│     □ Plan minimal fix                      │
│     □ Implement + test locally              │
│     □ LSP check + build verification        │
│                                             │
│  4. DEPLOYMENT                              │
│     □ Screenshot comparison                 │
│     □ User validation                       │
│     □ Document learnings                    │
└─────────────────────────────────────────────┘
```

---

## Integration with MB.MD Protocol v2.0

**MB.MD Protocol v2.0 Addition:** Code + Screenshot + Visual Verification = Done

This template enforces the v2.0 protocol by requiring:
- Screenshots in MAPPING (current state)
- Screenshots in MITIGATION (after fix)
- Screenshots in DEPLOYMENT (comparison to spec)

**Every task must have visual proof of completion.**

---

## When to Call Architect

Use the architect tool during:
- **MAPPING:** If diagnosis is unclear or complex
- **BREAKDOWN:** For code review of complex components
- **MITIGATION:** Before implementing non-trivial fixes
- **DEPLOYMENT:** For final verification of significant changes

---

## Version History

- **v1.0 (Oct 19, 2025):** Initial MB.MD methodology
- **v2.0 (Oct 20, 2025):** Added visual verification protocol
- **v3.0 (Oct 20, 2025):** Comprehensive template with anti-patterns and examples

---

## Conclusion

**MB.MD prevents the #1 cause of wasted development time: fixing the wrong problem.**

By forcing systematic diagnosis before implementation, we ensure:
- ✅ Fixes address root causes, not symptoms
- ✅ Changes are minimal and focused
- ✅ Visual verification confirms user sees the fix
- ✅ Documentation captures learnings for future agents

**Remember: NEVER skip MAPPING. Diagnosis first, implementation second.**
