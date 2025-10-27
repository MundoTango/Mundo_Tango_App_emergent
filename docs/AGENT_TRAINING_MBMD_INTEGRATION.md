# Agent Training: MB.MD Integration - REQUIRED READING BEFORE EXECUTION

**Status:** 🔴 MANDATORY - All agents MUST complete this training first  
**Created:** October 27, 2025  
**Authority:** Platform CEO + User Directive  
**Purpose:** Learn what you need BEFORE executing

---

## 🎯 YOUR MISSION

Transform ALL Mr Blue features to follow MB.MD protocol with extensive testing, documentation verification, and behavioral evidence.

**Execution Mode:** SIMULTANEOUS  
**Timeline:** 4 weeks  
**Quality Standard:** BALANCED (auto-approve simple, architect review complex)  
**Testing Level:** EXTENSIVE

---

## 📚 LEARNING PATH: 4 PHASES

### Phase 1: Understanding MB.MD Protocol (30 minutes)
**Required Reading:**
1. `docs/MB_MD_QA_PROTOCOL.md` (lines 44-598) - The 5 Non-Negotiable Rules
2. `docs/AGENT_LEARNINGS.md` (all phases) - Phase-specific tactics
3. `docs/QA_AGENT_PROTOCOL.md` - QA validation requirements

**Key Concepts to Master:**
- **The 5 Rules:** VERIFY → INTEGRATE → SCREENSHOT → TEST → VALIDATE
- **4 Phases:** MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT
- **Quality Gates:** When architect review is required vs. auto-approve
- **Evidence:** What proof is required at each phase

**Self-Check Questions:**
- [ ] Can you explain all 4 MB.MD phases in your own words?
- [ ] Do you know the difference between FOCUSED, PARALLEL, and SIMULTANEOUS execution?
- [ ] Can you list what evidence is required in Phase 4?
- [ ] Do you understand when architect review is mandatory?

---

### Phase 2: Understanding Your Workstream (20 minutes)
**Required Reading:**
1. `docs/MB_MD_COMPLETE_INTEGRATION_PLAN.md` - Your squad's section
2. Relevant feature code in `server/` and `client/src/components/mrBlue/`

**Squad A (Chat & Voice):** Learn
- Multi-model chat architecture (`server/routes/multiModelRoutes.ts`)
- Tool orchestration system (`server/services/tools/`)
- Voice session management (GPT-4o Realtime API)
- How to validate tool calls before execution

**Squad B (Visual Editor & Tabs):** Learn
- Visual editor context system (`server/routes/visualEditorChatRoutes.ts`)
- Tab system architecture (`client/src/components/mrBlue/MrBlueComplete.tsx`)
- Component integration patterns
- How to verify UI components are wired up

**Squad C (Autonomy & VibeGraph):** Learn
- VibeGraph architecture (`server/services/agents/VibeGraph.ts`)
- Autonomous mode session management
- Testing infrastructure (BrowserTester, SelfHealer)
- How to replace auto-approve with real validation

**Squad D (Governance & QA):** Learn
- QA Agent protocol (`docs/QA_AGENT_PROTOCOL.md`)
- Evidence collection requirements
- Architect review workflow
- How to build validation dashboards

**Self-Check Questions:**
- [ ] Can you describe your squad's features in detail?
- [ ] Do you know which files you'll be modifying?
- [ ] Can you explain the current gaps in your features?
- [ ] Do you understand your squad's deliverables?

---

### Phase 3: Understanding Templates & Tools (15 minutes)
**Required Reading:**
1. `docs/INTEGRATION_PROTOCOL.md` - Integration checklist
2. `docs/TESTING_REQUIREMENTS_MANDATORY.md` - Testing requirements

**Templates You'll Use:**
```
docs/templates/
├── MAPPING_TEMPLATE.md          (Phase 1: Documentation verification)
├── BREAKDOWN_TEMPLATE.md        (Phase 2: Task planning)
├── MITIGATION_TEMPLATE.md       (Phase 3: Build checklist)
└── DEPLOYMENT_TEMPLATE.md       (Phase 4: QA evidence)
```

**Tools You'll Build/Use:**
- **Evidence Collector:** Upload screenshots, logs, test results
- **QA Agent:** Automated validation of Phase 4
- **Architect Service:** Request code reviews
- **Test Harness:** Playwright + API + unit tests

**Self-Check Questions:**
- [ ] Can you fill out a MAPPING template for a sample feature?
- [ ] Do you know how to upload evidence to the evidence API?
- [ ] Can you write a Playwright test for your feature?
- [ ] Do you understand when to request architect review?

---

### Phase 4: Understanding Quality Standards (15 minutes)
**Required Reading:**
1. `docs/UPGRADED_UI_TESTING_PROTOCOL.md` - UI testing requirements
2. User's primary profile in `replit.md` - Non-engineer, UI-only testing

**Critical Understanding:**
- **User Cannot See:** Server logs, code, terminal
- **User Can Only See:** Browser UI, screenshots, buttons clicking
- **Required Proof:** Screenshot evidence + Playwright tests
- **Forbidden Claims:** "Logs show working", "Code compiles", "State updated"

**Testing Standards:**
```typescript
// ❌ WRONG: Claiming feature works based on logs
console.log("Feature working!"); // User can't see this

// ✅ CORRECT: Proving feature works with screenshot
await page.screenshot({ path: 'feature-working.png' });
expect(await page.locator('[data-testid="button-save"]').isVisible()).toBe(true);
```

**Self-Check Questions:**
- [ ] Do you understand the user cannot see server logs?
- [ ] Can you explain why screenshots are mandatory?
- [ ] Do you know how to write a proper Playwright test?
- [ ] Can you identify "broken but compiles" vs "actually working"?

---

## 🧪 PRACTICAL EXERCISES

Before starting your workstream, complete these exercises:

### Exercise 1: Fill Out a MAPPING Template (10 minutes)

**Scenario:** User asks "Add a save button to the chat interface"

**Your Task:** Fill out MAPPING phase
```markdown
## MAPPING PHASE: Add Save Button to Chat

### 1. Documentation Verification
- [ ] Read: client/src/components/mrBlue/ChatInterface.tsx
- [ ] Read: docs/INTEGRATION_PROTOCOL.md
- [ ] Verify: Existing save patterns in codebase

### 2. Data Inspection
```typescript
// Inspect actual component structure
console.log('[DATA_INSPECTION] ChatInterface props:', props);
console.log('[DATA_INSPECTION] Chat state:', state);
```

### 3. Integration Points
- Parent: MrBlueComplete.tsx (imports ChatInterface)
- Save handler: Must connect to backend API
- Visual: Must match MT Ocean theme

### 4. Execution Mode
- Mode: FOCUSED (single component change)
- Reason: Simple button addition, no parallel work

### 5. Success Criteria
- Button visible in UI
- Button clickable
- Button calls save API
- Browser console clean
```

**Check Your Answer:** Did you include all 5 sections? Did you declare execution mode?

---

### Exercise 2: Write a Playwright Test (15 minutes)

**Scenario:** Test the save button you just added

**Your Task:** Write end-to-end test
```typescript
import { test, expect } from '@playwright/test';

test('Chat save button works', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('http://localhost:5000');
  
  // 2. Open Mr Blue
  await page.click('[data-testid="button-open-mrblue"]');
  await expect(page.locator('[data-testid="dialog-mrblue"]')).toBeVisible();
  
  // 3. Go to Chat tab
  await page.click('[data-testid="tab-chat"]');
  
  // 4. Type a message
  await page.fill('[data-testid="input-chat-message"]', 'Test message');
  
  // 5. Click save button
  await page.click('[data-testid="button-save-chat"]');
  
  // 6. Verify save worked
  await expect(page.locator('[data-testid="text-save-success"]')).toBeVisible();
  
  // 7. Take screenshot
  await page.screenshot({ path: 'tests/evidence/chat-save-works.png' });
  
  // 8. Verify no console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.waitForTimeout(1000);
  expect(errors).toHaveLength(0);
});
```

**Check Your Answer:** Does your test verify UI visibility? Does it capture screenshots? Does it check console errors?

---

### Exercise 3: Request Architect Review (10 minutes)

**Scenario:** You completed a feature, need architect approval

**Your Task:** Generate review request
```typescript
// Collect evidence
const evidence = {
  sessionId: 123,
  phase: 'DEPLOYMENT',
  filesModified: [
    'client/src/components/mrBlue/ChatInterface.tsx',
    'server/routes/chatRoutes.ts'
  ],
  screenshots: [
    'tests/evidence/chat-save-button.png',
    'tests/evidence/chat-save-success.png'
  ],
  testResults: {
    passed: 25,
    failed: 0,
    coverage: 85
  },
  serverLogs: '✅ All clean, no errors',
  browserLogs: '✅ No console errors'
};

// Request review
await architectReviewService.requestReview(123, evidence);
```

**Check Your Answer:** Did you include all evidence types? Did you include git diff?

---

## 📋 PRE-EXECUTION CHECKLIST

**Before starting ANY implementation, verify:**

### Squad-Agnostic (All Agents)
- [ ] ✅ Read MB.MD protocol (30 min)
- [ ] ✅ Read complete integration plan (20 min)
- [ ] ✅ Read QA Agent protocol (15 min)
- [ ] ✅ Completed Exercise 1 (MAPPING template)
- [ ] ✅ Completed Exercise 2 (Playwright test)
- [ ] ✅ Completed Exercise 3 (Architect review)
- [ ] ✅ Understand BALANCED quality (simple = auto, complex = review)
- [ ] ✅ Understand user is non-engineer (UI-only testing)

### Squad-Specific

**Squad A (Chat & Voice):**
- [ ] ✅ Read multi-model chat code
- [ ] ✅ Understand tool orchestration
- [ ] ✅ Know how to validate tool calls
- [ ] ✅ Understand voice session lifecycle

**Squad B (Visual Editor & Tabs):**
- [ ] ✅ Read visual editor integration code
- [ ] ✅ Understand tab system architecture
- [ ] ✅ Know integration verification checklist
- [ ] ✅ Can verify component wiring

**Squad C (Autonomy & VibeGraph):**
- [ ] ✅ Read VibeGraph architecture
- [ ] ✅ Understand current testing (BrowserTester)
- [ ] ✅ Know the 6 priorities from research
- [ ] ✅ Can explain auto-approve problem

**Squad D (Governance & QA):**
- [ ] ✅ Read QA Agent protocol completely
- [ ] ✅ Understand evidence requirements
- [ ] ✅ Know quality gate criteria
- [ ] ✅ Can build validation dashboards

---

## 🎓 CERTIFICATION TEST

**To prove you're ready, answer these questions:**

### MB.MD Protocol Questions
1. What are the 4 phases of MB.MD in order?
2. What happens in the MAPPING phase?
3. When is architect review mandatory vs. optional?
4. What evidence is required in DEPLOYMENT phase?

**Answers:**
1. MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT
2. Documentation verification, data inspection, integration point identification, execution mode declaration
3. Mandatory for: new features, logic changes, database changes, security. Optional for: UI tweaks, copy changes, simple fixes.
4. Screenshots, browser console logs, server logs, test results, integration proof, architect approval (if complex)

---

### Your Squad Questions
**Squad A:** How do you validate a tool call before execution?  
**Answer:** Run unit test with sample data, check permissions, validate parameters, predict side effects, log results

**Squad B:** How do you verify a component is integrated?  
**Answer:** Check import exists, JSX renders component, props passed correctly, component visible in browser, screenshot captured

**Squad C:** Why is auto-approve problematic?  
**Answer:** No behavioral evidence, no real validation, can claim "works" when UI is broken, user can't use feature

**Squad D:** What gives QA Agent veto power?  
**Answer:** QA Agent is final gate, validates all Phase 4 evidence, can reject work without complete proof, reports to CEO

---

### Testing Questions
5. Why are screenshots mandatory?
6. What does "browser console clean" mean?
7. Why can't we rely on server logs as proof?
8. What makes a good Playwright test?

**Answers:**
5. User is non-engineer and can only see UI, screenshots prove feature actually works in browser
6. No red errors visible, no missing dependency warnings, expected debug logs present
7. User cannot see server logs, only UI matters, "logs show working" is forbidden claim
8. Tests full user journey, captures screenshots, checks console errors, uses data-testid selectors, verifies actual behavior

---

## 🚀 YOU'RE READY WHEN...

**Complete this statement:** "I am [Squad Letter] agent and I'm ready because..."

**Squad A Example:**
> "I am Squad A agent and I'm ready because:
> - I read the multi-model chat code and understand how tool orchestration works
> - I can write unit tests for tool validation
> - I know how to capture evidence after each chat response
> - I understand when to request architect review (complex queries with tool use)
> - I completed all 3 practical exercises successfully"

**Your Turn:** Write your readiness statement and share with team lead before starting.

---

## 📖 QUICK REFERENCE CARDS

### Card 1: MB.MD Four Phases
```
MAPPING (Before Code)
├─ Read documentation
├─ Inspect runtime data
├─ Identify integration points
└─ Declare execution mode

BREAKDOWN (Plan)
├─ Define tasks
├─ Plan tests
├─ Define screenshots
└─ Document success criteria

MITIGATION (Build + Test)
├─ Unit test complex logic
├─ Integrate immediately
├─ Add diagnostic logs
└─ Run integration tests

DEPLOYMENT (Validate)
├─ Capture screenshots
├─ Check browser console
├─ Check server logs
├─ Request architect review (if complex)
└─ Get QA Agent approval
```

---

### Card 2: Evidence Checklist
```
Phase 1 (MAPPING):
□ Documentation read (list files)
□ Data inspection logs
□ Integration points identified
□ Execution mode declared

Phase 2 (BREAKDOWN):
□ Task list created
□ Test plan defined
□ Screenshot requirements
□ Success criteria

Phase 3 (MITIGATION):
□ Unit tests passed
□ Integration tests passed
□ Components integrated
□ Logs added

Phase 4 (DEPLOYMENT):
□ Screenshots captured
□ Browser console clean
□ Server logs clean
□ Architect approved (if needed)
□ QA Agent approved
```

---

### Card 3: When to Request Architect Review
```
✅ REQUEST REVIEW FOR:
- New features
- Logic changes
- Database migrations
- Security changes
- Super-admin tools
- >50 lines changed
- Breaking changes

❌ NO REVIEW NEEDED FOR:
- UI copy changes
- Style tweaks
- Simple bug fixes (<10 lines)
- No logic changes
```

---

### Card 4: Playwright Test Pattern
```typescript
test('Feature name', async ({ page }) => {
  // 1. Setup
  await page.goto('http://localhost:5000');
  
  // 2. Navigate to feature
  await page.click('[data-testid="button-open"]');
  
  // 3. Interact
  await page.fill('[data-testid="input-field"]', 'value');
  await page.click('[data-testid="button-submit"]');
  
  // 4. Verify UI
  await expect(page.locator('[data-testid="text-success"]')).toBeVisible();
  
  // 5. Screenshot
  await page.screenshot({ path: 'evidence/feature-works.png' });
  
  // 6. Check console
  const errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  expect(errors).toHaveLength(0);
});
```

---

## 🎯 FINAL DIRECTIVE

**You are now ready to build when you:**
1. ✅ Completed all reading (80 minutes total)
2. ✅ Passed certification test (8/8 correct)
3. ✅ Completed all 3 practical exercises
4. ✅ Written your readiness statement
5. ✅ Can explain MB.MD protocol to another agent

**Once ready, proceed to:**
- Squad A → `docs/MB_MD_COMPLETE_INTEGRATION_PLAN.md` Section: Squad A
- Squad B → `docs/MB_MD_COMPLETE_INTEGRATION_PLAN.md` Section: Squad B
- Squad C → `docs/MB_MD_COMPLETE_INTEGRATION_PLAN.md` Section: Squad C
- Squad D → `docs/MB_MD_COMPLETE_INTEGRATION_PLAN.md` Section: Squad D

**Remember:** SIMULTANEOUS execution means all squads work in parallel, but each squad follows MB.MD phases sequentially.

---

**Training Complete:** You're now certified to implement MB.MD protocol  
**Next Step:** Review your squad's section and START BUILDING  
**Support:** If stuck, refer to Quick Reference Cards or ask team lead

🚀 **GO BUILD SOMETHING AMAZING!**
