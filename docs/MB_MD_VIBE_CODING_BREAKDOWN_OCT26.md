# MB.MD BREAKDOWN - Vibe Coding Full Build
**Date**: October 26, 2025  
**Phase**: Breakdown (B)  
**Execution Mode**: SIMULTANEOUS  
**Objective**: Transform VibeGraph from placeholder system to fully autonomous AI-powered code generator

---

## **BREAKDOWN: 3 PARALLEL TRACKS**

### **TRACK A: VibeGraph AI Integration** (CRITICAL PATH)
**File**: `server/services/agents/VibeGraph.ts`  
**Dependencies**: Anthropic API, Repository map service  
**ETA**: 2 hours

**A1 - Add Anthropic Client** (10 min)
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

**A2 - Replace Manager Node** (30 min)
- Input: User request + Visual Editor context
- AI Task: Plan tasks, identify target files
- Output: Array of Task objects with real file paths
- Model: Claude 3.5 Sonnet
- Validation: Ensure files exist in project

**A3 - Replace Editor Node** (1 hour) **CRITICAL**
- Input: Task description + repo map + selected element
- AI Task: Generate unified diff for code changes
- Output: Real file path + valid unified diff
- Model: Claude 3.5 Sonnet
- Validation: No "unknown" paths, no "TODO" diffs

**A4 - Simplify Verifier/Tester** (20 min)
- For MVP: Auto-approve (can enhance later)
- Log verification status
- Return success for now

---

### **TRACK B: Git Commit Integration** (PARALLEL)
**File**: `server/routes/vibeRoutes.ts`  
**Dependencies**: File editing service, code_changes table  
**ETA**: 30 min

**B1 - Add Git Utilities** (10 min)
```typescript
import { execSync } from 'child_process';

function gitCommit(filePath: string, message: string): string {
  execSync(`git add ${filePath}`);
  execSync(`git commit -m "${message}"`);
  return execSync('git rev-parse HEAD').toString().trim();
}
```

**B2 - Update Apply Endpoint** (20 min)
- After successful file edit
- Stage + commit changed file
- Update code_changes table with gitCommitHash
- Set status to 'applied', appliedAt timestamp

---

### **TRACK C: Frontend Diff Preview Wiring** (PARALLEL)
**File**: `client/src/components/mrBlue/ChatInterface.tsx`  
**Dependencies**: vibeApi.ts, DiffPreviewModal  
**ETA**: 30 min

**C1 - Add Vibe Intent Detection** (10 min)
- Check message for code modification keywords
- If detected + Visual Editor context exists
- Execute vibe coding request

**C2 - Handle Vibe Response** (10 min)
- Extract code changes from response
- Open DiffPreviewModal with changes
- Store changeId for approval tracking

**C3 - Wire Approval Handlers** (10 min)
- On approve: Call applyCodeChange()
- Invalidate React Query cache
- Show success toast
- Close modal

---

## **EXECUTION SEQUENCE**

**Phase 1: Setup** (10 min)
- ✅ Add Anthropic blueprint
- ✅ Verify ANTHROPIC_API_KEY exists
- ✅ Push code_changes table to database
- ✅ Install any missing dependencies

**Phase 2: Build Simultaneously** (2 hours)
- Track A + Track B + Track C in parallel
- A2, B1, C1 can run at same time
- A3 is critical path (longest task)
- All tracks converge at testing

**Phase 3: Integration Testing** (30 min)
- Wire all 3 tracks together
- Test end-to-end workflow
- Fix any integration issues

**Phase 4: Validation** (30 min)
- Run canonical test case
- Verify database writes
- Check git commits
- Screenshot evidence

---

## **SUCCESS CRITERIA**

**Track A Success**:
- [ ] Manager node returns real file paths (no "unknown")
- [ ] Editor node generates valid unified diffs (no "TODO")
- [ ] VibeGraph test: Input "change background red" → Output real diff

**Track B Success**:
- [ ] Git commit created after code application
- [ ] code_changes.gitCommitHash populated
- [ ] Git log shows commit with attribution

**Track C Success**:
- [ ] DiffPreviewModal opens with real code changes
- [ ] Approve button applies changes via API
- [ ] Preview refreshes showing applied changes

**End-to-End Success**:
- [ ] User selects element in Visual Editor
- [ ] User requests change in Mr Blue
- [ ] Diff preview shows real code
- [ ] Approve applies changes
- [ ] Preview updates immediately
- [ ] Database has record with userId, real filePath, diff, gitHash
- [ ] Git history shows commit
- [ ] Changes persist after refresh

---

## **RISK MITIGATION**

**Risk 1**: Claude API rate limits
- Mitigation: Implement exponential backoff
- Fallback: Cache successful prompts

**Risk 2**: File path detection fails
- Mitigation: Use heuristics + repo map
- Fallback: Ask user to specify file

**Risk 3**: Diff generation errors
- Mitigation: Validate diff syntax before returning
- Fallback: Retry with clarified prompt

**Risk 4**: Git conflicts
- Mitigation: Check for uncommitted changes first
- Fallback: Create branch for vibe changes

---

## **DEPLOYMENT GATES**

**Gate 1**: TypeScript compiles with no errors  
**Gate 2**: Database schema matches code_changes table  
**Gate 3**: Anthropic API responds successfully  
**Gate 4**: Test message flows through full pipeline  
**Gate 5**: Git commit appears in history  
**Gate 6**: Visual Editor shows applied changes  

All gates must pass before marking complete.

---

**Status**: Ready to execute  
**Next**: Build all 3 tracks simultaneously  
**Methodology**: MB.MD Breakdown → Simultaneous Build
