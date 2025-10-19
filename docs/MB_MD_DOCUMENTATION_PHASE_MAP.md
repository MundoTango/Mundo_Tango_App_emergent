# MB.MD Documentation Phase Map
## Complete Guide: Which Docs to Read During Each MB.MD Phase

**Created:** October 19, 2025  
**Updated:** October 19, 2025 (Added 120 Mr Blue docs across all phases)  
**Purpose:** Associate all 340 documentation files to MB.MD phases (Mapping → Breakdown → Mitigation → Deployment)  
**Audience:** All agents, future development sessions

---

## 🎯 MB.MD Methodology Quick Reference

**MB.MD** = **M**apping → **B**reakdown → **M**itigation → **D**eployment

Each phase requires specific documentation to be read:
- **MAPPING**: Understand the territory before starting
- **BREAKDOWN**: Learn how to decompose work into tasks
- **MITIGATION**: Prevent known failures and issues
- **DEPLOYMENT**: Verify production readiness

---

## 📊 PHASE 1: MAPPING (Pre-Work Understanding)

### Purpose
**What to read BEFORE starting work** to understand system architecture, dependencies, and context.

### Core Framework Documents

**40x20s Framework** - Platform-wide quality system
- **File:** `docs/40x20s-framework.md` (251 lines)
- **Learn:** 40 expert domains, 20 development phases, 800 quality checkpoints
- **When:** Before ANY significant feature work
- **Who needs it:** All agents building new features or modifying architecture

**ESA Quality Gates** - 4-gate pre-work protocol
- **File:** `docs/ESA_QUALITY_GATES.md` (272 lines)
- **Learn:** Specification validation, discovery/context, API contracts, testing gates
- **When:** Before starting EVERY task (mandatory)
- **Who needs it:** ALL agents without exception

**Documentation Map** - Meta-map of all documentation
- **File:** `docs/DOCUMENTATION_MAP.md` (500+ lines)
- **Learn:** Where to find docs for each system component
- **When:** When you don't know which docs to read
- **Who needs it:** All agents as starting point

### Architecture Mapping Documents

**Agent Layer Documentation** (61 files in `docs/agents/layers/`)
- **Foundation Layers (1-10):** Database, API, Server, Auth, RBAC, Validation, State, Client, UI, Components
- **Core Layers (11-20):** Real-time, Data Processing, Files, Caching, Search, Notifications, Payments, Analytics, Content, Workflows
- **Business Layers (21-30):** Users, Groups, Events, Social, Messaging, Recommendations, Gamification, Marketplace, Booking, Support
- **Intelligence Layers (31-46):** AI Infrastructure, Prompts, Context, Response, Agents, Memory, Learning, Prediction, Decisions, NLP, Vision, Voice, Sentiment, Knowledge Graph, Reasoning, Integration
- **Platform Layers (47-56):** Mobile, Performance, Security, DevOps, Testing, Documentation, i18n, Accessibility, SEO, Compliance
- **Extended Layers (57-61):** Automation, 3rd-party, Open Source, GitHub, Supabase

**When to read:** Before modifying any system in that layer  
**Who needs it:** Agents working on those specific domains

### Page-Specific Mapping Documents

**The Pages Documentation** (`docs/The Pages/`)
- **File:** `thepages.md` - Registry of 88+ Page Agents (P1-P88)
- **Page Agent Specs:** `P1_login_page.md`, `P2_register_page.md`, `P10_home_feed.md`, etc.
- **H2AC Pattern:** How to build pages using H2AC methodology
- **When to read:** Before building or modifying any page component
- **Who needs it:** Page agents (P1-P88), UI agents, frontend developers

### API Contract Mapping

**API Documentation** (`docs/api/`)
- `friendship-housing-api.md` - Friendship/housing endpoints
- `payment-endpoints.yaml` - Payment processing contracts
- `PROJECT_TRACKER_API.md` - Project tracking endpoints
- **When to read:** Before building features that call these APIs
- **Who needs it:** Backend agents, integration agents, API consumers

### Agent Hierarchy Mapping

**Agent System Documentation** (`docs/agents/`)
- **CEO Level:** `ceo/agent-0-esa-orchestrator.md` - Master orchestrator
- **Chief Level:** 6 division chiefs covering Foundation, Core, Business, Intelligence, Platform, Extended
- **Domain Level:** 9 domain agents coordinating specialized areas
- **Expert Level:** 7 expert agents (AI Research, UX Design, Data Viz, Content/Media, Code Quality, DevEx, i18n)
- **Life CEO Agents:** 16 life management agents (Finance, Health, Learning, etc.)

**When to read:** Before coordinating work across agents or understanding agent responsibilities  
**Who needs it:** Agent coordinators, orchestrators, meta-agents

### Mr Blue AI System Architecture Mapping

**Mr Blue Implementation Specs** (MUST READ before Mr Blue work)
- `docs/MrBlue/FINAL_MR_BLUE_IMPLEMENTATION.md` (360 lines) - **PRIMARY SPEC** for 927+ agent system
- `docs/MrBlue/mb.md` - Comprehensive Mr Blue master document
- `docs/MrBlue/mb-master-plan-v4.md` (404 lines) - Latest master plan
- `docs/MrBlue/AGENT_HIERARCHY_COMPLETE.md` - Complete agent hierarchy
- `docs/MrBlue/IMPLEMENTATION_SUMMARY.md` - Implementation overview
- **Learn:** Mr Blue's role as supreme orchestrator, 927+ agent dependencies, deletion impact
- **When:** BEFORE modifying Mr Blue, Visual Editor, or agent systems
- **Who needs it:** Mr Blue agents, orchestrators, AI system developers

**Mr Blue Intelligence Architecture**
- `docs/MrBlue/TRACK_8_MR_BLUE_INTELLIGENCE_ARCHITECTURE.md` - Intelligence system design
- `docs/MrBlue/MR_BLUE_INTELLIGENCE_UPDATE.md` - Latest intelligence updates
- `docs/MrBlue/TRACK_9_VISUAL_TOOL_ARCHITECTURE.md` - Visual Editor architecture
- `docs/MrBlue/TRACK_10_ESA_MD_INTEGRATION_COMPLETE.md` - ESA integration
- **Learn:** How Mr Blue's AI intelligence works, context management, multi-model routing
- **When:** Building AI features, context-aware systems
- **Who needs it:** AI agents, intelligence system developers

**Mr Blue Agent Sources** (Intelligence Agents #110-116)
- `docs/MrBlue/agent-sources/AGENT_110_CODE_INTELLIGENCE_SOURCES.md` - Code intelligence
- `docs/MrBlue/agent-sources/AGENT_111_VISUAL_PREVIEW_SOURCES.md` - Visual preview
- `docs/MrBlue/agent-sources/AGENT_112_DESIGN_TO_CODE_SOURCES.md` - Design to code
- `docs/MrBlue/agent-sources/AGENT_113_CROSS_PHASE_SOURCES.md` - Cross-phase coordination
- `docs/MrBlue/agent-sources/AGENT_114_PREDICTIVE_PLANNER_SOURCES.md` - Predictive planning
- `docs/MrBlue/agent-sources/AGENT_115_DYNAMIC_PRIORITY_SOURCES.md` - Dynamic priorities
- `docs/MrBlue/agent-sources/AGENT_116_DEPENDENCY_MAPPER_SOURCES.md` - Dependency mapping
- **Learn:** Advanced intelligence agent patterns and data sources
- **When:** Building Intelligence Agents (#110-116)
- **Who needs it:** Intelligence agent developers

**Mr Blue Research & Context**
- `docs/MrBlue/COMPREHENSIVE_EXPERT_RESEARCH_PHASE.md` - Expert research methodology
- `docs/MrBlue/FACEBOOK_DEEP_RESEARCH_REPORT.md` - Facebook/Meta research insights
- `docs/MrBlue/FACEBOOK_IMPLEMENTATION_ROADMAP.md` - Implementation from research
- `docs/MrBlue/RESEARCH_PHASE_COMPLETE_SUMMARY.md` - Research phase summary
- **Learn:** How Mr Blue was researched and designed
- **When:** Understanding Mr Blue's design decisions
- **Who needs it:** Architects, researchers, strategic planners

### Frontend Build Configuration Verification ⚠️ CRITICAL

**Vite Configuration for Replit** - MANDATORY for all UI work
- **File:** `vite.config.ts`
- **Requirements (BOTH are critical):**
  1. **Port:** MUST be 5000 (NOT 5173 or any other port)
  2. **allowedHosts:** MUST include `['.replit.dev', '.replit.app']` OR set to `true`
- **Correct config:**
  ```typescript
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    allowedHosts: ['.replit.dev', '.replit.app'],
  }
  ```
- **Why critical:** 
  - Port mismatch → UI invisible in iframe (backend works, frontend unreachable)
  - Missing allowedHosts → "Blocked request. This host is not allowed" error (Vite DNS rebinding protection)
- **Automated check:** `scripts/agent-verification.sh` checks both automatically
- **When to verify:** BEFORE starting ANY UI/frontend work (MAPPING phase)
- **Who needs it:** ALL agents doing UI work, Visual Editor users, frontend developers
- **Related docs:** Web dev rules in system prompt, `docs/vite-config-template.md`

**Failure patterns (Oct 19, 2025):**
- **Incident 1:** Port was 5173 instead of 5000 → UI inaccessible to user
- **Incident 2:** Port fixed but missing allowedHosts → Vite blocked Replit's dynamic hostname
- LSP errors in 2 files prevented compilation  
- Documentation existed but wasn't in MAPPING phase checklist
- **Lesson:** Configuration verification MUST be in MAPPING, not just general docs
- **Lesson 2:** Two-part configs (port + allowedHosts) must BOTH be verified - one without the other fails

---

## 🔨 PHASE 2: BREAKDOWN (Work Decomposition Methods)

### Purpose
**How to decompose work into executable tasks** following proven methodologies and patterns.

### Parallel Execution Frameworks

**MB.MD Master Plans**
- **File:** `docs/MrBlue/mb-master-plan-v4.md` (404 lines) - Latest version
- **File:** `docs/MrBlue/mb-master-plan-v3.md` - Previous iteration
- **Learn:** How to run 12 tracks in parallel, critical path analysis, dependency mapping
- **When:** Planning complex multi-feature builds
- **Who needs it:** Project planners, orchestrators, parallel execution specialists

**Parallel Build Execution**
- **File:** `docs/MrBlue/PARALLEL_BUILD_EXECUTION_PLAN.md`
- **File:** `docs/MrBlue/PARALLEL_EXECUTION_MASTER_PLAN.md`
- **File:** `docs/MrBlue/MB_MD_PARALLEL_COMPLETE.md`
- **Learn:** Track-based parallel execution, avoiding bottlenecks, resource allocation
- **When:** Building multiple features simultaneously
- **Who needs it:** Build coordinators, DevOps agents

### UI/UX Decomposition Patterns

**H2AC Pattern** (Human-to-Agent-to-Code)
- **File:** `docs/The Pages/H2AC_EXECUTIVE_SUMMARY.md` (390 lines)
- **File:** `docs/The Pages/H2AC_BUILD_SUMMARY.md`
- **File:** `docs/The Pages/H2AC_PHASE2_COMPLETE.md`
- **File:** `docs/The Pages/h2ac-pattern.md`
- **Learn:** How to build UI pages systematically (Registration → Chat → Automation → 3D)
- **When:** Building frontend pages or components
- **Who needs it:** Page agents, UI developers, UX implementers

### Algorithm Decomposition

**Algorithm Agent Documentation**
- **File:** `docs/MrBlue/ALGORITHM_AGENTS_COMPLETE.md`
- **File:** `docs/MrBlue/ALGORITHM_AGENTS_MBMD_PLAN.md`
- **File:** `docs/MrBlue/AGENT_HIERARCHY_COMPLETE.md`
- **Learn:** How to break down AI/algorithm work into testable units
- **When:** Building AI features, recommendation engines, data processing
- **Who needs it:** Algorithm agents (A1-A30), AI developers

### Phase-Based Decomposition

**Phase Execution Reports**
- `docs/MrBlue/PHASE9-COMPLETION-REPORT.md` through `PHASE11-COMPLETION-REPORT.md`
- `docs/MrBlue/PHASE_9_10_COMPLETE_SUMMARY.md`
- `docs/MrBlue/MB_PHASE_9_FINAL_SUMMARY.md`
- `docs/MrBlue/mb-phase1-COMPLETE.md` through `mb-phase9-complete-implementation.md`
- **Learn:** How previous phases decomposed their work successfully
- **When:** Planning new phases or learning from past executions
- **Who needs it:** Phase planners, learning agents, retrospective reviewers

### Mr Blue AI System Decomposition

**Build Execution Plans** (How to execute Mr Blue work in parallel)
- `docs/MrBlue/PARALLEL_BUILD_EXECUTION_PLAN.md` - Parallel execution framework
- `docs/MrBlue/PARALLEL_EXECUTION_MASTER_PLAN.md` - Master parallel plan
- `docs/MrBlue/MBMD_FULL_EXECUTION_PLAN.md` - Full MB.MD execution
- `docs/MrBlue/3_LAYER_DEPLOYMENT_PLAN.md` - 3-layer deployment strategy
- `docs/MrBlue/EXECUTE_NOW.md` - Immediate execution guide
- **Learn:** How to run multiple Mr Blue tracks in parallel
- **When:** Building Mr Blue features or Visual Editor
- **Who needs it:** Mr Blue agents, parallel execution specialists

**Mr Blue Phase Reports** (Learn from past decompositions)
- `docs/MrBlue/PHASE_9_10_COMPLETE_SUMMARY.md` - Phases 9-10 completion
- `docs/MrBlue/mb-phase1-complete.md` through `mb-phase9-complete.md` - Individual phase reports
- `docs/MrBlue/mb-parallel-phase1-2-complete.md` - Parallel execution summary
- `docs/MrBlue/mb-parallel-tracks-7-12-complete.md` - Tracks 7-12 complete
- **Learn:** Historical decomposition patterns that worked
- **When:** Planning new Mr Blue phases
- **Who needs it:** Mr Blue project managers, phase planners

---

## 🛡️ PHASE 3: MITIGATION (Failure Prevention)

### Purpose
**What to prevent, avoid, and check** based on historical failures and known issues.

### Critical Prevention Protocols

**Prevention Guide** - Pre-work checklist system
- **File:** `docs/PREVENTION_GUIDE.md` (326 lines)
- **Learn:** Build system health checks, package verification, server testing, early warning signs
- **Mandatory checks:** 
  - Build tools exist (vite, tsx, esbuild)
  - Packages installed correctly
  - Server can start without errors
- **When:** BEFORE starting ANY work (mandatory pre-flight check)
- **Who needs it:** ALL agents without exception

**Critical Failure Analysis** - Historical incident reports
- **File:** `docs/CRITICAL_FAILURE_ANALYSIS.md` (238 lines)
- **Learn:** NPM corruption incident, cascading failures, failed recovery attempts
- **Root causes:** Package manager corruption, missing dependencies, build system failure
- **When:** If you see ANY module errors or build failures
- **Who needs it:** DevOps agents, infrastructure agents, emergency responders

### Known Issues Database

**NPM Corruption Incident**
- **File:** `docs/NPM_CORRUPTION_INCIDENT_REPORT.md`
- **Learn:** What caused total environment failure, how to detect early, emergency response protocol
- **When:** Seeing ENOTEMPTY errors, missing module errors, build failures
- **Who needs it:** All agents (awareness), DevOps (action)

**Known Issue Documentation**
- **File:** `docs/MrBlue/KNOWN_ISSUE_ROUTE_ERROR.md`
- **Learn:** Specific routing bugs and their solutions
- **When:** Working on routing, navigation, or URL handling
- **Who needs it:** Frontend agents, routing specialists

### Session Learning Logs

**Agent Session Log** - Knowledge transfer between sessions
- **File:** `docs/AGENT_SESSION_LOG.md`
- **Learn:** What previous agents learned, failures encountered, solutions found
- **When:** At START of every session (read what last agent learned)
- **When:** At END of every session (log what you learned for next agent)
- **Who needs it:** ALL agents for continuous improvement

**Agent Communication Log**
- **File:** `docs/MB_MD_AGENT_COMMUNICATION_LOG.md`
- **File:** `docs/AGENT_COMMUNICATION_VISUAL_SUMMARY.md`
- **Learn:** How agents coordinate, pass context, avoid duplicate work
- **When:** Multi-agent coordination tasks
- **Who needs it:** Orchestrators, coordinators, parallel execution teams

### Bug Fix Documentation

**Bug Fix Reports**
- **File:** `docs/MB_MD_BUG_FIX_COMPLETE.md`
- **File:** `docs/MB_MD_BUG_FIX_COMPLETE_V2.md`
- **File:** `docs/MrBlue/mb-routing-fix-summary.md`
- **File:** `docs/MrBlue/mb-routing-fix.md`
- **File:** `docs/MrBlue/dark-mode-fixes.md`
- **File:** `docs/MrBlue/translation-fixes.md`
- **Learn:** Common bug patterns and their solutions
- **When:** Encountering similar issues
- **Who needs it:** Debugging agents, QA agents

### Mr Blue Failure Prevention & Known Issues

**Mr Blue Known Issues**
- `docs/MrBlue/KNOWN_ISSUE_ROUTE_ERROR.md` - Mr Blue routing bugs and solutions
- `docs/MrBlue/DB_FIX_COMPLETE.md` - Database fix completed
- `docs/MrBlue/DB_PERFORMANCE_FIX.md` - Performance optimization fixes
- `docs/MrBlue/100_PERCENT_FIX_PLAN.md` - Comprehensive fix plan
- **Learn:** Known Mr Blue issues and how to avoid them
- **When:** Working on Mr Blue or Visual Editor
- **Who needs it:** Mr Blue agents, debugging specialists

**Mr Blue Onboarding Protocol** (Prevent onboarding failures)
- `docs/MrBlue/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md` (487 lines) - **CRITICAL**
- **Learn:** 15-step agent onboarding framework, continuous improvement loop
- **When:** Before ANY agent starts work (mandatory)
- **Who needs it:** ALL agents without exception
- **Integration:** Referenced in AGENT_SESSION_LOG.md for knowledge transfer

---

## ✅ PHASE 4: DEPLOYMENT (Production Readiness Validation)

### Purpose
**How to verify production readiness** using quality gates, audits, and certification protocols.

### Quality Gate Validation

**ESA Quality Gates** (Gates 3-4: Implementation & Testing)
- **File:** `docs/ESA_QUALITY_GATES.md` (see section on Gates 3-4)
- **Gate 3 Checks:** Code quality, test coverage, edge cases, error handling
- **Gate 4 Checks:** Integration testing, performance validation, security review
- **When:** Before claiming ANY work is "done"
- **Who needs it:** ALL agents completing tasks

### Audit Reports (Production Quality Standards)

**Platform-Wide Audits** (`docs/audit-reports/`)
- `SYSTEMATIC-PLATFORM-AUDIT-2025-10-10.md` - Complete platform scan
- `PLATFORM_AUDIT_REPORT_2025-10-09.md` - Quality baseline
- `VISUAL_QUALITY_SCORECARD-2025-10-13.md` - UI/UX standards
- **Learn:** What "production ready" actually means
- **When:** Preparing features for user access
- **Who needs it:** QA agents, deployment validators

**Component-Specific Audits**
- `MEMORIES-COMPLETE-AUDIT-2025-10-10.md` - Memories/posts feature
- `LIFECEO-ENHANCED-AUDIT-2025-10-10.md` - Life CEO AI system
- `GROUPS-PAGE-AUDIT-2025-10-10.md` - Groups/communities
- `HOME-PAGE-AUDIT-2025-10-10.md` - Homepage/feed
- `PROFILE-PAGE-AUDIT-2025-10-10.md` - User profiles
- `AUTH-PAGES-AUDIT-2025-10-10.md` - Authentication flow
- `HOUSING-MARKETPLACE-AUDIT-2025-10-10.md` - Housing features
- **Learn:** Component-specific quality standards
- **When:** Building or modifying those specific components
- **Who needs it:** Component owners, feature developers

**ESA Agent Integration Audits**
- `FULL-ESA-61x21-AUDIT-GROUP-DETAIL-2025-10-10.md` - Complete agent audit
- `ESA_61x21_GROUPS_AUDIT_REPORT.md` - Agent group validation
- **Learn:** How all 61 agents integrate and coordinate
- **When:** Modifying agent systems or coordination logic
- **Who needs it:** Agent architects, orchestration developers

### Testing Protocols

**Testing Documentation**
- **File:** `docs/ESA_AGENT_TESTING_PROTOCOL.md`
- **File:** `docs/TESTING_QUICK_REFERENCE.md`
- **File:** `docs/STANDARD_UI_TESTING_JOURNEY.md`
- **File:** `docs/VISUAL_REGRESSION_TESTING.md`
- **Learn:** How to test properly before deployment
- **When:** Before claiming work complete
- **Who needs it:** QA agents, testing specialists

**Mr Blue Visual Editor Testing**
- `docs/MrBlue/visual-editor-testing.md` - Visual Editor test protocol
- `docs/MrBlue/phase7-integration-tests.md` - Phase 7 integration tests
- **Learn:** How to test Mr Blue and Visual Editor features
- **When:** Testing Mr Blue components
- **Who needs it:** Mr Blue QA, Visual Editor testers

### Mr Blue Deployment & Completion Reports

**Mr Blue Audit & Quality Reports**
- `docs/MrBlue/COMPREHENSIVE_CODEBASE_AUDIT.md` - Complete codebase audit
- `docs/MrBlue/COMPREHENSIVE_PLATFORM_AUDIT_COMPLETE.md` - Platform audit
- `docs/MrBlue/DEPLOYMENT_AUDIT_PLAN.md` - Deployment audit checklist
- `docs/MrBlue/PARALLEL_AUDIT_RESULTS.md` - Parallel execution audit
- `docs/MrBlue/TRACK_7_QUALITY_STANDARDS_AUDIT.md` - Quality standards
- **Learn:** Mr Blue production quality standards
- **When:** Verifying Mr Blue is deployment-ready
- **Who needs it:** Mr Blue deployment validators, QA leads

**Mr Blue Completion Reports** (Verify 100% complete)
- `docs/MrBlue/100_PERCENT_COMPLETE.md` - 100% completion criteria
- `docs/MrBlue/BUILD_COMPLETE_SUMMARY.md` - Build completion summary
- `docs/MrBlue/FINAL_PARALLEL_SUMMARY.md` - Parallel execution complete
- `docs/MrBlue/FINAL_HEALTH_REPORT.md` - Final health check
- `docs/MrBlue/FINAL-STATUS.md` - Final status report
- `docs/MrBlue/EXECUTION_STATUS.md` - Current execution status
- `docs/MrBlue/completion-report.md` - Completion report
- **Learn:** What "100% complete" means for Mr Blue
- **When:** Verifying Mr Blue deployment readiness
- **Who needs it:** Deployment managers, stakeholders

**Mr Blue Execution Summaries**
- `docs/MrBlue/PARALLEL_EXECUTION_COMPLETE.md` - Parallel execution done
- `docs/MrBlue/parallel-execution-report.md` - Execution report
- `docs/MrBlue/mb-parallel-execution-complete.md` - MB.MD parallel complete
- `docs/MrBlue/mb-execution-summary-oct13.md` - October execution summary
- **Learn:** How Mr Blue was successfully built
- **When:** Learning from successful deployments
- **Who needs it:** Process improvement teams, retrospectives
- **Who needs it:** Testing agents, QA validators, all developers

### Launch Checklists

**Deployment Readiness**
- **File:** `docs/LAUNCH_CHECKLIST.md`
- **File:** `docs/DEPLOYMENT_GUIDE.md`
- **File:** `docs/FIRST_CUSTOMER_READY.md`
- **Learn:** What must be true before users can access features
- **When:** Final deployment preparation
- **Who needs it:** Deployment agents, release managers

**Completion Validation**
- **File:** `docs/MrBlue/100_PERCENT_COMPLETE.md`
- **File:** `docs/MrBlue/BUILD_COMPLETE_SUMMARY.md`
- **File:** `docs/MrBlue/IMPLEMENTATION_SUMMARY.md`
- **Learn:** How to verify 100% completion
- **When:** Claiming phase/feature complete
- **Who needs it:** Project completers, validation agents

---

## 🎯 AGENT-TYPE SPECIFIC ROUTING

### Layer Agents (ESA Layers 1-61)

**Required Reading for ANY Layer Agent Work:**
1. **MAPPING:** Their specific layer doc + all dependent layers
2. **BREAKDOWN:** 40x20s framework for their domain
3. **MITIGATION:** Prevention guide + session logs
4. **DEPLOYMENT:** Quality gates + relevant audit reports

**Example: Layer 17 (Payment Processing) Agent**
```
MAPPING: Read first
├── layer-17-payment-processing.md (Core responsibility)
├── layer-1-database-architecture.md (Dependency)
├── layer-2-api-structure.md (Dependency)
├── layer-4-authentication-system.md (Dependency)
└── payment-endpoints.yaml (API contracts)

BREAKDOWN: Decompose using
├── 40x20s-framework.md (Domain 17 section)
└── ESA_QUALITY_GATES.md (Gate 2: Discovery)

MITIGATION: Prevent issues
├── PREVENTION_GUIDE.md (Pre-work checks)
├── AGENT_SESSION_LOG.md (Past learnings)
└── CRITICAL_FAILURE_ANALYSIS.md (If errors occur)

DEPLOYMENT: Validate readiness
├── ESA_QUALITY_GATES.md (Gates 3-4)
├── LAUNCH_CHECKLIST.md
└── Payment-related audit reports
```

### Page Agents (P1-P88)

**Required Reading for ANY Page Agent Work:**
1. **MAPPING:** Their page agent doc + H2AC pattern + component library
2. **BREAKDOWN:** H2AC methodology for UI decomposition
3. **MITIGATION:** Visual quality standards + known UI issues
4. **DEPLOYMENT:** UI testing protocol + visual regression tests

**Example: P1 (Login Page) Agent**
```
MAPPING: Read first
├── P1_login_page.md (Page specification)
├── H2AC_EXECUTIVE_SUMMARY.md (UI pattern)
├── layer-9-ui-framework.md (Component library)
├── layer-4-authentication-system.md (Auth logic)
└── AUTH-PAGES-AUDIT-2025-10-10.md (Quality standards)

BREAKDOWN: Decompose using
├── H2AC_BUILD_SUMMARY.md (Pattern implementation)
└── h2ac-pattern.md (Step-by-step guide)

MITIGATION: Prevent issues
├── PREVENTION_GUIDE.md (Build system checks)
├── dark-mode-fixes.md (Common UI issues)
└── translation-fixes.md (i18n pitfalls)

DEPLOYMENT: Validate readiness
├── VISUAL_QUALITY_SCORECARD-2025-10-13.md
├── STANDARD_UI_TESTING_JOURNEY.md
└── AUTH-PAGES-AUDIT-2025-10-10.md
```

### Algorithm Agents (A1-A30)

**Required Reading for ANY Algorithm Agent Work:**
1. **MAPPING:** Algorithm agent doc + AI infrastructure layers (31-46)
2. **BREAKDOWN:** Algorithm decomposition methodology
3. **MITIGATION:** Performance benchmarks + known algorithm issues
4. **DEPLOYMENT:** Performance testing + accuracy validation

**Example: Recommendation Algorithm Agent**
```
MAPPING: Read first
├── ALGORITHM_AGENTS_COMPLETE.md
├── layer-31-core-ai-infrastructure.md
├── layer-26-recommendation-engine.md
└── layer-38-prediction-engine.md

BREAKDOWN: Decompose using
├── ALGORITHM_AGENTS_MBMD_PLAN.md
└── 40x20s-framework.md (AI domain section)

MITIGATION: Prevent issues
├── performance-analysis-40x20s.md
├── PHASE_3_PERFORMANCE_RESULTS_ANALYSIS.md
└── AGENT_SESSION_LOG.md

DEPLOYMENT: Validate readiness
├── PHASE_3_LOAD_TEST_ANALYSIS_40X20S.md
├── PHASE_4_INTELLIGENT_OPTIMIZATION_PLAN.md
└── ESA_QUALITY_GATES.md (Performance testing)
```

### Mr Blue Core Agents

**Required Reading for Mr Blue System Work:**
1. **MAPPING:** All MrBlue/ docs (120 files) + ESA training
2. **BREAKDOWN:** Mr Blue master plans + parallel execution guides
3. **MITIGATION:** Mr Blue bug fixes + known issues
4. **DEPLOYMENT:** Mr Blue health reports + completion validation

**Example: Mr Blue Chat Agent**
```
MAPPING: Read first
├── MR_BLUE_INTELLIGENCE_UPDATE.md
├── COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md
├── mb-esa-training.md
├── layer-31-core-ai-infrastructure.md
└── layer-32-prompt-engineering.md

BREAKDOWN: Decompose using
├── mb-master-plan-v4.md
├── PARALLEL_BUILD_EXECUTION_PLAN.md
└── MB_MD_DUAL_TRACK_EXECUTION.md

MITIGATION: Prevent issues
├── MR_BLUE_CONTEXT_FIX.md
├── KNOWN_ISSUE_ROUTE_ERROR.md
└── AGENT_SESSION_LOG.md

DEPLOYMENT: Validate readiness
├── FINAL_MR_BLUE_IMPLEMENTATION.md
├── FINAL_HEALTH_REPORT.md
└── 100_PERCENT_COMPLETE.md
```

---

## 📋 TASK-TYPE SPECIFIC ROUTING

### Payment Feature Development

**Task:** "Build Stripe subscription payment flow"

```
MAPPING:
├── layer-17-payment-processing.md
├── payment-endpoints.yaml
├── ESA_GLOBAL_PAYMENT_PLATFORM_ANALYSIS.md
├── PAYMENT_INTEGRATION_GUIDE.md
└── layer-28-marketplace.md (if relevant)

BREAKDOWN:
├── 40x20s-framework.md (Domain 17)
└── ESA_QUALITY_GATES.md (Gate 2.5: API contracts)

MITIGATION:
├── PREVENTION_GUIDE.md
├── AGENT_SESSION_LOG.md (check past payment work)
└── Payment-related bug fixes

DEPLOYMENT:
├── Payment audit reports
├── LAUNCH_CHECKLIST.md (payment section)
└── Integration testing protocol
```

### UI Page Creation

**Task:** "Create new Events Calendar page"

```
MAPPING:
├── thepages.md (find next available P-number)
├── H2AC_EXECUTIVE_SUMMARY.md
├── layer-23-event-management.md
├── EVENTS-ROUTES audit report
└── Component library docs

BREAKDOWN:
├── H2AC_BUILD_SUMMARY.md
├── h2ac-pattern.md
└── Page decomposition template

MITIGATION:
├── VISUAL_QUALITY_SCORECARD-2025-10-13.md
├── dark-mode-fixes.md
├── translation-fixes.md
└── Accessibility standards

DEPLOYMENT:
├── STANDARD_UI_TESTING_JOURNEY.md
├── VISUAL_REGRESSION_TESTING.md
└── Events page audit checklist
```

### API Endpoint Creation

**Task:** "Create new /api/messages endpoint"

```
MAPPING:
├── layer-2-api-structure.md
├── layer-25-messaging-system.md
├── API_REFERENCE.md
└── Existing messaging endpoints

BREAKDOWN:
├── ESA_QUALITY_GATES.md (Gate 2.5: API validation)
├── 40x20s-framework.md (Backend domain)
└── Route structure patterns

MITIGATION:
├── PREVENTION_GUIDE.md (server test)
├── mb-routing-fix-summary.md
├── Known API issues
└── AGENT_SESSION_LOG.md

DEPLOYMENT:
├── API testing protocol
├── Integration tests
├── API audit report
└── LAUNCH_CHECKLIST.md
```

### Agent Coordination

**Task:** "Coordinate work between 5 agents on feature X"

```
MAPPING:
├── AGENT_HIERARCHY_COMPLETE.md
├── Agent-specific docs for all 5 agents
├── AGENT_COMMUNICATION_VISUAL_SUMMARY.md
└── Domain coordination docs

BREAKDOWN:
├── PARALLEL_BUILD_EXECUTION_PLAN.md
├── MB_MD_DUAL_TRACK_EXECUTION.md
├── mb-master-plan-v4.md
└── Dependency mapping

MITIGATION:
├── MB_MD_AGENT_COMMUNICATION_LOG.md
├── AGENT_SESSION_LOG.md
├── Agent coordination failures (if any)
└── Conflict resolution protocols

DEPLOYMENT:
├── FULL-ESA-61x21-AUDIT-GROUP-DETAIL-2025-10-10.md
├── Integration validation
├── Cross-agent testing
└── Coordination success metrics
```

---

## 🚀 ENFORCEMENT INTEGRATION

### Integration with agent-verification.sh

The `scripts/agent-verification.sh` script should be updated to:

1. **Detect MB.MD Phase** from task description
2. **Require phase-specific docs** to be acknowledged
3. **Block work** if mandatory docs not read

Example enforcement:
```bash
# Detect phase from task
if [[ $TASK == *"understand"* || $TASK == *"analyze"* ]]; then
  PHASE="MAPPING"
  REQUIRED_DOCS="ESA_QUALITY_GATES.md DOCUMENTATION_MAP.md"
fi

if [[ $TASK == *"build"* || $TASK == *"implement"* ]]; then
  PHASE="BREAKDOWN"
  REQUIRED_DOCS="40x20s-framework.md or H2AC pattern docs"
fi

# Verify docs read
for DOC in $REQUIRED_DOCS; do
  echo "Have you read $DOC for this $PHASE phase work? (y/n)"
  # In automation: check session log for doc reference
done
```

### Integration with PREVENTION_GUIDE.md

Update `docs/PREVENTION_GUIDE.md` to include MB.MD phase checklist:

```markdown
## MB.MD Phase Checklist

Before starting work, identify your MB.MD phase:

### ☐ MAPPING Phase
- [ ] Read ESA_QUALITY_GATES.md (Gate 1-2)
- [ ] Read DOCUMENTATION_MAP.md to find relevant docs
- [ ] Read layer/page/algorithm docs for your component
- [ ] Check API contracts if relevant

### ☐ BREAKDOWN Phase
- [ ] Choose methodology: 40x20s, H2AC, or Algorithm decomposition
- [ ] Read methodology doc fully
- [ ] Create task list with clear dependencies
- [ ] Identify parallel execution opportunities

### ☐ MITIGATION Phase
- [ ] Run PREVENTION_GUIDE.md pre-work checks
- [ ] Read AGENT_SESSION_LOG.md for past learnings
- [ ] Check CRITICAL_FAILURE_ANALYSIS.md if errors occur
- [ ] Review component-specific bug fixes

### ☐ DEPLOYMENT Phase
- [ ] Run ESA_QUALITY_GATES.md Gate 3-4 checks
- [ ] Read relevant audit reports for quality standards
- [ ] Complete testing protocol
- [ ] Verify LAUNCH_CHECKLIST.md items
```

---

## 📈 SUCCESS METRICS

This documentation phase map is successful when:

✅ **Agents know WHAT to read** - No more "where do I find info about X?"  
✅ **Agents know WHEN to read** - Clear phase-based routing  
✅ **Agents know WHY to read** - Understand purpose of each doc  
✅ **Work quality improves** - Fewer failures from not reading docs  
✅ **Knowledge transfers** - Session logs prevent repeating mistakes  
✅ **Faster onboarding** - New agents can navigate 335+ docs efficiently

---

## 🔄 MAINTENANCE

**This document should be updated when:**
- New documentation files created (add to appropriate phase section)
- Agent types added (create new routing section)
- New methodologies introduced (add to BREAKDOWN section)
- Critical failures occur (add to MITIGATION section)
- Audit standards change (update DEPLOYMENT section)

**Update frequency:** After every major build phase or methodology change

**Owner:** Documentation Agent (Layer 52) + Agent Session Log maintainers

---

## 📚 RELATED DOCUMENTS

- `docs/DOCUMENTATION_MAP.md` - File-to-component mapping (complementary to this phase map)
- `docs/PREVENTION_GUIDE.md` - Pre-work verification protocol
- `docs/AGENT_SESSION_LOG.md` - Knowledge transfer between sessions
- `docs/ESA_QUALITY_GATES.md` - 4-gate quality protocol
- `scripts/agent-verification.sh` - Automated enforcement tool
- `scripts/verify-completion.sh` - Post-work validation tool

---

*This map ensures agents learn DURING execution (not after failure) by reading the right docs at the right time during the MB.MD cycle.*
