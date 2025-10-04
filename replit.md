# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Overview

This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms, beginning with Mundo Tango. The Life CEO System leverages 16 specialized AI agents for personalized life management with a mobile-first, voice-controlled interface. Community Platforms provide social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform emphasizes security, performance, and user experience, incorporating a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences

Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference the ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md document as the authoritative framework guide.
For platform audits, use ESA_COMPREHENSIVE_PLATFORM_AUDIT.md as the deployment readiness checklist.

## System Architecture

The platform utilizes a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

**UI/UX Decisions:**
- **Design System**: "MT Ocean Theme" with glassmorphic elements and turquoise-to-blue gradients. It uses a comprehensive design token system for styling, ensuring a single source of truth.
- **Responsiveness**: Mobile-first design approach.
- **Interaction**: Incorporates micro-interactions such as ripple effects, magnetic buttons, confetti, and particle effects.
- **Theming**: Features a comprehensive theming system for site-wide visual transformations.

**Technical Implementations:**
- **Frontend**: React with functional components, hooks, React Query, and context APIs.
- **Backend**: Node.js with Express.js and TypeScript.
- **Real-time**: WebSocket communication via Socket.io.
- **Authentication**: JWT and session-based authentication with RBAC/ABAC using `@casl/ability`.
- **Database Interaction**: Drizzle ORM for PostgreSQL.
- **Container Orchestration**: Docker stack.
- **Automation Platform**: n8n integration.
- **Automated Testing**: Utilizes TestSprite AI.
- **Performance**: Implements lazy loading, route prefetching, virtual scrolling, image lazy loading, request batching, and an AI-powered performance agent.
- **Internationalization**: Translation generation is functional (68 languages via OpenAI), but UI integration for language switching and component re-rendering is pending.
- **Payments**: Full Stripe integration.
- **Media Upload System**: Hybrid approach supporting YouTube/Vimeo URLs, Cloudinary, and direct server uploads with client-side compression.

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles including community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds with entity-specific post navigation.
- **Community Management**: Features city-specific groups, event management with RSVP, housing listings, and recommendations. Group posts tab redesigned for enhanced user experience and architectural unification with the main feed.
- **Housing System**: Complete marketplace with property listings, host/guest onboarding, city-filtered housing on group pages, and map integration. **Documentation unified** (October 4, 2025) with comprehensive hub at `docs/pages/housing/index.md` covering marketplace, group integration, onboarding flows, and MT Ocean theme implementation. All housing components use CDN-free HousingMap with turquoise gradient markers. **Friendship-Based Access Control** (October 2025): Production-ready system enabling hosts to restrict property bookings by friendship connection degree (1st/2nd/3rd) or custom closeness scores (0-100). Uses numeric connection degree standard (1/2/3) with temporal decay algorithm. Includes ConnectionInfoPanel, ConnectionBadge, BookingRestrictionsCard UI components, and three API endpoints (connection-info, booking-restrictions, enhanced booking validation). Full documentation at `docs/api/friendship-housing-api.md`.
- **Tango World Map**: Interactive map showing global tango communities with Leaflet.js, featuring color-coded markers, map legend, statistics, and city search.
- **Admin Center**: Provides a dashboard for user management, content moderation, analytics, and system health monitoring.
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics.
- **Security**: Implements Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with defined moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: **Unified map infrastructure** with shared components (`UnifiedMapBase`, `UnifiedMapLegend`) powered by Leaflet.js. All maps use local icon files (`/leaflet/`) instead of CDN for production reliability. Features automatic geocoding via OpenStreetMap Nominatim API (2 req/sec, 24hr caching), custom MT Ocean Theme gradient markers, and pre-built filter components. Maps implemented: EventMap, HousingMap, Tango World Map. 
- **Geocoding System**: **Production-ready automatic geocoding** integrated across platform entities (events, housing, recommendations, city groups). Uses `CityAutoCreationService` for OpenStreetMap Nominatim API integration with intelligent caching, rate limiting (500ms/2 req/sec), and error handling. Events automatically geocoded on creation/update with coordinates stored in database. Schema-ready for housing/recommendations awaiting endpoint implementation. Comprehensive documentation at `docs/pages/geocoding-system/`.
- **Automations**: Automated city/professional group assignment and geocoding services. Events are automatically geocoded on creation and via bulk admin endpoint.
- **Navigation**: Features a unified top navigation bar and refactored sidebar.
- **Testing Infrastructure**: Comprehensive test coverage, especially for Memories Feed components, with end-to-end tests and real database integration.

**System Design Choices:**
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer.
- **Data Sovereignty**: Each system maintains an isolated database.
- **API-First**: All inter-system communication is via versioned APIs with consistent data contracts.
- **Framework**: Adheres to the ESA LIFE CEO 61x21 systematic development methodology.
- **PWA**: Progressive Web App capabilities for an optimized mobile experience.
- **Unified Map Architecture** (October 2025): **100% CDN-free map infrastructure** achieved by migrating all Leaflet maps to local assets. Eliminated code duplication across all maps by creating shared utilities (`client/src/utils/leafletConfig.ts`), reusable base components (`UnifiedMapBase`, `UnifiedMapLegend`), and centralized filter management hooks (`useMapFilters`). **All map components now use `initializeLeaflet()` for local icon loading** - zero CDN dependencies for production reliability. Maps migrated: EventMap, HousingMap, WorldMap, LeafletMap, EnhancedCommunityMap, CommunityMapWithLayers, LocationStep. All maps feature consistent MT Ocean Theme gradients (turquoise-cyan-purple spectrum), unified marker creation, and shared error handling. Geocoding integrated via `CityAutoCreationService` with OpenStreetMap Nominatim API. **ESA 61x21 standard: Local-first architecture with zero external icon dependencies.**
- **Critical Architecture Decisions**: Includes using CommonJS for server modules, JavaScript launcher for TypeScript server via `tsx`, independent frontend builds, 4GB heap allocation with garbage collection, Vite bypass in production, static file serving, disabled React StrictMode in development, and a console cleanup utility for production.

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