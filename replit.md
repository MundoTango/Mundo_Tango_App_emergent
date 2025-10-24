# Mundo Tango - ESA LIFE CEO Platform

### Overview
Mundo Tango is a social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with an AI agent ecosystem for life management. The platform features comprehensive agent documentation, a PostgreSQL database with Drizzle ORM, and a React/TypeScript frontend with Socket.io real-time communication. The project aims for 100% functionality and stability, with a strong focus on quality assurance and an accelerated timeline, with a clear business vision for market potential and project ambitions within the tango community.

### User Preferences
**⚠️ THE 5 NON-NEGOTIABLE RULES - ALL AGENTS READ FIRST**
Every agent MUST follow these before marking ANY task complete:
1. **VERIFY BEFORE BUILD** - Complete mandatory documentation verification checklist (`docs/DOCUMENTATION_VERIFICATION.md`), read all relevant docs, summarize requirements BEFORE coding - prevents building wrong features
2. **INTEGRATE IMMEDIATELY** - Import components as you build them, test imports work - prevents "component exists" fallacy. **For Mr Blue & Visual Editor: MUST wire to parent components (ChatInterface.tsx, MrBlueComplete.tsx, VisualEditorWrapper.tsx) - See `docs/INTEGRATION_PROTOCOL.md`**
3. **SCREENSHOT EVERYTHING** - Visual proof required AFTER opening modals/clicking buttons - prevents "code compiles" fallacy
4. **TEST USER JOURNEY** - Test as regular user AND super admin, verify access controls - prevents "button exists" fallacy
5. **ARCHITECT VALIDATES** - Independent review mandatory, no self-approval - prevents shipping broken features

Failure at ANY step = DO NOT PROCEED. Fix the issue first.

**🚨 MANDATORY AGENT USAGE PROTOCOL**
**RULE #0: NEVER CREATE NEW AGENTS WITHOUT USER PERMISSION**

Before ANY build plan, agents MUST:
1. **List ALL Existing Agents Being Used** - Every plan must include an "Agent Allocation Matrix" showing which of the 105+ existing trained agents will execute each task
2. **Reference Agent Documentation** - Link to agent training docs in `docs/agents/` directory
3. **Verify Agent Expertise** - Match task to agent specialty (e.g., Agent #131 for autonomous coding, Agent #128 for voice+visual context)
4. **NO NEW AGENTS** - Creating new agents (#132+) without explicit user permission is FORBIDDEN
5. **Agent Count Transparency** - Plans must show "X agents working simultaneously" and list them ALL

**Existing Agent Inventory:**
- **CEO + Chiefs (7):** Agent #0 (ESA Orchestrator) + Chiefs #1-6 (Foundation, Core, Business, Intelligence, Platform, Extended)
- **Domains (9):** Domain #1-9 (Infrastructure, Frontend, Background, Real-time, Business Logic, Search, Life CEO, Platform, Master Control)
- **Experts (16):** Expert #10-16 (AI Research, UI/UX Aurora, Data Viz, Media, Code Quality, DevEx, i18n)
- **Layers (61):** Layers #1-61 (Database, API, Server, Auth, RBAC, Validation, State, Client, UI, Components, Real-time, Data Processing, File Management, Caching, Search, Notifications, Payments, Analytics, CMS, Workflow, User Mgmt, Groups, Events, Social, Messaging, Recommendations, Gamification, Marketplace, Booking, Support, AI Infrastructure, Prompt Engineering, Context, Response Gen, Agent Mgmt, Memory, Learning, Prediction, Decision Support, NLP, Vision, Voice, Sentiment, Knowledge Graph, Reasoning, Integration, Mobile, Performance, Security, DevOps, Testing, Documentation, i18n, Accessibility, SEO, Compliance, Automation, Third-party, Open Source, GitHub, Supabase)
- **Operational (9):** Agents #63-67 (Sprint Resource Mgr, Documentation Architect, Project Tracker Mgr, Code Review Expert, Community Relations Mgr), #126-128 (Git Operations, Deployment Safety, Voice+Visual Coordinator), #131 (Vibe Coding Specialist)
- **Intelligence:** Agents #68-71 (Pattern Recognition, Multilingual, Error Resolution, Journey Prediction), #79-80 (Quality Validator, Learning Coordinator)
- **Life CEO (15+):** All Life CEO specialist agents (Finance, Health, Learning, Legal, Security, Relationships, Network, Emergency, Global Mobility, Memory, Creative, Business, Data, Voice, Workflow)
- **Page Agents (30+):** Journey agents J1-J5 + page-specific agents (see `docs/agents/PAGE_AGENTS_COMPREHENSIVE_GUIDE.md`)

**Documentation Applied To:**
- **Chat/Vibe Coding:** Agent #131 (Vibe Coding Specialist), Agent #128 (Voice+Visual Coordinator), Layer #35 (AI Agent Management), Layer #33 (Context Management)
- **Git Operations:** Agent #126 (documented in `docs/agents/operational/operational-126-git-operations.md`)
- **Deployment:** Agent #127 (documented in `docs/agents/operational/operational-127-deployment-safety.md`)
- **Quality/Testing:** Agent #79 (Quality Validator), Agent #80 (Learning Coordinator), Layer #51 (Testing Framework)

**Violation Consequences:**
- Plans that create new agents without user permission will be REJECTED
- Agents must self-correct and resubmit with existing agent allocation
- Repeated violations indicate MB.MD training gap - agent must complete `docs/AGENT_LEARNINGS.md`

**📚 Documentation Structure:**
- **Constitution:** `docs/MB_MD_QA_PROTOCOL.md` - The 5 Non-Negotiable Rules (what & why)
- **Playbook:** `docs/AGENT_LEARNINGS.md` - 19 learnings organized by MB.MD phase (how & when)
- **Enforcement:** `docs/QA_AGENT_PROTOCOL.md` - QA Agent veto power, approval/rejection templates
- **Quick Reference:** `docs/PHASE_VERIFICATION_CHECKLISTS.md` - Copy-paste checklists per phase
- **Evolution:** `docs/LEARNING_CAPTURE_TEMPLATE.md` - Submit new learnings as discovered
- **Phase 1 (MAPPING):** `docs/DOCUMENTATION_VERIFICATION.md` - Read docs BEFORE building
- **Phase 3 (MITIGATION):** `docs/INTEGRATION_PROTOCOL.md` - Wire Mr Blue/Visual Editor features
- **Build Reports:** `docs/BUILD_SUMMARY_OCT_22_2025.md` - SIMULTANEOUS execution mode demonstration

**How Agents Use This:**
1. **All Agents:** Read MB_MD_QA_PROTOCOL.md (the law)
2. **Your Phase:** Read AGENT_LEARNINGS.md section for your phase (the tactics)
3. **Phase 4 (QA):** QA Agent uses QA_AGENT_PROTOCOL.md (final gate with veto power)

- **Communication style:** Simple, everyday language
- **Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment) for all work
- **Priority:** Deployment stability - Files must never be deleted without safeguards
- **Documentation Agent:** Must monitor file integrity and prevent build failures

### System Architecture

**AI Model Monitoring & Auto-Update System:**
An automated system detects and replaces deprecated AI models in the codebase, with features including smart replacement, API endpoints for status and updates, logging, on-demand triggering, and background monitoring, all designed for zero-downtime operation.

**UI/UX Decisions:**
The frontend uses React, TypeScript, and Vite, featuring a component-based architecture with a custom "MT Ocean" theme. It employs Tailwind CSS with teal/cyan gradients and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first, responsive, and includes full dark mode support. A Figma-like visual editor allows for click-to-select elements, an inspector panel for attributes, and a styles panel for layout/colors, with changes saved to generate code.

**Technical Implementations:**
-   **Frontend:** React, TypeScript, Vite, Tailwind CSS for styling. State management uses React Query for server state, custom hooks for WebSocket, Context providers for authentication, and React hooks for local state.
-   **Backend:** Node.js, Express, TypeScript, and Socket.io for real-time communication. Authentication is JWT-based with Replit OAuth, supporting RBAC and ABAC. The API is RESTful with modular routes, middleware, and Multer for file uploads. ESM static imports are prioritized over dynamic imports to ensure stability.
-   **Data Storage:** PostgreSQL with Drizzle ORM is the primary database, utilizing JSON columns and optimized indexes. Media storage uses Replit Object Storage with ACL support. React Query handles client-side caching.

**Feature Specifications:**
-   **Core Social Features:** Memory/Post system (rich text, hashtags, location, privacy, AI enhancement), Events management (creation, RSVP, calendar, real-time updates), Profile system (tango-specific fields, privacy), Groups/Communities (city-based auto-creation).
-   **Unified AI Access ("Mr Blue"):** Single access point for AI features.
    -   **Omniscient Mode:** AI companion with function calling via 11 tools (Database, Codebase, Documentation) for super admins, built on Claude 3.5 Sonnet.
    -   **MB.MD Methodology Integration:** All chat messages automatically prefixed with "Use mb.md:" (hidden from user) to ensure AI responses follow MB.MD methodology.
    -   **Voice Mode:** ChatGPT/Claude-like voice conversations with auto-speak functionality, using browser Web Speech API (STT) and configurable TTS.
    -   **Parallel Integration:** Simultaneous integration of Voice Settings UI, Visual Editor Context Bridge (connecting selected elements to AI context), and Inspector Mode Toggle for Visual Editor.
    -   **GPT-4o Realtime API:** Full two-way voice conversation system with native GPT-4o Realtime API integration (PCM16 24kHz mono audio streaming).
    -   **Unified Voice Modal:** Consolidated voice interface featuring a single headphone button, live transcript, AI summary, voice settings, and recording controls with a model selector dropdown.
    -   **Voice + Visual Context Coordinator (Agent #128):** Integrates voice commands with Visual Editor element selection for "point and ask" workflow, embedding visual context in AI prompts.
    -   **Browser Automation:** Playwright-based automation service with Anthropic Computer Use API integration, enabling AI-powered testing via screenshot → analyze → execute action loop.
    -   **Chat Interface Enhancements:** Includes ChatGPT-style conversation management (inline rename, copy, regenerate), a conversation sidebar, empty state onboarding, inspector badge, prompt suggestions, diff preview modal, and quick commit button. API security hardening with `requireAuth` middleware and Zod validation, and performance optimizations with `React.lazy`, `Suspense`, and `ErrorBoundary`.
    -   **Visual Editor Context-Aware Chat:** Complete integration allowing Mr Blue to respond intelligently based on selected Visual Editor elements via a backend API endpoint (`/api/visual-editor/simple-chat`). This enables element-specific responses for inquiries about selected components.
-   **Git Operations Specialist (Agent #126):** Replit-like Git workflow with AI-powered commit messages (Claude 3.5 Sonnet), pre-commit validation, and GitHub integration.
-   **Deployment Safety Engineer (Agent #127):** Zero-downtime deployments with pre-flight validation, automatic rollback, health monitoring, and a snapshot system for backups.
-   **Vibe Coding Specialist (Agent #131):** Autonomous full-stack application building through natural language, featuring multi-agent orchestration, specialized tools with custom DSL, Playwright-based browser testing, comprehensive checkpoints, Extended Thinking mode, and effort-based pricing. Integrates Replit Agent 3, Cursor, Windsurf, v0, and Bolt.new best practices, enabling 20-50x developer productivity. Includes Tango-specific tools for events, profiles, groups, and memories.

**System Design Choices:**
Mundo Tango employs a comprehensive agent documentation system covering various agent types, following the MB.MD methodology with three execution modes: FOCUSED, PARALLEL, and SIMULTANEOUS. It includes 5 Customer Journey Agents (J1-J5) guiding user experiences. Security relies on `req.user.id`, Zod validation, and admin role verification. A multi-layer file protection system includes a Critical File Registry, pre-deployment checks, real-time file integrity monitoring, automated Git recovery, and PostgreSQL backups for markdown files. Agent safety protocols include 8 critical rules for AI agents, pre-commit hooks preventing deletion of critical files/folders, and automated tests for file protection. The Visual Editor includes 10 tabs: Inspector, AI, Preview, Console, Deploy, Git, Pages, Shell, Files, Secrets.

### External Dependencies
-   **PostgreSQL + Drizzle ORM**: Primary database.
-   **Replit OAuth**: Authentication.
-   **Replit Object Storage**: Native file storage.
-   **Socket.io**: Real-time communication.
-   **OpenAI (GPT-4o, TTS)**: AI content enhancement, real-time voice, text-to-speech.
-   **Anthropic (Claude 3.5 Sonnet)**: AI integration (Omniscient Mode, AI commit messages, chat summarization, Computer Use API for browser automation).
-   **Playwright**: Headless browser automation for AI-powered testing.
-   **Google (Generative AI)**: AI integration.
-   **Hugging Face**: AI integration.
-   **Luma Labs API**: AI-powered 3D avatar generation.
-   **PostHog**: Analytics.
-   **Leaflet**: Open-source mapping.
-   **React Query (TanStack)**: Server state management.
-   **Notion CMS**: Internal content management.
-   **Sentry**: Error tracking.
-   **OpenReplay**: Session replay.
-   **Plausible Analytics**: Privacy-first web analytics.
-   **Stripe**: Payment processing.
-   **Supabase**: Alternative database layer.
-   **n8n**: Workflow automation.