# ESA Agent System - Quick Context Reference
**For Replit Agent: Fast navigation & task templates**

Last Updated: October 8, 2025  
ESA Framework: 61 Layers, 11 Agent Domains  
Status: Production Ready

---

## 📍 Quick File Locations

### Core Agent Files
```
server/esa-agents/
├── agent-system.ts              # Core agent infrastructure (Agents 1-3)
├── specialized-agents.ts        # Agents 4-9 (Real-time, Business, Search, Life CEO, Platform, Master)
├── ai-research-expert.ts        # Agent 10: AI Research & Innovation
├── ui-ux-expert.ts             # Agent 11: UI/UX & Graphic Design (NEW)
└── [future agents here]

server/routes/
├── routes.ts                    # Main route registration
├── ai-expert.ts                # AI Research Expert API
├── ui-ux.ts                    # UI/UX Expert API (NEW)
└── [other route files]

server/
├── esa-master-knowledge-graph.json  # Agent domain definitions
├── index-novite.ts                  # Server entry point
└── jobs/                            # Scheduled jobs (cron)
```

### Schema & Database
```
shared/schema.ts                 # All database schemas (Drizzle)
drizzle.config.ts               # Database config (DO NOT EDIT)
```

### Frontend
```
client/src/
├── components/                  # UI components
│   ├── glass/                  # Aurora Tide glassmorphic components
│   ├── animations/             # Framer Motion wrappers
│   └── interactions/           # Micro-interactions (magnetic, pulse, ripple)
├── pages/                      # Route pages (wouter)
└── hooks/                      # Custom hooks (useScrollReveal, etc.)
```

### Documentation
```
ESA_MASTER_ORCHESTRATION.md     # Master framework guide
docs/pages/esa-agents/index.md  # Agent system documentation
docs/pages/design-systems/aurora-tide.md  # UI/UX design system
replit.md                       # Project summary & preferences
```

---

## 🤖 Agent Domains (11 Total)

### Infrastructure & Core (Agents 1-3)
| Agent | ID | Layers | Purpose |
|-------|----|----|---------|
| **Infrastructure Orchestrator** | `1_infrastructure_orchestrator` | 1-6 | DB, API, Auth, RBAC, Validation |
| **Frontend Coordinator** | `2_frontend_coordinator` | 7-10 | State, React, UI, Components |
| **Background Processor** | `3_background_processor` | 14-16 | Cache, Jobs, Notifications |

### Communications & Business (Agents 4-6)
| Agent | ID | Layers | Purpose |
|-------|----|----|---------|
| **Real-time Communications** | `4_realtime_communications` | 11, 25 | WebSocket, Messaging |
| **Business Logic Manager** | `5_business_logic_manager` | 21-24, 26-30 | Users, Groups, Payments, Social |
| **Search & Analytics** | `6_search_analytics` | 17-20 | Search, Analytics, Content, Testing |

### Intelligence & Enhancement (Agents 7-9)
| Agent | ID | Layers | Purpose |
|-------|----|----|---------|
| **Life CEO Core** | `7_life_ceo_core` | 31-46 | 16 AI sub-agents (GPT-4o) |
| **Platform Enhancement** | `8_platform_enhancement` | 47-56 | Mobile, Security, DevOps, i18n |
| **Master Control** | `9_master_control` | 57-61 | Automation, Integrations, QA |

### Specialized Experts (Agents 10-11)
| Agent | ID | Layers | Purpose |
|-------|----|----|---------|
| **AI Research Expert** | `10_ai_research_expert` | 31,32,35,36,37,38,44,45,58 | AI ecosystem monitoring, tool discovery |
| **UI/UX Design Expert** | `11_ui_ux_expert` | 9,10,47,54,55 | Aurora Tide, design system, accessibility |

---

## 🛠️ Common Tasks - Quick Templates

### Task 1: Add New Agent
```markdown
[AGENT REQUEST]
Action: create_agent
Name: [agent-name]
Pattern: ai-research-expert.ts (copy this structure)
Layers: [X, Y, Z]
Files to create:
  - server/esa-agents/[agent-name].ts
  - server/routes/[agent-name].ts
Files to edit:
  - server/esa-master-knowledge-graph.json (add agent_domains.##_agent_name)
  - server/routes.ts (register routes)
  - server/esa-agents/agent-system.ts (import and initialize)
```

**Steps:**
1. Copy `server/esa-agents/ai-research-expert.ts` as template
2. Update class name, constructor, layers, capabilities
3. Add to knowledge graph JSON
4. Create API routes file
5. Register in `server/routes.ts`
6. Import in `agent-system.ts`
7. Test with API endpoint

### Task 2: Add API Endpoint
```markdown
[API REQUEST]
Action: create_endpoint
Route: /api/[domain]/[action]
Method: GET | POST | PUT | DELETE
Files to edit:
  - server/routes/[domain].ts (create handler)
  - server/routes.ts (register route if new domain)
```

### Task 3: Database Schema Change
```markdown
[DATABASE REQUEST]
Action: update_schema
Files to edit:
  - shared/schema.ts (add/modify table)
Command to run:
  - npm run db:push --force (if data loss warning)
  - npm run db:push (safe sync)
```

**CRITICAL:** Never change existing ID column types (serial ↔ varchar)

### Task 4: UI Component (Aurora Tide)
```markdown
[UI REQUEST]
Action: create_component
Design: Aurora Tide (glassmorphic, MT Ocean Theme)
Files to check:
  - client/src/components/glass/GlassComponents.tsx (GlassCard depth 1-4)
  - client/src/components/animations/FramerMotionWrappers.tsx (FadeIn, ScaleIn, etc.)
  - client/src/components/interactions/MicroInteractions.tsx (MagneticButton, PulseButton)
Required:
  - Dark mode variants (dark:)
  - i18next translations (useTranslation)
  - data-testid attributes
  - Accessibility (ARIA)
```

### Task 5: Add Translation
```markdown
[TRANSLATION REQUEST]
Action: add_translation
Pattern: {t('namespace.key', 'Default text')}
Files to check:
  - client/src/i18n/locales/en/[namespace].json
Support: 73 languages (6 primary: EN, ES, FR, DE, IT, PT)
```

---

## 📊 ESA Framework Quick Reference

### 61 Layers Overview
- **1-10:** Foundation (DB, API, UI)
- **11-20:** Core Features (Real-time, Cache, Search, Payments)
- **21-30:** Business Logic (Users, Social, Events, Marketplace)
- **31-46:** AI Intelligence (Agents, Memory, Knowledge Graph)
- **47-56:** Platform (Mobile, Security, Testing, i18n, SEO)
- **57-61:** Extended (Automation, Integrations, Open Source)

### Key Technologies
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, Tailwind CSS, shadcn/ui
- **AI:** OpenAI GPT-4o
- **Real-time:** Socket.io
- **Design:** Aurora Tide (glassmorphic, MT Ocean Theme)
- **i18n:** react-i18next (73 languages)
- **Payments:** Stripe
- **Auth:** JWT + Passport (Replit Auth, Google, GitHub)

---

## 🚀 Agent System Architecture

### Agent Base Class
All agents extend from `Agent` class with:
- `processJob(job)` - Handle queued jobs
- `execute(method, params)` - Direct method calls
- `handleEvent(event, data)` - Event listeners
- `applyPattern(name)` - Apply verified patterns
- `checkAntiPattern(name)` - Detect anti-patterns

### Communication (A2A Protocol)
Agents communicate via:
- **Job Queue:** PostgreSQL-based, no Redis needed
- **Events:** Broadcast to other agents
- **Shared State:** PostgreSQL state manager
- **Patterns:** 20 verified, 15 anti-patterns tracked

### Monitoring
- **Health:** `/api/esa-agents/health`
- **Metrics:** `/admin/agent-metrics`
- **Status:** Each agent has status endpoint

---

## 🎯 Agent Quick Start

### Create New Agent (3 Steps)
1. **Copy template:** `server/esa-agents/ai-research-expert.ts`
2. **Update knowledge graph:** `server/esa-master-knowledge-graph.json`
3. **Register routes:** `server/routes.ts`

### Test Agent
```bash
# Check health
GET /api/esa-agents/health

# Test specific agent
POST /api/[agent-name]/[method]
{ "param": "value" }
```

### Common Agent Methods
- `getLatestNews()` - AI Research Expert
- `analyzeDesign()` - UI/UX Expert
- `optimizePerformance()` - Platform Enhancement
- `generateBrief()` - AI Research Expert
- `auditAccessibility()` - UI/UX Expert

---

## 💡 Design System Quick Reference (Aurora Tide)

### Core Components
```tsx
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, ScaleIn } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton } from '@/components/interactions/MicroInteractions';

// Glassmorphic card with depth
<GlassCard depth={2}>Content</GlassCard>

// Animated entrance
<FadeIn><h1>Title</h1></FadeIn>

// Interactive button
<MagneticButton>Click me</MagneticButton>
```

### MT Ocean Theme Colors
```css
Cyan-300: #5EEAD4
Teal-500: #14B8A6
Teal-600: #0D9488
Teal-700: #0F766E
Cyan-900: #155E75
```

### Dark Mode Pattern
```tsx
className="
  bg-white/80 dark:bg-slate-900/80
  text-slate-900 dark:text-white
  border-cyan-200/30 dark:border-cyan-500/30
"
```

---

## 🔧 Debugging Quick Tips

### Check Logs
```bash
# Server logs
tail -f /tmp/logs/Start_application_*.log

# Specific errors
grep -i "error" /tmp/logs/Start_application_*.log
```

### Database Issues
```bash
# Schema sync
npm run db:push --force

# Check connection
GET /health
```

### Agent Issues
```bash
# Check agent health
GET /api/esa-agents/health

# Check specific agent
GET /api/[agent-name]/status
```

---

## 📝 File Size Guidelines

Keep files focused and maintainable:
- **Max 250 lines** per file (split if larger)
- **Single responsibility** per agent
- **Clear naming** (descriptive, no abbreviations)

---

## 🎨 Code Style (TypeScript)

```typescript
// Always use types from schema
import { type SelectPost } from '@shared/schema';

// Use Zod for validation
import { insertPostSchema } from '@shared/schema';

// React Query v5 (object form)
useQuery({ queryKey: ['/api/posts'], ... })

// Hierarchical cache keys
queryKey: ['/api/posts', postId]  // ✅
queryKey: [`/api/posts/${postId}`]  // ❌
```

---

## 🚦 Quick Checks Before Completing

- [ ] LSP errors cleared (for large refactors)
- [ ] Workflows restarted
- [ ] Database schema synced (`npm run db:push`)
- [ ] API routes registered in `server/routes.ts`
- [ ] Dark mode variants added
- [ ] Translations added (if UI changes)
- [ ] data-testid attributes added
- [ ] Agent registered in knowledge graph

---

**This file provides instant context for Replit Agent to work faster and more accurately on the ESA 61x21 platform.**
