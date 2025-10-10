# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference **docs/platform-handoff/esa.md** as the primary entry point.

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
- **AI Integration**: Powers 16 Life CEO agents with semantic memory and self-learning, alongside AI-powered analytics, including expert agents (AI Research, UI/UX Design).
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Comprehensive Audit System**: Automated, multi-layer audit system for continuous quality improvement, including page audits and open-source management.

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer with isolated databases and API-first communication.
- **Framework**: Adheres to the ESA LIFE CEO 61x21 systematic development methodology, including a 100-agent organizational structure with a CEO, 6 Division Chiefs, 9 Domain Coordinators, 61 Layer Agents, 7 Expert Agents, and 16 Life CEO Sub-Agents.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure using local assets.
- **Route Protection System**: 4-layer production/debug separation using folder conventions, TypeScript RouteRegistry, Playwright smoke tests, and ESLint rules.
- **Agent Training**: Utilizes an "Ultra-Micro Parallel Methodology" for rapid agent training and certification, focusing on atomic task decomposition and real production work.

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

## Recent Changes (October 10, 2025)

### Agent #62 Created: Resume AI - Human Review Coordinator ✅

**New Expert Agent:**
- Created Agent #62 following ESA_NEW_AGENT_GUIDE.md methodology
- Position: Expert Agent tier (alongside #10-#16)
- Purpose: Bridge AI agent work with human oversight via Jira project management
- Integration: Replit Jira connector enabled and operational
- Documentation: Complete 6-phase methodology in ESA_AGENT_RESUME_AI.md

**Jira Integration Complete:**
- Built direct Jira API client (JiraDirectAPI.ts) with Basic Auth - bypasses Replit connector for reliability
- Created JiraProjectSync service using direct API integration
- Created ResumeAIOrchestrator service for package generation
- Added 3 API endpoints: /api/agent/jira-sync, /api/agent/jira-status, /api/agent/resume-package
- ✅ **SYNCED TO JIRA**: 5 Epics (MUN-1 to MUN-5) + 15 Stories (MUN-6 to MUN-20) live in Mundo Tango project
- Established human review workflow for agent work approval

**Files Created:**
- ✅ docs/platform-handoff/ESA_AGENT_RESUME_AI.md (Agent #62 methodology)
- ✅ docs/jira-project-plan.md (Complete Jira-ready project structure)
- ✅ server/services/JiraDirectAPI.ts (Direct API client - 270 lines)
- ✅ server/services/JiraProjectSync.ts (Jira API integration - updated)
- ✅ server/services/ResumeAIOrchestrator.ts (Resume package generation)
- ✅ server/routes.ts (Added Resume AI endpoints)

### Phases 1-4 Complete: ESA Parallel Execution Framework ✅

**Phase 1 - Documentation (Complete):**
- ✅ Hierarchical Mentorship Model added to ESA_NEW_AGENT_GUIDE.md (5-level cascade, peer mentoring, 4-5 day certification)
- ✅ Resume AI Integration documented in esa.md (human review workflow, performance metrics, training artifacts)
- ✅ A2A Performance Tracking enhanced in ESA_AGENT_A2A_PROTOCOL.md (Prometheus, BullMQ, LangGraph metrics)

**Phase 2 - Infrastructure (Complete):**
- ✅ LangGraph Hierarchy Built (LangGraphAgentOrchestrator.ts) - Full 100-agent ESA structure as executable graph
  - Agent #0 (CEO) → 6 Division Chiefs → 9 Domain Coordinators → 7 Experts + 16 Life CEO Sub-Agents
  - Hierarchical routing, state management with MemorySaver, conditional task-based edges
- ✅ BullMQ Orchestration (bullmq-config.ts) - Zero LSP errors, graceful shutdown, Redis safety checks

**Phase 3 - Baseline Audit (Complete):**
- ✅ Registry Synced: 6 certified pages (Housing 88, Auth 82, Profile 85, Home 78, Life CEO 85, Groups 82)
- ✅ Baseline Audit Script: Agent #59 created comprehensive audit scanning 97 production pages
- ✅ Issues Discovered: 314 total (0 critical, 116 high, 92 medium, 106 low)
- ✅ Coverage Gaps Identified:
  - Data-testid: 37% (61 pages need work)
  - ARIA Labels: 43% (55 pages need work)
  - Translations: 99% ✅ (excellent!)
  - Error Boundaries: 5% (92 pages need work)
  - SEO Meta Tags: 6% (91 pages need work)

**Phase 4 - Squad Formation (Complete):**
- ✅ 7 Mentor Squads formed (ESA_SQUAD_FORMATION.md)
- ✅ 14 Certified Agents assigned as mentors
- ✅ Training cascade ready: 14 mentors → 40+ new agents
- ✅ Squad Priorities:
  1. Resilience (92 pages) - Agents 7+15
  2. SEO (91 pages) - Agents 55+54
  3. Testing (61 pages) - Agents 53+14
  4. Accessibility (55 pages) - Agents 51+11
  5. Design (14 pages) - Agents 11+2
  6. Performance (97 pages) - Agents 1+6
  7. Security (97 pages) - Agents 5+12

**Next Phase:** Phase 5 - Hybrid Blitz execution using LangGraph coordination, BullMQ parallel queues, real-time metrics, Resume AI documentation for human review

**Target:** 314 issues → <50 (84% reduction across 97 pages)

### 5 New ESA Agents Created: Self-Hosted Project Management ✅

**Strategic Shift:** Moving from Jira dependency to self-hosted admin center for complete control and zero vendor lock-in.

**New Agents (Following ESA_NEW_AGENT_GUIDE.md):**

**Agent #63: Sprint & Resource Manager**
- **ESA Layer:** 58 (Team Collaboration)
- **Division:** Chief #6 (Extended Management)
- **Purpose:** Sprint planning, resource allocation, team capacity management
- **Responsibilities:** Velocity tracking, workload balancing, burndown charts, retrospectives
- **Documentation:** ESA_AGENT_63_SPRINT_RESOURCE.md

**Agent #64: Documentation Architect**
- **ESA Layer:** 54 (Technical Documentation)
- **Division:** Chief #5 (Platform Enhancement)
- **Purpose:** Auto-generate docs, maintain knowledge base, API documentation
- **Responsibilities:** TypeDoc/JSDoc parsing, OpenAPI specs, documentation portal, CI/CD integration
- **Documentation:** ESA_AGENT_64_DOCUMENTATION.md

**Agent #65: Project Tracker Manager**
- **ESA Layer:** 59 (Open Source Management)
- **Division:** Chief #6 (Extended Management)
- **Purpose:** Self-hosted Epic/Story/Task management replacing Jira
- **Responsibilities:** Admin UI at /admin/projects, Jira migration, GitHub integration, roadmap planning
- **Documentation:** ESA_AGENT_65_PROJECT_TRACKER.md

**Agent #66: Code Review Expert**
- **ESA Layer:** 53 (CI/CD Pipeline)
- **Division:** Chief #5 (Platform Enhancement)
- **Purpose:** Automated PR analysis, quality gates, security scanning
- **Responsibilities:** Static analysis, test coverage enforcement (≥80%), vulnerability scanning, bundle size limits
- **Documentation:** ESA_AGENT_66_CODE_REVIEW.md

**Agent #67: Community Relations Manager**
- **ESA Layer:** 60 (Version Control/GitHub)
- **Division:** Chief #6 (Extended Management)
- **Purpose:** Open source community management, GitHub automation
- **Responsibilities:** Issue triage, contributor onboarding, release automation, GitHub ↔ Story sync
- **Documentation:** ESA_AGENT_67_COMMUNITY_RELATIONS.md

**Self-Hosted Infrastructure Built:**
- ✅ Database schema: project_epics, project_stories, project_tasks, project_sprints, project_milestones, project_comments
- ✅ All tables created with proper indexes and relations
- ✅ Ready for admin UI development at /admin/projects
- ✅ Jira MUN project data (5 Epics, 15 Stories) ready for migration

**Agent Count Update:**
- Previous: 62 agents (1 CEO + 6 Chiefs + 9 Domains + 61 Layers + 7 Experts - overlaps + 16 Life CEO)
- **New Total: 67 agents** (added 5 project management specialists)

**Next Steps:**
1. Build admin UI at /admin/projects (Agent #65 leads)
2. Migrate MUN data from Jira to self-hosted (Agents #63 + #65)
3. Implement GitHub integration (Agent #67)
4. Configure code review automation (Agent #66)
5. Generate platform documentation (Agent #64)