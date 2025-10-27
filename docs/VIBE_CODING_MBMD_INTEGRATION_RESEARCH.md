# Vibe Coding MB.MD Integration - Research & Implementation Plan

**Created:** October 27, 2025  
**Status:** 🔴 RESEARCH PHASE - DO NOT BUILD YET  
**Authority:** User directive - "Research what needs to be done"

---

## 🚨 THE PROBLEM: Why Mr Blue Isn't Following MB.MD

### User's Question
> "Mr Blue should know what he is supposed to do with this vibe coding stuff and he should be doing his own extensive tests on all of this as he is working which follows mb.md protocol. He should have already been following this protocol, why isn't he?"

### Root Cause: Architectural Mismatch

**Current VibeGraph Flow:**
```
Manager → Editor → Verifier → Tester → Complete
(Plans)   (Builds)  (Auto-✅)  (Autonomous only)
```

**MB.MD Protocol Requirements:**
```
MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT
(Verify)  (Plan)      (Build+Test)  (Validate)
```

**The Gap:** VibeGraph was built BEFORE MB.MD protocol was established. It has the right CONCEPTS (planning, building, verifying, testing) but WRONG EXECUTION (skips verification, auto-approves, no evidence).

---

## 📋 ARCHITECT'S FINDINGS

### Gap #1: Phase Alignment Missing

| MB.MD Phase | Current VibeGraph | What's Missing |
|-------------|-------------------|----------------|
| **Phase 1: MAPPING** | ❌ MISSING | Documentation verification, runtime data inspection, user journey mapping |
| **Phase 2: BREAKDOWN** | ✅ ManagerAgent | Execution mode declaration, integration targets, screenshot requirements |
| **Phase 3: MITIGATION** | ⚠️ EditorAgent only | Unit tests before integration, diagnostic logging, provider hierarchy checks |
| **Phase 4: DEPLOYMENT** | ⚠️ TesterAgent (autonomous only) | Screenshot evidence, architect validation, behavioral proof |

### Gap #2: Governance Failure

**Problem:** No independent validation or quality gates

| Component | Current Behavior | MB.MD Requirement |
|-----------|------------------|-------------------|
| **Verifier Agent** | Auto-approves (MVP stub) | Real code review with issue detection |
| **Tester Agent** | Only runs in autonomous mode | ALWAYS tests, not optional |
| **Architect Validation** | ❌ MISSING | Mandatory before marking complete |
| **Evidence Collection** | ❌ MISSING | Screenshots, logs, proof required |

### Gap #3: Evidence Storage

**Problem:** No structured way to store/track evidence

| Evidence Type | Currently | Needed |
|---------------|-----------|--------|
| Screenshots | Only on test failure | After every change |
| Server logs | Not captured | Must be clean (no errors) |
| Browser console | Not captured | Must be clean (no warnings) |
| Execution mode | Not declared | FOCUSED/PARALLEL/SIMULTANEOUS |
| Integration proof | Not verified | Component actually rendered |
| Data inspection | Not performed | Runtime structures validated |

---

## 🎯 ARCHITECT'S RECOMMENDED ARCHITECTURE

### Strategy: Embed MB.MD as Mandatory Pre/Post-Hook Pipeline

**High-Level Flow:**
```
┌─────────────────────────────────────────────────────┐
│ Phase 1: MAPPING (NEW)                              │
│ - Documentation/Validation Agent                    │
│ - Reads docs, inspects data, maps user journey     │
│ - Forces execution mode declaration                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Phase 2: BREAKDOWN (Enhanced ManagerAgent)         │
│ - Declares execution mode (FOCUSED/PARALLEL/etc)   │
│ - Plans integration points                          │
│ - Defines screenshot requirements                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Phase 3: MITIGATION (Enhanced EditorAgent)         │
│ - Unit tests BEFORE integration                     │
│ - Diagnostic logging added                          │
│ - Integration verification                          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Phase 4: DEPLOYMENT (NEW - Mandatory Validation)   │
│ - Screenshot collection                             │
│ - Server/browser log validation                     │
│ - Real Architect validation (replaces stub)        │
│ - Behavioral evidence required                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTATION PLAN (Priority Order)

### Priority 1: MANDATORY TESTING (Fixes Silent Failures)

**Problem:** Testing only runs in autonomous mode, so most vibe coding changes are UNTESTED.

**Solution:**
```typescript
// ❌ CURRENT - Testing is optional
if (this.enableAutonomousMode) {
  await this.testerNode();
}

// ✅ FIXED - Testing is ALWAYS mandatory
await this.testerNode(); // No condition!
```

**Impact:** Every vibe coding change gets tested before deployment.

**Files to Modify:**
- `server/services/agents/VibeGraph.ts` (line 643 - remove autonomous mode check)

---

### Priority 2: ARCHITECT VALIDATION (Replaces Auto-Approve Stub)

**Problem:** Verifier auto-approves everything without real review.

**Solution:** Replace stub with real Architect validation that requires evidence.

**Evidence Package Required:**
```typescript
interface ArchitectReview {
  codeChanges: CodeChange[];
  screenshots: string[];      // Visual proof
  serverLogs: string[];        // Clean logs
  browserLogs: string[];       // Clean console
  testResults: TestResult;     // Passed tests
  integrationProof: {          // Component rendered
    componentPath: string;
    parentPath: string;
    imported: boolean;
    rendered: boolean;
  };
}
```

**Files to Create:**
- `server/services/agents/ArchitectAgent.ts` (real validation logic)

**Files to Modify:**
- `server/services/agents/VibeGraph.ts` (replace verifierNode with architectNode)

---

### Priority 3: MAPPING PHASE (Documentation Verification)

**Problem:** VibeGraph builds without reading documentation or verifying requirements.

**Solution:** Add pre-manager Documentation/Validation agent.

**Checklist to Complete:**
```typescript
interface MappingPhaseResult {
  documentationRead: string[];     // Files actually read
  requirementsSummary: string;     // What user wants
  existingComponents: string[];    // What already exists
  integrationPoints: string[];     // Where to hook in
  dataStructures: Record<string, any>; // Runtime inspection
  executionMode: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
}
```

**Files to Create:**
- `server/services/agents/DocumentationAgent.ts`

**Files to Modify:**
- `server/services/agents/VibeGraph.ts` (add mappingNode before managerNode)

---

### Priority 4: MITIGATION CHECKPOINTS (Unit Testing + Diagnostic Logging)

**Problem:** EditorAgent generates code without testing individual pieces first.

**Solution:** Add mandatory checkpoints.

**Unit Test Checkpoint:**
```typescript
// Before integration, test complex logic
if (hasComplexLogic(generatedCode)) {
  const unitTestResult = await runUnitTests(generatedCode);
  if (!unitTestResult.passed) {
    throw new Error(`Unit test failed: ${unitTestResult.error}`);
  }
}
```

**Diagnostic Logging Checkpoint:**
```typescript
// Add inspection logging for external data
if (touchesExternalData(generatedCode)) {
  const diagnosticCode = addDataInspectionLogs(generatedCode);
  // Deploy with logging first, verify structure, then optimize
}
```

**Files to Modify:**
- `server/services/agents/EditorAgent.ts` (add pre-integration checks)

---

### Priority 5: EVIDENCE COLLECTION SYSTEM

**Problem:** No structured storage for screenshots, logs, execution mode.

**Solution:** Create evidence database and collection hooks.

**Schema:**
```typescript
// shared/schema.ts
export const vibeEvidenceTable = pgTable('vibe_evidence', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id').notNull(),
  phase: varchar('phase').notNull(), // MAPPING/BREAKDOWN/MITIGATION/DEPLOYMENT
  evidenceType: varchar('evidence_type').notNull(), // screenshot/log/test/proof
  evidencePath: text('evidence_path'),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').defaultNow()
});
```

**Collection Hooks:**
```typescript
// After every code change
await collectEvidence({
  phase: 'MITIGATION',
  type: 'screenshot',
  path: '/screenshots/change-123.png'
});

// After tests
await collectEvidence({
  phase: 'DEPLOYMENT',
  type: 'test',
  metadata: { passed: true, failures: [] }
});
```

**Files to Create:**
- `server/services/EvidenceCollector.ts`
- Add to `shared/schema.ts`

---

### Priority 6: EXECUTION MODE DECLARATION

**Problem:** ManagerAgent doesn't declare how work will be executed.

**Solution:** Force mode declaration in planning prompt.

**Prompt Enhancement:**
```typescript
const systemPrompt = `You are a Manager Agent following MB.MD protocol.

🚨 MANDATORY: Declare execution mode in your response:
- FOCUSED: Serial execution (dependencies between tasks)
- PARALLEL: Independent streams (no dependencies)
- SIMULTANEOUS: All agents at once (comprehensive build)

Example response:
{
  "executionMode": "PARALLEL",
  "reason": "3 independent features with no dependencies",
  "tasks": [...]
}
`;
```

**Files to Modify:**
- `server/services/agents/ManagerAgent.ts` (enhance system prompt)
- `server/services/agents/VibeGraph.ts` (parse and use execution mode)

---

## 📊 BACKWARD COMPATIBILITY STRATEGY

### Question: Can we keep current vibe coding working while adding MB.MD?

**Answer:** YES - Use feature flags and gradual rollout.

**Strategy:**
```typescript
interface VibeGraphOptions {
  autonomousMode?: boolean;
  maxMinutes?: number;
  // NEW FLAGS:
  enableMBMD?: boolean;        // Enable full MB.MD protocol
  strictValidation?: boolean;  // Require architect approval
  forceScreenshots?: boolean;  // Always take screenshots
  unitTestFirst?: boolean;     // Test before integration
}

// Default: Backward compatible (current behavior)
const defaultOptions = {
  enableMBMD: false,
  strictValidation: false,
  forceScreenshots: false,
  unitTestFirst: false
};

// Opt-in: Full MB.MD mode
const mbmdOptions = {
  enableMBMD: true,
  strictValidation: true,
  forceScreenshots: true,
  unitTestFirst: true
};
```

**Rollout Plan:**
1. **Week 1:** Add flags, keep default OFF
2. **Week 2:** Enable for autonomous mode only
3. **Week 3:** Enable for all super admin users
4. **Week 4:** Enable for all users (default ON)

---

## 🧪 TESTING STRATEGY FOR MB.MD INTEGRATION

### How do we test that vibe coding now follows MB.MD?

**Test Suite Required:**
```typescript
describe('VibeGraph MB.MD Compliance', () => {
  it('completes MAPPING phase before planning', async () => {
    const graph = new VibeGraph('Add button', user, {}, { enableMBMD: true });
    const result = await graph.execute();
    
    expect(result.mappingPhase).toBeDefined();
    expect(result.mappingPhase.documentationRead.length).toBeGreaterThan(0);
    expect(result.mappingPhase.executionMode).toMatch(/FOCUSED|PARALLEL|SIMULTANEOUS/);
  });
  
  it('runs unit tests before integration', async () => {
    // Test that complex code gets unit tested
  });
  
  it('collects screenshots after changes', async () => {
    // Verify evidence collection
  });
  
  it('requires architect approval before completion', async () => {
    // Verify no auto-approve
  });
  
  it('validates integration (component rendered)', async () => {
    // Check component in render tree
  });
});
```

---

## 🎯 SUCCESS CRITERIA

**We know MB.MD integration is complete when:**

1. ✅ Every vibe coding session has 4 phases (MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT)
2. ✅ Documentation verification checklist completed BEFORE code generation
3. ✅ Unit tests run BEFORE integration
4. ✅ Screenshots taken AFTER every change
5. ✅ Architect validates WITH behavioral evidence (not just code structure)
6. ✅ Testing is MANDATORY (not optional autonomous mode only)
7. ✅ Evidence database tracks all screenshots, logs, tests
8. ✅ Execution mode declared in every session
9. ✅ Zero auto-approvals without proof
10. ✅ User sees MB.MD phases streaming in real-time

---

## 📚 REQUIRED READING FOR IMPLEMENTATION

Before building ANY of this, implementer MUST read:

1. **MB.MD Constitution:** `docs/MB_MD_QA_PROTOCOL.md`
   - The 5 Non-Negotiable Rules (lines 44-598)
   - Phase-based execution (lines 601-899)

2. **Phase-Specific Learnings:** `docs/AGENT_LEARNINGS.md`
   - Phase 1 learnings (lines 190-293)
   - Phase 2 learnings (lines 320-488)
   - Phase 3 learnings (lines 490-700)
   - Phase 4 learnings (lines 702-1001)

3. **Testing Requirements:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`
   - 4 Mandatory Checkpoints (lines 21-124)
   - Testing levels (lines 157-204)

4. **Current Implementation:** `server/services/agents/VibeGraph.ts`
   - Understand existing flow before changing

---

## ⚠️ CRITICAL WARNINGS

### DO NOT Build Until:
1. ✅ User approves implementation plan
2. ✅ Architect validates architecture
3. ✅ Backward compatibility verified
4. ✅ Test suite designed
5. ✅ Evidence database schema reviewed

### DO NOT Skip:
- Documentation verification in Phase 1
- Unit testing in Phase 3
- Architect validation in Phase 4
- Evidence collection at every step

### DO NOT Auto-Approve:
- Verifier must require evidence
- Tester must always run (not optional)
- Architect must block without proof

---

## 🚀 NEXT STEPS

### For User (You):
1. **Review this research** - Does it answer your question?
2. **Approve priority order** - Should we fix testing first, or mapping first?
3. **Choose rollout strategy** - Feature flags? Immediate? Phased?
4. **Set quality bar** - How strict should validation be?

### For Implementation Agent:
1. **DO NOT START** until user approves plan
2. **Read all documentation** listed above
3. **Start with Priority 1** (mandatory testing)
4. **Collect evidence** at each step
5. **Get architect validation** before marking complete

---

## 📖 SUMMARY: Why Mr Blue Wasn't Following MB.MD

**Short Answer:** VibeGraph was built BEFORE MB.MD protocol existed. It has agents (Manager, Editor, Verifier, Tester) but they don't follow the 5 Rules or 4 Phases.

**What's Missing:**
- No documentation verification before building
- No unit testing before integration
- No screenshot evidence collection
- No architect validation (auto-approves)
- Testing only in autonomous mode (should be always)
- No execution mode declaration
- No integration verification

**What's Needed:**
- Add MAPPING phase (documentation agent)
- Enhance BREAKDOWN phase (execution mode)
- Add MITIGATION checkpoints (unit tests, logging)
- Add DEPLOYMENT validation (screenshots, architect, evidence)
- Replace stub Verifier with real validation
- Make testing mandatory (not optional)
- Build evidence collection system

**Impact:** Once implemented, every vibe coding session will follow MB.MD protocol with extensive testing, documentation verification, and behavioral evidence before claiming "done".

---

**Status:** 🟡 AWAITING USER APPROVAL TO PROCEED  
**Next Action:** User reviews and approves implementation plan  
**Estimated Implementation:** 2-3 days (if done right with full testing)
