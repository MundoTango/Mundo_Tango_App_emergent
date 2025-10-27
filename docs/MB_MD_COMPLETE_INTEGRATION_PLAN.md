# MB.MD Complete Integration Plan - SIMULTANEOUS Execution
**Created:** October 27, 2025  
**Status:** 🟢 APPROVED BY USER - READY TO EXECUTE  
**Execution Mode:** SIMULTANEOUS (4 parallel workstreams)  
**Authority:** Platform CEO + Architect Validation

---

## 🎯 USER REQUIREMENTS

1. **Priority:** BOTH testing AND mapping (do simultaneously)
2. **Rollout:** ALL features (no feature flags, immediate implementation)
3. **Quality:** BALANCED (auto-approve simple, architect review complex)
4. **Testing:** EXTENSIVE testing required to ensure it works

---

## 🏗️ ARCHITECTURE OVERVIEW

### Feature Classification (Architect Analysis)

| Risk Level | Features | MB.MD Requirement | Testing Level |
|------------|----------|-------------------|---------------|
| **HIGH RISK** | VibeGraph, Multi-Model Chat, Omniscient Mode, Voice Realtime | FULL MB.MD (all 4 phases) + Architect sign-off | Unit + Integration + E2E + Screenshots |
| **MEDIUM RISK** | Visual Editor Assist, Site Builder, Avatar AI, Search/Tours/Subs | PARTIAL MB.MD (Mapping + Breakdown + Mitigation) | Integration + Screenshots |
| **LOW RISK** | UI Shell Tabs, Marketing Content | Integration Verification only | Smoke Tests + Screenshots |

---

## 🚀 THE SIMULTANEOUS PLAN: 4 PARALLEL WORKSTREAMS

### Critical Path Dependencies (MUST BE DONE FIRST)

```
┌────────────────────────────────────────────────────────────┐
│ SHARED INFRASTRUCTURE (Week 1 - All squads wait for this) │
└────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────┐
│ 4 PARALLEL WORKSTREAMS (Week 2-3 - Simultaneous)          │
│  Squad A │ Squad B │ Squad C │ Squad D                     │
└────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────┐
│ INTEGRATION & QA VALIDATION (Week 4 - Convergence)        │
└────────────────────────────────────────────────────────────┘
```

---

## 📦 PHASE 0: SHARED INFRASTRUCTURE (WEEK 1)

**Owner:** Platform Infrastructure Team  
**Blockers:** Nothing - START IMMEDIATELY  
**Blocks:** All 4 workstreams

### 0.1 MB.MD Templates & Documentation

**Task:** Create reusable templates for all agents

```
docs/templates/
├── MAPPING_TEMPLATE.md          (Phase 1 checklist)
├── BREAKDOWN_TEMPLATE.md        (Phase 2 task planning)
├── MITIGATION_TEMPLATE.md       (Phase 3 build checklist)
├── DEPLOYMENT_TEMPLATE.md       (Phase 4 QA evidence)
└── EVIDENCE_CHECKLIST.md        (What proof is required)
```

**Deliverables:**
- [ ] MAPPING template with documentation verification checklist
- [ ] BREAKDOWN template with execution mode declaration
- [ ] MITIGATION template with unit test requirements
- [ ] DEPLOYMENT template with screenshot requirements
- [ ] Evidence schema for all artifacts

---

### 0.2 Evidence Collection System

**Task:** Build infrastructure to store MB.MD artifacts

**Database Schema:**
```typescript
// shared/schema.ts - NEW TABLES

export const mbmdSessions = pgTable('mbmd_sessions', {
  id: serial('id').primaryKey(),
  feature: varchar('feature').notNull(), // 'vibe_coding', 'chat', 'voice', etc
  userId: integer('user_id').references(() => users.id),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  status: varchar('status').notNull(), // 'mapping', 'breakdown', 'mitigation', 'deployment', 'complete', 'failed'
  executionMode: varchar('execution_mode'), // 'FOCUSED', 'PARALLEL', 'SIMULTANEOUS'
});

export const mbmdEvidence = pgTable('mbmd_evidence', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => mbmdSessions.id),
  phase: varchar('phase').notNull(), // 'MAPPING', 'BREAKDOWN', 'MITIGATION', 'DEPLOYMENT'
  evidenceType: varchar('evidence_type').notNull(), // 'screenshot', 'log', 'test', 'document'
  evidencePath: text('evidence_path'),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').defaultNow()
});

export const mbmdReviews = pgTable('mbmd_reviews', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => mbmdSessions.id),
  reviewer: varchar('reviewer').notNull(), // 'architect', 'qa_agent', 'test_lead'
  phase: varchar('phase').notNull(),
  approved: boolean('approved').notNull(),
  feedback: text('feedback'),
  reviewedAt: timestamp('reviewed_at').defaultNow()
});
```

**API Endpoints:**
```typescript
// server/routes/mbmd.ts - NEW ROUTES
POST   /api/mbmd/session/start          // Create new MB.MD session
POST   /api/mbmd/evidence/upload        // Upload evidence (screenshot, log)
POST   /api/mbmd/review/request         // Request architect/QA review
GET    /api/mbmd/session/:id/status     // Get session status
GET    /api/mbmd/dashboard              // Admin dashboard for all sessions
```

**Deliverables:**
- [ ] Database tables created and migrated
- [ ] Evidence upload API implemented
- [ ] Session tracking API implemented
- [ ] Admin dashboard (basic view)

---

### 0.3 Test Automation Infrastructure

**Task:** Upgrade Playwright and API test harnesses

**Test Suites Required:**
```
tests/
├── mbmd/
│   ├── mapping-phase.test.ts         (Verify docs read, data inspected)
│   ├── breakdown-phase.test.ts       (Verify execution mode declared)
│   ├── mitigation-phase.test.ts      (Verify unit tests run)
│   └── deployment-phase.test.ts      (Verify screenshots captured)
├── features/
│   ├── vibe-coding.test.ts           (E2E vibe coding with MB.MD)
│   ├── multi-model-chat.test.ts      (E2E chat with tools)
│   ├── voice-mode.test.ts            (Mock voice streaming)
│   └── visual-editor-assist.test.ts  (Element selection + AI)
└── shared/
    ├── screenshot-capture.util.ts    (Auto-screenshot helper)
    ├── log-capture.util.ts           (Server/browser log helper)
    └── evidence-collector.util.ts    (Upload to evidence API)
```

**Deliverables:**
- [ ] Playwright base test suite with screenshot capture
- [ ] API smoke test suite for all endpoints
- [ ] Voice mock streaming test harness
- [ ] Evidence auto-upload during tests

---

### 0.4 Logging & Observability Upgrades

**Task:** Ensure all features log MB.MD phase transitions

**Required Logging:**
```typescript
// All features must log:
console.log('[MB.MD:MAPPING] Starting documentation verification...');
console.log('[MB.MD:BREAKDOWN] Execution mode: SIMULTANEOUS');
console.log('[MB.MD:MITIGATION] Running unit tests...');
console.log('[MB.MD:DEPLOYMENT] Capturing evidence...');

// Data inspection logs:
console.log('[DATA_INSPECTION] Actual structure:', JSON.stringify(data, null, 2));

// Test results:
console.log('[UNIT_TEST] Test passed: sanitizeMarkdown removes ```');

// Evidence:
console.log('[EVIDENCE] Screenshot saved: /screenshots/chat-123.png');
```

**Deliverables:**
- [ ] Logging standards document
- [ ] Logger utility with MB.MD phase tags
- [ ] Browser console log capture utility
- [ ] Server log aggregation setup

---

## 🔄 SQUAD A: CHAT & VOICE (HIGH RISK)

**Owner:** Agent #200 (Chat Specialist)  
**Parallel with:** Squad B, C, D  
**Dependencies:** Phase 0 complete

### Features in Scope
1. Multi-Model Chat (Claude, GPT-4o, Gemini)
2. Consensus Mode (super admin)
3. Tool Orchestration (30 tools)
4. Voice Mode (GPT-4o Realtime API)

---

### A1: Chat System MB.MD Integration

#### Phase 1: MAPPING
**Task:** Before ANY chat message, verify context and documentation

**Implementation:**
```typescript
// server/services/chat/ChatMappingAgent.ts - NEW FILE

export class ChatMappingAgent {
  async mapUserIntent(userMessage: string, context: any): Promise<MappingResult> {
    // 1. Classify request type
    const intent = this.classifyIntent(userMessage);
    
    // 2. Read relevant documentation
    const docs = await this.readRelevantDocs(intent);
    
    // 3. Inspect runtime data structures
    const dataStructures = await this.inspectRuntimeData(context);
    
    // 4. Determine execution mode
    const executionMode = this.determineExecutionMode(intent);
    
    return {
      intent,
      documentationRead: docs,
      dataStructures,
      executionMode,
      integrationPoints: this.identifyIntegrationPoints(intent)
    };
  }
}
```

**Deliverables:**
- [ ] ChatMappingAgent created
- [ ] Intent classification logic
- [ ] Documentation verification integrated
- [ ] Data inspection logs added
- [ ] Execution mode determination

---

#### Phase 2: BREAKDOWN
**Task:** Plan chat response with clear task structure

**Implementation:**
```typescript
// Enhance ManagerAgent to declare execution mode
const systemPrompt = `...
🚨 MANDATORY: Declare execution mode:
- FOCUSED: Single task requiring deep analysis
- PARALLEL: Multiple independent sub-tasks
- SIMULTANEOUS: Comprehensive multi-component response
...`;
```

**Deliverables:**
- [ ] Execution mode declaration in prompts
- [ ] Task breakdown for complex queries
- [ ] Integration points identified
- [ ] Screenshot requirements defined

---

#### Phase 3: MITIGATION
**Task:** Test tool calls and AI responses before sending

**Implementation:**
```typescript
// server/services/tools/ToolValidator.ts - NEW FILE

export class ToolValidator {
  async validateBeforeExecution(toolName: string, params: any): Promise<ValidationResult> {
    // 1. Unit test tool with sample data
    const testResult = await this.runToolUnitTest(toolName, params);
    
    // 2. Check for required permissions
    const hasPermission = await this.checkPermissions(toolName);
    
    // 3. Validate parameters
    const paramsValid = this.validateParams(toolName, params);
    
    // 4. Predict side effects
    const sideEffects = this.analyzeSideEffects(toolName, params);
    
    return {
      passed: testResult.passed && hasPermission && paramsValid,
      warnings: sideEffects,
      evidence: testResult.logs
    };
  }
}
```

**Deliverables:**
- [ ] ToolValidator created
- [ ] Unit tests for all 30 tools
- [ ] Permission validation
- [ ] Side effect analysis
- [ ] Diagnostic logging for tool execution

---

#### Phase 4: DEPLOYMENT
**Task:** Capture evidence before returning response

**Implementation:**
```typescript
// After generating response, collect evidence:
const evidence = await evidenceCollector.collect({
  phase: 'DEPLOYMENT',
  feature: 'multi-model-chat',
  artifacts: [
    { type: 'screenshot', path: screenshotChat() },
    { type: 'log', data: serverLogs },
    { type: 'test', result: toolValidationResults }
  ]
});

// Request QA validation
if (isComplexQuery) {
  await requestArchitectReview(sessionId, evidence);
}
```

**Deliverables:**
- [ ] Evidence collection after each chat
- [ ] Screenshot capture integrated
- [ ] Server/browser log capture
- [ ] Architect review for complex queries
- [ ] QA Agent validation before completion

---

### A2: Voice Mode MB.MD Integration

#### Key Differences for Real-Time Voice
- **MAPPING:** Happens once per voice session (not per utterance)
- **BREAKDOWN:** Stream planning (no blocking task list)
- **MITIGATION:** Pre-flight checks before session starts
- **DEPLOYMENT:** Evidence captured at end of session

**Implementation:**
```typescript
// server/services/voice/VoiceSessionManager.ts - ENHANCE

export class VoiceSessionManager {
  async startSession(userId: number): Promise<VoiceSession> {
    // MB.MD MAPPING: Before session starts
    const mapping = await this.mappingAgent.verifyVoiceSetup({
      micPermission: await checkMicPermission(),
      apiHealth: await checkGPT4oHealth(),
      userContext: await getUserContext(userId)
    });
    
    if (!mapping.ready) {
      throw new Error('Voice session pre-flight checks failed');
    }
    
    // MB.MD BREAKDOWN: Session plan
    const sessionPlan = {
      executionMode: 'FOCUSED', // Voice is always focused (1-on-1)
      maxDuration: '30 minutes',
      tools: mapping.availableTools
    };
    
    // MB.MD MITIGATION: Setup monitoring
    const session = await this.createSession({
      userId,
      plan: sessionPlan,
      monitoring: this.setupRealTimeMonitoring()
    });
    
    // MB.MD DEPLOYMENT: Evidence at end
    session.onEnd(async () => {
      await this.captureEvidence(session);
    });
    
    return session;
  }
}
```

**Deliverables:**
- [ ] Voice pre-flight mapping checks
- [ ] Session plan declaration
- [ ] Real-time monitoring during session
- [ ] Evidence capture at session end
- [ ] Transcript + audio logs saved

---

## 🎨 SQUAD B: VISUAL EDITOR & TABS (MEDIUM RISK)

**Owner:** Agent #201 (Visual Editor Specialist)  
**Parallel with:** Squad A, C, D  
**Dependencies:** Phase 0 complete

### Features in Scope
1. Visual Editor Context Integration
2. Site Builder Automation
3. Avatar AI
4. Search/Tours/Subscriptions
5. 10 Mr Blue Tabs

---

### B1: Visual Editor MB.MD Integration

#### Phase 1: MAPPING
**Task:** When element selected, map context immediately

**Implementation:**
```typescript
// server/services/visualEditor/ContextMapper.ts - NEW FILE

export class VisualEditorContextMapper {
  async mapSelectedElement(element: any): Promise<MappingResult> {
    // 1. Read component documentation
    const componentDocs = await this.findComponentDocs(element.componentPath);
    
    // 2. Inspect element data structure
    console.log('[DATA_INSPECTION] Selected element:', JSON.stringify(element, null, 2));
    
    // 3. Find parent component integration points
    const integrationPoints = await this.findParentComponents(element);
    
    // 4. Determine modification scope
    const scope = this.determineScope(element);
    
    return {
      componentDocs,
      elementStructure: element,
      integrationPoints,
      scope, // 'inline', 'component', 'file'
      executionMode: scope === 'file' ? 'FOCUSED' : 'PARALLEL'
    };
  }
}
```

**Deliverables:**
- [ ] VisualEditorContextMapper created
- [ ] Component documentation lookup
- [ ] Element data inspection
- [ ] Integration point identification
- [ ] Scope determination (inline/component/file)

---

#### Phase 2-4: Apply to Visual Editor AI
- **BREAKDOWN:** Plan code changes based on scope
- **MITIGATION:** Unit test generated code snippets
- **DEPLOYMENT:** Screenshot before/after + browser console check

**Deliverables:**
- [ ] Code change planning integrated
- [ ] Unit tests for CSS/JSX generation
- [ ] Before/after screenshot capture
- [ ] Browser console validation

---

### B2: UI Tabs MB.MD (Light Touch)

**For 10 Mr Blue Tabs:** Apply Integration Verification only

**Checklist per Tab:**
```markdown
## Tab Integration Verification: [Tab Name]

### MAPPING (Light)
- [ ] Read tab documentation (if exists)
- [ ] Verify tab purpose clear

### BREAKDOWN (Light)
- [ ] Tab registered in tab list
- [ ] Tab component imported

### MITIGATION (Light)
- [ ] Tab renders without errors
- [ ] Props passed correctly

### DEPLOYMENT (Mandatory)
- [ ] Screenshot of tab open
- [ ] Screenshot of tab content
- [ ] Browser console clean
- [ ] User can navigate to tab
```

**Deliverables:**
- [ ] Integration verification for all 10 tabs
- [ ] Screenshots for each tab
- [ ] Browser console validation
- [ ] Navigation smoke tests

---

## 🤖 SQUAD C: AUTONOMY & VIBE GRAPH (HIGH RISK)

**Owner:** Agent #202 (Autonomous Systems Specialist)  
**Parallel with:** Squad A, B, D  
**Dependencies:** Phase 0 complete

### Features in Scope
1. VibeGraph (Manager → Editor → Verifier → Tester)
2. Autonomous Coding Mode (200-minute runtime)
3. SessionManager, BrowserTester, SelfHealer

---

### C1: VibeGraph MB.MD Integration

**Status:** Plan already exists in `docs/VIBE_CODING_MBMD_INTEGRATION_RESEARCH.md`

**6 Priorities from Research:**
1. **MANDATORY TESTING** - Remove autonomous mode check
2. **ARCHITECT VALIDATION** - Replace auto-approve stub
3. **MAPPING PHASE** - Add DocumentationAgent before ManagerAgent
4. **MITIGATION CHECKPOINTS** - Unit test + diagnostic logging
5. **EVIDENCE COLLECTION** - Database for screenshots/logs
6. **EXECUTION MODE** - Force declaration in planning

**Implementation Plan:**
```typescript
// server/services/agents/VibeGraph.ts - ENHANCED

export class VibeGraph {
  async execute(): Promise<VibeState> {
    try {
      // 🆕 MB.MD PHASE 1: MAPPING (NEW)
      await this.mappingNode(); // Documentation verification
      
      // MB.MD PHASE 2: BREAKDOWN (Enhanced)
      await this.managerNode(); // Now declares execution mode
      
      // MB.MD PHASE 3: MITIGATION (Enhanced)
      while (this.state.currentTaskIndex < this.state.tasks.length) {
        await this.editorNode();      // Unit tests before integration
        await this.architectNode();    // Real validation (not stub)
        
        // ✅ ALWAYS test (not just autonomous mode)
        await this.testerNode(); // Mandatory testing
        
        this.state.currentTaskIndex++;
      }
      
      // 🆕 MB.MD PHASE 4: DEPLOYMENT (NEW)
      await this.deploymentNode(); // Evidence collection + QA validation
      
      return this.state;
    } catch (error) {
      await this.handleFailure(error);
      return this.state;
    }
  }
  
  // 🆕 NEW: MAPPING NODE
  private async mappingNode(): Promise<void> {
    const documentationAgent = new DocumentationAgent();
    const mapping = await documentationAgent.verify({
      userRequest: this.state.userRequest,
      context: this.state.visualEditorContext
    });
    
    this.state.mappingResult = mapping;
    this.state.status = 'mapping';
    
    await this.evidenceCollector.collect({
      phase: 'MAPPING',
      artifacts: mapping.documentationRead
    });
  }
  
  // 🆕 NEW: DEPLOYMENT NODE
  private async deploymentNode(): Promise<void> {
    // Collect all evidence
    const evidence = await this.evidenceCollector.collect({
      phase: 'DEPLOYMENT',
      artifacts: [
        ...this.state.screenshots,
        ...this.state.testResults,
        ...this.state.logs
      ]
    });
    
    // Request QA validation
    const qaAgent = new QAAgent();
    const approval = await qaAgent.validate(evidence);
    
    if (!approval.approved) {
      throw new Error(`QA Agent rejected: ${approval.feedback}`);
    }
    
    this.state.status = 'complete';
  }
}
```

**Deliverables:**
- [ ] mappingNode() implemented
- [ ] DocumentationAgent created
- [ ] architectNode() replaces verifierNode()
- [ ] ArchitectAgent with real validation
- [ ] testerNode() always runs (not optional)
- [ ] deploymentNode() implemented
- [ ] QAAgent validation integrated
- [ ] Evidence collection at every phase

---

### C2: Autonomous Mode MB.MD Compliance Audit

**Task:** Verify SessionManager already implements MB.MD

**Audit Checklist:**
```markdown
## Autonomous Mode MB.MD Compliance

### MAPPING
- [ ] ❓ Does autonomous mode verify documentation before starting?
- [ ] ❓ Does it inspect runtime data structures?
- [ ] ✅ It declares max runtime (200 minutes)

### BREAKDOWN
- [ ] ✅ SessionManager tracks tasks
- [ ] ✅ Declares metrics (tests run, passed, failed)
- [ ] ❌ Missing: Execution mode declaration

### MITIGATION
- [ ] ✅ BrowserTester runs Playwright tests
- [ ] ✅ SelfHealer attempts fixes
- [ ] ✅ Self-healing loop (retry logic)

### DEPLOYMENT
- [ ] ✅ Screenshots captured on test failure
- [ ] ❌ Missing: Evidence bundle generation
- [ ] ❌ Missing: Architect validation before completion
```

**Gaps to Fix:**
1. Add formal Mapping artifact (task charter + guardrails)
2. Declare execution mode in session
3. Generate evidence bundle at end
4. Request architect review for autonomous runs

**Deliverables:**
- [ ] Autonomous mode audit complete
- [ ] Mapping artifact generated
- [ ] Execution mode declared
- [ ] Evidence bundle at session end
- [ ] Architect review integration

---

## 🛡️ SQUAD D: GOVERNANCE & EVIDENCE (INFRASTRUCTURE)

**Owner:** Agent #203 (QA & Governance Specialist)  
**Parallel with:** Squad A, B, C  
**Dependencies:** Phase 0 complete

### Responsibilities
1. QA Agent Protocol enforcement
2. Architect validation workflows
3. Evidence dashboard
4. Test automation maintenance

---

### D1: QA Agent Implementation

**Task:** Create automated QA Agent that validates Phase 4

**Implementation:**
```typescript
// server/services/qa/QAAgent.ts - NEW FILE

export class QAAgent {
  async validate(evidence: EvidencePackage): Promise<ValidationResult> {
    const checks = [];
    
    // 1. Screenshot evidence check
    checks.push(await this.validateScreenshots(evidence.screenshots));
    
    // 2. User journey test check
    checks.push(await this.validateUserJourney(evidence.testResults));
    
    // 3. Browser console check
    checks.push(await this.validateBrowserLogs(evidence.browserLogs));
    
    // 4. Server log check
    checks.push(await this.validateServerLogs(evidence.serverLogs));
    
    // 5. Integration verification
    checks.push(await this.validateIntegration(evidence.integrationProof));
    
    // 6. Architect review check (if required)
    if (evidence.requiresArchitectReview) {
      checks.push(await this.validateArchitectApproval(evidence.sessionId));
    }
    
    const allPassed = checks.every(c => c.passed);
    
    return {
      approved: allPassed,
      checks,
      feedback: this.generateFeedback(checks)
    };
  }
}
```

**Deliverables:**
- [ ] QAAgent class created
- [ ] Screenshot validation logic
- [ ] User journey validation
- [ ] Browser console validation
- [ ] Server log validation
- [ ] Integration verification
- [ ] Architect review check

---

### D2: Architect Review Workflow

**Task:** Create system for requesting architect reviews

**Implementation:**
```typescript
// server/services/architect/ArchitectReviewService.ts - NEW FILE

export class ArchitectReviewService {
  async requestReview(sessionId: number, evidence: EvidencePackage): Promise<Review> {
    // 1. Generate review request
    const request = await this.generateReviewRequest(sessionId, evidence);
    
    // 2. Call architect tool (existing)
    const architectResult = await this.callArchitectTool({
      task: `Review MB.MD session ${sessionId}`,
      relevant_files: evidence.filesModified,
      include_git_diff: true,
      responsibility: 'evaluate_task'
    });
    
    // 3. Parse architect response
    const review = this.parseArchitectResponse(architectResult);
    
    // 4. Save review to database
    await db.insert(mbmdReviews).values({
      sessionId,
      reviewer: 'architect',
      phase: evidence.phase,
      approved: review.approved,
      feedback: review.feedback
    });
    
    return review;
  }
}
```

**Deliverables:**
- [ ] ArchitectReviewService created
- [ ] Review request generation
- [ ] Architect tool integration
- [ ] Response parsing logic
- [ ] Database persistence

---

### D3: Evidence Dashboard

**Task:** Build admin dashboard to monitor MB.MD compliance

**Features:**
- Real-time session status (MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT)
- Evidence artifacts viewer (screenshots, logs, tests)
- Architect review status
- QA approval status
- Compliance metrics (% sessions following MB.MD)

**Implementation:**
```typescript
// client/src/pages/MBMDDashboard.tsx - NEW FILE

export function MBMDDashboard() {
  const sessions = useQuery({
    queryKey: ['/api/mbmd/sessions'],
  });
  
  return (
    <div className="p-8">
      <h1>MB.MD Compliance Dashboard</h1>
      
      {/* Session Status Grid */}
      <SessionGrid sessions={sessions.data} />
      
      {/* Evidence Viewer */}
      <EvidenceViewer />
      
      {/* Metrics */}
      <ComplianceMetrics />
    </div>
  );
}
```

**Deliverables:**
- [ ] Dashboard page created
- [ ] Session status grid
- [ ] Evidence viewer component
- [ ] Compliance metrics charts
- [ ] Real-time updates via WebSocket

---

## 🎯 QUALITY GATES & REVIEW PROCESS

### Gate 1: After MAPPING Phase
**Reviewer:** Architect  
**Criteria:**
- [ ] Documentation verification checklist complete
- [ ] Runtime data structures inspected
- [ ] Integration points identified
- [ ] Execution mode declared

**Rejection triggers:**
- Missing documentation evidence
- No data inspection logs
- Execution mode not declared

---

### Gate 2: After BREAKDOWN Phase
**Reviewer:** Test Lead  
**Criteria:**
- [ ] Tasks clearly defined
- [ ] Integration tests planned
- [ ] Screenshot requirements defined
- [ ] Success criteria documented

**Rejection triggers:**
- Vague task descriptions
- No test plan
- No screenshot requirements

---

### Gate 3: After MITIGATION Phase
**Reviewer:** Architect  
**Criteria:**
- [ ] Unit tests passed (complex logic)
- [ ] Integration tests passed
- [ ] Diagnostic logs present
- [ ] Code quality checks passed

**Rejection triggers:**
- Unit tests failing
- Integration tests failing
- No diagnostic logging
- Poor code quality

---

### Gate 4: After DEPLOYMENT Phase
**Reviewer:** QA Agent (VETO POWER)  
**Criteria:**
- [ ] Screenshots captured (feature working)
- [ ] Browser console clean
- [ ] Server logs clean
- [ ] User journey tested
- [ ] Integration verified
- [ ] Architect approved (if complex)

**Rejection triggers:**
- Missing screenshots
- Browser errors visible
- Server errors in logs
- User journey fails
- Integration not verified
- Architect rejected

---

## 📊 SUCCESS METRICS

### Compliance Metrics
- **MB.MD Adoption Rate:** % of features following all 4 phases
- **Evidence Completeness:** % of sessions with full evidence package
- **Architect Approval Rate:** % of reviews approved on first submission
- **QA Pass Rate:** % of deployments passing QA validation
- **Testing Coverage:** % of features with automated tests

### Quality Metrics
- **Bug Detection Rate:** Bugs caught before deployment
- **Deployment Success Rate:** % of deployments with no rollbacks
- **User-Facing Errors:** Reduction in production errors
- **Time to Deployment:** Average time from start to QA approval

### Target Goals (30 days after rollout)
- ✅ 95%+ MB.MD adoption rate
- ✅ 100% evidence completeness for high-risk features
- ✅ 80%+ architect approval on first submission
- ✅ 90%+ QA pass rate
- ✅ 75%+ testing coverage
- ✅ 50% reduction in production bugs

---

## 📅 TIMELINE & COORDINATION

### Week 1: Shared Infrastructure
**All squads blocked, working on Phase 0**

| Day | Squad A (Chat) | Squad B (Visual) | Squad C (Vibe) | Squad D (QA) |
|-----|----------------|------------------|----------------|--------------|
| Mon | Templates      | Templates        | Templates      | Templates    |
| Tue | Evidence DB    | Evidence DB      | Evidence DB    | Evidence DB  |
| Wed | Test Harness   | Test Harness     | Test Harness   | Test Harness |
| Thu | Logging        | Logging          | Logging        | Logging      |
| Fri | Documentation  | Documentation    | Documentation  | Documentation|

**Deliverable:** All Phase 0 infrastructure complete

---

### Week 2-3: Parallel Workstreams (SIMULTANEOUS)
**All squads working independently**

| Day | Squad A | Squad B | Squad C | Squad D |
|-----|---------|---------|---------|---------|
| Mon | Chat Mapping | Visual Mapping | Vibe Mapping | QA Agent |
| Tue | Chat Breakdown | Visual Breakdown | Vibe Breakdown | Architect Service |
| Wed | Chat Mitigation | Visual Mitigation | Vibe Mitigation | Dashboard UI |
| Thu | Chat Deployment | Visual Deployment | Vibe Deployment | Test Automation |
| Fri | Voice Mapping | Tabs Verification | Autonomous Audit | Metrics |
| Mon | Voice Breakdown | Site Builder | Vibe Testing | QA Protocol |
| Tue | Voice Mitigation | Avatar AI | Vibe Evidence | Review Workflow |
| Wed | Voice Deployment | Search/Tours | Autonomous Evidence | Dashboard Polish |
| Thu | Testing | Testing | Testing | Testing |
| Fri | Documentation | Documentation | Documentation | Documentation |

**Deliverable:** All 4 workstreams complete

---

### Week 4: Integration & QA Validation
**All squads converge for final testing**

| Day | Activity |
|-----|----------|
| Mon | Integration testing across all features |
| Tue | End-to-end user journey testing |
| Wed | Performance testing + load testing |
| Thu | Security review for super-admin features |
| Fri | Final QA approval + deployment readiness |

**Deliverable:** Full system MB.MD compliant and tested

---

## 🚀 DEPLOYMENT STRATEGY

### Balanced Quality Approach (User Requirement #3)

**Simple Changes (Auto-Approve):**
- UI copy changes
- Style adjustments
- Simple bug fixes
- No logic changes

**Complex Changes (Architect Review Required):**
- New features
- Logic changes
- Database migrations
- Security changes
- Super-admin tools

**Criteria for Auto-Approve:**
```typescript
function requiresArchitectReview(change: CodeChange): boolean {
  return (
    change.linesChanged > 50 ||
    change.touchesDatabase ||
    change.touchesSecurity ||
    change.newFeature ||
    change.breakingChange
  );
}
```

---

## 🧪 EXTENSIVE TESTING PLAN (User Requirement #4)

### After MB.MD Implementation, We Must Test:

#### 1. Unit Tests
- All 30 tools unit tested
- All MB.MD phases unit tested
- All validation logic unit tested
- Target: 80%+ code coverage

#### 2. Integration Tests
- Chat + tool execution
- Vibe coding end-to-end
- Voice session lifecycle
- Visual editor + AI assist
- Target: All critical paths covered

#### 3. E2E Tests (Playwright)
- User opens Mr Blue → sends message → receives response
- User selects element → asks AI → sees change
- User starts voice → speaks → hears response
- User triggers vibe coding → sees preview update
- Target: 95%+ happy path coverage

#### 4. MB.MD Compliance Tests
- Verify MAPPING phase runs
- Verify documentation read
- Verify data inspection
- Verify execution mode declared
- Verify evidence collected
- Verify QA validation runs
- Target: 100% compliance

#### 5. Regression Tests
- Ensure existing features still work
- No performance degradation
- No new errors introduced
- Target: Zero regressions

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Performance Impact
**Risk:** MB.MD adds overhead (docs, tests, evidence collection)  
**Impact:** HIGH  
**Mitigation:**
- Async evidence collection (non-blocking)
- Caching for documentation lookups
- Parallel execution where possible
- Performance benchmarks before/after

### Risk 2: Developer Friction
**Risk:** Too many gates slow down development  
**Impact:** MEDIUM  
**Mitigation:**
- Auto-approve simple changes
- Clear rejection feedback
- Fast review turnaround (<1 hour)
- Templates make compliance easy

### Risk 3: Test Flakiness
**Risk:** Playwright tests fail intermittently  
**Impact:** MEDIUM  
**Mitigation:**
- Retry logic for network flakes
- Proper wait strategies
- Test isolation
- Regular test maintenance

### Risk 4: Evidence Storage Growth
**Risk:** Screenshots/logs consume disk space  
**Impact:** LOW  
**Mitigation:**
- Evidence retention policy (30 days)
- Compression for logs
- S3/Object storage for screenshots
- Cleanup jobs

---

## 🎓 TRAINING & DOCUMENTATION

### Training Required (Week 0 - Before Implementation)
1. **All Agents:** MB.MD protocol overview (2 hours)
2. **All Agents:** Template usage workshop (1 hour)
3. **Squad Leads:** Review process training (1 hour)
4. **QA Agent:** Validation criteria training (2 hours)

### Documentation to Create
- [ ] MB.MD Quick Start Guide
- [ ] Template Usage Examples
- [ ] Review Process Flowchart
- [ ] Troubleshooting Guide
- [ ] FAQ for Common Issues

---

## ✅ ACCEPTANCE CRITERIA

**This implementation is COMPLETE when:**

1. ✅ All 4 workstreams delivered their features
2. ✅ Evidence database operational
3. ✅ QA Agent validates all deployments
4. ✅ Architect reviews integrated
5. ✅ Dashboard shows real-time compliance
6. ✅ Automated tests passing (unit + integration + E2E)
7. ✅ Documentation complete
8. ✅ Training delivered to all agents
9. ✅ User can use Mr Blue and see MB.MD phases streaming
10. ✅ Zero production bugs in first week after deployment

---

## 🚦 EXECUTION COMMAND

**User has approved:**
- Priority: BOTH (testing AND mapping simultaneously)
- Rollout: ALL (no feature flags)
- Quality: BALANCED (auto-approve simple, review complex)
- Backward compat: YES (with extensive testing)

**Next Steps:**
1. ✅ Create this comprehensive plan (DONE)
2. ⏳ Get user final approval
3. ⏳ Start Phase 0 (Shared Infrastructure)
4. ⏳ Launch 4 parallel workstreams
5. ⏳ Converge for integration testing
6. ⏳ Deploy with extensive testing

**Status:** 🟡 AWAITING USER "GO" COMMAND

---

**Created by:** Architect + Agent Analysis  
**Approved by:** Platform CEO (pending)  
**Estimated Duration:** 4 weeks (with 4 parallel squads)  
**Estimated Effort:** ~160 agent-hours (40 hours per squad)
