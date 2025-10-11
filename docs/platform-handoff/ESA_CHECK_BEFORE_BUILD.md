# ESA Check Before Build Protocol
**Universal "Search First, Build Second" Methodology**

**Lead:** Agent #64 (Documentation Architect)  
**Applies To:** ALL agents building features, fixing bugs, refactoring code, or running audits  
**Created:** October 11, 2025  
**Status:** ✅ MANDATORY

---

## 🎯 Core Principle

> **"Before building ANY code, check if it already exists or can be reused"**

This applies to:
- ✅ New features
- ✅ Bug fixes (check if root cause is elsewhere)
- ✅ Refactoring (check if pattern already exists)
- ✅ **Audits (consolidate duplicates, don't just fix)**

---

## 📋 The 4-Step Check Before Build Process

### Step 1: Search Existing Codebase (5 minutes)

**Codebase Search Patterns:**

```typescript
// 1. Check for similar API endpoints
grep -r "router.post.*payment" server/routes.ts
grep -r "export.*payment" server/

// 2. Check for existing UI components
grep -r "export.*Modal" client/src/components/
grep -r "function.*Card" client/src/

// 3. Check for utility functions
grep -r "export.*validate" shared/
grep -r "function.*format" lib/

// 4. Check for database patterns
grep -r "export.*Schema" shared/schema.ts
grep -r "create.*Table" server/storage.ts

// 5. Check for existing business logic
grep -r "class.*Service" server/
grep -r "export.*Manager" server/
```

**What to Look For:**
- Exact functionality match (can reuse 100%)
- Partial match (can extend existing)
- Similar pattern (can adapt existing)
- Related feature (might share code)

---

### Step 2: Ask Clarifying Questions (3 minutes)

**Question Templates:**

**For New Features:**
```
1. Is this a completely new feature or enhancement to existing?
2. What's the primary user goal?
3. What's the expected user flow?
4. Are there similar features I should check?
5. What are the must-have vs nice-to-have requirements?
```

**For Bug Fixes:**
```
1. What's the exact symptom/error?
2. Is this a new bug or regression?
3. Did this ever work correctly?
4. What changed recently that might cause this?
5. Could the root cause be in a different layer?
```

**For Refactoring:**
```
1. What's the specific improvement goal?
2. Is there a performance/maintainability issue?
3. What pattern are we moving toward?
4. Are there existing examples of this pattern?
5. Will this affect other features?
```

**For Audits:**
```
1. What are we auditing for? (design, accessibility, performance)
2. Should we consolidate duplicates while auditing?
3. What's the reusable component standard?
4. Can we reduce code while improving quality?
5. What duplicates have we found before?
```

---

### Step 3: Check with Agent #64 (2 minutes)

**Agent #64 Reviews:**
```
Developer prepares to build
    ↓
Submits to Agent #64 (Documentation Architect)
    ↓
Agent #64 checks:
    ✅ Is functionality already documented?
    ✅ Does reusable component registry have this?
    ✅ Have we built something similar before?
    ✅ Are there duplicates to consolidate?
    ↓
Agent #64 responds:
    - "Already exists: Use [component/file]" OR
    - "Partial match: Extend [existing code]" OR
    - "New: Proceed and add to registry"
    ↓
Developer proceeds with full context
```

---

### Step 4: Document Decision & Proceed (1 minute)

**Before Building, Document:**
```markdown
## Build Decision Log

**Feature:** [Name]
**Date:** [Date]
**Agent:** [Agent ID]

### Search Results:
- Checked: [files/patterns searched]
- Found: [existing functionality]
- Decision: [reuse/extend/build new]

### Questions Asked & Answers:
1. Q: [question]
   A: [answer]

### Agent #64 Review:
- Status: [approved/reuse existing/extend]
- Registry Update: [added/updated component]

### Action:
- [Build new / Reuse X / Extend Y]
```

---

## 📚 Reusable Component Registry

**Location:** `docs/platform-handoff/ESA_REUSABLE_COMPONENTS.md`

**Categories:**

### UI Components (Client)
- **GlassCard** - `client/src/components/ui/GlassCard.tsx`
- **Modal** - `client/src/components/ui/modal.tsx`
- **Button variants** - `client/src/components/ui/button.tsx`
- **Form components** - `client/src/components/ui/form.tsx`
- **Toast notifications** - `client/src/hooks/use-toast.ts`

### API Utilities (Server)
- **Auth middleware** - `server/middleware/auth.ts`
- **Validation utilities** - `server/middleware/validation.ts`
- **Error handlers** - `server/middleware/errorHandler.ts`
- **Rate limiting** - `server/middleware/rateLimit.ts`

### Database Patterns (Shared)
- **User schema** - `shared/schema.ts` (users table)
- **Audit logging** - Pattern for tracking changes
- **Soft deletes** - Pattern for deletedAt columns
- **Timestamps** - createdAt/updatedAt pattern

### Business Logic Patterns
- **Service classes** - `server/services/*`
- **Manager classes** - `server/managers/*`
- **Validators** - `shared/validators/*`
- **Type definitions** - `shared/types/*`

**Registry Updated By:** Agent #64 after every build

---

## 🚨 Special Case: Audit = Consolidate

**When running `standardized-page-audit.md`:**

### Expanded Audit Process:
```
1. Run standard audit (design, accessibility, etc.)
2. NEW: Check for duplicate components/code
3. NEW: Agent #64 reviews for consolidation opportunities
4. Fix issues AND consolidate duplicates
5. Update reusable component registry
6. Result: Better quality + less code
```

### Consolidation Checklist (Audits):
- [ ] Identified duplicate components across pages
- [ ] Found similar API patterns that can be unified
- [ ] Discovered repeated business logic to extract
- [ ] Checked for duplicate database queries
- [ ] Agent #64 confirmed consolidation plan
- [ ] Updated reusable component registry

### Example Consolidation:
```
BEFORE AUDIT:
- Page A: Custom card component (100 lines)
- Page B: Similar card component (95 lines)
- Page C: Another card variant (110 lines)
Total: 305 lines, 3 duplicates

AFTER AUDIT + CONSOLIDATION:
- Reusable GlassCard component (120 lines)
- Pages A/B/C import GlassCard
Total: 120 lines, 61% reduction, single source of truth
```

---

## ❌ Anti-Patterns (What NOT to Do)

### Bad: Build First, Ask Later
```
❌ Developer: "I'll build this feature real quick"
   [30 minutes later]
   Developer: "Oh wait, this already exists..."
   Result: Wasted 30 minutes
```

### Bad: Skip Agent #64 Review
```
❌ Developer: "I checked docs, found nothing, building now"
   [Actually existed in reusable components registry]
   Result: Duplicate functionality
```

### Bad: Audit Without Consolidating
```
❌ Audit: "Found 5 issues, fixed all"
   [Left 3 duplicate components untouched]
   Result: Missed consolidation opportunity
```

### Good: Check Before Build
```
✅ Developer: "Need payment validation"
   → Searches: grep -r "validate.*payment"
   → Finds: shared/validators/payment.ts
   → Reuses: import { validatePayment } from '@shared/validators'
   Result: Done in 2 minutes, no duplication
```

---

## 🎯 Success Metrics

### Agent Performance:
- **Reuse Rate:** % of tasks using existing code vs building new
- **Target:** >50% reuse rate
- **Consolidation Rate:** Duplicates removed during audits
- **Target:** >3 duplicates per audit

### Platform Health:
- **Code Growth:** New lines added per feature
- **Target:** Minimize through reuse
- **Duplicate Count:** Similar components/patterns
- **Target:** Trending downward

---

## 🔗 Integration with ESA Framework

### Phase 0 Pre-Flight (ESA_PARALLEL_EXECUTION_METHODOLOGY.md):
```
✅ 0a. Agent #64 checks documentation (existing)
✅ 0b. Developer searches codebase (NEW)
✅ 0c. Developer asks questions (NEW)
✅ 0d. Agent #64 confirms no duplicates (NEW)
✅ 1. Then identify ESA layers and proceed
```

### Escalation Path (ESA_AGENT_A2A_PROTOCOL.md):
```
If unsure whether to reuse or build new:
Level 1: Ask peer agent (30 min response)
Level 2: Ask Division Chief (1 hr response)
Level 3: Ask Domain Coordinator (immediate)
Level 4: Ask Agent #64 + Agent #0 (final decision)
```

---

## 📖 Related Documentation

- **[ESA_REUSABLE_COMPONENTS.md](./ESA_REUSABLE_COMPONENTS.md)** - Living registry of reusable code
- **[ESA_PARALLEL_EXECUTION_METHODOLOGY.md](./ESA_PARALLEL_EXECUTION_METHODOLOGY.md)** - Phase 0 includes codebase check
- **[esa.md](./esa.md)** - "Build a new feature" section updated with Step 0
- **[standardized-page-audit.md](../pages/esa-tools/standardized-page-audit.md)** - Audit + consolidate workflow
- **[ESA_AGENT_A2A_PROTOCOL.md](./ESA_AGENT_A2A_PROTOCOL.md)** - Escalation when unsure

---

**Last Updated:** October 11, 2025  
**Maintained By:** Agent #64 (Documentation Architect)  
**Review Frequency:** After every major build (update registry)
