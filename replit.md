# Mundo Tango - ESA LIFE CEO Platform

## Overview

Mundo Tango is a comprehensive social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with a multi-layered AI agent ecosystem for life management. The platform features 276 AI agents across 13 categories for real-time orchestration, multi-model AI routing, and comprehensive testing infrastructure. 

**Current Status (Oct 18, 2025):** Phase 0 - Agent Preparation ✅ 100% COMPLETE! All 5 tasks finished (coordinator, docs, naming, page agents, journey orchestration). 120/276 agents operational (43.5%). Production build fixed, deployment-ready. Dev server running on port 5000. Journey orchestration live with real database metrics. Ready for Phase 3 (Database).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React and TypeScript, utilizing Vite for fast development. It features a component-based architecture with a custom "MT Ocean" theme, using Tailwind CSS with teal/cyan gradients (#5EEAD4 → #155E75) and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first and responsive.

### Technical Implementations

**Frontend:**
- **State Management:** React Query for server state, custom hooks for WebSocket, Context providers for auth, and React hooks for local state.
- **Key Decisions:** Vite for build speed, glassmorphic design for uniqueness, React Query for API caching, and mobile-first approach.

**Backend:**
- **Server:** Node.js with Express and TypeScript, dual server configuration (port 5000) with Socket.io.
- **Authentication:** JWT-based with Replit OAuth, supporting RBAC and ABAC.
- **Real-time:** Socket.io for event-driven, room-based communication.
- **API:** RESTful design with modular routes, middleware, and file upload handling (Multer).
- **Key Decisions:** Express for ecosystem, Socket.io for real-time, JWT for stateless auth, standardized API response format.

**Data Storage:**
- **Primary Database:** PostgreSQL with Drizzle ORM, schema-first, with JSON columns for flexible data and optimized indexes.
- **Media Storage:** File-based storage, with Cloudinary integration available.
- **Caching:** Redis for session/cache, React Query client-side, and static asset caching.
- **Key Decisions:** PostgreSQL for ACID compliance, Drizzle ORM for type safety, JSON columns for flexibility, and segmented file storage.

### Feature Specifications

- **Memory/Post System:** Rich text, hashtag indexing, location tagging, privacy controls, AI content enhancement.
- **Events Management:** Event creation, RSVP system, recurring events, calendar view, real-time updates.
- **Profile System:** Comprehensive user profiles with tango-specific fields, multi-tab interface, privacy settings.
- **Groups/Communities:** City-based auto-group creation and assignment.

### System Design Choices

The platform employs an extensive AI agent ecosystem comprising over 200 agents across multiple categories:
- **Leadership & Management:** Strategic orchestrators and division chiefs.
- **ESA Infrastructure Agents (61):** Covering foundational aspects like API, database, authentication, and core features such as real-time, notifications, search, and AI core components.
- **Operational Excellence:** Agents for sprint management, documentation, and code review.
- **Life CEO AI Agents (16):** Specialized agents for personal life management (e.g., Health & Wellness, Career Coach), utilizing GPT-4o.
- **Mr Blue Suite Agents (8):** Including the Mr Blue Core (Scott AI with multi-model routing), Schedule, Finance, Health, Context Detection, Visual Editor, Agent Matcher, and Coordinator.
- **Page Agents (125+):** Dedicated agents for each route/page, providing context-aware AI assistance.
- **Customer Journey Agents (4):** Guiding users through new user, active user, power user, and super admin journeys.
- **UI Sub-Agents:** For dark mode, translation, and component watching.
- **Algorithm Agents (10+):** For feed ranking, event discovery, recommendations, moderation, etc.
- **Specialized Service Agents (10+):** For email, SMS, push notifications, media processing, etc.

All core agents are operational and undergo continuous validation.

## External Dependencies

-   **OpenAI GPT-4o**: For AI content enhancement and contextual responses.
-   **Replit OAuth**: For authentication and user session management.
-   **Cloudinary**: Optional media storage and optimization.
-   **Google Maps API**: (Integration in progress) For location services.
-   **n8n**: Workflow integration hooks.
-   **PostHog**: For analytics.
-   **Playwright**: For end-to-end testing automation.
-   **Docker**: For containerization.
-   **Nginx**: Reverse proxy.
-   **GitHub Actions**: CI/CD workflows.