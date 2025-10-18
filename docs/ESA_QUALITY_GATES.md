# ESA Quality Gates System
## 4-Gate Pre-Work Protocol for All Agents

**Master Reference:** [esa.md Section 5.1](../platform-handoff/esa.md#51-principle-5-quality-gates-before-work)

---

## Overview

Every ESA agent MUST pass through 4 mandatory quality gates before beginning work. This ensures systematic, validated execution across all 105 agents.

---

## 🚪 GATE 1: SPECIFICATION VALIDATION
**Purpose:** Ensure work is clearly defined and approved

**Checklist:**
- [ ] User request documented in Human Review Story
- [ ] Success criteria defined and measurable
- [ ] Dependencies identified (other agents, data, APIs)
- [ ] Scope boundaries clearly established
- [ ] Agent assignment appropriate for task

**Pass Criteria:** 
- All checklist items completed
- Story approved by Agent #0 (CEO) or Division Chief
- No ambiguity in requirements

**Failure Action:** Request clarification from user/CEO before proceeding

---

## 🔍 GATE 2: DISCOVERY & CONTEXT
**Purpose:** Gather all necessary context before implementation

**Checklist:**
- [ ] Search codebase for existing implementations
- [ ] Review related documentation (replit.md, ESA docs)
- [ ] Identify affected files and components
- [ ] Check for existing patterns to follow
- [ ] Review recent changes (git log, recent stories)

**Pass Criteria:**
- Full understanding of current state
- All related code/docs reviewed
- Patterns identified for consistency

**Failure Action:** Continue research until full context obtained

---

## 🛡️ GATE 2.5: API CONTRACT VALIDATION (NEW - MB.MD Track 7)
**Purpose:** Prevent data disconnection bugs via endpoint validation

**Checklist:**
- [ ] Run API path validator: `node scripts/validate-api-paths.mjs`
- [ ] Verify frontend API calls match backend routes
- [ ] Check route prefix consistency (`/api/` everywhere)
- [ ] Confirm NO mock data fallbacks in production code
- [ ] Validate DB → API → UI data flow

**Pass Criteria:**
- All API paths validated (100% match)
- No 404s or missing endpoints
- Real data flows from database to UI

**Failure Action:** Fix mismatched paths before proceeding

**Tools:**
```bash
# Extract frontend API calls
node scripts/validate-api-paths.mjs --extract-frontend

# Extract backend routes
node scripts/validate-api-paths.mjs --extract-backend

# Compare and validate
node scripts/validate-api-paths.mjs --compare
```

**Common Failures:**
- Frontend: `/api/admin/analytics` → Backend: `/admin/analytics` ❌
- Frontend: `/api/tracker/epics` → Backend: `/tracker/epics` ❌
- Missing endpoint entirely (404 error) ❌

**Fix Pattern:**
```typescript
// ✅ CORRECT: Backend routes mounted with /api prefix
app.use('/api', adminRoutes);

// ✅ CORRECT: Frontend query matches
const { data } = useQuery({ queryKey: ['/api/admin/analytics'] });
```

---

## ✅ GATE 3: IMPLEMENTATION REVIEW
**Purpose:** Validate code quality before testing

**Checklist:**
- [ ] Code follows ESA Framework patterns
- [ ] All imports use proper aliases (`@/`, `@shared/`)
- [ ] Type safety maintained (TypeScript, Zod validation)
- [ ] Error handling implemented
- [ ] Security best practices followed
- [ ] No hardcoded values (use env vars)
- [ ] Comments added for complex logic
- [ ] LSP diagnostics cleared (no errors)

**Pass Criteria:**
- All checklist items pass
- Code review by peer agent (if complex)
- No TypeScript/ESLint errors

**Failure Action:** Fix code issues before testing

---

## 🧪 GATE 4: TESTING & VALIDATION
**Purpose:** Ensure implementation works correctly

**Checklist:**
- [ ] Unit tests pass (if applicable)
- [ ] Integration tests pass
- [ ] E2E tests pass (for UI changes)
- [ ] Manual testing completed
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsive (if UI change)
- [ ] Performance acceptable (<200ms API, <3s page load)
- [ ] No console errors or warnings
- [ ] Workflow restarted and verified

**Pass Criteria:**
- All tests pass
- No errors in production
- Performance meets thresholds

**Failure Action:** Fix bugs and re-test until all pass

---

## 📊 Execution Flow

```
┌─────────────────────────────────────────┐
│  Agent receives task from CEO/User      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  🚪 GATE 1: Specification Validation    │
│  ├── User request documented?           │
│  ├── Success criteria defined?          │
│  ├── Dependencies identified?           │
│  └── ✅ PASS → Proceed                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  🔍 GATE 2: Discovery & Context         │
│  ├── Search codebase                    │
│  ├── Review documentation               │
│  ├── Identify patterns                  │
│  └── ✅ PASS → Proceed                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  🛡️ GATE 2.5: API Contract Validation   │
│  ├── Run API path validator             │
│  ├── Verify endpoint matches            │
│  ├── Check data flow (DB→API→UI)        │
│  └── ✅ PASS → Proceed                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ✅ GATE 3: Implementation Review       │
│  ├── Code quality check                 │
│  ├── Type safety verified               │
│  ├── Security validated                 │
│  └── ✅ PASS → Proceed                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  🧪 GATE 4: Testing & Validation        │
│  ├── Run all tests                      │
│  ├── Manual testing                     │
│  ├── Performance check                  │
│  └── ✅ PASS → Deploy                   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ✅ WORK COMPLETE - Story Closed        │
└─────────────────────────────────────────┘
```

---

## 🎯 Success Metrics

**Per Gate:**
- Each gate must pass before proceeding
- No shortcuts or skipped gates
- Document gate results in story

**Overall:**
- 100% gate compliance across all agents
- Zero production bugs from skipped gates
- Faster overall delivery (catch issues early)

**Typical Results:**
- **Gate 1 failures** → Clarify requirements
- **Gate 2 failures** → Research more thoroughly
- **Gate 2.5 failures** → Fix API path mismatches
- **Gate 3 failures** → Refactor code
- **Gate 4 failures** → Fix bugs and re-test

---

## 🔧 Agent Integration

**For Agent Orchestrator (Domain #9):**
```typescript
async function executeAgentTask(agent: Agent, task: Task) {
  // GATE 1: Specification
  await validateSpecification(task);
  
  // GATE 2: Discovery
  await gatherContext(task);
  
  // GATE 2.5: API Contract (NEW)
  await validateAPIContract(task);
  
  // GATE 3: Implementation
  const code = await agent.implement(task);
  await reviewImplementation(code);
  
  // GATE 4: Testing
  await runTests(code);
  
  return { status: 'complete', passed: true };
}
```

**For Individual Agents:**
```typescript
class Agent {
  async execute(task: Task) {
    // Mandatory gate checks
    if (!this.passedGate1(task)) throw new Error('Gate 1 failed');
    if (!this.passedGate2(task)) throw new Error('Gate 2 failed');
    if (!this.passedGate2_5(task)) throw new Error('Gate 2.5 failed - API paths invalid');
    if (!this.passedGate3(task)) throw new Error('Gate 3 failed');
    if (!this.passedGate4(task)) throw new Error('Gate 4 failed');
    
    return this.doWork(task);
  }
}
```

---

## 📝 Changelog

**October 13, 2025 - Added Gate 2.5: API Contract Validation**
- New gate between Discovery and Implementation
- Prevents data disconnection bugs (Phase 19 enforcement)
- Validates frontend/backend API path matching
- Uses `scripts/validate-api-paths.mjs` tool
- 100% pass threshold (zero tolerance for mismatches)

---

**END OF ESA QUALITY GATES DOCUMENTATION**
