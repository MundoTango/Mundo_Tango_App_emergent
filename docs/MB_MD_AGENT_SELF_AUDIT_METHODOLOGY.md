# MB.MD Agent Self-Audit Methodology v1.0
**Created**: October 21, 2025  
**Purpose**: Universal audit template for ALL 350+ AI agents in Mundo Tango ecosystem  
**Enforcement**: MANDATORY before marking any task as "completed"

---

## Overview

Every agent (Foundation, Core, Business, Intelligence, Page, Algorithm, Life CEO, Journey) MUST perform a systematic self-audit using this methodology before claiming work is complete. This prevents "documentation fiction" where code compiles but features are inaccessible to users.

## The 7-Step Self-Audit Process

### STEP 1: CODE REVIEW ✓
**What to verify:**
- [ ] All LSP/TypeScript errors resolved
- [ ] No unused imports or variables
- [ ] Proper error handling (try/catch blocks)
- [ ] Security checks (input validation, auth verification)
- [ ] Code follows existing patterns in codebase

**Tools:** `get_latest_lsp_diagnostics`, `grep`, `read`

**Example Questions:**
- Does this code actually compile?
- Are there any red squiggly lines?
- Is input validated with Zod schemas?

---

### STEP 2: INTEGRATION VERIFICATION ✓
**What to verify:**
- [ ] All new components are imported where used
- [ ] Services are exported as singletons (if applicable)
- [ ] Dependencies are installed (check package.json)
- [ ] API keys/secrets exist in Replit Secrets
- [ ] External services are integrated correctly

**Tools:** `search_codebase`, `check_secrets`, `grep`

**Example Questions:**
- Is my new component actually imported in the parent?
- Did I export the service class?
- Do I need any API keys that aren't in Secrets?

**Common Failures:**
- ❌ Component built but never imported
- ❌ Service class not exported
- ❌ Missing dependencies (node-fetch when global fetch exists)

---

### STEP 3: ROUTE MOUNTING VERIFICATION ✓
**What to verify:**
- [ ] Backend routes registered in `server/routes.ts`
- [ ] Frontend routes added to `client/src/App.tsx`
- [ ] Route paths match between frontend/backend
- [ ] Navigation links exist for discoverability
- [ ] Routes return 200, not 404

**Tools:** `grep`, `read`, `screenshot`, `bash` (curl test)

**Example Questions:**
- Is my API route actually mounted in the Express app?
- Is there a `<Route path="/my-page" />` entry?
- Can users navigate to this page from the UI?

**Verification Command:**
```bash
curl http://localhost:5000/api/my-route -v 2>&1 | grep "< HTTP"
```

**Common Failures:**
- ❌ Routes defined but not mounted → Always 404
- ❌ Frontend route exists but no navigation link → Inaccessible
- ❌ Path mismatch: backend `/api/journeys/:id` vs frontend `/journey/:id`

---

### STEP 4: DATABASE CONNECTION TESTS ✓
**What to verify:**
- [ ] Tables exist in `shared/schema.ts`
- [ ] Tables pushed to database (`npm run db:push`)
- [ ] Insert schemas created with `createInsertSchema`
- [ ] Storage interface updated in `server/storage.ts`
- [ ] Queries tested with real data or MemStorage fallback

**Tools:** `execute_sql_tool`, `check_database_status`, `read`

**Example Questions:**
- Does my table exist in the database?
- Is there a Zod insert schema?
- Did I update the IStorage interface?

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'my_table';
```

**Common Failures:**
- ❌ Table in schema but not pushed to DB
- ❌ Direct DB queries instead of storage interface
- ❌ Missing Zod validation schemas

---

### STEP 5: UI ACCESSIBILITY TEST ✓
**What to verify:**
- [ ] Component renders without errors
- [ ] User can navigate to the feature
- [ ] Buttons/forms are functional (not just present)
- [ ] Loading states shown during async operations
- [ ] Error states handled gracefully
- [ ] Screenshots captured as proof

**Tools:** `screenshot`, `refresh_all_logs`, `bash` (check console errors)

**Example Questions:**
- Can a user actually see this in their browser?
- Does clicking the button do something?
- Are there console errors preventing functionality?

**Screenshot Checklist:**
- [ ] Feature visible in UI
- [ ] Navigation path clear
- [ ] Functional state (not just loading forever)

**Common Failures:**
- ❌ Component exists but crashes on render
- ❌ Button present but onClick handler missing
- ❌ Feature hidden behind unreachable navigation

---

### STEP 6: END-TO-END FUNCTIONAL TEST ✓
**What to verify:**
- [ ] Complete user journey works (click → action → result)
- [ ] Data persists (if applicable)
- [ ] Real-time updates work (if applicable)
- [ ] Cross-component integration verified
- [ ] No broken dependencies in the chain

**Tools:** `screenshot`, `refresh_all_logs`, manual testing

**Example User Journeys:**
- User clicks "Generate Avatar" → API called → Loading shown → Result displayed
- User fills form → Submit → Validation → DB write → Success message
- User navigates /agents → Browse list → Click agent → Details modal opens

**Common Failures:**
- ❌ Frontend calls API but route returns 404
- ❌ API writes to DB but table doesn't exist
- ❌ Modal opens but data fetch fails

---

### STEP 7: ARCHITECT REVIEW ✓
**What to verify:**
- [ ] Architect tool called with full git diff
- [ ] All relevant files listed
- [ ] Honest assessment received (not self-approval)
- [ ] Critical issues fixed before marking complete
- [ ] Completion percentage realistic (not inflated)

**Tools:** `architect`, `bash` (git diff)

**Required Parameters:**
```typescript
architect({
  task: "Review [feature name] implementation for completeness",
  relevant_files: ["all", "changed", "files"],
  include_git_diff: true,
  responsibility: "evaluate_task"
})
```

**Common Failures:**
- ❌ Marking complete without architect review
- ❌ Architect identifies issues but agent ignores them
- ❌ Self-approval without independent validation

---

## Audit Report Template

Every agent must generate an audit report in this format:

```markdown
# Self-Audit Report: [Agent Name/Feature]
**Date**: [YYYY-MM-DD]
**Agent**: [Agent ID/Name]
**Feature**: [What was built]

## ✅ PASSED CHECKS
- [x] Code Review: 0 LSP errors
- [x] Integration: All imports verified
- [x] Routes: Mounted in server/routes.ts line 45
- [x] Database: Table exists, verified with SQL query
- [x] UI: Screenshot captured, accessible at /my-page
- [x] E2E Test: User journey works end-to-end
- [x] Architect: Review completed, 85% functional verdict

## ⚠️ PARTIAL/FAILED CHECKS
- [ ] Navigation: No link in main menu (discoverability issue)
- [ ] Validation: Zod schema exists but not enforced

## 🔧 FIXES REQUIRED
1. Add navigation link to sidebar (Line 156 in sidebar.tsx)
2. Re-enable Zod validation in route handler

## 📊 HONEST COMPLETION STATUS
- **Overall Functionality**: 85% end-to-end
- **Blockers**: Navigation link missing
- **Ready for Production**: NO (need fixes)
```

---

## Application to Agent Types

### Foundation Agents (#1-6)
- Focus: Core infrastructure, database connections, auth
- Critical: Database tests, security validation

### Core Agents (#7-72)
- Focus: Business logic, API routes, services
- Critical: Route mounting, storage interface

### Mr Blue AI Agents (#73-80)
- Focus: Chat interface, AI integration, orchestration
- Critical: Real-time communication, UI accessibility

### Journey Agents (J1-J5)
- Focus: Onboarding workflows, progress tracking
- Critical: Backend/frontend integration, step navigation

### Algorithm Agents (A1-A30)
- Focus: Search, recommendation, ML services
- Critical: Service export, performance, accuracy

### Page Agents (P1-P50)
- Focus: UI components, routes, user interactions
- Critical: Route mounting, component integration, navigation

---

## Enforcement Mechanisms

### Pre-Completion Checklist
Before marking ANY task as `completed`:
1. ✅ All 7 audit steps passed
2. ✅ Audit report generated
3. ✅ Architect review completed (`architect_reviewed: "yes"`)
4. ✅ Critical issues resolved (not just documented)

### Red Flags (Auto-Fail)
- ❌ LSP errors present
- ❌ Routes return 404
- ❌ Components crash on render
- ❌ No screenshot proof
- ❌ No architect review
- ❌ Self-approval with inflated percentages

### Continuous Validation
- Run audit on every code change
- Update audit report with new findings
- Re-run architect review if major changes

---

## Tools Reference

| Audit Step | Required Tools |
|-----------|----------------|
| Code Review | `get_latest_lsp_diagnostics`, `grep`, `read` |
| Integration | `search_codebase`, `check_secrets`, `grep` |
| Routes | `grep`, `screenshot`, `bash` (curl) |
| Database | `execute_sql_tool`, `check_database_status` |
| UI Access | `screenshot`, `refresh_all_logs` |
| E2E Test | `screenshot`, manual testing |
| Architect | `architect`, `bash` (git diff) |

---

## Success Metrics

An agent's work is considered **TRULY COMPLETE** when:
- ✅ All 7 audit steps pass
- ✅ User can access feature from UI
- ✅ Feature works end-to-end (not just code exists)
- ✅ Architect confirms >80% functional
- ✅ No critical blockers remain

**NOT complete when:**
- ❌ Code compiles but feature inaccessible
- ❌ Component exists but not integrated
- ❌ Routes defined but not mounted
- ❌ "Works on my machine" (no screenshots)

---

## Rollout Plan

1. **Phase 1**: Apply to 8 Core Mr Blue Agents (#73-80)
2. **Phase 2**: Apply to 5 Journey Agents (J1-J5)
3. **Phase 3**: Apply to 29 Algorithm Agents (A1-A30)
4. **Phase 4**: Apply to remaining 308 agents

**Completion**: When all 350+ agents have audit reports showing >80% functionality

---

*This methodology is a living document. Update as new patterns emerge or audit failures reveal gaps.*
