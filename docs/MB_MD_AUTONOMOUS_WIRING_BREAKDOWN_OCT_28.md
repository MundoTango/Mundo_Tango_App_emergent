# MB.MD Autonomous Mr Blue - Complete Wiring BREAKDOWN
**Date:** October 28, 2025  
**Phase:** BREAKDOWN (Mapping → **BREAKDOWN** → Mitigation → Deployment)  
**Execution Mode:** PARALLEL (3 Independent Workstreams)

---

## Executive Summary

Transform Mr Blue from basic chat interface into **fully autonomous coding agent** with MB.MD protocol integration across ALL features (Chat, Visual Editor, Voice Mode). System must scale to 1,000-10,000 concurrent users while maintaining costs under $1/user/month.

### Key Achievement from MAPPING Phase
- ✅ **100% component inventory complete** (Mr Blue UI, MB.MD infrastructure, agents, voice, APIs)
- ✅ **Critical gaps identified** (6 major missing wiring points)
- ✅ **Documentation reviewed** (MB_MD_QA_PROTOCOL.md, INTEGRATION_PROTOCOL.md, replit.md)

---

## What EXISTS (Inventory from MAPPING)

### 1. Mr Blue UI Layer
- **ChatInterface.tsx** - Main chat UI (database-backed conversations, streaming)
- **MrBlueComplete.tsx** - Modal wrapper with 10 tabs
- **10 Tabs**: Tours, Subscriptions, Search, LifeCEO, SiteBuilder, VisualEditor, AvatarAI, Quality, Admin
- **UnifiedVoiceModal.tsx** - Voice mode interface

### 2. MB.MD Infrastructure
- **SessionManager.ts** - Tracks build sessions, enforces MB.MD phases
- **EvidenceCollector.ts** - Captures screenshots, logs, test results
- **QAAgent.ts** - Quality validation
- **Logger.ts** - Structured logging
- **GrafanaDashboards.ts** - Observability
- **ArchitectReviewService.ts** - Code review service

### 3. Multi-Agent System
- **VibeGraph.ts** - Orchestrates 9 specialized agents
- **MappingPhaseAgent.ts** - Documentation verification, requirements analysis
- **ArchitectAgent.ts** - Evidence-based code review
- **BrowserTesterAgent.ts** - Playwright-based testing
- **SelfHealerAgent.ts** - Auto-fix bugs
- **DocumentationAgent.ts** - Keeps docs in sync
- **ManagerAgent.ts** - Task coordination
- **EditorAgent.ts** - File editing
- **VerifierAgent.ts** - Validation
- **TesterAgent.ts** - Test execution

### 4. Voice Infrastructure
- **VoiceMigrationController.ts** - Manages voice mode transitions
- **BarkService.ts** - Text-to-speech
- **UnifiedVoicePipeline.ts** - Voice processing pipeline

### 5. API Routes
- **mrBlueRoutes.ts** - Conversations, messages, streaming (`/api/mrblue/*`)
- **vibeRoutes.ts** - File editing, repository mapping, vibe execution (`/api/vibe/*`)
- **visualEditorChatRoutes.ts** - Visual editor chat integration

### 6. Replit Integrations
- ✅ `javascript_anthropic` - INSTALLED (Claude 4 Sonnet)
- ⚠️  `javascript_object_storage` - NEEDS SETUP
- ⚠️  `javascript_log_in_with_replit` - NEEDS SETUP
- ⚠️  `javascript_stripe` - NEEDS SETUP

---

## Missing Wiring (6 Critical Gaps)

### Gap 1: ❌ VibeGraph NOT wired to Mr Blue ChatInterface
**Problem:** User sends chat message → goes to basic AI chat → never triggers autonomous coding
**Impact:** Mr Blue can't build applications via conversation
**Files:** `client/src/components/mrBlue/ChatInterface.tsx`, `server/routes/mrBlueRoutes.ts`

### Gap 2: ❌ ArchitectAgent exists but NOT called
**Problem:** VibeGraph.ts line 686 has `TODO: Integrate with ArchitectReviewService` - still using auto-approve stub
**Impact:** No evidence-based code review, broken code gets deployed
**Files:** `server/services/agents/VibeGraph.ts`, `server/services/agents/ArchitectAgent.ts`

### Gap 3: ❌ MappingPhaseAgent NOT called before builds
**Problem:** VibeGraph builds code without reading documentation first
**Impact:** Builds wrong features, wastes resources
**Files:** `server/services/agents/VibeGraph.ts`, `server/services/agents/MappingPhaseAgent.ts`

### Gap 4: ❌ SessionManager NOT started in workflows
**Problem:** MB.MD sessions not tracked, evidence not collected
**Impact:** No MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT enforcement
**Files:** `server/services/mbmd/SessionManager.ts`, `server/routes/mrBlueRoutes.ts`

### Gap 5: ❌ No API route connects Mr Blue → VibeGraph → MB.MD
**Problem:** No endpoint to trigger autonomous coding with MB.MD protocol
**Impact:** Can't wire ChatInterface to VibeGraph orchestrator
**Needs:** New `/api/mrblue/build` endpoint

### Gap 6: ❌ Voice Mode NOT integrated with MB.MD evidence
**Problem:** Voice transcripts not captured as evidence
**Impact:** Voice-driven coding has no audit trail
**Files:** `server/services/voice/UnifiedVoicePipeline.ts`, `server/services/mbmd/EvidenceCollector.ts`

---

## BREAKDOWN Plan: 3 Parallel Workstreams

### Execution Mode: PARALLEL
**Why PARALLEL?** 3 independent workstreams with minimal dependencies
- **Workstream 1** (Session Layer) must complete first
- **Workstream 2** (User Flow) depends on Workstream 1
- **Workstream 3** (Evidence) can run in parallel with Workstream 2

```
START
  │
  ├─→ WORKSTREAM 1: Session Orchestration (2-3 hours)
  │   └─→ DONE → Enable Workstream 2
  │
  ├─→ WORKSTREAM 2: User→Agent Flow (3-4 hours, depends on WS1)
  │
  └─→ WORKSTREAM 3: Evidence & Voice (2-3 hours, parallel with WS2)
       │
       ALL DONE → Integration Tests → Deploy
```

---

## WORKSTREAM 1: Session Orchestration & Evidence Wiring
**Priority:** P0 (blocks everything)  
**Duration:** 2-3 hours  
**Team:** Backend Agent #1

### Goals
1. ✅ Start MB.MD SessionManager for every build request
2. ✅ Expose EvidenceCollector hooks in VibeGraph
3. ✅ Integrate SessionManager with EvidenceCollector, QAAgent, ArchitectReviewService

### Tasks
| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| WS1-1 | Wire SessionManager to VibeGraph | `server/services/agents/VibeGraph.ts`, `server/services/mbmd/SessionManager.ts` | VibeGraph calls `SessionManager.startSession()` on execute |
| WS1-2 | Add session tracking to VibeGraph context | `server/services/agents/VibeGraph.ts` | Every VibeGraph execution has `sessionId` |
| WS1-3 | Integrate EvidenceCollector hooks | `server/services/agents/VibeGraph.ts`, `server/services/mbmd/EvidenceCollector.ts` | Evidence collected at each MB.MD phase |
| WS1-4 | Wire ArchitectReviewService to VibeGraph | `server/services/agents/VibeGraph.ts`, `server/services/mbmd/ArchitectReviewService.ts` | Replace auto-approve stub (line 686) |

### Integration Points
```typescript
// server/services/agents/VibeGraph.ts
import { SessionManager } from '../mbmd/SessionManager';
import { EvidenceCollector } from '../mbmd/EvidenceCollector';
import { ArchitectAgent } from './ArchitectAgent';

class VibeGraph {
  private sessionManager: SessionManager;
  private evidenceCollector: EvidenceCollector;
  private architectAgent: ArchitectAgent;

  async execute(request: VibeRequest) {
    // Start MB.MD session
    const session = await this.sessionManager.startSession({
      userId: request.user.id,
      taskDescription: request.userMessage,
      executionMode: 'PARALLEL' // or from MappingPhaseAgent
    });

    try {
      // MAPPING phase
      const mapping = await this.mappingPhaseAgent.execute({
        userRequest: request.userMessage,
        user: request.user,
        visualEditorContext: request.visualContext
      });

      // BREAKDOWN phase (existing VibeGraph logic)
      const changes = await this.buildCodeChanges(mapping);

      // Collect evidence
      const evidence = await this.evidenceCollector.collect({
        sessionId: session.id,
        codeChanges: changes,
        screenshots: await this.captureScreenshots(),
        testResults: await this.browserTester.test()
      });

      // MITIGATION phase - ArchitectAgent review
      const review = await this.architectAgent.review({
        taskDescription: mapping.requirementsSummary,
        evidencePackage: evidence,
        executionMode: mapping.executionMode
      }, session.id);

      if (!review.approved) {
        throw new Error(`Architect rejected: ${review.issues.join(', ')}`);
      }

      // DEPLOYMENT phase - Apply approved changes
      await this.deployChanges(changes);

      // Complete session
      await this.sessionManager.completeSession(session.id, {
        success: true,
        evidenceId: evidence.id
      });

    } catch (error) {
      await this.sessionManager.failSession(session.id, error);
      throw error;
    }
  }
}
```

### Testing
- [ ] Unit test: SessionManager lifecycle (start → complete → evidence saved)
- [ ] Integration test: VibeGraph calls all MB.MD phases
- [ ] Failure test: ArchitectAgent rejects broken code

---

## WORKSTREAM 2: User→Agent Execution Flow
**Priority:** P0  
**Duration:** 3-4 hours  
**Dependencies:** Requires Workstream 1 complete  
**Team:** Frontend Agent #1, Backend Agent #2

### Goals
1. ✅ Route ChatInterface build intents through new MBMD controller
2. ✅ Trigger MappingPhaseAgent before VibeGraph execution
3. ✅ Replace auto-approve stub with ArchitectAgent

### Tasks
| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| WS2-1 | Create `/api/mrblue/build` endpoint | `server/routes/mrBlueRoutes.ts` | Endpoint accepts build requests |
| WS2-2 | Wire ChatInterface to new endpoint | `client/src/components/mrBlue/ChatInterface.tsx` | "Build this" messages trigger `/api/mrblue/build` |
| WS2-3 | Integrate MappingPhaseAgent in build flow | `server/routes/mrBlueRoutes.ts` | MappingPhaseAgent runs before VibeGraph |
| WS2-4 | Update executeVibeCoding helper | `client/src/lib/mrBlue/chat/executeVibeCoding.ts` | Helper calls new endpoint |
| WS2-5 | Add UI feedback for MB.MD phases | `client/src/components/mrBlue/ChatInterface.tsx` | Show "Mapping → Breakdown → Mitigation → Deployment" progress |

### API Contract: `/api/mrblue/build`

**Endpoint:** `POST /api/mrblue/build`

**Request:**
```typescript
{
  conversationId: number;
  userRequest: string;
  visualContext?: {
    selectedElement: any;
    previewPath: string;
  };
  featureTag?: string; // e.g., "chat", "visual-editor", "voice-mode"
}
```

**Response:**
```typescript
{
  sessionId: string;
  status: 'mapping' | 'breakdown' | 'mitigation' | 'deployment' | 'complete' | 'failed';
  mappingSummary?: MappingPhaseResult;
  progress?: {
    phase: string;
    message: string;
    timestamp: string;
  }[];
  error?: string;
}
```

### Integration Points
```typescript
// server/routes/mrBlueRoutes.ts
router.post('/build', async (req: Request, res: Response) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { conversationId, userRequest, visualContext, featureTag } = req.body;

  // Validate conversation ownership
  const conversation = await storage.getMrBlueConversation(conversationId);
  if (conversation.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Start MB.MD session via VibeGraph
  const vibeGraph = new VibeGraph();
  const result = await vibeGraph.execute({
    user: await db.query.users.findFirst({ where: eq(users.id, userId) }),
    userMessage: userRequest,
    visualContext,
    featureTag
  });

  res.json({
    sessionId: result.sessionId,
    status: result.status,
    mappingSummary: result.mappingSummary
  });
});
```

```typescript
// client/src/components/mrBlue/ChatInterface.tsx
const handleBuildRequest = async (message: string) => {
  try {
    const response = await fetch('/api/mrblue/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: currentConversation.id,
        userRequest: message,
        featureTag: 'chat'
      })
    });

    const result = await response.json();

    // Show progress indicator
    setMbmdPhase(result.status);

    // Poll for updates
    const pollInterval = setInterval(async () => {
      const statusRes = await fetch(`/api/mbmd/sessions/${result.sessionId}`);
      const status = await statusRes.json();
      
      setMbmdPhase(status.status);
      
      if (status.status === 'complete' || status.status === 'failed') {
        clearInterval(pollInterval);
      }
    }, 1000);

  } catch (error) {
    console.error('Build failed:', error);
  }
};
```

### Testing
- [ ] E2E test: User types "build a todo app" → triggers `/api/mrblue/build` → MappingPhaseAgent runs → VibeGraph executes → ArchitectAgent reviews → code deployed
- [ ] UI test: Progress indicator shows MAPPING → BREAKDOWN → MITIGATION → DEPLOYMENT
- [ ] Regression test: Existing chat messages still work

---

## WORKSTREAM 3: Deployment Validation & Voice Evidence
**Priority:** P1  
**Duration:** 2-3 hours  
**Dependencies:** None (parallel with WS2)  
**Team:** Testing Agent #1, Voice Agent #1

### Goals
1. ✅ Extend MB.MD evidence to capture voice and UI artifacts
2. ✅ Ensure tester feedback loops
3. ✅ Wire voice pipelines into evidence logs

### Tasks
| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| WS3-1 | Capture voice transcripts as evidence | `server/services/voice/UnifiedVoicePipeline.ts`, `server/services/mbmd/EvidenceCollector.ts` | Voice sessions logged with transcripts |
| WS3-2 | Add screenshot evidence to BrowserTesterAgent | `server/services/agents/BrowserTesterAgent.ts` | Screenshots captured on test failures |
| WS3-3 | Wire tester feedback loops | `server/services/agents/TesterAgent.ts` | Failed tests trigger SelfHealerAgent |
| WS3-4 | Create integration tests for MB.MD flow | `tests/mbmd/autonomous-flow.spec.ts` | End-to-end MB.MD flow tested |

### Integration Points
```typescript
// server/services/voice/UnifiedVoicePipeline.ts
import { EvidenceCollector } from '../mbmd/EvidenceCollector';

class UnifiedVoicePipeline {
  private evidenceCollector: EvidenceCollector;

  async processVoiceInput(audio: Buffer, sessionId?: string) {
    const transcript = await this.transcribe(audio);
    
    // Log as evidence
    if (sessionId) {
      await this.evidenceCollector.addVoiceEvidence(sessionId, {
        transcript,
        timestamp: new Date(),
        audioLength: audio.length
      });
    }

    return transcript;
  }
}
```

```typescript
// server/services/agents/BrowserTesterAgent.ts
async test(sessionId: string): Promise<BrowserTestResult> {
  const screenshots: string[] = [];
  
  try {
    await this.page.goto(this.url);
    
    // Capture screenshot before test
    const beforePath = await this.captureScreenshot('before');
    screenshots.push(beforePath);

    // Run test
    await this.runTest();

    // Capture screenshot after test
    const afterPath = await this.captureScreenshot('after');
    screenshots.push(afterPath);

    return {
      passed: true,
      screenshots,
      errors: []
    };
  } catch (error) {
    // Capture screenshot on failure
    const errorPath = await this.captureScreenshot('error');
    screenshots.push(errorPath);

    return {
      passed: false,
      screenshots,
      errors: [{ message: error.message, stack: error.stack }]
    };
  }
}
```

### Testing
- [ ] Voice evidence test: Voice message → transcript logged with sessionId
- [ ] Screenshot test: BrowserTesterAgent captures before/after/error screenshots
- [ ] Feedback loop test: Failed test → SelfHealerAgent auto-fixes → re-test

---

## Dependencies Graph

```
WORKSTREAM 1 (Session Layer)
  ├─→ WS1-1: Wire SessionManager to VibeGraph
  ├─→ WS1-2: Add session tracking
  ├─→ WS1-3: Integrate EvidenceCollector
  └─→ WS1-4: Wire ArchitectReviewService
      │
      └─→ ENABLES WORKSTREAM 2 (User Flow)
          ├─→ WS2-1: Create /api/mrblue/build
          ├─→ WS2-2: Wire ChatInterface
          ├─→ WS2-3: Integrate MappingPhaseAgent
          ├─→ WS2-4: Update executeVibeCoding
          └─→ WS2-5: Add UI feedback

WORKSTREAM 3 (Evidence - parallel)
  ├─→ WS3-1: Capture voice transcripts
  ├─→ WS3-2: Add screenshot evidence
  ├─→ WS3-3: Wire tester feedback
  └─→ WS3-4: Create integration tests

ALL WORKSTREAMS COMPLETE → Integration Tests → Deploy
```

---

## Risk Mitigation

### Risk 1: Performance degradation
**Mitigation:** Feature flags to fall back to current flow if MB.MD unavailable
```typescript
// server/lib/feature-flags.ts
export const FEATURES = {
  MBMD_AUTONOMOUS: process.env.ENABLE_MBMD === 'true',
  // ... other flags
};
```

### Risk 2: ArchitectAgent rejects everything
**Mitigation:** Enforce evidence pre-checks, improve test coverage
```typescript
// Mandatory evidence before ArchitectAgent review
const preCheck = this.validateEvidencePackage(evidence);
if (preCheck.critical.length > 0) {
  throw new Error(`Missing critical evidence: ${preCheck.critical.join(', ')}`);
}
```

### Risk 3: Session overload (1,000-10,000 concurrent users)
**Mitigation:** Rate limit new build endpoint, add telemetry dashboards
```typescript
// server/routes/mrBlueRoutes.ts
import rateLimit from 'express-rate-limit';

const buildLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  keyGenerator: (req) => req.user.id
});

router.post('/build', buildLimiter, async (req, res) => { ... });
```

### Risk 4: Cost explosion (Claude 4 Sonnet expensive)
**Mitigation:** MultiModelOrchestrator already exists, aggressive caching
```typescript
// Use cheaper models for simple tasks
const model = complexity === 'simple' 
  ? 'claude-3-haiku-20240307' // Cheap
  : 'claude-sonnet-4-20250514'; // Expensive but powerful
```

---

## Testing Strategy

### Unit Tests
- [ ] `tests/mbmd/SessionManager.spec.ts` - Session lifecycle
- [ ] `tests/agents/MappingPhaseAgent.spec.ts` - Documentation verification
- [ ] `tests/agents/ArchitectAgent.spec.ts` - Evidence validation

### Integration Tests
- [ ] `tests/mbmd/autonomous-flow.spec.ts` - End-to-end MB.MD flow
- [ ] `tests/api/mrblue-build.spec.ts` - `/api/mrblue/build` endpoint
- [ ] `tests/api/vibe-execute.spec.ts` - `/api/vibe/execute` with sessionId

### End-to-End Tests
- [ ] Chat simulation: "Build a todo app" → autonomous coding
- [ ] Voice simulation: Voice command → transcript logged → build triggered
- [ ] Visual editor simulation: Select element → "Change color to blue" → code updated

### Regression Tests
- [ ] Existing chat messages still work
- [ ] Voice mode functional
- [ ] Visual editor click-to-select functional

---

## Success Metrics

### Performance
- ⏱️  Build requests complete in <30 seconds (MAPPING + BREAKDOWN + MITIGATION + DEPLOYMENT)
- 📊 Support 1,000-10,000 concurrent users
- 💰 Cost <$1/user/month

### Quality
- ✅ 100% architect review before deployment
- ✅ 0% auto-approve (all code evidence-validated)
- ✅ 90%+ test coverage for new MB.MD code

### User Experience
- 🎯 User sees real-time MB.MD progress (Mapping → Breakdown → Mitigation → Deployment)
- 🎙️ Voice-driven coding works seamlessly
- 🎨 Visual editor triggers autonomous coding

---

## Next Steps

1. **USER APPROVAL REQUIRED** - Review this BREAKDOWN plan
2. **SIMULTANEOUS BUILD** - Execute all 3 workstreams in parallel
3. **INTEGRATION TESTS** - Validate end-to-end flow
4. **DEPLOYMENT** - Ship to production with feature flags

---

## Appendix: File Change Summary

### New Files (6)
1. `docs/MB_MD_AUTONOMOUS_WIRING_BREAKDOWN_OCT_28.md` - This document
2. `tests/mbmd/autonomous-flow.spec.ts` - E2E test
3. `tests/mbmd/SessionManager.spec.ts` - Unit test
4. `tests/agents/MappingPhaseAgent.spec.ts` - Unit test
5. `tests/agents/ArchitectAgent.spec.ts` - Unit test
6. `tests/api/mrblue-build.spec.ts` - Integration test

### Modified Files (12)
1. `server/services/agents/VibeGraph.ts` - Wire SessionManager, ArchitectAgent, MappingPhaseAgent
2. `server/routes/mrBlueRoutes.ts` - Add `/api/mrblue/build` endpoint
3. `server/services/mbmd/SessionManager.ts` - Add startSession/completeSession methods
4. `server/services/mbmd/EvidenceCollector.ts` - Add voice evidence capture
5. `client/src/components/mrBlue/ChatInterface.tsx` - Wire to `/api/mrblue/build`
6. `client/src/lib/mrBlue/chat/executeVibeCoding.ts` - Call new endpoint
7. `server/services/voice/UnifiedVoicePipeline.ts` - Log transcripts as evidence
8. `server/services/agents/BrowserTesterAgent.ts` - Capture screenshots
9. `server/services/agents/TesterAgent.ts` - Wire feedback loops
10. `server/lib/feature-flags.ts` - Add MBMD_AUTONOMOUS flag
11. `server/routes/vibeRoutes.ts` - Accept sessionId parameter
12. `shared/schema.ts` - Add mbmd_sessions table

---

**BREAKDOWN Phase Complete** ✅  
**Next Phase:** MITIGATION (Risk Analysis) → DEPLOYMENT (Simultaneous Build)
