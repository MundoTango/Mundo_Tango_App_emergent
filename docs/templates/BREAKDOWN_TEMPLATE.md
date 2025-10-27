# MB.MD Phase 2: BREAKDOWN Template

**Feature/Task:** [Name of feature or task]  
**Agent:** [Your agent ID/name]  
**Date:** [Today's date]  
**Execution Mode:** [From MAPPING phase]

---

## 1. TASK BREAKDOWN

**Main Goal:** [One sentence describing what we're building]

**Subtasks:**
1. **Task 1:** [Description]
   - Files to modify: `[file1.tsx]`
   - Type: [ ] New file [ ] Edit existing [ ] Delete
   - Estimated lines: [~X lines]
   
2. **Task 2:** [Description]
   - Files to modify: `[file2.ts]`
   - Type: [ ] New file [ ] Edit existing [ ] Delete
   - Estimated lines: [~X lines]

3. **Task 3:** [Description]
   - Files to modify: `[file3.tsx]`
   - Type: [ ] New file [ ] Edit existing [ ] Delete
   - Estimated lines: [~X lines]

---

## 2. DEPENDENCY GRAPH

**Task Dependencies:**
```
Task 1 (Foundation)
    ↓
Task 2 (Build on Task 1)
    ↓
Task 3 (Integration)
```

**Can be done in parallel:**
- Tasks [X, Y] - No dependencies between them

**Must be sequential:**
- Task [A] before Task [B] - Because [reason]

---

## 3. INTEGRATION PLAN

**For each component built, integration checklist:**

### Component: [ComponentName.tsx]
- [ ] **BUILD** - Create component file
- [ ] **IMPORT** - Add import to parent (`[ParentComponent.tsx]`)
- [ ] **RENDER** - Add JSX to parent component
- [ ] **PROPS** - Pass required props correctly
- [ ] **WIRE** - Connect event handlers and state
- [ ] **TEST** - Verify component appears in UI

**Parent file to modify:** `[ParentComponent.tsx]`

**Import statement:**
```typescript
import [ComponentName] from '@/components/path/ComponentName';
```

**JSX to add:**
```typescript
<ComponentName 
  prop1={value1}
  prop2={value2}
  onEvent={handleEvent}
/>
```

---

## 4. TEST PLAN

**Unit Tests:**
- [ ] Test: `[function name]` - [What it should do]
  - Input: [Sample input]
  - Expected: [Expected output]
  
**Integration Tests:**
- [ ] Test: `[API endpoint]` - [What it should return]
  - Request: [Sample request]
  - Response: [Expected response]

**E2E Tests (Playwright):**
- [ ] Test: `[User journey name]`
  - Steps: [List user actions]
  - Verification: [What we check]
  - Screenshot: [When to capture]

---

## 5. SCREENSHOT REQUIREMENTS

**Screenshot plan:**

| Screenshot | When to Capture | Testid to Verify | Purpose |
|------------|----------------|------------------|---------|
| `feature-access.png` | After navigation | `button-open-feature` | User can find it |
| `feature-action.png` | Mid-interaction | `button-submit` | User can interact |
| `feature-result.png` | After completion | `text-success` | User sees result |
| `feature-error.png` | Error handling | `text-error` | Graceful failure |

---

## 6. SUCCESS CRITERIA

**Feature is COMPLETE when:**
- [ ] All subtasks implemented
- [ ] All components imported and rendered
- [ ] All tests passing (unit + integration + E2E)
- [ ] All screenshots captured
- [ ] Browser console clean (no errors)
- [ ] Server logs clean (no errors)
- [ ] User journey tested end-to-end
- [ ] Architect approved (if complex)
- [ ] QA Agent approved

---

## 7. ROLLBACK PLAN

**If something breaks:**
1. **Identify failure point:** [Which task failed?]
2. **Revert changes:** `git reset --hard HEAD~1`
3. **Analyze root cause:** [Why did it fail?]
4. **Fix and retry:** [What to change?]

**Backup strategy:**
- [ ] Git commit after each subtask
- [ ] Database backup before schema changes
- [ ] Screenshot before/after changes

---

## 8. ARCHITECT REVIEW REQUIREMENTS

**Review needed:** [ ] Yes [ ] No

**Why:**
- [ ] New feature (not just bug fix)
- [ ] >50 lines changed
- [ ] Database schema change
- [ ] Security-related change
- [ ] Super-admin functionality
- [ ] Breaking change

**Evidence to provide for review:**
- [ ] Git diff of all changes
- [ ] Screenshot of feature working
- [ ] Test results (all passing)
- [ ] Browser console (clean)
- [ ] Server logs (clean)

---

## 9. ESTIMATED COMPLEXITY

**Time estimate:** [X hours/days]

**Complexity factors:**
- New file creation: [X files]
- Existing file edits: [X files]
- API endpoint changes: [X endpoints]
- Database changes: [X tables]
- Test writing: [X tests]

**Confidence level:** [ ] High [ ] Medium [ ] Low

---

## 10. BREAKDOWN PHASE CHECKLIST

Before proceeding to MITIGATION, verify:
- [ ] All subtasks clearly defined
- [ ] Dependencies identified
- [ ] Integration plan documented
- [ ] Test plan created (unit + integration + E2E)
- [ ] Screenshot requirements mapped
- [ ] Success criteria documented
- [ ] Rollback plan prepared
- [ ] Architect review requirement determined
- [ ] Complexity estimated

---

## 11. EVIDENCE UPLOAD

**Evidence collected:**
```bash
# Upload breakdown evidence
curl -X POST http://localhost:5000/api/mbmd/evidence/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": YOUR_SESSION_ID,
    "phase": "BREAKDOWN",
    "evidenceType": "document",
    "metadata": {
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "requiresArchitectReview": true/false,
      "estimatedHours": X
    }
  }'
```

---

**BREAKDOWN PHASE COMPLETE:** ✅  
**Next Phase:** MITIGATION (Build + Test)  
**Ready to proceed:** [ ] Yes [ ] No (explain why)
