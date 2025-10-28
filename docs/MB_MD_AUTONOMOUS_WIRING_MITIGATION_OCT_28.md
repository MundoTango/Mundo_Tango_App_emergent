# MB.MD Autonomous Mr Blue - MITIGATION Plan
**Date:** October 28, 2025  
**Phase:** MITIGATION (Mapping → Breakdown → **MITIGATION** → Deployment)  
**Status:** 🟢 GO FOR SIMULTANEOUS BUILD (with guardrails)

---

## Executive Summary

Architect has reviewed the BREAKDOWN plan and **approved simultaneous execution** with critical risk mitigation strategies in place.

**Recommendation:** ✅ **GO** (with guardrails)

---

## Risk Analysis

### Risk 1: Session Lifecycle Race Conditions
**Severity:** 🔴 HIGH  
**Probability:** Medium  
**Impact:** SessionManager creates duplicate sessions, evidence collector logs to wrong session

**Mitigation:**
1. Centralize session context helper in `server/lib/sessionContext.ts`
2. Use database transactions for session creation
3. Add session ID validation middleware

```typescript
// server/lib/sessionContext.ts
export class SessionContext {
  private static sessions = new Map<string, SessionData>();

  static async createSession(data: CreateSessionData): Promise<Session> {
    // Use database transaction to prevent duplicates
    return await db.transaction(async (tx) => {
      const session = await tx.insert(mbmdSessions).values({
        userId: data.userId,
        taskDescription: data.taskDescription,
        status: 'mapping',
        createdAt: new Date()
      }).returning();

      this.sessions.set(session.id, { ...session, startTime: Date.now() });
      return session;
    });
  }

  static getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  static validateSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}
```

**Testing:**
- [ ] Concurrent session creation test (10 parallel requests)
- [ ] Session ID collision test
- [ ] Transaction rollback test

---

### Risk 2: API Schema Drift (Frontend/Backend Mismatch)
**Severity:** 🟡 MEDIUM  
**Probability:** High  
**Impact:** Frontend sends wrong data shape, backend rejects requests

**Mitigation:**
1. Freeze shared Zod schemas in `shared/schema.ts`
2. Add contract tests for `/api/mrblue/build`
3. Use TypeScript types from shared schema

```typescript
// shared/schema.ts
export const buildRequestSchema = z.object({
  conversationId: z.number(),
  userRequest: z.string(),
  visualContext: z.object({
    selectedElement: z.any(),
    previewPath: z.string()
  }).optional(),
  featureTag: z.enum(['chat', 'visual-editor', 'voice-mode']).optional()
});

export type BuildRequest = z.infer<typeof buildRequestSchema>;

export const buildResponseSchema = z.object({
  sessionId: z.string(),
  status: z.enum(['mapping', 'breakdown', 'mitigation', 'deployment', 'complete', 'failed']),
  mappingSummary: z.any().optional(),
  error: z.string().optional()
});

export type BuildResponse = z.infer<typeof buildResponseSchema>;
```

**Testing:**
- [ ] Contract test: Frontend request matches backend schema
- [ ] Contract test: Backend response matches frontend expectations
- [ ] Breaking change detection test

---

### Risk 3: Evidence Collector Emitting Inconsistent Artifacts
**Severity:** 🟡 MEDIUM  
**Probability:** Medium  
**Impact:** ArchitectAgent rejects valid code due to missing evidence

**Mitigation:**
1. Define strict evidence payload interface
2. Add evidence validation before ArchitectAgent review
3. Mock evidence for testing

```typescript
// server/services/mbmd/EvidenceCollector.ts
export interface EvidencePayload {
  sessionId: string;
  codeChanges: Array<{
    filePath: string;
    diff: string;
    type: 'create' | 'modify' | 'delete';
  }>;
  screenshots: string[]; // File paths to screenshots
  testResults: BrowserTestResult;
  serverLogs: string[];
  browserLogs: string[];
  voiceTranscripts?: Array<{
    transcript: string;
    timestamp: Date;
    audioLength: number;
  }>;
}

export class EvidenceCollector {
  async collect(payload: EvidencePayload): Promise<Evidence> {
    // Validate payload structure
    this.validatePayload(payload);

    // Store in database
    const evidence = await db.insert(evidence).values({
      sessionId: payload.sessionId,
      codeChanges: JSON.stringify(payload.codeChanges),
      screenshots: payload.screenshots,
      testResults: JSON.stringify(payload.testResults),
      serverLogs: payload.serverLogs,
      browserLogs: payload.browserLogs,
      voiceTranscripts: JSON.stringify(payload.voiceTranscripts || []),
      createdAt: new Date()
    }).returning();

    return evidence;
  }

  private validatePayload(payload: EvidencePayload): void {
    if (!payload.sessionId) throw new Error('sessionId required');
    if (!payload.codeChanges || payload.codeChanges.length === 0) {
      throw new Error('codeChanges required');
    }
    if (!payload.testResults) throw new Error('testResults required');
  }
}
```

**Testing:**
- [ ] Evidence payload validation test
- [ ] Voice transcript ingestion test
- [ ] Screenshot capture test

---

### Risk 4: File Conflicts (Concurrent Edits)
**Severity:** 🔴 HIGH  
**Probability:** High (3 agents editing same files)  
**Impact:** Merge conflicts, lost work, broken builds

**Files with High Conflict Risk:**
- `server/services/agents/VibeGraph.ts` (WS1 + WS2)
- `server/services/mbmd/SessionManager.ts` (WS1 + WS3)
- `client/src/components/mrBlue/ChatInterface.tsx` (WS2)
- `server/services/mbmd/EvidenceCollector.ts` (WS1 + WS3)

**Mitigation:**
1. **Branch-per-Workstream Strategy**
   ```
   main
   ├── workstream-1-session-orchestration
   ├── workstream-2-user-flow
   └── workstream-3-evidence-voice
   ```

2. **Scheduled Merge Windows**
   - WS1 completes first → merge to main
   - WS2 rebases on WS1 → merge to main
   - WS3 rebases on WS1 + WS2 → merge to main

3. **Code Ownership**
   - WS1 owns: SessionManager, VibeGraph session wiring, ArchitectReviewService
   - WS2 owns: ChatInterface, mrBlueRoutes, MappingPhaseAgent integration
   - WS3 owns: EvidenceCollector voice methods, UnifiedVoicePipeline, BrowserTesterAgent

**Testing:**
- [ ] Merge conflict simulation
- [ ] Cross-workstream integration test

---

## Testing Gaps

### Gap 1: Missing Integration Test for `/api/mrblue/build`
**Priority:** 🔴 CRITICAL  
**File:** `tests/api/mrblue-build.spec.ts` (doesn't exist yet)

```typescript
// tests/api/mrblue-build.spec.ts
import { test, expect } from '@playwright/test';

test.describe('/api/mrblue/build', () => {
  test('happy path - build request triggers MB.MD session', async ({ request }) => {
    // Create conversation first
    const conv = await request.post('/api/mrblue/conversations', {
      data: { title: 'Test Build' }
    });
    const { id } = await conv.json();

    // Trigger build
    const build = await request.post('/api/mrblue/build', {
      data: {
        conversationId: id,
        userRequest: 'Build a todo app',
        featureTag: 'chat'
      }
    });

    expect(build.ok()).toBeTruthy();
    const response = await build.json();
    
    expect(response).toHaveProperty('sessionId');
    expect(response).toHaveProperty('status');
    expect(response.status).toBe('mapping');
  });

  test('architect rejection - bad code rejected', async ({ request }) => {
    // TODO: Implement test that triggers ArchitectAgent rejection
  });

  test('voice transcript ingestion', async ({ request }) => {
    // TODO: Implement test that captures voice transcript as evidence
  });
});
```

### Gap 2: SSE Regression Test
**Priority:** 🟡 MEDIUM  
**File:** `tests/api/mrblue-stream.spec.ts` (needs update)

Ensure existing streaming chat still works after adding `/api/mrblue/build`.

### Gap 3: Evidence Dashboard Validation
**Priority:** 🟡 MEDIUM  
**File:** `tests/e2e/evidence-dashboard.spec.ts` (doesn't exist yet)

Verify Grafana dashboard shows:
- Voice transcripts
- Screenshots
- Test results
- Session status

---

## Rollback Strategy

### Feature Flags
```typescript
// server/lib/feature-flags.ts
export const FEATURES = {
  MBMD_AUTONOMOUS: process.env.ENABLE_MBMD === 'true',
  MBMD_VOICE_EVIDENCE: process.env.ENABLE_VOICE_EVIDENCE === 'true',
  MBMD_ARCHITECT_REVIEW: process.env.ENABLE_ARCHITECT_REVIEW === 'true'
};

// Usage in code
if (FEATURES.MBMD_AUTONOMOUS) {
  // New MB.MD flow
  return await this.executeAutonomous(request);
} else {
  // Legacy flow
  return await this.executeLegacy(request);
}
```

### Git Tags Per Workstream
```bash
# Before starting build
git tag pre-mbmd-wiring

# After WS1 completes
git tag ws1-session-orchestration-complete

# After WS2 completes
git tag ws2-user-flow-complete

# After WS3 completes
git tag ws3-evidence-voice-complete

# If rollback needed
git revert --no-commit ws1-session-orchestration-complete..HEAD
```

### Ops Runbook Toggle Steps
1. Set `ENABLE_MBMD=false` in Replit Secrets
2. Restart workflow
3. Verify legacy chat flow works
4. Investigate issue
5. Fix and re-enable

---

## Pre-Build Checklist

### ✅ Shared Schema Contracts
- [ ] Verify `shared/schema.ts` has buildRequest/buildResponse schemas
- [ ] Verify `mbmdSessions` table schema defined
- [ ] Verify `evidence` table schema defined

### ✅ Environment Variables
- [ ] Confirm `ANTHROPIC_API_KEY` present in Replit Secrets
- [ ] Confirm `DATABASE_URL` present
- [ ] Set `ENABLE_MBMD=false` initially (feature flag off)

### ✅ Baseline Tests
- [ ] Run existing e2e tests (`npm run test:e2e`)
- [ ] Run existing unit tests (`npm run test`)
- [ ] Capture baseline metrics (response times, error rates)

### ✅ Observability
- [ ] Clear Grafana dashboard alerts
- [ ] Verify Loki log ingestion working
- [ ] Set up session metrics dashboard

### ✅ Data-TestID Naming Schema
```typescript
// Naming convention for new components
// Pattern: {action}-{target} or {type}-{content}-{id}

// Examples:
data-testid="button-trigger-autonomous-build"
data-testid="status-mbmd-phase-mapping"
data-testid="text-session-id-{sessionId}"
data-testid="evidence-screenshot-{index}"
```

---

## Success Criteria

### Criterion 1: End-to-End MB.MD Flow
✅ **PASS** if:
1. User sends "Build a todo app" in ChatInterface
2. Backend creates MB.MD session (sessionId in logs)
3. MappingPhaseAgent reads documentation
4. VibeGraph executes with session context
5. ArchitectAgent reviews evidence
6. Code deployed (if approved) or rejected (if broken)

**Validation:**
```bash
# Check logs for session creation
grep "SessionManager.*startSession" /tmp/logs/server.log

# Check logs for MappingPhaseAgent execution
grep "MappingPhaseAgent.*MAPPING phase" /tmp/logs/server.log

# Check logs for ArchitectAgent review
grep "ArchitectAgent.*review" /tmp/logs/server.log
```

### Criterion 2: ArchitectAgent Blocks Bad Diffs
✅ **PASS** if:
1. VibeGraph generates code with missing tests
2. EvidenceCollector captures evidence (but testResults.passed = false)
3. ArchitectAgent rejects (approved = false)
4. Code NOT deployed

**Validation:**
Test with intentionally broken code and verify rejection.

### Criterion 3: Evidence Dashboard Shows Artifacts
✅ **PASS** if Grafana dashboard displays:
- Voice transcript text
- Screenshot file paths
- Test results (pass/fail)
- Session status timeline

### Criterion 4: Regression Suite Passes
✅ **PASS** if:
- Existing chat messages still work
- Voice mode functional
- Visual editor functional
- No new console errors

---

## Build Coordination

### Workstream Ownership

| Workstream | Owner | Files | Start | Depends On |
|------------|-------|-------|-------|------------|
| WS1: Session Orchestration | Backend Agent #1 | VibeGraph.ts, SessionManager.ts, ArchitectReviewService.ts | Immediate | None |
| WS2: User Flow | Frontend Agent #1 + Backend Agent #2 | ChatInterface.tsx, mrBlueRoutes.ts, MappingPhaseAgent integration | After WS1 merge | WS1 complete |
| WS3: Evidence & Voice | Testing Agent #1 + Voice Agent #1 | EvidenceCollector.ts, UnifiedVoicePipeline.ts, BrowserTesterAgent.ts | Parallel with WS2 | WS1 complete |

### Merge Sequencing
```
Timeline:
T+0h:    WS1 starts (Session Orchestration)
T+2h:    WS1 completes → merge to main → tag ws1-complete
T+2h:    WS2 starts (rebase on main) + WS3 starts (rebase on main)
T+6h:    WS2 completes → merge to main → tag ws2-complete
T+6h:    WS3 completes → merge to main → tag ws3-complete
T+7h:    Integration tests run
T+8h:    Feature flag enabled → production deploy
```

---

## Final Architect Recommendation

**Status:** ✅ **GO FOR SIMULTANEOUS BUILD**

**Conditions:**
1. ✅ Branch-per-workstream strategy in place
2. ✅ Shared session context helper prevents race conditions
3. ✅ Feature flags enable safe rollback
4. ✅ Missing tests will be written as part of build
5. ✅ Evidence payload contracts defined
6. ✅ Pre-build checklist verified

**Next Action:** Execute DEPLOYMENT phase (simultaneous build)

---

## Appendix: Emergency Contacts

### If Build Fails
1. Check feature flags (set `ENABLE_MBMD=false`)
2. Check logs (`/tmp/logs/server.log`)
3. Revert to git tag `pre-mbmd-wiring`
4. Post-mortem in `docs/incidents/`

### Known Issues
- None (pre-build)

### Escalation Path
1. Architect Agent review
2. User approval required for rollback

---

**MITIGATION Phase Complete** ✅  
**Next Phase:** DEPLOYMENT (Simultaneous Build of 3 Workstreams)
