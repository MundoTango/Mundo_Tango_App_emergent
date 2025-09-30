# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Overview

This project is a comprehensive digital ecosystem consisting of an AI-powered life management system (Life CEO) and independent, data-isolated social community platforms, beginning with Mundo Tango. The Life CEO System utilizes 16 specialized AI agents for personalized life management with a mobile-first, voice-controlled approach. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer facilitates secure, API-based communication while maintaining data isolation. The platform prioritizes security, performance, and user experience, built on the ESA LIFE CEO 61x21 framework, ensuring a systematic development approach across 61 layers and 21 phases. It incorporates a global payment system, advanced internationalization, comprehensive administrative controls, and AI-powered performance optimization. The project is production-ready with full AI integration, PWA capabilities, and enterprise-grade security.

## Recent Changes

*This section tracks significant recent modifications to the project*

### September 30, 2025 - Media Upload System & Events Implementation

**PostCreator Media Upload Fixes** ✅ **PRODUCTION READY**
- **Progress Bar Communication**: Added `onProgress` callback to InternalUploader for real-time upload progress display
- **Video Thumbnail Extraction**: Created `extractVideoThumbnail` utility that extracts first frame from videos as preview thumbnails
  - Comprehensive fallback handling: never rejects, always returns usable preview
  - 5-second timeout protection to prevent hangs
  - Graceful fallbacks for canvas errors, metadata failures, and load errors
- **Upload Hang Fix (25% issue)**: Disabled Web Workers in image compression
  - Root cause: `browser-image-compression` with `useWebWorker: true` tried to load worker.js that Vite couldn't find
  - Changed `useWebWorker: false` in both mediaCompression.ts and advancedMediaProcessor.ts
  - Uploads now complete smoothly without hanging during processing phase
- **Upload-to-Post Integration Fix** ✅ **CRITICAL BUG FIXED**
  - **Root Cause**: Custom onSubmit handler in PostCreator sent `media: mediaFiles` but not `internalMediaUrls`
  - **Fixed**: Added `internalMediaUrls` to onSubmit data object and TypeScript type definition
  - **State Management**: Added proper state reset for `internalMediaUrls` after submission
  - **ESAMemoryFeed Integration**: Routes internal URLs to `/api/posts/direct` with proper error handling
  - **Error Handling**: Added `res.ok` check, user-facing toast notifications, and modal persistence on errors
  - **Complete Flow**: Upload → Preview → Submit → Post Creation with Media ✅ Working
- **Media Display Pipeline**: Verified complete data flow from upload → storage → display
  - Backend saves to `mediaEmbeds` field (JSONB array)
  - Storage queries explicitly include `mediaEmbeds`
  - EnhancedPostItem renders all media with proper type detection
- **Files Modified**:
  - `client/src/components/upload/InternalUploader.tsx` (progress callbacks)
  - `client/src/components/universal/PostCreator.tsx` (internalMediaUrls integration, type definitions)
  - `client/src/pages/ESAMemoryFeed.tsx` (direct endpoint routing, error handling)
  - `client/src/utils/videoThumbnail.ts` (new utility with resilient error handling)
  - `client/src/utils/mediaCompression.ts` (disabled Web Workers)
  - `client/src/utils/advancedMediaProcessor.ts` (disabled Web Workers)
- **Architect Review**: All fixes approved with comprehensive validation

**4-State RSVP System with UpcomingEventsSidebar** ✅ **PRODUCTION READY**
- **Complete RSVP States**: Going (✅), Interested (⭐), Maybe (❓), Not Going (❌)
- **Fixed Critical Bugs**: 
  - Optimistic update logic (changed `old?.data` to `old` for proper array handling)
  - Attendee count increment/decrement based on status changes (only "going" counts)
  - Added missing "interested" status with Star icon
  - **Double-Stringify Bug** ✅ **FIXED** (Sept 30, 2025):
    - **Issue**: RSVP mutations were double-stringifying JSON body, causing malformed requests
    - **Root Cause**: `UpcomingEventsSidebar.tsx` called `JSON.stringify({ status })` before passing to `apiRequest`, which also stringified
    - **Fix**: Changed `body: JSON.stringify({ status })` to `body: { status }` - let apiRequest handle stringification
    - **Result**: RSVP updates now work correctly, status changes persist to database
- **Smart Categorization** (reordered as requested):
  1. RSVP'ed Events (events user responded to)
  2. In Your City (user's home city events)
  3. Events You Follow (from followed organizers/groups)
  4. Cities You Follow (events in tracked cities)
- **ESA Ocean Theme Integration**:
  - Deep ocean titles (#0B3C49), medium ocean text (#146778), turquoise gradients
  - Glassmorphic event cards with backdrop blur
  - Collapsible sections with aqua backgrounds
- **Accessibility Features**:
  - All buttons have aria-labels
  - Loading states during mutations (disabled with opacity reduction)
  - Full keyboard navigation support
- **API Integration**: `POST /api/events/:id/rsvp` with Zod validation
- **Documentation**: Created comprehensive docs (UpcomingEventsSidebar.md, EventRSVP.md)
- **ESA Layer 26**: Events & Calendar Agent marked as complete in framework index
- Consolidated duplicate components (NewFeedEvents.tsx archived)
- **RSVP Toggle Functionality** ✅ **COMPLETE** (Sept 30, 2025):
  - **Frontend Event Detail Page** (`client/src/pages/event-detail.tsx`):
    - Fixed double-stringify bug (changed `body: JSON.stringify({ status })` to `body: { status }`)
    - Added toggle behavior: clicking same status sends `null` to remove RSVP
    - Implemented optimistic UI updates with onMutate for instant visual feedback
    - Added ocean-themed gradient styling for selected states (#14b8a6 to #06b6d4)
    - Disabled buttons during mutation with isPending state
  - **Frontend Sidebar** (`client/src/components/esa/UpcomingEventsSidebar.tsx`):
    - Updated mutation to accept `null` status for toggle removal
    - Modified handleRSVP to compare current status and send null if matching
    - Updated all three RSVP buttons (Going, Interested, Maybe) with toggle logic
    - Enhanced toast messages to show "RSVP Removed" when toggling off
  - **Backend Event Details** (`server/routes/eventsRoutes.ts`):
    - Modified `/api/events/:id` endpoint to return `userStatus` field
    - Added join query to `event_rsvps` table for authenticated user's current RSVP
    - Returns `null` if user hasn't RSVP'd, otherwise returns their status
  - **Backend RSVP Handler** (`server/routes/eventsRoutes.ts`):
    - Updated Zod schema to accept `nullable()` status
    - Added logic to handle `status === null` by deleting RSVP record from database
    - Maintains existing upsert logic for valid status values
  - **Complete Flow**: Click status → highlight with gradient → click again → remove highlight and delete from DB ✅ Working
  - **Result**: Status now persists correctly, displays on event detail page, and supports toggle on/off behavior

**Location Input System Consolidation**
- Created `LocationInput.tsx` wrapper with intelligent Google Maps API detection
- Automatic fallback to SimplifiedLocationInput when API unavailable
- Consolidated 20+ scattered location input implementations into 2 primary components
- Successfully migrated 5 critical files (ProfileLocationEditor, GoogleMapsLocationPicker, ModernPostCreator, MemoryCreationForm, CreateEventDialog)
- Eliminated code duplication and maintenance burden
- Documented comprehensive consolidation strategy in `docs/LOCATION_INPUT_CONSOLIDATION_AUDIT.md`

**Treasure Map Explorer Enhancement**
- Integrated location search directly into recommendation dropdown for seamless UX
- Adventure-themed UI with compass rose animations and vintage map aesthetics
- Location input now appears inside treasure map interface (no external popups)
- Updated documentation in `docs/pages/social/recommendations.md` and `docs/pages/esa-layers/layer-24-social-features.md`

## User Preferences

Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference the ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md document as the authoritative framework guide.
For platform audits, use ESA_COMPREHENSIVE_PLATFORM_AUDIT.md as the deployment readiness checklist.

## System Architecture

The platform employs a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

**UI/UX Decisions:**
- **Design System**: "MT Ocean Theme" with glassmorphic elements and turquoise-to-cyan gradients.
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
- **Internationalization**: Full 73-language support with OpenAI-powered translations, Lunfardo integration, progressive loading, and comprehensive coverage.
- **Payments**: Full Stripe integration.
- **Media Upload System**: Hybrid approach with YouTube/Vimeo URLs, Cloudinary uploads, and server uploads with client-side compression.

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds including friendship status. Entity-specific post navigation for users, events, groups, and cities.
- **Community Management**: City-specific groups, event management, housing listings, and recommendations.
- **Admin Center**: Dashboard for user management, content moderation, analytics, and system health.
- **AI Integration**: 16 Life CEO agents with semantic memory and self-learning capabilities; AI-powered analytics.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: Interactive maps for community features and host onboarding.
- **Automations**: Automated city/professional group assignment and geocoding.
- **Navigation**: Unified top navigation bar and refactored sidebar.

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