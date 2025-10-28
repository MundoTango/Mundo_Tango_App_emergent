# MB.MD Complete Mr Blue Research Plan - SIMULTANEOUS Execution
**Created:** October 28, 2025  
**Status:** 🔴 MAPPING PHASE ONLY - RESEARCH, DO NOT BUILD  
**Execution Mode:** SIMULTANEOUS (All MB.MD agents participating)  
**Authority:** User Directive

---

## 🎯 USER REQUEST

**Immediate Tasks:**
1. Add automated tests (integration tests for session start, upload scoping, evidence recording)
2. Monitor object storage (watch for anomalous prefixes to catch bypass attempts)
3. Expand observability (metrics/log retention for MB.MD compliance data in production)

**Strategic Question:**
"What else does Mr Blue, mb.md, need to fully understand and do all things for MT using mb.md and all of the vibe coding, orchestration, ai smartness, and all of the other things that we have done to make Mr Blue be a fully functional super powered vibe coding ai platform?"

**Method:** ALL mb.md agents should participate SIMULTANEOUSLY

---

## 📚 MAPPING PHASE: What We Know

### Current Mr Blue Capabilities (From Documentation)

**1. Universal AI Access (3 Entry Points)**
- ✅ Chat Interface (multi-model with Claude 3.5 Sonnet, GPT-4o, Gemini)
- ✅ Voice Mode (GPT-4o Realtime API for two-way voice)
- ✅ Visual Editor (Figma-like element selection + AI code generation)

**2. AI Orchestration**
- ✅ 927+ Agent Hierarchy (Algorithm A1-A30, Intelligence #110-116, Life CEO #73-80, ESA #1-114)
- ✅ Self-Awareness (knows agents, deletion impact, cleanup actions)
- ✅ Multi-Model Routing (Claude/GPT-4o/Gemini based on task type)
- ✅ SessionManager Orchestration (evidence recording, review requests)

**3. Vibe Coding Features**
- ✅ VibeGraph Multi-Agent (Manager → Editor → Architect → Tester → Deployment)
- ✅ Change Queueing (auto-queue edits, NO extra Apply buttons)
- ✅ Diff Preview (before/after code changes)
- ✅ Git Integration (Agent #126 - AI commit messages)
- ⚠️ MB.MD Integration (PARTIAL - missing MAPPING phase, testing optional, auto-approve stub)

**4. Browser Automation**
- ✅ Playwright Integration
- ✅ Self-Healing (Agent fixes test failures)
- ✅ Screenshot Capture

**5. Specialized Agents**
- ✅ Agent #126 (Git Operations Specialist)
- ✅ Agent #127 (Deployment Safety Engineer)
- ✅ Agent #128 (Voice + Visual Context Coordinator)
- ✅ Agent #131 (Vibe Coding Specialist)

**6. Current MB.MD Implementation**
- ✅ Evidence Collection System (database tables: mbmd_sessions, mbmd_evidence, mbmd_reviews)
- ✅ SessionManager (recordEvidence, requestReview, validateSessionOwnership)
- ✅ Dashboard (stats display, recent sessions)
- ✅ API Routes (9 authenticated endpoints)
- ✅ Security (authentication, session scoping, presigned URL enforcement)

---

## 🔍 SIMULTANEOUS RESEARCH PLAN

### Research Workstream A: Testing Infrastructure
**Lead Agent:** QA Agent (#79)  
**Supporting Agents:** Browser Tester Agent, Documentation Agent  
**Duration:** 2 hours

**Research Questions:**
1. **Integration Tests - What to Test?**
   - Where does `/api/mbmd/session/start` get called from? (Chat? Visual Editor? Voice?)
   - What's the complete flow: User action → API call → Database → Evidence?
   - What edge cases exist? (Invalid userId, missing session, duplicate calls)
   - What's the expected response format?

2. **Upload Scoping - Security Test Scenarios**
   - How do we verify presigned URLs ONLY work for their intended prefix?
   - What happens if someone modifies the upload URL client-side?
   - Can we inject path traversal attacks (../ sequences)?
   - What validation exists server-side?

3. **Evidence Recording - Completeness Test**
   - Does EVERY MB.MD phase record evidence?
   - Are screenshots captured for ALL UI changes?
   - Are server logs clean (no errors)?
   - Are browser console logs clean (no warnings)?

**Deliverables:**
- Test specification document (MAPPING_TESTING_SPEC.md)
- Test data requirements (fixtures, mocks, test users)
- Test environment requirements (database state, API mocks)

**Files to Inspect:**
- `server/routes/mbmdRoutes.ts` (all 9 API endpoints)
- `server/services/mbmd/SessionManager.ts` (orchestration methods)
- `server/objectStorage.ts` (upload URL generation)
- `server/services/agents/VibeGraph.ts` (evidence recording calls)
- `client/src/pages/MBMDDashboard.tsx` (frontend integration)

---

### Research Workstream B: Monitoring & Observability
**Lead Agent:** Platform Infrastructure Agent (#1)  
**Supporting Agents:** Performance Agent, Security Agent  
**Duration:** 2 hours

**Research Questions:**
1. **Object Storage Monitoring - Anomaly Detection**
   - What's a "normal" upload path? (evidence/{userId}/{sessionId}/file.png)
   - What's an "anomalous" upload path? (evidence/../../../etc/passwd)
   - How do we detect bypass attempts in real-time?
   - Where do we log upload attempts? (server logs? separate audit log?)
   - Can we set up alerts for suspicious patterns?

2. **MB.MD Compliance Metrics - What to Track?**
   - Sessions started vs sessions completed (completion rate)
   - Evidence uploaded per phase (MAPPING, BREAKDOWN, MITIGATION, DEPLOYMENT)
   - Average time per phase
   - Architect review approval rate
   - Test pass/fail rate
   - Screenshot capture success rate

3. **Grafana Cloud Integration - Log Retention**
   - What logs need long-term retention? (MB.MD sessions, evidence uploads, architect reviews)
   - How long to retain? (30 days? 90 days? 1 year?)
   - What's the cost? (per GB, per query)
   - How do we structure logs for easy querying?
   - What dashboards do we need? (compliance dashboard, session timeline, error tracking)

**Deliverables:**
- Monitoring specification (MAPPING_MONITORING_SPEC.md)
- Metrics to track (list with units and thresholds)
- Alert rules (when to notify admins)
- Log retention policy
- Grafana dashboard mockups

**Files to Inspect:**
- `docs/GRAFANA_SETUP_GUIDE.md` (existing observability setup)
- `server/services/mbmd/SessionManager.ts` (what to monitor)
- `server/objectStorage.ts` (upload security)
- `server/services/mbmd/Logger.ts` (current logging)

---

### Research Workstream C: Vibe Coding MB.MD Integration
**Lead Agent:** Agent #131 (Vibe Coding Specialist)  
**Supporting Agents:** Agent #128 (Voice+Visual Context), Architect Agent  
**Duration:** 3 hours

**Research Questions:**
1. **MAPPING Phase - What's Missing?**
   - Where does vibe coding START? (ChatInterface.tsx? VisualEditorTab.tsx?)
   - What documentation should be read BEFORE generating code?
   - What data should be inspected? (current components, routes, database schema)
   - How do we verify user intent? (selected element? typed request? voice input?)

2. **Testing Mandatory - Why Optional Now?**
   - Where is the autonomous mode check? (VibeGraph.ts line 643?)
   - What breaks if we remove the condition?
   - Do ALL vibe requests have testable outcomes?
   - What about conversational responses (clarification questions)?

3. **Architect Validation - Replace Auto-Approve**
   - What does the current stub do? (always returns approved=true?)
   - What SHOULD it check? (code quality, security, best practices)
   - What evidence is required? (screenshots, logs, test results)
   - How long does real validation take? (seconds? minutes?)
   - Should it be synchronous or async?

4. **Evidence Collection - Complete Coverage**
   - MAPPING: What evidence? (docs read, data inspected, user journey mapped)
   - BREAKDOWN: What evidence? (task plan, execution mode, integration points)
   - MITIGATION: What evidence? (code diffs, unit test results, logs)
   - DEPLOYMENT: What evidence? (screenshots, QA validation, behavioral proof)

**Deliverables:**
- Gap analysis document (VIBE_CODING_MBMD_GAPS.md)
- Integration architecture (how VibeGraph fits into MB.MD)
- Evidence schema for each phase
- Testing strategy (unit, integration, E2E)

**Files to Inspect:**
- `server/services/agents/VibeGraph.ts` (multi-agent orchestration)
- `server/services/chat/ChatMappingAgent.ts` (mapping logic)
- `server/services/visualEditor/VisualEditorContextMapper.ts` (context mapping)
- `server/services/agents/BrowserTesterAgent.ts` (testing)
- `server/services/agents/SelfHealerAgent.ts` (auto-fix)
- `docs/agents/AGENT_131_VIBE_CODING.md` (learnings)
- `docs/VIBE_CODING_MBMD_INTEGRATION_RESEARCH.md` (existing research)

---

### Research Workstream D: Mr Blue Intelligence & Context
**Lead Agent:** Intelligence Coordinator Agent (#110)  
**Supporting Agents:** Learning Agent (#80), Context Agent (#112)  
**Duration:** 2 hours

**Research Questions:**
1. **Full Platform Knowledge - What's Loaded?**
   - Does Mr Blue load replit.md on startup? (1,648 lines)
   - Does it load agent documentation? (AGENT_LEARNINGS.md)
   - Does it load MB.MD templates?
   - How is context injected into AI prompts?
   - Is there a token limit? (Claude 4.5 = 200k context window)

2. **Agent Dependency Intelligence - How Complete?**
   - Can Mr Blue answer "What agents are attached to X feature?"
   - Can it answer "What happens if I delete Agent #131?"
   - Can it execute cleanup actions automatically?
   - Is the dependency graph up-to-date?

3. **Multi-Model Orchestration - When to Use What?**
   - Chat requests: Claude, GPT-4o, or Gemini?
   - Code generation: Claude Sonnet or GPT-4o?
   - Voice: GPT-4o Realtime API only?
   - Browser automation: Anthropic Computer Use API?
   - Cost optimization: When to use cheaper models?

4. **Voice + Visual Context (Agent #128) - "Point and Ask"**
   - How does voice input identify selected elements?
   - How are screenshots captured and sent to AI?
   - What's the latency? (voice → screenshot → AI response)
   - Does it work in all tabs? (Chat, Visual Editor, Search, etc.)

5. **Model Context Protocol (MCP) - External Tool Integration**
   - What external tools are connected? (Gmail, Slack, GitHub)
   - How does JSON-RPC 2.0 work?
   - Can we add more tools? (Notion, Linear, Jira)
   - What's the authentication flow?

**Deliverables:**
- Intelligence audit (MR_BLUE_INTELLIGENCE_AUDIT.md)
- Context loading strategy
- Multi-model routing decision tree
- MCP integration status + roadmap

**Files to Inspect:**
- `server/services/modelRouter.ts` (AI model selection logic)
- `server/services/chat/UnifiedVoiceModal.tsx` (voice mode)
- `server/services/agents/Agent128_VoiceVisualContext.ts` (voice+visual coordinator)
- `docs/MrBlue/FINAL_MR_BLUE_IMPLEMENTATION.md` (capabilities)
- `docs/research/MCP_RESEARCH.md` (Model Context Protocol)
- `docs/research/AUTONOMOUS_CODING_RESEARCH.md` (200-minute runtime)

---

### Research Workstream E: Orchestration & Execution Modes
**Lead Agent:** Project Orchestrator Agent (#1)  
**Supporting Agents:** Deployment Agent (#127), Git Agent (#126)  
**Duration:** 2 hours

**Research Questions:**
1. **Execution Modes - When to Use What?**
   - FOCUSED: Single task, sequential execution
   - PARALLEL: Multiple independent tasks
   - SIMULTANEOUS: All MB.MD agents working together
   - How do we decide which mode? (based on complexity? user preference?)

2. **200-Minute Runtime - Autonomous Coding**
   - What triggers autonomous mode?
   - How does self-testing work?
   - How does self-healing work?
   - What's the success rate?
   - When does it escalate to human review?

3. **Multi-Agent Orchestration - VibeGraph Internals**
   - Manager Agent: Planning (task decomposition)
   - Editor Agent: Code generation (unified diffs)
   - Architect Agent: Validation (code review)
   - Tester Agent: Browser automation (Playwright)
   - Deployment Agent: QA validation (screenshots, logs)
   - How do they communicate? (shared state? message passing?)

4. **Git Integration (Agent #126) - Commit Strategy**
   - When does it commit? (per change? per session?)
   - How are commit messages generated? (AI or template?)
   - Pre-commit validation (linting? tests?)
   - Branch strategy (main? feature branches?)

5. **Deployment Safety (Agent #127) - Zero-Downtime**
   - Pre-flight validation (health checks?)
   - Automatic rollback (on error?)
   - Health monitoring (metrics? logs?)

**Deliverables:**
- Orchestration flow diagrams
- Execution mode decision matrix
- Autonomous coding protocol
- Git workflow specification
- Deployment safety checklist

**Files to Inspect:**
- `server/services/agents/VibeGraph.ts` (state orchestration)
- `server/services/SessionManager.ts` (session lifecycle)
- `docs/agents/AGENT_126_GIT_OPERATIONS.md` (git specialist)
- `docs/agents/AGENT_127_DEPLOYMENT_SAFETY.md` (deployment specialist)
- `docs/agents/AGENT_131_VIBE_CODING.md` (autonomous coding)

---

### Research Workstream F: Security & Access Control
**Lead Agent:** Security Agent  
**Supporting Agents:** Authentication Agent, RBAC Agent  
**Duration:** 1.5 hours

**Research Questions:**
1. **Authentication Layer - How Complete?**
   - Replit OAuth: Working?
   - JWT tokens: Expiry? Refresh?
   - Development bypass: Only in dev mode?
   - Session management: Server-side or client-side?

2. **RBAC/ABAC - Role-Based vs Attribute-Based**
   - Super admin: Full access (Visual Editor, ESA Mind Map, MB.MD Dashboard)
   - Regular user: Limited access (Chat, Voice, Search)
   - How are permissions checked? (middleware? utility functions?)
   - Can permissions be dynamic? (based on subscription tier?)

3. **MB.MD Security - Session Ownership**
   - How do we prevent user A from accessing user B's MB.MD sessions?
   - How do we prevent user A from uploading to user B's directory?
   - Are presigned URLs properly scoped?
   - Can we add rate limiting? (prevent abuse)

**Deliverables:**
- Security audit report
- Access control matrix
- Threat model (potential attacks)
- Security hardening recommendations

**Files to Inspect:**
- `server/replitAuth.ts` (Replit OAuth)
- `server/middleware/auth.ts` (JWT validation)
- `server/routes/mbmdRoutes.ts` (authentication checks)
- `server/objectStorage.ts` (upload scoping)
- `shared/schema.ts` (user roles, permissions)

---

## 🎯 CRITICAL GAPS TO RESEARCH

### Gap #1: Vibe Coding MAPPING Phase Missing
**Problem:** VibeGraph builds code WITHOUT reading documentation or verifying requirements first.

**Research Questions:**
- What documentation exists? (replit.md? component docs? API specs?)
- How do we programmatically read and parse it?
- What data should be inspected? (database schema? existing components?)
- How do we map user journey? (user types X → AI does Y → result Z)

### Gap #2: Testing Optional (Should Be Mandatory)
**Problem:** Testing only runs in autonomous mode, so most vibe requests are UNTESTED.

**Research Questions:**
- Why is testing conditional? (performance? cost? legacy decision?)
- What breaks if we make it mandatory?
- Can we speed up tests? (parallel execution? selective testing?)
- What about conversational responses? (no code to test)

### Gap #3: Architect Auto-Approves (Should Validate)
**Problem:** Verifier agent auto-approves everything without real review.

**Research Questions:**
- What SHOULD architect validate? (code quality? security? best practices?)
- How long does real validation take? (seconds? minutes?)
- Can we use AI for validation? (Claude to review code?)
- What's the approval threshold? (100% perfect? 80% good enough?)

### Gap #4: Evidence Collection Incomplete
**Problem:** Only some phases record evidence, not all.

**Research Questions:**
- MAPPING: What evidence? (docs read? data inspected?)
- BREAKDOWN: What evidence? (task plan? execution mode?)
- MITIGATION: What evidence? (code diffs? test results?)
- DEPLOYMENT: What evidence? (screenshots? QA validation?)

### Gap #5: Monitoring & Observability Basic
**Problem:** No real-time monitoring or alerting for MB.MD compliance.

**Research Questions:**
- What metrics matter? (completion rate? test pass rate? time per phase?)
- What alerts are needed? (anomalous uploads? failed tests? low compliance?)
- How do we store metrics? (Grafana? Postgres time-series?)
- What dashboards are needed? (admin overview? developer debugging?)

---

## 📊 RESEARCH DELIVERABLES (MAPPING Phase Output)

### Required Documents (All Squads Must Produce):

1. **MAPPING_TESTING_SPEC.md** (Squad A)
   - Test scenarios for all 9 MB.MD API endpoints
   - Security test cases for upload scoping
   - Evidence completeness verification tests

2. **MAPPING_MONITORING_SPEC.md** (Squad B)
   - Metrics to track (with units and thresholds)
   - Alert rules (when to notify admins)
   - Log retention policy
   - Grafana dashboard designs

3. **VIBE_CODING_MBMD_GAPS.md** (Squad C)
   - Gap analysis (what's missing vs what's needed)
   - Integration architecture (VibeGraph + MB.MD)
   - Evidence schema for each phase
   - Testing strategy (mandatory, not optional)

4. **MR_BLUE_INTELLIGENCE_AUDIT.md** (Squad D)
   - Context loading strategy (what to load, when)
   - Multi-model routing decision tree
   - Agent dependency graph (up-to-date?)
   - MCP integration status

5. **ORCHESTRATION_FLOW_DIAGRAMS.md** (Squad E)
   - Execution mode decision matrix
   - VibeGraph state machine (visual diagram)
   - Git workflow (commit strategy)
   - Deployment safety protocol

6. **SECURITY_AUDIT_REPORT.md** (Squad F)
   - Access control matrix (who can do what)
   - Threat model (potential attacks)
   - Security hardening recommendations

### Master Synthesis Document:

**MB_MD_MR_BLUE_COMPLETE_MAPPING.md**
- Consolidates all 6 squad reports
- Identifies cross-cutting concerns
- Prioritizes gaps by severity
- Recommends next steps (BREAKDOWN phase)

---

## 🚀 EXECUTION PROTOCOL

### Phase 1: SIMULTANEOUS Research (NOW - 3 hours)
- All 6 squads work in parallel
- Each squad produces 1 deliverable document
- No building, only research and documentation

### Phase 2: Consolidation (30 minutes)
- Project Orchestrator Agent (#1) synthesizes all reports
- Identifies duplicate findings
- Resolves conflicting recommendations
- Produces master document

### Phase 3: User Review (User decision)
- Present findings to user
- Get approval for BREAKDOWN phase
- Adjust priorities based on feedback

### Phase 4: BREAKDOWN (Next session - not now)
- Create detailed build plan for each gap
- Allocate agents to tasks
- Define success criteria
- Estimate timelines

---

## ✅ SUCCESS CRITERIA (MAPPING Phase)

- [ ] All 6 squad deliverables complete
- [ ] Master synthesis document produced
- [ ] Zero assumptions (all unknowns documented)
- [ ] User understands what's missing
- [ ] Clear path to BREAKDOWN phase

---

## 🚨 CONSTRAINTS

1. **DO NOT BUILD ANYTHING** - This is research only
2. **NO CODE CHANGES** - Only read files, don't modify
3. **NO ASSUMPTIONS** - If you don't know, document the question
4. **NO SKIPPING SQUADS** - All 6 must complete their research
5. **NO ARCHITECT REVIEW** - This is MAPPING, architect comes in DEPLOYMENT

---

## 📚 REFERENCE DOCUMENTATION

**Key Files to Read:**
- `replit.md` - Complete platform overview (84 lines)
- `docs/AGENT_LEARNINGS.md` - Critical learnings (1,648 lines)
- `docs/agents/AGENT_131_VIBE_CODING.md` - Vibe coding specialist (257 lines)
- `docs/MB_MD_COMPLETE_INTEGRATION_PLAN.md` - Integration roadmap (1,144 lines)
- `docs/MrBlue/FINAL_MR_BLUE_IMPLEMENTATION.md` - Mr Blue capabilities (360 lines)
- `docs/VIBE_CODING_MBMD_INTEGRATION_RESEARCH.md` - Existing research (479 lines)

**Total Context:** ~4,000 lines of documentation to synthesize

---

**READY TO BEGIN SIMULTANEOUS MAPPING PHASE?** 🚀
