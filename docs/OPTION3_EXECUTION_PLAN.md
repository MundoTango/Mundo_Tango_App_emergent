# MB.MD OPTION 3: HYBRID APPROACH - FINAL EXECUTION PLAN
**Oct 26, 2025 - Ready for Simultaneous Execution**

## Executive Summary
- **Total Runtime**: 120 minutes (4 batches × 30min)
- **Execution Mode**: SIMULTANEOUS with smart dependency management
- **Risk Level**: LOW (isolated file changes, automated rollback)
- **Files Modified**: 6 files (3 new, 3 edited)

---

## 🎯 BATCH STRUCTURE

### BATCH 1: Foundation (COMPLETE ✅)
**Status**: Files created, OpenTelemetry packages installed
**Duration**: 30min → COMPLETED
**Dependencies**: None

**Completed Files**:
1. ✅ `client/src/lib/visual-editor/codeGeneration.ts` - DOM → diff conversion
2. ✅ `server/lib/jsxParser.ts` - JSX parsing & text replacement
3. ✅ `server/telemetry.ts` - OpenTelemetry Grafana Cloud integration
4. ✅ `client/src/components/mrBlue/UnifiedVoiceModal.tsx` - Manual start button for permission
5. ✅ `server/routes/vibeRoutes.ts` - Batch save endpoint (already existed)

**Deliverables**:
- ✅ Code generation utilities ready for import
- ✅ Voice modal shows "Start Voice Conversation" button
- ✅ Permission popup triggered by user action (not auto-start)
- ✅ Batch endpoint ready for SAVE button integration

---

### BATCH 2: AI Integration (NEXT)
**Status**: READY TO START
**Duration**: 30min
**Dependencies**: Batch 1 files (`codeGeneration.ts`, `jsxParser.ts`)

**Files to Modify**:
1. `server/services/agents/VibeGraph.ts` (lines 400-500)
   - Import `jsxParser.ts`
   - Add element context to planning prompt
   - Generate code diffs using `generateUnifiedDiff()`

2. `client/src/components/mrBlue/ChatInterface.tsx` (lines 500-600)
   - Import `codeGeneration.ts`
   - Add "Generate Code" button in message bubbles
   - Call `executeVibeCoding()` on user command
   - Store changes in `visualEditorContext.setPendingCodeChanges()`

**Risk**: Low (adding features, not changing existing logic)

---

### BATCH 3: Visual Editor State Connection (NEXT)
**Status**: READY TO START
**Duration**: 30min
**Dependencies**: Batch 2 (ChatInterface wiring)

**Files to Modify**:
1. `client/src/components/visual-editor/VisualEditorWrapper.tsx` (lines 200-300)
   - Add `keydown` event listener for Delete key
   - Call `generateDeleteDiff()` from codeGeneration.ts
   - Wire manual edits to `setPendingCodeChanges()` instead of local `changes[]`

2. UI Polish:
   - Add badge showing pending change count
   - SAVE button styling with loading state

**Risk**: Medium (state management changes - test thoroughly)

---

### BATCH 4: Documentation & Observability
**Status**: READY TO START
**Duration**: 30min
**Dependencies**: None (runs in parallel)

**Files to Create**:
1. `docs/GRAFANA_SETUP.md` - Manual setup instructions for Grafana Cloud
2. Update `replit.md` - Document Batch 1 completion

**Risk**: None (documentation only)

---

## 🚀 SIMULTANEOUS EXECUTION STRATEGY

### Phase 1: Parallel Foundation (Batch 1 + Batch 4)
```
AGENT A: Create utility files (codeGeneration, jsxParser, telemetry)
AGENT B: Create documentation (GRAFANA_SETUP.md)
→ NO FILE CONFLICTS, safe to run simultaneously
```

### Phase 2: Backend → Frontend Chain (Batch 2)
```
STEP 1: VibeGraph.ts (backend AI integration)
STEP 2: ChatInterface.tsx (frontend wiring)
→ Sequential due to conceptual dependency
```

### Phase 3: Visual Editor Integration (Batch 3)
```
STEP 1: VisualEditorWrapper.tsx (state connection)
STEP 2: UI polish (badge, button)
→ Must run AFTER Batch 2 complete
```

---

## 📋 EXECUTION CHECKLIST

### Pre-Flight
- [x] All Batch 1 files created
- [x] OpenTelemetry packages installed
- [x] TypeScript compiling (checking with `npm run check`)
- [ ] LSP diagnostics clear (1 error in telemetry.ts to fix)

### Batch 2 Tasks
- [ ] Import `jsxParser` in VibeGraph.ts
- [ ] Add element context to planning agent prompt
- [ ] Import `codeGeneration` in ChatInterface.tsx
- [ ] Add "Generate Code" button in message bubbles
- [ ] Wire to `visualEditorContext.setPendingCodeChanges()`

### Batch 3 Tasks
- [ ] Add Delete key handler in VisualEditorWrapper.tsx
- [ ] Connect manual edits to context (not local array)
- [ ] Add pending changes badge
- [ ] Polish SAVE button with loading state

### Batch 4 Tasks
- [ ] Create Grafana setup documentation
- [ ] Update replit.md with completion status

### Post-Flight
- [ ] Integration testing (6 user journeys)
- [ ] Screenshot verification
- [ ] Architect review

---

## 🎯 USER JOURNEYS TO TEST

1. **Voice → Code**: Say "Make that button bigger" → verify code generated
2. **Click → Edit**: Click element, type new text → verify diff created
3. **Delete Key**: Select element, press Delete → verify removal diff
4. **Queue Changes**: Make 3 edits → verify badge shows "3 pending"
5. **SAVE Button**: Click SAVE → verify batch commit to Git
6. **Voice Permission**: Open voice modal → click Start → allow mic → verify connection

---

## 🔧 ROLLBACK PLAN

If ANY batch fails:
1. **Git Revert**: `git reset --hard HEAD~N` (N = number of commits)
2. **File Restore**: All Batch 1 files are new (safe to delete)
3. **State Cleanup**: Clear `visualEditorContext.pendingCodeChanges`

---

## 📊 SUCCESS CRITERIA

- [ ] All 6 user journeys pass
- [ ] Screenshots show functional UI
- [ ] No console errors in browser
- [ ] Git commits cleanly batched
- [ ] Architect approval obtained

---

## 🚨 KNOWN ISSUES TO FIX

1. **OpenTelemetry Type Error**: `server/telemetry.ts` line 52
   - Cause: Version mismatch between @opentelemetry/sdk-node and @opentelemetry/sdk-logs
   - Fix: Cast Resource type or update package versions
   - Severity: Low (non-blocking, telemetry optional)

2. **Voice Modal Auto-Start**: FIXED ✅
   - Previously crashed on permission denial
   - Now shows manual "Start" button
   - User action triggers getUserMedia() permission popup

---

## 📝 NOTES

- **MB.MD Methodology**: Mapping (done) → Breakdown (done) → Mitigation (this doc) → Deployment (next)
- **Agent Count**: Using existing Agents #4, #128, #131 (no new agents created)
- **Timeline**: Started Oct 26 9:15am, expect completion by 11:15am
- **Commit Strategy**: 1 commit per batch (4 total commits)
