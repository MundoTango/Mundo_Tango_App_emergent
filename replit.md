# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA Framework (105 Agents, 61 Layers), the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference **docs/platform-handoff/esa.md** as the primary entry point.
**CRITICAL:** New agents must be added to ESA_AGENT_ORG_CHART.md (see ESA_NEW_AGENT_GUIDE.md Step 5).

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
- **Self-Hosted Project Tracker (Agent #65)**: Complete replacement for Jira with bidirectional GitHub integration (Epic/Story/Task hierarchy, agent assignment, code linking, and automated sync between stories↔issues and tasks↔PRs).
- **Comments System (Agent #65)**: Rich collaboration features with @mentions, threading (parent/child), file attachments, edit tracking, and activity feed integration.
- **ESA Interactive Dashboard (/admin/esa-dashboard)**: Visual navigation system for the ESA Framework featuring 6 interactive views (Agent Orchestration, Communication Flow, Training Execution, Audit Workflow, System Map, Decision Authority). Includes live metrics, breadcrumb navigation, contextual tooltips with doc links, and Aurora Tide glassmorphic design. Replaces manual documentation reading with intuitive visualization.
- **ESA Floating Quick Navigator**: Globally accessible floating button in admin areas with magnetic interactions. Provides Quick Navigator Overlay featuring live stats (105 agents, 61 layers, training progress), instant agent search, context-aware suggestions, 4 quick actions (Full Dashboard, Org Chart, 17-Phase Audit, Training Status), and agent hierarchy preview. Built with Aurora Tide glassmorphic design and MT Ocean gradients.

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer with isolated databases and API-first communication.
- **Framework**: Adheres to the ESA Framework (105 Agents, 61 Layers) systematic development methodology with comprehensive orchestration and training infrastructure.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules.
- **Agent Training**: Utilizes an "Ultra-Micro Parallel Methodology" for rapid agent training and certification, focusing on atomic task decomposition and real production work.
- **Project Management**: Migrated from Jira to a self-hosted project tracker (Agent #65) with GitHub integration. Includes multiple view modes (Dashboard, Kanban, List, Sprint) and a rich comments system.
- **105-Agent Organizational Structure**: A complete training infrastructure is built for 105 agents, including Meta-agents, Division Chiefs, Domain Coordinators, Layer Agents, Expert Agents, Operational Agents, and Life CEO Sub-Agents, with detailed documentation and protocols.
- **17-Phase Tiered Audit System (Oct 2025)**: Comprehensive audit framework replacing fragmented methodology with unified 5-tier structure (Foundation → App Layer → Quality → UX → Deployment). Features 17 specialized phases across sequential and parallel execution tiers, orchestrated by Agent #0 and Domain #9. Optimized 90-120 minute execution with clear dependency gates. Master reference: esa.md Section 5.
- **Open Source Deployment Verification (Agent #59)**: Automated tracking and validation of open-source components against a 5-criteria deployment checklist, integrated into every page audit (Phase 15). Includes an Admin Dashboard, automated workflows for training and consolidation, and ESLint integration for enforcing standards.

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
- **Version Control Integration**: GitHub OAuth via Replit connection, @octokit/rest for API access, bidirectional sync service