# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA Framework (105 Agents, 61 Layers), the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference **docs/platform-handoff/esa.md** as the primary entry point.
**CRITICAL:** New agents must be added to ESA_AGENT_ORG_CHART.md (see ESA_NEW_AGENT_GUIDE.md Step 5).

## Recent Changes (Oct 2025)
### Deployment Optimization (Agent #49 + #64 + #59)
- **Fixed**: Replit deployment container storage errors during `npm install`
- **Removed**: Dead dependency `@actions/github` (unused devDependency causing filesystem error -122)
- **Enhanced**: .npmrc with `prefer-offline=true`, `scripts-prepend-node-path=true`, `node-linker=hoisted` for deployment stability
- **Added**: Prebuild cleanup script (`rm -rf dist build .vite client/dist`) to prevent artifact accumulation
- **Added**: Cleanup script to remove `.npm`, logs, `.DS_Store`, tmp files before deployment
- **Fixed (Round 2)**: Replit package caching layer conflicts - Set `REPLIT_DISABLE_PACKAGE_LAYER=1`, switched from `npm ci` to `npm install`, updated run command to `npx tsx`
- **Verified**: Build successful (4747 modules, 8.2MB client bundle), auth routes working (`/api/auth/user`, `/api/auth/csrf`)
- **Status**: Production-ready, all ESA validation gates passed

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
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics, including expert agents (AI Research, UI/UX Design). **AI Intelligence Network (Oct 2025)** adds 4 new specialist agents (#68 Pattern Recognition, #69 Multilingual Support, #70 Error Resolution, #71 Journey Prediction) bringing total to 71 agents. Features user support AI with vector database, ML journey prediction, automated audit learning, and cross-page context preservation.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Comprehensive Audit System**: Automated, multi-layer audit system for continuous quality improvement, including page audits and open-source management.
- **Self-Hosted Project Tracker (Agent #65)**: Complete replacement for Jira with bidirectional GitHub integration (Epic/Story/Task hierarchy, agent assignment, code linking, and automated sync between stories↔issues and tasks↔PRs).
- **Comments System (Agent #65)**: Rich collaboration features with @mentions, threading (parent/child), file attachments, edit tracking, and activity feed integration.
- **ESA Mind (/admin/esa-mind)**: Context-aware intelligence dashboard for the ESA Framework (105 Agents, 61 Layers). Features 7 interactive views (Agent Orchestration, Communication Flow, Training Execution, Audit Workflow, System Map, Decision Authority, Pattern Orchestration). Fully integrated with admin design system including sidebar, MT Ocean Theme header (turquoise-to-cyan gradient), and Aurora Tide glassmorphic background. Supports URL params for direct navigation (?view=agent-orchestration) and page context display (?context=/admin/projects shows which agents built that page). Includes live metrics (105 Agents, 61 Layers, 14 trained agents, 13.3% progress), breadcrumb navigation, search functionality, and contextual doc links. Pattern Orchestration view showcases 8 proven workflows with agent flows and timeline estimates.
- **ESA MindMap (Interactive AI Agent & Navigator)**: Globally accessible floating button on ALL pages for Super Admins with magnetic interactions. Features dual-mode interface: (1) Quick Navigator Overlay with live stats (105 agents, 61 layers, training progress), instant agent search, and context-aware page detection showing which agents built the current page, plus 6 quick actions (AI Chat, Full Dashboard, Org Chart, Quality Gates, 17-Phase Audit, Training Status); (2) **Interactive AI Chat** - conversational AI agent powered by Replit AI Integrations (OpenAI GPT-4o) with full esa.md context as knowledge base. Chat understands current page context, responsible agents, and provides ESA-compliant suggestions for modifications. Uses agent-to-page registry (client/src/config/esaAgentPageRegistry.ts) for context detection and system prompt generation. Built with Aurora Tide glassmorphic design and MT Ocean gradients. Per esa.md Section 10.11-10.16: Interactive AI Agents & Multi-AI Orchestration.
- **AI Intelligence Network (Oct 2025)**: Self-learning user support system built by Agent #31 (AI Infrastructure) and new specialist agents #68-71. Features: (1) **AI Help Button** - floating purple/pink gradient button on all pages with magnetic interactions, provides context-aware help and conversation history; (2) **Smart Page Suggestions** - ML-powered next-page predictions (Agent #71) based on user journey patterns with 70%+ confidence display; (3) **AI Context Bar** - collapsible top bar showing live session tracking, journey breadcrumbs, and predicted navigation; (4) **Pattern Learning** - Agent #68 automatically extracts patterns from 18-phase audits and stores in vector database (LanceDB) for semantic search; (5) **Cross-Page Context** - Agent #33 preserves AI conversations and user intent across navigation using sessionId tracking. Backend: 4 PostgreSQL tables (ai_conversation_memory, page_journey_patterns, learned_patterns, ai_user_preferences), 14 RESTful API endpoints at /api/ai-intelligence, LanceDB vector search with OpenAI embeddings. Full documentation: docs/AI_INTELLIGENCE_NETWORK_COMPLETE.md, docs/FULL_SITE_AUDIT_PLAN.md. Automated audit script: scripts/run-full-audit.ts (executes 18 phases, learns patterns, generates reports). 
- **Multi-AI Integration Strategy**: Comprehensive AI orchestration framework documented in esa.md Sections 10.12-10.16. Includes: Multi-AI decision matrix (Replit AI, Direct OpenAI, Claude, Gemini), prompt engineering framework with versioning, long-context AI integration for esa.md analysis, AI agent memory systems for conversation persistence, and vector database implementation (LanceDB) for semantic search. Analysis document: docs/platform-handoff/ESA_AI_INTEGRATION_ANALYSIS.md.

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
- **AI Intelligence Network (Oct 2025)**: Self-learning user support system with cross-page context preservation, ML journey predictions, audit pattern learning (Agent #68), multilingual support (Agent #69), error resolution (Agent #70), and journey prediction (Agent #71). Powered by LanceDB vector database with semantic search. Complete documentation: esa.md Section 10.17.
- **Open Source Deployment Verification (Agent #59)**: Automated tracking and validation of open-source components against a 5-criteria deployment checklist, integrated into every page audit (Phase 15). Includes an Admin Dashboard, automated workflows for training and consolidation, and ESLint integration for enforcing standards.
- **Quality Gates Before Work (Principle 5, Oct 2025)**: Mandatory 4-gate pre-work protocol preventing methodology gaps. All agents must complete: (1) Context Validation (5 min), (2) Discovery Checklist (10-35 min based on role), (3) Agent #64 Review (5 min for duplicate prevention), (4) Parallel Coordination (work simultaneously, not sequentially). Enhanced certifications for Agent #11 (journey mapping: 5-10 personas, all contexts/entry points, mobile/accessibility), Agent #51 (100% journey coverage, parallel test planning, WCAG 2.1 AA compliance), Agent #64 (gatekeeper authority, duplicate prevention, reusable component registry). Agent #0 enforces with automatic rejection for violations (missing journey maps, no test coverage, incomplete persona coverage, sequential work). Targets 90%+ compliance rate. Full reference: ESA_QUALITY_GATES.md.

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
- **UI Framework**: React, Tailwind CSS, shadcn/ui, Radix UI, Material-UI (MUI)
- **Date/Time Utilities**: moment.js, date-fns
- **PDF Generation**: jsPDF, html2canvas
- **Data Visualization**: Recharts
- **Forms**: react-hook-form
- **Email Service**: Resend
- **Analytics**: Plausible Analytics
- **Internationalization**: i18next, react-i18next
- **Version Control Integration**: GitHub OAuth via Replit connection, @octokit/rest for API access, bidirectional sync service