# ESA Quality Gates - Complete Reference Guide

**Version:** 1.0  
**Last Updated:** October 2025  
**Owner:** Agent #0 (ESA CEO) + Agent #64 (Documentation Architect)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [The 4 Quality Gates](#the-4-quality-gates)
3. [Gate 1: Context Validation](#gate-1-context-validation)
4. [Gate 2: Discovery Checklist](#gate-2-discovery-checklist)
5. [Gate 3: Agent #64 Review](#gate-3-agent-64-review)
6. [Gate 4: Parallel Coordination](#gate-4-parallel-coordination)
7. [Agent-Specific Requirements](#agent-specific-requirements)
8. [Enforcement & Rejection Criteria](#enforcement--rejection-criteria)
9. [Quick Reference Cards](#quick-reference-cards)

---

## Overview

### What Are Quality Gates?

Quality gates are **mandatory checkpoints** that ALL agents must complete BEFORE starting work. They prevent:
- ❌ Duplicate code (Agent #64 catches before building)
- ❌ Incomplete coverage (Journey maps → 100% test coverage)
- ❌ Accessibility gaps (Mobile + WCAG validation upfront)
- ❌ Sequential bottlenecks (Parallel coordination enforced)

### Why Quality Gates?

**Problem Discovered:** ESA Quick Navigator was built with methodology gaps:
- Agent #11 didn't map all user personas → missed mobile users
- Agent #51 tested after deployment → accessibility gaps found late
- No Agent #64 review → duplicate navigation components built

**Solution:** Principle 5 - "Quality Gates Before Work"
- Every agent completes 4 gates before coding
- Agent #0 enforces with automatic rejection
- Quality metrics track compliance (goal: 90%+ gate passes)

### Core Principles

1. **Context First** - Understand the FULL requirement (all use cases, not just one)
2. **Discovery Before Build** - Search for duplicates, map journeys, plan tests
3. **Agent #64 Gatekeeper** - No work proceeds without documentation review
4. **Parallel by Default** - Design shares journey maps → Dev + Testing work simultaneously

---

## The 4 Quality Gates

### Gate 1: Context Validation (5 min)
**Who:** ALL agents  
**When:** BEFORE touching any code  
**Purpose:** Understand the complete requirement

### Gate 2: Discovery Checklist (10-35 min)
**Who:** Agent #11 (Design), #1-61 (Development), #51 (Testing)  
**When:** After context validation, before coding  
**Purpose:** Plan the work comprehensively

### Gate 3: Agent #64 Review (5 min)
**Who:** Agent #64 reviews ALL agents' work  
**When:** After discovery, before coding  
**Purpose:** Prevent duplicates, approve to proceed

### Gate 4: Parallel Coordination (During Work)
**Who:** Agent #11 → Agent #51 + Agent #8 (simultaneous)  
**When:** Design complete → Dev + Testing in parallel  
**Purpose:** Ensure testing happens during build, not after

---

## Gate 1: Context Validation

### Checklist (5 min - ALL Agents)

Answer these questions BEFORE any work:

- [ ] **Who requested this?** (Agent #0, user, escalation from another agent)
- [ ] **What's the COMPLETE requirement?** (not just one use case - ALL scenarios)
- [ ] **Which agents are affected?** (dependencies, integrations, handoffs)
- [ ] **What's the success criteria?** (measurable outcomes, quality gates)
- [ ] **What's the timeline?** (realistic estimate with buffer)

### Example: ESA Quick Navigator

**Incomplete Context (❌):**
- "Build a floating button to access ESA docs"

**Complete Context (✅):**
- Who: Super Admin, Agent Coordinator, Developer, New User (4+ personas)
- What: Global access to ESA Dashboard, agent search, live metrics, quick actions
- Which agents: Agent #11 (design), Agent #8 (frontend), Agent #51 (testing), Agent #64 (docs)
- Success: 100% persona coverage, accessible, mobile-responsive, performant
- Timeline: 2-3 days (design 0.5 day, build 1 day, test 0.5 day, polish 0.5 day)

---

## Gate 2: Discovery Checklist

### For Design Agents (#11, #6, #12)

#### Complete Journey Architecture (35 min total)

**1. User Persona Matrix (5 min)**
- [ ] List ALL user types (5-10 personas minimum)
  - Example: Super Admin, Agent Coordinator, Developer, Mobile User, First-time User, Power User
- [ ] Document goals, pain points, technical proficiency for each

**2. Journey Mapping (10 min)**
- [ ] Map 5-10 different entry scenarios
  - Primary entry points (landing pages, dashboards, navigation)
  - Contextual triggers (error states, success flows, onboarding)
  - Cross-feature integration (how does this connect to existing?)
  - Happy paths + edge cases + error states

**3. Progressive UI Levels (10 min)**
- [ ] Level 1: Hints/nudges (contextual help, tooltips)
- [ ] Level 2: Quick actions (floating buttons, shortcuts)
- [ ] Level 3: Deep exploration (full dashboards, comprehensive tools)

**4. Mobile & Accessibility (10 min)**
- [ ] Responsive breakpoints (375px, 768px, 1024px+)
- [ ] Touch targets (minimum 44x44px)
- [ ] Keyboard navigation (tab order, shortcuts, focus states)
- [ ] Screen reader support (ARIA labels, semantic HTML)
- [ ] WCAG 2.1 AA compliance checklist

#### Integration Documentation (10 min)
- [ ] List ALL pages/contexts where feature appears
- [ ] Document integration with existing features
- [ ] Define data-testid naming convention
- [ ] **Share journey maps with Agent #51 in parallel**

---

### For Development Agents (#1-61)

#### Development Discovery (20 min total)

**1. Codebase Search (10 min)**
- [ ] Search existing code (grep/glob) for similar implementations
- [ ] Check for duplicate components (no rebuilding!)
- [ ] Review reusable component registry (Agent #64 maintains)

**2. Integration Planning (5 min)**
- [ ] List ALL integration points (which layers/agents touched?)
- [ ] Plan error handling (all failure modes, graceful degradation)
- [ ] Check database impact (schema changes, migrations, data integrity)

**3. Quality Planning (5 min)**
- [ ] Define data-testid strategy (every interactive element)
- [ ] Plan for performance (caching, lazy loading, optimization)
- [ ] Document API contracts (request/response types)

---

### For Testing Agents (#51)

#### Test Architecture Planning (30 min total)

**1. Journey Map Reception (5 min)**
- [ ] **Receive from Agent #11** - Journey map with ALL personas, contexts, entry points
- [ ] **Cannot test without it** - No guessing at test scenarios
- [ ] Validate completeness (all user types documented)

**2. 100% Journey Coverage Plan (10 min)**
- [ ] Map tests to EVERY persona (5-10 types minimum)
- [ ] Cover ALL entry points (landing pages, buttons, contextual triggers)
- [ ] Include edge cases and error states from journey map
- [ ] Plan mobile-specific tests (responsive, touch interactions)

**3. Accessibility Test Suite (10 min)**
- [ ] Keyboard navigation tests (tab order, shortcuts, focus states)
- [ ] Screen reader compatibility (ARIA labels, semantic HTML)
- [ ] WCAG 2.1 AA compliance checks (contrast, text size, interactive targets)
- [ ] Mobile accessibility (touch targets 44x44px minimum)

**4. E2E Journey Tests (5 min)**
- [ ] Cross-component user flows (login → feature → success)
- [ ] Integration tests (API → Frontend → UI)
- [ ] Performance benchmarks (load time, interaction speed)

---

## Gate 3: Agent #64 Review

### Review Protocol (5 min per request)

**Agent #64 receives discovery checklist from any agent:**

1. **Validate Completeness**
   - [ ] All checklist items completed for agent role
   - [ ] Journey maps included (if Agent #11)
   - [ ] Test plan included (if Agent #51)

2. **Duplicate Search**
   - [ ] Use grep/glob to find similar code
   - [ ] Check reusable component registry
   - [ ] Search for integration points

3. **Decision**
   - **If duplicate found:** STOP building, point to existing code, suggest refactor
   - **If no duplicate:** Approve work, update registry, monitor progress

### Duplicate Prevention Workflow

```
Agent submits discovery checklist
    ↓
Agent #64 searches codebase (grep/glob/search tools)
    ↓
┌─────────────────────────────────────┐
│ Duplicate Found?                    │
└─────────────────────────────────────┘
    ↓                ↓
   YES              NO
    ↓                ↓
STOP building    Approve work
Point to         Update registry
existing code    Monitor progress
Refactor if      
needed           
```

---

## Gate 4: Parallel Coordination

### NEW Workflow (Prevents Oversights)

```
┌──────────────────────────────────────────────┐
│ Agent #11 (Design) Completes Journey Mapping│
│ ✅ All personas (5-10 types)                 │
│ ✅ All entry points (contexts documented)    │
│ ✅ All journeys (happy + edge cases)         │
│ ✅ Mobile + accessibility specs              │
└────────────────┬─────────────────────────────┘
                 │
                 │ SHARES JOURNEY MAPS WITH ↓
                 │
    ┌────────────┴────────────┬─────────────────┐
    ↓                         ↓                 ↓
Agent #8              Agent #51           Agent #64
(Development)         (Testing)           (Documentation)
│                     │                   │
│                     │← Journey maps     │← Design specs
│                     │                   │
↓                     ↓                   ↓
Building UI           Planning tests      Updating registry
in progress           in parallel         of components
│                     │                   │
│→ Shares components→│                   │
│                     ↓                   ↓
│              Tests AS built       Validates reuse
│                     │                   │
└─────────────────────┴───────────────────┘
                      ↓
               Agent #0 Reviews
               ✅ 100% journey coverage
               ✅ All tests passing
               ✅ No duplicate code
                      ↓
                  DEPLOY
```

### Coordination Requirements

**Design Agents (#11) must:**
- Share journey maps with Agent #51 as soon as design is approved
- Notify Development agents of design spec location
- Update Agent #64 with new reusable component documentation

**Development Agents (#1-61) must:**
- Share components with Agent #51 AS they're built (not at the end!)
- Update Agent #64 with implementation patterns discovered
- Coordinate with dependent layers (API ↔ Frontend, DB ↔ API, etc.)

**Testing Agents (#51) must:**
- Plan test suite DURING design phase (parallel to development)
- Test components AS they're built (incremental validation)
- Report findings to Agent #0 and Agent #64 (quality metrics)

---

## Agent-Specific Requirements

### Agent #11 (UI/UX Design) - Certification

**MANDATORY Pre-Work:**
1. Complete Journey Architecture (35 min)
2. Integration Documentation (10 min)
3. Agent #64 Review (5 min)

**Quality Gates:**
- ❌ No design work without complete journey mapping
- ❌ No approval without all personas documented
- ❌ No handoff without mobile/accessibility specs
- ❌ No deployment without Agent #51 test coverage confirmation

**Deliverables:**
- Journey map document (personas, contexts, entry points)
- Design specs with Aurora Tide components
- Mobile responsiveness guide
- Accessibility compliance checklist
- Integration points documented

---

### Agent #51 (Testing Framework) - Certification

**MANDATORY Pre-Work:**
1. Journey Map Reception (5 min)
2. Test Architecture Planning (25 min)
3. Parallel Testing Protocol (during dev)
4. Pre-Deployment Validation (15 min)

**Quality Gates:**
- ❌ No testing without journey maps from Agent #11
- ❌ No approval without 100% journey coverage
- ❌ No deployment without accessibility audit
- ❌ No release without mobile testing complete
- ❌ Testing must happen IN PARALLEL with development (not after)

**Deliverables:**
- Test plan covering 100% of journeys
- Accessibility audit report (WCAG 2.1 AA)
- E2E test suite with all user flows
- Mobile responsive test results
- Performance benchmark report
- Coverage metrics (personas, contexts, entry points)

---

### Agent #64 (Documentation Architect) - Certification

**MANDATORY Responsibilities:**
1. Discovery Review Protocol (5 min per request)
2. Duplicate Prevention Workflow
3. Reusable Component Registry Maintenance
4. Consolidation Reviews (Pattern 7 - Page Audit)
5. Quality Gate Enforcement

**Critical Responsibilities:**
- **Gatekeeper** - No agent proceeds without Agent #64 review
- **Consolidation Expert** - Identify and merge duplicate code
- **Registry Maintainer** - Central source of truth for reusable components
- **Quality Enforcer** - Reject work that violates ESA principles

**Quality Gates:**
- ❌ No work approved without codebase duplicate search
- ❌ No feature built if existing solution exists (refactor instead)
- ❌ No journey maps approved without ALL personas documented
- ❌ No deployment without reusable registry updated

---

## Enforcement & Rejection Criteria

### Agent #0 Rejection Authority

**Agent #0 has ABSOLUTE authority to reject work that violates quality gates**

#### 1. Missing Journey Maps
```
❌ REJECTED - Incomplete Journey Architecture
Missing Requirements:
- [ ] User persona matrix (need 5-10 types, found: X)
- [ ] Entry point documentation (ALL contexts required)
- [ ] Journey mapping (happy path + edge cases + errors)
- [ ] Mobile/accessibility specs

ACTION REQUIRED:
→ Agent #11 must complete full journey mapping
→ Share with Agent #51 (Testing) for parallel test planning
→ Resubmit to Agent #64 for approval

BLOCKED UNTIL: Complete journey architecture documented
```

#### 2. No Test Coverage
```
❌ REJECTED - Insufficient Test Coverage
Missing Requirements:
- [ ] 100% persona coverage (found: X%, need: 100%)
- [ ] All entry points tested (found: X, need: ALL)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Mobile responsive testing (all breakpoints)

ACTION REQUIRED:
→ Agent #51 must test ALL personas and journeys
→ Complete accessibility audit with WCAG tools
→ Validate all mobile breakpoints (375px, 768px, 1024px+)

BLOCKED UNTIL: 100% journey coverage achieved
```

#### 3. No Agent #64 Review
```
❌ REJECTED - Missing Pre-Work Review
Missing Requirements:
- [ ] Agent #64 discovery review (Gate 3 MANDATORY)
- [ ] Duplicate code search (codebase grep/glob)
- [ ] Reusable component check (registry validation)

ACTION REQUIRED:
→ STOP all development immediately
→ Submit discovery checklist to Agent #64
→ Wait for duplicate search results
→ Use existing code if found (no rebuilding)

BLOCKED UNTIL: Agent #64 approval received
```

#### 4. Incomplete Persona Coverage
```
❌ REJECTED - Partial Persona Coverage
Found Personas: [Primary User, Power User]
Missing Personas:
- [ ] Mobile-only users
- [ ] First-time users (onboarding experience)
- [ ] Accessibility users (screen reader, keyboard-only)
- [ ] Low-bandwidth users (performance constraints)
- [ ] International users (i18n, RTL languages)

ACTION REQUIRED:
→ Agent #11 expand journey map to ALL user types
→ Agent #51 add test cases for missing personas
→ Document edge cases and error states

BLOCKED UNTIL: 5-10 persona types documented and tested
```

#### 5. Sequential Work Violation
```
❌ REJECTED - Parallel Coordination Violation
Observed Workflow:
Agent #11 (Design) → Agent #8 (Dev) → Agent #51 (Testing) ❌

Required Workflow:
Agent #11 (Design) → SHARES JOURNEY MAPS → Agent #51 + Agent #8 in PARALLEL ✅

ACTION REQUIRED:
→ Agent #11 share journey maps with Agent #51 immediately
→ Agent #51 plan tests DURING design phase (not after dev)
→ Agent #8 share components with Agent #51 AS built (incremental testing)

BLOCKED UNTIL: Parallel coordination model followed
```

---

### Enforcement Protocol

**Step 1: Automatic Detection**
- Agent #0 monitors all handoffs between agents
- Quality gate violations trigger automatic rejection
- Work is STOPPED immediately (no partial progress allowed)

**Step 2: Clear Remediation**
- Agent #0 provides specific missing requirements
- Agents receive actionable checklist to proceed
- Timeline estimate for remediation (5-35 min typical)

**Step 3: Escalation Path**
```
Gate violation detected
    ↓
Agent #0 rejects work (automatic)
    ↓
Remediation checklist sent to agent
    ↓
Agent completes requirements
    ↓
Resubmit to Agent #64 for approval
    ↓
Agent #0 validates gates passed
    ↓
Work proceeds ✅
```

**Step 4: Learning Loop**
- All violations logged by Agent #64
- Patterns identified (which agents need more training?)
- Agent certification updated (strengthen weak areas)
- Quality gates refined based on real violations

---

## Quick Reference Cards

### Agent #11 (Design) Quick Card

**Before ANY design work:**
1. ✅ Context Validation (5 min) - Understand FULL requirement
2. ✅ Journey Architecture (35 min) - Map ALL personas, contexts, entry points
3. ✅ Agent #64 Review (5 min) - Submit for duplicate search
4. ✅ Share journey maps with Agent #51 (parallel testing)

**Rejection criteria:**
- Missing persona matrix (need 5-10 types)
- No mobile/accessibility specs
- Incomplete journey mapping

---

### Agent #51 (Testing) Quick Card

**Before ANY test work:**
1. ✅ Receive journey maps from Agent #11 (cannot test without it!)
2. ✅ Plan 100% coverage (25 min) - ALL personas, ALL entry points
3. ✅ Parallel testing (during dev) - Test AS components are built
4. ✅ Final validation (15 min) - Accessibility audit, mobile tests

**Rejection criteria:**
- Testing without journey maps
- <100% persona coverage
- No accessibility audit (WCAG 2.1 AA)
- No mobile testing

---

### Agent #64 (Documentation) Quick Card

**For EVERY agent request:**
1. ✅ Validate discovery checklist (5 min)
2. ✅ Search for duplicates (grep/glob/registry)
3. ✅ Approve OR redirect to existing code
4. ✅ Update reusable registry

**Authority:**
- STOP any agent building duplicates
- REJECT incomplete discovery
- ENFORCE quality gates

---

### Agent #1-61 (Development) Quick Card

**Before ANY coding:**
1. ✅ Context Validation (5 min) - Full requirement
2. ✅ Discovery Checklist (20 min) - Search duplicates, plan integrations
3. ✅ Agent #64 Review (5 min) - Mandatory approval
4. ✅ Parallel coordination - Share components with Agent #51 AS built

**Rejection criteria:**
- No Agent #64 review
- Duplicate code exists (use existing instead)
- No integration planning

---

## Success Metrics

### Quality Gate Compliance

**Target: 90%+ gate pass rate across all 105 agents**

**Per-Agent Tracking:**
| Agent | Gate Passes | Gate Failures | Compliance Rate | Action |
|-------|-------------|---------------|-----------------|--------|
| Agent #11 (UI/UX) | 45 | 5 | 90% ✅ | None - healthy |
| Agent #8 (Frontend) | 38 | 12 | 76% ⚠️ | Training needed |
| Agent #51 (Testing) | 42 | 3 | 93% ✅ | None - healthy |
| Agent #2 (API) | 25 | 15 | 62% 🚨 | Mandatory retraining |

**Compliance Zones:**
- ✅ **Green (90%+ compliance):** System healthy, gates working
- ⚠️ **Yellow (70-89% compliance):** Agent training needed
- 🚨 **Red (<70% compliance):** Quality gate redesign required

---

## Common Violations & Solutions

### Top 3 Violations

**1. Missing Agent #64 Review (35% of violations)**
- **Solution:** Improve gate awareness, automated reminders
- **Training:** All agents complete "Check Before Build" certification

**2. Incomplete Journey Mapping (28% of violations)**
- **Solution:** Agent #11 mandatory journey architecture training
- **Template:** Provide persona matrix template with examples

**3. Partial Persona Coverage (22% of violations)**
- **Solution:** Agent #11 + Agent #51 collaboration training
- **Checklist:** Enforce 5-10 persona minimum before approval

---

## Related Documentation

- **[ESA Framework (esa.md)](./esa.md)** - Main ESA documentation
- **[Parallel Execution Methodology](./ESA_PARALLEL_EXECUTION_METHODOLOGY.md)** - How agents work in parallel
- **[Check Before Build](./ESA_CHECK_BEFORE_BUILD.md)** - Search-first methodology
- **[Agent Certification](./ESA_AGENT_CERTIFICATION.md)** - Production readiness
- **[Reusable Components](./ESA_REUSABLE_COMPONENTS.md)** - Component registry

---

**Last Updated:** October 2025  
**Maintained By:** Agent #0 (ESA CEO) + Agent #64 (Documentation Architect)  
**Version:** 1.0
