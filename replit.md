# Mundo Tango - ESA LIFE CEO Platform

## Overview

Mundo Tango is a social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with an AI agent ecosystem for life management. The platform features 84 agent files implementing 173+ logical agents, plus 61 legacy ESA Infrastructure agents for real-time orchestration, multi-model AI routing, and comprehensive testing infrastructure. The project currently has 97 UI pages (85% complete), 88 database tables, 467 components, and approximately 100-150 API endpoints. A key ambition is to achieve 100% production readiness through a comprehensive 6-track parallel execution plan, focusing on UI/UX polish, mobile responsiveness, accessibility, and E2E testing.

## User Preferences

- **Communication style:** Simple, everyday language
- **Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment) for all work
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
- **Primary Database:** PostgreSQL with Drizzle ORM, schema-first, utilizing JSON columns and 13 optimized indexes for sub-millisecond queries.
- **Media Storage:** File-based storage with Cloudinary integration.
- **Caching:** Redis for session/cache, React Query client-side caching, and static asset caching.

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

Mundo Tango utilizes an extensive AI agent ecosystem with over 200 agents across various categories, including Leadership & Management, ESA Infrastructure (61 agents), Operational Excellence, Life CEO AI Agents (16, utilizing GPT-4o), Mr Blue Suite Agents (8, including multi-model routing), Page Agents (125+ for context-aware assistance), Customer Journey Agents (4), UI Sub-Agents, Algorithm Agents (10+), and Specialized Service Agents (10+). All core agents are operational and continuously validated.

## External Dependencies

-   **OpenAI GPT-4o**: AI content enhancement and contextual responses.
-   **Replit OAuth**: Authentication and user session management.
-   **Cloudinary**: Optional media storage and optimization.
-   **Google Maps API**: Location services (integration in progress).
-   **n8n**: Workflow integration hooks.
-   **PostHog**: Analytics.
-   **Playwright**: End-to-end testing automation.
-   **Docker**: Containerization.
-   **Nginx**: Reverse proxy.
-   **GitHub Actions**: CI/CD workflows.