# Upgraded UI Testing Protocol  
**Created:** Oct 26, 2025 11:58 PM UTC  
**Purpose:** Prevent "logs say working, UI is broken" disconnects  
**Critical User Context:** Non-engineer, only sees UI, needs visual proof

---

## 🚨 THE FUNDAMENTAL PROBLEM

### What's Been Happening
**Agent's Perspective:**
```
✅ Code compiles
✅ LSP shows 0 errors
✅ Server logs show "✅ changes queued"
✅ Vite HMR working
→ Agent marks feature as "FIXED" ✅
```

**User's Reality:**
```
❌ Inspector text edit: SAVE button never updates
❌ Mr Blue chat: Says "will do work" but NOTHING happens
❌ Voice recording: Stuck on "loading" forever
❌ Element selection: Redirects to Inspector instead of staying on Mr Blue
→ User sees COMPLETELY BROKEN UI ❌
```

### Why This Disconnect Exists
1. **Server logs ≠ UI rendering** - EventSource success doesn't mean DOM updates
2. **State updates ≠ UI re-renders** - React state can update without components re-rendering
3. **Code compiles ≠ events wired** - Event handlers can exist but never get called
4. **No screenshots = no proof** - Without visual evidence, claims are unverified

---

## 🎯 NEW MANDATORY VERIFICATION PROTOCOL

### Before Claiming ANY Feature "Fixed" - ALL 5 Steps Required:

#### ✅ STEP 1: Screenshot Proof (MANDATORY)
- **What:** Take screenshot of ACTUAL UI showing feature working
- **How:** Use screenshot tool after clicking buttons/typing text
- **Example:** 
  ```
  1. Open Visual Editor
  2. Click element in preview
  3. Type in Inspector text field
  4. Screenshot: SAVE button showing badge "1"
  ```

#### ✅ STEP 2: User Journey Test (MANDATORY)
- **What:** Click through FULL user flow (no shortcuts)
- **How:** Mimic exact user actions from screenshots
- **Example:**
  ```
  User Journey: Edit Inspector Text → SAVE Changes
  1. Open editor → Mr Blue tab visible
  2. Select element → Element highlights in preview
  3. Type in Inspector field → Text updates in input
  4. Check SAVE button → Badge shows "1"
  5. Click SAVE → Changes applied to file
  ```

#### ✅ STEP 3: Playwright E2E Test (MANDATORY)
- **What:** Automated test that clicks/types/verifies UI
- **How:** Write Playwright spec that mimics user actions
- **Example:**
  ```typescript
  test('Inspector text edit enables SAVE button', async ({ page }) => {
    await page.goto('/admin/visual-editor');
    await page.locator('[data-testid="input-element-text"]').fill('New text');
    await expect(page.locator('[data-testid="button-save"]')).toContainText('1');
  });
  ```

#### ✅ STEP 4: React DevTools Verification (MANDATORY)
- **What:** Verify state updates AND DOM re-renders
- **How:** Open React DevTools, watch component state during action
- **Example:**
  ```
  Component: VisualEditorContext
  State to watch: pendingCodeChanges
  Action: Type in Inspector field
  Expected: Array updates from [] to [{...}]
  Actual: Verify array updates AND UniversalSaveSystem re-renders
  ```

#### ✅ STEP 5: Network Tab Confirmation (MANDATORY)
- **What:** Confirm API requests succeed AND responses render
- **How:** Open DevTools Network tab, perform action, verify request/response
- **Example:**
  ```
  Action: Click SAVE button
  Network Tab:
    ✅ POST /api/vibe/batch status: 200
    ✅ Response: { "summary": { "applied": 1 } }
  UI Check:
    ✅ File content updates in preview
    ✅ Success toast appears
  ```

---

## 🚫 FORBIDDEN CLAIMS (User Can't Verify These)

### ❌ "Logs show it's working"
**Why forbidden:** User can't see server logs  
**What to do instead:** Take screenshot of UI change

### ❌ "Code compiles"
**Why forbidden:** Compilation ≠ functionality  
**What to do instead:** Test actual user interaction

### ❌ "State updated"
**Why forbidden:** State update ≠ DOM render  
**What to do instead:** Verify component re-renders

### ❌ "Event fired"
**Why forbidden:** Event ≠ user-visible change  
**What to do instead:** Screenshot the visual result

### ❌ "API returned 200"
**Why forbidden:** API success ≠ UI updated  
**What to do instead:** Verify response data renders in UI

---

## 📋 REQUIRED EVIDENCE FORMAT

When marking a task as "completed", provide:

```markdown
✅ Feature: [Name of feature]
📸 Screenshot: test-screenshots/[feature-name].png
🧪 Playwright: tests/[feature-name].spec.ts PASSED
🔍 User Journey: [Step 1] → [Step 2] → [Step 3] → ✅ Expected result achieved
🛠️ DevTools: State updated from [before] to [after], component re-rendered
🌐 Network: [API endpoint] returned 200, response data visible in UI
```

### Example: Inspector Text Edit

```markdown
✅ Feature: Inspector text edit saves to SAVE button
📸 Screenshot: test-screenshots/inspector-text-save.png
🧪 Playwright: tests/inspector-text-save.spec.ts PASSED
🔍 User Journey:
  1. Select element in preview → Element highlights
  2. Type "New text" in Inspector field → Input updates
  3. Check SAVE button → Badge shows "1"
  4. Click SAVE → File updates in preview
🛠️ DevTools:
  - Component: VisualEditorContext
  - State: pendingCodeChanges updated from [] to [{ id: "inspector-1", ... }]
  - Re-render: UniversalSaveSystem badge changed from "" to "1"
🌐 Network:
  - POST /api/vibe/batch returned 200
  - Response: { "summary": { "applied": 1, "failed": 0 } }
  - UI: Preview iframe reloaded with new text visible
```

---

## 🧪 PLAYWRIGHT INTEGRATION GUIDE

### Setup (One-Time)
```bash
# Install Playwright
npm install -D @playwright/test

# Create test directory
mkdir -p tests/e2e

# Create playwright.config.ts
npx playwright install
```

### Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('[Feature Name] User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000/[route]');
  });

  test('should [expected behavior]', async ({ page }) => {
    // 1. Arrange: Setup initial state
    await page.waitForSelector('[data-testid="target-element"]');
    
    // 2. Act: Perform user action
    await page.locator('[data-testid="input-field"]').fill('Test input');
    await page.locator('[data-testid="button-submit"]').click();
    
    // 3. Assert: Verify UI change
    await expect(page.locator('[data-testid="result"]')).toContainText('Expected');
    
    // 4. Screenshot: Visual proof
    await page.screenshot({ 
      path: 'test-screenshots/feature-name.png',
      fullPage: true 
    });
  });
});
```

### Running Tests
```bash
# Run all tests
npm run test:e2e

# Run specific test
npx playwright test tests/e2e/inspector-save.spec.ts

# Run with UI (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

---

## 🔍 BROWSER DEVTOOLS CHECKLIST

### Before Every Test
1. ✅ Open DevTools (F12 or Cmd+Option+I)
2. ✅ Open **Console** tab - check for errors
3. ✅ Open **Network** tab - filter to XHR/Fetch
4. ✅ Open **React DevTools** - find component with state
5. ✅ Clear all tabs (right-click → Clear)

### During Test
1. ✅ **Console Tab:** Log all user actions
   ```javascript
   console.log('🎯 User clicked element:', element);
   ```

2. ✅ **Network Tab:** Verify API calls
   - Check request payload
   - Check response status
   - Check response body

3. ✅ **React DevTools:** Watch state updates
   - Select component
   - Expand state/props
   - Perform action
   - Verify state changes

### After Test
1. ✅ Screenshot console logs (if errors)
2. ✅ Screenshot network tab (if API fails)
3. ✅ Screenshot React DevTools (if state doesn't update)
4. ✅ Save all screenshots to `test-screenshots/[feature]-[step].png`

---

## 📸 SCREENSHOT TOOL INTEGRATION

### When to Use Screenshot Tool
- ✅ After clicking buttons
- ✅ After typing in fields
- ✅ After modals open/close
- ✅ After page navigations
- ✅ Before marking task complete

### How to Use
```typescript
// In Playwright tests
await page.screenshot({ 
  path: 'test-screenshots/feature-name.png',
  fullPage: true  // Capture entire page, not just viewport
});

// Via screenshot tool (for manual verification)
screenshot({ path: '/admin/visual-editor' })
```

### Screenshot Naming Convention
```
test-screenshots/
  ├── inspector-text-edit-before.png
  ├── inspector-text-edit-typing.png
  ├── inspector-text-edit-save-badge.png
  ├── inspector-text-edit-after-save.png
  ├── mr-blue-chat-before-send.png
  ├── mr-blue-chat-message-sent.png
  ├── mr-blue-chat-ai-response.png
  └── voice-recording-modal-opened.png
```

---

## 🚀 IMMEDIATE ACTION ITEMS

### For Current 4 Broken Features

1. **Inspector Text Edit:**
   ```bash
   # Research
   - Read InspectorPanel.tsx onChange event wiring
   - Verify setPendingCodeChanges() called when typing
   - Check UniversalSaveSystem badge reads pendingCodeChanges.length
   
   # Test
   - Screenshot: Before typing
   - Screenshot: After typing (badge should show "1")
   - Screenshot: After clicking SAVE (changes applied)
   
   # Playwright
   - Write: tests/e2e/inspector-text-save.spec.ts
   ```

2. **Mr Blue Chat:**
   ```bash
   # Research
   - Read ChatInterface.tsx lines 398-711 (sendMessageToConversation)
   - Find EventSource onmessage handlers
   - Verify setState calls for UI updates
   
   # Test
   - Screenshot: Before send (message typed)
   - Screenshot: After send (user message visible)
   - Screenshot: AI response rendered
   
   # Playwright
   - Write: tests/e2e/mr-blue-chat.spec.ts
   ```

3. **Voice Recording:**
   ```bash
   # Research
   - Read UnifiedVoiceModal.tsx realtimeStatus logic
   - Check connect() function updates state
   - Look for microphone permission errors
   
   # Test
   - Screenshot: Modal opened
   - Screenshot: Recording active (waveform visible)
   - Screenshot: Transcription appears
   
   # Playwright
   - Write: tests/e2e/voice-recording.spec.ts
   ```

4. **Tab Switching:**
   ```bash
   # Research
   - Verify default tab is 'chat' (Mr Blue)
   - Check if VisualEditorPage.tsx switches tabs
   - User clarification: What tab shows after element selection?
   
   # Test
   - Screenshot: Visual Editor opened (default tab)
   - Screenshot: After clicking element (tab should NOT change)
   
   # Playwright
   - Write: tests/e2e/tab-switching.spec.ts
   ```

---

## 📝 MB.MD PROTOCOL UPDATE

### Add to `docs/MB_MD_QA_PROTOCOL.md`:

```markdown
## 🎯 PRIMARY USER PROFILE (CRITICAL)

**Technical Level:** Non-engineer  
**Interface:** UI only (no access to logs, code, terminal)  
**Communication Style:** Simple, everyday language  
**Frustration Trigger:** Agent claims "works" based on logs, but UI is broken

### MANDATORY Before Claiming "Fixed":
1. ✅ Screenshot proof of UI working
2. ✅ Full user journey test (click/type/verify)
3. ✅ Playwright E2E test passing
4. ✅ React DevTools state + DOM verification
5. ✅ Network tab API + UI render confirmation

### FORBIDDEN Without Visual Proof:
- ❌ "Logs show working"
- ❌ "Code compiles"
- ❌ "State updated"
- ❌ "Event fired"
- ❌ "API returned 200"

**All claims MUST be backed by screenshots or Playwright test results.**
```

---

## ✅ CHECKLIST: Before Marking Task Complete

- [ ] Took screenshots at EVERY step of user journey
- [ ] Tested full flow as regular user (not just code paths)
- [ ] Wrote Playwright E2E test that PASSES
- [ ] Verified state updates in React DevTools
- [ ] Confirmed API requests succeed in Network tab
- [ ] Checked that response data renders in UI
- [ ] No console errors during test
- [ ] User can reproduce success (visual proof)

**If ANY checkbox is unchecked → DO NOT MARK COMPLETE**

---

**Status:** PROTOCOL CREATED - Ready for implementation  
**Next:** Apply to all 4 current broken features  
**Goal:** Zero "logs say working, UI is broken" incidents
