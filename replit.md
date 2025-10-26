# Mundo Tango - ESA LIFE CEO Platform

### Overview
Mundo Tango is a social platform for the global tango community, built on the ESA (Emergent Software Architecture) LIFE CEO framework. It integrates social networking features (memories/posts, events, profiles, groups) with an AI agent ecosystem for life management. The platform aims for 100% functionality and stability, with a strong focus on quality assurance and an accelerated timeline. The project's business vision centers on its market potential and ambitions within the tango community.

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

**Violation Consequences:**
- Plans that create new agents without user permission will be REJECTED
- Agents must self-correct and resubmit with existing agent allocation
- Repeated violations indicate MB.MD training gap - agent must complete `docs/AGENT_LEARNINGS.md`

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
The frontend uses React, TypeScript, and Vite with a component-based architecture and a custom "MT Ocean" theme. It employs Tailwind CSS with teal/cyan gradients and a glassmorphic design pattern with backdrop-blur effects. The design is mobile-first, responsive, and includes full dark mode support. A Figma-like visual editor allows for click-to-select elements, an inspector panel, and a styles panel, with changes generating code.

**Technical Implementations:**
-   **Frontend:** React, TypeScript, Vite, Tailwind CSS. State management uses React Query, custom hooks for WebSocket, Context providers for authentication, and React hooks for local state.
-   **Backend:** Node.js, Express, TypeScript, and Socket.io for real-time communication. Authentication is JWT-based with Replit OAuth, supporting RBAC and ABAC. The API is RESTful with modular routes and Multer for file uploads. ESM static imports are prioritized.
-   **Data Storage:** PostgreSQL with Drizzle ORM and JSON columns. Replit Object Storage for media. React Query for client-side caching.

**Feature Specifications:**
-   **Core Social Features:** Memory/Post system (rich text, AI enhancement), Events management, Profile system, Groups/Communities.
-   **Unified AI Access ("Mr Blue"):** Single access point for AI features including Omniscient Mode (AI companion with function calling via tools for super admins, Claude 3.5 Sonnet), MB.MD methodology integration, Voice Mode (GPT-4o Realtime API for two-way voice conversations), Unified Voice Modal, Voice + Visual Context Coordinator (Agent #128) for "point and ask" workflow, Browser Automation (Playwright-based with Anthropic Computer Use API), Chat Interface Enhancements (conversation management, diff preview), Visual Editor Context-Aware Chat, and **Replit-Style Vibe Coding** (conversational UI changes with change queueing, clarifying questions, batch git commits).
-   **Git Operations Specialist (Agent #126):** Replit-like Git workflow with AI-powered commit messages (Claude 3.5 Sonnet) and pre-commit validation.
-   **Deployment Safety Engineer (Agent #127):** Zero-downtime deployments with pre-flight validation, automatic rollback, and health monitoring.
-   **Vibe Coding Specialist (Agent #131):** Autonomous full-stack application building through natural language, multi-agent orchestration, specialized tools, Playwright-based browser testing, and comprehensive checkpoints. Integrates Replit Agent 3, Cursor, Windsurf, v0, and Bolt.new best practices for 20-50x developer productivity.

**System Design Choices:**
Mundo Tango uses a comprehensive agent documentation system adhering to the MB.MD methodology with FOCUSED, PARALLEL, and SIMULTANEOUS execution modes. It includes 5 Customer Journey Agents (J1-J5). Security relies on `req.user.id`, Zod validation, and admin role verification. A multi-layer file protection system includes a Critical File Registry, pre-deployment checks, real-time file integrity monitoring, automated Git recovery, and PostgreSQL backups for markdown files. Agent safety protocols include 8 critical rules for AI agents and automated tests for file protection. The Visual Editor features 10 tabs: Inspector, AI, Preview, Console, Deploy, Git, Pages, Shell, Files, Secrets. The AI Model Monitoring & Auto-Update System ensures zero-downtime operation by detecting and replacing deprecated AI models. Autonomous coding mode targets a 200-minute runtime with self-testing and self-healing loops, multi-model orchestration for cost optimization, and metrics exported to Grafana Cloud.

### External Dependencies
-   **PostgreSQL + Drizzle ORM**: Primary database.
-   **Replit OAuth**: Authentication.
-   **Replit Object Storage**: Native file storage for vibe coding assets.
-   **Socket.io**: Real-time communication.
-   **OpenAI (GPT-4o, TTS)**: AI content enhancement, real-time voice, text-to-speech.
-   **Anthropic (Claude 3.5 Sonnet)**: AI integration (Omniscient Mode, AI commit messages, chat summarization, Computer Use API for browser automation).
-   **Model Context Protocol (MCP)**: Connects AI to external tools (Gmail, Slack, GitHub) via JSON-RPC 2.0 using @modelcontextprotocol/sdk.
-   **Playwright**: Headless browser automation.
-   **Google (Generative AI)**: AI integration.
-   **Hugging Face**: AI integration.
-   **Luma Labs API**: AI-powered 3D avatar generation.
-   **React Query (TanStack)**: Server state management.
-   **Grafana Cloud**: OpenTelemetry observability for metrics, traces, and logs.