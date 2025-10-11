# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference **docs/platform-handoff/esa.md** as the primary entry point.

## Recent Changes (October 11, 2025)

### Aurora Tide Design System Enforcement
- **Mandatory Pre-Build Design Gate**: All new UI features MUST receive Agent #11 (Aurora Tide Design Expert) approval BEFORE building
- **ESLint Auto-Enforcement**: Agent #66 blocks plain `Card` imports; only `GlassCard` from `@/components/glass/GlassComponents` allowed
- **Design Specs Required**: Every new component documented in `docs/design-specs/` with exact Aurora Tide patterns
- **Learning from Failure**: Project Tracker initially built without Aurora Tide compliance; rebuilt correctly as case study for all 67 agents

### Dual-Mode Audit & Build Framework
- **Updated Tool**: `docs/pages/esa-tools/standardized-page-audit.md` now supports BUILD+AUDIT dual-mode operation
- **Mode 1 (Audit)**: Post-build validation for existing pages
- **Mode 2 (Build)**: Pre-build design gates enforce Aurora Tide from the start
- **4-Step Enforcement**: Agent #11 Design → Agent #65 Build → Agent #66 ESLint → Agent #14 Validation

### Phase 5 Hybrid Blitz Execution (8 Squads)
- **Squad 1**: Accessibility (Agent #54) - 25 pages
- **Squad 2**: i18n (Agent #53) - 30 pages  
- **Squad 3**: Performance (Agent #52) - 15 pages
- **Squad 4**: Testing (Agent #51) - 20 pages
- **Squad 5**: Security (Agent #49) - 15 pages
- **Squad 6**: Database (Agent #1) - 20 pages
- **Squad 7**: AI Integration (Agent #31) - 10 pages
- **Squad 8**: Aurora Tide Design (Agent #11) - ALL 135 pages (VETO power on design violations)

### Meta-Tracking System
- **Self-Hosted Project Tracker**: `/admin/projects` rebuilt with Aurora Tide compliance
- **Epic Structure**: MUN-100 (master) → MUN-101 through MUN-108 (squad epics)
- **Self-Referential**: Using the tracker to track Phase 5 audit work itself
- **Auto-Sync**: Audit findings → Project Tracker tasks → Real-time dashboard updates

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