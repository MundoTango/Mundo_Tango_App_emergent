# MB.MD Quality Assurance Protocol v1.0
## Preventing Catastrophic Failures: Lessons from Mr Blue

**Created:** October 20, 2025  
**Status:** 🔴 MANDATORY for ALL agents  
**Authority:** Platform CEO, All Division Chiefs  
**Trigger:** Mr Blue 97.2% waste incident

---

## 🚨 THE PROBLEM: What Went Wrong with Mr Blue

**Documentation Claimed:** "98% Platform Health - READY FOR LAUNCH"  
**Reality:** 2.5% functional, 97.2% wasted work  
**Root Cause:** Build ≠ Integration

### The Catastrophic Failure Pattern:

```
❌ WRONG WAY (Mr Blue Pattern):
1. Build component files
2. Mark as "100% complete"
3. Never integrate into UI
4. No screenshots
5. No user testing
6. Documentation lies

Result: 14 components built, 0 integrated = 100% waste

✅ RIGHT WAY (MB.MD QA Protocol):
1. VERIFY what exists
2. BUILD component
3. INTEGRATE immediately
4. SCREENSHOT actual render
5. TEST user can access
6. ARCHITECT validates
7. UPDATE DOCS with evidence

Result: Every component proven working + documented
```

---

## 🎯 THE 5 NON-NEGOTIABLE RULES

Every agent MUST follow these rules for EVERY task:

### Rule 1: VERIFY BEFORE BUILD
**What:** Check what already exists before creating anything  
**Why:** Prevents duplicate work and wasted effort  
**How:**
- Read existing files first (use `read` tool)
- Search for similar implementations (use `grep` tool)
- **📋 MANDATORY: Complete documentation verification checklist** (see `docs/DOCUMENTATION_VERIFICATION.md`)
- Verify routes/imports/integrations

**ENFORCEMENT:** Before calling `write_task_list` tool, agents MUST provide documentation evidence in their response:

**Step 1:** Agent searches for and reads all relevant documentation:
```bash
grep "visual editor" docs/ -r
read docs/MrBlue/visual-editor-testing.md
read docs/MB-MD-VISUAL-EDITOR-COMPLETE.md
read docs/audits/MR_BLUE_VISUAL_EDITOR_AGENT_78_AUDIT.md
```

**Step 2:** Agent writes evidence BEFORE calling write_task_list:
```markdown
## Documentation Read:
- ✅ visual-editor-testing.md (342 lines) - Element selection requirements (line 38: purple bounding box)
- ✅ MB-MD-VISUAL-EDITOR-COMPLETE.md (313 lines) - Technical architecture
- ✅ MR_BLUE_VISUAL_EDITOR_AGENT_78_AUDIT.md (30 lines) - Current status

## Requirements Summary:
- Direct click selection (no Cmd/Ctrl) - visual-editor-testing.md line 30
- Purple bounding box on selection - visual-editor-testing.md line 38
- Inline text editing - visual-editor-testing.md line 39
- Delete key removes elements - implied from "edit" workflow

## What Exists:
- iframeOverlay.ts (requires Cmd/Ctrl, uses blue - needs fixing)
- ElementInspector.tsx (already shows data - working)

## What's Missing:
1. Remove Cmd/Ctrl requirement
2. Change to purple bounding box
3. Add inline editing
4. Add delete handler
```

**Step 3:** Then call write_task_list with specific tasks based on evidence

**Architect Review Requirement:** When validating work, architect must ask "Which docs did you read?" and reject if no evidence provided in agent's response BEFORE task list creation.

**Example:**
```bash
# WRONG: Start building without checking
write("client/src/components/NewFeature.tsx", ...)

# RIGHT: Check first
read("client/src/components/")  # See what exists
grep("NewFeature")  # Search for duplicates
# THEN build if truly needed
```

**Anti-Pattern (Mr Blue Failure):**
- Built `lib/mrBlue/chat/ChatInterface.tsx`
- Then rebuilt chat interface inline in `MrBlueComplete.tsx`
- Original file never used = 100% wasted effort

**Correct Pattern with Documentation Evidence:**
```markdown
User: "Add visual editor element selection"

Agent Response:
## Documentation Read:
- ✅ visual-editor-testing.md (342 lines) - Found element selection requirements
- ✅ MB-MD-VISUAL-EDITOR-COMPLETE.md (313 lines) - Found technical architecture  
- ✅ MR_BLUE_VISUAL_EDITOR_AGENT_78_AUDIT.md (30 lines) - Found completion status

## Requirements Summary:
From visual-editor-testing.md line 38:
- "Element selection works (purple bounding box)"
From visual-editor-testing.md line 30:
- "Click on 'Profile' heading element" - Direct click, no Cmd/Ctrl
From visual-editor-testing.md line 39:
- "Inline editing updates DOM immediately"

## What Already Exists:
- ✅ iframeOverlay.ts exists but requires Cmd/Ctrl (line 129)
- ✅ ElementInspector.tsx already shows real data (lines 27-106)
- ❌ No purple bounding box (currently uses blue - line 137)
- ❌ No inline text editing capability

## What's Missing:
1. Remove Cmd/Ctrl requirement from click handler
2. Change blue highlight to purple
3. Add double-click inline text editing
4. Add Delete key handler

[Then creates task list with specific, evidence-backed tasks]
```

---

### Rule 2: INTEGRATE IMMEDIATELY
**What:** Import and wire up components AS YOU BUILD THEM  
**Why:** "Component exists" ≠ "User can access it"  
**How:**
- Import component in parent file
- Add to JSX/render tree
- Wire up props/state
- Test import resolves

**📋 MANDATORY INTEGRATION CHECKLIST** (See `docs/INTEGRATION_PROTOCOL.md` for full details):

**Before marking ANY task complete:**
- [ ] Component built
- [ ] **Component imported in parent** ⚠️ CRITICAL
- [ ] **Component rendered in JSX** ⚠️ CRITICAL
- [ ] **All props passed correctly** ⚠️ CRITICAL
- [ ] **Event handlers wired up** ⚠️ CRITICAL
- [ ] **Backend endpoints exist (if needed)** ⚠️ CRITICAL
- [ ] **Tested user journey end-to-end** ⚠️ CRITICAL
- [ ] **Screenshot taken showing feature** ⚠️ CRITICAL

**Integration Score: Must be 10/10 to mark complete**

**Mr Blue Specific:**
- All new features MUST wire to `ChatInterface.tsx` or `MrBlueComplete.tsx`
- All new tabs MUST be registered in tab list AND rendered
- All tools MUST be added to UniversalToolOrchestrator AND tested
- All voice features MUST wire to VoiceControls component

**Visual Editor Specific:**
- All new tabs MUST wire to `VisualEditorWrapper.tsx`
- All new panels MUST wire to `TabSystem.tsx`
- All code generation MUST wire to `UniversalSaveSystem.tsx`
- All interactions MUST wire to iframe overlay system

**Example:**
```tsx
// WRONG: Build in isolation
// File: lib/features/MyComponent.tsx
export function MyComponent() { ... }
// ❌ Never imported anywhere

// RIGHT: Integrate immediately
// File: lib/features/MyComponent.tsx
export function MyComponent() { ... }

// File: pages/Dashboard.tsx
import { MyComponent } from '@/lib/features/MyComponent';

export function Dashboard() {
  return (
    <div>
      <MyComponent />  {/* ✅ Actually used */}
    </div>
  );
}
```

**Anti-Pattern (Mr Blue Failure):**
- Built 14 components in `lib/mrBlue/`
- ZERO imports in `MrBlueComplete.tsx`
- Components exist but unreachable = 100% waste

**New Learnings:** 
- Provider Hierarchy Gotcha (AGENT_LEARNINGS.md #5)
- Browser API Permissions Reality (AGENT_LEARNINGS.md #7)
- Endpoint Testing (AGENT_LEARNINGS.md #8)
- Wrapper Component Pattern (AGENT_LEARNINGS.md #14)
- Import Chain Verification (AGENT_LEARNINGS.md #16)
- File Organization (AGENT_LEARNINGS.md #17)
- Modal Within Modal Trap (AGENT_LEARNINGS.md #18)

---

### Rule 3: SCREENSHOT EVERYTHING
**What:** Visual proof that feature actually renders  
**Why:** "Code compiles" ≠ "User sees it"  
**How:**
- Use `screenshot` tool after every UI change
- Capture both light and dark mode
- Test at mobile width (375px)
- Save screenshots to docs/screenshots/

**New Learnings:**
- Debug Log Trap (AGENT_LEARNINGS.md #2)
- Modal Opens ≠ Modal Works (AGENT_LEARNINGS.md #6)
- Screenshot Debt (AGENT_LEARNINGS.md #12)

**Example:**
```bash
# WRONG: No visual verification
edit("page.tsx", ...)
# ❌ Assume it works

# RIGHT: Screenshot proves it works
edit("page.tsx", ...)
screenshot("/page")  # ✅ Visual proof
```

**Anti-Pattern (Mr Blue Failure):**
- Claimed "Avatar system operational"
- No screenshot of avatar rendering
- Avatar files exist but never integrated
- Visual regression report: 0 of 10 expected screenshots

---

### Rule 4: TEST USER JOURNEY
**What:** Verify users can actually access the feature  
**Why:** "Button exists" ≠ "Button visible and clickable"  
**How:**
- Click through the actual user flow
- Test with different user roles
- Verify all tabs/modals/routes work
- Test error states

**New Learnings:**
- 0 Errors Illusion (AGENT_LEARNINGS.md #3)
- Conversation Feature Reality Check (AGENT_LEARNINGS.md #4)
- Component Import Illusion (AGENT_LEARNINGS.md #10)
- User Path vs Code Path Gap (AGENT_LEARNINGS.md #11)

**Example:**
```markdown
# WRONG: Assume route works
✅ Created /new-feature route
❌ Never navigated to it

# RIGHT: Test end-to-end
✅ Created /new-feature route
✅ Clicked link to route
✅ Screenshot route rendering
✅ Tested with free user
✅ Tested with admin user
```

**Anti-Pattern (Mr Blue Failure):**
- Built 8 Mr Blue agent UIs
- Never tested clicking the button
- Modal opens but tabs were empty (white screen)
- User journey never validated

---

### Rule 5: ARCHITECT VALIDATES
**What:** Independent expert review before marking "done"  
**Why:** Agents are biased, need objective validation  
**How:**
- Call `architect` tool with full git diff
- Include all modified files
- Answer architect's questions
- Fix issues before proceeding

**Example:**
```typescript
// WRONG: Self-approval
mark_task_complete()  // ❌ No review

// RIGHT: Architect validates
architect({
  task: "Review my payment integration",
  relevant_files: ["server/routes/payments.ts", "client/pages/Checkout.tsx"],
  include_git_diff: true
})
// THEN mark complete after architect approves
```

**Anti-Pattern (Mr Blue Failure):**
- Agent #73-80 marked themselves "100% complete"
- No independent validation
- CEO Agent #0 approved without testing
- Result: 97.2% waste undetected

---

## 📋 PHASE-BASED EXECUTION

The 5 Non-Negotiable Rules are organized into 4 MB.MD phases. Each phase has specific owners and checklists.

### Phase Structure

| Phase | Rules Applied | Primary Owner | Validator | Documentation |
|-------|---------------|---------------|-----------|---------------|
| **Phase 1: MAPPING** | Rule 1 (VERIFY) | Documentation Agent | Architect | `DOCUMENTATION_VERIFICATION.md` |
| **Phase 2: BREAKDOWN** | Rule 2 (INTEGRATE planning) | Architect | Documentation Agent | `PHASE_VERIFICATION_CHECKLISTS.md` |
| **Phase 3: MITIGATION** | Rule 2 (INTEGRATE execution) | Implementation Agent | Architect | `INTEGRATION_PROTOCOL.md` |
| **Phase 4: DEPLOYMENT** | Rules 3, 4, 5 (SCREENSHOT, TEST, VALIDATE) | **QA Agent** | Customer Journey Agent | `QA_AGENT_PROTOCOL.md` |

### Detailed Phase Guides

**For complete phase-specific checklists and learnings:**
- `docs/AGENT_LEARNINGS.md` - All 18 learnings organized by phase
- `docs/PHASE_VERIFICATION_CHECKLISTS.md` - Copy-paste checklists
- `docs/QA_AGENT_PROTOCOL.md` - Phase 4 enforcement with veto power

### Phase 1: MAPPING (Before Writing Code)
**Owner:** Documentation Agent  
**Deliverable:** Evidence summary showing docs read and requirements understood

**Key Activities:**
- Read all relevant documentation
- Map user journey (not code path)
- Identify integration points
- Verify what already exists

**Learnings Applied:**
- #1: Integration Fallacy
- #11: User Path vs Code Path Gap

**Checklist:** `PHASE_VERIFICATION_CHECKLISTS.md` → Phase 1

---

### Phase 2: BREAKDOWN (During Task Planning)
**Owner:** Architect  
**Deliverable:** Task list with integration tests and screenshot requirements

**Key Activities:**
- Break work into specific tasks
- Plan parallel work with serial verification
- Document entry points for multi-path features
- Define screenshot requirements

**Learnings Applied:**
- #9: Parallel Completion Fallacy
- #13: Tab Registration ≠ Tab Content Gap
- #15: Dual Entry Points Confusion

**Checklist:** `PHASE_VERIFICATION_CHECKLISTS.md` → Phase 2

---

### Phase 3: MITIGATION (While Building)
**Owner:** Implementation Agent  
**Deliverable:** Fully integrated component with Architect approval

**Key Activities:**
- Build component AND integrate immediately
- Add context providers to App.tsx
- Handle browser API permissions
- Test API endpoints end-to-end

**Learnings Applied:**
- #5: Provider Hierarchy Gotcha
- #7: Browser API Permissions Reality
- #8: Endpoint Exists ≠ Endpoint Works
- #14: Wrapper Component Pattern
- #16: Import Chain Verification Miss
- #17: File Organization Drift
- #18: Modal Within Modal Trap

**Checklist:** `PHASE_VERIFICATION_CHECKLISTS.md` → Phase 3

---

### Phase 4: DEPLOYMENT (Before Marking Complete)
**Owner:** QA Agent (VETO POWER)  
**Deliverable:** Screenshot evidence + approval OR rejection with fixes required

**Key Activities:**
- Screenshot every user action
- Test full user journey
- Verify browser console clean
- Check Network tab for API success

**Learnings Applied:**
- #2: Debug Log Trap
- #3: 0 Errors Illusion
- #4: Conversation Feature Reality Check
- #6: Modal Opens ≠ Modal Works Trap
- #10: Component Import Illusion
- #12: Screenshot Debt Problem

**Checklist:** `PHASE_VERIFICATION_CHECKLISTS.md` → Phase 4  
**Authority:** `QA_AGENT_PROTOCOL.md` - QA Agent can reject any work

---

### How Phases Work Together

```
User Request
     ↓
PHASE 1: MAPPING (Documentation Agent)
  → Read docs, map user journey, identify integration points
  → Architect validates evidence summary
     ↓
PHASE 2: BREAKDOWN (Architect)
  → Create task list with integration tests
  → Define screenshot requirements
     ↓
PHASE 3: MITIGATION (Implementation Agent)
  → Build + Integrate IMMEDIATELY
  → Architect reviews integration
     ↓
PHASE 4: DEPLOYMENT (QA Agent - FINAL GATE)
  → Screenshot evidence REQUIRED
  → Approve OR Reject
     ↓
   APPROVED → Task Complete ✅
   REJECTED → Return to Phase 3 ❌
```

---

## 🪟 SPECIAL CASE: MODAL/DIALOG TESTING

**Why Modals Are Different:** Modals/dialogs have unique failure modes that require additional testing beyond the 5 rules above.

### Critical Modal Issues (Mr Blue Case Study):
1. **Hidden by default** - Modal exists but never opened during testing
2. **Blank content area** - Tabs render but content area collapsed to 0px
3. **Props not passed** - Component requires props but called without them
4. **Layout collapse** - Radix TabsContent defaults to `display: none`

### Mandatory Modal Tests:
Before marking ANY modal/dialog task complete:

1. **TRIGGER TEST** - Actually open the modal (don't just check button exists)
2. **CONTENT VISIBILITY TEST** - Verify content is VISIBLE, not just in DOM
3. **TAB SWITCHING TEST** - Click every tab and verify content changes
4. **LAYOUT VERIFICATION TEST** - Check content area has height > 200px
5. **INTERACTION TEST** - Actually use at least one feature in the modal
6. **SCREENSHOT TEST** - Capture modal open with visible content (MANDATORY)

**Full Protocol:** See `docs/MB_MD_MODAL_TESTING_PROTOCOL.md` for complete testing checklist, common pitfalls, and Playwright examples.

**Enforcement:** Cannot mark modal tasks `completed` without:
- ✅ Screenshot showing modal open with content visible
- ✅ Playwright test that opens modal and verifies content
- ✅ Architect review with modal screenshots attached

---

## 🔄 THE BUILD-INTEGRATE-VERIFY LOOP

Every feature must complete this loop:

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: VERIFY                                          │
│ ✅ Read existing files                                  │
│ ✅ Search for duplicates                                │
│ ✅ Check documentation                                  │
│ ✅ Verify routes/imports                                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: BUILD                                           │
│ ✅ Write component/feature code                         │
│ ✅ Add TypeScript types                                 │
│ ✅ Add data-testid attributes                           │
│ ✅ Handle error states                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: INTEGRATE                                       │
│ ✅ Import in parent component                           │
│ ✅ Add to render tree                                   │
│ ✅ Wire up props/state                                  │
│ ✅ Test import resolves                                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: SCREENSHOT                                      │
│ ✅ Use screenshot tool                                  │
│ ✅ Capture light + dark mode                            │
│ ✅ Test mobile responsive                               │
│ ✅ Save to docs/screenshots/                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: TEST USER JOURNEY                               │
│ ✅ Navigate via actual UI                               │
│ ✅ Test all interactions                                │
│ ✅ Verify different user roles                          │
│ ✅ Check error handling                                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: ARCHITECT VALIDATES                             │
│ ✅ Call architect tool                                  │
│ ✅ Include full git diff                                │
│ ✅ Fix any issues found                                 │
│ ✅ Get approval before proceeding                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 7: UPDATE DOCS WITH EVIDENCE                       │
│ ✅ Update replit.md with changes                        │
│ ✅ Link to screenshots                                  │
│ ✅ Update feature status                                │
│ ✅ Log in AGENT_SESSION_LOG.md                          │
└─────────────────────────────────────────────────────────┘
                         ↓
                    ✅ COMPLETE
```

**IF ANY STEP FAILS → DO NOT PROCEED**

---

## 📋 COMPONENT INTEGRATION CHECKLIST

Before marking any component "complete":

### Frontend Components:
- [ ] File created and code written
- [ ] Imported in parent component
- [ ] Added to JSX render tree
- [ ] Props wired up correctly
- [ ] TypeScript types defined
- [ ] data-testid attributes added
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Dark mode variants included
- [ ] Mobile responsive tested
- [ ] Screenshot captured
- [ ] User can see it (verified)
- [ ] Architect reviewed

### Backend Routes:
- [ ] Route handler created
- [ ] Registered in routes.ts
- [ ] Middleware applied (auth, validation)
- [ ] Zod schema validation
- [ ] Error handling added
- [ ] Database queries work
- [ ] API tested with curl/Postman
- [ ] Frontend calls the endpoint
- [ ] Response properly formatted
- [ ] Errors properly returned
- [ ] Logged for debugging
- [ ] Architect reviewed

### Database Tables (if applicable - use in-memory storage when possible):
- [ ] Schema defined in shared/schema.ts
- [ ] Insert schema created (Zod)
- [ ] Select type exported
- [ ] Storage interface updated
- [ ] CRUD operations implemented
- [ ] Indexes added for performance
- [ ] Foreign keys defined
- [ ] `npm run db:push` executed (or `--force` if needed)
- [ ] Data actually inserted (tested)
- [ ] Queries return expected data
- [ ] Architect reviewed

**Note:** Per fullstack_js guidelines, prefer in-memory storage (MemStorage) unless database persistence is explicitly required.

---

## 📸 SCREENSHOT VERIFICATION PROTOCOL

Screenshots are MANDATORY for:

### When to Screenshot:
1. **After any UI change** - Even small tweaks
2. **Before marking task complete** - Visual proof
3. **Light AND dark mode** - Both themes
4. **Mobile width (375px)** - Responsive test
5. **Each user role** - Free, Pro, Admin
6. **Error states** - Not just happy path
7. **Loading states** - Skeleton/spinners
8. **Empty states** - No data scenarios

### How to Screenshot:
```typescript
// Use screenshot tool
screenshot("/page-route")

// For specific UI state
screenshot("/dashboard?userId=1")

// For modals (use temp auto-open)
// 1. Edit component: useState(true)
// 2. Screenshot
// 3. Revert: useState(false)
```

### Screenshot Storage:
```
docs/screenshots/
├── YYYY-MM-DD/
│   ├── feature-name-light.png
│   ├── feature-name-dark.png
│   ├── feature-name-mobile.png
│   └── feature-name-error.png
```

### 🔒 Sensitive Data Policy:
**CRITICAL:** Screenshots can leak secrets and PII. Always:
- ✅ Use test accounts only (test@example.com, not real users)
- ✅ Use fake/dummy data (John Doe, 555-0100, etc.)
- ✅ Redact/blur any visible secrets, tokens, API keys
- ✅ Never capture environment variables or .env contents
- ✅ Scrub sensitive info before commit (use git diff to verify)
- ❌ NEVER screenshot production data
- ❌ NEVER screenshot real user emails/names/addresses
- ❌ NEVER show real payment info or credentials

**Violation = Security incident requiring immediate disclosure**

### Screenshot Anti-Patterns (Mr Blue):
❌ "Feature is complete" (no screenshot)  
❌ "Tested locally" (no visual proof)  
❌ "LSP shows 0 errors" (compilation ≠ rendering)  
❌ "Routes registered" (registration ≠ accessible)

---

## 🧪 END-TO-END TESTING REQUIREMENTS

Every feature must pass E2E testing:

### Manual Testing (Immediate):
1. **Navigate to feature** - Via actual UI (not URL bar)
2. **Interact with elements** - Click buttons, fill forms
3. **Verify responses** - API calls work, data displays
4. **Test error cases** - Invalid input, network errors
5. **Check different roles** - Free user, Pro user, Admin
6. **Test mobile view** - Responsive at 375px width

### Automated Testing (Before Release):
1. **Playwright tests** - E2E user journeys
2. **API tests** - Endpoint validation
3. **Visual regression** - Screenshot comparison
4. **Performance tests** - Lighthouse audit
5. **Accessibility tests** - WCAG compliance

### Testing Anti-Patterns (Mr Blue):
❌ Only tested backend in isolation  
❌ Only checked TypeScript compilation  
❌ Assumed modal works without opening it  
❌ Never clicked the actual button  
❌ Never tested with real user flow

---

## 🏗️ ARCHITECT REVIEW STANDARDS

Architect must validate:

### Code Quality:
- [ ] No duplicate code
- [ ] Proper error handling
- [ ] TypeScript types correct
- [ ] No console.log in production
- [ ] Imports resolve correctly
- [ ] No dead code
- [ ] Security vulnerabilities addressed

### Integration:
- [ ] Component actually imported
- [ ] Props wired correctly
- [ ] State management proper
- [ ] API calls correct
- [ ] Database queries work
- [ ] Routes registered
- [ ] Navigation works

### User Experience:
- [ ] Screenshot shows feature working
- [ ] User can access feature
- [ ] Loading states visible
- [ ] Error states handled
- [ ] Mobile responsive
- [ ] Dark mode supported
- [ ] Accessibility considered

### Documentation:
- [ ] Code comments for complex logic
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] User-facing features described
- [ ] Known issues noted

---

## ⚠️ COMMON FAILURE PATTERNS (from Mr Blue)

### Pattern 1: "Component Exists" Fallacy
**Symptom:** File exists but not imported  
**Detection:** `grep "import.*ComponentName"`  
**Fix:** Import and integrate immediately

### Pattern 2: "Route Registered" Fallacy
**Symptom:** Route in routes.ts but never accessed  
**Detection:** Click the actual link in UI  
**Fix:** Test end-to-end navigation

### Pattern 3: "LSP Clean" Fallacy
**Symptom:** 0 TypeScript errors but feature broken  
**Detection:** Screenshot shows nothing rendering  
**Fix:** Visual verification required

### Pattern 4: "Documentation Says So" Fallacy
**Symptom:** Docs claim feature works, reality differs  
**Detection:** Test actual user flow  
**Fix:** Update docs to match reality

### Pattern 5: "Backend Works" Fallacy
**Symptom:** API endpoint exists, frontend doesn't call it  
**Detection:** Check Network tab in browser  
**Fix:** Wire frontend to backend

### Pattern 6: "CSS Changed" Fallacy
**Symptom:** Changed colors but layout still broken  
**Detection:** Screenshot shows white screen  
**Fix:** Fix actual layout issue (height, flex, overflow)

### Pattern 7: "Tabs Visible" Fallacy
**Symptom:** Tabs render but content area empty  
**Detection:** Click each tab, verify content shows  
**Fix:** Fix TabsContent rendering (Radix UI data-[state=active])

### Pattern 8: "Self-Approval" Fallacy
**Symptom:** Agent marks own work complete  
**Detection:** No architect review in task history  
**Fix:** Mandatory independent validation

---

## 👥 AGENT ACCOUNTABILITY MATRIX

| Agent Type | Responsibilities | Failure = |
|------------|-----------------|-----------|
| **Page Agents (PA-001 to PA-119)** | End-to-end page functionality | Page not accessible |
| **Layer Agents (L1-L61)** | System layer integration | Layer not working |
| **Component Agents** | Component integration | Component not rendering |
| **ESA Agents (#73-80)** | Mr Blue functionality | Features not accessible |
| **Agent #0 (CEO)** | Final approval | Approving broken work |
| **Agent #64 (Documentation)** | Docs match reality | Documentation lies |
| **Agent #65 (Project Tracker)** | Accurate tracking | Claiming done when not |

### Accountability Rules:
1. **Primary Owner** = Agent who built it
2. **Secondary Owner** = Agent who approved it
3. **Final Owner** = CEO who signed off

All three are accountable for failures.

---

## 🔍 PRE-WORK VERIFICATION STEPS

Before starting ANY work:

### 1. Read Existing Files
```bash
read("path/to/existing/file.tsx")
```

### 2. Search for Duplicates
```bash
grep("ComponentName", path="client/src")
```

### 3. Check Documentation
```bash
read("docs/FEATURE_GUIDE.md")
```

### 4. Verify Routes
```bash
grep("route.*path", path="client/src/App.tsx")
```

### 5. Check Integration Points
```bash
grep("import.*from", path="client/src/components")
```

### 6. Review Task Requirements
- Understand acceptance criteria
- Know definition of "done"
- Identify dependencies

---

## ✅ POST-WORK VALIDATION STEPS

After completing work:

### 1. Self-Check Integration
```bash
# Verify import exists
grep("import.*MyComponent")

# Verify used in JSX
grep("<MyComponent")
```

### 2. Screenshot Validation
```bash
screenshot("/feature-route")
```

### 3. Manual Testing
- Navigate via UI
- Click all buttons
- Test all interactions
- Verify data displays

### 4. LSP Validation
```bash
get_latest_lsp_diagnostics()
```

### 5. Architect Review
```typescript
architect({
  task: "Review my feature implementation",
  relevant_files: ["all", "modified", "files"],
  include_git_diff: true
})
```

### 6. Update Documentation
- Mark task complete in task list
- Update replit.md if needed
- Log learnings in AGENT_SESSION_LOG.md

---

## 🚫 WHAT NOT TO DO

### Never:
❌ Mark task complete without screenshot  
❌ Build components without integrating  
❌ Claim "100% complete" without testing  
❌ Skip architect review  
❌ Assume code works because it compiles  
❌ Duplicate existing components  
❌ Create files without checking what exists  
❌ Approve your own work  
❌ Update docs without updating code  
❌ Update code without updating docs  

### Always:
✅ Screenshot every UI change  
✅ Test end-to-end user journey  
✅ Integrate components immediately  
✅ Get architect approval  
✅ Verify user can access feature  
✅ Check for existing implementations  
✅ Read files before modifying  
✅ Test with different user roles  
✅ Handle error states  
✅ Support dark mode  

---

## 📊 SUCCESS METRICS

Track these for every agent:

### Integration Rate
```
Integration % = (Components Integrated / Components Built) × 100

Mr Blue: (0 / 14) × 100 = 0%  ❌
Target: > 95%  ✅
```

### Screenshot Coverage
```
Screenshot Coverage = (Screenshots Captured / Features Built) × 100

Mr Blue: (0 / 10) × 100 = 0%  ❌
Target: 100%  ✅
```

### Architect Approval Rate
```
Approval Rate = (Architect Approvals / Tasks Completed) × 100

Mr Blue: (0 / 8) × 100 = 0%  ❌
Target: 100%  ✅
```

### User Journey Success
```
Journey Success = (Working User Flows / Documented Flows) × 100

Mr Blue: (1 / 10) × 100 = 10%  ❌
Target: 100%  ✅
```

---

## 🎯 ENFORCEMENT

This protocol is MANDATORY for:
- ✅ ALL agent work
- ✅ ALL features
- ✅ ALL components
- ✅ ALL pages
- ✅ ALL APIs
- ✅ ALL database changes

### Violations Result In:
1. **First violation:** Work rejected, must redo
2. **Second violation:** Agent flagged for retraining
3. **Third violation:** Agent deprecated

### Audit Schedule:
- **Weekly:** Random spot checks
- **Monthly:** Full agent audits
- **Quarterly:** Platform-wide compliance review

---

## 📚 REQUIRED READING

Before ANY work, agents must read:
1. This document (MB_MD_QA_PROTOCOL.md)
2. MB_MD_DOCUMENTATION_PHASE_MAP.md (which docs to read when)
3. Relevant feature guide (EVENTS_FEATURE_GUIDE.md, etc.)
4. Agent's own documentation file
5. AGENT_SESSION_LOG.md (previous session learnings)

---

## 💡 FINAL WORD

> **"Built ≠ Integrated ≠ Working ≠ Tested ≠ Accessible"**

If the user can't use it, it doesn't exist.

Every agent is responsible for delivering features that:
1. Actually work
2. Users can access
3. Are proven with screenshots
4. Pass architect review
5. Match documentation claims

**No exceptions. No excuses. No more Mr Blue failures.**

---

**Last Updated:** October 20, 2025  
**Version:** 1.0  
**Status:** 🔴 MANDATORY  
**Next Review:** Weekly until zero violations for 30 days

---

## 📘 IMPLEMENTATION ANNEX

### How to Actually Implement This Protocol

This annex maps abstract protocol requirements to concrete tooling and workflows.

#### 1. "Architect" Tool → PR Review Process

**What:** The `architect` tool call maps to structured code review  
**How:**
```typescript
// In your code:
architect({
  task: "Review feature X implementation",
  relevant_files: ["file1.tsx", "file2.ts"],
  include_git_diff: true,
  responsibility: "evaluate_task"
})
```

**Outputs:** Architect agent reviews your code and provides:
- ✅ PASS verdict (proceed) or ❌ FAIL verdict (fix issues)
- Specific feedback on code quality, integration, UX
- Security vulnerabilities found
- Performance concerns
- Required changes before approval

**When to call:**
- After completing any task with code changes
- Before marking task as "completed"
- After batch of 5 pages (Track 2)
- After each test suite (Track 3)

**Enforcement:** Tasks cannot be marked `completed` without architect approval. System will reject `completed` status if `architect_reviewed: "yes"` is not set.

---

#### 2. "Screenshot" Tool → Visual Verification Workflow

**Tool:** `screenshot(path: string)`  

**How:**
```typescript
// Take screenshot of route
screenshot("/mrblue")

// Screenshot with query params (specific state)
screenshot("/profile?userId=123")

// For modals, temporarily set open state
// 1. Edit component: const [open, setOpen] = useState(true)
// 2. screenshot("/page-with-modal")
// 3. Revert: useState(false)
```

**Storage:**
Screenshots are automatically saved and displayed in the tool response. For documentation, manually organize into:
```
docs/screenshots/2025-10-20/
├── mrblue-chat-light.png
├── mrblue-chat-dark.png
├── mrblue-chat-mobile.png
```

**Playwright Alternative:**
For automated visual regression:
```typescript
// tests/visual.spec.ts
test('Mr Blue chat interface', async ({ page }) => {
  await page.goto('/mrblue');
  await expect(page).toHaveScreenshot('mrblue-chat.png');
});
```

---

#### 3. Database Checklist → When It's "Applicable"

**When to use database:**
- ✅ User data must persist across sessions
- ✅ Multi-user collaboration required
- ✅ Complex queries needed (joins, aggregations)
- ✅ Data too large for memory
- ✅ User explicitly requests database

**When NOT to use database:**
- ❌ Single-session tools (calculators, converters)
- ❌ Static data that doesn't change
- ❌ Proof-of-concept/MVP development
- ❌ Data fits comfortably in memory (<1000 items)

**Per fullstack_js guidelines:**
> "Always prefer using in-memory storage (MemStorage) unless you are asked to use a database."

**If you do use database:**
All checklist items apply. Follow the checklist exactly, including:
- Schema in `shared/schema.ts`
- Zod insert/select schemas
- `npm run db:push` (or `--force` if data-loss warning)
- Never manually write SQL migrations

---

#### 4. Enforcement Scripts → Automated Verification

**Pre-Commit Hooks:**
```bash
# Run before every commit (automatically)
# File: .husky/pre-commit or scripts/pre-commit-qa-check.sh

# Check 1: No TODO/FIXME
if git diff --cached | grep -i "TODO\|FIXME"; then
  echo "❌ Remove TODO/FIXME before commit"
  exit 1
fi

# Check 2: TypeScript compiles
npm run typecheck || exit 1

# Check 3: No console.log
if git diff --cached | grep "console\.log"; then
  echo "❌ Remove console.log statements"
  exit 1
fi

# Check 4: All data-testid present (for new components)
# ...additional checks
```

**Pre-Merge Checks (CI/CD):**
```yaml
# File: .github/workflows/qa-protocol.yml
name: MB.MD QA Protocol

on: [pull_request]

jobs:
  qa-check:
    runs-on: ubuntu-latest
    steps:
      - name: Verify screenshot attached
        run: |
          # Check PR description contains image link
          
      - name: Run Playwright tests
        run: npx playwright test
        
      - name: Check architect approval
        run: |
          # Verify PR has "architect-approved" label
          
      - name: Lighthouse audit
        run: |
          # Ensure no performance regression
```

**Current Status:**
- ✅ Protocol documented
- 🚧 Scripts in development (see task PROTOCOL-ENFORCEMENT)
- 📋 Will be linked here when complete

**Temporary Manual Process:**
Until automation complete, manually:
1. Run `npm run typecheck` before commit
2. Grep for console.log: `grep -r "console\.log" client/src`
3. Request architect review explicitly
4. Take screenshots manually with `screenshot` tool

---

#### 5. Cross-Reference Resolution

**Status of Referenced Files:**

| File | Status | Notes |
|------|--------|-------|
| `docs/incidents/MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025.md` | ✅ EXISTS | Full failure analysis |
| `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` | ✅ EXISTS | Phase-based doc routing (650+ lines) |
| `docs/PREVENTION_GUIDE.md` | ✅ EXISTS | Common mistake prevention |
| `docs/AGENT_SESSION_LOG.md` | ✅ EXISTS | Session-to-session logging |
| `scripts/agent-verification.sh` | ✅ EXISTS | Pre-work verification |
| `scripts/verify-completion.sh` | ✅ EXISTS | Post-work validation |
| `scripts/pre-commit-qa-check.sh` | 🚧 TBD | To be created (task PROTOCOL-ENFORCEMENT) |
| `scripts/pre-merge-validation.sh` | 🚧 TBD | To be created (task PROTOCOL-ENFORCEMENT) |
| `.github/workflows/qa-protocol.yml` | 🚧 TBD | To be created (task PROTOCOL-ENFORCEMENT) |

**For TBD items:** Protocol is still enforceable via manual verification until automation complete.

---

#### 6. Protocol Adoption Workflow

**For agents starting new work:**

```
START
  ↓
1. Read MB_MD_QA_PROTOCOL.md (this file)
  ↓
2. Read MB_MD_DOCUMENTATION_PHASE_MAP.md
   → Identify which phase you're in (Mapping/Breakdown/Mitigation/Deployment)
   → Read phase-specific documentation
  ↓
3. Run scripts/agent-verification.sh
   → Verifies system health before you start
   → Checks critical files exist
   → Tests server runs
  ↓
4. Do your work following Build-Integrate-Verify Loop
  ↓
5. Run scripts/verify-completion.sh
   → Detects 0-byte files
   → Verifies TypeScript compiles
   → Confirms server still running
  ↓
6. Call architect tool for review
  ↓
7. Mark task completed (only if architect approved)
  ↓
8. Update AGENT_SESSION_LOG.md with learnings
  ↓
DONE
```

**First-Time Agent Setup:**
```bash
# Install git hooks (one-time)
bash scripts/install-git-hooks.sh

# Verify system health
bash scripts/agent-verification.sh

# You're ready to work!
```

---

#### 7. Emergency Recovery Procedures

**If you accidentally violate the protocol:**

1. **Deleted critical file?**
   ```bash
   # Restore from git
   git show a22010c:path/to/file.ts > path/to/file.ts
   ```

2. **Committed without screenshot?**
   ```bash
   # Take screenshot now
   screenshot("/feature")
   # Amend commit with screenshot link
   git commit --amend
   ```

3. **Skipped architect review?**
   ```bash
   # Call architect now
   architect({...})
   # Do NOT proceed until approved
   ```

4. **Component not integrated?**
   ```bash
   # Import it immediately
   # File: parent-component.tsx
   import { MyComponent } from './MyComponent';
   // Add to JSX
   <MyComponent />
   ```

5. **Documentation lies detected?**
   ```bash
   # Update docs to match reality
   # Admit the gap honestly
   # Create fix plan
   ```

**No hiding violations. Transparency is mandatory.**

---

## 🔗 SEE ALSO

### Core Documentation
- `docs/AGENT_LEARNINGS.md` - 18 learnings organized by MB.MD phase (Playbook)
- `docs/QA_AGENT_PROTOCOL.md` - QA Agent veto power and validation (Enforcement)
- `docs/PHASE_VERIFICATION_CHECKLISTS.md` - Quick reference for each phase (Checklists)
- `docs/LEARNING_CAPTURE_TEMPLATE.md` - Submit new learnings (Evolution)

### Specialized Guides
- `docs/INTEGRATION_PROTOCOL.md` - Mr Blue & Visual Editor integration specifics
- `docs/DOCUMENTATION_VERIFICATION.md` - Phase 1 pre-work checklist
- `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` - Which docs to read when
- `docs/PREVENTION_GUIDE.md` - How to avoid common mistakes

### Audit Reports
- `docs/audits/MR_BLUE_VISUAL_EDITOR_HONEST_AUDIT_OCT_22.md` - Latest audit findings

### Historical Context
- `docs/incidents/MRBLUE_BLACK_SCREEN_INCIDENT_OCT2025.md` - Full failure analysis
- `docs/AGENT_SESSION_LOG.md` - Session-to-session knowledge transfer

### Automation
- `scripts/agent-verification.sh` - Pre-work verification automation
- `scripts/verify-completion.sh` - Post-work validation automation
