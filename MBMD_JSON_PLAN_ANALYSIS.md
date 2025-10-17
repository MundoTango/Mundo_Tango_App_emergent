# 🔍 MB.MD Analysis: Full Technical + Strategic Plan JSON
**File**: `Marketing site, Resume AI, agents_1760743011995.json`  
**Date**: October 17, 2025  
**Analysis Method**: MB.MD (Research → Plan → Integration Strategy)  
**Status**: Research & Planning Complete | ⚠️ **DO NOT BUILD YET**

---

## 📊 **EXECUTIVE SUMMARY**

### **What This Document Is**
A comprehensive technical and strategic plan dated October 6, 2025 for **Mundo Tango** with THREE distinct applications:
1. **Marketing Site** (port 5173) - Public-facing tango social platform
2. **Talent Match** (port 5174) - Volunteer recruitment with AI Resume Clarifier
3. **Server API** (port 4000) - Backend services for both apps

### **Current State vs. Plan**
| Aspect | JSON Plan | Your Current Platform |
|--------|-----------|----------------------|
| **Architecture** | 3 separate apps (marketing, talent, server) | 1 unified app (all-in-one) |
| **Ports** | 4000, 5173, 5174 | 5000 (single port) |
| **Focus** | Marketing + Volunteer recruiting | Social platform (memories, events) |
| **Agents** | 41 named agents across 4 categories | 246+ agents across 10 categories |
| **Database** | Supabase | PostgreSQL (current) |
| **Auth** | Supabase Auth | Replit OAuth + JWT |

**Key Insight**: This JSON is an **earlier, parallel vision** of Mundo Tango. Your current platform has **evolved beyond** this plan.

---

## 📋 **DETAILED BREAKDOWN: 10 MAJOR SECTIONS**

### **1. VISION & STORY**
```json
"core_story": "A dedicated, privacy-first social platform for tango"
"differentiators": [
  "Tango-focused social graph and memories",
  "Volunteer-first platform development (Talent Match)",
  "Open-source friendly stack and governance",
  "Future travel/housing integrations"
]
```

**What it says**:
- Privacy-first is core value
- Volunteer-built platform (unique!)
- Open-source governance model
- Travel/housing as future features

**Integration notes**:
- ✅ Privacy: Already have public/friends/private controls
- ⚠️ Volunteer recruiting: Talent Match app not yet built
- ✅ Travel: Already have travel planning features
- ✅ Housing: Housing marketplace already exists

---

### **2. AUDIENCES (5 Types)**
The plan identifies **5 distinct audiences** with different needs and channels:

#### **A. Dancers**
- **Needs**: Discover events, share memories, connect
- **Channels**: Instagram, TikTok, IG Reels
- **Journey**: Browse → Discover → Sign up → Share

#### **B. Organizers**
- **Needs**: Promote events, find volunteers, cross-post
- **Channels**: Facebook, Email, WhatsApp
- **Journey**: List event → Promote → Manage RSVPs

#### **C. Teachers**
- **Needs**: Visibility, workshops, travel support
- **Channels**: Instagram, YouTube
- **Journey**: Create profile → List workshops → Book travel

#### **D. DJs/Musicians**
- **Needs**: Gigs, profile, travel
- **Channels**: Facebook, Instagram
- **Journey**: Profile → Find gigs → Promote music

#### **E. Volunteers/Builders**
- **Needs**: Meaningful contributions, clear tasks, recognition
- **Channels**: GitHub, LinkedIn, Twitter/X
- **Journey**: Upload resume → Clarifier interview → Get tasks → Contribute

**Critical Discovery**: Your current J1-J4 journey agents DON'T cover all 5 audiences!

**Missing Journey Agents**:
- J5: Organizer Journey (promote event → manage RSVPs)
- J6: Teacher Journey (profile → workshops → travel)
- J7: DJ/Musician Journey (profile → gigs → music)
- J8: Volunteer/Builder Journey (resume → clarifier → tasks → contribute)

---

### **3. GOALS & TIMELINE**

| Phase | Goal | Timeline | KPIs |
|-------|------|----------|------|
| **Phase 1: MVP** | 1,000 signups (US, EU, Argentina) | 12 weeks | Signups, CAC, engagement |
| **Phase 2: Travel** | 500 bookings | 20 weeks | Booking rate, revenue |
| **Phase 3: Cross-Community** | 3 new verticals | 36 weeks | New communities, retention |
| **Ongoing** | Retention | Continuous | 30d/90d return rates |

**Integration notes**:
- Current platform ready for Phase 1 (has signup, memories, events)
- Phase 2 features partially built (travel planning exists)
- Phase 3 is future expansion

---

### **4. ARCHITECTURE: 3-App System**

#### **App 1: Marketing Site (Port 5173)**
```json
"routes": ["/", "/discover", "/volunteer", "/about", "/join"]
"stack": "React + Vite + Tailwind"
"theme": { "gradient": ["#5EEAD4", "#155E75"] }
```

**Purpose**: Public-facing landing and marketing pages  
**Integration**: This is **separate from** your current app  
**Theme**: ✅ MATCHES your MT Ocean theme exactly!

---

#### **App 2: Talent Match (Port 5174)**
```json
"routes": [
  "/ (Upload)", 
  "/clarifier", 
  "/recommendations", 
  "/profile",
  "/admin/taskboard",
  "/admin/pipeline", 
  "/admin/approvals",
  "/admin/audit"
]
```

**Purpose**: Volunteer recruitment with AI Resume Clarifier  
**Flow**:
1. User uploads resume or pastes LinkedIn URL
2. AI Clarifier interviews them (chat interface)
3. Agent signals detect skills → suggest tasks
4. Apply → Admin approval → Assigned!

**This is COMPLETELY NEW** - not built in current platform.

**Resume AI Clarifier Logic**:
```json
"signals_detection": [
  "backend, node, api → BackendDevelopment.Agent",
  "security, rls, auth → Security.Agent",
  "sql, database, schema → DatabaseDesign.Agent",
  "react, ui, accessibility → FrontendDevelopment.Agent"
]
```

The Clarifier:
- Reads resume/LinkedIn
- Detects skill signals
- Asks adaptive follow-up questions
- Maps to specific tasks with hours estimate
- Example: "backend + node" → suggests "Harden Express endpoints (3 hours)"

**Integration potential**: This could recruit volunteers to help build YOUR platform!

---

#### **App 3: Server API (Port 4000)**
```json
"base_url": "/api/v1"
"endpoints": [
  "GET /health",
  "GET /esa (return ESA registry)",
  "POST /volunteers/resumes",
  "POST /volunteers/clarifier/session",
  "POST /volunteers/clarifier/message",
  "POST /volunteers/match/suggest",
  "GET /tasks",
  "GET /admin/assignments",
  "POST /admin/assignments/:id/status",
  "GET /admin/audit",
  "POST /admin/notify"
]
```

**Purpose**: Backend API for both marketing site and Talent Match  
**Port**: 4000 (different from your current 5000)

**Data Model** (5 new tables):
1. `volunteers` - Volunteer profiles
2. `resumes` - Resume storage and parsed text
3. `clarifier_sessions` - AI interview logs
4. `tasks` - Open tasks for volunteers
5. `assignments` - Task assignments (pending/approved/rejected)

**RLS (Row Level Security)**: Enabled on all tables  
**Auth**: Supabase Auth + JWT for admin

---

### **5. AGENTS ARCHITECTURE (41 Named Agents)**

The JSON defines **41 specific agents** across **4 categories**:

#### **Engineering Core (21 Agents)**
```
Requirements → Architecture → Database → API → UI/UX → 
Environment → Core Infrastructure → Basic Features → 
Advanced Features → Frontend → Backend → Integration → 
Mobile → Testing → Documentation → Security → 
Deployment → Monitoring → Observability → Scaling → Maintenance
```

**These map to 21 SEQUENTIAL BUILD PHASES!** (answered your question about phases!)

#### **Marketing (5 Agents)**
```
BrandArchitect → ContentFunnel → CommunityStoryteller → 
OSSEvangelist → Analytics
```

#### **Hire/Volunteer (5 Agents)**
```
VolunteerArchitect → ATS → OrgPsych → Governance → UXHiring
```

#### **Executive (5 Agents)**
```
CEO → CTO → COO → CFO → CPO
```

**Plus "shadowing rules"**:
- Phases 1-5: Marketing/Volunteer agents shadow planning
- Phases 6-15: Engineering agents co-pilot build
- Phases 16-21: Governance/Security review operations

---

### **6. IMPLEMENTATION DETAILS**

#### **Clarifier Logic (The AI Interview System)**

**Inputs**:
- Resume text or LinkedIn URL
- Chat history
- ESA.json (agent registry)

**Question Policy**:
- Ask about scope preferences
- Ask hours/week and timeframe
- Ask recent tools/languages
- Ask 1-2 concrete project examples

**Task Mapping Examples**:
```json
{
  "id": "t-rls-checklist",
  "title": "Draft RLS checklist",
  "hours": 4,
  "reason": "security/rls signal detected in resume"
}
```

**This is sophisticated matching logic** - could be very valuable!

---

#### **Docs Layer**
```json
"path": "/docs"
"files": [
  "ESA.md",
  "ESA.json",
  "AI_ClarifierLogic.md",
  "phases/*",  // ← Phases 01-21!
  "DEPLOYMENT.md",
  "SCALING.md",
  "MAINTENANCE.md"
]
```

**Runtime Hooks**:
- Server loads ESA.json at boot
- Clarifier reads AI_ClarifierLogic.md for prompts

**Integration**: These docs should exist in `/docs` directory

---

### **7. SECURITY & PRIVACY**

```json
"auth": "JWT for admin endpoints; Supabase auth for users"
"rls": "Enable on volunteers, resumes, clarifier_sessions, assignments, tasks"
"consent": "Explain full-career résumé philosophy; allow deletion and export"
"logging": "Request IDs; redact PII; audit trail for admin actions"
```

**Key principles**:
- Row Level Security (RLS) on ALL volunteer data
- GDPR-compliant (export/delete rights)
- Audit trail for admin actions
- PII redaction in logs

**Integration**: These are best practices to apply to YOUR platform too

---

### **8. ROADMAP (4 Milestones)**

| Milestone | Weeks | Deliverables |
|-----------|-------|--------------|
| **MVP Launch** | 12 | Marketing pages, Server v1, Talent Match v1 (mock clarifier) |
| **AI Upgrade** | 20 | OpenAI/NotebookLM integration, resume parsing, better task scoring |
| **Travel/Map** | 28 | Discover map with events, partner links, housing recs MVP |
| **Community Scaling** | 36 | Ambassador program, localization/i18n, new hobbies pilot |

**Integration notes**:
- Your platform is already at "Travel/Map" milestone (week 28!)
- You're AHEAD of this plan's timeline

---

### **9. DEPLOYMENT (Replit-Specific)**

```json
"replit_steps": [
  "Upload server/, marketing-site/, talent-match/, docs/",
  "Set env vars in each app",
  "Run npm install in each; then npm run dev",
  "Open ports: 4000, 5173, 5174"
]
"optional_monorepo": "Use npm workspaces with concurrently to run all apps"
```

**Key insight**: Plan assumes **monorepo structure** with 3 separate apps

**Integration challenge**: Your current platform is **single-app**, not multi-app

---

### **10. GOVERNANCE & RISKS**

**Code of Conduct**:
- Respect all community members
- Equal opportunity for assignments
- Data rights (export/delete)
- Auditable admin actions

**Risks & Mitigations**:
| Risk | Mitigation |
|------|------------|
| AI suggestions misaligned | Human-in-the-loop admin approval |
| RLS misconfiguration | Security review in Phase 16 |
| Volunteer drop-off | Short clarifier, instant previews |
| Design inconsistency | Shared Tailwind theme |
| Replit resource limits | Run services separately |

---

## 🎯 **INTEGRATION STRATEGY**

### **Option 1: Merge Concepts (Recommended)**

**What to take from JSON plan**:
1. ✅ **5 Audience Types** → Expand J1-J4 to J1-J8 journey agents
2. ✅ **Talent Match concept** → Build volunteer recruiting system
3. ✅ **Resume AI Clarifier** → Use for finding platform contributors
4. ✅ **41 Agent types** → Map to your existing 246+ agents
5. ✅ **21 Sequential Phases** → Use for rebuild plan
6. ✅ **Governance principles** → Apply to your platform
7. ✅ **Marketing site routes** → Add `/discover`, `/volunteer`, `/about`, `/join`

**What to keep from current platform**:
1. ✅ **Single unified app** (not 3 separate apps)
2. ✅ **PostgreSQL** (not Supabase)
3. ✅ **Port 5000** (not 4000/5173/5174)
4. ✅ **246+ agent architecture** (more advanced than 41)
5. ✅ **Replit OAuth** (not Supabase Auth)

---

### **Option 2: Build Talent Match as Separate App**

**If you want the volunteer recruiting system**:
1. Create `/talent-match` subdirectory
2. Run on port 5174 (as per plan)
3. Connect to same PostgreSQL database
4. Add the 5 new tables (volunteers, resumes, clarifier_sessions, tasks, assignments)
5. Build AI Resume Clarifier
6. Integrate with main platform

**Use case**: Recruit volunteers to help build Mundo Tango!

---

### **Option 3: Marketing Site as Landing Page**

**Build separate marketing site**:
1. Create `/marketing-site` subdirectory
2. Run on port 5173
3. Public routes: `/`, `/discover`, `/volunteer`, `/about`, `/join`
4. Links to main platform on port 5000
5. CTA: "Join Mundo Tango" → main app
6. CTA: "Volunteer to Help Build" → Talent Match

**Use case**: Professional landing page for acquisition

---

## 🔑 **KEY INSIGHTS**

### **1. The "21 Phases" YOU Asked About!**

The JSON references **Engineering Core agents** that map to **21 sequential build phases**:

| Phase | Agent | Focus |
|-------|-------|-------|
| 1 | RequirementsAnalysis | Define what to build |
| 2 | ArchitectureDesign | System design |
| 3 | DatabaseDesign | Schema, relationships |
| 4 | APIDesign | Endpoints, contracts |
| 5 | UIUXDesign | User interface design |
| 6 | EnvironmentSetup | Dev environment |
| 7 | CoreInfrastructure | Server, database, auth |
| 8 | BasicFeatures | CRUD operations |
| 9 | AdvancedFeatures | Complex features |
| 10 | FrontendDevelopment | UI implementation |
| 11 | BackendDevelopment | API implementation |
| 12 | IntegrationDevelopment | Connect systems |
| 13 | MobileDevelopment | Mobile optimization |
| 14 | TestingDevelopment | Test suites |
| 15 | Documentation | Docs, guides |
| 16 | Security | Hardening, audits |
| 17 | Deployment | Production setup |
| 18 | Monitoring | Observability |
| 19 | Observability | Advanced monitoring |
| 20 | Scaling | Performance optimization |
| 21 | Maintenance | Ongoing support |

**This is the sequential approach you remember!**

Database (Phase 3) → Backend (Phase 11) → Frontend (Phase 10) → Testing (Phase 14) → Deployment (Phase 17)

---

### **2. Journey Agents Need Expansion**

**Current**: J1-J4 (only 4 journeys)  
**Needed**: J1-J8 (to cover all 5 audiences)

Proposed expansion:
- **J1**: New User (General) - login → register → onboarding
- **J2**: Dancer Journey - discover → events → memories → friends
- **J3**: Organizer Journey - create event → promote → manage RSVPs
- **J4**: Teacher Journey - profile → workshops → travel
- **J5**: DJ/Musician Journey - profile → gigs → music
- **J6**: Power User Journey - advanced features → map → travel
- **J7**: Volunteer/Builder Journey - resume → clarifier → tasks → contribute
- **J8**: Super Admin Journey - admin → monitoring → visual editor

---

### **3. Talent Match is the Missing Piece**

Your platform has:
- ✅ Social features (memories, events, friends)
- ✅ Travel planning
- ✅ Housing marketplace
- ✅ Admin tools

Your platform is missing:
- ❌ **Volunteer recruiting** (Talent Match app)
- ❌ **Resume AI Clarifier** (match volunteers to tasks)
- ❌ **Task management** (open tasks for contributors)
- ❌ **Assignment workflow** (admin approval system)

**This could be your Phase 6 or Phase 7** in the UI rebuild!

---

### **4. Agent Mapping**

| JSON Plan (41 Agents) | Your Platform (246+ Agents) |
|-----------------------|----------------------------|
| RequirementsAnalysis.Agent | ESA Layer 2 (API Structure) + Layer 52 (Documentation) |
| DatabaseDesign.Agent | ESA Layer 5 (Database) |
| Security.Agent | ESA Layer 49 (Security Hardening) |
| VolunteerArchitect.Agent | **NEW** - need to create |
| BrandArchitect.Agent | **NEW** - maps to marketing agents |
| CEO.Agent | Agent #0 (CEO Strategic Orchestrator) ✅ |

**Most agents from JSON are already covered** by your 61 ESA layers!  
**New agent types** (marketing, volunteer) could be added as categories.

---

### **5. Documentation Requirements**

JSON plan expects these files in `/docs`:
1. `ESA.md` - Agent registry documentation
2. `ESA.json` - Machine-readable agent definitions
3. `AI_ClarifierLogic.md` - Resume interview prompts
4. `phases/` - Directory with 21 phase documents
5. `DEPLOYMENT.md` - Deployment guide
6. `SCALING.md` - Scaling strategies
7. `MAINTENANCE.md` - Ongoing maintenance

**Action**: Create these docs in Phase 0!

---

## 📊 **INTEGRATION PRIORITY MATRIX**

| Feature | Priority | Effort | Value | Integration Phase |
|---------|----------|--------|-------|------------------|
| **5 Audiences → 8 Journey Agents** | 🔴 HIGH | Medium | High | Phase 0 (Agent Prep) |
| **21 Sequential Phases** | 🔴 HIGH | Low | High | Phase 0 (Documentation) |
| **Marketing Routes** | 🟡 MEDIUM | Low | Medium | Phase 1 (Foundation) |
| **Talent Match App** | 🟢 LOW | High | High | Phase 6 (Future) |
| **Resume AI Clarifier** | 🟢 LOW | Very High | Very High | Phase 7 (Future) |
| **/docs Layer** | 🔴 HIGH | Medium | High | Phase 0 (Agent Prep) |
| **Governance Principles** | 🟡 MEDIUM | Low | Medium | Phase 5 (Admin) |
| **Audit Trail** | 🟡 MEDIUM | Medium | High | Phase 5 (Admin) |

---

## ✅ **RECOMMENDED ACTIONS**

### **Immediate (Phase 0 - Agent Prep)**
1. ✅ Expand Journey Agents from J1-J4 to J1-J8 (cover all 5 audiences)
2. ✅ Create `/docs` directory with ESA.md, ESA.json, phases/
3. ✅ Document 21 Sequential Build Phases
4. ✅ Map JSON's 41 agents to your 246+ agents
5. ✅ Update replit.md with integrated vision

### **Short-term (Phase 1-2 - Foundation & Core)**
1. Add marketing routes: `/discover`, `/volunteer`, `/about`, `/join`
2. Build public landing page experience
3. Implement audience-specific onboarding

### **Medium-term (Phase 3-5 - Social & Advanced)**
1. Create volunteer CTA: "Help Build Mundo Tango"
2. Design Talent Match user flow
3. Plan Resume AI Clarifier logic

### **Long-term (Phase 6+ - Future)**
1. Build full Talent Match app (port 5174)
2. Implement AI Resume Clarifier
3. Create task management system
4. Build admin approval workflow

---

## 🎓 **LEARNINGS**

### **What the JSON Teaches Us**:
1. **Vision clarity**: Volunteer-built platform is unique differentiator
2. **Audience segmentation**: 5 distinct user types need different journeys
3. **Sequential phases**: 21-phase approach prevents system overload
4. **AI-powered recruiting**: Resume Clarifier is sophisticated matching system
5. **Governance matters**: Data rights, auditability, transparency are core

### **How Your Platform Evolved Beyond It**:
1. **More agents**: 246+ vs 41 (6x more sophisticated)
2. **More features**: Already at week 28 milestone (Travel/Map)
3. **Unified architecture**: Single app vs 3 separate apps
4. **Advanced AI**: Multi-model routing (GPT-4o, Claude, Gemini) vs single model

---

## 🚀 **FINAL RECOMMENDATION**

### **Phase 0: Integrate the Best of Both**

**From JSON Plan**:
- ✅ 8 Journey Agents (expand from 4)
- ✅ 21 Sequential Build Phases (document them)
- ✅ 5 Audience Types (tailor experiences)
- ✅ /docs layer (create documentation)
- ✅ Governance principles (apply to platform)

**From Current Platform**:
- ✅ 246+ agent architecture (keep and enhance)
- ✅ Unified single-app design (simpler)
- ✅ Advanced features (travel, housing already built)
- ✅ PostgreSQL + Replit OAuth (current stack)

**Result**: Best of both worlds - comprehensive documentation and planning from JSON, advanced implementation from current platform.

---

*MB.MD Analysis completed with critical thinking*  
*Ready for integration planning in Phase 0*
