# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Overview

This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences

Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference the **ESA_MASTER_ORCHESTRATION.md** as the primary entry point, which orchestrates:
- ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md (61 layers framework)
- docs/pages/esa-agents/index.md (AI agent system)
- docs/pages/design-systems/aurora-tide.md (design standards)
- ESA_61x21_COMPREHENSIVE_VALIDATION.md (deployment audit)
For platform audits, use ESA_61x21_COMPREHENSIVE_VALIDATION.md as the deployment readiness checklist.

## System Architecture

The platform utilizes a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

**UI/UX Decisions:**
- **Design System**: "MT Ocean Theme" with glassmorphic elements, turquoise-to-blue gradients, comprehensive design tokens, GSAP scroll reveals, Framer Motion, magnetic/ripple micro-interactions, and an international icon/tooltip system (6 languages).
- **Responsiveness**: Mobile-first design approach.
- **Interaction**: Micro-interactions like ripple effects, magnetic buttons, confetti, and particle effects.
- **Theming**: Comprehensive theming system for site-wide visual transformations.

**Technical Implementations:**
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

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds.
- **Community Management**: City-specific groups, event management with RSVP, housing listings, and user-generated recommendations. Includes a unified interactive map with 3-layer filtering.
- **Trip Planner**: Comprehensive trip planning system integrated into city group pages with itinerary builder.
- **Recommendations System**: User-generated recommendations with CRUD API, city-based filtering, and a dedicated marketplace page. AI-powered recommendations are planned for future development.
- **Housing System**: Connection-based marketplace (no payments) with property listings, host/guest onboarding, and Friendship-Based Access Control.
- **Admin Center**: Dashboard for user management, content moderation, analytics, and system health monitoring.
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics. Includes specialized expert agents: AI Research Expert (Agent 10) and UI/UX Design Expert (Agent 11).
- **Design System Management**: Automated Aurora Tide design system monitoring via UI/UX Expert - tracks component usage, accessibility compliance (WCAG 2.1), dark mode/i18n coverage, and suggests optimizations.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with defined moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: Unified map infrastructure with shared components, Leaflet.js, OpenStreetMap Nominatim API, and custom theming.
- **Location Input System**: Intelligent dual-mode location search with Google Maps Places API and OpenStreetMap Nominatim fallback.
- **Geocoding System**: Production-ready automatic geocoding integrated across platform entities.

**System Design Choices:**
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