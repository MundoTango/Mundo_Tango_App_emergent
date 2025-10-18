# MB.MD - Knowledge Management Hub
**Central Gateway to Mundo Tango Development Documentation**  
**Last Updated:** October 18, 2025  
**Purpose:** Navigate all Mr Blue resources, tools, agents, and methodologies

---

## 🚀 Quick Start

**New to Mundo Tango?** Start with these essential documents:

1. **[MB.MD Methodology Overview](#mbmd-methodology)** - Systematic problem-solving framework
2. **[docs/MrBlue/CRITICAL_THINKING_METHODOLOGY.md](docs/MrBlue/CRITICAL_THINKING_METHODOLOGY.md)** - Root cause analysis & avoiding superficial fixes
3. **[AGENT_LEARNING.md](AGENT_LEARNING.md)** - ⚠️ CRITICAL safety protocols for AI agents
4. **[docs/MrBlue/README.md](docs/MrBlue/README.md)** - Complete MrBlue documentation index (115+ files)

---

## 🎯 Critical Safety Documents

⚠️ **READ THESE BEFORE MAKING ANY CHANGES:**

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[AGENT_LEARNING.md](AGENT_LEARNING.md)** | 8 critical rules for AI agents | Before ANY file operations |
| **[docs/MrBlue/DOCUMENTATION_GUARDRAILS.md](docs/MrBlue/DOCUMENTATION_GUARDRAILS.md)** | What file protection ACTUALLY works in Replit | When protecting/recovering files |
| **[docs/MrBlue/PARALLEL_BUILDING_SAFETY.md](docs/MrBlue/PARALLEL_BUILDING_SAFETY.md)** | Safe parallel development patterns | Before parallel work |
| **[docs/MrBlue/FILE_PERSISTENCE_DEEP_DIVE.md](docs/MrBlue/FILE_PERSISTENCE_DEEP_DIVE.md)** | Why files vanish & how to prevent it | When files disappear |
| **[DEPLOYMENT_STABILITY_PLAN.md](DEPLOYMENT_STABILITY_PLAN.md)** | File integrity system & protection | Before deployment |

---

## 📚 MB.MD Methodology

**Systematic Problem Solving:** Mapping → Breakdown → Mitigation → Deployment

### Core Principles

**M - MAPPING:** Understand the problem completely before attempting solutions
- Investigate thoroughly, check logs/errors
- Identify root causes (not symptoms)
- Review related code and documentation

**B - BREAKDOWN:** Organize into manageable, prioritized tasks
- Categorize by type (blocking vs non-blocking)
- Create clear priorities
- Identify dependencies

**M - MITIGATION:** Implement solutions systematically
- Fix in priority order
- Test each fix incrementally
- Verify solutions work

**D - DEPLOYMENT:** Verify solution and document
- Test complete functionality
- Document what was fixed
- Create prevention measures

### When to Use MB.MD

✅ **Always Use For:**
- Deployment blockers
- System-wide failures
- Complex multi-file issues
- Architecture changes
- Performance problems
- Security vulnerabilities

⚠️ **Optional For:**
- Single-file bugs
- UI tweaks
- Simple features

❌ **Don't Use For:**
- Trivial changes (typos)
- Emergency hotfixes

### Success Stories

**Documented Wins:**
1. Documentation deletion crisis → PostgreSQL protection system
2. Import failure cascade → 18 files restored systematically
3. Deployment blocker → Server operational with all features
4. File integrity → 3-layer protection system active

**See:** [docs/MrBlue/MB_MD_COMPLETE_SUMMARY.md](docs/MrBlue/MB_MD_COMPLETE_SUMMARY.md) for detailed case studies

---

## 🤖 Agent System (276 Agents)

### Agent Categories

**Currently Active: 123 / 276 agents (45%)**

| Category | Count | Status | Details |
|----------|-------|--------|---------|
| **ESA Infrastructure** | 60/61 | ✅ Active | Layers 1-61 (Layer 52 disabled) |
| **Leadership & Management** | 14/14 | ✅ Active | CEO + Chiefs + Experts |
| **Operational Excellence** | 5/5 | ✅ Active | Sprint, docs, code review |
| **Life CEO AI** | 1/16 | ⚠️ Partial | Personal life management |
| **Mr Blue Suite** | 8/8 | ✅ Active | Core + 7 specialized |
| **Journey Agents** | 4/8 | ⚠️ Partial | User journey guidance (J1-J4) |
| **Page Agents** | 1/125 | ⚠️ Partial | Page-specific AI |
| **UI Sub-Agents** | 3/3 | ✅ Active | Dark mode, translation, watcher |
| **Algorithm Agents** | 10/10 | ✅ Active | Feed, discovery, recommendations |
| **Specialized Services** | 10/10 | ✅ Active | Email, SMS, media, payments |
| **App Architecture** | 1/6 | ⚠️ Partial | 3-platform coordination |
| **Marketing** | 1/5 | ⚠️ Partial | Content, social, growth |
| **Hire/Volunteer** | 5/5 | ✅ Active | Recruitment, onboarding |

### Agent Documentation

**📁 Core Agent Docs:**
- [docs/agents/AGENT_INDEX.md](docs/agents/AGENT_INDEX.md) - Complete agent catalog
- [docs/agents/MASTER_COORDINATOR_AGENT.md](docs/agents/MASTER_COORDINATOR_AGENT.md) - Central orchestration
- [docs/AGENT_FRAMEWORK_COMPLETE.md](docs/AGENT_FRAMEWORK_COMPLETE.md) - Framework architecture

**📁 ESA Infrastructure:**
- Foundation Layers (1-10): Architecture, API, Auth, State, UI
- Core Features (11-20): Real-time, Files, Cache, Search, Notifications
- Business Logic (21-30): Users, Groups, Events, Social
- AI Infrastructure (31-45): AI Core, Prompts, Context, Knowledge Graph
- Platform Enhancement (46-61): Mobile, Security, DevOps, Testing

**See:** [docs/agents/layers/](docs/agents/layers/) for detailed layer documentation

**📁 Specialized Agents:**
- [docs/agents/life-ceo/](docs/agents/life-ceo/) - 16 Life CEO AI agents
- [server/agents/mr-blue/](server/agents/mr-blue/) - Mr Blue suite implementation
- [docs/agents/operational/](docs/agents/operational/) - Operational excellence agents

---

## 🛠️ Development Tools & Commands

### Core Commands

```bash
# Development
npm run dev                    # Start dev server (port 5000)
npm run build                  # Build for production
npm start                      # Run production server

# Database
npm run db:push                # Sync schema to database
npm run db:push --force        # Force sync (data loss warning)
npm run db:studio              # Open Drizzle Studio GUI

# Documentation Protection
npm run backup-docs            # Backup all .md files to PostgreSQL
npm run restore-docs           # Restore from PostgreSQL
npm run restore-docs -- --file=filename.md  # Restore specific file

# Testing & Quality
npm run integrity-check        # Run file integrity checks
npm run predeploy             # Pre-deployment validation
npm run restore-drill         # Test backup restoration
npx tsc --noEmit              # Check TypeScript errors

# Agent System
# Check agent status in server logs on startup:
# "🎯 Total Agents: 123 / 276 agents registered"
```

### File Structure

```
mundo-tango/
├── client/src/              # Frontend (React + Vite)
│   ├── pages/              # 125+ page components
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Auth, Socket, Tenant contexts
│   └── hooks/              # Custom React hooks
├── server/                 # Backend (Express + TypeScript)
│   ├── agents/            # 276 AI agents
│   │   ├── leadership/    # 14 leadership agents
│   │   ├── layer*.ts      # 61 ESA infrastructure
│   │   ├── life-ceo/      # 16 Life CEO AI
│   │   ├── mr-blue/       # 8 Mr Blue suite
│   │   └── [12+ more categories]
│   ├── routes/            # API endpoints
│   ├── middleware/        # Express middleware
│   └── services/          # Business logic
├── shared/schema.ts       # Drizzle ORM schemas
├── scripts/               # Utility scripts
│   ├── backup-docs-to-db.ts
│   ├── restore-docs-from-db.ts
│   ├── pre-deploy-check.ts
│   └── restore-drill.ts
└── docs/                  # Documentation (350+ files)
    ├── MrBlue/           # 115+ Mr Blue documents
    ├── agents/           # Agent documentation
    ├── ESA_Agents/       # ESA agent specs
    └── audit-reports/    # Platform audits
```

---

## 🔒 File Protection System

### Multi-Layer Protection (✅ ACTIVE)

**Why:** Replit auto-commits can delete documentation after sessions  
**Solution:** Database-backed protection with automated testing

**Protection Layers:**

1. **PostgreSQL Backup** - 406 files (4.37MB) backed up to database
2. **24-Hour Restore Drills** - Automated backup validation every 24h
3. **Pre-Deploy Checks** - Blocks deployment if backups fail
4. **File Integrity Tests** - 26 protection tests before deployment
5. **Critical File Registry** - 85 tracked files in `scripts/critical-files.json`

### Recovery Procedures

```bash
# If files are deleted:
npm run restore-docs

# Test backup system:
npm run restore-drill

# View drill history:
cat restore-drill-log.json | jq '.[-10:]'

# Check protection status:
npm run integrity-check
```

**⚠️ Important:** Git hooks DON'T work in Replit (auto-commits bypass them). Only PostgreSQL backup is reliable.

**See:** [docs/MrBlue/DOCUMENTATION_GUARDRAILS.md](docs/MrBlue/DOCUMENTATION_GUARDRAILS.md) for complete technical details

---

## 📖 Mr Blue Documentation Library

### By Category

**🧠 Methodology & Critical Thinking:**
- [docs/MrBlue/CRITICAL_THINKING_METHODOLOGY.md](docs/MrBlue/CRITICAL_THINKING_METHODOLOGY.md) - Root cause analysis, 5 Whys
- [docs/MrBlue/MB_MD_COMPLETE_SUMMARY.md](docs/MrBlue/MB_MD_COMPLETE_SUMMARY.md) - MB.MD case studies
- [docs/MrBlue/PARALLEL_BUILDING_SAFETY.md](docs/MrBlue/PARALLEL_BUILDING_SAFETY.md) - Safe parallel development

**🛡️ Safety & Protection:**
- [docs/MrBlue/DOCUMENTATION_GUARDRAILS.md](docs/MrBlue/DOCUMENTATION_GUARDRAILS.md) - What ACTUALLY works for file protection
- [docs/MrBlue/FILE_PERSISTENCE_DEEP_DIVE.md](docs/MrBlue/FILE_PERSISTENCE_DEEP_DIVE.md) - Why files vanish (technical deep dive)
- [AGENT_LEARNING.md](AGENT_LEARNING.md) - 8 critical rules for AI agents

**🚀 Quick References:**
- [docs/MrBlue/QUICK_START.md](docs/MrBlue/QUICK_START.md) - MB.MD v4.0 quick start
- [docs/MrBlue/QUICK_ACTION_SUMMARY.md](docs/MrBlue/QUICK_ACTION_SUMMARY.md) - Fast action guide
- [TESTING_QUICK_REFERENCE.md](docs/TESTING_QUICK_REFERENCE.md) - Testing patterns

**📊 Phase Reports (Phases 1-11):**
- [docs/MrBlue/mb-phase1-COMPLETE.md](docs/MrBlue/mb-phase1-COMPLETE.md) - Foundation
- [docs/MrBlue/mb-phase2-complete.md](docs/MrBlue/mb-phase2-complete.md) - Core features
- [docs/MrBlue/mb-phase4-execution-complete.md](docs/MrBlue/mb-phase4-execution-complete.md) - Integration
- [docs/MrBlue/mb-phase5-complete.md](docs/MrBlue/mb-phase5-complete.md) - Intelligence
- [docs/MrBlue/phase7-completion-report.md](docs/MrBlue/phase7-completion-report.md) - ESA integration
- [docs/MrBlue/PHASE8-COMPLETION-REPORT.md](docs/MrBlue/PHASE8-COMPLETION-REPORT.md) - Testing
- [docs/MrBlue/PHASE9-COMPLETION-REPORT.md](docs/MrBlue/PHASE9-COMPLETION-REPORT.md) - Optimization
- [docs/MrBlue/PHASE10-COMPLETION-REPORT.md](docs/MrBlue/PHASE10-COMPLETION-REPORT.md) - Production ready
- [docs/MrBlue/PHASE11-SUMMARY.md](docs/MrBlue/PHASE11-SUMMARY.md) - Final polish

**🏗️ Architecture & Implementation:**
- [docs/MrBlue/TRACK_8_MR_BLUE_INTELLIGENCE_ARCHITECTURE.md](docs/MrBlue/TRACK_8_MR_BLUE_INTELLIGENCE_ARCHITECTURE.md) - Intelligence architecture
- [docs/MrBlue/TRACK_9_VISUAL_TOOL_ARCHITECTURE.md](docs/MrBlue/TRACK_9_VISUAL_TOOL_ARCHITECTURE.md) - Visual editor architecture
- [docs/MrBlue/3_LAYER_DEPLOYMENT_PLAN.md](docs/MrBlue/3_LAYER_DEPLOYMENT_PLAN.md) - Deployment strategy
- [docs/MrBlue/FINAL_MR_BLUE_IMPLEMENTATION.md](docs/MrBlue/FINAL_MR_BLUE_IMPLEMENTATION.md) - Complete implementation

**📈 Execution & Build Reports:**
- [docs/MrBlue/PARALLEL_EXECUTION_COMPLETE.md](docs/MrBlue/PARALLEL_EXECUTION_COMPLETE.md) - Parallel build success
- [docs/MrBlue/BUILD_COMPLETE_SUMMARY.md](docs/MrBlue/BUILD_COMPLETE_SUMMARY.md) - Build completion
- [docs/MrBlue/100_PERCENT_COMPLETE.md](docs/MrBlue/100_PERCENT_COMPLETE.md) - 100% completion milestone
- [docs/MrBlue/MB_MD_PARALLEL_COMPLETE.md](docs/MrBlue/MB_MD_PARALLEL_COMPLETE.md) - Parallel MB.MD execution

**🔍 Audits & Analysis:**
- [docs/MrBlue/COMPREHENSIVE_PLATFORM_AUDIT_COMPLETE.md](docs/MrBlue/COMPREHENSIVE_PLATFORM_AUDIT_COMPLETE.md) - Platform audit
- [docs/MrBlue/COMPREHENSIVE_CODEBASE_AUDIT.md](docs/MrBlue/COMPREHENSIVE_CODEBASE_AUDIT.md) - Codebase audit
- [docs/MrBlue/audit-results.json](docs/MrBlue/audit-results.json) - Audit data

**🎓 Research & Learning:**
- [docs/MrBlue/COMPREHENSIVE_EXPERT_RESEARCH_PHASE.md](docs/MrBlue/COMPREHENSIVE_EXPERT_RESEARCH_PHASE.md) - Expert research
- [docs/MrBlue/RESEARCH_PHASE_COMPLETE_SUMMARY.md](docs/MrBlue/RESEARCH_PHASE_COMPLETE_SUMMARY.md) - Research summary
- [docs/MrBlue/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md](docs/MrBlue/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md) - Agent onboarding

### Complete Index

**📁 Full Mr Blue Library:** [docs/MrBlue/README.md](docs/MrBlue/README.md) (115+ documents)

---

## ⚠️ Critical Watchouts & Lessons Learned

### From AGENT_LEARNING.md (8 Critical Rules)

1. **⚠️ NEVER delete files** - Archive to `docs/archived/` instead
2. **⚠️ Ask before deleting** - Get user approval for ANY file deletion
3. **⚠️ Test file integrity** - Run `tsx scripts/test-file-protection.ts` before deployment
4. **⚠️ Protected resources:**
   - `docs/` folder (350+ files)
   - Root `.md` files
   - `scripts/` protection system
   - `server/agents/` 276-agent system
   - `shared/schema.ts` database schema
   - `client/src/pages/` UI pages

**Recovery:** `npm run restore-docs` if files are deleted

### From DOCUMENTATION_GUARDRAILS.md

**What DOESN'T Work in Replit:**
- ❌ Git pre-commit hooks (auto-commits bypass them)
- ❌ File watchers (can't prevent deletion)
- ❌ `.gitattributes` protection

**What ACTUALLY Works:**
- ✅ PostgreSQL backup (only real protection)
- ✅ Manual validation before deployment
- ✅ Replit rollback (last resort)

### From FILE_PERSISTENCE_DEEP_DIVE.md

**Why Files Vanish:**
1. **Working directory vs git HEAD desync** - Files exist on disk but git thinks they're deleted
2. **Checkpoint isolation** - Each session may have different file states
3. **Ephemeral storage** - Some files may not persist between sessions

**Solution:** PostgreSQL backup is the ONLY reliable protection

### From PARALLEL_BUILDING_SAFETY.md

**Parallel Work Red Flags:**
- Shared state modifications (database schema, config files)
- Overlapping file edits
- Dependency chains (A depends on B)
- Integration endpoints (both modifying same API)

**Safe Patterns:**
- Feature flags (independent toggles)
- API versioning (v1, v2 endpoints)
- Separate modules (no shared files)

---

## 🎯 Current Platform Status

**Deployment Status:** ✅ Production-Ready (October 18, 2025)

### Working Features
- ✅ Server running on port 5000
- ✅ Socket.io real-time features operational
- ✅ JWT authentication with refresh tokens
- ✅ Global error handling
- ✅ Rate limiting
- ✅ WebSocket heartbeat & room management
- ✅ 123/276 agents active (45%)
- ✅ Database optimized (sub-millisecond queries)
- ✅ File protection system active

### Recent Fixes (October 18, 2025)
- ✅ Socket.io connection fixed (aligned /ws paths)
- ✅ TenantContext JSON parsing error resolved
- ✅ Page load optimized (22s → 19s in dev)
- ✅ Vite code splitting configured for production
- ✅ 18 cascading import failures systematically resolved

### Next Steps
- 📋 Complete remaining 153 agents (216 agent category files)
- 📋 Re-enable responseTime middleware
- 📋 Implement LocationIQ integration
- 📋 Deploy Mr Blue Visual Editor
- 📋 Production deployment with <5s load time

**See:** [DEPLOYMENT_SUCCESS_REPORT.md](DEPLOYMENT_SUCCESS_REPORT.md) for complete deployment details

---

## 📞 Need Help?

### Quick Navigation

| Task | Go To |
|------|-------|
| Understanding MB.MD methodology | [This file - MB.MD Methodology section](#mbmd-methodology) |
| Learning critical thinking | [docs/MrBlue/CRITICAL_THINKING_METHODOLOGY.md](docs/MrBlue/CRITICAL_THINKING_METHODOLOGY.md) |
| File disappeared | [docs/MrBlue/FILE_PERSISTENCE_DEEP_DIVE.md](docs/MrBlue/FILE_PERSISTENCE_DEEP_DIVE.md) |
| Parallel development | [docs/MrBlue/PARALLEL_BUILDING_SAFETY.md](docs/MrBlue/PARALLEL_BUILDING_SAFETY.md) |
| Agent system details | [docs/agents/AGENT_INDEX.md](docs/agents/AGENT_INDEX.md) |
| Platform architecture | [replit.md](replit.md) |
| Testing patterns | [docs/TESTING_QUICK_REFERENCE.md](docs/TESTING_QUICK_REFERENCE.md) |
| Browse all Mr Blue docs | [docs/MrBlue/README.md](docs/MrBlue/README.md) |

### External Resources

- **Replit Documentation:** https://docs.replit.com
- **Platform Status:** Check server logs for agent counts
- **Git History:** `git log --oneline` to view changes

---

**Last Updated:** October 18, 2025  
**Maintained By:** Mundo Tango Development Team  
**Version:** 2.0 - Restructured as Knowledge Management Hub  
**Total Documentation:** 406+ files backed up, 350+ active documents
