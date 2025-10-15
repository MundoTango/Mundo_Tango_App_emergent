# Autonomous UI/UX System - MB.MD V2 Plan

**Date:** October 15, 2025  
**Goal:** Complete UI/UX autonomy - All components self-aware, self-testing, self-fixing  
**Methodology:** MB.MD V2 (Research-First Parallel Execution)  
**Tracks:** 5 parallel tracks  
**Estimated Time:** 8-10 hours (vs 24+ hours sequential = **60-70% time savings**)

---

## 🎯 Mission Statement

**Primary Goal:** Make UI/UX ready for user review as first customer

**Core Principle:** "Have I already built this?" - Validate existing infrastructure first

**Vision:** Complete autonomous agent hierarchy where:
1. Every component is a self-aware agent with history
2. Components self-assess: "Am I doing this correctly?"
3. Components collaborate with colleagues to fix issues
4. Visual Editor changes trigger autonomous learning loops
5. Mr. Blue confirms with user → agents execute → user sees result
6. Dark mode & translation issues fix themselves autonomously

---

## 📊 Current State Analysis

### What We Have (Phase 11 - 60% Complete)
✅ Agent Registry System (295 lines)
✅ Self-Testing Framework (useSelfTest hook)
✅ Auto-Fix Engine (254 lines, 6-step loop)
✅ Mr. Blue Coordinator (212 lines)
✅ Agent #79 (Quality Validator) - Root cause analysis
✅ Agent #80 (Learning Coordinator) - Knowledge distribution
✅ Agent #78 (Visual Editor) - 95% complete
✅ Agent #11 (UI/UX Expert) - Has capabilities, not autonomous
✅ Agent #16 (Translation Expert) - Has capabilities, not autonomous

### What's Missing (40% Remaining)
❌ Sub-agents under Agent #11 for autonomous work
❌ Component agents don't have history tracking
❌ Components can't self-assess correctness
❌ Visual Editor → Mr. Blue → Component loop incomplete
❌ No autonomous scheduling (agents wait for manual trigger)
❌ 11,433 dark: variants still missing (24% coverage)
❌ 3,368 hardcoded strings still present (36% coverage)

---

## 🔄 MB.MD V2 Parallel Execution Plan

### TRACK 1: RESEARCH & DISCOVERY (30 minutes)
**Goal:** Understand existing agent system, identify reusable patterns

**Research Questions:**
1. How do existing agents (Phase 10) auto-schedule their work?
2. What file-watching mechanisms exist?
3. How does agent communication work (A2A protocol)?
4. What's the agent hierarchy structure in esa-master-knowledge-graph.json?
5. How do we add new agents to the org chart?

**Tasks:**
- [ ] Read `server/esa-agents/agent-system.ts` - Base agent class
- [ ] Read `server/esa-master-knowledge-graph.json` - Org chart
- [ ] Read `server/services/AuditScheduler.ts` - Autonomous scheduling
- [ ] Read `server/services/AgentJobRouter.ts` - Job routing
- [ ] Search for existing file watchers (chokidar usage)

**Deliverables:**
- Research summary document
- Pattern library for agent creation
- Scheduling architecture documented

---

### TRACK 2: BUILD UI SUB-AGENTS (3-4 hours)
**Goal:** Create autonomous workers under Agent #11

**Sub-Agent #11.1: Dark Mode Fixer**
- Auto-scans all .tsx/.ts files daily
- Detects missing `dark:` variants
- Fixes simple cases automatically (bg-white → bg-white dark:bg-black)
- Reports complex cases to Agent #11 for review
- Uses pattern library from Agent #79

**Sub-Agent #11.2: Translation Fixer**
- Auto-scans all .tsx files daily
- Detects hardcoded English strings
- Generates i18n keys automatically
- Batch translates using OpenAI (if key available)
- Reports context-sensitive strings for manual review

**Sub-Agent #11.3: Accessibility Auditor**
- Runs on file changes (file watcher)
- Validates WCAG 2.1 AA compliance
- Checks aria-labels, semantic HTML, contrast ratios
- Auto-fixes simple issues (missing alt text, aria-labels)
- Reports violations to Agent #11

**Sub-Agent #11.5: Component File Watcher**
- Watches `client/src/components/**/*` for changes
- Triggers relevant agents based on change type
- Debounces rapid changes (5 second delay)
- Logs all component modifications for history

**Architecture:**
```typescript
Agent #11 (Aurora - UI/UX Expert Supervisor)
  ├─ Agent #11.1 (Dark Mode Fixer) - Cron: daily 2AM
  ├─ Agent #11.2 (Translation Fixer) - Cron: daily 3AM
  ├─ Agent #11.3 (Accessibility Auditor) - Event: file_change
  └─ Agent #11.5 (Component Watcher) - Always running
```

**Files to Create:**
1. `server/esa-agents/ui-sub-agents/DarkModeFixer.ts`
2. `server/esa-agents/ui-sub-agents/TranslationFixer.ts`
3. `server/esa-agents/ui-sub-agents/AccessibilityAuditor.ts`
4. `server/esa-agents/ui-sub-agents/ComponentWatcher.ts`
5. `server/esa-agents/ui-sub-agents/index.ts` (exports all)
6. `server/routes/uiSubAgents.ts` (API routes)

**Database Schema:**
```typescript
// Component history tracking
componentHistory {
  id: serial
  componentPath: varchar
  agentId: varchar
  changeType: varchar (created, modified, deleted, visual_edit)
  changeDescription: text
  changedBy: varchar (user_id or agent_id)
  beforeSnapshot: jsonb
  afterSnapshot: jsonb
  timestamp: timestamp
}

// Sub-agent schedules
agentSchedules {
  id: serial
  agentId: varchar
  schedule: varchar (cron format)
  lastRun: timestamp
  nextRun: timestamp
  status: varchar (active, paused, failed)
}
```

---

### TRACK 3: COMPONENT AUTONOMY SYSTEM (2-3 hours)
**Goal:** Make every component a self-aware agent with history

**Component Agent Pattern:**
```typescript
interface ComponentAgent {
  agentId: string;              // BUTTON_LOGIN
  componentPath: string;        // client/src/components/auth/LoginButton.tsx
  componentType: string;        // button
  parentAgent?: string;         // PAGE_LOGIN
  
  // History & Context
  createdAt: Date;
  createdBy: string;            // agent or user
  changeHistory: ComponentChange[];
  designDecisions: DesignDecision[];
  
  // Self-Assessment
  currentHealth: 'healthy' | 'warning' | 'error';
  lastSelfTest: Date;
  testResults: TestResult[];
  knownIssues: Issue[];
  
  // Learning
  learningCount: number;
  appliedPatterns: string[];
  collaborations: Collaboration[];
}
```

**Capabilities:**
1. **Self-Awareness** - "I am LoginButton, created on X, modified Y times"
2. **History Tracking** - "I was changed in Visual Editor on Oct 15, user moved me 20px right"
3. **Self-Assessment** - "I'm missing dark mode variant, failing accessibility check"
4. **Collaboration** - "I asked SubmitButton how it handles dark mode"
5. **Learning** - "I learned pattern 'aria-label-required' from Agent #79"

**Files to Create:**
1. `client/src/lib/autonomy/ComponentAgent.ts` (base class)
2. `client/src/lib/autonomy/ComponentHistory.ts` (history tracking)
3. `client/src/lib/autonomy/ComponentSelfAssessment.ts` (self-check logic)
4. `client/src/lib/autonomy/ComponentCollaboration.ts` (peer communication)
5. `server/services/componentAgentRegistry.ts` (server-side registry)

---

### TRACK 4: VISUAL EDITOR INTEGRATION (2-3 hours)
**Goal:** Complete Mr. Blue → Visual Editor → Component Agent flow

**User Flow:**
```
1. User opens Visual Editor, navigates to Memories page
2. Mr. Blue knows: current page, recent actions, user context
3. User clicks LoginButton, changes text "Login" → "Sign In"
4. Mr. Blue tracks: component changed, text modified, timestamp
5. Mr. Blue summarizes: "You changed LoginButton text to 'Sign In'"
6. User confirms: "Yes"
7. MB.MD orchestrates:
   a. Notify LoginButton agent of change
   b. LoginButton updates internal state
   c. LoginButton self-tests (accessibility, i18n, dark mode)
   d. If tests pass → Inform Agent #80 → Share with all buttons
   e. If tests fail → Analyze with Agent #79 → Create fix plan
8. User sees final version in Visual Editor
```

**Mr. Blue Enhancements:**
1. **Context Awareness**
   - Track current page via router
   - Log recent user actions (last 10 actions)
   - Identify component user is editing

2. **Change Summarization**
   - Detect what changed (text, position, style, structure)
   - Natural language summary
   - Confidence score (0-1)

3. **Confirmation Dialog**
   - Show summary to super admin
   - Allow edit/undo before confirming
   - Track confirmation history

4. **Agent Orchestration**
   - Trigger component agent learning
   - Coordinate with Agent #79-80 if needed
   - Monitor fix loop progress
   - Report results back to user

**Files to Modify:**
1. `client/src/lib/mrBlue/visualEditor/VisualPageEditor.tsx` (add context)
2. `client/src/lib/autonomy/MrBlueCoordinator.ts` (add confirmation)
3. `server/services/mrBlueOrchestrator.ts` (NEW - orchestration logic)
4. `client/src/components/mr-blue/ConfirmationDialog.tsx` (NEW - UI)

---

### TRACK 5: AUTONOMOUS EXECUTION & TESTING (1-2 hours)
**Goal:** Run autonomous agents, fix UI/UX issues, prepare for review

**Execution Plan:**

**Step 1: Activate Sub-Agents**
```bash
# Register sub-agents in database
POST /api/ui-sub-agents/register

# Schedule autonomous runs
POST /api/ui-sub-agents/schedule
{
  "agentId": "dark_mode_fixer",
  "schedule": "0 2 * * *"  // Daily 2AM
}
```

**Step 2: Run Dark Mode Fixer**
```bash
# Manual trigger for testing
POST /api/ui-sub-agents/dark-mode-fixer/run

Expected:
- Scan ~200 files
- Find ~11,433 missing dark: variants
- Auto-fix ~9,000 simple cases
- Report ~2,433 complex cases
- Time: 10-15 minutes
```

**Step 3: Run Translation Fixer**
```bash
# Manual trigger for testing
POST /api/ui-sub-agents/translation-fixer/run

Expected:
- Scan ~67 pages
- Find ~3,368 hardcoded strings
- Generate i18n keys for all
- Batch translate using OpenAI
- Report context-sensitive cases
- Time: 15-20 minutes
```

**Step 4: Test Component Autonomy**
```bash
# Create test component with issues
# Watch it self-assess, collaborate, fix

Component: TestButton
Issues: Missing dark mode, no aria-label, hardcoded text
Expected:
- Self-test detects 3 issues
- Collaborates with Agent #79 for fixes
- Applies fixes autonomously
- Informs Agent #80 to share learning
- Time: 2-3 minutes
```

**Step 5: Test Visual Editor Flow**
```bash
# User edits component in Visual Editor
# Watch Mr. Blue → Component → Agents → Result

Action: Change button text in Visual Editor
Expected:
- Mr. Blue tracks change
- Confirms with user
- Component agent learns
- Tests automatically
- User sees result
- Time: 30 seconds end-to-end
```

**Step 6: Generate Review Report**
```bash
# Comprehensive UI/UX status
GET /api/ui-sub-agents/review-report

Output:
- Dark Mode: 100% coverage (was 24%)
- Translation: 100% coverage (was 36%)
- Accessibility: WCAG AA compliant
- All pages tested
- All components registered as agents
- Ready for user review
```

---

## 📦 Deliverables Summary

### Backend (8 new files, ~2,000 lines)
1. `server/esa-agents/ui-sub-agents/DarkModeFixer.ts` (300 lines)
2. `server/esa-agents/ui-sub-agents/TranslationFixer.ts` (350 lines)
3. `server/esa-agents/ui-sub-agents/AccessibilityAuditor.ts` (250 lines)
4. `server/esa-agents/ui-sub-agents/ComponentWatcher.ts` (200 lines)
5. `server/esa-agents/ui-sub-agents/index.ts` (50 lines)
6. `server/routes/uiSubAgents.ts` (300 lines)
7. `server/services/mrBlueOrchestrator.ts` (400 lines)
8. `server/services/componentAgentRegistry.ts` (150 lines)

### Frontend (7 new files, ~1,500 lines)
1. `client/src/lib/autonomy/ComponentAgent.ts` (250 lines)
2. `client/src/lib/autonomy/ComponentHistory.ts` (200 lines)
3. `client/src/lib/autonomy/ComponentSelfAssessment.ts` (300 lines)
4. `client/src/lib/autonomy/ComponentCollaboration.ts` (250 lines)
5. `client/src/components/mr-blue/ConfirmationDialog.tsx` (200 lines)
6. Enhanced `client/src/lib/mrBlue/visualEditor/VisualPageEditor.tsx` (+200 lines)
7. Enhanced `client/src/lib/autonomy/MrBlueCoordinator.ts` (+100 lines)

### Database (2 new tables)
1. `componentHistory` table (8 columns)
2. `agentSchedules` table (6 columns)

### Documentation (3 files)
1. `docs/MrBlue/AUTONOMOUS_UI_PLAN.md` (this file)
2. `docs/MrBlue/AUTONOMOUS_UI_SUMMARY.md` (results)
3. `docs/MrBlue/UI_REVIEW_REPORT.md` (for user)

---

## 🔄 Parallel Execution Timeline

**Total Time: 8-10 hours**

```
Hour 0-1: RESEARCH (All tracks)
  ├─ Track 1: Agent system analysis
  ├─ Track 2: Sub-agent patterns
  ├─ Track 3: Component patterns
  ├─ Track 4: Visual Editor architecture
  └─ Track 5: Testing strategy

Hour 1-4: BUILD (Parallel)
  ├─ Track 2: Build 4 sub-agents        [3 hours]
  ├─ Track 3: Build component autonomy  [3 hours]
  └─ Track 4: Build Visual Editor flow  [3 hours]

Hour 4-6: INTEGRATE
  ├─ Connect sub-agents to Agent #11
  ├─ Register components as agents
  └─ Complete Visual Editor integration

Hour 6-8: EXECUTE & TEST
  ├─ Run Dark Mode Fixer (fix 11,433 issues)
  ├─ Run Translation Fixer (fix 3,368 issues)
  └─ Test end-to-end autonomous flow

Hour 8-10: POLISH & REVIEW
  ├─ Generate review report
  ├─ Document autonomous system
  └─ Prepare for user review
```

---

## ✅ Success Criteria

**Technical:**
- [ ] 4 sub-agents operational under Agent #11
- [ ] All components registered as agents with history
- [ ] Visual Editor → Mr. Blue → Component loop complete
- [ ] Autonomous scheduling working (cron + file watcher)
- [ ] Dark mode coverage: 24% → 100%
- [ ] Translation coverage: 36% → 100%

**Functional:**
- [ ] Components can self-assess correctness
- [ ] Components collaborate to fix issues
- [ ] Visual Editor changes trigger learning
- [ ] Mr. Blue confirms with user before execution
- [ ] User sees final version automatically

**Business:**
- [ ] UI/UX ready for user review as first customer
- [ ] All pages tested and validated
- [ ] Comprehensive review report generated
- [ ] System runs autonomously without manual intervention

---

## 🚀 Next Steps

1. **Start Research (Track 1)** - 30 minutes
2. **Build in Parallel (Tracks 2-4)** - 3-4 hours
3. **Integration** - 2 hours
4. **Execution & Testing** - 2 hours
5. **Review Preparation** - 1 hour

**Estimated Completion:** 8-10 hours from now

---

**Ready to Execute?** Let's begin with parallel research across all 5 tracks!
