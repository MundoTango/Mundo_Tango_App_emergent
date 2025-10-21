# Mundo Tango - ESA LIFE CEO Platform

### Overview
Mundo Tango is a social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with an AI agent ecosystem for life management. The platform features comprehensive agent documentation, a PostgreSQL database with Drizzle ORM, and a React/TypeScript frontend with Socket.io real-time communication. The project aims for 100% functionality and stability, with a strong focus on quality assurance and an accelerated timeline, with a clear business vision for market potential and project ambitions within the tango community.

### User Preferences
**⚠️ THE 5 NON-NEGOTIABLE RULES - ALL AGENTS READ FIRST**
Every agent MUST follow these before marking ANY task complete:
1. **VERIFY BEFORE BUILD** - Complete mandatory documentation verification checklist (`docs/DOCUMENTATION_VERIFICATION.md`), read all relevant docs, summarize requirements BEFORE coding - prevents building wrong features
2. **INTEGRATE IMMEDIATELY** - Import components as you build them, test imports work - prevents "component exists" fallacy
3. **SCREENSHOT EVERYTHING** - Visual proof required AFTER opening modals/clicking buttons - prevents "code compiles" fallacy
4. **TEST USER JOURNEY** - Test as regular user AND super admin, verify access controls - prevents "button exists" fallacy
5. **ARCHITECT VALIDATES** - Independent review mandatory, no self-approval - prevents shipping broken features

Failure at ANY step = DO NOT PROCEED. Fix the issue first.
Full protocol: `docs/MB_MD_QA_PROTOCOL.md` (1009 lines)
Documentation verification: `docs/DOCUMENTATION_VERIFICATION.md` (MANDATORY before building)

- **Communication style:** Simple, everyday language
- **Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment) for all work
- **Priority:** Deployment stability - Files must never be deleted without safeguards
- **Documentation Agent:** Must monitor file integrity and prevent build failures

### System Architecture

**UI/UX Decisions:**
The frontend uses React, TypeScript, and Vite, featuring a component-based architecture with a custom "MT Ocean" theme. It employs Tailwind CSS with teal/cyan gradients and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first, responsive, and includes full dark mode support. A Figma-like visual editor allows for click-to-select elements, an inspector panel for attributes, and a styles panel for layout/colors, with changes saved to generate code.

**Technical Implementations:**
-   **Frontend:** React, TypeScript, Vite, Tailwind CSS for styling. State management uses React Query for server state, custom hooks for WebSocket, Context providers for authentication, and React hooks for local state.
-   **Backend:** Node.js, Express, TypeScript, and Socket.io for real-time communication. Authentication is JWT-based with Replit OAuth, supporting RBAC and ABAC. The API is RESTful with modular routes, middleware, and Multer for file uploads. ESM static imports are prioritized over dynamic imports to ensure stability.
-   **Data Storage:** PostgreSQL with Drizzle ORM is the primary database, utilizing JSON columns and optimized indexes. Media storage uses Replit Object Storage with ACL support. React Query handles client-side caching.

**Feature Specifications:**
-   **Memory/Post System:** Supports rich text, hashtag indexing, location tagging, privacy controls, and AI content enhancement.
-   **Events Management:** Includes event creation, RSVP, recurring events, calendar view, and real-time updates.
-   **Profile System:** Comprehensive user profiles with tango-specific fields and privacy settings.
-   **Groups/Communities:** Features city-based auto-group creation and assignment.
-   **Unified AI Access:** A single "Mr Blue" button provides access to AI features, with tab visibility controlled by user roles (regular users see 5 tabs, super admins see 10).

**System Design Choices:**
Mundo Tango employs a comprehensive agent documentation system covering various agent types (Foundation, Core, Business, Intelligence, Page, Algorithm, Life CEO, Mr Blue, Leadership). All documentation follows the MB.MD methodology with phase-based routing for efficient agent coordination and knowledge discovery. The platform includes 5 Customer Journey Agents (J1-J5) guiding users through progressive experiences, utilizing secure API endpoints, service functions, database tables, reusable UI components, and custom React Query hooks. Security relies on `req.user.id` from session, Zod validation, and admin role verification. A multi-layer file protection system includes a Critical File Registry, pre-deployment checks, real-time file integrity monitoring, automated Git recovery, and PostgreSQL backups for markdown files. Agent safety protocols include 8 critical rules for AI agents, pre-commit hooks preventing deletion of critical files/folders (`docs/`, `scripts/`, `agents/`, `schema`), and automated tests for file protection.

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
-   **@anthropic-ai/sdk**: AI integration.
-   **@google/generative-ai**: AI integration.
-   **@huggingface/inference**: AI integration.