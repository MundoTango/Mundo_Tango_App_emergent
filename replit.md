# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

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
- **Self-Hosted Project Tracker (Agent #65)**: Complete replacement for Jira with bidirectional GitHub integration. Includes Epic/Story/Task hierarchy, agent assignment, code linking, and automated sync between stories↔issues and tasks↔PRs via Replit GitHub OAuth connection.
- **Comments System (Agent #65)**: Rich collaboration features with @mentions, threading (parent/child), file attachments, edit tracking, and activity feed integration. Reuses postComments infrastructure.

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer with isolated databases and API-first communication.
- **Framework**: Adheres to the ESA LIFE CEO 61x21 systematic development methodology, including a 100-agent organizational structure with a CEO, 6 Division Chiefs, 9 Domain Coordinators, 61 Layer Agents, 7 Expert Agents, and 16 Life CEO Sub-Agents.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules.
- **Agent Training**: Utilizes an "Ultra-Micro Parallel Methodology" for rapid agent training and certification, focusing on atomic task decomposition and real production work.
- **Project Management**: ✅ **COMPLETED:** Migrated from Jira to self-hosted project tracker (Agent #65). Successfully migrated 5 Epics + 15 Stories from MUN project. Includes GitHub integration (Agent #67) with bidirectional sync: stories↔issues, tasks↔PRs, webhook support.
  - **Multiple View Modes (Agent #8, #11)**: 
    - Dashboard: Overview stats with epic/story counts, story points, and status breakdowns
    - Kanban: 3-column drag-drop board (To Do → In Progress → Done) with glassmorphic cards
    - List: Sortable table view with inline data (key, summary, status, priority, points)
    - Sprint: Active sprint view with burn-down stats and sprint backlog
  - **Comments System (Agent #65)**: ✅ Rich text comments with @mentions, threading, attachments, edit tracking on Story Detail page
  - **Design**: Linear + Plane aesthetics with Aurora Tide/MT Ocean Theme glassmorphic components, turquoise-ocean gradients, hover effects
- **105-Agent Organizational Structure**: ✅ **COMPLETE TRAINING INFRASTRUCTURE BUILT:**
  - **5 New Operational Excellence Agents (#63-67):**
    - Agent #63: Sprint & Resource Manager (Layer 58 - Team Collaboration)
    - Agent #64: Documentation Architect (Layer 54 - Technical Documentation)
    - Agent #65: Project Tracker Manager (Layer 59 - Open Source Management)
    - Agent #66: Code Review Expert (Layer 53 - CI/CD Pipeline)
    - Agent #67: Community Relations Manager (Layer 60 - Version Control/GitHub)
  - **Meta-Agent Training Infrastructure (Oct 11, 2025):**
    - ✅ Agent #0 (ESA CEO): Master orchestrator with strategic framework and conflict resolution
    - ✅ Agent #63 (Sprint Manager): Training coordinator for 5-day intensive bootcamp
    - ✅ Agent #64 (Documentation Architect): Training materials creator and knowledge extraction
    - ✅ Domain #9 (Master Control): Operational oversight during training cascade
  - **Training Documentation Suite:**
    - ✅ [ESA_KNOWLEDGE_SHARING.md](./docs/platform-handoff/ESA_KNOWLEDGE_SHARING.md): Hierarchical mentorship framework with 4-level training cascade (Meta-agents → Chiefs → Layer agents → Experts)
    - ✅ [ESA_AGENT_BOOTCAMP.md](./docs/platform-handoff/ESA_AGENT_BOOTCAMP.md): 5-day intensive program (Day 1: Meta-agents, Day 2: Chiefs, Days 3-4: 61 Layer agents, Day 5: Experts/Operational/Life CEO)
    - ✅ [ESA_AGENT_A2A_PROTOCOL.md](./docs/platform-handoff/ESA_AGENT_A2A_PROTOCOL.md): 4-level help-seeking system (Peer 30min → Chief 1hr → Domain immediate → CEO immediate) with workload thresholds
  - **esa.md Enhanced as Full Agent Command Center:**
    - ✅ 10-Section Agent Orchestration Playbook: New Features, Performance, Bug Fixes, AI Integration, Audits, UI/UX, Project Management, Escalation Matrix, Training, Collaboration Patterns
    - ✅ Quick Reference Table: Agent selection by task type (11 scenarios mapped to specific agents)
    - ✅ Critical Lessons Learned: Project Tracker Aurora Tide failure case study with mandatory Agent #11 pre-build design gate
    - ✅ Emergency Protocols: Production incidents, security vulnerabilities, performance degradation escalations
    - ✅ **CERTIFIED:** 100% pass (59/59 points) across all audit categories - Full Agent Command Center status achieved
  - **Agent Memory Files:** ✅ **COMPLETE (105/105)** - All agents have individual memory files with identity, tech stack, escalation paths, and collaboration patterns
    - 1 CEO (Agent #0)
    - 6 Division Chiefs (#1-6)
    - 9 Domain Coordinators (#1-9)
    - 61 Layer Agents (Layers 1-61)
    - 7 Expert Agents (#10-16)
    - 5 Operational Agents (#63-67)
    - 16 Life CEO Sub-Agents
  - **Documentation Location:** `docs/agents/` organized by category (ceo, chiefs, domains, layers, experts, operational, life-ceo)
  - **Training Ready:** All 105 agents can now begin ESA_AGENT_BOOTCAMP.md 5-day intensive training program
- **ESA Audit Runner**: ✅ **ACTIVE:** Automated 43-agent audit system that validates pages against ESA 61x21 framework and auto-generates Human Review Stories with comprehensive metadata. Full metadata system implemented with:
  - **Database Schema**: Added `metadata` jsonb column to `projectStories` table for flexible ESA data storage
  - **11 Metadata Sections**: (1) Review Category & Notes, (2) Documentation Links, (3) ESA Layers Affected, (4) Quality Metrics (current/target/gap), (5) Risk Assessment (level/description/escalation), (6) Complexity & Technical Details, (7) Review Checklist & Acceptance Criteria, (8) Human Review Workflow, (9) Compliance Requirements
  - **UI Implementation**: StoryDetail.tsx displays all metadata sections with Aurora Tide design system - GlassCard components, turquoise-to-blue gradients, proper visual hierarchy, icons for each section
  - **Test Data**: 3 stories populated with realistic ESA metadata using 100-agent hierarchy (Agent #11 UI/UX, Agent #2 API, Agent #16 i18n)
  - **8 Review Categories**: Architecture & Data Integrity, UI/UX & Accessibility, Business Logic & Security, API & Performance, AI Intelligence, Content & i18n, Testing & QA, Documentation & Compliance

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