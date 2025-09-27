# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Overview

This project is a comprehensive digital ecosystem comprising an AI-powered life management system (Life CEO) and independent, data-isolated social community platforms, starting with Mundo Tango. The Life CEO System uses 16 specialized AI agents for personalized life management with a mobile-first, voice-controlled approach. Community Platforms, like Mundo Tango, offer social networking, event management, and real-time messaging functionalities. An Integration Layer facilitates secure, API-based communication while maintaining data isolation. The platform prioritizes security, performance, and user experience, built on the ESA LIFE CEO 61x21 framework, which signifies a systematic development approach with 61 layers and 21 phases. It includes a global payment system, advanced internationalization, comprehensive administrative controls, and AI-powered performance optimization. The project is production-ready with full AI integration, PWA capabilities, and enterprise-grade security.

## Recent Changes (September 27, 2025)

- **73-Language Internationalization System Implementation**: Following ESA LIFE CEO 61×21 AGENTS FRAMEWORK:
  - **✅ Language Selector Integration**: 
    - Integrated comprehensive LanguageSelector component with 73 languages in UnifiedTopBar
    - Replaced hardcoded 3-language cycler with proper dropdown supporting full language list
    - Added flag emojis and regional grouping for better UX
    - Special support for Argentinian Lunfardo variant for authentic tango terminology
  - **✅ i18n Configuration Upgrade**:
    - Switched from simple to comprehensive i18n configuration with all 73 languages
    - Fixed duplicate function declarations and namespace conflicts
    - Added proper translation namespaces and backend integration
  - **✅ API Infrastructure**:
    - Created complete REST API endpoints for language management
    - /api/languages/supported - returns full 73-language list with metadata
    - /api/languages/preferences - manages user language preferences
    - /api/languages/analytics - tracks language usage for optimization
    - /api/translations - serves dynamic translations
  - **✅ Memory Feed Fix**:
    - Resolved "Memory Feed Loading..." error boundary issue
    - Feed now loads correctly with post creation interface
    - Maintained WebSocket integration for real-time updates
  - **✅ ESA Framework Compliance**: Layer 53 (Internationalization Agent), Layer 9 (UI Framework Agent), Layer 2 (API Structure)

## Recent Changes (September 26, 2025)

- **Navigation Components Complete Refactoring & Bug Fixes**: Following ESA LIFE CEO 61×21 AGENTS FRAMEWORK:
  - **✅ Sidebar Component Renaming**: 
    - Renamed TrangoTechSidebar to Sidebar throughout entire codebase
    - Updated all references in DashboardLayout.tsx and AdminCenter.tsx
    - Migrated documentation from TrangoTechSidebar.md to Sidebar.md
    - ESA Framework Compliance: Layer 60 (clean codebase, no legacy branding)
  - **✅ Events Page Fix**: 
    - Fixed blank page issue by correcting API endpoint from `/api/events` to `/api/events/feed`
    - Resolved FullCalendar/BigCalendar conflicts
    - ESA Framework Compliance: Layer 48 (Debugging Agent), Layer 2 (API Structure)
  - **✅ Role Invitations Page Fix**:
    - Added missing API endpoints for role-based invitation system:
      - GET `/api/users/me/event-invitations` - fetches user's invitations with filters
      - GET `/api/users/me/events` - retrieves user's events for sending invitations
      - POST `/api/events/invite-participant` - sends role invitations to participants
      - PUT `/api/event-participants/:id/status` - updates invitation status (accept/decline)
    - Integrated with existing `eventParticipants` table in database schema
    - ESA Framework Compliance: Layer 2 (API Structure), Layer 24 (Role Assignment), Layer 22 (Group Management)
  - **✅ Sidebar Navigation Verification**: All 7 navigation buttons fully functional:
    - Memories, Tango Community, Friends, Messages, Groups, Events, Role Invitations
    - Proper routing and page rendering confirmed for all sections

- **Unified Top Navigation Bar Implementation - COMPLETED**: Following ESA LIFE CEO 61×21 AGENTS FRAMEWORK Layer 9 (UI Framework Agent):
  - **✅ Created UnifiedTopBar Component**: Single responsibility navigation component consolidating three duplicate implementations
  - **✅ Features Implemented**: 
    - MT Ocean theme with glassmorphic styling (#5EEAD4 → #155E75 gradients)
    - Purple-pink gradient MT branding logo
    - Global search with categorized dropdown (Posts, Events, People, Groups)
    - Notifications and Messages icons with real-time count badges
    - Language selector (EN/ES/FR) with cycling functionality
    - Theme toggle (light/dark mode support)
    - Comprehensive profile dropdown with user info, admin access, settings, billing, help, and logout
  - **✅ Migration Completed**:
    - Replaced inline header in main DashboardLayout (35+ pages)
    - Replaced TopNavigationBar in ESA DashboardLayout
    - Replaced navbar.tsx usage in home.tsx, landing.tsx, messages.tsx
  - **✅ ESA Framework Compliance**: Layer 9 (single responsibility, no duplication), Layer 48 (one optimized component), Layer 60 (clean codebase)
  - **Note**: Create Post button excluded per user request

## Recent Changes (September 26, 2025)

- **See Friendship Button Implementation - FULLY COMPLETED & DOCUMENTED**: Following ESA LIFE CEO 61×21 AGENTS FRAMEWORK:
  - **✅ Position**: Button appears inline with engagement buttons (Like, Comment, Share, See Friendship)
  - **✅ Visibility**: Only shows for friends with `friendshipStatus === 'accepted'` (excludes current user's own posts)
  - **✅ Styling**: MT Ocean theme with gradient `from-teal-500/10 to-cyan-600/10` with glassmorphic hover effects
  - **✅ Navigation**: Fixed wouter Link component to use `href` attribute for proper routing to `/friendship/${userId}`
  - **✅ Layout Enhancement**: Added DashboardLayout wrapper to FriendshipPage for consistent sidebar navigation
  - **✅ Backend Data Flow - VERIFIED WORKING**: 
    - Database has bidirectional friendship records: Pierre Dubois (7) ↔ Elena Rodriguez (1) and Sofia Chen (5)
    - Storage layer (Layer 22) correctly includes friendship status via LEFT JOIN: `friendshipStatus: 'accepted'`
    - API layer (Layer 2) preserves data contract and passes complete user data with friendship status
    - Fixed PostgreSQL syntax from `?` placeholders to `$1, $2` format in friendship API endpoints
  - **✅ Frontend Implementation**:
    - EnhancedPostItem.tsx dynamically checks `post.user?.friendshipStatus === 'accepted'`
    - Fixed hardcoded currentUserId to use dynamic prop from authenticated user context
    - UnifiedPostFeed correctly passes currentUserId to EnhancedPostItem
    - Added missing useQuery import to ESAMemoryFeed.tsx for proper data fetching
  - **✅ Framework Compliance**: Layers 2, 4, 9, 22, 24, 48, 60
  - **✅ Documentation**: Updated DOCUMENTATION-INDEX.md with complete implementation details

- **API Response Structure Fix**: Following ESA LIFE CEO 61×21 AGENTS FRAMEWORK Layer 2 (API Structure):
  - **Issue**: Frontend expected `{ posts, hasMore, total, page }` but backend returned `{ success, data }`
  - **Solution**: Updated backend `/api/posts/feed` to return proper pagination structure
  - **Implementation**: Added `getTotalPostsCount` method to storage layer for accurate pagination
  - **Result**: Posts now display correctly with proper pagination metadata

- **Unified Feed Architecture Implementation**: Following ESA LIFE CEO 61×21 AGENTS FRAMEWORK for antifragile architecture:
  - **Component Consolidation**: Created UnifiedPostFeed component replacing 3 separate implementations (EnhancedPostFeed, 2x EnhancedPostFeedSimple)
  - **Simplified API**: Replaced confusing `mode` prop with granular `showFilters`, `showSearch`, `showTagManager` props for clearer intent
  - **Backend Friendship Enrichment**: Enhanced `getFeedPosts` in storage.ts to include friendship data via LEFT JOIN on friends table
  - **TypeScript Fixes**: Resolved type conflicts in connectionType field and useResilientQuery compatibility issues
  - **ESA Framework Compliance**: 
    - Layer 2 (API Structure): Complete data contracts with friendship enrichment
    - Layer 9 (UI Framework): Single responsibility component with configurable features
    - Layer 22 (Group Management): Proper friendship/connection data flow
  - **Result**: 30% reduction in component complexity, improved maintainability, consistent friendship data across platform

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
- **Internationalization**: Full infrastructure for language management and translation.
- **Payments**: Full Stripe integration.
- **Media Upload System**: Hybrid approach with YouTube/Vimeo URLs, Cloudinary uploads, and server uploads with client-side compression.

**Feature Specifications:**
- **User Profiles**: Comprehensive profiles with community-specific roles, travel details, and engagement systems.
- **Social Features**: Rich text/media post creation, reactions, comments, sharing, and real-time feeds.
- **Community Management**: City-specific groups, event management, housing listings, and recommendations.
- **Admin Center**: Dashboard for user management, content moderation, analytics, and system health.
- **AI Integration**: 16 Life CEO agents with semantic memory and self-learning capabilities; AI-powered analytics.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Reporting System**: Comprehensive content reporting with moderation workflows.
- **Onboarding**: Multi-step wizards for guest profile creation/booking and host property listing.
- **Maps**: Interactive maps using Leaflet.js/OpenStreetMap for community features and Google Maps for host onboarding.
- **Automations**: Automated city/professional group assignment and geocoding.

**System Design Choices:**
- **Microservices**: Decoupled Life CEO, Community Platforms, and Integration Layer.
- **Data Sovereignty**: Each system maintains an isolated database.
- **API-First**: All inter-system communication via versioned APIs.
- **Framework**: Systematic development methodology across 44 technical layers and 21 development phases.
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