# Mundo Tango - ESA LIFE CEO Platform

## Overview

Mundo Tango is a social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with an AI agent ecosystem for life management. The platform features comprehensive agent documentation, a PostgreSQL database with Drizzle ORM, and a React/TypeScript frontend with Socket.io real-time communication. The project aims for 100% functionality and stability, with a strong focus on quality assurance and an accelerated timeline.

## User Preferences

- **Communication style:** Simple, everyday language
- **Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment) for all work
- **MB.MD QA Protocol v1.0 (Oct 20, 2025):** Response to Mr Blue catastrophic failure (2.5% functional despite claiming 98%)
  - **PRIMARY REFERENCE:** `docs/MB_MD_QA_PROTOCOL.md` (1009 lines, 3x architect PASS verdicts)
  - **The 5 Non-Negotiable Rules:**
    1. VERIFY BEFORE BUILD - Check what exists first (prevents duplicate work)
    2. INTEGRATE IMMEDIATELY - Import as you build (prevents "component exists" fallacy)
    3. SCREENSHOT EVERYTHING - Visual proof required (prevents "code compiles" fallacy)
    4. TEST USER JOURNEY - Users must access it (prevents "button exists" fallacy)
    5. ARCHITECT VALIDATES - Independent review (prevents self-approval waste)
  - **Build-Integrate-Verify Loop:** 7 mandatory steps, failure at ANY step = DO NOT PROCEED
  - **Agent Integration:** Template updated, ESA73 example, rollout guide for 234 agents
  - **Enforcement:** Tasks cannot mark `completed` without `architect_reviewed: "yes"`
  - **Implementation Annex:** Maps abstract requirements to concrete tooling (280 lines)
  - **Sensitive Data Policy:** Test accounts only, redact secrets/PII, never screenshot production
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

The platform includes 5 Customer Journey Agents (J1-J5) guiding users through progressive experiences. These agents utilize secure API endpoints, service functions, database tables, reusable UI components, and custom React Query hooks for tracking progress. Security is ensured through `req.user.id` from session, Zod validation, and admin role verification.

### UI/UX Decisions

The frontend uses React, TypeScript, and Vite, featuring a component-based architecture with a custom "MT Ocean" theme. It employs Tailwind CSS with teal/cyan gradients and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first, responsive, and includes full dark mode support.

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

The platform incorporates a multi-layer file protection system including a Critical File Registry, pre-deployment checks, real-time file integrity monitoring, automated Git recovery, and PostgreSQL backups for markdown files. Agent safety protocols include 8 critical rules for AI agents, pre-commit hooks preventing deletion of critical files/folders (`docs/`, `scripts/`, `agents/`, `schema`), and automated tests for file protection.

A comprehensive agent learning and enforcement system ensures file integrity and build stability. This includes a Documentation Mapping System (335 files mapped to components and MB.MD phases), and Enforcement Mechanisms like `scripts/agent-verification.sh` (pre-work check), `scripts/verify-completion.sh` (post-work check), and `scripts/install-git-hooks.sh` (pre-commit hooks). A mandatory `docs/AGENT_SESSION_LOG.md` system tracks agent learnings.

### System Design Choices

Mundo Tango employs a comprehensive agent documentation system covering various agent types (Foundation, Core, Business, Intelligence, Page, Algorithm, Life CEO, Mr Blue, Leadership). All documentation follows the MB.MD methodology with phase-based routing for efficient agent coordination and knowledge discovery.

## External Dependencies

-   **PostgreSQL + Drizzle ORM**: Primary database.
-   **Replit OAuth**: Authentication and user session management.
-   **Replit Object Storage**: Native file storage.
-   **Socket.io**: Real-time WebSocket communication.
-   **Luma Labs API**: AI-powered 3D avatar generation (integrated Oct 21, 2025).
-   **PostHog**: Analytics platform.
-   **Leaflet**: Open-source mapping library.
-   **React Query (TanStack)**: Server state management and caching.
-   **Notion CMS**: Internal content management system (completed).
-   **Sentry**: Error tracking (partially implemented).
-   **OpenReplay**: Session replay (partially implemented).
-   **Plausible Analytics**: Privacy-first web analytics (partially implemented).
-   **Stripe**: Payment processing (partially implemented).
-   **Supabase**: Alternative database layer (partially implemented, alongside Drizzle).
-   **OpenAI GPT-4o**: AI content enhancement (partially implemented).
-   **n8n**: Workflow automation (partially implemented).

## Recent Platform Enhancements (Oct 21, 2025)

**MB.MD "After Each Completion → Launch Next Parallel Track" Implementation:**

### Track 1-3: Mr Blue AI Enhanced Features
- **Luma Labs 3D Avatar Generation** (Track 1): Full integration with API service, database schema (luma_generations table), routes (/api/luma/*), and LumaAvatarGenerator UI component in Avatar AI tab
- **Voice UI Integration** (Track 2): VoiceControls component with speak/listen buttons, useSpeechRecognition hook for browser speech recognition, integrated into chat interface
- **Personality Selector** (Track 3A): 4-mode dropdown (Professional, Friendly, Mentor, Debug) wired to /api/mrblue/stream requests for contextual AI responses
- **Agent Orchestration Panel** (Track 3B): Real-time MB.MD phase tracking, active agent monitoring, workflow controls visible in Mr Blue chat

### Track 4-6: Journey & Agent Systems
- **Journey Agents J1-J5 Backend** (Track 4A): Complete API routes (/api/journeys/*) for progress tracking, step completion, achievements, feature unlocks
- **Journey Wizard Frontend** (Track 4B): Interactive step-by-step wizards for all 5 journeys (J1-J5) with progress bars, navigation, /journey/:journeyId routing
- **Agent Browser** (Track 6): Searchable directory of 350+ AI agents with tier/category filters, agent details modal, /agents route

### Functionality Status (Architect-Verified Oct 21, 2025)
- **Fully Functional**: Voice UI (Track 2), Agent Orchestration Panel (Track 3B), Journey Wizards frontend (Track 4B), Agent Browser (Track 6)
- **Partially Functional**: Personality Selector wired to backend, Journey backend API endpoints operational
- **Fixed (Oct 21 23:54 UTC)**: Luma Labs service (node-fetch→global fetch), DB tables created (luma_generations, user_journey_progress, user_achievements, user_feature_unlocks), Navigation enhanced (Mr Blue AI, Agent Browser, J1-J5 journeys in sidebar)

## MB.MD Agent Self-Audit System (Oct 21, 2025)

**Methodology Created**: 7-step self-audit process for all 350+ agents
- **Documentation**: `docs/MB_MD_AGENT_SELF_AUDIT_METHODOLOGY.md`
- **Pattern Library**: `docs/MB_MD_REUSABLE_PATTERNS.md` (10 reusable patterns)
- **Testing Infrastructure**: `scripts/test-routes.sh` (automated route existence tests)

**Audit Reports Generated** (11 agents audited - Oct 21, 2025):
1. **Mr Blue Core (#73)**: 75% functional - Chat interface working, DB validation needed
2. **Subscription Manager (#74)**: 40% functional - UI exists, backend missing
3. **AI Site Builder (#75)**: 35% functional - Wizard complete, no AI integration
4. **Journey Agent J1**: 65% functional - Frontend works, DB writes untested
5. **Journey Agent J2**: 60% functional - Not wired to profile API
6. **Journey Agent J3**: 55% functional - UI complete, friend integration missing
7. **Journey Agent J4**: 60% functional - Wizard works, RSVP partial
8. **Journey Agent J5**: 50% functional - Content exists, interactivity missing
9. **Algorithm A1 (Search)**: 70% functional - Works but needs caching
10. **Algorithm A2 (Recommendations)**: 65% functional - Basic matching, needs ML
11. **Algorithm A3 (Moderation)**: 30% functional - Basic filtering, no AI

**Critical Issues Identified**:
- Zod validation removed from mrBlueRoutes (security regression)
- Several agents have UI but no backend persistence
- Algorithm agents not wrapped in AlgorithmAgent class
- Achievement/reward systems not implemented

**Known Working Features** (Verified Oct 21, 2025):
- ✅ 18/18 core routes return 200 OK (tested via scripts/test-routes.sh)
- ✅ Database tables exist (luma_generations, user_journey_progress, user_achievements, user_feature_unlocks)
- ✅ Navigation discoverable (Mr Blue AI, Agent Browser, J1-J5 journeys in sidebar)
- ✅ Core Mr Blue chat renders (backend integration untested)
- ✅ Voice UI works in modern browsers
- ✅ Agent Browser displays agents (data source TBD)
- ✅ Journey wizards render and navigate

**Honest Coverage Assessment**:
- Routes Tested: 18/72 pages (25% coverage)
- Agents Audited: 11/350+ (3.1% coverage)
- Overall Platform Functionality: ~60% end-to-end