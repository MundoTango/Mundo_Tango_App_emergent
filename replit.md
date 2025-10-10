# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference **docs/platform-handoff/ESA_ORCHESTRATION.md** as the primary entry point.

## System Architecture
The platform utilizes a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

### UI/UX Decisions
- **Design System**: "MT Ocean Theme" with glassmorphic elements, turquoise-to-blue gradients, comprehensive design tokens, GSAP scroll reveals, Framer Motion, magnetic/ripple micro-interactions, and an international icon/tooltip system (6 languages). Adheres to Aurora Tide design system for component usage, accessibility (WCAG 2.1), dark mode/i18n coverage. Mobile-first design approach.

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
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics, including expert agents (AI Research, UI/UX Design).
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Comprehensive Audit System**: Automated, multi-layer audit system for continuous quality improvement, including page audits and open-source management.

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer with isolated databases and API-first communication.
- **Framework**: Adheres to the ESA LIFE CEO 61x21 systematic development methodology.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules.
- **Multi-Agent Learning Framework (ESA 61x21)**: Uses a systematic 6-phase methodology with 100 agents (1 CEO + 6 Division Chiefs + 9 Core Domains + 61 Layer Agents + 7 Experts + 16 Life CEO) learning, auditing, and optimizing features in parallel.
- **Agent Organizational Structure**: Matrix organization with dual reporting (strategic to Division Chiefs, operational to Domain Coordinators) enabling both strategic alignment and operational efficiency.
- **Ultra-Micro Parallel Subagent Methodology**: Proven 3-phase strategy (Discovery → Fix → Validation) achieving 10x speed improvement through atomic task decomposition. Subagents execute micro-tasks (single file, single operation), main agent handles fixes and validation.

## ESA Framework Documentation

### Quick References
When working with the ESA framework, use these entry points:

#### Primary Documentation
- **ESA_ORCHESTRATION.md** - Master entry point for all ESA documentation (docs/platform-handoff/)
- **ESA.md** - ESA 61x21 framework foundation with all 61 layers and 21 phases (docs/platform-handoff/)

#### Agent Organization (100 Agents)
- **ESA_AGENT_ORG_CHART.md** - Complete hierarchical structure: 1 CEO + 6 Chiefs + 9 Domains + 61 Layers + 7 Experts + 16 Life CEO (docs/platform-handoff/)
- **ESA_AGENT_A2A_PROTOCOL.md** - Agent-to-Agent communication protocol with escalation paths (docs/platform-handoff/)
- **ESA_AGENT_TRAINING_STATUS.md** - Training progress tracker for all 100 agents (docs/platform-handoff/)

#### Agent Training & Methodologies
- **ESA_NEW_AGENT_GUIDE.md** - Complete framework for building world-class ESA agents with 6-phase methodology and "10 Experts" research (docs/platform-handoff/)
- **Layer Methodologies** - 61 dedicated methodology files, one per ESA layer (docs/platform-handoff/layer-[X]-*.md)

#### Quick Start Guides
- **QUICK_START.md** - 15-minute platform overview (docs/platform-handoff/)
- **TROUBLESHOOTING.md** - ESA layer-mapped issue resolution (docs/platform-handoff/)
- **TESTING_GUIDE.md** - Comprehensive testing strategy (docs/platform-handoff/)
- **DEPLOYMENT_GUIDE.md** - 61-layer validation for production (docs/platform-handoff/)
- **SECURITY_CHECKLIST.md** - Layer-by-layer security verification (docs/platform-handoff/)

### Agent Hierarchy Summary
```
Agent #0 (ESA CEO/Orchestrator)
├── 6 Division Chiefs (Strategic)
│   ├── Foundation (Layers 1-10)
│   ├── Core (Layers 11-20)
│   ├── Business (Layers 21-30)
│   ├── Intelligence (Layers 31-46)
│   ├── Platform (Layers 47-56)
│   └── Extended (Layers 57-61)
├── 9 Core Domain Coordinators (Operational)
├── 61 Individual Layer Agents (Dual reporting: Chief + Domain)
├── 7 Expert Agents (#10-16: Specialized advisory)
└── 16 Life CEO Sub-Agents (AI life management)
```

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