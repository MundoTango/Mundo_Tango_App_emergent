# Comprehensive UI Testing & Debugging Plan
**Created:** Oct 26, 2025  
**Critical Context:** User is non-engineer, only sees UI, frustrated by repeated "logs say working but UI is broken" issues

## 🚨 ROOT CAUSE ANALYSIS (From Architect)

### Issue #1: Inspector Tab Text Edits NOT Saving
**Problem:** UniversalSaveSystem relies on `VisualEditorContext.pendingCodeChanges`, but Inspector edits never call `addCodeChange()`
- **Broken Code Path:** Inspector edit → ??? → SAVE button (missing link!)
- **Expected:** Inspector edit → `addCodeChange()` → context updates → SAVE button enables
- **Actual:** Inspector edit → NOTHING → SAVE button stays disabled

**Files to Investigate:**
- `client/src/components/visual-editor/InspectorTab.tsx` - WHERE is text edit handler?
- `client/src/lib/visual-editor/codeGeneration.ts` - does it call `addCodeChange()`?
- `client/src/contexts/VisualEditorContext.tsx` - is `addCodeChange()` exported?

### Issue #2: Mr Blue Chat Says "Will Do" But Does Nothing
**Problem:** ChatInterface streams responses via SSE, but React state updates don't guarantee DOM rendering
- **Broken Code Path:** User message → `executeVibeCoding()` → SSE streaming → ??? → DOM update (missing!)
- **Expected:** Streaming response → `setOptimisticMessage()` → React re-render → user sees messages
- **Actual:** Streaming response → state updates → NO visible UI change

**Files to Investigate:**
- `client/src/components/mrBlue/ChatInterface.tsx` - `optimisticMessage` state
- `client/src/lib/vibeApi.ts` - `executeVibeCoding()` EventSource
- React DevTools → check if state updates but component doesn't re-render

### Issue #3: Voice Recording Shows "Loading" Forever
**Problem:** UnifiedVoiceModal gates on `realtimeStatus/connect()` but never confirms microphone activation
- **Broken Code Path:** Click record → `connect()` → microphone permission → ??? (hangs)
- **Expected:** Microphone permission → `realtimeStatus: 'connected'` → recording starts
- **Actual:** Microphone permission → stuck in "loading" state

**Files to Investigate:**
- `client/src/components/mrBlue/UnifiedVoiceModal.tsx` - `realtimeStatus` state
- Browser DevTools Console → microphone permission errors?

### Issue #4: Element Selection Redirects to Inspector Tab
**Problem:** Element selection changes active tab instead of preserving current tab
- **Broken Code Path:** Click element in preview → element selection event → ??? → tab switches
- **Expected:** Click element → `setSelectedElement()` → tab stays same
- **Actual:** Click element → `setActiveTab('inspector')` somewhere

**Files to Investigate:**
- `client/src/components/visual-editor/VisualEditorWrapper.tsx` - tab switching logic
- `client/src/lib/visual-editor/iframeMessaging.ts` - element selection events

---

## 🔍 RESEARCH PHASE (Do NOT Build Anything)

### Step 1: Trace Code Execution Paths
Use grep to find event handlers and state updates:

```bash
# Inspector text edit handler
grep -r "onTextChange\|handleTextEdit\|editText" client/src/components/visual-editor/
grep -r "addCodeChange" client/src/

# Mr Blue message sending
grep -r "handleSendMessage\|sendMessage\|executeVibeCoding" client/src/components/mrBlue/
grep -r "optimisticMessage\|streamingResponse" client/src/components/mrBlue/

# Voice recording
grep -r "startRecording\|handleRecord\|realtimeStatus" client/src/components/mrBlue/
grep -r "microphone\|getUserMedia" client/src/

# Tab switching on element selection
grep -r "setActiveTab\|activeTab.*inspector" client/src/components/visual-editor/
grep -r "ELEMENT_SELECTED" client/src/
```

### Step 2: Screenshot Tool Manual Verification
Take screenshots at EVERY step of user journey:

**Inspector Tab Flow:**
1. Screenshot: Visual Editor opened, Inspector tab active
2. Screenshot: Element selected (should show in Inspector panel)
3. Screenshot: Text edited in Inspector field
4. Screenshot: SAVE button (should show badge "1" if change queued)
5. Screenshot: After clicking SAVE (should apply changes)

**Mr Blue Chat Flow:**
1. Screenshot: Mr Blue tab opened
2. Screenshot: Message typed in input field
3. Screenshot: After clicking send (should show user message bubble)
4. Screenshot: AI streaming response (should show typing indicator)
5. Screenshot: Final response rendered (should show AI message bubble)

**Voice Recording Flow:**
1. Screenshot: Voice modal opened
2. Screenshot: After clicking record button (should show "Recording...")
3. Screenshot: While recording (should show waveform visualization)
4. Screenshot: After stopping (should show transcription)

### Step 3: Browser Console Analysis
Compare browser console logs with actual UI state:

**For Each Broken Feature:**
1. Open DevTools Console
2. Open React DevTools (Components tab)
3. Perform user action (edit text, send message, record voice)
4. Check:
   - ✅ Console logs say "queued" → React DevTools shows `pendingCodeChanges` updated?
   - ✅ Console logs say "streaming" → React DevTools shows `streamingResponse` updated?
   - ✅ State updated → DOM actually re-rendered?

### Step 4: Network Tab Inspection
Verify API calls actually happen:

1. Open DevTools Network tab
2. Filter: XHR/Fetch only
3. Perform action (edit, send, record)
4. Check:
   - ✅ POST request sent to `/api/vibe/execute`?
   - ✅ EventSource connection opened?
   - ✅ Response status 200?
   - ✅ Response body contains expected data?

---

## 🧪 PLAYWRIGHT E2E TEST SUITE (Create After Research)

### Test 1: Inspector Text Edit → SAVE Flow
```typescript
test('Inspector text edit should enable SAVE button', async ({ page }) => {
  // 1. Navigate to Visual Editor
  await page.goto('/admin/visual-editor');
  
  // 2. Click element in preview iframe
  const iframe = page.frameLocator('iframe[title="Preview"]');
  await iframe.locator('div.welcome-text').click();
  
  // 3. Switch to Inspector tab
  await page.locator('[data-testid="tab-inspector"]').click();
  
  // 4. Edit text in Inspector field
  await page.locator('[data-testid="input-element-text"]').fill('New text');
  
  // 5. Verify SAVE button shows badge
  await expect(page.locator('[data-testid="button-save"]')).toContainText('1');
  
  // 6. Screenshot proof
  await page.screenshot({ path: 'test-screenshots/inspector-text-edit.png' });
});
```

### Test 2: Mr Blue Chat Message Flow
```typescript
test('Mr Blue chat should show AI response', async ({ page }) => {
  // 1. Navigate to Mr Blue
  await page.goto('/life-ceo');
  
  // 2. Type message
  await page.locator('[data-testid="input-chat-message"]').fill('Make background red');
  
  // 3. Send message
  await page.locator('[data-testid="button-send-message"]').click();
  
  // 4. Wait for AI response (max 10s)
  await page.waitForSelector('[data-testid="message-ai"]', { timeout: 10000 });
  
  // 5. Verify response rendered
  const aiMessage = await page.locator('[data-testid="message-ai"]').last();
  await expect(aiMessage).toBeVisible();
  
  // 6. Screenshot proof
  await page.screenshot({ path: 'test-screenshots/mr-blue-chat.png' });
});
```

### Test 3: Voice Recording Flow
```typescript
test('Voice modal should start recording', async ({ page, context }) => {
  // Grant microphone permission
  await context.grantPermissions(['microphone']);
  
  // 1. Open voice modal
  await page.locator('[data-testid="button-voice-record"]').click();
  
  // 2. Start recording
  await page.locator('[data-testid="button-start-recording"]').click();
  
  // 3. Verify recording indicator visible
  await expect(page.locator('[data-testid="status-recording"]')).toBeVisible();
  
  // 4. Wait 2 seconds
  await page.waitForTimeout(2000);
  
  // 5. Stop recording
  await page.locator('[data-testid="button-stop-recording"]').click();
  
  // 6. Verify transcription appears
  await expect(page.locator('[data-testid="text-transcription"]')).toBeVisible();
  
  // 7. Screenshot proof
  await page.screenshot({ path: 'test-screenshots/voice-recording.png' });
});
```

---

## 📋 MB.MD PROTOCOL UPDATE

### Add to `docs/MB_MD_QA_PROTOCOL.md`:

```markdown
## 🚨 CRITICAL USER CONTEXT

**Primary User Profile:**
- **Technical Level:** Non-engineer
- **Interface:** UI only (no access to logs, code, or terminal)
- **Frustration Trigger:** Agent claims "feature works" based on server logs, but UI is completely broken

**MANDATORY Verification Before Claiming "Fixed":**
1. ✅ **Screenshot Proof:** Take screenshot of ACTUAL UI showing feature working
2. ✅ **User Journey Test:** Click through full user flow (no shortcuts)
3. ✅ **Playwright Test:** Automated E2E test passes for the feature
4. ✅ **React DevTools:** Verify state updates AND DOM re-renders
5. ✅ **Network Tab:** Confirm API requests succeed AND responses render

**FORBIDDEN Claims:**
- ❌ "Logs show it's working" (user can't see logs)
- ❌ "Code compiles" (compilation ≠ functionality)
- ❌ "State updated" (state update ≠ DOM render)
- ❌ "Event fired" (event ≠ user-visible change)

**Required Evidence Format:**
```
✅ Feature: Inspector text edit saves
📸 Screenshot: test-screenshots/inspector-save.png
🧪 Playwright: tests/inspector-save.spec.ts PASSED
🔍 User Journey: Edit text → SAVE badge "1" → Click SAVE → Changes applied
```
```

---

## 🎯 NEXT STEPS (Research Only - NO Building)

### Immediate Actions (Parallel):
1. **Grep Investigation:** Run all grep commands above, document findings
2. **Screenshot Verification:** Take screenshots of all 4 broken features
3. **Browser Console:** Open DevTools, reproduce each issue, copy console logs
4. **Network Analysis:** Monitor Network tab during each broken interaction
5. **React DevTools:** Check if state updates but DOM doesn't re-render

### Documentation Output:
Create `docs/UI_DISCONNECT_FINDINGS.md` with:
- Exact code paths for each broken feature
- Screenshots showing broken vs expected UI
- Console logs vs actual UI state comparison
- Specific line numbers where disconnects occur
- Recommended fixes (architectural level, not implementation)

### Architect Consultation:
After research complete, return findings to architect for:
- Strategic fix approach
- Priority ranking of 4 issues
- Validation protocol improvements
- Long-term testing infrastructure

---

**Status:** RESEARCH PLAN CREATED - DO NOT BUILD YET
**User Approval:** Required before proceeding to fix phase
**Estimated Research Time:** 30-45 minutes (thorough investigation)
