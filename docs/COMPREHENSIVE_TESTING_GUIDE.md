# Comprehensive Testing Guide
**MB.MD Testing Infrastructure - October 28, 2025**

## Overview

This guide covers the complete testing suite for Mundo Tango's MB.MD autonomous mode, designed to provide 100% confidence for non-engineers through visual proof and automated testing.

---

## 📋 Testing Architecture

### 6 Feature-Based Test Projects

```
tests/e2e/
├── visual-editor/       # Element selection, inspector, styles, preview
├── mrblue-chat/         # Vibe coding, change queueing, AI responses
├── streaming-sync/      # Real-time chat/preview synchronization
├── voice-pipeline/      # Transcription, AI summarization, evidence
├── universal-save/      # Change collection, git commits
├── github-sync/         # Authentication, push workflow
└── role-based-access/   # Super admin vs regular user features
```

Each project runs **simultaneously** with dedicated evidence collection.

---

## 🚀 Running Tests

### Run All Tests (6 Projects in Parallel)

```bash
npm run test:e2e
```

### Run Specific Project

```bash
# Visual Editor only
npx playwright test --project=visual-editor

# Mr Blue Chat only
npx playwright test --project=mrblue-chat

# All role-based access tests
npx playwright test --project=role-based-access
```

### Run Specific Test File

```bash
# Element selection tests
npx playwright test tests/e2e/visual-editor/element-selection.spec.ts

# Vibe coding tests
npx playwright test tests/e2e/mrblue-chat/vibe-coding.spec.ts
```

### Run with UI Mode (Interactive)

```bash
npx playwright test --ui
```

This opens Playwright's interactive UI where you can:
- See tests running in real-time
- Inspect screenshots at each step
- Replay failed tests
- Time-travel through test execution

---

## 📸 Evidence Collection

Every test automatically collects:

1. **Screenshots** - Captured at each milestone
   - Location: `test-results/screenshots/{project}/{role}/`
   - Both light and dark mode for UI tests
   
2. **Videos** - Streaming behavior proof
   - Location: `test-results/videos/`
   - Shows real-time updates in action
   
3. **Playwright Traces** - Click-to-replay
   - Location: `test-results/traces/`
   - Open with: `npx playwright show-trace trace.zip`
   
4. **Evidence Manifests** - JSON summaries
   - Location: `test-results/evidence-manifests/`
   - Includes: test status, duration, feature flags, errors

### Viewing Evidence

```bash
# Open HTML report (includes all screenshots, videos, traces)
npx playwright show-report

# View specific trace
npx playwright show-trace test-results/traces/trace.zip

# Browse screenshots
open test-results/screenshots/visual-editor/super-admin/
```

---

## 🔐 Role-Based Testing

### Super Admin Tests

```bash
npx playwright test tests/e2e/role-based-access/super-admin-access.spec.ts
```

**Verifies:**
- ✅ Autonomous mode badge visible
- ✅ Can trigger 200-minute sessions
- ✅ Progress sidebar appears
- ✅ Full feature access

### Regular User Tests

```bash
npx playwright test tests/e2e/role-based-access/regular-user-access.spec.ts
```

**Verifies:**
- ❌ Autonomous mode badge NOT visible
- ❌ Cannot trigger autonomous sessions
- ✅ Basic chat features work
- ✅ Limited feature access

---

## 🎯 Test Coverage

### Visual Editor (4 test specs)
- ✅ Element selection with purple bounding box
- ✅ Inspector panel displays correct data
- ✅ Styles editing updates preview
- ✅ Console tab shows logs without errors

### Mr Blue Chat (4 test specs)
- ✅ Vibe coding auto-queues changes
- ✅ No "Apply" buttons (vibe coding UX)
- ✅ AI asks clarifying questions
- ✅ Autonomous mode for super admin only

### Streaming Sync (2 test specs)
- ✅ Chat and preview update simultaneously
- ✅ Streaming latency < 1000ms

### Voice Pipeline (3 test specs)
- ✅ Voice transcription displays live
- ✅ AI summarization streams to chat
- ✅ Transcripts stored in MB.MD session evidence

### Universal Save (3 test specs)
- ✅ Changes auto-queue (no Apply button)
- ✅ AI-powered git commit messages (Agent #126)
- ✅ No data loss on cancel

### GitHub Sync (2 test specs)
- ✅ Authentication flow works
- ✅ Push to remote successful
- ✅ Branch management

---

## 🔧 Fixtures & Utilities

### Feature Flags

```typescript
import { enableAutonomousMode, resetFeatureFlags } from '../../fixtures/feature-flags';

// Enable autonomous mode
await enableAutonomousMode(request);

// Reset to defaults
await resetFeatureFlags(request);
```

### MB.MD Sessions

```typescript
import { createMBMDSession, waitForSessionComplete } from '../../fixtures/mbmd-session';

// Create session
const session = await createMBMDSession(request, conversationId, 'Build landing page');

// Wait for completion
await waitForSessionComplete(request, session.id);
```

### Evidence Collection

```typescript
import { EvidenceCollector } from '../../support/evidence';

// Initialize
const evidence = new EvidenceCollector(page, test.info(), 'super-admin');

// Capture screenshot
await evidence.captureScreenshot('step-name');

// Capture both themes
await evidence.captureDualThemeScreenshot('feature-complete');

// Save manifest
await evidence.saveManifest();
```

---

## 📊 CI/CD Integration

Tests run automatically on every push:

```yaml
# .github/workflows/e2e-comprehensive.yml
# Runs all 6 projects in parallel
```

**Artifacts uploaded:**
- Test results (JSON, HTML)
- Screenshots (PNG)
- Videos (WebM)
- Traces (ZIP)
- Evidence manifests (JSON)

---

## ✅ Deployment Checklist

Before enabling autonomous mode in production:

- [ ] All 6 test projects pass
- [ ] Super admin tests pass (autonomous mode visible)
- [ ] Regular user tests pass (autonomous mode hidden)
- [ ] Evidence package reviewed by architect
- [ ] No console errors in any test
- [ ] Streaming latency < 1000ms
- [ ] Git commits generated successfully
- [ ] GitHub sync works

---

## 🐛 Debugging Failed Tests

### 1. View HTML Report

```bash
npx playwright show-report
```

Click on failed test → See screenshots, videos, traces

### 2. Run in UI Mode

```bash
npx playwright test --ui
```

Watch test execute step-by-step, inspect at any point

### 3. View Trace

```bash
npx playwright show-trace test-results/trace.zip
```

Time-travel through entire test execution

### 4. Check Evidence Manifest

```bash
cat test-results/evidence-manifests/visual-editor/test-name.json
```

See feature flags, console logs, errors

---

## 📝 Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from '../../helpers/auth';
import { EvidenceCollector } from '../../support/evidence';

test.describe('Feature Name', () => {
  let evidence: EvidenceCollector;
  
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
    evidence = new EvidenceCollector(page, test.info(), 'super-admin');
  });
  
  test.afterEach(async () => {
    await evidence.setStatus(
      test.info().status === 'passed' ? 'passed' : 'failed',
      test.info().duration
    );
    await evidence.saveManifest();
  });
  
  test('test name', async ({ page }) => {
    // Navigate
    await page.goto('/?edit=true');
    await evidence.captureScreenshot('01-loaded');
    
    // Interact
    await page.click('[data-testid="button-action"]');
    await evidence.captureScreenshot('02-action-clicked');
    
    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
    await evidence.captureScreenshot('03-result-visible');
    
    // No errors
    expect(evidence.hasErrors()).toBe(false);
  });
});
```

---

## 🎊 Success Criteria

**100% Confidence When:**
- ✅ All tests pass in CI
- ✅ Screenshot evidence shows features working
- ✅ Video proof of streaming behavior
- ✅ No console errors in evidence
- ✅ Role-based access validated
- ✅ Architect approves evidence package

---

**Ready to test? Run:**

```bash
npm run test:e2e
```

Then view results:

```bash
npx playwright show-report
```
