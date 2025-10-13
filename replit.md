# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA Framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference **docs/platform-handoff/esa.md** as the primary entry point.
**CRITICAL:** New agents must be added to ESA_AGENT_ORG_CHART.md (see ESA_NEW_AGENT_GUIDE.md Step 5).

## System Architecture
The platform utilizes a decoupled, microservices-oriented architecture, separating the Life CEO system, Community Platforms, and an Integration Layer.

### UI/UX Decisions
- **Design System**: "MT Ocean Theme" with glassmorphic elements, turquoise-to-blue gradients, design tokens, and an international icon/tooltip system (6 languages). Adheres to Aurora Tide design system for component usage, accessibility (WCAG 2.1 AA compliant), dark mode/i18n coverage. Mobile-first design approach.
- **Mr Blue AI Companion**: Features a realistic 3D humanoid avatar with full animation system using React Three Fiber. Chat interface supports voice (Web Speech API) and text.

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
- **Life CEO**: 16 specialized AI agents with semantic memory and self-learning.
- **Community Platforms**: User profiles, social features, community management (city-specific groups, events, housing listings, interactive map).
- **AI Integration**: AI-powered analytics, user support AI with vector database, ML journey prediction, automated audit learning, and cross-page context preservation. Includes 71 AI agents.
- **Mr Blue AI Companion**: Universal AI companion (Agents #73-80) with role-based content adaptation, 3D avatar, interactive tours, subscription manager, quality validator, and learning coordinator. Conversations stored in localStorage only.
- **Security**: Database Row Level Security (RLS), audit logging, CSRF protection, and multi-factor authentication (2FA).
- **Comprehensive Audit System**: Automated, multi-layer audit system for continuous quality improvement, including page audits and open-source management.
- **Self-Hosted Project Tracker (Agent #65)**: Jira replacement with bidirectional GitHub integration (Epic/Story/Task hierarchy, agent assignment, code linking, and automated sync).
- **Comments System (Agent #65)**: Rich collaboration features with @mentions, threading, file attachments, and activity feed integration.
- **ESA Mind (/admin/esa-mind)**: Context-aware intelligence dashboard for the ESA Framework (105 Agents, 61 Layers) with 7 interactive views and full integration with admin design system.
- **ESA MindMap (Interactive AI Agent & Navigator)**: Globally accessible floating button for Super Admins with quick navigator overlay and interactive AI chat for ESA-compliant suggestions.
- **AI Intelligence Network**: Self-learning user support system with AI Help Button, Smart Page Suggestions (ML-powered next-page predictions), AI Context Bar, Pattern Learning (Agent #68), and Cross-Page Context preservation.
- **Multi-AI Integration Strategy**: Comprehensive AI orchestration framework including Multi-AI decision matrix (Replit AI, Direct OpenAI, Claude, Gemini), prompt engineering framework, long-context AI integration for `esa.md` analysis, AI agent memory systems, and vector database (LanceDB).

### System Design Choices
- **Microservices**: Decoupled architecture for Life CEO, Community Platforms, and Integration Layer.
- **Framework**: Adheres to the ESA Framework (114 Agents, 61 Layers) systematic development methodology.
- **PWA**: Progressive Web App capabilities.
- **Unified Map Architecture**: 100% CDN-free map infrastructure.
- **Route Protection System**: 4-layer production/debug separation.
- **Agent Training**: "Ultra-Micro Parallel Methodology" for rapid agent training and certification.
- **Project Management**: Self-hosted project tracker (Agent #65) with GitHub integration.
- **105-Agent Organizational Structure**: Complete training infrastructure for 105 agents (Meta-agents, Division Chiefs, etc.).
- **17-Phase Tiered Audit System**: Comprehensive audit framework replacing fragmented methodology with unified 5-tier structure and 17 specialized phases.
- **AI Intelligence Network**: Self-learning user support system with cross-page context preservation, ML journey predictions, audit pattern learning, multilingual support, error resolution, and journey prediction, powered by LanceDB.
- **Open Source Deployment Verification (Agent #59)**: Automated tracking and validation of open-source components.
- **Quality Gates Before Work (Principle 5)**: Mandatory 4-gate pre-work protocol for all agents.
- **Collaborative Intelligence Protocol (Agents #79-80)**: Inter-agent learning system for root cause analysis, solution suggestions, and knowledge sharing.

## External Dependencies
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Payment Processing**: Stripe
- **Real-time Communication**: Socket.io
- **Mapping**: Leaflet.js, OpenStreetMap Nominatim API, Google Maps API
- **AI/Machine Learning**: OpenAI GPT-4o, LanceDB (vector database), Replit AI
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
- **Version Control Integration**: GitHub OAuth via Replit connection, @octokit/rest