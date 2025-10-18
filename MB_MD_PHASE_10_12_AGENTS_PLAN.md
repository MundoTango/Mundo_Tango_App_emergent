# MB.MD Multi-Workstream Execution Plan
**Date:** October 18, 2025  
**Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment)  
**Scope:** Phase 10 (15 imports) + Phase 12 (Integration Testing) + Agent Completion (153 agents)

---

## 🗺️ MAPPING PHASE

### Workstream 1: Phase 10 - Fix 15 Remaining Broken Imports

**Status from Audit Report:** 15 broken imports identified (down from 30)

**Category Analysis:**

**A. Archived Component Imports (Non-Critical - 3 imports)**
1. `client/src/components/universal/LocationInput.tsx`
   - Used by: Archived ModernPostCreator
   - Impact: LOW (archived component)
   - Solution: Create stub or remove references

2. `client/src/auth/useAuthContext.ts`
   - Used by: Multiple archived components
   - Impact: LOW (archived components)
   - Solution: Create minimal implementation or remove

3. `client/src/components/upload/UploadMedia.tsx`
   - Used by: Archived MemoryCreationForm
   - Impact: LOW (archived component)
   - Solution: Create stub or remove references

**B. Evolution Feature Files (Experimental - 2 imports)**
4. `evolution/services/evolutionService.ts`
   - Used by: evolutionRoutes.ts
   - Impact: MEDIUM (experimental feature)
   - Solution: Create minimal service or disable feature

5. `evolution/services/hierarchyAnalyzer.ts`
   - Used by: evolutionRoutes.ts
   - Impact: MEDIUM (experimental feature)
   - Solution: Create minimal analyzer or disable feature

**C. Data Files (Medium Priority - 4 imports)**
6-9. `data/location/*.json` files
   - Countries, cities, regions, timezones
   - Used by: Location services
   - Impact: MEDIUM (fallback data)
   - Solution: Generate from API or create minimal datasets

**D. Infrastructure Files (3 imports)**
10. `server/monitoring/prometheus-metrics.ts`
    - Used by: feature-flags.ts
    - Impact: HIGH (wrong path reference)
    - Solution: Fix path or create minimal metrics stub

11. `COMPREHENSIVE_PROJECT_DATA.ts`
    - Used by: SafeModalWrapper reference
    - Impact: LOW (project metadata)
    - Solution: Create minimal data file

12. `client/src/lib/openreplay-enhanced.ts`
    - Found via grep
    - Impact: MEDIUM (monitoring)
    - Solution: Check actual usage

**E. Additional Issues (3 imports estimated)**
13-15. Other TypeScript import errors
    - To be identified via TypeScript compilation
    - Impact: TBD
    - Solution: Fix as discovered

---

### Workstream 2: Phase 12 - Integration Testing

**Current Status:** Not Started (per MT_MASTER_REBUILD_PLAN.md)

**Test Coverage Gaps Identified:**

**A. E2E Tests with Playwright (Priority: HIGH)**
- [ ] User registration & authentication flow
- [ ] Memory/post creation and feed interaction
- [ ] Event creation and RSVP flow
- [ ] Profile editing and viewing
- [ ] Group discovery and joining
- [ ] Messaging and notifications
- [ ] Search functionality
- [ ] Real-time updates (WebSocket)

**B. API Integration Tests (Priority: HIGH)**
- [ ] Auth endpoints (login, register, refresh)
- [ ] Memory CRUD operations
- [ ] Event CRUD operations
- [ ] User profile operations
- [ ] Group operations
- [ ] Search endpoints
- [ ] File upload endpoints
- [ ] Error handling and validation

**C. WebSocket Connection Tests (Priority: HIGH)**
- [ ] Connection establishment
- [ ] Room joining/leaving
- [ ] Message delivery
- [ ] Heartbeat mechanism
- [ ] Reconnection logic
- [ ] Error handling

**D. Agent Orchestration Tests (Priority: MEDIUM)**
- [ ] Life CEO agent responses
- [ ] Mr Blue routing logic
- [ ] Multi-agent coordination
- [ ] Context detection
- [ ] Agent failover

**E. Database Performance Tests (Priority: MEDIUM)**
- [ ] Query performance (<1ms target)
- [ ] Concurrent connections
- [ ] Transaction handling
- [ ] Index effectiveness
- [ ] Connection pooling

**F. Security Tests (Priority: HIGH)**
- [ ] JWT validation
- [ ] RBAC/ABAC authorization
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

**Test Infrastructure Needs:**
- ✅ Playwright already installed (`@playwright/test`)
- ⏭️ Test data fixtures and factories
- ⏭️ Test database setup/teardown
- ⏭️ Mock services (email, SMS, external APIs)
- ⏭️ CI/CD integration

---

### Workstream 3: Agent System Completion (153 Agents)

**Current Status:** 123/276 agents operational (45%)  
**Remaining:** 153 agents to activate

**Agent Categories Analysis:**

**A. ESA Infrastructure Agents (61 total)**
- Status: ✅ ALL OPERATIONAL
- Coverage: Layers 1-61 complete
- No work needed

**B. Life CEO AI Agents (16 total)**
- Status: ✅ LIKELY OPERATIONAL
- Model: GPT-4o
- Categories: Health, Career, Finance, Relationships, etc.
- Verify: Need activation testing

**C. Mr Blue Suite (8 total)**
- Status: ✅ CORE OPERATIONAL
- Agents: Scott AI, Schedule, Finance, Health, Context Detection, Visual Editor, Agent Matcher, Coordinator
- Verify: Integration testing needed

**D. Page Agents (125+ total)**
- Status: ⚠️ PARTIAL (~40% operational estimated)
- Coverage: Dedicated agent per route
- **Estimated Missing:** ~75 page agents
- High Priority Pages:
  1. HomePage agent
  2. FeedPage agent
  3. EventsPage agent
  4. ProfilePage agent
  5. GroupsPage agent
  6. MessagesPage agent
  7. SearchPage agent
  8. NotificationsPage agent
  9. SettingsPage agent
  10. (... 66 more page agents)

**E. Customer Journey Agents (4 total)**
- Status: ✅ LIKELY OPERATIONAL
- Coverage: New User, Active User, Power User, Super Admin
- Verify: Journey flow testing

**F. Algorithm Agents (10+ total)**
- Status: ⚠️ UNKNOWN
- Types: Feed Ranking, Event Discovery, Friend Recommendations, Content Moderation, Search Relevance, Notification Priority, Group Matching, Spam Detection, Quality Score, Engagement Prediction
- **Estimated Missing:** ~6 algorithm agents
- Critical for production

**G. Service Agents (10+ total)**
- Status: ⚠️ UNKNOWN
- Types: Email, SMS, Push Notifications, Media Processing, etc.
- **Estimated Missing:** ~6 service agents

**H. UI Sub-Agents**
- Status: ⚠️ UNKNOWN
- Types: Dark Mode, Translation, Component Watching
- **Estimated Missing:** ~3 sub-agents

**Agent Activation Priority:**
1. **HIGH:** Algorithm Agents (affect user experience)
2. **HIGH:** Service Agents (affect functionality)
3. **MEDIUM:** Page Agents (batch 1: top 10 pages)
4. **MEDIUM:** Page Agents (batch 2: next 30 pages)
5. **LOW:** Page Agents (batch 3: remaining 35 pages)
6. **LOW:** UI Sub-Agents (nice-to-have)

---

## 🔧 BREAKDOWN PHASE

### Workstream 1: Import Fixes - Execution Strategy

**Approach:** Minimize file creation, maximize efficiency

**Batch 1: Quick Wins (5 imports, 15 mins)**
1. Fix prometheus-metrics path reference
2. Create COMPREHENSIVE_PROJECT_DATA stub
3. Check openreplay-enhanced usage
4. Create useAuthContext minimal hook
5. Create UploadMedia stub component

**Batch 2: Location Data (4 imports, 30 mins)**
6-9. Generate minimal JSON data files for locations
   - Or implement API-based fallback
   - Or disable location features temporarily

**Batch 3: Evolution Feature (2 imports, 20 mins)**
10-11. Create minimal evolution service stubs
   - Or disable evolution routes entirely
   - Document as experimental feature

**Batch 4: Additional Fixes (3 imports, 15 mins)**
12-15. Fix any remaining TypeScript compilation errors
   - Run tsc to identify
   - Apply targeted fixes

**Total Estimated Time:** 80 minutes for all 15 imports

---

### Workstream 2: Integration Testing - Execution Strategy

**Phase 1: Foundation (High Priority, 2-3 hours)**
1. Setup Playwright test configuration
2. Create test data fixtures/factories
3. Setup test database utilities
4. Create helper functions (login, createPost, etc.)

**Phase 2: Critical Path E2E Tests (High Priority, 3-4 hours)**
1. Auth flow test (register → login → logout)
2. Memory creation test (create → view → edit → delete)
3. Event RSVP test (create event → RSVP → view attendees)
4. Profile test (view → edit → save)

**Phase 3: API Integration Tests (High Priority, 2-3 hours)**
1. Auth endpoints test suite
2. Memory CRUD test suite
3. Event CRUD test suite
4. Error handling test suite

**Phase 4: WebSocket Tests (High Priority, 1-2 hours)**
1. Connection/disconnection tests
2. Room management tests
3. Message delivery tests

**Phase 5: Additional Coverage (Medium Priority, 2-3 hours)**
1. Search functionality tests
2. File upload tests
3. Real-time notification tests
4. Agent response tests

**Total Estimated Time:** 10-15 hours for comprehensive test suite

**Test Organization:**
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── memory.spec.ts
│   ├── events.spec.ts
│   └── profile.spec.ts
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── memories.test.ts
│   │   └── events.test.ts
│   └── websocket/
│       ├── connection.test.ts
│       └── messaging.test.ts
├── fixtures/
│   ├── users.ts
│   ├── memories.ts
│   └── events.ts
└── helpers/
    ├── test-db.ts
    ├── auth-helpers.ts
    └── api-helpers.ts
```

---

### Workstream 3: Agent Activation - Execution Strategy

**Phase 1: Agent Audit (30 mins)**
1. List all 276 agents from codebase
2. Identify which are operational vs. stubbed
3. Categorize by priority

**Phase 2: High-Priority Agents (2-3 hours)**
1. Activate all 10 Algorithm Agents
2. Activate all 10 Service Agents
3. Test orchestration

**Phase 3: Page Agents - Batch 1 (2-3 hours)**
1. Top 10 most-used pages
2. Create agent files
3. Integrate with Mr Blue routing

**Phase 4: Page Agents - Batch 2 (3-4 hours)**
1. Next 30 pages
2. Template-based creation
3. Batch testing

**Phase 5: Page Agents - Batch 3 (3-4 hours)**
1. Remaining 35 pages
2. Complete coverage
3. Final integration testing

**Phase 6: UI Sub-Agents (1 hour)**
1. Dark Mode agent
2. Translation agent
3. Component watching agent

**Total Estimated Time:** 11-15 hours for full agent activation

---

## 🛠️ MITIGATION PHASE (Execution Plan)

### Parallel Execution Strategy

**Week 1 Focus:**
- Days 1-2: Import Fixes (Workstream 1) - Complete all 15
- Days 2-4: Test Infrastructure (Workstream 2 Phase 1)
- Days 4-5: Agent Audit (Workstream 3 Phase 1)

**Week 2 Focus:**
- Days 1-3: Critical E2E Tests (Workstream 2 Phase 2)
- Days 1-3: High-Priority Agents (Workstream 3 Phase 2)
- Days 4-5: API Tests + Page Agents Batch 1

**Week 3 Focus:**
- Days 1-2: WebSocket Tests
- Days 3-5: Page Agents Batch 2 & 3
- Final: Integration validation

---

## 📊 DEPLOYMENT PHASE (Validation)

### Success Criteria

**Workstream 1: Import Fixes**
- ✅ All 15 broken imports resolved
- ✅ TypeScript compilation clean (0 errors)
- ✅ LSP diagnostics clean
- ✅ npm run build succeeds
- ✅ No new regressions introduced

**Workstream 2: Integration Testing**
- ✅ 20+ E2E tests passing
- ✅ 30+ API integration tests passing
- ✅ 10+ WebSocket tests passing
- ✅ Test coverage >70%
- ✅ All critical paths covered
- ✅ CI/CD pipeline configured

**Workstream 3: Agent Activation**
- ✅ 276/276 agents operational (100%)
- ✅ All agent categories active
- ✅ Mr Blue routing working
- ✅ Agent orchestration tested
- ✅ No agent conflicts or failures

---

## 📈 Progress Tracking

### Current Baseline
- **Broken Imports:** 15 (target: 0)
- **Test Coverage:** <50% (target: >80%)
- **Agents Operational:** 123/276 (45%) (target: 100%)

### Target Metrics
- **Import Resolution:** 100%
- **Test Coverage:** 80%+
- **Agent Activation:** 100%
- **Build Status:** ✅ PASSING
- **Deployment Readiness:** ✅ PRODUCTION-READY

---

## 🎯 Immediate Next Steps

### Today (Priority Order):
1. ✅ Create this plan (DONE)
2. ⏭️ Fix first 5 broken imports (Batch 1)
3. ⏭️ Setup test infrastructure
4. ⏭️ Audit agent system

### This Week:
1. Complete all 15 import fixes
2. Write 10 critical E2E tests
3. Activate 20 high-priority agents

### This Month:
1. Achieve 80% test coverage
2. Activate all 276 agents
3. Production deployment

---

**Plan Status:** ✅ MAPPING & BREAKDOWN COMPLETE  
**Next Phase:** MITIGATION (Execution)  
**Methodology:** MB.MD ensuring systematic, documented progress
