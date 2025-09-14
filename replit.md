# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Platform Identity
**ESA LIFE CEO 61x21** represents:
- **ESA**: El Sistema de Abrazo (The Embrace System) / Evaluate, Solution, Answer framework
- **LIFE CEO**: Life Intelligence Framework & Executive Optimization  
- **61**: 61 Development Layers (complete framework with automation, integration, open source, GitHub, and Supabase expertise)
- **x21**: 21 Implementation Phases (systematic methodology)

## CRITICAL: Platform Version Lock
**LOCKED VERSION: Commit 9cab03b0 (August 10, 2025)**
- Glassmorphic UI with turquoise-to-cyan gradients ("MT Ocean Theme")
- Sidebar navigation: Feed, Memories, Profile, Events, Messages, Friends, Groups
- DO NOT allow Evolution Service to auto-update
- DO NOT use alternate App versions (App.simple.tsx, App.optimized.tsx removed)
- DO NOT use alternate server versions (index-actual.ts removed)

## Overview

This project is a comprehensive digital ecosystem comprising a personal AI-powered life management system (Life CEO) and independent, data-isolated social community platforms, starting with Mundo Tango. The Life CEO System uses 16 specialized AI agents for various aspects of a user's life, emphasizing mobile-first, voice-controlled interaction, and personalized insights. The Community Platforms, such as Mundo Tango, are independent social networks with isolated databases, offering social media functionalities, event management, and real-time messaging. An Integration Layer facilitates secure, API-based communication between the Life CEO System and Community Platforms while maintaining strict boundaries. The platform prioritizes security, performance, and user experience, built upon a robust development framework. Key capabilities include a global payment system, advanced internationalization, comprehensive administrative controls, and AI-powered performance optimization.

**Latest Update (September 14, 2025 - 15:30 UTC)**: ALL 21 PHASES COMPLETE - PRODUCTION READY:
- **ALL 21 PHASES COMPLETE**: Comprehensive platform implementation finished
- **PHASES 11-15**: Testing, Performance, Security, Monitoring, i18n fully operational
- **PHASES 16-20**: PWA, Advanced AI, Payments, Admin Tools, Community Features deployed
- **PHASE 21**: Production optimization, documentation, and launch checklist ready
- **61 LAYER AGENTS**: All 61 ESA layers initialized and operational
- **16 LIFE CEO AGENTS**: Successfully initialized (health-advisor through life-strategist)
- **FEATURES**: Voice interaction, live streaming, video calls, gamification active
- **LANGUAGES**: Spanish, English, Portuguese, French, Italian supported
- **SECURITY**: Enterprise-grade with OAuth 2.0, 2FA, CSRF protection
- **PAYMENTS**: Complete Stripe integration with subscription tiers
- **ADMIN**: Comprehensive dashboard with moderation and analytics
- **MONITORING**: Health checks, metrics, and performance tracking
- **DOCUMENTATION**: Complete API reference, deployment guide, launch checklist
- **STATUS**: Server running successfully on port 5000, ready for production

**Previous Update (September 06, 2025 - 14:40 UTC)**: ESA LIFE CEO 61x21 Emergence.sh Integration Framework Complete:
- **EMERGENCE.SH RESEARCH**: ✅ Complete analysis of Y Combinator-backed agentic vibe-coding platform
- **INTEGRATION STRATEGY**: ✅ GitHub Bridge workflow, Component Library, and API Integration methods documented
- **AGENT COMMANDS**: ✅ Comprehensive templates for Memories, Professional Groups, and Events agents
- **FRAMEWORK UPDATE**: ✅ ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md enhanced with Emergence.sh section
- **INSTRUCTIONS DOCUMENT**: ✅ EMERGENCE_INSTRUCTIONS.md created with copy-paste ready commands
- **PHASE-BASED APPROACH**: ✅ 4-phase development strategy with priority implementation order
- **SUCCESS METRICS**: ✅ Integration speed, code quality, and performance targets defined
- **BRIDGE COMMANDS**: ✅ Integration scripts and continuous sync configuration completed

**Previous Update (August 22, 2025 - 07:15 UTC)**: ESA LIFE CEO 61x21 Autoscale Deployment Ready:
- **DEPLOYMENT TYPE**: ✅ Switched from Docker to Autoscale (avoids 8GB image limit)
- **WORKSPACE OPTIMIZATION**: ✅ Moved heavy directories to /tmp, workspace reduced for deployment
- **BUILD COMMAND**: ✅ `npm ci && NODE_OPTIONS="--max-old-space-size=1024" npm run build && npm prune --production && npm cache clean --force`
- **RUN COMMAND**: ✅ `NODE_OPTIONS="--max-old-space-size=1024" npm run start`
- **PORT CONFIG**: ✅ External Port: 80, Host: 0.0.0.0, server binds correctly
- **HEALTH ENDPOINTS**: ✅ `/healthz` returns "ok", `/health` returns JSON status
- **SECRETS**: ✅ All 17 required secrets verified (Database, Supabase, Stripe, Cloudinary, etc.)
- **SERVER ENTRY**: ✅ server/index-deploy.js configured for production without vite/tsx
- **MEMORY ALLOCATION**: ✅ Set to 1024MB for both build and runtime
- **GIT SIZE**: ⚠️ 1.4GB (protected, cannot optimize further)
- **DEPLOYMENT STATUS**: ✅ **READY FOR AUTOSCALE DEPLOYMENT** - All checks passed

## User Preferences

Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference the ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md document as the authoritative framework guide.
For platform audits, use ESA_COMPREHENSIVE_PLATFORM_AUDIT.md as the deployment readiness checklist.

## Integration Status (January 2025)

### Completed Features
- **Phase 1**: ✅ UnifiedMemories page combining best UI components
- **Phase 2**: ✅ Socket.io real-time features (port 5000)
- **Phase 3**: ✅ AI enhancement with OpenAI service

### Platform Integration Points
- **Server**: Running on port 5000 (fixed server startup error)
- **WebSocket**: Socket.io mounted at server/index-novite.ts
- **Database**: PostgreSQL with Drizzle ORM (17 posts working)
- **Authentication**: JWT with dev bypass when NODE_ENV=development
- **Media Uploads**: Multer to /uploads/posts/{userId}/
- **API Response Format**: { success: boolean, data: any }

### Current Routes
- `/api/posts/*` - CRUD operations for posts
- `/api/posts/:id/enhance` - AI enhancement for existing posts
- `/api/posts/enhance-content` - AI enhancement for new content
- `/api/posts/:id/comments` - Comments system
- `/unified-memories` - Unified UI page

### Modified Files (Assistant's Work)
- `client/src/hooks/useSocket.ts` - Port corrected to 5000
- `server/routes/postsRoutes.ts` - AI endpoints added
- `client/src/components/universal/BeautifulPostCreator.tsx` - AI UI added
- `server/index-novite.ts` - Socket.io mounted (server error fixed)

### Events Agent Requirements (For Emergent)
- Use existing Socket.io on port 5000
- Share PostgreSQL database with Drizzle ORM
- Follow { success, data } API response format
- Use existing auth middleware
- Emit to WebSocket rooms: user:{id}, city:{name}
- MT Ocean theme: #5EEAD4→#155E75

## System Architecture

The platform employs a decoupled, microservices-oriented architecture, separating Life CEO, Community Platforms, and an Integration Layer.

**Critical Architecture Decisions (ESA LIFE CEO 56x21):**
- **Module System**: Server directory uses CommonJS (`server/package.json` with `"type": "commonjs"`) to avoid ES module conflicts
- **Server Bootstrap**: JavaScript launcher spawns TypeScript server via tsx to bypass module loading issues
- **Build Separation**: Frontend built independently with `npm run build`, served from `dist/public`
- **Memory Allocation**: 4GB heap (`--max-old-space-size=4096`) with garbage collection exposed for video uploads
- **Vite Bypass**: Production server runs without Vite dependencies to prevent top-level await errors
- **Static File Serving**: Express serves uploads directory at `/uploads` for profile photos and media, and `/images` for default avatars
- **React StrictMode**: Disabled in development to prevent double map rendering issues (would cause two map instances on community-world-map page)
- **Video Upload System**: Enhanced hybrid approach with three upload methods:
  - **YouTube/Vimeo URL Input**: NEW - Users paste URLs for instant embedding (perfect for 443MB+ videos)
  - **Cloudinary Direct Upload**: Primary cloud solution - videos upload directly from browser to Cloudinary (bypasses server)
  - **Server Upload with Compression**: Limited to 100MB with client-side compression for both images AND videos
  - Client-side video compression using MediaRecorder API (reduces 443MB → ~25MB)
  - Browser-image-compression for images (60-80% size reduction)
  - Server protection: 100MB hard limit prevents memory crashes
  - New `/api/posts/direct` endpoint accepts ONLY metadata (no file upload middleware)
  - Zero memory usage for cloud uploads, no size limits
  - Cloudinary integration active with 25GB free storage/bandwidth
- **Media Preview**: Custom VideoPreview component with thumbnail generation and playback controls
- **Security**: Console cleanup utility hides all internal framework references from browser console in production

**UI/UX Decisions:**
- **Design System**: "MT Ocean Theme" utilizing turquoise to cyan gradients, glassmorphic cards, and consistent typography.
- **Responsiveness**: Mobile-first design for optimal display across all devices.
- **Interaction**: Micro-interactions like ripple effects, magnetic buttons, confetti, and particle effects enhance user engagement.
- **Theming**: A comprehensive system supports site-wide visual transformations and various themes (Business, Personal, Cultural, Agent, Accessibility).

**Technical Implementations:**
- **Frontend**: React with functional components, hooks, React Query for API state, and context APIs for global state. Client-side routing is used.
- **Backend**: Node.js with Express.js for RESTful APIs, utilizing TypeScript for type safety.
- **Real-time**: WebSocket (Socket.io) for live messaging and notifications.
- **Authentication**: JWT-based and session-based (Replit OAuth) authentication with RBAC/ABAC using `@casl/ability`.
- **Database Interaction**: Drizzle ORM for PostgreSQL.
- **Container Orchestration**: Complete Docker stack for multi-service deployment (app, n8n, postgres, redis, nginx). Includes security hardening, health checks, and auto-scaling.
- **Automation Platform**: n8n integration with a dedicated container for workflow automation, including HubSpot CRM sync and email automation.
- **Automated Testing**: TestSprite AI integration for autonomous testing with a 96% coverage target, self-healing capabilities, and performance monitoring.
- **Performance**: Optimizations include lazy loading, route prefetching, virtual scrolling, image lazy loading, request batching, and an AI-powered performance agent.
- **Internationalization**: Full infrastructure for language management and UI/content translation.
- **Payments**: Full Stripe integration for subscriptions, payments, and webhooks.

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, guest profiles, and an engagement system.
- **Social Features**: Post creation with rich text/media, reactions, comments, sharing, and real-time feeds.
- **Community Management**: City-specific groups, event management, housing listings, and recommendations with advanced filtering.
- **Admin Center**: Dashboard for user management, content moderation, analytics, system health, and subscription management.
- **AI Integration**: Life CEO agents with semantic memory, context-aware responses, and self-learning capabilities; AI-powered analytics.
- **Security**: Robust database security with Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: Interactive maps using Leaflet.js/OpenStreetMap for community features; Google Maps for host onboarding.
- **Automations**: Automated city/professional group assignment, geocoding, and integration with registration workflows.

**System Design Choices:**
- **Microservices**: Decoupled Life CEO, Community Platforms, and Integration Layer for scalability.
- **Data Sovereignty**: Each system maintains an isolated database.
- **API-First**: All inter-system communication occurs via versioned APIs.
- **Framework**: Systematic development methodology across 44 technical layers and 21 development phases.
- **PWA**: Progressive Web App capabilities for an enhanced mobile experience.

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
- **Image/Media Handling**: Multer, Pexels API
- **Authentication/Authorization**: jsonwebtoken, bcrypt, @casl/ability
- **UI Framework**: React, Tailwind CSS, shadcn/ui, Radix UI, Material-UI (MUI)
- **Date/Time Utilities**: moment.js, date-fns
- **PDF Generation**: jsPDF, html2canvas
- **Data Visualization**: Recharts
- **Forms**: react-hook-form
- **Email Service**: Resend
- **Analytics**: Plausible Analytics
- **Project Management**: Atlassian Jira