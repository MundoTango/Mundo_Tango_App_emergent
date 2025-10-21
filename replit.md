# Mundo Tango - ESA LIFE CEO Platform

### Overview
Mundo Tango is a social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with an AI agent ecosystem for life management. The platform features comprehensive agent documentation, a PostgreSQL database with Drizzle ORM, and a React/TypeScript frontend with Socket.io real-time communication. The project aims for 100% functionality and stability, with a strong focus on quality assurance and an accelerated timeline, with a clear business vision for market potential and project ambitions within the tango community.

### User Preferences
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

### System Architecture

**UI/UX Decisions:**
The frontend uses React, TypeScript, and Vite, featuring a component-based architecture with a custom "MT Ocean" theme. It employs Tailwind CSS with teal/cyan gradients and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first, responsive, and includes full dark mode support.

**Technical Implementations:**
-   **Frontend:** React, TypeScript, Vite, Tailwind CSS for styling. State management uses React Query for server state, custom hooks for WebSocket, Context providers for authentication, and React hooks for local state.
-   **Backend:** Node.js, Express, TypeScript, and Socket.io for real-time communication. Authentication is JWT-based with Replit OAuth, supporting RBAC and ABAC. The API is RESTful with modular routes, middleware, and Multer for file uploads.
-   **Data Storage:** PostgreSQL with Drizzle ORM is the primary database, utilizing JSON columns and optimized indexes. Media storage uses Replit Object Storage with ACL support. React Query handles client-side caching.

**Feature Specifications:**
-   **Memory/Post System:** Supports rich text, hashtag indexing, location tagging, privacy controls, and AI content enhancement.
-   **Events Management:** Includes event creation, RSVP, recurring events, calendar view, and real-time updates.
-   **Profile System:** Comprehensive user profiles with tango-specific fields and privacy settings.
-   **Groups/Communities:** Features city-based auto-group creation and assignment.

**System Design Choices:**
Mundo Tango employs a comprehensive agent documentation system covering various agent types (Foundation, Core, Business, Intelligence, Page, Algorithm, Life CEO, Mr Blue, Leadership). All documentation follows the MB.MD methodology with phase-based routing for efficient agent coordination and knowledge discovery.
The platform includes 5 Customer Journey Agents (J1-J5) guiding users through progressive experiences, utilizing secure API endpoints, service functions, database tables, reusable UI components, and custom React Query hooks. Security relies on `req.user.id` from session, Zod validation, and admin role verification.
A multi-layer file protection system includes a Critical File Registry, pre-deployment checks, real-time file integrity monitoring, automated Git recovery, and PostgreSQL backups for markdown files. Agent safety protocols include 8 critical rules for AI agents, pre-commit hooks preventing deletion of critical files/folders (`docs/`, `scripts/`, `agents/`, `schema`), and automated tests for file protection.

### External Dependencies
-   **PostgreSQL + Drizzle ORM**: Primary database.
-   **Replit OAuth**: Authentication and user session management.
-   **Replit Object Storage**: Native file storage.
-   **Socket.io**: Real-time WebSocket communication.
-   **Luma Labs API**: AI-powered 3D avatar generation.
-   **PostHog**: Analytics platform.
-   **Leaflet**: Open-source mapping library.
-   **React Query (TanStack)**: Server state management and caching.
-   **Notion CMS**: Internal content management system.
-   **Sentry**: Error tracking.
-   **OpenReplay**: Session replay.
-   **Plausible Analytics**: Privacy-first web analytics.
-   **Stripe**: Payment processing.
-   **Supabase**: Alternative database layer.
-   **OpenAI GPT-4o**: AI content enhancement.
-   **n8n**: Workflow automation.