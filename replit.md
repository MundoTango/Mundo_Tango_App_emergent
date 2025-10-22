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

**📚 Documentation Structure (October 22, 2025 Update):**
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

**UI/UX Decisions:**
The frontend uses React, TypeScript, and Vite, featuring a component-based architecture with a custom "MT Ocean" theme. It employs Tailwind CSS with teal/cyan gradients and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first, responsive, and includes full dark mode support. A Figma-like visual editor allows for click-to-select elements, an inspector panel for attributes, and a styles panel for layout/colors, with changes saved to generate code.

**Technical Implementations:**
-   **Frontend:** React, TypeScript, Vite, Tailwind CSS for styling. State management uses React Query for server state, custom hooks for WebSocket, Context providers for authentication, and React hooks for local state.
-   **Backend:** Node.js, Express, TypeScript, and Socket.io for real-time communication. Authentication is JWT-based with Replit OAuth, supporting RBAC and ABAC. The API is RESTful with modular routes, middleware, and Multer for file uploads. ESM static imports are prioritized over dynamic imports to ensure stability.
-   **Data Storage:** PostgreSQL with Drizzle ORM is the primary database, utilizing JSON columns and optimized indexes. Media storage uses Replit Object Storage with ACL support. React Query handles client-side caching.

**Feature Specifications:**
-   **Core Social Features:** Memory/Post system (rich text, hashtags, location, privacy, AI enhancement), Events management (creation, RSVP, calendar, real-time updates), Profile system (tango-specific fields, privacy), Groups/Communities (city-based auto-creation).
-   **Unified AI Access ("Mr Blue"):** Single access point for AI features.
    -   **Omniscient Mode:** AI companion with function calling via 11 tools (Database, Codebase, Documentation) for super admins. Built on Claude 3.5 Sonnet.
    -   **MB.MD Methodology Integration:** All chat messages automatically prefixed with "Use mb.md:" (hidden from user) to ensure AI responses follow MB.MD methodology. Implemented Oct 22, 2025.
    -   **Voice Mode:** ChatGPT/Claude-like voice conversations with auto-speak functionality. Uses browser Web Speech API (STT) and configurable TTS (browser native or premium OpenAI TTS).
    -   **Parallel Integration:** Simultaneous integration of Voice Settings UI, Visual Editor Context Bridge (connecting selected elements to AI context), and Inspector Mode Toggle for Visual Editor.
    -   **GPT-4o Realtime API:** Full two-way voice conversation system with native GPT-4o Realtime API integration (PCM16 24kHz mono audio streaming).
    -   **Unified Voice Modal:** Consolidated voice interface featuring a single headphone button, live transcript, AI summary, voice settings, and recording controls. Model selector dropdown for chat sessions.
    -   **Voice + Visual Context Coordinator (Agent #128):** Integrates voice commands with Visual Editor element selection for "point and ask" workflow, embedding visual context in AI prompts.
    -   **Browser Automation (Oct 22, 2025):** Playwright-based automation service with Anthropic Computer Use API integration. Enables AI-powered testing via screenshot → analyze → execute action loop. Service: `server/browserAutomation.ts`.
-   **Git Operations Specialist (Agent #126):** Replit-like Git workflow with AI-powered commit messages (Claude 3.5 Sonnet), pre-commit validation, and GitHub integration via API routes and a dedicated UI panel.
-   **Deployment Safety Engineer (Agent #127):** Zero-downtime deployments with pre-flight validation, automatic rollback, health monitoring, and a snapshot system for backups.

**System Design Choices:**
Mundo Tango employs a comprehensive agent documentation system covering various agent types, following the MB.MD methodology with three execution modes: (1) FOCUSED for serial complex tasks, (2) PARALLEL for independent features, (3) SIMULTANEOUS for comprehensive all-at-once builds (Learning #19, Oct 22, 2025). It includes 5 Customer Journey Agents (J1-J5) guiding user experiences. Security relies on `req.user.id`, Zod validation, and admin role verification. A multi-layer file protection system includes a Critical File Registry, pre-deployment checks, real-time file integrity monitoring, automated Git recovery, and PostgreSQL backups for markdown files. Agent safety protocols include 8 critical rules for AI agents, pre-commit hooks preventing deletion of critical files/folders, and automated tests for file protection. Visual Editor includes 10 tabs: Inspector, AI, Preview, Console (fixed Oct 22), Deploy, Git, Pages, Shell, Files, Secrets (fixed Oct 22).

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