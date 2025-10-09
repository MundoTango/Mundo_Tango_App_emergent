# Life CEO & Multi-Community Platform

## Overview
This project is an AI-powered life management system (Life CEO) integrated with independent, data-isolated social community platforms. It features 16 specialized AI agents for personalized life management via a mobile-first, voice-controlled interface. Community Platforms offer social networking, event management, and real-time messaging. An Integration Layer ensures secure, API-based communication while maintaining data isolation. Built on the ESA LIFE CEO 61x21 framework, the platform prioritizes security, performance, and user experience, featuring a global payment system, advanced internationalization, comprehensive administrative controls, and AI-driven performance optimization. It is designed as a production-ready system with full AI integration, PWA capabilities, and enterprise-grade security, targeting significant market potential and ambitious growth.

## User Preferences
Preferred communication style: Simple, everyday language.
Do not reference monetary values or investment amounts when describing the platform.
When user says "Use ESA", reference the **ESA_ORCHESTRATION.md** as the primary entry point, which orchestrates:
- ESA.md (61 layers framework)
- docs/pages/esa-agents/index.md (AI agent system)
- docs/pages/design-systems/aurora-tide.md (design standards)
- ESA_DEPLOYMENT_AUDIT.md (deployment audit)
For platform audits, use ESA_DEPLOYMENT_AUDIT.md as the deployment readiness checklist.

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
- **Multi-Agent Learning Framework (ESA 61x21)**: Uses a systematic 6-phase methodology where all 16 ESA agents learn, audit, and optimize features in parallel.

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

## Comprehensive Audit System
The platform features an automated, multi-layer audit system for continuous quality improvement and optimization (Tracks A, B, E complete).

### System Components
- **Track A - Page Audit Infrastructure** ✅: Maps 100+ pages to ESA agents, orchestrates parallel audits, generates consolidated reports
- **Track B - Testing Suite** ✅: Visual regression (6 pages), user journey (5 critical paths), accessibility (WCAG 2.1), translation coverage (68 languages)
- **Track E - Open Source Management** ✅: Dependency analysis (359 packages), security scanning (Snyk), bundle impact analysis, optimization recommendations

### Available Audit Commands
```bash
# Page Audits (Track A)
npm run audit:list              # List all 100 pages
npm run audit-page <name>       # Audit specific page
npm run audit:category <cat>    # Audit by category
npm run audit:all               # Full platform audit

# Testing Suite (Track B)
npm run visual:test            # Visual regression tests
npm run journey:test           # User journey tests
npm run a11y:scan             # Accessibility scan (WCAG 2.1)
npm run translation:scan      # Translation coverage (68 languages)

# Dependencies & Security (Track E)
npm run deps:map              # Analyze 359 packages
npm run security:scan         # Vulnerability scan
npm run bundle:analyze        # Bundle size impact
npm run optimize              # Complete optimization plan
```

### Audit System Documentation
- **Complete Summary:** `docs/pages/esa-tools/audit-system-summary.md` - Full system overview
- **Page Audit System:** `docs/pages/esa-tools/page-audit-system.md` - Page infrastructure details
- **Comprehensive Guide:** `docs/pages/esa-tools/comprehensive-audit-system.md` - Master documentation
- **Page Registry:** `docs/pages/page-audit-registry.json` - 100-page mapping to agents

### Services & Reports
**Services:**
- `server/services/pageAuditOrchestrator.ts` - Multi-agent coordination
- `server/services/dependencyMapper.ts` - Package categorization (27 categories, 18 ESA layers)
- `server/services/securityScanner.ts` - Snyk integration
- `server/services/bundleAnalyzer.ts` - Bundle size impact
- `server/services/optimizationRecommender.ts` - Actionable recommendations
- `server/services/visualRegressionTester.ts` - Visual testing
- `server/services/userJourneyTester.ts` - Critical path testing
- `server/services/accessibilityScanner.ts` - WCAG 2.1 compliance
- `server/services/translationCoverageScanner.ts` - i18n coverage

**Reports saved to:**
- `docs/audit-reports/` - Page quality reports
- `docs/dependency-reports/` - Package analysis
- `docs/security-reports/` - Vulnerability scans
- `docs/bundle-reports/` - Bundle analysis
- `docs/optimization-reports/` - Optimization plans
- `docs/visual-reports/` - Visual regression tests
- `docs/journey-reports/` - User journey tests
- `docs/a11y-reports/` - Accessibility scans
- `docs/translation-reports/` - Translation coverage

### Key Metrics
- **Page Quality:** Score (0-100), critical issues, agent pass/fail - **Latest: 99/100 on memories-feed**
- **Dependencies:** 359 total, 188 uncategorized, 27 categories, 18 ESA layers
- **Security:** Vulnerability counts by severity, upgradable issues - **Latest: 1 high priority fix (lodash)**
- **Bundle:** Total size, heavy packages (>100KB), tree-shaking opportunities
- **Testing:** 6 visual tests, 5 critical user journeys, 6 accessibility checks, 68 language coverage
- **Optimization:** Recommendations by priority, quick wins, potential savings - **Latest: 4 recommendations**

### Multi-Track Build Strategy
- **Track A:** Page Infrastructure ✅ COMPLETE
- **Track B:** Testing Suite ✅ COMPLETE  
- **Track E:** Open Source Management ✅ COMPLETE
- **Track C:** Performance Monitoring - PENDING (Lighthouse CI, Bundle Tracker, Metrics Dashboard)
- **Track D:** CI/CD Automation - PENDING (GitHub Actions, Pre-commit hooks, Scheduled jobs, Notifications)