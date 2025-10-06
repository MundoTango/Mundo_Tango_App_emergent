# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Overview

This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It leverages 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

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
- **Design System**: "MT Ocean Theme" with glassmorphic elements, turquoise-to-blue gradients, and a comprehensive design token system. **Aurora Tide Design System** now unified across housing platform with GSAP scroll reveals, Framer Motion orchestration, glassmorphic components (GlassCard with 4 depth levels), magnetic/ripple micro-interactions, and international icon/tooltip system (6 languages: EN, ES, FR, DE, IT, PT).
- **Responsiveness**: Mobile-first design approach.
- **Interaction**: Incorporates micro-interactions like ripple effects, magnetic buttons, confetti, and particle effects.
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
- **Internationalization**: Functional translation generation (68 languages via OpenAI), with UI integration pending.
- **Payments**: Full Stripe integration.
- **Media Upload System**: Hybrid approach supporting YouTube/Vimeo, Cloudinary, and direct server uploads with client-side compression.

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds with entity-specific post navigation.
- **Community Management**: City-specific groups, event management with RSVP, housing listings, and recommendations. Group posts tab redesigned and unified with main feed architecture.
- **Housing System**: Connection-based marketplace (NO PAYMENTS) with property listings, host/guest onboarding, city-filtered housing, and map integration. Features Friendship-Based Access Control, allowing hosts to restrict bookings by connection degree or closeness scores. Host dashboard at `/host-dashboard` shows all properties with conditional UI for first-time vs existing hosts. **Progress: 9/19 journeys complete (47%)** with full Aurora Tide compliance. Currently implementing Journey 6 (Reviews & Ratings) and Journey 18 (Admin Moderation). 8 additional journeys planned for Q1/Q2 2026 (see `docs/pages/housing/coming-soon.md`).
- **Tango World Map**: Interactive map showing global tango communities with Leaflet.js, color-coded markers, and city search.
- **Admin Center**: Dashboard for user management, content moderation, analytics, and system health monitoring.
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with defined moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: Unified map infrastructure with shared components (`UnifiedMapBase`, `UnifiedMapLegend`) powered by Leaflet.js, using local icon files for CDN-free reliability. Features automatic geocoding via OpenStreetMap Nominatim API, custom MT Ocean Theme gradient markers, and pre-built filter components.
- **Geocoding System**: Production-ready automatic geocoding integrated across platform entities (events, housing, recommendations, city groups) using `CityAutoCreationService` for OpenStreetMap Nominatim API with caching and rate limiting.
- **Automations**: Automated city/professional group assignment and geocoding services.
- **Navigation**: Unified top navigation bar and refactored sidebar.
- **Testing Infrastructure**: Comprehensive test coverage, especially for Memories Feed components, with end-to-end tests and real database integration.

**System Design Choices:**
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer.
- **Data Sovereignty**: Each system maintains an isolated database.
- **API-First**: All inter-system communication via versioned APIs with consistent data contracts.
- **Framework**: Adheres to the ESA LIFE CEO 61x21 systematic development methodology.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets, shared utilities, and reusable base components. All maps use consistent MT Ocean Theme gradients and integrate with the geocoding system.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules to prevent debug components from leaking to production.
- **Critical Architecture Decisions**: CommonJS for server modules, JavaScript launcher for TypeScript server via `tsx`, independent frontend builds, 4GB heap allocation, Vite bypass in production, static file serving, disabled React StrictMode in development, and a console cleanup utility for production.

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