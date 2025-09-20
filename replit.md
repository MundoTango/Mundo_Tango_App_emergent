# Life CEO & Multi-Community Platform (ESA LIFE CEO 61x21)

## Overview

This project is a comprehensive digital ecosystem consisting of a personal AI-powered life management system (Life CEO) and independent, data-isolated social community platforms, starting with Mundo Tango. The Life CEO System utilizes 16 specialized AI agents for various aspects of a user's life, emphasizing mobile-first, voice-controlled interaction, and personalized insights. The Community Platforms, such as Mundo Tango, are independent social networks offering social media functionalities, event management, and real-time messaging. An Integration Layer facilitates secure, API-based communication between the Life CEO System and Community Platforms while maintaining strict boundaries. The platform prioritizes security, performance, and user experience, built upon a robust development framework. Key capabilities include a global payment system, advanced internationalization, comprehensive administrative controls, and AI-powered performance optimization. The platform's development framework, ESA LIFE CEO 61x21, represents "El Sistema de Abrazo" (Evaluate, Solution, Answer framework) with 61 development layers and 21 implementation phases, indicating a systematic and comprehensive approach to its creation. The project is production-ready, with all 21 phases complete, including advanced AI integration, PWA capabilities, and enterprise-grade security.

## Recent Updates (September 20, 2025)

### Memories Feed Edit/Delete Functionality Fixes
- **Unified Composer Implementation**: Replaced ModernPostComposer with EnhancedPostComposer for both create and edit operations, following ESA Layer 7 (Social) and Layer 23 (UX) requirements for unified interface
- **Media Initialization**: Fixed media population in edit mode - existing imageUrl and videoUrl are now properly loaded into mediaEmbeds array
- **Visibility Model Compatibility**: Added handling for both visibility string ('public'|'friends'|'private') and isPublic boolean to ensure backward compatibility
- **User ID Flow Fix**: Preserved original post.userId in ModernPostCard to prevent overriding with nested user.id, fixing delete authorization issues
- **Debug Logging**: Added comprehensive debug logging to PostActionsMenu for diagnosing ownership checks
- **ESA Framework Compliance**: Implementation follows ESA LIFE CEO 61×21 AGENTS Framework requirement for single unified interface - same full-featured composer for both create and edit operations

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
- **Interaction**: Micro-interactions like ripple effects, magnetic buttons, confetti, and particle effects.
- **Theming**: Comprehensive system supporting site-wide visual transformations and various themes.

**Technical Implementations:**
- **Frontend**: React with functional components, hooks, React Query for API state, and context APIs.
- **Backend**: Node.js with Express.js and TypeScript.
- **Real-time**: WebSocket (Socket.io) for live communication.
- **Authentication**: JWT-based and session-based with RBAC/ABAC using `@casl/ability`.
- **Database Interaction**: Drizzle ORM for PostgreSQL.
- **Container Orchestration**: Docker stack for multi-service deployment (app, n8n, postgres, redis, nginx).
- **Automation Platform**: n8n integration for workflow automation.
- **Automated Testing**: TestSprite AI for autonomous testing with high coverage.
- **Performance**: Lazy loading, route prefetching, virtual scrolling, image lazy loading, request batching, and an AI-powered performance agent.
- **Internationalization**: Full infrastructure for language management and translation.
- **Payments**: Full Stripe integration for subscriptions and webhooks.
- **Media Upload System**: Hybrid approach supporting YouTube/Vimeo URLs, direct Cloudinary uploads, and server uploads with client-side compression for images and videos (HEIC/HEIF, MOV, MP4, etc., converted to optimized formats). Server-side protection limits direct uploads to 100MB, while Cloudinary handles larger files.

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
- **Critical Architecture Decisions**: CommonJS for server modules, JavaScript launcher for TypeScript server via `tsx`, independent frontend builds, 4GB heap allocation with garbage collection, Vite bypass in production, static file serving for uploads and images, disabled React StrictMode in development to prevent double map rendering issues, and a console cleanup utility for production.

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