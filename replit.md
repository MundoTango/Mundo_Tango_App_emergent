# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference the **ESA_ORCHESTRATION.md** as the primary entry point, which orchestrates:
- ESA.md (61 layers framework)
- docs/pages/esa-agents/index.md (AI agent system)
- docs/pages/design-systems/aurora-tide.md (design standards)
- ESA_DEPLOYMENT_AUDIT.md (deployment audit)
For platform audits, use ESA_DEPLOYMENT_AUDIT.md as the deployment readiness checklist.

## System Architecture
The platform utilizes a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

### UI/UX Decisions
- **Design System**: "MT Ocean Theme" with glassmorphic elements, turquoise-to-blue gradients, comprehensive design tokens, GSAP scroll reveals, Framer Motion, magnetic/ripple micro-interactions, and an international icon/tooltip system (6 languages). Adheres to Aurora Tide design system for component usage, accessibility (WCAG 2.1), dark mode/i18n coverage.
- **Responsiveness**: Mobile-first design approach.
- **Interaction**: Micro-interactions like ripple effects, magnetic buttons, confetti, and particle effects.
- **Theming**: Comprehensive theming system for site-wide visual transformations.

### Technical Implementations
- **Frontend**: React with functional components, hooks, React Query, and context APIs.
- **Backend**: Node.js with Express.js and TypeScript.
- **Real-time**: WebSocket communication via Socket.io.
- **Authentication**: JWT and session-based authentication with RBAC/ABAC using `@casl/ability`.
- **Database Interaction**: Drizzle ORM for PostgreSQL.
- **Container Orchestration**: Docker stack.
- **Automation Platform**: n8n integration.
- **Automated Testing**: TestSprite AI.
- **Performance**: Lazy loading, route prefetching, virtual scrolling, image lazy loading, request batching, and an AI-powered performance agent.
- **Cache Architecture**: Standardized with a single QueryClient, `gcTime: 30min`, `staleTime: 0`, and production-ready mutation hooks for optimistic updates.
- **Internationalization**: Functional translation generation (68 languages via OpenAI).
- **Payments**: Full Stripe integration.
- **Media Upload System**: Hybrid approach supporting YouTube/Vimeo, Cloudinary, and direct server uploads with client-side compression.

### Feature Specifications
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds.
- **Community Management**: City-specific groups, event management with RSVP, housing listings, and user-generated recommendations. Includes a unified interactive map with 3-layer filtering.
- **Trip Planner**: Comprehensive trip planning system integrated into city group pages with itinerary builder.
- **Recommendations System**: User-generated recommendations with CRUD API, city-based filtering, and a dedicated marketplace page.
- **Housing System**: Connection-based marketplace (no payments) with property listings, host/guest onboarding, and Friendship-Based Access Control.
- **Admin Center**: Dashboard for user management, content moderation, analytics, and system health monitoring.
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics, including expert agents (AI Research, UI/UX Design).
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with defined moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: Unified map infrastructure with shared components, Leaflet.js, OpenStreetMap Nominatim API, and custom theming.
- **Location Input System**: Intelligent dual-mode location search with Google Maps Places API and OpenStreetMap Nominatim fallback.
- **Geocoding System**: Production-ready automatic geocoding integrated across platform entities.

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer.
- **Data Sovereignty**: Each system maintains an isolated database.
- **API-First**: All inter-system communication via versioned APIs.
- **Framework**: Adheres to the ESA LIFE CEO 61x21 systematic development methodology.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules.
- **Critical Architecture Decisions**: CommonJS for server modules, JavaScript launcher for TypeScript server via `tsx`, independent frontend builds, 4GB heap allocation, Vite bypass in production, static file serving, disabled React StrictMode in development, and a console cleanup utility for production.
- **Cache Performance**: 90% reduction in perceived latency for user interactions.

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
- **Project Management**: Atlassian Jira
- **Internationalization**: i18next, react-i18next

## Internationalization (i18n) Workflow
The platform supports 68 languages with systematic translation coverage across all UI components.

### Translation Documentation
- **Translation Audit Methodology**: `docs/pages/esa-tools/translation-audit-methodology.md` - Complete workflow for adding new languages
- **i18n Coverage Tracker**: `docs/pages/esa-tools/i18n-coverage.md` - Current status of all 68 languages
- **Language Registry**: `client/src/lib/i18n-languages.ts` - Supported languages configuration

### Top 7 Tango Languages (100% Coverage)
1. 🇺🇸 English (EN) - Base language
2. 🇪🇸 Spanish (ES) - Standard
3. 🇦🇷 Argentine Spanish (es-AR) - Lunfardo/Rioplatense dialect
4. 🇫🇷 French (FR)
5. 🇮🇹 Italian (IT)
6. 🇵🇹 Portuguese (PT)
7. 🇩🇪 German (DE)

### Adding a New Language - Quick Reference
1. **Setup**: Create `client/src/i18n/locales/[lang-code]/common.json`
2. **Audit**: Map all page components and extract translation keys
3. **Translate**: Add all keys with proper pluralization
4. **Test**: Validate across all pages with visual testing
5. **Document**: Update i18n-coverage.md with completion status

For detailed workflow, see Translation Audit Methodology documentation.

## Multi-Agent Learning Framework (ESA 61x21)
The platform uses a systematic 6-phase methodology where all 16 ESA agents learn, audit, and optimize features in parallel, achieving 92% time reduction (8-10 hours vs 128 hours sequential).

### Multi-Agent System Documentation
- **Agent Learning Framework**: `docs/pages/esa-tools/agent-learning-framework.md` - 6-phase methodology (Resource Discovery → Learning → Journey Audit → Architecture Review → Implementation → Quality Gate)
- **Multi-Agent Orchestration**: `docs/pages/esa-tools/multi-agent-orchestration.md` - 16-agent parallel execution strategy with 4-track implementation
- **ESA Master Orchestration**: `ESA_ORCHESTRATION.md` - Updated with multi-agent framework section

### Agent Methodologies (7/16 Complete)
1. **Agent #1 (Performance)**: `docs/pages/esa-tools/performance-audit-methodology.md` - Lighthouse >90, LCP <2.5s, bundle <200KB
2. **Agent #2 (Frontend)**: `docs/pages/esa-tools/frontend-audit-methodology.md` - Smart/Controlled patterns, React Query optimization
3. **Agent #11 (Aurora - UI/UX)**: `docs/pages/esa-tools/design-audit-methodology.md` - Aurora Tide compliance, WCAG 2.1 (100% on Memories ✅)
4. **Agent #13 (Media)**: `docs/pages/esa-tools/media-audit-methodology.md` - WebP 100%, >70% compression, lazy loading
5. **Agent #14 (Code Quality)**: `docs/pages/esa-tools/code-quality-audit-methodology.md` - TypeScript 95%, ESLint 0 errors, security 0 vulnerabilities
6. **Agent #15 (Developer Experience)**: `docs/pages/esa-tools/dx-audit-methodology.md` - Test coverage >80%, docs 100%, HMR <2s
7. **Agent #16 (Translation)**: `docs/pages/esa-tools/translation-audit-methodology.md` - 68 languages, missing keys detection

### Aurora Tide Design System Workflow
- **Design Coverage Tracker**: `docs/pages/esa-tools/design-coverage.md` - Platform-wide design token, accessibility, dark mode tracking
- **Aurora Tide Design System**: `docs/pages/design-systems/aurora-tide.md` - Complete design system reference
- **Enhancement Process**: `docs/pages/design-systems/aurora-tide-enhancement-process.md` - 10-Designer Critique + 4-Track parallel execution

### Core Aurora Tide Components
1. **GlassCard** - Glassmorphic depth system (depth 1-4)
2. **Framer Motion** - FadeIn, ScaleIn, SlideIn animations
3. **Micro-interactions** - MagneticButton, RippleCard, PulseIcon, ParticleButton
4. **GSAP Scroll** - useScrollReveal for scroll-triggered animations
5. **Design Tokens** - Ocean palette (seafoam, cyan, teal) + 3-layer token system

### Design Enhancement - Quick Reference
**⚠️ CRITICAL: Visual-Only Changes (NO Backend, NO Logic Changes)**

1. **Pre-Enhancement Snapshot** (REQUIRED for rollback):
   - Create snapshot: Document current state, git commit hash, files to modify
   - Rollback command: `git checkout [commit-hash]`
   
2. **10-Designer Critique**: Analyze page through UX, Visual, Interaction, Accessibility, Content, Mobile, Performance, Brand, Growth, System perspectives

3. **4-Track Parallel Enhancement**:
   - Track A: GlassCard wrappers, ocean tokens (visual layer only)
   - Track B: Micro-interactions (additive only)
   - Track C: Accessibility + responsive (ARIA, keyboard nav)
   - Track D: Content polish (microcopy, empty states)

4. **Implementation Rules**:
   - ✅ Wrap components (don't replace)
   - ✅ Add visual layers (additive approach)
   - ❌ NEVER change backend logic, APIs, or data flow
   - ❌ NEVER modify component props/interfaces
   - ❌ NEVER refactor working state management

5. **Validation**: Zero functionality regressions, 100% features preserved, visual-only verified

For detailed workflow, see Design Audit Methodology documentation.

### Agent Ownership
- **Agent #11 (Aurora)**: UI/UX Design Expert - Manages Aurora Tide compliance
- **Agent #16 (Translation)**: i18n Expert - Reports to Aurora for UI consistency