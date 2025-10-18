# 🎯 MUNDO TANGO MASTER GUIDELINE

**THIS IS YOUR NORTH STAR** - Always follow this when working on Mundo Tango  
**Last Updated:** October 18, 2025 4:30 AM

---

## 📋 **HOW TO STAY FOCUSED**

When starting ANY work on Mundo Tango, **ALWAYS**:

1. **Read this file first** ✓
2. **Check current phase** (see below)
3. **Follow the phase checklist** (don't skip ahead)
4. **Update status** when tasks complete
5. **Review before moving to next phase**

---

## 🎯 **CURRENT PHASE: Phase 0 - Agent Prep**

**Status:** 🟡 20% COMPLETE (Tasks 0.1-0.2 ✅)  
**Priority:** CRITICAL - Must complete before ANY other work  
**Duration:** 17-24 hours remaining (9 hours spent)

### **Phase 0 Checklist:**

**Task 0.1: Update Agent Coordinator** ✅ COMPLETE (2 hours)
- [x] Register all 13 agent categories (was 8, now 13)
- [x] Update startup message to "Mundo Tango Multi-AI Platform (276+ agents) operational"
- [x] Load missing categories:
  - [x] Leadership & Management (14 agents)
  - [x] Mr Blue Suite (8 agents)
  - [x] UI Sub-Agents (3 agents)
  - [x] Algorithm Agents (10 agents)
  - [x] Specialized Services (10 agents)
  - [x] App Architecture Leads (6 agents)
  - [x] Marketing Agents (5 agents)
  - [x] Hire/Volunteer Agents (5 agents)

**Task 0.2: Create Documentation** ✅ COMPLETE (7 hours)
- [x] COMPLETE_AGENT_INVENTORY.md (all 276 agents documented)
- [x] AGENT_ORG_CHART.md (visual hierarchy with interaction flows)
- [x] MB_MD_DEPLOYMENT_STRATEGY.md (rebuild plan already exists)
- [x] Architect approved: Production-ready for stakeholder review

**Task 0.3: Fix Naming References** (3-4 hours)
- [ ] Find all files with "56x21" or "61x21" (146+ files)
- [ ] Replace with current architecture references
- [ ] Verify no old naming remains

**Task 0.4: Wire Page Agents** (8-10 hours)
- [ ] Create usePageAgent hook
- [ ] Create PageAgentContext provider
- [ ] Update all 125+ page components
- [ ] Connect to Mr Blue (#73) for context visibility
- [ ] Restrict Visual Editor (#78) to super admin only

**Task 0.5: Activate Journey Orchestration** (6-8 hours)
- [ ] Implement J1: New User Journey
- [ ] Implement J2: Active User Journey
- [ ] Implement J3: Power User Journey
- [ ] Implement J4: Super Admin Journey
- [ ] Create journey state machine
- [ ] Add journey analytics

---

## 📊 **PHASE OVERVIEW**

```
✅ = Complete | ⚠️ = In Progress | ⏸️ = Planned | ❌ = Not Started

Current Status:
Phase 0: Agent Prep              🟡 20%  (17-24 hrs) ← YOU ARE HERE
Phase 1: Foundation & Auth       ⚠️ 70% (4-6 hrs)
Phase 2: Core UX                 ⚠️ 75% (6-8 hrs)
Phase 3: Social                  ⚠️ 60% (5-7 hrs)
Phase 4: Advanced                ❌ 20% (10-12 hrs)
Phase 5: Admin                   ⚠️ 50% (6-8 hrs)
Database Design                  ✅ 85% (2-3 hrs)
Backend APIs                     ✅ 80% (4-5 hrs)
Frontend Dev                     ⚠️ 70% (10-12 hrs)
Integration                      ⚠️ 75% (3-4 hrs)
Testing                          ❌ 30% (8-10 hrs)
Security                         ⚠️ 60% (4-5 hrs)
Deployment                       ✅ CONFIGURED (2 hrs when ready)
```

---

## 🚨 **CRITICAL RULES**

1. **NEVER skip Phase 0** - It's the foundation for everything
2. **ALWAYS check this file** before starting work
3. **NEVER deploy** until Phase 0 is 100% complete
4. **ALWAYS update status** when completing tasks
5. **NEVER work on multiple phases** at once (finish current first)

---

## 📚 **KEY DOCUMENTS (Read in Order)**

1. **_MT_MASTER_GUIDELINE.md** ← YOU ARE HERE
2. **WHERE_ARE_WE_NOW.md** - Current status snapshot
3. **MB_MD_DEPLOYMENT_STRATEGY.md** - Deployment rules & process
4. **QUICK_STATUS.md** - Quick reference
5. **DEPLOYMENT_SOLUTION.md** - Reserved VM details

---

## 🎯 **WHAT TO DO NEXT**

**RIGHT NOW:**
1. Read WHERE_ARE_WE_NOW.md (understand current state)
2. Start Task 0.1: Update Agent Coordinator
3. Don't skip ahead to other phases

**THIS WEEK:**
- Complete ALL of Phase 0
- Don't build new UI features
- Don't deploy to production yet

**NEXT WEEK:**
- Fix any remaining backend issues
- Complete Phase 1-5 UI
- Prepare for first deployment

---

## 🔄 **UPDATE PROTOCOL**

When you complete a task:

1. Mark checkbox [ ] → [x] in this file
2. Update progress percentage
3. Git commit with clear message
4. Review next task before starting

When you complete a phase:

1. Update phase status (❌ → ⚠️ → ✅)
2. Review deliverables
3. Test thoroughly
4. Move to next phase

---

## 🎯 **SUCCESS CRITERIA**

**Phase 0 is COMPLETE when:**
- [x] All 13 agent categories registered
- [x] 246+ agents visible and operational
- [x] 3 documentation files created
- [x] 0 files with old naming ("56x21"/"61x21")
- [x] 125+ page agents wired to routes
- [x] Mr Blue (#73) sees page context
- [x] Visual Editor (#78) restricted to super admin
- [x] J1-J4 journey flows activated
- [x] Journey state tracking works
- [x] All Phase 0 tests passing

**Only THEN** can you move to fixing UI and deploying!

---

## 📞 **NEED HELP?**

**If stuck:**
1. Re-read this file
2. Check WHERE_ARE_WE_NOW.md
3. Review the specific phase documentation
4. Ask user for clarification

**If tempted to skip ahead:**
1. STOP
2. Re-read "CRITICAL RULES" above
3. Ask: "Is Phase 0 100% complete?"
4. If NO → Go back to Phase 0

---

## 🎯 **DEPLOYMENT RULES**

**Git Push:** ✅ Works (push anytime for backup)

**Deployment:** ⏸️ WAIT until Phase 0 complete

**Why?**
- Agents aren't wired up yet
- Journey flows don't work
- Documentation incomplete
- Platform won't match its promise

**When Phase 0 is done:**
1. Test build locally (npm run build)
2. Click "Publish" button
3. Verify Reserved VM selected
4. Deploy to production
5. Celebrate! 🎉

---

**Last Updated:** October 18, 2025 3:40 AM  
**Current Phase:** Phase 0 (0% complete)  
**Next Milestone:** Complete Task 0.1 (Update Agent Coordinator)  
**Estimated Time to Production:** 4 weeks (if Phase 0 done right)
