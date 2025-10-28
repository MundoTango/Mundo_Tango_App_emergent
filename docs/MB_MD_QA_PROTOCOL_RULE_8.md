# MB.MD QA Protocol - Rule 8: E2E Testing (MANDATORY)

**Added**: October 28, 2025  
**Authority**: Platform CEO  
**Status**: 🔴 MANDATORY for ALL feature deployments  
**Trigger**: Plan/Build mode catastrophic failure

---

## 🚨 THE PROBLEM: What We Failed To Test

**Documentation Claimed:** "Plan/Build modes implemented and working"  
**Reality:** Vibe API was never called, features completely non-functional  
**Root Cause:** Testing ≠ User Journey Validation

### The Testing Failure Pattern:

```
❌ WRONG WAY (What We Did):
1. Test component renders ✅
2. Test button is clickable ✅
3. Test API endpoint exists ✅
4. Mark as "complete" ✅
5. Never test actual user workflow ❌
6. Never verify API is called ❌
7. Never check browser console ❌
8. Never take screenshots ❌

Result: All unit tests pass, ZERO user features work

✅ RIGHT WAY (MB.MD Rule 8):
1. Write E2E test for complete user journey
2. Verify network requests are made
3. Assert console logs show execution
4. Capture screenshots of visual changes
5. Test error handling
6. Generate evidence bundle
7. Architect reviews evidence
8. Only then: Mark as complete

Result: Proven working feature with visual proof
```

---

## 🎯 RULE 8: E2E TESTING BEFORE DEPLOYMENT (MANDATORY)

Before marking ANY task as complete that touches UI or user workflows:

### Step 1: Write E2E Playwright Tests

**Test File Naming:**
```
tests/e2e/[feature]-[scenario].spec.ts
```

**Required Test Structure:**
```typescript
/**
 * E2E Test: [Feature Name] - [Scenario]
 * 
 * User Journey:
 * 1. User does X
 * 2. System responds with Y
 * 3. User sees Z
 * 
 * Validation:
 * - Network: [Expected API calls]
 * - Console: [Expected log messages]
 * - UI: [Expected visual changes]
 * - Screenshot: [What to capture]
 */

import { test, expect } from '@playwright/test';

test.describe('[Feature]', () => {
  let consoleLogs: string[] = [];
  let networkRequests: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Capture network requests
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postDataJSON?.() || null,
      });
    });

    await page.goto('/');
  });

  test('should [scenario description]', async ({ page }) => {
    // ACT: Perform user actions
    await page.click('[data-testid="button-action"]');

    // ASSERT: Network requests
    const apiCall = networkRequests.find(req => req.url.includes('/api/'));
    expect(apiCall).toBeDefined();
    expect(apiCall.method).toBe('POST');

    // ASSERT: Console logs
    const expectedLog = consoleLogs.find(log => log.includes('Expected message'));
    expect(expectedLog).toBeDefined();

    // ASSERT: UI changes
    const result = page.locator('[data-testid="result"]');
    await expect(result).toBeVisible();

    // SCREENSHOT: Visual proof
    await page.screenshot({ path: 'evidence/screenshots/feature-working.png' });
  });
});
```

### Step 2: Add Network Request Monitoring

**MANDATORY for ALL API-dependent features:**

```typescript
// Capture ALL requests
page.on('request', request => {
  if (request.url().includes('/api/')) {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postDataJSON?.() || null,
    });
  }
});

// Capture ALL responses
page.on('response', async response => {
  if (response.url().includes('/api/')) {
    networkResponses.push({
      url: response.url(),
      status: response.status(),
      body: await response.json().catch(() => null),
    });
  }
});

// ASSERT: Verify API was actually called
const apiRequest = networkRequests.find(req => req.url.includes('/api/vibe/execute'));
expect(apiRequest).toBeDefined(); // ❌ THIS IS WHERE WE FAILED
expect(apiRequest.postData.executionMode).toBe('plan');
```

### Step 3: Add Console Log Assertions

**MANDATORY for ALL frontend execution:**

```typescript
// Expected console logs (from your implementation)
const expectedLogs = [
  '⚙️ [ChatInterface] PLAN MODE - Triggering vibe execution FIRST',
  '✅ [Vibe] Execution result:',
  '❓ [Plan Mode] AI needs clarification'
];

// Assert each expected log appears
for (const expectedLog of expectedLogs) {
  const found = consoleLogs.some(log => log.includes(expectedLog));
  expect(found).toBe(true); // ❌ THIS WOULD HAVE CAUGHT THE BUG
}
```

### Step 4: Add Screenshot Validation

**MANDATORY for ALL UI changes:**

```typescript
// Before action
await page.screenshot({ 
  path: 'evidence/screenshots/before-action.png',
  fullPage: true 
});

// Perform action
await page.click('[data-testid="button-build-mode"]');
await page.locator('[data-testid="input-message"]').fill('Add emoji');
await page.click('[data-testid="button-send"]');
await page.waitForTimeout(3000);

// After action
await page.screenshot({ 
  path: 'evidence/screenshots/after-action.png',
  fullPage: true 
});

// Verify visual change
const emoji = page.locator('text=😊');
await expect(emoji).toBeVisible(); // ❌ THIS PROVES IT WORKS
```

### Step 5: Test Error Handling

**MANDATORY for ALL async operations:**

```typescript
// Mock API failure
await page.route('**/api/vibe/execute', route => {
  route.fulfill({
    status: 500,
    body: JSON.stringify({ error: 'Server error' })
  });
});

// Perform action
await page.click('[data-testid="button-send"]');

// Verify graceful error handling
const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: 'failed' });
await expect(errorToast).toBeVisible();

// Verify fallback behavior
const chatResponse = page.locator('.message-bubble').last();
await expect(chatResponse).toBeVisible(); // Fallback to chat still works
```

### Step 6: Generate Evidence Bundle

**Run after ALL tests pass:**

```bash
npm run test:e2e:evidence
```

**Evidence Bundle Must Contain:**
```
evidence/
├── test-report.html              # Playwright HTML report
├── test-results.json             # Machine-readable results
├── screenshots/
│   ├── plan-mode-clarification.png
│   ├── build-mode-execution.png
│   └── ...
├── console-logs/
│   ├── plan-mode.log
│   ├── build-mode.log
│   └── ...
├── network-traces/
│   ├── plan-mode-requests.json
│   ├── build-mode-requests.json
│   └── test-har.har
└── EVIDENCE_BUNDLE_[timestamp].md
```

### Step 7: Architect Review

**MANDATORY before marking complete:**

```typescript
await architect({
  task: "Review Plan/Build mode implementation and test evidence",
  relevant_files: [
    "client/src/components/mrBlue/ChatInterface.tsx",
    "tests/e2e/plan-mode-clarification.spec.ts",
    "tests/e2e/build-mode-execution.spec.ts",
    "evidence/EVIDENCE_BUNDLE_latest.md"
  ],
  include_git_diff: true,
  responsibility: "evaluate_task"
});
```

**Architect Must Verify:**
- ✅ All tests pass (100% pass rate)
- ✅ Network traces show API calls
- ✅ Console logs match expected patterns
- ✅ Screenshots show visual proof
- ✅ Error handling works
- ✅ Code quality is acceptable

### Step 8: Mark Task Complete

**ONLY after Architect approval:**

```typescript
{
  "id": "1",
  "content": "Implement Plan/Build modes",
  "status": "completed",
  "architect_reviewed": "yes",
  "architect_reviewed_reason": "E2E tests pass, network traces confirm API calls, screenshots show working UI"
}
```

---

## 📋 DEPLOYMENT CHECKLIST

Before ANY deployment, ALL of these must be ✅:

### Required Tests (ALL MUST PASS)
- [ ] E2E user journey tests
- [ ] Network monitoring tests
- [ ] Console log validation tests
- [ ] Screenshot validation tests
- [ ] Error handling tests
- [ ] Visual regression tests
- [ ] Mode persistence tests

### Required Evidence
- [ ] Test report (HTML) generated
- [ ] Screenshots for all visual features
- [ ] Console logs for all execution paths
- [ ] Network traces (HAR files)
- [ ] Evidence bundle (Markdown)

### Required Validations
- [ ] 100% test pass rate
- [ ] No 400/500 HTTP errors
- [ ] No browser console errors
- [ ] No React warnings
- [ ] Network requests match spec
- [ ] Console logs match spec
- [ ] Screenshots match expectations

### Required Approvals
- [ ] Architect reviewed evidence
- [ ] Architect approved deployment
- [ ] All feedback addressed

---

## 🚫 FORBIDDEN CLAIMS

**NEVER say these without evidence:**

❌ "The feature is working"  
✅ "Tests passed + screenshot shows emoji appeared"

❌ "The API is being called"  
✅ "Network trace shows POST /api/vibe/execute at 14:32:15"

❌ "Logs confirm execution"  
✅ "Console log shows '✅ [Vibe] Execution result' at line 47"

❌ "All tests pass"  
✅ "Playwright report: 10/10 tests passed, evidence/test-report.html"

❌ "Everything works"  
✅ "Evidence bundle generated: evidence/EVIDENCE_BUNDLE_20251028.md"

---

## 🛠️ TOOLS & COMMANDS

### Run All E2E Tests
```bash
npm run test:e2e:plan-build
```

### Run Specific Test Project
```bash
npm run test:e2e:plan       # Plan mode only
npm run test:e2e:build      # Build mode only
npm run test:e2e:visual     # Visual regression
npm run test:e2e:network    # Network monitoring
npm run test:e2e:console    # Console validation
```

### Generate Evidence Bundle
```bash
npm run test:e2e:evidence
```

### Debug Tests
```bash
npm run test:debug          # Opens Playwright Inspector
npm run test:ui             # Opens Playwright UI mode
```

### View Test Report
```bash
open evidence/test-report/index.html
```

---

## 📊 SUCCESS METRICS

**Before Rule 8:**
- Features claimed working: 100%
- Features actually working: 0%
- User testing required: 100% of features
- Time wasted: Massive

**After Rule 8:**
- Features with E2E tests: 100%
- Features proven working: 100%
- User testing required: Edge cases only
- Time saved: Significant

---

## 🎓 LEARNING FROM FAILURE

**What We Learned:**
1. "Code compiles" ≠ "Feature works"
2. "Button exists" ≠ "Button does something"
3. "API exists" ≠ "API is called"
4. "Logs show something" ≠ "Right thing happens"

**What We Now Do:**
1. Test complete user journeys end-to-end
2. Verify network traffic (API actually called)
3. Assert console logs (execution path proven)
4. Capture screenshots (visual proof required)
5. Test error handling (graceful failures)
6. Generate evidence (deployment approval)

---

**Status**: MANDATORY  
**Enforcement**: Automated via MB.MD protocol  
**No Exceptions**: Features without E2E tests CANNOT be deployed  
**Violation**: Task marked incomplete until tests added
