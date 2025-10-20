# Mundo Tango - ESA LIFE CEO Platform

## Overview

Mundo Tango is a social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with an AI agent ecosystem for life management. The platform features comprehensive agent documentation (268 files), PostgreSQL database with Drizzle ORM, and a React/TypeScript frontend with Socket.io real-time communication.

**Current Status:** 58% production ready (+20% discovered! - Oct 20, 2025)  
**Critical Fix (Oct 20):** Missing `postcss.config.js` prevented Tailwind compilation - created config, Aurora Tide CSS now renders  
**Master Plan:** 6-stage MB.MD roadmap to 100% (11-16 weeks with 8 parallel tracks)  
**See:** `docs/PARALLEL_ACCELERATION_PLAN.md` for acceleration strategy  
**Original Plan:** `docs/MT_MASTER_PLAN_100PCT.md` for complete breakdown

## User Preferences

- **Communication style:** Simple, everyday language
- **Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment) for all work
- **MB.MD Protocol v2.0 (Oct 20, 2025):** Code + Screenshot + Visual Verification = Done
  - All agents MUST screenshot actual render after code changes
  - Compare screenshot to Aurora Tide design spec (cyan/turquoise gradients)
  - Detect duplicate components, verify canonical imports before committing
  - Re-verify after changes to ensure user sees correct implementation
- **Expert Round Table Protocol (ERT) v1.0 (Oct 20, 2025):** 10-expert collaborative analysis
  - Extension of MB.MD for complex design decisions requiring diverse perspectives
  - Each agent researches 10 domain experts individually (existing methodology)
  - NEW: Experts engage in round table debate to challenge assumptions and reach consensus
  - Mandatory for high-stakes decisions (>100 hours dev, >50% user impact)
  - Full methodology: `docs/MB_MD_EXPERT_ROUNDTABLE_PROTOCOL.md`
- **Priority:** Deployment stability - Files must never be deleted without safeguards
- **Documentation Agent:** Must monitor file integrity and prevent build failures

## System Architecture

### Journey Agents System

The platform includes 5 Customer Journey Agents (J1-J5) designed to guide users through progressive experiences, from anonymous registration to super admin access. These agents utilize 13 secure API endpoints, 10 service functions, 4 database tables, 6 reusable UI components, and 9 custom React Query hooks for tracking progress, achievements, and feature unlocks. Security is ensured through `req.user.id` from session, Zod validation, and admin role verification.

### UI/UX Decisions

The frontend is built with React and TypeScript using Vite. It features a component-based architecture with a custom "MT Ocean" theme, employing Tailwind CSS with teal/cyan gradients and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first, responsive, and includes full dark mode support.

### Technical Implementations

**Frontend:**
- **Technologies:** React, TypeScript, Vite, Tailwind CSS.
- **State Management:** React Query for server state, custom hooks for WebSocket, Context providers for authentication, and React hooks for local state.
- **Design:** Glassmorphic design with a mobile-first approach.

**Backend:**
- **Technologies:** Node.js, Express, TypeScript, Socket.io.
- **Authentication:** JWT-based with Replit OAuth, supporting RBAC and ABAC.
- **Real-time:** Socket.io for event-driven, room-based communication.
- **API:** RESTful design with modular routes, middleware, and Multer for file uploads.

**Data Storage:**
- **Primary Database:** PostgreSQL with Drizzle ORM, schema-first, utilizing JSON columns and optimized indexes.
- **Media Storage:** Replit Object Storage (native integration) with ACL support for public/private file uploads.
- **Caching:** React Query client-side caching and static asset caching.

### Feature Specifications

- **Memory/Post System:** Supports rich text, hashtag indexing, location tagging, privacy controls, and AI content enhancement.
- **Events Management:** Includes event creation, RSVP, recurring events, calendar view, and real-time updates.
- **Profile System:** Comprehensive user profiles with tango-specific fields and privacy settings.
- **Groups/Communities:** Features city-based auto-group creation and assignment.

### Deployment Stability and Agent Safety

The platform incorporates a multi-layer file protection system to ensure deployment stability and prevent data loss. This includes a Critical File Registry, pre-deployment checks, real-time file integrity monitoring (Documentation Agent Layer 52), automated Git recovery, and a comprehensive stability plan. Agent safety protocols are also in place, with 8 critical rules for AI agents, pre-commit hooks preventing deletion of critical files/folders (e.g., `docs/`, `scripts/`, `agents/`, `schema`), automated tests for file protection, and PostgreSQL backups for markdown files.

**Agent Learning System (Oct 19, 2025):** Following critical regressions where vite.config.ts, errorHandler.ts, and apiResponse.ts repeatedly went missing, we implemented a comprehensive agent learning and enforcement system:

**Documentation Mapping System (335 Files Mapped):**
- `docs/DOCUMENTATION_MAP.md` - Complete mapping of all 335 documentation files to system components
- `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` - MB.MD phase-based documentation routing (650+ lines)
  - Associates all docs to MB.MD phases (Mapping/Breakdown/Mitigation/Deployment)
  - Agent-type routing (Layer/Page/Algorithm/Life CEO/Mr Blue agents)
  - Task-type routing (Payment/UI/API/Coordination tasks)
  - Three-layer routing system for precise documentation discovery
- Bidirectional lookups: Component → Docs, Task → Required Reading, Doc → Affected Components, Phase → Required Reading
- 105 agent documentation files, 120 Mr Blue docs, 60 protocol/framework docs, 50+ incident reports
- Quick reference cards for agents showing exactly what to read before each task type

**Enforcement Mechanisms (Zero-Trust Verification):**
- `scripts/agent-verification.sh` - Pre-work verification (MUST run before ANY work)
  - Checks critical files exist and have content (not 0 bytes)
  - Verifies build system health (vite, tsx, esbuild installed)
  - Tests server startup before allowing development work
  - Interactive MB.MD phase detection (step 5/5) with phase-specific doc recommendations
  - 10-second timeout for automated runs with graceful fallback to mandatory reading
- `scripts/verify-completion.sh` - Post-work verification (run before claiming "done")
  - Detects empty files (0 bytes) before they're committed
  - Verifies critical files still intact
  - Checks TypeScript compilation
  - Confirms server still running
- `scripts/install-git-hooks.sh` - Git pre-commit hooks (blocks bad commits)
  - Prevents deletion of critical files (errorHandler.ts, apiResponse.ts, vite.config.ts, etc.)
  - Blocks commits with 0-byte files

**Agent Session Logging:**
- `docs/AGENT_SESSION_LOG.md` - Mandatory logging system for knowledge transfer
- Each agent must log: task, docs read, failures, learnings, files modified, verification completed
- Next agent reads previous session logs to avoid repeating failures
- Implements continuous improvement loop from COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md

**Critical File Recovery:**
- errorHandler.ts (125 lines) - Restore from: `git show a22010c:server/middleware/errorHandler.ts`
- apiResponse.ts (132 lines) - Restore from: `git show a22010c:server/utils/apiResponse.ts`
- vite.config.ts (32 lines) - Restore from: `git show 927e915:vite.config.ts`

**Agent Workflow (Mandatory):**
1. Run `bash scripts/agent-verification.sh` before starting ANY work (answer MB.MD phase prompt for tailored doc recommendations)
2. Read phase-specific docs based on MB.MD methodology:
   - **MAPPING:** `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` MAPPING section + component docs
   - **BREAKDOWN:** Decomposition methodologies (40x20s, H2AC, algorithm patterns)
   - **MITIGATION:** `docs/PREVENTION_GUIDE.md` + session logs + incident reports
   - **DEPLOYMENT:** Quality gates + audits + testing protocols
3. Read required docs before touching code (use three-layer routing: phase/agent-type/task-type)
4. Do the work following MB.MD methodology
5. Run `bash scripts/verify-completion.sh` before claiming done
6. Update `docs/AGENT_SESSION_LOG.md` with learnings
7. Take screenshot if UI work, test routes if backend work

All agents must now verify file content (not just existence), test builds before claiming "deployment ready", and take screenshots to confirm preview functionality. The system uses a zero-trust verification model: documentation exists, but compliance is enforced through automation.

### System Design Choices

Mundo Tango employs a comprehensive agent documentation system covering Foundation agents (L1-L15), Core agents (L16-L30), Business agents (L31-L46), Intelligence agents (L47-L61), Page Agents (PA-001 to PA-125), Algorithm Agents (AA-01 to AA-30), Life CEO Agents (LC-01 to LC-16), Mr Blue Agents (MB-01 to MB-08), and Leadership agents (DC-01 to DC-06, CD-01 to CD-09). All documentation follows the MB.MD methodology with phase-based routing for efficient agent coordination.

## External Dependencies

**✅ Fully Implemented (Production Ready):**
-   **PostgreSQL + Drizzle ORM**: Primary database with 88 tables, schema-first design
-   **Replit OAuth**: Authentication and user session management (JWT-based, RBAC/ABAC)
-   **Replit Object Storage**: Native file storage with ACL support, ObjectUploader component
-   **Socket.io**: Real-time WebSocket communication (event-driven, room-based)
-   **PostHog**: Analytics platform with client/server tracking (active)
-   **Leaflet**: Open-source mapping library for location services (144+ refs)
-   **React Query (TanStack)**: Server state management and caching (v5)

**✅ Recently Completed (Oct 20, 2025):**
-   **Notion CMS**: Internal content management system (COMPLETE - 5 demo tango stories, /notion route, 3 API endpoints, beautiful UI)
-   **BottomNav Component**: Production-ready mobile navigation (95 lines, 56px touch targets, iOS safe-area, architect-approved)
-   **Events Page**: Mobile-first event browsing (270 lines, SPA routing, comprehensive data-testids, architect-approved)
-   **Deployment Fix**: Created server/supabaseClient.ts to resolve GitHub deployment build errors
-   **API Registration**: Groups API (8 endpoints) registered in routes.ts, total 21 active endpoints

**🟡 Partially Implemented (Needs Completion):**
-   **Sentry**: Error tracking (v9 API, LSP errors fixed, needs env vars + testing)
-   **OpenReplay**: Session replay (320-line service, needs API key + initialization)
-   **Plausible Analytics**: Privacy-first web analytics (implemented, needs verification)
-   **Stripe**: Payment processing (v18, 380-line service, LSP errors fixed, needs webhook setup)
-   **Supabase**: Alternative database layer (349-line service, active test routes, alongside Drizzle)
-   **OpenAI GPT-4o**: AI content enhancement (service exists, needs complete integration)
-   **n8n**: Workflow automation (203-line connector, needs workflow setup)

**🗑️ Removed (Oct 20, 2025):**
-   **Cloudinary**: Replaced by Replit Object Storage (10 packages uninstalled)
-   **Google Maps API**: Replaced by Leaflet (open-source, no API key needed)
-   **Redis**: Replaced by React Query + in-memory cache
-   **ws library**: Replaced by Socket.io (dead code removed)

**🚧 Planned (Future Stages):**
-   **Playwright**: End-to-end testing automation (S4 - Testing & QA)
-   **Docker**: Containerization (S5 - Deployment Readiness)
-   **GitHub Actions**: CI/CD workflows (S5 - Deployment Readiness)

**📊 Key Documentation:**
- **Master Plan:** `docs/MT_MASTER_PLAN_100PCT.md` - Complete 6-stage roadmap to 100%
- **S1 Summary:** `docs/S1_COMPREHENSIVE_SUMMARY.md` - Integration cleanup results
- **Roadmap:** `docs/MT_RESTORATION_ROADMAP.md` (559 lines) - Original restoration plan
- **Integration Status:** `docs/INTEGRATION_STATUS.md` (477 lines) - All integrations
- **Environment:** `.env.example` (90 lines) - Required variables (updated Oct 20)