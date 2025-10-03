# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Overview

This project is a comprehensive digital ecosystem featuring an AI-powered life management system (Life CEO) and independent, data-isolated social community platforms, starting with Mundo Tango. The Life CEO System uses 16 specialized AI agents for personalized life management with a mobile-first, voice-controlled approach. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer facilitates secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, incorporating a global payment system, advanced internationalization, comprehensive administrative controls, and AI-powered performance optimization. It is production-ready with full AI integration, PWA capabilities, and enterprise-grade security, designed for significant market potential and ambitious growth.

## User Preferences

Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference the ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md document as the authoritative framework guide.
For platform audits, use ESA_COMPREHENSIVE_PLATFORM_AUDIT.md as the deployment readiness checklist.

## System Architecture

The platform employs a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

**UI/UX Decisions:**
- **Design System**: "MT Ocean Theme" with glassmorphic elements and turquoise-to-blue gradients (#40E0D0 → #1E90FF → #0047AB).
  - ✅ **Token-Based Architecture** (October 2025): Comprehensive design token system in `client/src/styles/design-tokens.css` with 30+ utility classes for colors, spacing, shadows, typography. Single source of truth for all styling.
  - ✅ **Updated Color Palette** (October 1, 2025): Turquoise (#40E0D0) to Dodger Blue (#1E90FF) to Cobalt Blue (#0047AB) gradient. All colors in modern HSLA format. Dark mode uses cobalt blue family (hsl 218°) for consistency.
  - ✅ **Phase 1 Complete**: Sidebar and UnifiedTopBar fully refactored - zero inline styles, zero JS hover handlers, zero hardcoded hex values. WCAG AA compliant contrast in both light/dark themes.
  - ✅ **Sidebar Profile Section** (October 1, 2025): Fully clickable profile card with navigation to `/profile/{userId}`. Interactive hover states: card scales 1.02x, avatar 1.1x, name changes to turquoise, username brightens. Integrated RoleEmojiDisplay for tango role badges.
  - 📋 **Rollout Guide**: See `docs/design/MT_OCEAN_DESIGN_ROLLOUT.md` for page-by-page implementation strategy (Dashboard/Feed, Profile/Settings, Admin pages pending).
- **Responsiveness**: Mobile-first design.
- **Interaction**: Micro-interactions including ripple effects, magnetic buttons, confetti, and particle effects.
- **Theming**: Comprehensive system supporting site-wide visual transformations and various themes.

**Technical Implementations:**
- **Frontend**: React with functional components, hooks, React Query, and context APIs.
- **Backend**: Node.js with Express.js and TypeScript.
- **Real-time**: WebSocket (Socket.io).
- **Authentication**: JWT-based and session-based with RBAC/ABAC using `@casl/ability`.
- **Database Interaction**: Drizzle ORM for PostgreSQL.
- **Container Orchestration**: Docker stack.
- **Automation Platform**: n8n integration.
- **Automated Testing**: TestSprite AI.
- **Performance**: Lazy loading, route prefetching, virtual scrolling, image lazy loading, request batching, and an AI-powered performance agent.
- **Internationalization**: ⚠️ BROKEN - Translation generation works (68 languages via OpenAI), but UI integration non-functional. Language switching doesn't work, components don't re-render with translations. See docs/pages/esa-layers/layer-53-internationalization.md for details.
- **Payments**: Full Stripe integration.
- **Media Upload System**: Hybrid approach with YouTube/Vimeo URLs, Cloudinary uploads, and server uploads with client-side compression.

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds. Entity-specific post navigation.
- **Community Management**: City-specific groups, event management (with RSVP system), housing listings, and recommendations.
  - ✅ **Group Posts Tab** (October 2, 2025): Fully redesigned with Memories Feed style. Post creator positioned above filter buttons, integrated CleanMemoryCard component for modern post display with colored mention links. Backend API unified across all 5 filter types (residents/visitors/members/non-members/all) to return complete user profile data (username, city, country, tangoRoles) for consistent location and role emoji display matching Memories feed.
  - ✅ **Group Posts Edit/Delete Parity** (October 3, 2025): Fixed edit and delete actions to work identically to Memories feed. Added post normalization to prevent Zod validation errors, implemented local state handlers (handlePostUpdated, handlePostDeleted) to sync UI with mutations, and added onDelete callback to EnhancedPostItem. All post actions (like, comment, share, delete, edit, report) now work correctly in Groups feed across all filter contexts.
  - ✅ **Service Worker API Caching Bug Fix** (October 3, 2025): CRITICAL FIX - Service worker was intercepting and caching ALL `/api/*` requests including 400 error responses, causing Groups page to fail loading. Fixed by modifying both service worker files (`client/public/sw.js` and `public/sw.js`) to skip `/api/*` requests entirely in development, preventing API interception and error response caching. Removed TypeScript syntax that prevented service worker registration. Groups page now loads flawlessly with all features working.
  - ✅ **Complete Architectural Unification** (October 3, 2025): Achieved zero-duplication feed architecture where Groups is truly "Memory Feed filtered by group." Refactored PostFeed to support context-based data fetching (feed/group/profile/event types), eliminating ~430 lines of duplicate code. Both ESAMemoryFeed and GroupDetailPageMT are now thin wrappers passing context to PostFeed, which handles all internal data fetching, pagination, infinite scroll, loading states, and cache invalidation. Fixed critical pagination reset bug ensuring filter/search changes reset to page 1. All post actions (create/edit/delete/like/comment/share) work identically across both feeds with shared mutation logic. Pattern: `<PostFeed context={{type: 'feed'|'group', groupId?, filter?}} />` enables any parent component to render a fully functional feed with zero duplicate state management.
- **Tango World Map**: ✅ Fully functional interactive map at `/community-world-map` showing tango communities worldwide with Leaflet.js. Features: color-coded city markers by member count, map legend, statistics tabs, and city search. See `docs/pages/MUNDO_TANGO_WORLD_MAP.md` for details. Known limitations: role filtering UI present but not server-implemented, N+1 query performance issue.
- **Admin Center**: Dashboard for user management, content moderation, analytics, and system health.
- **AI Integration**: 16 Life CEO agents with semantic memory and self-learning capabilities; AI-powered analytics.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: Interactive maps for community features and host onboarding.
- **Automations**: Automated city/professional group assignment and geocoding.
- **Navigation**: Unified top navigation bar and refactored sidebar.
- **Testing Infrastructure**: ✅ Comprehensive test coverage for Memories Feed components. All 5 components (CleanMemoryCard, VideoMemoryCard, RichTextCommentEditor, FacebookReactionSelector, ReportModal) fully instrumented with data-testid attributes following namespace strategy. 36 end-to-end test cases defined with real PostgreSQL database integration via Drizzle ORM. Test infrastructure complete, authentication integration pending. See `docs/testing/memories-feed-component-testing.md` for details.

**System Design Choices:**
- **Microservices**: Decoupled Life CEO, Community Platforms, and Integration Layer.
- **Data Sovereignty**: Each system maintains an isolated database.
- **API-First**: All inter-system communication via versioned APIs with consistent data contracts.
- **Framework**: Systematic development methodology across 44 technical layers and 21 development phases (ESA LIFE CEO 61x21).
- **PWA**: Progressive Web App capabilities for mobile experience.
- **Critical Architecture Decisions**: CommonJS for server modules, JavaScript launcher for TypeScript server via `tsx`, independent frontend builds, 4GB heap allocation with garbage collection, Vite bypass in production, static file serving for uploads and images, disabled React StrictMode in development, and a console cleanup utility for production.

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