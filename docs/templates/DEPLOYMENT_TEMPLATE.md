# MB.MD Phase 4: DEPLOYMENT Template

**Feature/Task:** [Name of feature or task]  
**Agent:** [Your agent ID/name]  
**Date:** [Today's date]  
**Session ID:** [MB.MD session ID]

---

## 1. SCREENSHOT EVIDENCE (MANDATORY)

### Screenshot 1: Feature Access
**Purpose:** Show where user finds the feature

**How to capture:**
1. Open browser to `http://localhost:5000`
2. Navigate to feature (click buttons, open modals, etc.)
3. Take screenshot showing feature is accessible

```bash
# Using Playwright
await page.screenshot({ 
  path: 'tests/evidence/[feature]-access.png',
  fullPage: true 
});
```

**Checklist:**
- [ ] Screenshot shows navigation path
- [ ] Feature button/link visible
- [ ] User can clearly find it
- [ ] **Filename:** `tests/evidence/[feature]-access.png`

---

### Screenshot 2: Feature in Action
**Purpose:** Show feature during interaction

**How to capture:**
1. Click/interact with feature
2. Capture mid-action (modal open, form filled, loading state, etc.)
3. Show feature is functional

```bash
# After clicking button
await page.click('[data-testid="button-action"]');
await page.screenshot({ 
  path: 'tests/evidence/[feature]-action.png' 
});
```

**Checklist:**
- [ ] Screenshot shows feature active
- [ ] Interactive elements visible
- [ ] Loading states if applicable
- [ ] **Filename:** `tests/evidence/[feature]-action.png`

---

### Screenshot 3: Feature Result
**Purpose:** Show what user sees after completion

**How to capture:**
1. Complete the user action
2. Wait for result to appear
3. Capture final state (success message, updated UI, etc.)

```bash
# After action completes
await page.waitForSelector('[data-testid="text-success"]');
await page.screenshot({ 
  path: 'tests/evidence/[feature]-result.png' 
});
```

**Checklist:**
- [ ] Screenshot shows completion
- [ ] Success message visible
- [ ] Result matches expectations
- [ ] **Filename:** `tests/evidence/[feature]-result.png`

---

### Screenshot 4: Error State (If Applicable)
**Purpose:** Show graceful error handling

**How to capture:**
1. Trigger error condition
2. Capture error message/UI
3. Show feature fails gracefully

```bash
# Trigger error
await page.fill('[data-testid="input-field"]', 'invalid');
await page.click('[data-testid="button-submit"]');
await page.screenshot({ 
  path: 'tests/evidence/[feature]-error.png' 
});
```

**Checklist:**
- [ ] Screenshot shows error state
- [ ] Error message clear
- [ ] No crashes or white screens
- [ ] **Filename:** `tests/evidence/[feature]-error.png`

---

## 2. BROWSER CONSOLE VALIDATION (MANDATORY)

### Capture Console Screenshot

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through feature
4. Screenshot console showing no errors

```typescript
// In Playwright test
test('Feature has clean console', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Use feature
  await page.click('[data-testid="button-feature"]');
  await page.waitForTimeout(2000);
  
  // Verify no errors
  expect(errors).toHaveLength(0);
  
  // Screenshot console
  await page.screenshot({ 
    path: 'tests/evidence/[feature]-console.png' 
  });
});
```

**Checklist:**
- [ ] No red errors visible
- [ ] No yellow warnings (or acceptable warnings documented)
- [ ] Expected debug logs present
- [ ] Screenshot captured
- [ ] **Filename:** `tests/evidence/[feature]-console.png`

---

## 3. SERVER LOG VALIDATION (MANDATORY)

### Capture Server Logs

**Steps:**
1. Check workflow logs in Replit
2. Look for errors during feature use
3. Document log status

**Expected clean logs:**
```
✅ [INFO] Request received: POST /api/endpoint
✅ [INFO] Processing request
✅ [INFO] Response sent: 200
✅ No [ERROR] or [WARN] messages
```

**Checklist:**
- [ ] No ERROR level logs
- [ ] No WARN level logs (or documented as acceptable)
- [ ] Expected INFO logs present
- [ ] Performance acceptable (<1s response time)

---

## 4. USER JOURNEY TEST (MANDATORY)

### Complete User Journey Test Script

**Feature:** [Feature name]  
**Entry Point:** [Where user starts]

**Test Steps:**

| Step | Action | Expected Result | Actual Result | Screenshot | Status |
|------|--------|----------------|---------------|------------|--------|
| 1 | [User clicks button] | [Modal opens] | [What happened] | `access.png` | ✅/❌ |
| 2 | [User fills form] | [Input accepted] | [What happened] | `action.png` | ✅/❌ |
| 3 | [User submits] | [Success message] | [What happened] | `result.png` | ✅/❌ |

**Playwright Test:**
```typescript
test('Complete user journey for [feature]', async ({ page }) => {
  // Step 1: Navigate to feature
  await page.goto('http://localhost:5000');
  await page.click('[data-testid="button-open-mrblue"]');
  await expect(page.locator('[data-testid="dialog-mrblue"]')).toBeVisible();
  await page.screenshot({ path: 'tests/evidence/step1-access.png' });
  
  // Step 2: Interact with feature
  await page.fill('[data-testid="input-field"]', 'test data');
  await page.screenshot({ path: 'tests/evidence/step2-action.png' });
  
  // Step 3: Verify result
  await page.click('[data-testid="button-submit"]');
  await expect(page.locator('[data-testid="text-success"]')).toBeVisible();
  await page.screenshot({ path: 'tests/evidence/step3-result.png' });
  
  // Verify no console errors
  const errors = [];
  page.on('console', msg => msg.type() === 'error' && errors.push(msg.text()));
  expect(errors).toHaveLength(0);
});
```

**Test Results:**
- [ ] ✅ All steps passed
- [ ] ✅ User can complete journey
- [ ] ✅ Feature works as expected
- [ ] ✅ No errors encountered

---

## 5. INTEGRATION VERIFICATION (MANDATORY)

### Verify Component Actually Wired Up

**Component:** `[ComponentName.tsx]`  
**Parent:** `[ParentComponent.tsx]`

**Verification Checklist:**

#### 1. Import Exists
```typescript
// In ParentComponent.tsx
import ComponentName from '@/components/path/ComponentName'; ✅
```
- [ ] Import statement present
- [ ] Import path correct
- [ ] No TypeScript errors

#### 2. Component Rendered
```typescript
// In ParentComponent.tsx JSX
<ComponentName 
  prop1={value1}
  prop2={value2}
/> ✅
```
- [ ] JSX includes component
- [ ] Props passed correctly
- [ ] No missing props errors

#### 3. Component Visible in Browser
- [ ] Open browser DevTools
- [ ] Inspect element
- [ ] Component appears in React tree
- [ ] Screenshot showing component in DOM

#### 4. Component Functional
- [ ] Click buttons - they work
- [ ] Type in inputs - they accept data
- [ ] Callbacks fire - events handled
- [ ] State updates - UI reflects changes

**Proof:**
- [ ] Screenshot of component in browser
- [ ] Screenshot of React DevTools showing component
- [ ] Playwright test verifying component rendered

---

## 6. ARCHITECT REVIEW (If Complex)

### Determine if Review Required

**Criteria:**
- [ ] New feature? (Yes = review required)
- [ ] >50 lines changed? (Yes = review required)
- [ ] Database schema change? (Yes = review required)
- [ ] Security related? (Yes = review required)
- [ ] Super-admin functionality? (Yes = review required)

**Review Required:** [ ] Yes [ ] No

---

### If Review Required: Prepare Evidence Package

**Evidence to provide:**

1. **Git Diff**
```bash
git diff HEAD~1 > evidence/git-diff.txt
```

2. **All Screenshots**
- `[feature]-access.png`
- `[feature]-action.png`
- `[feature]-result.png`
- `[feature]-console.png`

3. **Test Results**
```bash
npm test > evidence/test-results.txt
```

4. **Performance Metrics**
- Response time: [X ms]
- Bundle size impact: [+X KB]
- Memory usage: [Acceptable/High]

**Request Review:**
```typescript
const evidence = {
  sessionId: YOUR_SESSION_ID,
  filesModified: ['file1.tsx', 'file2.ts'],
  screenshots: ['access.png', 'action.png', 'result.png'],
  testResults: { passed: 25, failed: 0 },
  gitDiff: 'evidence/git-diff.txt'
};

await architectReviewService.requestReview(evidence);
```

**Architect Response:**
- [ ] ✅ Approved
- [ ] ❌ Rejected (feedback: [architect's feedback])

---

## 7. QA AGENT VALIDATION (MANDATORY - FINAL GATE)

### Submit to QA Agent

**QA Agent will verify:**
- [ ] Screenshot evidence complete (4 screenshots minimum)
- [ ] Browser console clean (no errors)
- [ ] Server logs clean (no errors)
- [ ] User journey tested (all steps passed)
- [ ] Integration verified (component wired up)
- [ ] Architect approved (if required)

**QA Request:**
```typescript
const qaPackage = {
  sessionId: YOUR_SESSION_ID,
  phase: 'DEPLOYMENT',
  screenshots: ['access.png', 'action.png', 'result.png', 'console.png'],
  browserLogs: 'clean',
  serverLogs: 'clean',
  userJourneyPassed: true,
  integrationVerified: true,
  architectApproved: true // or false if not required
};

const qaResult = await qaAgent.validate(qaPackage);
```

**QA Agent Response:**
- [ ] ✅ APPROVED - Task can be marked complete
- [ ] ❌ REJECTED - Fix issues and resubmit

**If Rejected:**
1. Read QA feedback
2. Fix identified issues
3. Recapture evidence
4. Resubmit to QA Agent

---

## 8. DEPLOYMENT PHASE CHECKLIST

### Before Marking Task Complete:

#### Evidence
- [ ] 4 screenshots captured (access, action, result, error/console)
- [ ] Browser console screenshot shows no errors
- [ ] Server logs documented as clean
- [ ] User journey test passed with screenshots
- [ ] Integration proof captured

#### Testing
- [ ] Unit tests passed (if complex logic)
- [ ] Integration tests passed
- [ ] E2E Playwright test passed
- [ ] Manual browser test passed

#### Validation
- [ ] Architect approved (if required)
- [ ] QA Agent approved (MANDATORY)
- [ ] No console errors
- [ ] No server errors

#### Git
- [ ] All changes committed
- [ ] Commit message descriptive
- [ ] No uncommitted files

---

## 9. EVIDENCE BUNDLE UPLOAD

**Final evidence upload:**
```bash
# Upload complete evidence bundle
curl -X POST http://localhost:5000/api/mbmd/evidence/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": YOUR_SESSION_ID,
    "phase": "DEPLOYMENT",
    "evidenceType": "bundle",
    "metadata": {
      "screenshots": ["access.png", "action.png", "result.png", "console.png"],
      "testsPassed": true,
      "consoleClean": true,
      "logsClean": true,
      "architectApproved": true,
      "qaApproved": true
    }
  }'
```

---

## 10. COMPLETION CERTIFICATE

**Task Status:** [ ] COMPLETE [ ] INCOMPLETE

**Completion Criteria Met:**
- [x] MAPPING phase complete
- [x] BREAKDOWN phase complete
- [x] MITIGATION phase complete
- [x] DEPLOYMENT phase complete
- [x] All evidence collected
- [x] All tests passed
- [x] QA Agent approved

**Signed:** [Your agent ID]  
**Date:** [Today's date]  
**Reviewed by:** [Architect/QA Agent]

---

**DEPLOYMENT PHASE COMPLETE:** ✅  
**Task Status:** READY FOR COMPLETION  
**Evidence Package:** All artifacts uploaded to evidence database

---

## 🚨 CRITICAL REMINDERS

1. **No Screenshots = Task Not Complete** - Even if code works
2. **Console Errors = Task Not Complete** - Must be clean
3. **No QA Approval = Task Not Complete** - QA Agent has veto power
4. **"Logs Show Working" = FORBIDDEN** - User can only see UI
5. **Integration Not Verified = Component Doesn't Exist** - Must wire up

**User's Primary Profile:**
- Non-engineer
- Cannot see logs, code, or terminal
- Can only see browser UI
- Requires screenshot proof before accepting "it works"
