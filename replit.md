# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA Framework (113 Agents, 61 Layers), the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

**Agent Count:** 113 total (16 Life CEO + 8 Mr Blue + 89 infrastructure/platform agents)

**Recent Updates (Oct 12, 2025):**
- **Mr Blue Universal Access (Agents #73-80)**: Fixed critical access control to make Mr Blue visible to ALL authenticated users (previously admin-only). Role-based content system now shows 3 tabs for regular users (Life CEO, Search, AI Chat) and 4 tabs for Super Admins (adds Admin tab with Visual Editor, Site Builder). Dev toggle localStorage persistence fixed to survive page reloads for testing ESA MindMap access.
- **Button Positioning**: ESA MindMap (cyan, Super Admin only) at bottom-24, Mr Blue (purple/blue, universal) at bottom-6, proper z-index stacking (50 vs 49).
- Fixed duplicate React instances causing app freeze (removed 9 duplicate imports in routes.ts)
- Cleared all LSP errors (LifeCEOEnhanced 3x, LifeCeoPerformance 2x, Codeofconduct 3x)
- Re-enabled Vite optimizeDeps with stable configuration
- Server running stable at 499MB memory, all validations passing

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
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics, including expert agents. The AI Intelligence Network adds 4 new specialist agents (#68 Pattern Recognition, #69 Multilingual Support, #70 Error Resolution, #71 Journey Prediction), bringing the total to 71 agents. Features user support AI with vector database, ML journey prediction, automated audit learning, and cross-page context preservation.
- **Mr Blue AI Companion (Agents #73-80)**: **Universal AI companion visible to ALL users** with role-based content adaptation. Features: (1) **For ALL Users** - Life CEO agents access, platform search, AI chat assistant (3 tabs); (2) **For Super Admins** - Additional Admin tab with Visual Page Editor (#78), AI Site Builder (#77), and admin dashboard; (3) **3D Avatar (#73)** - Three.js 3D companion with voice I/O and animations (coming soon); (4) **Interactive Tours (#74)** - Shepherd.js-powered onboarding with role-specific guides; (5) **Subscription Manager (#75)** - 4-tier subscription system with Stripe and feature flags; (6) **Quality Validator (#79)** - Root cause analysis, proven solution suggestions, and collaborative agent help; (7) **Learning Coordinator (#80)** - Knowledge flows UP (to CEO) and ACROSS (to peers) for collective intelligence compounding. **Access Control**: Uses `isSuperAdmin()` for role detection, shows for all authenticated users, content adapts dynamically based on user.role.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Comprehensive Audit System**: Automated, multi-layer audit system for continuous quality improvement, including page audits and open-source management.
- **Self-Hosted Project Tracker (Agent #65)**: Complete replacement for Jira with bidirectional GitHub integration (Epic/Story/Task hierarchy, agent assignment, code linking, and automated sync between stories↔issues and tasks↔PRs).
- **Comments System (Agent #65)**: Rich collaboration features with @mentions, threading (parent/child), file attachments, edit tracking, and activity feed integration.
- **ESA Mind (/admin/esa-mind)**: Context-aware intelligence dashboard for the ESA Framework (105 Agents, 61 Layers). Features 7 interactive views (Agent Orchestration, Communication Flow, Training Execution, Audit Workflow, System Map, Decision Authority, Pattern Orchestration). Fully integrated with admin design system including sidebar, MT Ocean Theme header (turquoise-to-cyan gradient), and Aurora Tide glassmorphic background.
- **ESA MindMap (Interactive AI Agent & Navigator)**: Globally accessible floating button on ALL pages for Super Admins with magnetic interactions. Features dual-mode interface: (1) Quick Navigator Overlay with live stats, instant agent search, and context-aware page detection showing which agents built the current page, plus 6 quick actions; (2) **Interactive AI Chat** - conversational AI agent powered by Replit AI Integrations (OpenAI GPT-4o) with full esa.md context as knowledge base. Chat understands current page context, responsible agents, and provides ESA-compliant suggestions for modifications.
- **AI Intelligence Network**: Self-learning user support system built by Agent #31 (AI Infrastructure) and new specialist agents #68-71. Features: (1) **AI Help Button** - floating purple/pink gradient button on all pages with magnetic interactions, provides context-aware help and conversation history; (2) **Smart Page Suggestions** - ML-powered next-page predictions (Agent #71) based on user journey patterns with 70%+ confidence display; (3) **AI Context Bar** - collapsible top bar showing live session tracking, journey breadcrumbs, and predicted navigation; (4) **Pattern Learning** - Agent #68 automatically extracts patterns from 18-phase audits and stores in vector database (LanceDB) for semantic search; (5) **Cross-Page Context** - Agent #33 preserves AI conversations and user intent across navigation using sessionId tracking.
- **Multi-AI Integration Strategy**: Comprehensive AI orchestration framework including: Multi-AI decision matrix (Replit AI, Direct OpenAI, Claude, Gemini), prompt engineering framework with versioning, long-context AI integration for esa.md analysis, AI agent memory systems for conversation persistence, and vector database implementation (LanceDB) for semantic search.

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer with isolated databases and API-first communication.
- **Framework**: Adheres to the ESA Framework (105 Agents, 61 Layers) systematic development methodology with comprehensive orchestration and training infrastructure.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules.
- **Agent Training**: Utilizes an "Ultra-Micro Parallel Methodology" for rapid agent training and certification, focusing on atomic task decomposition and real production work.
- **Project Management**: Migrated from Jira to a self-hosted project tracker (Agent #65) with GitHub integration.
- **105-Agent Organizational Structure**: A complete training infrastructure is built for 105 agents, including Meta-agents, Division Chiefs, Domain Coordinators, Layer Agents, Expert Agents, Operational Agents, and Life CEO Sub-Agents, with detailed documentation and protocols.
- **17-Phase Tiered Audit System**: Comprehensive audit framework replacing fragmented methodology with unified 5-tier structure (Foundation → App Layer → Quality → UX → Deployment). Features 17 specialized phases across sequential and parallel execution tiers, orchestrated by Agent #0 and Domain #9. Optimized 90-120 minute execution with clear dependency gates.
- **AI Intelligence Network**: Self-learning user support system with cross-page context preservation, ML journey predictions, audit pattern learning (Agent #68), multilingual support (Agent #69), error resolution (Agent #70), and journey prediction (Agent #71). Powered by LanceDB vector database with semantic search.
- **Open Source Deployment Verification (Agent #59)**: Automated tracking and validation of open-source components against a 5-criteria deployment checklist, integrated into every page audit (Phase 15). Includes an Admin Dashboard, automated workflows for training and consolidation, and ESLint integration for enforcing standards.
- **Quality Gates Before Work (Principle 5)**: Mandatory 4-gate pre-work protocol preventing methodology gaps. All agents must complete: (1) Context Validation (5 min), (2) Discovery Checklist (10-35 min based on role), (3) Agent #64 Review (5 min for duplicate prevention), (4) Parallel Coordination (work simultaneously, not sequentially). Targets 90%+ compliance rate.
- **Collaborative Intelligence Protocol (Agents #79-80)**: Revolutionary inter-agent learning system where agents analyze root causes, suggest proven solutions with code examples, and actively help each other fix issues. Agent #79 validates all features and offers collaborative assistance. Agent #80 captures learnings and distributes knowledge UP (to CEO Agent #0) and ACROSS (to all 105 peers). Creates self-improving collective intelligence network with pattern library search, semantic matching, and solution reuse tracking.

## External Dependencies
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Payment Processing**: Stripe
- **Real-time Communication**: Socket.io
- **Mapping**: Leaflet.js, OpenStreetMap Nominatim API, Google Maps API
- **AI/Machine Learning**: OpenAI GPT-4o, LanceDB (vector database)
- **Error Tracking**: Sentry
- **Background Job Queue**: BullMQ
- **Metrics/Monitoring**: Prometheus
- **Search**: Elasticsearch
- **Caching**: Redis
- **Image/Media Handling**: Multer, Pexels API, FFmpeg.wasm, WebCodecs API, Cloudinary
- **Authentication/Authorization**: jsonwebtoken, bcrypt, @casl/ability
- **UI Framework**: React, Tailwind CSS, shadcn/ui, Radix UI, Material-UI (MUI), Three.js (React Three Fiber), GrapesJS
- **Date/Time Utilities**: moment.js, date-fns
- **PDF Generation**: jsPDF, html2canvas
- **Data Visualization**: Recharts
- **Forms**: react-hook-form
- **Email Service**: Resend
- **Analytics**: Plausible Analytics
- **Internationalization**: i18next, react-i18next
- **Version Control Integration**: GitHub OAuth via Replit connection, @octokit/rest for API access, bidirectional sync service