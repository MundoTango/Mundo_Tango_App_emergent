# 🗺️ DOCUMENTATION MAP - Complete System Reference
**Last Updated:** October 19, 2025  
**Total Documentation Files:** 335  
**Purpose:** Associate all documentation with corresponding system components for agent guidance

---

## 🔗 MB.MD PHASE-BASED ROUTING

**NEW:** For MB.MD methodology (Mapping → Breakdown → Mitigation → Deployment) phase-based document routing, see:

**📘 [`docs/MB_MD_DOCUMENTATION_PHASE_MAP.md`](./MB_MD_DOCUMENTATION_PHASE_MAP.md)** (650+ lines)
- **MAPPING Phase:** What to read BEFORE starting work (architecture, dependencies, context)
- **BREAKDOWN Phase:** How to decompose work (40x20s, H2AC, Algorithm patterns)
- **MITIGATION Phase:** What to prevent (failure patterns, known issues, session learnings)
- **DEPLOYMENT Phase:** How to validate production readiness (quality gates, audits, testing)
- **Agent-Type Routing:** Specific docs for Layer/Page/Algorithm/Mr Blue agents
- **Task-Type Routing:** Required docs by task (Payment/UI/API/Coordination)

**When to use:** If you're following MB.MD methodology, start with the phase map. If you're looking for component-specific docs, use this map.

---

## 🎯 Quick Start: What to Read BEFORE You Work

### Critical Pre-Work Documents (MUST READ)
**Before ANY development work, read these 3 documents:**

1. **`docs/PREVENTION_GUIDE.md`** (326 lines)
   - Lines 14-47: Mandatory pre-work checklist
   - Lines 119-138: Verification protocol before declaring "Done"
   - Lines 145-158: MB.MD methodology compliance

2. **`docs/MrBlue/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md`** (487 lines)
   - Lines 20-346: 15-step onboarding framework
   - Lines 326-344: Continuous improvement loop (ongoing)

3. **`replit.md`**
   - Current project state
   - User preferences
   - Recent changes and learnings

---

## 📚 DOCUMENTATION BY CATEGORY

### 1. CRITICAL PROTOCOLS & LEARNING (Required Reading)

#### Agent Learning & Communication
| Document | Lines | Purpose | When to Read |
|----------|-------|---------|--------------|
| `COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md` | 487 | 15-step agent onboarding | Before agent starts any work |
| `AGENT_COORDINATION_PROTOCOL.md` | 117 | A2A communication patterns | When coordinating with other agents |
| `PREVENTION_GUIDE.md` | 326 | NPM corruption prevention | BEFORE any dependency changes |
| `CRITICAL_FAILURE_ANALYSIS.md` | 238+ | Known failure patterns | When debugging recurring issues |
| `LIFE_CEO_40X20S_PHASE_1_3_LEARNINGS.md` | 207 | System intelligence evolution | When optimizing performance |
| `MB_MD_AGENT_COMMUNICATION_LOG.md` | ? | Agent session logs | After each work session |

#### Testing & Quality
| Document | Lines | Purpose | When to Read |
|----------|-------|---------|--------------|
| `ESA_AGENT_TESTING_PROTOCOL.md` | ? | Agent testing methodology | Before testing features |
| `TESTING_QUICK_REFERENCE.md` | ? | Quick testing guide | When writing tests |
| `VISUAL_REGRESSION_TESTING.md` | ? | Visual testing protocol | For UI changes |
| `STANDARD_UI_TESTING_JOURNEY.md` | ? | User journey testing | Testing user flows |

#### Deployment & Operations
| Document | Lines | Purpose | When to Read |
|----------|-------|---------|--------------|
| `DEPLOYMENT_GUIDE.md` | ? | Production deployment | Before deploying |
| `LAUNCH_CHECKLIST.md` | ? | Pre-launch checklist | Before going live |
| `40x20s-framework.md` | ? | ESA methodology | Systematic problem solving |

---

### 2. AGENT DOCUMENTATION (105 Files)

#### ESA Infrastructure Agents (61 Files)

**Foundation Layer (Layers 1-10)**
- `docs/agents/layers/foundation/layer-1-database-architecture.md` → Database schema, migrations, Drizzle ORM
- `docs/agents/layers/foundation/layer-2-api-structure.md` → API routes, RESTful design
- `docs/agents/layers/foundation/layer-3-server-framework.md` → Express server, middleware
- `docs/agents/layers/foundation/layer-4-authentication-system.md` → JWT auth, Replit OAuth
- `docs/agents/layers/foundation/layer-5-authorization-rbac.md` → RBAC/ABAC, permissions
- `docs/agents/layers/foundation/layer-6-data-validation.md` → Zod schemas, validation
- `docs/agents/layers/foundation/layer-7-state-management.md` → React Query, contexts
- `docs/agents/layers/foundation/layer-8-client-framework.md` → React, TypeScript, Vite
- `docs/agents/layers/foundation/layer-9-ui-framework.md` → Shadcn, Tailwind CSS
- `docs/agents/layers/foundation/layer-10-component-library.md` → Reusable components

**Core Layer (Layers 11-20)**
- `docs/agents/layers/core/layer-11-real-time-features.md` → WebSocket, Socket.io
- `docs/agents/layers/core/layer-12-data-processing.md` → Background jobs, workers
- `docs/agents/layers/core/layer-13-file-management.md` → File uploads, Cloudinary
- `docs/agents/layers/core/layer-14-caching-strategy.md` → Redis, cache patterns
- `docs/agents/layers/core/layer-15-search-discovery.md` → Search functionality
- `docs/agents/layers/core/layer-16-notification-system.md` → Notifications
- `docs/agents/layers/core/layer-17-payment-processing.md` → Payments, Stripe
- `docs/agents/layers/core/layer-18-reporting-analytics.md` → Analytics, metrics
- `docs/agents/layers/core/layer-19-content-management.md` → Content editing
- `docs/agents/layers/core/layer-20-workflow-engine.md` → Workflows, automation

**Business Layer (Layers 21-30)**
- `docs/agents/layers/business/layer-21-user-management.md` → User CRUD, profiles
- `docs/agents/layers/business/layer-22-group-management.md` → Groups, communities
- `docs/agents/layers/business/layer-23-event-management.md` → Events, calendar
- `docs/agents/layers/business/layer-24-social-features.md` → Social interactions
- `docs/agents/layers/business/layer-25-messaging-system.md` → Chat, messaging
- `docs/agents/layers/business/layer-26-recommendation-engine.md` → AI recommendations
- `docs/agents/layers/business/layer-27-gamification.md` → Points, achievements
- `docs/agents/layers/business/layer-28-marketplace.md` → Marketplace features
- `docs/agents/layers/business/layer-29-booking-system.md` → Booking, scheduling
- `docs/agents/layers/business/layer-30-support-system.md` → Customer support

**Intelligence Layer (Layers 31-46)**
- `docs/agents/layers/intelligence/layer-31-core-ai-infrastructure.md` → AI infrastructure
- `docs/agents/layers/intelligence/layer-32-prompt-engineering.md` → Prompt design
- `docs/agents/layers/intelligence/layer-33-context-management.md` → Context handling
- `docs/agents/layers/intelligence/layer-34-response-generation.md` → AI responses
- `docs/agents/layers/intelligence/layer-35-ai-agent-management.md` → Agent orchestration
- `docs/agents/layers/intelligence/layer-36-memory-systems.md` → AI memory
- `docs/agents/layers/intelligence/layer-37-learning-systems.md` → AI learning
- `docs/agents/layers/intelligence/layer-38-prediction-engine.md` → Predictive AI
- `docs/agents/layers/intelligence/layer-39-decision-support.md` → Decision AI
- `docs/agents/layers/intelligence/layer-40-natural-language.md` → NLP
- `docs/agents/layers/intelligence/layer-41-vision-processing.md` → Computer vision
- `docs/agents/layers/intelligence/layer-42-voice-processing.md` → Voice/speech
- `docs/agents/layers/intelligence/layer-43-sentiment-analysis.md` → Sentiment AI
- `docs/agents/layers/intelligence/layer-44-knowledge-graph.md` → Knowledge graphs
- `docs/agents/layers/intelligence/layer-45-reasoning-engine.md` → Reasoning AI
- `docs/agents/layers/intelligence/layer-46-integration-layer.md` → AI integration

**Platform Layer (Layers 47-56)**
- `docs/agents/layers/platform/layer-47-mobile-optimization.md` → Mobile responsiveness
- `docs/agents/layers/platform/layer-48-performance-monitoring.md` → Performance tracking
- `docs/agents/layers/platform/layer-49-security-hardening.md` → Security measures
- `docs/agents/layers/platform/layer-50-devops-automation.md` → CI/CD, DevOps
- `docs/agents/layers/platform/layer-51-testing-framework.md` → Testing infrastructure
- `docs/agents/layers/platform/layer-52-documentation-system.md` → Documentation management
- `docs/agents/layers/platform/layer-53-internationalization.md` → i18n, translations
- `docs/agents/layers/platform/layer-54-accessibility.md` → A11y compliance
- `docs/agents/layers/platform/layer-55-seo-optimization.md` → SEO
- `docs/agents/layers/platform/layer-56-compliance-framework.md` → Legal compliance

**Extended Layer (Layers 57-61)**
- `docs/agents/layers/extended/layer-57-automation-management.md` → Automation
- `docs/agents/layers/extended/layer-58-third-party-integration.md` → Integrations
- `docs/agents/layers/extended/layer-59-open-source-management.md` → OSS management
- `docs/agents/layers/extended/layer-60-github-expertise.md` → GitHub integration
- `docs/agents/layers/extended/layer-61-supabase-expertise.md` → Supabase integration

#### Life CEO Agents (16 Files)
- `docs/agents/life-ceo/lifeceo-central-coordinator.md` → Central orchestration
- `docs/agents/life-ceo/lifeceo-business.md` → Business management
- `docs/agents/life-ceo/lifeceo-creative.md` → Creative tasks
- `docs/agents/life-ceo/lifeceo-data.md` → Data management
- `docs/agents/life-ceo/lifeceo-emergency.md` → Emergency handling
- `docs/agents/life-ceo/lifeceo-finance.md` → Financial tasks
- `docs/agents/life-ceo/lifeceo-global-mobility.md` → Travel/mobility
- `docs/agents/life-ceo/lifeceo-health.md` → Health tracking
- `docs/agents/life-ceo/lifeceo-learning.md` → Learning systems
- `docs/agents/life-ceo/lifeceo-legal.md` → Legal compliance
- `docs/agents/life-ceo/lifeceo-memory.md` → Memory systems
- `docs/agents/life-ceo/lifeceo-network.md` → Network management
- `docs/agents/life-ceo/lifeceo-relationships.md` → Relationship tracking
- `docs/agents/life-ceo/lifeceo-security.md` → Security management
- `docs/agents/life-ceo/lifeceo-voice.md` → Voice processing
- `docs/agents/life-ceo/lifeceo-workflow.md` → Workflow automation

#### Domain Coordinators (9 Files)
- `docs/agents/domains/domain-1-infrastructure-orchestrator.md` → Infrastructure coordination
- `docs/agents/domains/domain-2-frontend-coordinator.md` → Frontend coordination
- `docs/agents/domains/domain-3-background-processor.md` → Background tasks
- `docs/agents/domains/domain-4-real-time-communications.md` → Real-time features
- `docs/agents/domains/domain-5-business-logic-manager.md` → Business logic
- `docs/agents/domains/domain-6-search-analytics.md` → Search & analytics
- `docs/agents/domains/domain-7-life-ceo-core.md` → Life CEO core
- `docs/agents/domains/domain-8-platform-enhancement.md` → Platform features
- `docs/agents/domains/domain-9-master-control.md` → Master orchestration

#### Chiefs & Experts (13 Files)
- `docs/agents/chiefs/chief-1-foundation.md` → Foundation oversight
- `docs/agents/chiefs/chief-2-core.md` → Core features oversight
- `docs/agents/chiefs/chief-3-business.md` → Business features oversight
- `docs/agents/chiefs/chief-4-intelligence.md` → AI oversight
- `docs/agents/chiefs/chief-5-platform.md` → Platform oversight
- `docs/agents/chiefs/chief-6-extended.md` → Extended features oversight
- `docs/agents/experts/expert-10-ai-research.md` → AI research expert
- `docs/agents/experts/expert-11-ui-ux-design-aurora.md` → UI/UX design
- `docs/agents/experts/expert-12-data-visualization.md` → Data viz
- `docs/agents/experts/expert-13-content-media.md` → Content management
- `docs/agents/experts/expert-14-code-quality.md` → Code quality
- `docs/agents/experts/expert-15-developer-experience.md` → DX
- `docs/agents/experts/expert-16-translation-i18n.md` → Translation

#### Operational Agents (5 Files)
- `docs/agents/operational/operational-63-sprint-resource-manager.md` → Sprint management
- `docs/agents/operational/operational-64-documentation-architect.md` → Documentation
- `docs/agents/operational/operational-65-project-tracker-manager.md` → Project tracking
- `docs/agents/operational/operational-66-code-review-expert.md` → Code review
- `docs/agents/operational/operational-67-community-relations-manager.md` → Community

---

### 3. MR BLUE DOCUMENTATION (120 Files)

**Purpose:** Complete documentation for Mr Blue AI workspace and Visual Editor  
**Status:** 100% production-ready, fully documented implementation

#### Core Mr Blue Implementation (15 Files)
- `docs/MrBlue/mb.md` → Main Mr Blue documentation
- `docs/MrBlue/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md` → Agent onboarding protocol
- `docs/MrBlue/AGENT_HIERARCHY_COMPLETE.md` → Agent hierarchy structure
- `docs/MrBlue/FINAL_MR_BLUE_IMPLEMENTATION.md` → Final implementation guide
- `docs/MrBlue/mb-master-plan-v4.md` → Master plan version 4
- `docs/MrBlue/mb-master-plan-v3.md` → Master plan version 3
- `docs/MrBlue/COMPLETE_BUILD_MASTER_PLAN.md` → Complete build plan
- `docs/MrBlue/HIERARCHY_SUMMARY.md` → Hierarchy summary
- `docs/MrBlue/HIERARCHY_VISUAL_SUMMARY.md` → Visual hierarchy
- `docs/MrBlue/MANUAL_STEPS_GUIDE.md` → Manual setup steps
- `docs/MrBlue/QUICK_START.md` → Quick start guide
- `docs/MrBlue/QUICK_ACTION_SUMMARY.md` → Quick actions reference
- `docs/MrBlue/INTEGRATION_GAP_ANALYSIS.md` → Integration gap analysis
- `docs/MrBlue/mb-esa-training.md` → ESA training documentation
- `docs/MrBlue/AUTONOMOUS_UI_PLAN.md` → Autonomous UI planning

#### Algorithm Agents (A1-A30) Documentation (5 Files)
- `docs/MrBlue/ALGORITHM_AGENTS_COMPLETE.md` → All 30 algorithm agents
- `docs/MrBlue/ALGORITHM_AGENTS_MBMD_PLAN.md` → Algorithm implementation plan
- `docs/MrBlue/MBMD_A2_A30_PARALLEL_BUILD.md` → Parallel build A2-A30

#### Intelligence Agents (#110-116) Sources (9 Files)
- `docs/MrBlue/agent-sources/AGENT_110_CODE_INTELLIGENCE_SOURCES.md` → Code intelligence
- `docs/MrBlue/agent-sources/AGENT_111_VISUAL_PREVIEW_SOURCES.md` → Visual preview
- `docs/MrBlue/agent-sources/AGENT_112_DESIGN_TO_CODE_SOURCES.md` → Design to code
- `docs/MrBlue/agent-sources/AGENT_113_CROSS_PHASE_SOURCES.md` → Cross-phase coordination
- `docs/MrBlue/agent-sources/AGENT_114_PREDICTIVE_PLANNER_SOURCES.md` → Predictive planning
- `docs/MrBlue/agent-sources/AGENT_115_DYNAMIC_PRIORITY_SOURCES.md` → Dynamic priority
- `docs/MrBlue/agent-sources/AGENT_116_DEPENDENCY_MAPPER_SOURCES.md` → Dependency mapping
- `docs/MrBlue/mb-agent-experts/MB1_3d_avatar.md` → 3D avatar expert
- `docs/MrBlue/mb-agent-experts/README.md` → Expert agents README

#### Phase Completion Reports (35 Files)
- `docs/MrBlue/PHASE1-completion-report.md` → Phase 1 complete
- `docs/MrBlue/mb-phase1-COMPLETE.md` → Phase 1 confirmation
- `docs/MrBlue/mb-phase1-complete.md` → Phase 1 summary
- `docs/MrBlue/PHASE2-completion-report.md` → Phase 2 complete
- `docs/MrBlue/mb-phase2-complete.md` → Phase 2 summary
- `docs/MrBlue/PHASE3-completion-report.md` → Phase 3 complete
- `docs/MrBlue/PHASE4-completion-report.md` → Phase 4 complete
- `docs/MrBlue/mb-phase4-execution-complete.md` → Phase 4 execution
- `docs/MrBlue/mb-phase4-final-push-complete.md` → Phase 4 final push
- `docs/MrBlue/PHASE5-completion-report.md` → Phase 5 complete
- `docs/MrBlue/mb-phase5-complete.md` → Phase 5 summary
- `docs/MrBlue/PHASE6-completion-report.md` → Phase 6 complete
- `docs/MrBlue/mb-phase6-complete.md` → Phase 6 summary
- `docs/MrBlue/mb-phase6-intelligence-network-complete.md` → Phase 6 intelligence
- `docs/MrBlue/PHASE7-completion-report.md` → Phase 7 complete
- `docs/MrBlue/phase7-completion-report.md` → Phase 7 summary
- `docs/MrBlue/PHASE7-FINAL-REPORT.md` → Phase 7 final
- `docs/MrBlue/mb-phase7-esa-integration-plan.md` → Phase 7 ESA integration
- `docs/MrBlue/phase7-integration-tests.md` → Phase 7 integration tests
- `docs/MrBlue/PHASE8-COMPLETION-REPORT.md` → Phase 8 complete
- `docs/MrBlue/PHASE8-PLAN.md` → Phase 8 plan
- `docs/MrBlue/PHASE_9_COMPLETE.md` → Phase 9 complete
- `docs/MrBlue/PHASE9-PLAN.md` → Phase 9 plan
- `docs/MrBlue/mb-phase9-complete-implementation.md` → Phase 9 implementation
- `docs/MrBlue/mb-phase9-execution-summary.md` → Phase 9 execution
- `docs/MrBlue/mb-phase9-expert-research.md` → Phase 9 research
- `docs/MrBlue/mb-phase9-progress-report.md` → Phase 9 progress
- `docs/MrBlue/mb-phase9-ultra-detailed-plan.md` → Phase 9 detailed plan
- `docs/MrBlue/PHASE10-COMPLETION-REPORT.md` → Phase 10 complete
- `docs/MrBlue/PHASE_10_IMPLEMENTATION_COMPLETE.md` → Phase 10 implementation
- `docs/MrBlue/PHASE10-PLAN.md` → Phase 10 plan
- `docs/MrBlue/PHASE11-SUMMARY.md` → Phase 11 summary
- `docs/MrBlue/PHASE_11_MB_MD_V2_PARALLEL.md` → Phase 11 parallel
- `docs/MrBlue/PHASE11-PLAN.md` → Phase 11 plan
- `docs/MrBlue/PHASE_11_PROGRESS_REPORT.md` → Phase 11 progress
- `docs/MrBlue/PHASE_11_QUICK_SUMMARY.md` → Phase 11 quick summary

#### Execution & Build Reports (20 Files)
- `docs/MrBlue/PARALLEL_EXECUTION_MASTER_PLAN.md` → Master parallel plan
- `docs/MrBlue/PARALLEL_BUILD_EXECUTION_PLAN.md` → Build execution
- `docs/MrBlue/PARALLEL_EXECUTION_PLAN.md` → Parallel execution plan
- `docs/MrBlue/mb-parallel-execution-complete.md` → Parallel completion
- `docs/MrBlue/PARALLEL_EXECUTION_COMPLETE.md` → Parallel exec complete
- `docs/MrBlue/mb-parallel-phase1-2-complete.md` → Parallel phase 1-2
- `docs/MrBlue/mb-parallel-tracks-7-12-complete.md` → Parallel tracks 7-12
- `docs/MrBlue/parallel-execution-report.md` → Execution report
- `docs/MrBlue/BUILD_COMPLETE_SUMMARY.md` → Build complete
- `docs/MrBlue/MB_MD_COMPLETE_SUMMARY.md` → MB.MD complete summary
- `docs/MrBlue/FINAL_PARALLEL_SUMMARY.md` → Final parallel summary
- `docs/MrBlue/FINAL-STATUS.md` → Final status report
- `docs/MrBlue/EXECUTION_STATUS.md` → Current execution status
- `docs/MrBlue/completion-report.md` → Overall completion
- `docs/MrBlue/mb-execution-summary-oct13.md` → October execution
- `docs/MrBlue/MASTER_SUMMARY_PHASE_9_10.md` → Phase 9-10 master summary
- `docs/MrBlue/PHASE_9_10_EXECUTION_SUMMARY.md` → Phase 9-10 execution
- `docs/MrBlue/PHASE_9_10_INTEGRATION_PLAN.md` → Phase 9-10 integration
- `docs/MrBlue/PHASE_9_10_VISUAL_SUMMARY.md` → Phase 9-10 visual
- `docs/MrBlue/PHASE_9_TRACKS_63-76_COMPLETE.md` → Phase 9 tracks 63-76

#### Architecture & Design (10 Files)
- `docs/MrBlue/TRACK_8_MR_BLUE_INTELLIGENCE_ARCHITECTURE.md` → Intelligence architecture
- `docs/MrBlue/TRACK_9_VISUAL_TOOL_ARCHITECTURE.md` → Visual editor architecture
- `docs/MrBlue/TRACK_10_ESA_MD_INTEGRATION_COMPLETE.md` → ESA integration
- `docs/MrBlue/visual-editor-testing.md` → Visual editor testing
- `docs/MrBlue/visual-editor-architecture.md` → Visual editor arch
- `docs/MrBlue/mb-ultimate-plan.md` → Ultimate plan
- `docs/MrBlue/MR_BLUE_VOICE_ACTIVATION_PLAN.md` → Voice activation
- `docs/MrBlue/FINAL_EXECUTION_PLAN.md` → Final execution plan
- `docs/MrBlue/FINAL_EXECUTION_PLAN_EXPERT_BACKED.md` → Expert-backed plan

#### Research & Expert Analysis (10 Files)
- `docs/MrBlue/COMPREHENSIVE_EXPERT_RESEARCH_PHASE.md` → Expert research phase
- `docs/MrBlue/FACEBOOK_OPEN_SOURCE_DEEP_DIVE.md` → Facebook OSS research
- `docs/MrBlue/FACEBOOK_RESEARCH_SUMMARY.md` → Facebook research summary
- `docs/MrBlue/FINAL_RESEARCH_SUMMARY.md` → Final research summary
- `docs/MrBlue/RESEARCH_PHASE_COMPLETE.md` → Research phase complete
- `docs/MrBlue/EXPERT_RESEARCH_COMPLETE.md` → Expert research done

#### Quality & Audit (10 Files)
- `docs/MrBlue/COMPREHENSIVE_CODEBASE_AUDIT.md` → Codebase audit
- `docs/MrBlue/COMPREHENSIVE_PLATFORM_AUDIT_COMPLETE.md` → Platform audit
- `docs/MrBlue/DEPLOYMENT_AUDIT_PLAN.md` → Deployment audit
- `docs/MrBlue/PARALLEL_AUDIT_RESULTS.md` → Parallel audit results
- `docs/MrBlue/TRACK_7_QUALITY_STANDARDS_AUDIT.md` → Quality standards
- `docs/MrBlue/100_PERCENT_COMPLETE.md` → 100% completion verification
- `docs/MrBlue/100_PERCENT_FIX_PLAN.md` → 100% fix plan
- `docs/MrBlue/FINAL_HEALTH_REPORT.md` → Final health report
- `docs/MrBlue/KNOWN_ISSUE_ROUTE_ERROR.md` → Known routing issues
- `docs/MrBlue/DB_FIX_COMPLETE.md` → Database fix completed
- `docs/MrBlue/DB_PERFORMANCE_FIX.md` → Database performance fix
- `docs/MrBlue/mb-routing-fix.md` → Routing fix documentation
- `docs/MrBlue/mb-routing-fix-summary.md` → Routing fix summary
- `docs/MrBlue/dark-mode-fixes.md` → Dark mode fixes
- `docs/MrBlue/translation-fixes.md` → Translation fixes

#### 3D Avatar & Assets (5 Files)
- `docs/MrBlue/avatar-build-log.md` → Avatar build log
- `docs/MrBlue/blender-ai-learning-guide.md` → Blender AI learning
- `docs/MrBlue/blender-avatar-guide.md` → Blender avatar guide
- `docs/MrBlue/cc0-model-sources.md` → CC0 model sources

---

### 4. FEATURE DOCUMENTATION

#### Page-Specific Docs ("The Pages" Agents)
- `docs/The Pages/agents/P1_login_page.md` → Login page
- `docs/The Pages/agents/P2_register_page.md` → Register page
- `docs/The Pages/agents/P10_home_feed.md` → Home feed
- `docs/The Pages/agents/P34_admin_projects.md` → Admin projects
- `docs/The Pages/H2AC_BUILD_SUMMARY.md` → H2AC (Human-to-Agent Communication)

#### Audit Reports (20+ Files in `docs/audit-reports/`)
- `COMPREHENSIVE-AUDIT-MEMORIES-FEED-2025-10-09.md` → Memories feed audit
- `AUTH-PAGES-AUDIT-2025-10-10.md` → Auth pages audit
- `GROUPS-PAGE-AUDIT-2025-10-10.md` → Groups page audit
- `HOME-PAGE-AUDIT-2025-10-10.md` → Home page audit
- `PROFILE-PAGE-AUDIT-2025-10-10.md` → Profile page audit
- `SYSTEMATIC-PLATFORM-AUDIT-2025-10-10.md` → Full platform audit

---

## 🔍 COMPONENT → DOCUMENTATION LOOKUP

### Frontend Components

#### Pages (`client/src/pages/`)
**Before working on ANY page, read:**
1. `PREVENTION_GUIDE.md` (pre-work checklist)
2. Specific page agent doc (if exists in `docs/The Pages/agents/`)
3. Corresponding layer doc (e.g., layer-7-state-management for React Query)

| Page/Route | Required Docs | Component Files |
|-----------|---------------|-----------------|
| Login/Register | `P1_login_page.md`, `P2_register_page.md`, `layer-4-authentication-system.md` | `client/src/pages/Login.tsx`, `Register.tsx` |
| Home Feed | `P10_home_feed.md`, `layer-24-social-features.md` | `client/src/pages/Home.tsx` |
| Memories | `COMPREHENSIVE-AUDIT-MEMORIES-FEED-2025-10-09.md`, `layer-19-content-management.md` | `client/src/pages/Memories.tsx` |
| Events | `layer-23-event-management.md` | `client/src/pages/Events.tsx` |
| Groups | `GROUPS-PAGE-AUDIT-2025-10-10.md`, `layer-22-group-management.md` | `client/src/pages/Groups.tsx` |
| Profile | `PROFILE-PAGE-AUDIT-2025-10-10.md`, `layer-21-user-management.md` | `client/src/pages/Profile.tsx` |
| Mr Blue | `docs/MrBlue/mb.md`, `TRACK_8_MR_BLUE_INTELLIGENCE_ARCHITECTURE.md` | `client/src/pages/MrBlue.tsx` |
| Visual Editor | `TRACK_9_VISUAL_TOOL_ARCHITECTURE.md` | `client/src/pages/VisualEditor.tsx` |

#### Components (`client/src/components/`)
| Component Type | Required Docs | Location |
|----------------|---------------|----------|
| UI Components | `layer-9-ui-framework.md`, `layer-10-component-library.md` | `client/src/components/ui/` |
| Layouts | `layer-7-state-management.md` | `client/src/layouts/` |
| Forms | `layer-6-data-validation.md` | Throughout components |

### Backend Services

#### Server (`server/`)
**Before touching ANY server code, read:**
1. `PREVENTION_GUIDE.md` lines 14-47 (pre-work checklist)
2. `layer-3-server-framework.md` (Express architecture)
3. Specific feature layer doc

| Server Component | Required Docs | Files |
|------------------|---------------|-------|
| Routes | `layer-2-api-structure.md` | `server/routes/`, `server/routes.ts` |
| Middleware | `layer-3-server-framework.md` | `server/middleware/` |
| Authentication | `layer-4-authentication-system.md`, `SECURITY-AUDIT.md` | `server/replitAuth.ts`, `server/middleware/auth.ts` |
| Database | `layer-1-database-architecture.md` | `server/db.ts`, `server/storage.ts`, `shared/schema.ts` |
| AI Services | `layer-31-core-ai-infrastructure.md` | `server/ai/` |
| Agents | Corresponding agent doc in `docs/agents/` | `server/agents/` |
| Workers | `layer-12-data-processing.md` | `server/workers/` |

#### Database Schema (`shared/schema.ts`)
**CRITICAL - Read these BEFORE any schema changes:**
1. `layer-1-database-architecture.md`
2. `PREVENTION_GUIDE.md` lines 163-180 (backup strategy)
3. Never change primary key types (serial ↔ varchar)

### Critical Files That Keep Disappearing

**These files have disappeared multiple times - NEVER delete:**

| File | Purpose | Backup Location | Restore From |
|------|---------|-----------------|--------------|
| `server/middleware/errorHandler.ts` | Error handling | Git commit `a22010c` | 125 lines |
| `server/utils/apiResponse.ts` | API responses | Git commit `a22010c` | 132 lines |
| `vite.config.ts` | Vite configuration | Git commit `927e915` | 32 lines |

**Pre-Work Verification Script** (Run before ANY work):
```bash
# Check critical files exist
ls -la server/middleware/errorHandler.ts server/utils/apiResponse.ts vite.config.ts

# Verify they have content (not 0 bytes)
wc -l server/middleware/errorHandler.ts server/utils/apiResponse.ts vite.config.ts

# If ANY are missing or 0 bytes, restore from git BEFORE proceeding
```

---

## 📋 TASK → REQUIRED READING LOOKUP

### Database Changes
**Before modifying `shared/schema.ts`:**
1. ✅ `layer-1-database-architecture.md` - Database patterns
2. ✅ `PREVENTION_GUIDE.md` lines 163-180 - Backup strategy
3. ✅ Check existing schema structure (don't change ID types!)
4. ✅ `LIFE_CEO_40X20S_PHASE_1_3_LEARNINGS.md` - Performance learnings

### Authentication/Security Changes
**Before modifying auth code:**
1. ✅ `layer-4-authentication-system.md` - Auth architecture
2. ✅ `layer-5-authorization-rbac.md` - RBAC/ABAC patterns
3. ✅ `SECURITY-AUDIT.md` - Security requirements
4. ✅ `PREVENTION_GUIDE.md` - Verification protocols

### Frontend Page Changes
**Before modifying any page:**
1. ✅ `PREVENTION_GUIDE.md` lines 119-138 - Verification protocol
2. ✅ Specific page agent doc (if exists)
3. ✅ `layer-7-state-management.md` - React Query patterns
4. ✅ `layer-54-accessibility.md` - A11y requirements

### API Endpoint Changes
**Before adding/modifying routes:**
1. ✅ `layer-2-api-structure.md` - API design patterns
2. ✅ `layer-6-data-validation.md` - Zod validation
3. ✅ `AGENT_COORDINATION_PROTOCOL.md` - A2A communication

### Dependency Changes
**Before running `npm install` or modifying `package.json`:**
1. ✅ `PREVENTION_GUIDE.md` lines 163-180 - BACKUP FIRST!
2. ✅ `NPM_CORRUPTION_INCIDENT_REPORT.md` - Known npm failures
3. ✅ Run health check: `npm list vite tsx esbuild`

### Performance Optimization
**Before optimizing anything:**
1. ✅ `LIFE_CEO_40X20S_PHASE_1_3_LEARNINGS.md` - Known patterns
2. ✅ `performance-analysis-40x20s.md` - Performance analysis
3. ✅ `layer-48-performance-monitoring.md` - Monitoring tools
4. ✅ `layer-14-caching-strategy.md` - Cache patterns

### Testing
**Before writing tests:**
1. ✅ `TESTING_QUICK_REFERENCE.md` - Quick testing guide
2. ✅ `ESA_AGENT_TESTING_PROTOCOL.md` - Testing methodology
3. ✅ `layer-51-testing-framework.md` - Test infrastructure

### Deployment
**Before deploying:**
1. ✅ `DEPLOYMENT_GUIDE.md` - Deployment process
2. ✅ `LAUNCH_CHECKLIST.md` - Pre-launch checks
3. ✅ `PREVENTION_GUIDE.md` lines 119-138 - Verification
4. ✅ Take screenshot to verify UI accessible

---

## ⚙️ ENFORCEMENT MECHANISMS

### Pre-Work Verification Script
**Location:** `scripts/agent-verification.sh`  
**Run before:** ANY development work

```bash
#!/bin/bash
echo "=== MB.MD Pre-Work Verification ==="

# 1. Critical files check
echo "Checking critical files..."
for file in server/middleware/errorHandler.ts server/utils/apiResponse.ts vite.config.ts; do
  if [ ! -f "$file" ]; then
    echo "❌ CRITICAL: $file is missing!"
    exit 1
  fi
  if [ ! -s "$file" ]; then
    echo "❌ CRITICAL: $file is empty (0 bytes)!"
    exit 1
  fi
done
echo "✅ Critical files OK"

# 2. Build system health
echo "Checking build system..."
npm run build --dry-run 2>&1 | grep -q "error" && echo "❌ Build system broken" && exit 1
echo "✅ Build system OK"

# 3. Package verification
echo "Checking critical packages..."
npm list vite tsx esbuild 2>&1 | grep -q "missing" && echo "❌ Packages missing" && exit 1
echo "✅ Packages OK"

# 4. Server test
echo "Testing server startup..."
timeout 10 npm run dev 2>&1 | grep -q "running on port" || (echo "❌ Server won't start" && exit 1)
echo "✅ Server OK"

echo "✅ All pre-work checks passed - safe to proceed"
```

### Post-Work Verification Script
**Location:** `scripts/verify-completion.sh`  
**Run after:** Claiming task complete

```bash
#!/bin/bash
echo "=== MB.MD Post-Work Verification ==="

# 1. Visual verification (screenshot required)
if [ ! -f "verification-screenshot.png" ]; then
  echo "❌ No screenshot taken - visual verification required"
  exit 1
fi

# 2. Route testing
echo "Testing critical routes..."
curl -s http://localhost:5000/ | grep -q "Mundo Tango" || (echo "❌ Home route broken" && exit 1)
echo "✅ Routes OK"

# 3. File size verification (prevent 0-byte files)
find . -name "*.ts" -size 0 && echo "❌ Empty files detected" && exit 1
echo "✅ No empty files"

# 4. Git status (verify changes committed)
git diff --exit-code || echo "⚠️  Uncommitted changes detected"

echo "✅ All post-work checks passed - safe to declare complete"
```

### Git Pre-Commit Hook
**Location:** `.git/hooks/pre-commit`  
**Prevents:** Committing deletions of critical files

```bash
#!/bin/bash
# Prevent deletion of critical files

CRITICAL_FILES="server/middleware/errorHandler.ts server/utils/apiResponse.ts vite.config.ts"

for file in $CRITICAL_FILES; do
  if git diff --cached --name-status | grep -q "^D.*$file"; then
    echo "❌ BLOCKED: Cannot delete critical file: $file"
    echo "   If you must delete, document in AGENT_SESSION_LOG.md why"
    exit 1
  fi
done

echo "✅ Pre-commit checks passed"
```

---

## 📊 AGENT SESSION LOGGING

### Session Log Format
**Location:** `docs/AGENT_SESSION_LOG.md`

Every agent must log what they learned:

```markdown
## Session: [Date] [Time] - [Agent Name/ID]

### Task Worked On
[Description of task]

### Documentation Read
- [ ] PREVENTION_GUIDE.md
- [ ] [Other specific docs]

### What Failed
- [Any failures encountered]

### What I Learned
- [Key learnings from this session]

### What Next Agent Should Know
- [Critical information for continuity]

### Files Modified
- [List of files changed with line counts]

### Verification Completed
- [ ] Pre-work verification ran
- [ ] Post-work verification ran
- [ ] Screenshot taken
- [ ] Routes tested
- [ ] No empty files
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Weekly Documentation Review
**Every Sunday:**
1. Review AGENT_SESSION_LOG.md for patterns
2. Update PREVENTION_GUIDE.md with new learnings
3. Add new failure patterns to CRITICAL_FAILURE_ANALYSIS.md
4. Update this DOCUMENTATION_MAP.md if structure changes

### Monthly Documentation Audit
**First of each month:**
1. Verify all 335 docs are still referenced
2. Archive outdated documentation
3. Consolidate duplicate learnings
4. Update agent onboarding materials

---

## 🎯 SUCCESS METRICS

### Documentation Compliance Metrics
- ✅ 100% of agents run pre-work verification
- ✅ 100% of agents read required docs before work
- ✅ 100% of tasks have post-work verification
- ✅ 0 critical file deletions
- ✅ 0 empty file commits
- ✅ 100% of sessions logged

### Failure Reduction Metrics
- Target: 90% reduction in repeated failures
- Track: How many times same issue occurs
- Measure: Time between similar failures (should increase)

---

## 📞 QUICK REFERENCE CARD

**Print this for every agent:**

```
┌─────────────────────────────────────────────────┐
│    MB.MD AGENT QUICK REFERENCE CARD             │
├─────────────────────────────────────────────────┤
│ BEFORE ANY WORK:                                │
│  1. Read PREVENTION_GUIDE.md (lines 14-47)      │
│  2. Read replit.md (current state)              │
│  3. Run: scripts/agent-verification.sh          │
│  4. Read task-specific docs from map            │
├─────────────────────────────────────────────────┤
│ WHILE WORKING:                                  │
│  - Check AGENT_COORDINATION_PROTOCOL.md for A2A │
│  - Follow patterns in layer docs                │
│  - Log learnings as you go                      │
├─────────────────────────────────────────────────┤
│ BEFORE DECLARING COMPLETE:                      │
│  1. Run: scripts/verify-completion.sh           │
│  2. Take screenshot (visual proof)              │
│  3. Test routes from user perspective           │
│  4. Verify file sizes > 0 bytes                 │
│  5. Update AGENT_SESSION_LOG.md                 │
│  6. Commit changes to git                       │
├─────────────────────────────────────────────────┤
│ NEVER:                                          │
│  ❌ Delete critical files (errorHandler, etc.)  │
│  ❌ Change package.json without backup          │
│  ❌ Skip pre-work verification                  │
│  ❌ Claim "done" without screenshot             │
│  ❌ Create 0-byte files                         │
└─────────────────────────────────────────────────┘
```

---

**REMEMBER:** This map exists because agents kept repeating the same failures. Use it. Follow it. Save everyone time and frustration.

**Last Updated:** October 19, 2025  
**Maintained By:** Operational Agent #64 (Documentation Architect)  
**Version:** 1.0.0
