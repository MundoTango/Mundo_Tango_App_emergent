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

**Agent Learning System (Oct 19, 2025):** Following a critical regression where vite.config.ts went missing, we implemented a comprehensive agent learning system documented in `docs/COMMON_FAILURES_DATABASE.md`. This includes:
- Mandatory pre-work and post-work verification protocols for all agents
- Historical failure pattern documentation and prevention guides
- Agent-specific learning protocols embedded in Layer 50 (DevOps) and Layer 52 (Documentation)
- Automated verification script (`scripts/agent-verification.sh`) for build system health checks
- Cross-references to `docs/PREVENTION_GUIDE.md` and `docs/CRITICAL_FAILURE_ANALYSIS.md`

All agents must now verify file content (not just existence), test builds before claiming "deployment ready", and take screenshots to confirm preview functionality.

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