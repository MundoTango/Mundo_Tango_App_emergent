# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference **docs/platform-handoff/esa.md** as the primary entry point.

## Recent Changes (October 11, 2025)

### ESA Feature Architecture Framework (NEW - CRITICAL!)
- **Created Missing Framework Piece**: `docs/platform-handoff/ESA_FEATURE_ARCHITECTURE_TEMPLATE.md`
- **Mandatory for ALL New Features**: 7 required documents before ANY code is written
  1. Master Architecture (overall system design)
  2. Per-Page Architecture (ONE doc per page with full customer journeys)
  3. Agent Matrix (who builds what)
  4. API Contracts (every endpoint)
  5. Database Schema (tables, relations, migrations)
  6. Component Inventory (all UI elements)
  7. Testing Plan (E2E + unit + performance)
- **Added to ESA.md**: Now part of core documentation matrix for all future development
- **Why This Matters**: Ensures complete systematic thinking BEFORE building (no more gaps!)

### Project Tracker: Complete Page-by-Page Architecture (COMPLETE!)
- **8 Architecture Documents Created**:
  1. `master-architecture.md` - Overall system design (Agent #65 lead)
  2. `agent-matrix.md` - 12 agents, 112 hours total effort
  3. `pages/dashboard-architecture.md` - 4 widgets, metrics, real-time updates
  4. `pages/epics-list-architecture.md` - Sortable table, filters, bulk actions
  5. `pages/epic-detail-architecture.md` - Story breakdown, progress chart
  6. `pages/story-detail-architecture.md` - **Agent assignment + code links (THE KEY PAGE!)**
  7. `pages/sprint-board-architecture.md` - Kanban drag-drop, burndown charts
  8. API contracts, database schema, component inventory (in page docs)

### Schema Enhancements for Agent Tracking (COMPLETE!)
- **Added to projectStories table**:
  - `assignedAgentId` (varchar) - Primary agent (e.g., "agent-52")
  - `teamAgentIds` (text[]) - Team agents array
  - `codeFiles` (jsonb) - Code file paths with line ranges
  - `estimatedHours`, `actualHours` (real) - Effort tracking
  - `referenceLinks` (jsonb) - External documentation
- **Added to projectTasks table**:
  - `assignedAgentId` (varchar) - Agent assignment
  - `codeFilePath` (varchar) - File path (e.g., "client/src/pages/home.tsx")
  - `codeLineRange` (varchar) - Line range (e.g., "49-54")
  - `acceptanceCriteria` (text[]) - Success criteria
  - `referenceImplementation` (text) - Pattern to follow

### New Components Built (Agent #17)
- **AgentSelector Component** (`client/src/components/tracker/AgentSelector.tsx`)
  - Hierarchical dropdown with 100 ESA agents
  - Grouped by division (Leadership, Experts, Chiefs 1-6)
  - Search by name, capability
  - Shows workload capacity
  - Multi-select variant for team agents
  - Full Aurora Tide compliance
- **CodeLinkInput Component** (`client/src/components/tracker/CodeLinkInput.tsx`)
  - File path input with validation
  - Line range input (e.g., "49-54")
  - Auto-validates path structure
  - VSCode protocol integration (opens file at exact line)
  - Preview display
  - Readonly variant for display

### Aurora Tide Design System Enforcement
- **Mandatory Pre-Build Design Gate**: All new UI features MUST receive Agent #11 (Aurora Tide Design Expert) approval BEFORE building
- **ESLint Auto-Enforcement**: Agent #66 blocks plain `Card` imports; only `GlassCard` from `@/components/glass/GlassComponents` allowed
- **Design Specs Required**: Every new component documented in `docs/design-specs/` with exact Aurora Tide patterns

### ESA Re-Audit & Phase 5 Execution Plan (READY)
- **Phase 1: Re-Audit**: 7 previously audited pages → Extracted 81 tasks → Epic MUN-109 with 7 stories
- **Phase 2: Phase 5 Hybrid Blitz**: 8 squads audit 128 remaining pages
- **Phase 3: Admin Modernization**: Update 7 admin pages with design standards
- **Meta-Tracking**: Using Project Tracker to track Phase 5 audit work itself

### Current Status: PROJECT TRACKER FULLY OPERATIONAL! 🎉 (October 11, 2025)
- ✅ **ESA Parallel Build Execution**: Overcame subagent limitation, executed direct parallel builds
- ✅ **All 7 Pages Built & Working**:
  1. Dashboard (/admin/projects) - 4 glassmorphic widgets (Epics, Stories, Points, In Progress)
  2. Epics List (/admin/projects/epics) - Sortable table with search/filter, showing MUN-109
  3. Stories List (/admin/projects/stories) - All 7 stories with agent filter, 83 total points
  4. Epic Detail (/admin/projects/epic/:id) - Story breakdown with defensive coding
  5. Story Detail (/admin/projects/story/:id) - Agent assignment + code links
  6. Sprint Board (/admin/sprints) - Velocity tracking, burndown charts
  7. Routes configured in routes.ts - All navigation working
- ✅ **Database Schema Deployed**: Added agent tracking columns (assignedAgentId, teamAgentIds, codeFiles, etc.) via SQL
- ✅ **Architecture Docs**: 8 complete ESA-compliant docs with customer journeys
- ✅ **Aurora Tide Compliant**: All pages use glassmorphic MT Ocean theme
- ✅ **Zero Console Errors**: All pages load cleanly, no 500 errors
- 🚀 **Ready for Use**: Full self-hosted project tracker replacing Jira, tracking MUN-109 Re-Audit epic

## System Architecture
The platform utilizes a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

### UI/UX Decisions
- **Design System**: "MT Ocean Theme" with glassmorphic elements, turquoise-to-blue gradients, comprehensive design tokens, GSAP scroll reveals, Framer Motion, magnetic/ripple micro-interactions, and an international icon/tooltip system (6 languages). Adheres to Aurora Tide design system for component usage, accessibility (WCAG 2.1 AA compliant), dark mode/i18n coverage. Mobile-first design approach.

### Technical Implementations
- **Frontend**: React with functional components, hooks, React Query, and context APIs.
- **Backend**: Node.js with Express.js and TypeScript.
- **Real-time**: WebSocket communication via Socket.io.
- **Authentication**: JWT and session-based authentication with RBAC/ABAC using `@casl/ability`.
- **Database Interaction**: Drizzle ORM for PostgreSQL.
- **Container Orchestration**: Docker stack.
- **Automation Platform**: n8n integration.
- **Automated Testing**: TestSprite AI.
- **Internationalization**: Functional translation generation (68 languages via OpenAI).
- **Payments**: Full Stripe integration.
- **Media Upload System**: Hybrid approach supporting YouTube/Vimeo, Cloudinary, and direct server uploads with client-side compression.

### Feature Specifications
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds.
- **Community Management**: City-specific groups, event management with RSVP, housing listings, and user-generated recommendations. Includes a unified interactive map with 3-layer filtering.
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics, including expert agents (AI Research, UI/UX Design). The system currently has a total of 67 agents.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Comprehensive Audit System**: Automated, multi-layer audit system for continuous quality improvement, including page audits and open-source management.

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer with isolated databases and API-first communication.
- **Framework**: Adheres to the ESA LIFE CEO 61x21 systematic development methodology, including a 100-agent organizational structure with a CEO, 6 Division Chiefs, 9 Domain Coordinators, 61 Layer Agents, 7 Expert Agents, and 16 Life CEO Sub-Agents.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules.
- **Agent Training**: Utilizes an "Ultra-Micro Parallel Methodology" for rapid agent training and certification, focusing on atomic task decomposition and real production work.
- **Project Management**: Shifting from Jira to self-hosted project management via dedicated AI agents for Sprint & Resource Management, Documentation, Project Tracking, Code Review, and Community Relations.

## External Dependencies
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Payment Processing**: Stripe
- **Real-time Communication**: Socket.io
- **Mapping**: Leaflet.js, OpenStreetMap Nominatim API, Google Maps API
- **AI/Machine Learning**: OpenAI GPT-4o
- **Error Tracking**: Sentry
- **Background Job Queue**: BullMQ
- **Metrics/Monitoring**: Prometheus
- **Search**: Elasticsearch
- **Caching**: Redis
- **Image/Media Handling**: Multer, Pexels API, FFmpeg.wasm, WebCodecs API, Cloudinary
- **Authentication/Authorization**: jsonwebtoken, bcrypt, @casl/ability
- **UI Framework**: React, Tailwind CSS, shadcn/ui, Radix UI, Material-UI (MUI)
- **Date/Time Utilities**: moment.js, date-fns
- **PDF Generation**: jsPDF, html2canvas
- **Data Visualization**: Recharts
- **Forms**: react-hook-form
- **Email Service**: Resend
- **Analytics**: Plausible Analytics
- **Internationalization**: i18next, react-i18next