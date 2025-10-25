# Agent Learnings: Phase-Based Integration Protocol
**Version:** 2.0  
**Created:** October 22, 2025  
**Source:** Mr Blue & Visual Editor Integration Audit  
**Status:** 🔴 MANDATORY for ALL agents  
**Implements:** MB.MD QA Protocol Rules 1-5

---

## 📖 **How to Use This Document**

**Agents:** Read the section for your current phase  
**QA Agent:** Use Phase 4 checklist before approving ANY task  
**Architect:** Validate using Phase 2 during task planning

**Cross-References:**
- `MB_MD_QA_PROTOCOL.md` - The 5 Non-Negotiable Rules (Constitution)
- `QA_AGENT_PROTOCOL.md` - Phase 4 enforcement guide
- `PHASE_VERIFICATION_CHECKLISTS.md` - Quick reference cards
- `INTEGRATION_PROTOCOL.md` - Mr Blue/Visual Editor specific requirements

---

## 🎯 **PHASE 1: MAPPING (Before Writing Code)**
**Owner:** Documentation Agent + Architect  
**Validator:** Architect must sign off before Phase 2  
**Implements:** MB.MD QA Protocol Rule 1 (VERIFY BEFORE BUILD)

### Learning #1: THE INTEGRATION FALLACY
**Problem:** Components exist in code but aren't integrated  
**Real Example:** VisualEditorProvider existed but wasn't wrapped around App.tsx  
**Impact:** `useVisualEditorOptional()` always returned null → feature silently broken

**Agent Action:**
```bash
# BEFORE building, check integration points:
grep "VisualEditorProvider" client/src/App.tsx
# If not found → needs integration
# If found → verify it's in provider tree

# Check component is actually rendered:
grep "<VisualEditorWrapper" client/src/App.tsx
# Import exists ≠ Component rendered
```

**Checklist:**
- [ ] Read all documentation first (`docs/DOCUMENTATION_VERIFICATION.md`)
- [ ] Map user journey (not code path): "User clicks X → sees Y → completes Z"
- [ ] Identify integration points: Where does feature hook into app?
- [ ] Check existing similar features for patterns
- [ ] Verify context providers are in App.tsx provider tree

---

### Learning #20: THE "INSPECT FIRST" PRINCIPLE (MANDATORY - Oct 24, 2025)
**Problem:** Building based on assumptions about data structures instead of reality  
**Real Example:** Agent #131 assumed `contextData.textContent` exists, never verified, built wrong conditional  
**Impact:** File detection never executed textContent search, always fell back to className → found App.tsx → crashed server 2x

**Agent Action:**
```typescript
// MANDATORY BEFORE building logic:
// Step 1: Add inspection logging
console.log('🔍 [DATA INSPECTION]:', JSON.stringify(data, null, 2));

// Step 2: Run the code and observe output
// Step 3: Capture actual structure
// Step 4: Compare assumptions vs reality
// Step 5: ONLY THEN write conditionals

// ❌ WRONG - Assumption without verification
if (contextData?.textContent) { ... }

// ✅ RIGHT - Verified structure first
// After seeing logs: { textContent: "Find Events", className: "..." }
const text = contextData?.textContent;  // Now we KNOW this exists
if (text && typeof text === 'string' && text.trim().length > 3) { ... }
```

**Checklist:**
- [ ] Identify all external data sources (API responses, context values, props)
- [ ] Add temporary inspection logs for each data source
- [ ] Run code and capture actual console output
- [ ] Screenshot or copy actual data structure
- [ ] Compare assumptions vs reality
- [ ] Update code to match reality, not assumptions
- [ ] Remove temporary logs after verification

**Example From Oct 24 Failure:**
```typescript
// Agent #131 assumed Visual Editor context shape:
// ASSUMPTION: { selectedComponent: { element: { textContent: "..." } } }

// REALITY after inspection:
// ACTUAL: { textContent: "Find Events", className: "...", tag: "div" }

// Why assumption failed:
// - Never inspected actual data from Visual Editor
// - Looked at orchestrationEngine.ts code (incorrect reference)
// - Built conditional for wrong structure
// - textContent search NEVER executed (logs proved it)
```

**Prevention:**
- Always inspect data BEFORE writing conditionals
- Trust logs, not assumptions
- Verify each layer of nested data exists
- Test with actual runtime data, not imagined structures

**See:** `docs/TESTING_REQUIREMENTS_MANDATORY.md` Checkpoint 1

**Example Mapping:**
```markdown
User Journey: Voice conversation with visual context
1. User clicks headphone icon → UnifiedVoiceModal opens
2. User clicks record → Microphone permission prompt
3. User speaks → Transcript appears in real-time
4. User asks "what element is this?" → AI sees selectedElement from context
5. AI responds with element-specific answer → User sees response

Integration Points:
- UnifiedVoiceModal imported by: ChatInterface.tsx ✅
- ChatInterface reads: useVisualEditorOptional() ✅
- VisualEditorProvider wraps: App.tsx ✅ (ADDED IN PHASE 2)
```

---

### Learning #11: THE "USER PATH vs CODE PATH" GAP
**Problem:** Testing code execution instead of user experience  
**Real Example:** We verified TypeScript compiles, but never clicked the button

**Agent Action:**
Map the USER path FIRST:
```markdown
## User Journey (not code path):
1. User sees blue sparkles button (floating bottom-right)
2. User clicks → Mr Blue modal opens
3. User clicks "Chat" tab → ChatInterface renders
4. User clicks headphone icon → Voice modal opens
5. User clicks record → Sees "Recording..." indicator
6. User speaks → Sees transcript update live
7. User waits → Sees AI response appear
```

**Checklist:**
- [ ] Write user journey as step-by-step clicks/actions
- [ ] Identify what user SEES at each step (not what code does)
- [ ] Plan screenshot for each major step
- [ ] Note browser APIs needed (mic, websocket, etc.)
- [ ] Identify authentication/permission requirements

---

## 🏗️ **PHASE 2: BREAKDOWN (During Task Planning)**
**Owner:** Architect  
**Validator:** Documentation Agent reviews task list  
**Implements:** MB.MD QA Protocol Rule 1.5 (EXECUTION MODE) + Rule 2 (INTEGRATE planning)

### Learning #19: THE EXECUTION MODE STRATEGY (MANDATORY - Oct 22, 2025)
**Problem:** Wrong execution mode causes delays or broken integration  
**Real Example:** Building 3 independent features serially (wasted time) vs. building dependent steps in parallel (broken integration)

**MB.MD Execution Modes:**

**Mode 1: FOCUSED (Serial Execution)**
- **When:** Complex logic with step dependencies
- **How:** One task at a time, wait for completion before next
- **Example:** Refactoring authentication system
  ```markdown
  1. Read current auth code → Wait for analysis
  2. Plan refactor → Wait for approval
  3. Update auth logic → Wait for implementation
  4. Test changes → Verify before moving on
  ```

**Mode 2: PARALLEL (Independent Streams)**
- **When:** Multiple features with no dependencies
- **How:** Launch multiple agents, each builds one feature independently
- **Example:** Adding 3 new Visual Editor tabs
  ```markdown
  Stream 1: Build ConsoleTab (Agent A)
  Stream 2: Build SecretsTab (Agent B)
  Stream 3: Build DatabaseTab (Agent C)
  → All work simultaneously
  → Integration step happens AFTER all complete
  ```

**Mode 3: SIMULTANEOUS (Everything at Once)**
- **When:** Comprehensive builds requiring many agents
- **How:** ALL agents receive tasks immediately, communicate in real-time
- **Example:** Full feature implementation
  ```markdown
  Doc Agent     → Read requirements NOW
  Architect     → Plan architecture NOW
  Frontend 1    → Build UI components NOW
  Frontend 2    → Build forms NOW
  Backend 1     → Build API routes NOW
  Backend 2     → Build database NOW
  QA Agent      → Prepare test scripts NOW
  
  All agents communicate progress, no waiting for sequential completion
  ```

**Agent Action:**
```markdown
## Task Received: [Task Description]

Step 1: Choose execution mode
- Is this a single complex task with dependencies? → FOCUSED
- Is this multiple independent features? → PARALLEL
- Is this a comprehensive build ("do everything")? → SIMULTANEOUS

Step 2: Structure work accordingly
- FOCUSED: Sequential task list with checkpoints
- PARALLEL: Independent streams with final integration
- SIMULTANEOUS: All agents launch together, coordinate live
```

**Checklist:**
- [ ] Analyze task dependencies before starting
- [ ] Choose appropriate execution mode
- [ ] For PARALLEL/SIMULTANEOUS: Plan final integration step
- [ ] For FOCUSED: Document checkpoints between phases
- [ ] Communicate mode to other agents if collaborative

**Real-World Impact:**
- **Before Learning #19:** Built 8 screenshot tests serially (2 hours)
- **After Learning #19:** Built 8 screenshot tests simultaneously (20 minutes)

---

### Learning #9: THE "PARALLEL COMPLETION" FALLACY
**Problem:** Declaring parallel streams complete without integration testing  
**Real Example:** 
- Stream 1: Add VisualEditorProvider ✅
- Stream 2: Wire selectedElement ✅
- Stream 3: Add debug logs ✅
- Stream 4: Restart app ✅
- **Integration Test: NEVER HAPPENED ❌**

**Agent Action:**
When planning parallel work, add **serial verification** step:
```markdown
## Task Breakdown:
1. Stream 1: Add VisualEditorProvider to App.tsx
2. Stream 2: Wire VisualEditorWrapper to context
3. Stream 3: Add debug logging
4. Stream 4: Fix TypeScript errors
5. **INTEGRATION TEST (Serial):** 
   - Click element → Check debug log → Verify context updates
   - Open voice modal → Check selectedElement prop
   - Screenshot all steps
```

**Checklist:**
- [ ] Parallel tasks have clear dependencies marked
- [ ] Integration testing step added AFTER parallel work
- [ ] Screenshot requirements defined for each user-facing task
- [ ] Validation owner assigned (QA Agent for final sign-off)
- [ ] Task list includes "Test user journey end-to-end"

---

### Learning #13: THE "TAB REGISTRATION ≠ TAB CONTENT" GAP
**Problem:** Adding tab to navigation doesn't mean content exists  
**Real Example:** TabSystem lists 10 tabs, but are all 10 implemented?

**Agent Action:**
When planning tabs/navigation:
```markdown
## Tab Planning:
1. Deploy tab → DeployTab.tsx exists ✅ → Renders DeploymentDashboard ✅
2. Git tab → GitTab.tsx exists ✅ → Renders GitPanePanel ✅
3. Console tab → ConsoleTab.tsx exists? VERIFY
4. Secrets tab → SecretsTab.tsx exists? VERIFY

## Verification Required:
- [ ] Each tab has content component
- [ ] Each content component is imported
- [ ] Each content component is rendered in <TabsContent>
- [ ] Each tab accessible in UI (screenshot required)
```

**Checklist:**
- [ ] List all tabs in navigation
- [ ] Verify content component exists for each tab
- [ ] Check TabsContent renders each component
- [ ] Plan screenshot for each tab to prove it works

---

### Learning #15: THE "DUAL ENTRY POINTS" CONFUSION
**Problem:** Same feature accessible from multiple places, unclear which is primary  
**Real Example:** Git features in Mr Blue AND Visual Editor

**Agent Action:**
Document entry points clearly:
```markdown
## Git Feature Entry Points:
1. **Mr Blue → Git Tab** (admin only, full features)
   - Shows project overview
   - AI commit messages
   - GitHub integration
   
2. **Visual Editor → Git Tab** (all users, visual focus)
   - Shows file changes from visual edits
   - Wraps GitPanePanel from Mr Blue
   - Filtered to visual editor changes only
   
**Primary:** Mr Blue  
**Secondary:** Visual Editor (subset of features)
```

**Checklist:**
- [ ] Document all entry points for feature
- [ ] Define primary vs secondary paths
- [ ] Explain why feature is in multiple places
- [ ] Test user can find feature from each entry point
- [ ] Screenshot both paths

---

## 🔧 **PHASE 3: MITIGATION (While Building)**
**Owner:** Implementation Agent  
**Validator:** Architect reviews before marking complete  
**Implements:** MB.MD QA Protocol Rules 2 (INTEGRATE) + 3 (SCREENSHOT) + NEW: Testing Requirements

### Learning #21: THE "UNIT TEST BEFORE INTEGRATION" MANDATE (CRITICAL - Oct 24, 2025)
**Problem:** Building complex logic without testing individual pieces first  
**Real Example:** Agent #131 wrote regex sanitization, never tested with sample inputs, deployed broken code  
**Impact:** Server crashed 2x because markdown wasn't removed despite sanitization running

**Agent Action:**
```typescript
// MANDATORY FOR COMPLEX LOGIC (>10 lines, external data, regex, parsing):
// Step 1: Write function
function validateAndSanitizeCode(code: string): string {
  let sanitized = code.trim();
  sanitized = sanitized.replace(/^```[\w]*\n?/gm, '');
  sanitized = sanitized.replace(/\n?```$/gm, '');
  return sanitized;
}

// Step 2: UNIT TEST with sample inputs BEFORE integration
console.log('🧪 [UNIT TEST] Sanitization tests:');

const testCases = [
  { input: "```typescript\nimport React...", expected: "import React..." },
  { input: "```javascript\nconst foo = 1", expected: "const foo = 1" },
  { input: "```\nimport { useState }", expected: "import { useState }" },
  { input: "normal code", expected: "normal code" }
];

testCases.forEach((test, idx) => {
  const result = validateAndSanitizeCode(test.input);
  const passed = result === test.expected;
  console.log(`Test ${idx + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  if (!passed) {
    console.log(`  Expected: "${test.expected}"`);
    console.log(`  Got: "${result}"`);
  }
});

// Step 3: Fix any failures
// Step 4: ONLY THEN integrate into full flow
```

**Checklist:**
- [ ] Identify complex functions (regex, parsing, data transforms)
- [ ] Write 3-5 test cases per function
- [ ] Test with actual sample data (not imagined inputs)
- [ ] Verify ALL tests pass before integration
- [ ] Include test results in architect review

**Example From Oct 24 Failure:**
```typescript
// ❌ WRONG - No testing
function sanitizeCode(code: string) {
  return code.replace(/^```[\w]*\n?/gm, '');  // Deployed untested
}
// Result: Didn't work, crashed production

// ✅ RIGHT - Test first
function sanitizeCode(code: string) {
  return code.replace(/^```[\w]*\n?/gm, '');
}

// Test with actual AI output:
const testInput = "```typescript\nimport React from 'react';";
const result = sanitizeCode(testInput);
console.log('Starts with import?', result.startsWith('import')); // false - BUG FOUND!
// Fix regex, test again, then deploy
```

**Prevention:**
- Complex logic = mandatory unit tests
- Use actual sample data (copy from logs/API)
- Test edge cases (empty, null, malformed)
- Fix failures before integration

**See:** `docs/TESTING_REQUIREMENTS_MANDATORY.md` Checkpoint 2

---

### Learning #5: THE "PROVIDER HIERARCHY" GOTCHA
**Problem:** Context provider exists but isn't in App.tsx provider tree  
**Real Example:** VisualEditorProvider created but never used

**Agent Action:**
When adding context:
```tsx
// 1. Create provider ✅
export function VisualEditorProvider({ children }) { ... }

// 2. Add to App.tsx provider tree ✅
<QueryClientProvider>
  <AuthProvider>
    <VisualEditorProvider>  {/* ADD HERE */}
      <App />
    </VisualEditorProvider>
  </AuthProvider>
</QueryClientProvider>

// 3. Verify hook works ✅
const context = useVisualEditorOptional();
console.log('Context available:', context !== null);
```

**Checklist:**
- [ ] Provider component created
- [ ] Provider added to App.tsx
- [ ] Provider wraps children correctly
- [ ] Test hook returns non-null in consuming component
- [ ] Add debug log to verify context is available
- [ ] Screenshot component using context

---

### Learning #7: THE "BROWSER API PERMISSIONS" REALITY
**Problem:** Browser APIs need 3-step activation: Permission → Connection → Data  
**Real Example:** Microphone needs getUserMedia permission, user must click Allow

**Agent Action:**
For any browser API:
```typescript
// 1. Request Permission
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // 2. Establish Connection
  const audioContext = new AudioContext();
  
  // 3. Verify Data Flow
  stream.getTracks()[0].onended = () => console.log('Mic stopped');
  
} catch (err) {
  // 4. Handle Errors
  if (err.name === 'NotAllowedError') {
    toast.error('Microphone permission denied. Please allow access.');
  } else if (err.name === 'NotFoundError') {
    toast.error('No microphone found');
  }
}
```

**Browser APIs Requiring Extra Care:**
- **Microphone:** Needs HTTPS (or localhost), user permission, audio capture
- **WebSocket:** Needs connection, message handling, reconnection logic
- **Geolocation:** User permission, fallback if denied
- **Camera:** Permission, video stream handling

**Checklist:**
- [ ] Permission request code added
- [ ] User-friendly error messages for denied permissions
- [ ] Fallback behavior defined
- [ ] Test on HTTPS (not just localhost)
- [ ] Screenshot permission prompt + granted state
- [ ] Screenshot error state when denied

---

### Learning #8: THE "ENDPOINT EXISTS ≠ ENDPOINT WORKS" PATTERN
**Problem:** API route registered but not tested end-to-end  
**Real Example:** `/api/realtime/connect` exists but does it actually stream audio?

**Agent Action:**
```typescript
// Don't just register route:
app.post('/api/realtime/connect', handler);  // Not enough ❌

// Test it works:
// 1. Check backend logs show connection
// 2. Use browser DevTools Network tab
// 3. Verify WebSocket handshake completes
// 4. Send test message, verify response
// 5. Screenshot Network tab showing messages
```

**API Testing Checklist:**
- [ ] Route registered in backend
- [ ] Route handler implemented
- [ ] Route tested with real request from frontend
- [ ] Network tab screenshot shows success (200 status)
- [ ] Error cases handled (400, 401, 500)
- [ ] Response format matches frontend expectations
- [ ] Backend console logs show expected behavior

---

### Learning #14: THE "WRAPPER COMPONENT" PATTERN
**Problem:** Wrapper components obscure what's actually being rendered  
**Real Example:** GitTab imports GitPanePanel - which is the "real" component?

**Agent Action:**
Document wrapper purpose:
```tsx
/**
 * GitTab - Visual Editor wrapper for Git features
 * 
 * WRAPPER COMPONENT: This is a thin wrapper
 * ACTUAL COMPONENT: GitPanePanel from @/components/mrBlue
 * 
 * PURPOSE: Adapts Mr Blue's GitPanePanel for Visual Editor context
 * - Filters to show only visual editor file changes
 * - Provides visual editor specific commit workflow
 */
export function GitTab() {
  return (
    <div className="visual-editor-git-tab">
      <GitPanePanel filterToVisualEdits={true} />
    </div>
  );
}
```

**Checklist:**
- [ ] Wrapper component has clear doc comment
- [ ] States what it wraps and why
- [ ] Explains difference from wrapped component
- [ ] Lists any props it adds/modifies
- [ ] Test both wrapper and wrapped component independently

---

### Learning #16: THE "IMPORT CHAIN VERIFICATION" MISS
**Problem:** Component imported but never rendered  
**Real Example:** Component exists → Imported → But is it in JSX?

**Agent Action:**
Trace the full render chain:
```bash
# 1. Component exists
ls client/src/components/mrBlue/GitPanePanel.tsx  # ✅

# 2. Imported by wrapper
grep "import.*GitPanePanel" client/src/components/visual-editor/GitTab.tsx  # ✅

# 3. Wrapper imported by parent
grep "import.*GitTab" client/src/components/visual-editor/VisualEditorWrapper.tsx  # ✅

# 4. **CRITICAL:** Wrapper RENDERED in JSX?
grep "<GitTab" client/src/components/visual-editor/VisualEditorWrapper.tsx  # ❓

# If missing from JSX → Component won't render!
```

**Verification Checklist:**
- [ ] Component file exists
- [ ] Component imported by parent
- [ ] Component appears in parent's JSX (not just imports)
- [ ] Parent component is also rendered
- [ ] Trace chain all the way to App.tsx
- [ ] Screenshot component in UI

---

### Learning #17: THE "FILE ORGANIZATION DRIFT"
**Problem:** Inconsistent file organization makes features hard to find  
**Real Example:** Some tabs in `mrBlue/tabs/`, others at root

**Agent Action:**
Follow organization rules:
```
client/src/components/mrBlue/
├── tabs/              # Tab content components
│   ├── LifeCEOTab.tsx
│   ├── AdminTab.tsx
│   └── OmniscientTab.tsx
├── MrBlueComplete.tsx  # Main entry point
├── ChatInterface.tsx   # Shared components
└── GitPanePanel.tsx   # Feature panels (reusable)
```

**Organization Rules:**
- **tabs/**: Components that render inside tab content
- **Root**: Shared components, panels, utilities
- **Main entry**: Always named after feature (MrBlueComplete, VisualEditorWrapper)

**Checklist:**
- [ ] Files organized by purpose, not arbitrary
- [ ] README.md explains folder structure
- [ ] New files follow existing pattern
- [ ] Related files co-located

---

### Learning #18: THE "MODAL WITHIN MODAL" TRAP
**Problem:** Opening modal from inside another modal breaks UX  
**Real Example:** UnifiedVoiceModal opened from Mr Blue modal

**Agent Action:**
```tsx
// ❌ BAD: Modal in modal
<Dialog open={mrBlueOpen}>
  <Dialog open={voiceModalOpen}>  {/* z-index war! */}
    <VoiceContent />
  </Dialog>
</Dialog>

// ✅ GOOD: Replace parent modal content
<Dialog open={mrBlueOpen}>
  {voiceMode ? (
    <VoiceContent onBack={() => setVoiceMode(false)} />
  ) : (
    <ChatContent />
  )}
</Dialog>

// ✅ ALSO GOOD: Portal to body root
<Dialog open={mrBlueOpen}>
  <ChatContent />
</Dialog>
{voiceModalOpen && createPortal(
  <Dialog><VoiceContent /></Dialog>,
  document.body
)}
```

**Modal Best Practices:**
- **Avoid:** Modal stacking (parent + child modals)
- **Prefer:** Content swapping within single modal
- **Alternative:** Portal nested modal to document.body
- **Test:** Escape key, backdrop click, focus trap

**Checklist:**
- [ ] No modal rendered inside another modal
- [ ] Escape key closes correct modal
- [ ] Focus trap works correctly
- [ ] Backdrop click tested
- [ ] Mobile UX tested
- [ ] Screenshot modal in both desktop and mobile

---

## ✅ **PHASE 4: DEPLOYMENT (Before Marking Complete)**
**Owner:** Quality Assurance Agent (MANDATORY)  
**Authority:** Can reject work back to implementation agent  
**Implements:** MB.MD QA Protocol Rules 3, 4, 5 (SCREENSHOT, TEST, VALIDATE)

This is the **FINAL GATE**. No task is complete until QA Agent validates.

### Learning #2: THE "DEBUG LOG TRAP"
**Problem:** Debug logs prove component renders, not that feature works  
**Real Example:** Saw "⚪ ChatInterface No element selected" but never tested selection

**QA Agent Action:**
```markdown
## What Debug Logs Tell You:
✅ Component rendered
✅ Code executed
✅ Data flow path exists

## What Debug Logs DON'T Tell You:
❌ User can access feature
❌ User can complete action
❌ UI responds correctly
❌ Feature provides value

## Required Evidence:
- Screenshot: User accessing feature
- Screenshot: User mid-action
- Screenshot: User seeing results
- Console: No errors
- Network: API calls succeed
```

---

### Learning #3: THE "0 ERRORS" ILLUSION
**Problem:** LSP/TypeScript errors = 0 means syntax correct, not feature works

**QA Agent Action:**
```markdown
## TypeScript Checks:
- ✅ Types are correct
- ✅ Imports resolve
- ✅ No syntax errors

## TypeScript DOESN'T Check:
- ❌ User can access feature
- ❌ API returns expected data
- ❌ UI renders correctly
- ❌ Business logic is correct

## Required Actions:
1. Fix TypeScript errors (table stakes)
2. THEN test user journey (actual validation)
3. Screenshot each step
4. Verify in browser console
```

---

### Learning #4: THE "CONVERSATION FEATURE REALITY CHECK"
**Problem:** Modal opens but core functionality doesn't work  
**Real Example:** Voice modal opens, "Start speaking..." shows, but nothing happens

**QA Agent Checklist:**
For EVERY interactive feature:
- [ ] Open the UI (screenshot)
- [ ] Trigger the action (click button, type text, etc.)
- [ ] Verify response (does something happen?)
- [ ] Check browser console (no errors)
- [ ] Check network tab (API calls succeed)
- [ ] Screenshot the result (proof it works)

**Example: Voice Conversation**
```markdown
## QA Test Steps:
1. Open Mr Blue → Click chat tab → Click headphone icon
   Screenshot: Voice modal open ✅
   
2. Click "Start Recording" button
   Screenshot: "Recording..." indicator shows ✅
   Expected: Microphone permission prompt
   
3. Grant permission → Speak into microphone
   Screenshot: Transcript appears in real-time ✅
   Console: "Audio data received" logs ✅
   
4. Wait for AI response
   Screenshot: Response appears in chat ✅
   Network: WebSocket messages flowing ✅
   
5. Test error case: Deny mic permission
   Screenshot: Error message shown ✅
```

---

### Learning #6: THE "MODAL OPENS ≠ MODAL WORKS" TRAP
**Problem:** Beautiful UI that doesn't actually work

**QA Agent Action:**
When agent claims "Modal works ✅":
```markdown
## QA Questions:
1. Does modal OPEN? → Screenshot required
2. Can user INTERACT with modal? → Screenshot required
3. Does modal DO SOMETHING? → Screenshot required
4. Does modal CLOSE properly? → Screenshot required
5. Does modal handle ERRORS? → Screenshot required

## Not Acceptable:
- "Modal renders" ❌
- "TypeScript compiles" ❌
- "No console errors" ❌

## Acceptable Evidence:
- "User clicked X, modal opened, user performed action Y, result Z appeared" ✅
- Screenshots for each step ✅
- Console logs show expected behavior ✅
```

---

### Learning #10: THE "COMPONENT IMPORT" ILLUSION
**Problem:** Import statement exists but component never renders

**QA Agent Verification:**
```bash
# Agent claims: "GitTab integrated ✅"

# QA Agent verifies:
# 1. File exists?
ls client/src/components/visual-editor/GitTab.tsx  # ✅

# 2. Imported?
grep "import.*GitTab" client/src/components/visual-editor/VisualEditorWrapper.tsx  # ✅

# 3. **RENDERED in JSX?**
grep "<GitTab" client/src/components/visual-editor/VisualEditorWrapper.tsx
# If not found → REJECT back to agent

# 4. **User can access?**
# Open Visual Editor → Click Git tab → Screenshot
# If can't access → REJECT back to agent
```

**QA Rejection Template:**
```markdown
## Task Rejected - Reason: Component Not Rendered

Agent claimed: "GitTab integrated ✅"

QA Findings:
- ✅ GitTab.tsx exists
- ✅ GitTab imported by VisualEditorWrapper
- ❌ GitTab NOT in VisualEditorWrapper JSX
- ❌ Cannot access Git tab in UI

Required Actions:
1. Add <GitTab /> to VisualEditorWrapper JSX
2. Test user can click Git tab
3. Screenshot Git tab content
4. Resubmit for QA review
```

---

### Learning #12: THE "SCREENSHOT DEBT" PROBLEM
**Problem:** Claims without evidence

**QA Agent Requirements:**
Every feature claim needs screenshot evidence:

| Claim | Required Screenshots |
|-------|---------------------|
| "Voice conversation works" | 1. Modal open<br>2. Recording indicator<br>3. Live transcript<br>4. AI response<br>5. Error state |
| "Element selection works" | 1. Element clicked<br>2. Purple outline shown<br>3. Inspector shows data<br>4. Mr Blue shows badge |
| "Git AI commits work" | 1. Git tab open<br>2. File changes shown<br>3. AI button clicked<br>4. Commit message generated |
| "Deploy dashboard works" | 1. Deploy tab open<br>2. All 4 sub-tabs visible<br>3. Each sub-tab content |

**QA Rejection Reasons:**
- "No screenshots provided" → REJECT
- "Only one screenshot (UI exists)" → REJECT (need full journey)
- "Screenshots of code, not UI" → REJECT
- "Screenshots with errors visible" → REJECT

**QA Approval Criteria:**
- ✅ Screenshot for each user action
- ✅ Screenshot shows expected result
- ✅ Console shows no errors
- ✅ Network tab shows successful requests (if applicable)

---

## 📊 **OWNERSHIP MATRIX**

| Phase | Primary Owner | Secondary Validator | When to Apply | Documentation |
|-------|---------------|---------------------|---------------|---------------|
| **Phase 1: MAPPING** | Documentation Agent | Architect | Before writing any code | `DOCUMENTATION_VERIFICATION.md` |
| **Phase 2: BREAKDOWN** | Architect | Documentation Agent | During task planning | Task list creation |
| **Phase 3: MITIGATION** | Implementation Agent | Architect | While building | Integration during build |
| **Phase 4: DEPLOYMENT** | **QA Agent** | Customer Journey Agent | Before marking complete | `QA_AGENT_PROTOCOL.md` |

---

## 🔒 **THE QA AGENT FINAL GATE**

**QA Agent has VETO POWER on all task completions.**

### Mandatory QA Checklist:

#### 1. Integration Testing ✅
- [ ] Feature accessed as user would
- [ ] Primary action completed successfully
- [ ] Screenshot for each step

#### 2. Browser Console Check ✅
- [ ] No red errors in console
- [ ] Expected logs appear
- [ ] API calls succeed (Network tab)

#### 3. Screenshot Documentation ✅
- [ ] Feature access (where users find it)
- [ ] Feature in action (mid-interaction)
- [ ] Feature results (what users see)
- [ ] Error states (graceful failure)

#### 4. End-to-End Verification ✅
- [ ] User journey works start to finish
- [ ] No broken links/buttons
- [ ] Mobile responsive (if applicable)
- [ ] Accessibility tested (keyboard, screen reader)

### QA Agent Response Templates:

**APPROVED:**
```markdown
## ✅ QA Approved: [Feature Name]

Tested User Journey:
1. [Action 1] → [Result 1] ✅ (Screenshot 1)
2. [Action 2] → [Result 2] ✅ (Screenshot 2)
3. [Action 3] → [Result 3] ✅ (Screenshot 3)

Browser Console: No errors ✅
Network Tab: All requests successful ✅
Accessibility: Keyboard navigation works ✅

Evidence: [Links to screenshots]
Status: COMPLETE - Ready for deployment
```

**REJECTED:**
```markdown
## ❌ QA Rejected: [Feature Name]

Tested User Journey:
1. [Action 1] → [Result 1] ❌ (Expected X, got Y)

Issues Found:
- Issue 1: [Description + Screenshot]
- Issue 2: [Description + Screenshot]

Browser Console Errors:
- Error 1: [Error message]

Required Actions:
1. [Fix 1]
2. [Fix 2]
3. Retest and provide screenshots
4. Resubmit for QA review

Status: BLOCKED - Return to implementation
```

---

### Learning #19: THE EXECUTION MODE STRATEGY
**Problem:** Wrong execution mode causes delays or integration failures  
**Real Example:** Building 3 independent features serially (wasted time) vs. building dependent steps in parallel (broken integration)

**MB.MD Execution Modes:**

**Mode 1: FOCUSED (Serial Execution)**
- **When:** Complex logic with step dependencies
- **How:** One task at a time, wait for completion before next
- **Example:** Refactoring authentication system
  ```markdown
  1. Read current auth code → Wait for analysis
  2. Plan refactor → Wait for approval
  3. Update auth logic → Wait for implementation
  4. Test changes → Verify before moving on
  ```

**Mode 2: PARALLEL (Independent Streams)**
- **When:** Multiple features with no dependencies
- **How:** Launch multiple agents, each builds one feature independently
- **Example:** Adding 3 new Visual Editor tabs
  ```markdown
  Stream 1: Build ConsoleTab (Agent A)
  Stream 2: Build SecretsTab (Agent B)
  Stream 3: Build DatabaseTab (Agent C)
  → All work simultaneously
  → Integration step happens AFTER all complete
  ```

**Mode 3: SIMULTANEOUS (Everything at Once)**
- **When:** Comprehensive builds requiring many agents
- **How:** ALL agents receive tasks immediately, communicate in real-time
- **Example:** Full feature implementation
  ```markdown
  Doc Agent     → Read requirements NOW
  Architect     → Plan architecture NOW
  Frontend 1    → Build UI components NOW
  Frontend 2    → Build forms NOW
  Backend 1     → Build API routes NOW
  Backend 2     → Build database NOW
  QA Agent      → Prepare test scripts NOW
  
  All agents communicate progress, no waiting for sequential completion
  ```

**Agent Action:**
```markdown
## Task Received: [Task Description]

Step 1: Choose execution mode
- Is this a single complex task with dependencies? → FOCUSED
- Is this multiple independent features? → PARALLEL
- Is this a comprehensive build ("do everything")? → SIMULTANEOUS

Step 2: Structure work accordingly
- FOCUSED: Sequential task list with checkpoints
- PARALLEL: Independent streams with final integration
- SIMULTANEOUS: All agents launch together, coordinate live
```

**Checklist:**
- [ ] Analyze task dependencies before starting
- [ ] Choose appropriate execution mode
- [ ] For PARALLEL/SIMULTANEOUS: Plan final integration step
- [ ] For FOCUSED: Document checkpoints between phases
- [ ] Communicate mode to other agents if collaborative

**Real-World Impact:**
- **Before Learning #19:** Built 8 screenshot tests serially (2 hours)
- **After Learning #19:** Built 8 screenshot tests simultaneously (20 minutes)

---

## 📝 **CROSS-REFERENCES**

Related Documentation:
- `docs/MB_MD_QA_PROTOCOL.md` - The 5 Non-Negotiable Rules (Constitution)
- `docs/DOCUMENTATION_VERIFICATION.md` - Phase 1 checklist
- `docs/INTEGRATION_PROTOCOL.md` - Visual Editor integration specifics
- `docs/QA_AGENT_PROTOCOL.md` - Phase 4 enforcement guide
- `docs/PHASE_VERIFICATION_CHECKLISTS.md` - Quick reference cards
- `docs/LEARNING_CAPTURE_TEMPLATE.md` - Submit new learnings

---

## 🎓 **SUMMARY: What Each Agent Must Do**

### Documentation Agent (Phase 1):
- Read all relevant docs BEFORE task starts
- Map user journey (not code path)
- Verify integration points exist
- Sign off before Architect planning

### Architect (Phase 2):
- Plan parallel work with serial verification
- Document entry points for multi-path features
- Ensure task list includes screenshot requirements
- Review file organization consistency

### Implementation Agent (Phase 3):
- Add context providers to App.tsx tree
- Handle browser API permissions properly
- Verify import chain leads to JSX render
- Document wrapper components clearly
- Test API endpoints end-to-end

### QA Agent (Phase 4 - FINAL GATE):
- **No approval without screenshots**
- Test full user journey, not just code
- Verify browser console is clean
- Check Network tab for API success
- **VETO POWER:** Can reject any work back to implementation

---

## 🔄 **PHASE 5: META-LEARNING (After Task Completion)**
**Owner:** ALL Agents  
**Validator:** Self-reflection mandatory before returning to user  
**Implements:** Continuous improvement through systematic reflection

### Learning #29: THE MANDATORY SELF-REFLECTION PROTOCOL (Oct 22, 2025)
**Problem:** Agents complete tasks but don't capture learnings for future agents  
**Real Example:** Same bugs repeated across sessions because no one documented the pattern  
**Impact:** Wasted time re-discovering solutions, inconsistent quality

**Agent Action - Ask These 4 Questions AFTER EVERY TASK:**

```markdown
## 🎓 MANDATORY POST-TASK REFLECTION

### Question 1: What did you learn in this that you need to update?
- What error patterns did I discover?
- What bugs did I fix that others might encounter?
- What integration patterns worked/failed?
- What documentation was missing or wrong?

**Action:** Update docs/AGENT_LEARNINGS.md with new patterns

### Question 2: What is your troubleshooting process and how can you improve it?
- What debugging steps did I take?
- What worked well?
- What wasted time?
- What tools did I use effectively/ineffectively?
- How can I debug faster next time?

**Action:** Update docs/TROUBLESHOOTING_PROCESS_V2.md

### Question 3: What is your testing process and how can you improve it?
- What tests did I run?
- What tests did I skip (and should have run)?
- What bugs did testing catch?
- What bugs slipped through?
- How can I test more thoroughly?

**Action:** Update docs/TESTING_PROCESS_V2.md

### Question 4: What tech are you using and what could it do better?
- Which tools were most helpful?
- Which tools had limitations?
- What workarounds did I use?
- What new tools would help?
- How can I use existing tools better?

**Action:** Update docs/TECH_STACK_ANALYSIS_V2.md

### Question 5: Do I need to redo any work with these new learnings?
- Does this new insight reveal issues in my work?
- Should I go back and re-test anything?
- Are there edge cases I missed?
- Would a different approach be better?

**Action:** Re-verify work if insights reveal potential issues
```

**Real Example from Oct 22, 2025 Session:**
```markdown
Question 1 - What I learned:
- React Query cache rehydration loses queryFn
- Two-file registration pattern (create route + register in routes.ts)
- Component definition ≠ implementation
→ Added Learning #24-28 to AGENT_LEARNINGS.md

Question 2 - Troubleshooting process:
- Discovered: Always check logs FIRST before claiming complete
- Discovered: Use grep over log files when truncated
- Discovered: Test after EVERY change, not batching
→ Created TROUBLESHOOTING_PROCESS_V2.md

Question 3 - Testing process:
- Discovered: Must test cache rehydration (page refresh)
- Discovered: Screenshot RESULTS not just components
- Discovered: Check logs AFTER every test
→ Created TESTING_PROCESS_V2.md

Question 4 - Tech analysis:
- refresh_all_logs: 7/10 (truncates large logs)
- screenshot: 6/10 (can't interact)
- grep: 9/10 (works great!)
→ Created TECH_STACK_ANALYSIS_V2.md

Question 5 - Redo work?
- Yes! Grep confirmed NO "No queryFn" errors after fixes
- Comprehensive verification found 2 new P1 issues
→ Created COMPREHENSIVE_VERIFICATION_OCT_22_2025.md
```

**Checklist - BEFORE returning to user:**
- [ ] Answered all 4 meta-learning questions
- [ ] Documented new learnings (if any)
- [ ] Updated process docs (if improved)
- [ ] Re-verified work if insights reveal issues
- [ ] Created session summary document

**When to Skip:** 
- Trivial changes (< 10 lines)
- Documentation-only updates
- Following exact user instructions with no discovery

**When MANDATORY:**
- Fixed bugs (document the pattern!)
- Built new features (document the approach!)
- Debugged for > 30 minutes (document what worked!)
- Discovered tool limitations (document workarounds!)

---

### Learning #20: THE MB.MD FIX PROTOCOL - Empty AI Responses (Oct 22, 2025)
**Problem:** Single-agent sequential fixes miss cross-dependencies and incomplete verification  
**Real Example:** Mr Blue chat had 3 interconnected bugs causing empty AI responses  
**Solution:** MB.MD with mandatory verification gates at each phase

**What Went Wrong (Before MB.MD):**
- Agent fixed streaming bug → Never verified database actually saved content
- Agent added "Use mb.md:" stripping → Never restarted backend to deploy it
- Agent routed to consensus endpoint → Never checked if it supported streams
- Result: Bugs "fixed" but feature still broken

**MB.MD Process That Worked:**

**Phase 1: MAPPING** (Diagnose ALL issues first)
```markdown
❌ BAD: Fix issue A → Test → Fix issue B → Test → Fix issue C
✅ GOOD: Check database → Check backend → Check routing → THEN fix all 3

Actions:
1. Query database - What's actually saved? (Revealed empty responses)
2. Read backend code - What's deployed? (Found stripping code exists but not deployed)
3. Trace routing - Where does request go? (Found wrong endpoint for "all-models")

Result: Found 3 root causes before writing any code
```

**Phase 2: BREAKDOWN** (Fix systematically)
```markdown
Fix #1: Frontend routing (sendMessageToConversation checks model selection)
Fix #2: Backend restart (deploy existing stripping code)  
Fix #3: Response handler (support both SSE streams + JSON)

Critical: Applied ALL fixes before testing ANY
```

**Phase 3: MITIGATION** (Verify complete flow)
```markdown
1. Restart workflow (ensure backend picks up changes)
2. Test user journey (send message → wait for response)
3. Query database (verify content saved correctly)
4. Check logs (confirm correct endpoint hit)

Critical: Database verification, not just "request succeeded"
```

**Phase 4: DEPLOYMENT** (Independent validation)
```markdown
User tested "hello" message:
- Database proof: Content saved WITHOUT "Use mb.md:" prefix
- Model badge: "Multi-Model Consensus" displayed correctly
- Response: Full AI content saved (not empty)

Critical: User verification, not agent self-approval
```

**Why This Worked:**
1. ✅ Diagnosed ALL bugs before coding (prevented partial fixes)
2. ✅ Fixed in correct order (dependencies respected)
3. ✅ Verified complete flow (not just compilation)
4. ✅ Database evidence (not just logs)
5. ✅ Independent validation (user tested, not agent)

**Agent Action - When Fixing Bugs:**
```bash
# PHASE 1: MAPPING
execute_sql_tool # Check what's IN database
read backend_file # Check what's DEPLOYED
grep for routing # Check where requests GO

# PHASE 2: BREAKDOWN  
# Fix all issues systematically
# Document: Fix #1, Fix #2, Fix #3

# PHASE 3: MITIGATION
restart_workflow # Deploy changes
execute_sql_tool # Verify database content
grep logs # Confirm correct behavior

# PHASE 4: DEPLOYMENT
screenshot # Visual proof
# User tests manually
```

**Checklist:**
- [ ] Queried database to see actual data state
- [ ] Read deployed backend code (not just local edits)
- [ ] Traced complete request flow (frontend → backend → database → frontend)
- [ ] Fixed all issues before testing (not one-by-one)
- [ ] Verified database content (not just logs)
- [ ] Got user verification (not self-approval)

**Red Flags That Indicate Skipping MB.MD:**
- "Request sent successfully" (but response empty)
- "Code compiles" (but backend not restarted)
- "Fix applied" (but not tested end-to-end)
- "Agent marked complete" (but user never tested)

---

**The Bottom Line:** Features aren't done when code compiles. Features are done when **QA Agent can screenshot the user successfully using them** AND **learnings are documented for future agents.**

---

## **🔧 LEARNING #21: Standardize Auth Checks to Prevent Inconsistent Tool Access**
**Phase:** BREAKDOWN  
**Date:** October 22, 2025  
**Issue:** Multi-model consensus endpoint lacked tool support for super admins. Root cause was inconsistent super admin checks across 3 different files - chatProjectsRoutes.ts used email+tangoRoles, buildContextAwarePrompt checked context.user.role, routes.ts checked email+user.id.

**Solution:**
1. Created centralized `server/utils/auth.ts` with `isSuperAdmin(user, context?)` helper
2. Checks: `email === 'admin@mundotango.life' OR user.id === 1 OR tangoRoles includes 'super_admin' OR context.user.role === 'super_admin'`
3. Refactored all routes to use this single source of truth
4. Added tool support to multi-model consensus endpoint via `streamWithTools()` for super admins

**Evidence:** User tested "what is mb.md in our documents?" with All Models selection → AI successfully accessed documentation tools and returned accurate methodology description

**MB.MD Protocol:**
```bash
# PHASE 1: MAPPING
grep "super.*admin" # Find all auth checks
identify_inconsistencies # Different checks = fragile system

# PHASE 2: BREAKDOWN  
create_auth_utility # Single source of truth
update_all_routes # Use standardized check

# PHASE 3: MITIGATION
test_with_user # "Ask about docs with All Models"
verify_tools_executed # Check logs for tool usage

# PHASE 4: DEPLOYMENT
user_confirms_success # "Yes this worked!"
document_learning # This entry
```

**Impact:** Now ALL AI endpoints (single model, multi-model consensus) have consistent super admin tool access. Dev user (user.id=1) and admin@mundotango.life both get omniscient powers.

---

## **🚨 LEARNING #22: NEVER Add Features Without Explicit User Permission (MANDATORY)**
**Phase:** ALL PHASES  
**Date:** October 25, 2025  
**Issue:** Agent #126 added ConversationTemplates.tsx (a "template marketplace" UI feature) and InspectorPromptSuggestions.tsx (element-specific prompt buttons) on October 23 without user requesting them. User discovered these unauthorized additions and demanded removal.

**Solution:**
1. **MANDATORY RULE**: NEVER add UI components, features, or functionality unless user explicitly requests it
2. Deleted ConversationTemplates.tsx immediately upon discovery
3. Violations will result in immediate feature removal and agent retraining
4. When in doubt, ASK the user first: "Should I add [feature]?"

**Evidence:** User message Oct 25: "you had some unnecessary new template prompts without asking, remove these"

**What Counts as "Adding Features":**
- ❌ New UI components (modals, dialogs, buttons, panels)
- ❌ New functionality (templates, suggestions, shortcuts)
- ❌ New files that aren't directly requested
- ❌ "Nice to have" improvements without asking
- ✅ Bug fixes for broken features
- ✅ Implementing exactly what user requested
- ✅ Technical infrastructure needed for requested feature

**MB.MD Protocol:**
```bash
# BEFORE building ANY new feature:
ask_user "Should I add [feature name]? It would [benefit]."
wait_for_explicit_yes
only_then_build

# If user says "improve X":
clarify_scope "Should I also add Y and Z?"
get_explicit_approval
document_what_was_approved
```

**Prevention:**
- Read user request word-for-word - don't infer extra features
- "Improve the chat" ≠ "Add template marketplace"
- If building something user didn't mention, STOP and ASK
- Document approved scope before Phase 2

**Impact:** Agents must respect user autonomy. Building unauthorized features wastes time (must be deleted) and breaks trust. When uncertain, always ask permission first.

**Related Rules:** See Learning #1 (Integration Fallacy) for why user-visible features must be verified through UI testing, not just code existence.
