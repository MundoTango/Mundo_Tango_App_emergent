# E2E Test Specification - Mr Blue Plan/Build Modes
**Created**: October 28, 2025  
**Purpose**: Comprehensive user journey validation with network monitoring, console assertions, and visual proof

---

## **Testing Philosophy**

### **What We Previously Failed To Test**
1. ❌ Complete user journeys (click → action → result)
2. ❌ Network traffic (was vibe API actually called?)
3. ❌ Frontend-to-backend integration
4. ❌ Visual changes (did the emoji actually appear?)
5. ❌ Console logs (did executeVibeCoding run?)

### **New Testing Standards (MANDATORY)**
1. ✅ **E2E User Journeys** - Simulate real user workflows
2. ✅ **Network Request Monitoring** - Assert HTTP calls are made
3. ✅ **Console Log Assertions** - Verify frontend execution
4. ✅ **Screenshot Validation** - Visual proof of changes
5. ✅ **Browser State Inspection** - Check DOM changes

---

## **Test Suite Structure**

### **Project: plan-mode-tests**
Tests for Plan Mode (clarifying questions before execution)

### **Project: build-mode-tests**
Tests for Build Mode (immediate execution)

### **Project: visual-editor-integration**
Tests for element selection + vibe coding

### **Project: auto-queue-badge**
Tests for change queueing system

### **Project: universal-save-system**
Tests for SAVE button and Git commits

---

## **Test Scenarios (ALL MUST PASS)**

### **1. PLAN MODE - Clarification Questions**

**User Journey:**
1. User opens Mr Blue chat in Visual Editor
2. User clicks "Plan" mode (cyan button)
3. User sends: "Redesign the homepage"
4. System should ask clarifying questions
5. User should NOT see code execution

**Test: test-plan-mode-clarification.spec.ts**

**Assertions:**
- ✅ Plan button is clickable
- ✅ Plan button shows cyan background when active
- ✅ User can type message
- ✅ Send button is enabled
- ✅ Network: POST to `/api/vibe/execute` with `executionMode: 'plan'`
- ✅ Console log: "⚙️ [ChatInterface] PLAN MODE - Triggering vibe execution FIRST"
- ✅ Response has `status: 'needs_clarification'`
- ✅ Response has `clarificationQuestion` field
- ✅ Clarification question appears in chat UI
- ✅ Toast notification shows "❓ Clarifying question"
- ✅ NO code changes applied (verify by checking file system)
- ✅ Screenshot: Shows clarification question in chat

**Expected Console Logs:**
```
⚙️ [ChatInterface] PLAN MODE - Triggering vibe execution FIRST
✅ [Vibe] Execution result: {status: 'needs_clarification', ...}
❓ [Plan Mode] AI needs clarification
```

**Expected Network Requests:**
```
POST /api/vibe/execute
Body: {
  message: "Redesign the homepage",
  executionMode: "plan",
  selectedElement: null,
  previewPath: "/"
}
Response: {
  status: "needs_clarification",
  clarificationQuestion: "What style would you like?..."
}
```

---

### **2. BUILD MODE - Immediate Execution**

**User Journey:**
1. User opens Mr Blue chat in Visual Editor
2. User clicks "Build" mode (green button)
3. User sends: "Add a smiley emoji 😊 to the homepage"
4. System should apply changes immediately
5. User should see emoji on the page

**Test: test-build-mode-execution.spec.ts**

**Assertions:**
- ✅ Build button is clickable
- ✅ Build button shows green background when active
- ✅ User can type message
- ✅ Send button is enabled
- ✅ Network: POST to `/api/vibe/execute` with `executionMode: 'build'`
- ✅ Console log: "⚙️ [ChatInterface] BUILD MODE - Triggering vibe execution FIRST"
- ✅ Response has `codeChanges` array
- ✅ Console log: "🚀 [Build Mode] Applying X change(s)"
- ✅ Console log: Calls to `applyCodeChange` for each file
- ✅ Toast notification shows "✅ Changes applied"
- ✅ Toast shows correct file count
- ✅ Preview iframe reloads
- ✅ Emoji appears in the DOM
- ✅ Screenshot: Shows emoji on homepage

**Expected Console Logs:**
```
⚙️ [ChatInterface] BUILD MODE - Triggering vibe execution FIRST
✅ [Vibe] Execution result: {status: 'success', codeChanges: [...]}
🚀 [Build Mode] Applying 1 change(s)
```

**Expected Network Requests:**
```
POST /api/vibe/execute
Body: {
  message: "Add a smiley emoji 😊 to the homepage",
  executionMode: "build",
  selectedElement: null,
  previewPath: "/"
}
Response: {
  status: "success",
  codeChanges: [{
    filePath: "client/src/pages/Home.tsx",
    diff: "...",
    type: "unified_diff"
  }]
}

POST /api/vibe/apply
Body: {
  filePath: "client/src/pages/Home.tsx",
  diff: "...",
  editType: "unified_diff"
}
```

---

### **3. VISUAL EDITOR INTEGRATION - Element Selection**

**User Journey:**
1. User opens Visual Editor
2. User clicks an element (purple bounding box appears)
3. User opens Mr Blue chat (element context preserved)
4. User switches to Build mode
5. User sends: "Make this bigger"
6. System should modify the SELECTED element

**Test: test-element-selection-context.spec.ts**

**Assertions:**
- ✅ User can click elements in preview
- ✅ Purple bounding box appears on click
- ✅ Inspector panel shows element details
- ✅ Mr Blue chat receives selectedElement context
- ✅ Console log shows element XPath
- ✅ Network: POST to `/api/vibe/execute` includes `selectedElement` with XPath
- ✅ Code changes target the correct element
- ✅ Element size increases in preview
- ✅ Screenshot: Before and after comparison

**Expected Network Request:**
```
POST /api/vibe/execute
Body: {
  message: "Make this bigger",
  executionMode: "build",
  selectedElement: {
    xpath: "/html/body/div[1]/h1",
    tagName: "H1",
    className: "welcome-heading"
  },
  previewPath: "/"
}
```

---

### **4. AUTO-QUEUE BADGE - Change Tracking**

**User Journey:**
1. User makes changes in Build mode
2. Auto-queue badge shows count
3. User makes more changes
4. Badge count increments
5. User can click badge to see pending changes

**Test: test-auto-queue-badge.spec.ts**

**Assertions:**
- ✅ Badge initially shows 0 or is hidden
- ✅ After first change, badge shows "1"
- ✅ Badge is visible and styled correctly
- ✅ After second change, badge shows "2"
- ✅ Clicking badge opens pending changes dropdown
- ✅ Dropdown lists all queued changes
- ✅ Each change shows file path and preview
- ✅ Screenshot: Badge with count visible

---

### **5. UNIVERSAL SAVE SYSTEM - Git Commits**

**User Journey:**
1. User makes multiple changes in Build mode
2. Changes are queued (not committed)
3. User clicks SAVE button
4. System creates Git commit with all changes
5. User sees success notification

**Test: test-universal-save-system.spec.ts**

**Assertions:**
- ✅ SAVE button is visible
- ✅ SAVE button shows pending count badge
- ✅ Network: POST to `/api/git/commit` when SAVE clicked
- ✅ Request includes all queued file paths
- ✅ Response confirms commit created
- ✅ Toast shows "✅ Changes saved to Git"
- ✅ Pending changes badge resets to 0
- ✅ Git log shows new commit
- ✅ Screenshot: Success notification

---

### **6. MODE TOGGLE PERSISTENCE**

**User Journey:**
1. User selects Build mode
2. User sends a message
3. User refreshes page or closes/reopens chat
4. Mode should persist (localStorage)

**Test: test-mode-persistence.spec.ts**

**Assertions:**
- ✅ executionMode saved to localStorage
- ✅ After page reload, correct mode is active
- ✅ Button state matches localStorage value

---

### **7. ERROR HANDLING - Vibe API Failure**

**User Journey:**
1. User sends request in Build mode
2. Vibe API returns error
3. System should show error toast
4. System should fall back to chat streaming

**Test: test-error-handling.spec.ts**

**Assertions:**
- ✅ Mock `/api/vibe/execute` to return 500 error
- ✅ Console log: "❌ [Vibe] Execution failed"
- ✅ Toast shows "Vibe coding failed"
- ✅ Chat streaming continues as fallback
- ✅ User gets text response even if vibe fails

---

### **8. NETWORK REQUEST VALIDATION**

**User Journey:**
1. Monitor all network traffic during Plan/Build operations
2. Verify correct endpoints are called
3. Verify request bodies are correct
4. Verify responses match schemas

**Test: test-network-monitoring.spec.ts**

**Assertions:**
- ✅ No duplicate `/api/vibe/execute` calls (dedupe works)
- ✅ Request bodies include all required fields
- ✅ Responses match TypeScript interfaces
- ✅ No 400/500 errors during normal operation
- ✅ CORS headers present
- ✅ Authentication cookies sent

---

### **9. CONSOLE LOG VALIDATION**

**User Journey:**
1. Capture all console logs during test
2. Assert expected log messages appear
3. Assert no error logs (except expected test errors)

**Test: test-console-log-validation.spec.ts**

**Assertions:**
- ✅ Plan mode logs: "PLAN MODE - Triggering vibe execution FIRST"
- ✅ Build mode logs: "BUILD MODE - Triggering vibe execution FIRST"
- ✅ Vibe execution logs: "✅ [Vibe] Execution result"
- ✅ No unhandled promise rejections
- ✅ No React warnings in console
- ✅ No CORS errors

---

### **10. VISUAL REGRESSION TESTING**

**User Journey:**
1. Take screenshots at each step
2. Compare with baseline images
3. Detect unintended visual changes

**Test: test-visual-regression.spec.ts**

**Assertions:**
- ✅ Plan mode button styling (cyan)
- ✅ Build mode button styling (green)
- ✅ Purple bounding box appearance
- ✅ Auto-queue badge styling
- ✅ Toast notifications styling
- ✅ Modal dialogs styling

---

## **Test Data Requirements**

### **Mock Backend Responses**

**Plan Mode Clarification:**
```json
{
  "status": "needs_clarification",
  "clarificationQuestion": "To redesign the homepage, I need to know:\n1. What style are you aiming for? (modern, classic, minimalist, etc.)\n2. Which sections should be changed?\n3. What color scheme do you prefer?",
  "sessionId": "test-session-123"
}
```

**Build Mode Success:**
```json
{
  "status": "success",
  "codeChanges": [
    {
      "filePath": "client/src/pages/Home.tsx",
      "diff": "@@ -10,0 +11,1 @@\n+      <p>😊</p>",
      "type": "unified_diff",
      "description": "Added smiley emoji to homepage"
    }
  ],
  "sessionId": "test-session-124"
}
```

---

## **Test Infrastructure**

### **Required Playwright Fixtures**
1. `authenticatedPage` - Page with user logged in
2. `visualEditorPage` - Page with Visual Editor loaded
3. `networkMonitor` - Tracks all HTTP requests
4. `consoleLogger` - Captures console messages

### **Required Utilities**
1. `waitForVibeExecution()` - Wait for vibe API call
2. `waitForToast()` - Wait for toast notification
3. `assertElementChanged()` - Verify DOM changes
4. `compareScreenshots()` - Visual regression

---

## **Success Criteria (ALL MUST PASS)**

Before claiming "Plan/Build modes work", ALL of these must be true:

1. ✅ All 10 test suites pass (100% pass rate)
2. ✅ Network monitoring confirms API calls
3. ✅ Console logs match expected patterns
4. ✅ Screenshots show visual changes
5. ✅ No errors in browser console
6. ✅ No 400/500 HTTP errors
7. ✅ Test coverage ≥ 90% for vibe coding code paths
8. ✅ Visual regression tests pass
9. ✅ Error handling tests pass
10. ✅ Tests run in CI/CD pipeline

---

## **Test Execution Protocol**

### **Before Any Deployment**
1. Run full test suite locally
2. Generate HTML test report
3. Capture screenshots for all visual tests
4. Review console logs for warnings
5. Check network traffic logs
6. Fix any failures
7. Re-run until 100% pass
8. Generate evidence bundle (screenshots + logs + report)

### **Evidence Bundle Contents**
```
evidence/
├── test-report.html          # Playwright HTML report
├── screenshots/
│   ├── plan-mode-clarification.png
│   ├── build-mode-execution.png
│   ├── element-selection.png
│   └── ...
├── console-logs/
│   ├── plan-mode.log
│   ├── build-mode.log
│   └── ...
├── network-traces/
│   ├── plan-mode-requests.har
│   ├── build-mode-requests.har
│   └── ...
└── coverage/
    └── coverage-report.html
```

---

## **Integration with MB.MD Protocol**

Add to `docs/MB_MD_QA_PROTOCOL.md`:

### **Rule 8: E2E Testing Before Deployment (MANDATORY)**

Before marking ANY task as complete:

1. ✅ Write E2E Playwright tests for user journey
2. ✅ Add network request monitoring
3. ✅ Add console log assertions
4. ✅ Add screenshot validation
5. ✅ Run tests and generate evidence bundle
6. ✅ All tests must pass (100%)
7. ✅ Architect reviews evidence bundle
8. ✅ Only then: Mark task complete

**NO EXCEPTIONS** - This is now part of the definition of "done".

---

**Document Status**: APPROVED  
**Next Step**: Build all 10 test suites simultaneously
