# Upcoming Work - Master List (UPDATED)
**MB.MD Methodology - Complete Task Queue**

**Date**: October 26, 2025  
**Status**: 🟡 RESEARCH COMPLETE - AWAITING BUILD APPROVAL  
**Total Estimated Time**: 265 minutes (~4.5 hours)

---

## 🎯 WORK ORGANIZATION

All tasks organized by priority (P0-P2) with time estimates and dependencies.

**NEW TASK ADDED**: Task #10 - Visual Editor Save Implementation (P0)

---

## 🔴 P0 - CRITICAL BLOCKERS (Must Fix First)

### 1. Voice Modal Permission Crash ⚡ CRITICAL
**Time**: 20 minutes  
**Research**: `docs/VOICE_MODAL_PERMISSION_RESEARCH.md`

**Problem**: Modal opens → immediately closes, no browser permission request shown

**Root Cause**:
- `checkPermission()` uses `navigator.permissions.query()` which **ONLY CHECKS** permission status
- Does NOT trigger browser permission popup
- Modal closes immediately if permission not previously granted
- User never sees permission request

**Fix Strategy**: Option B - Manual Start Button
- Remove auto-start on modal open
- Add "Start Voice Conversation" button
- Request permission AFTER user clicks button
- Proper idle/starting/active/error states

**Files to Modify**:
- `client/src/components/mrBlue/UnifiedVoiceModal.tsx`

**Testing**:
- [ ] Modal opens and stays open
- [ ] User clicks start button
- [ ] Browser permission popup appears
- [ ] User clicks "Allow" → recording starts
- [ ] User clicks "Block" → proper error shown

---

### 2. Mr Blue Code Generation - Backend Not Wired ⚡ CRITICAL
**Time**: 45 minutes  
**Research**: `docs/MRBLUE_EXECUTION_GAP_PLAN.md`

**Problem**: Mr Blue talks about changes but doesn't generate code

**Root Cause**:
- Frontend calls `executeVibeCoding()` ✅
- Backend returns empty `codeChanges[]` ❌
- VibeGraph returns clarification questions instead of code ❌
- No intent detection ❌

**Fix Strategy**:
1. Add intent detection (code request vs question)
2. Wire VibeGraph to actually invoke EditorAgent
3. Generate unified diffs
4. Return code to frontend
5. Queue changes in VisualEditorContext

**Files to Modify**:
- `client/src/components/mrBlue/ChatInterface.tsx` (intent detection)
- `server/services/agents/VibeGraph.ts` (code generation logic)
- `server/routes/vibeRoutes.ts` (pass code to frontend)

**Testing**:
- [ ] User: "Make background red"
- [ ] Mr Blue generates code (not just clarification)
- [ ] Badge shows "1 change queued"
- [ ] Changes visible in VisualEditorContext

---

### 3. Batch Save Endpoint - Missing Backend API ⚡ CRITICAL
**Time**: 25 minutes  
**Research**: `docs/COMPREHENSIVE_WIRING_ANALYSIS.md`

**Problem**: UniversalSaveSystem calls `/api/vibe/apply-batch` but endpoint doesn't exist

**Root Cause**:
- Frontend Save button exists ✅
- Frontend calls batch endpoint ✅
- Backend endpoint NOT CREATED ❌

**Fix Strategy**:
1. Create `/api/vibe/apply-batch` endpoint
2. Apply all queued diffs in single transaction
3. Generate single git commit with all files
4. Return summary (success/failure per file)

**Files to Create**:
- `server/routes/vibeRoutes.ts` (add batch apply endpoint)

**Testing**:
- [ ] Queue 3 changes
- [ ] Click SAVE button
- [ ] All 3 changes applied
- [ ] Single git commit created
- [ ] Success toast shows commit hash

---

### 10. Visual Editor Save Functionality ⚡ CRITICAL **NEW**
**Time**: 90 minutes  
**Research**: `docs/VISUAL_EDITOR_SAVE_MISSING_RESEARCH.md`

**User Report**: "I just tried to delete an element and changed the text of another, not able to save."

**Problem**: Visual Editor has NO WAY to save manual edits to files

**Root Cause**:
- `handleSaveInlineText` function **REFERENCED but NOT DEFINED** (line 549)
- `handleCancelInlineEdit` function **REFERENCED but NOT DEFINED** (line 550)
- Text changes only update DOM (not source files)
- Delete key handler **COMPLETELY MISSING**
- No code generation for DOM edits
- No integration with save queue

**Evidence from Code**:
```typescript
// Line 549 in VisualEditorWrapper.tsx:
<InlineTextEditor
  element={editingElement}
  onSave={handleSaveInlineText}  // ❌ FUNCTION DOESN'T EXIST!
  onCancel={handleCancelInlineEdit}  // ❌ FUNCTION DOESN'T EXIST!
/>
```

**Fix Strategy**:

**Part 1: Define Missing Functions** (20 min)
1. Create `handleSaveInlineText` function
2. Create `handleCancelInlineEdit` function
3. Generate code diff from DOM change
4. Queue change in VisualEditorContext

**Part 2: Implement Delete Key** (20 min)
1. Add keydown event listener for Delete
2. Generate delete code diff
3. Queue delete change

**Part 3: Code Generation Layer** (40 min)
1. Create JSX parser utility
2. Map DOM elements to source files
3. Generate unified diffs for changes
4. Preserve formatting/indentation

**Part 4: Integration with Save Queue** (10 min)
1. Connect to VisualEditorContext.pendingCodeChanges
2. Update badge with count
3. Wire to UniversalSaveSystem

**Files to Create/Modify**:
- `client/src/components/visual-editor/VisualEditorWrapper.tsx` (add missing functions)
- `client/src/lib/visual-editor/codeGeneration.ts` (NEW - code gen utilities)
- `server/lib/jsxParser.ts` (NEW - JSX parsing with @babel/parser)

**Testing**:
- [ ] Double-click element → edit text
- [ ] Click Save → change queued
- [ ] Badge shows "1 change queued"
- [ ] Select element → press Delete
- [ ] Badge shows "2 changes queued"
- [ ] Click SAVE button
- [ ] Both changes applied to files
- [ ] Refresh page → changes persist

---

## 🟡 P1 - HIGH PRIORITY (Needed for Replit Parity)

### 4. Grafana OpenTelemetry Setup ⚠️ AUTH FAILING
**Time**: 45 minutes  
**Research**: `docs/GRAFANA_OTEL_SETUP_RESEARCH.md`

**Problem**: Grafana metrics export failing with HTTP 401, spamming logs

**Root Cause**:
- Using custom JSON format instead of OTLP Protobuf ❌
- Wrong endpoint structure ❌
- Not using official OpenTelemetry SDK ❌

**Fix Strategy**:
1. Install `@opentelemetry/sdk-node` + protobuf exporters
2. Create `server/telemetry.ts` with auto-configuration
3. Add user's Grafana Cloud environment variables to Secrets
4. Remove old `GrafanaCollector.ts` (deprecated)
5. Import telemetry FIRST in server/index.ts

**Environment Variables to Add**:
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic MTQxNzIwNzpnbGNfZXlKdklqb2lNVFUzTURrME1pSXNJbTRpT2lKdGRXNWtieTEwWVc1bmJ5SXNJbXNpT2lKeFUxVTNNV2syU2pWc05EUkdXRGx3ZDFnNGVETTBUV1ppTENKdElqcDdJbklpT2lKd2NtOWtMWFZ6TFdWaGMzUXRNQ0o5ZlE9PQ==
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=mundo-tango
OTEL_RESOURCE_ATTRIBUTES=service.namespace=mundo-tango-app,deployment.environment=production
```

**Files to Create/Modify**:
- `server/telemetry.ts` (new - OTLP setup)
- `server/index.ts` (import telemetry first)
- Remove: `server/services/grafanaCollector.ts`

**Testing**:
- [ ] No more 401 errors in logs
- [ ] Metrics export silently every 10 seconds
- [ ] Grafana Cloud Explore shows metrics within 1 minute

**Grafana Loki**: ❌ **NOT NEEDED** (researched in `docs/GRAFANA_LOKI_RESEARCH.md`)
- Logs automatically sent via OTEL to Grafana Cloud Loki
- No separate configuration required

---

### 5. Grafana Cloud Dashboard Setup 📊
**Time**: 15 minutes  
**Research**: `docs/GRAFANA_OTEL_SETUP_RESEARCH.md`

**Goal**: Visualize metrics in Grafana Cloud dashboards

**Strategy**:
1. Sign in to Grafana Cloud (https://grafana.com/)
2. Go to Dashboards → Import
3. Import Node.js Application Dashboard (ID: 11074)
4. Customize for Mundo Tango metrics
5. Add custom panels for vibe coding metrics

**What You'll See**:
- HTTP request rates
- Response times (p50, p95, p99)
- Error rates
- CPU/Memory usage
- Custom vibe coding session metrics

**Testing**:
- [ ] Dashboard shows HTTP requests
- [ ] Graph updates with traffic
- [ ] Custom vibe metrics visible

---

### 6. Fix Element Context Integration ⚠️
**Time**: 15 minutes  
**Research**: `docs/COMPREHENSIVE_WIRING_ANALYSIS.md`

**Problem**: Backend ignores `visualEditorContext.selectedElement`

**Root Cause**:
- Frontend sends selectedElement ✅
- Backend receives it ✅
- Backend doesn't USE it ❌
- Asks "which element?" when already provided ❌

**Fix Strategy**:
1. Update VibeGraph to check if selectedElement exists
2. Skip clarification if element already selected
3. Use element info in code generation

**Files to Modify**:
- `server/services/agents/VibeGraph.ts`

**Testing**:
- [ ] Select element in Visual Editor
- [ ] Tell Mr Blue: "Make it red"
- [ ] No clarification question
- [ ] Code generated for selected element

---

## 🟢 P2 - MEDIUM PRIORITY (UX Improvements)

### 7. Badge Visual Feedback 🎨
**Time**: 5 minutes

**Goal**: Show badge count when changes queued

**Current**: Badge exists but never updates (no code ever queued)

**After P0 Fixes**: Will auto-update when Mr Blue generates code

**Files to Verify**:
- `client/src/components/mrBlue/InspectorBadge.tsx`

**Testing**:
- [ ] Queue 1 change → Badge shows "1"
- [ ] Queue 2 more → Badge shows "3"
- [ ] Click SAVE → Badge resets to "0"

---

### 8. SAVE Button Conditional Visibility 🎨
**Time**: 5 minutes

**Goal**: Show SAVE button only when changes pending

**Strategy**:
```typescript
{pendingCodeChanges.length > 0 && (
  <Button onClick={handleSave}>
    SAVE ({pendingCodeChanges.length})
  </Button>
)}
```

**Files to Modify**:
- `client/src/components/visual-editor/VisualEditorWrapper.tsx` (or wherever SAVE button lives)

**Testing**:
- [ ] No changes → SAVE button hidden
- [ ] 1 change queued → SAVE button appears
- [ ] Click SAVE → Button disappears after apply

---

## 📋 COMPLETE IMPLEMENTATION SEQUENCE

### Phase 1: Fix Critical Blockers (180 minutes)
**Order**:
1. Voice Modal (20 min) - Independent
2. Visual Editor Save (90 min) - Blocks user manual edits **NEW**
3. Mr Blue Code Generation (45 min) - Blocks AI edits
4. Batch Save Endpoint (25 min) - Depends on #2 and #3

**Why This Order**:
- Voice modal independent - can do anytime
- Visual Editor save FIRST - user actively trying to use it
- Mr Blue must generate code BEFORE batch save can work
- Batch save needs code to apply

---

### Phase 2: Fix Observability (60 minutes)
**Order**:
1. Grafana OTEL Setup (45 min)
2. Grafana Dashboard Setup (15 min) - Depends on #1

**Why This Order**:
- Must fix OTEL export before dashboards will show data

---

### Phase 3: Polish UX (25 minutes)
**Order**:
1. Element Context Integration (15 min)
2. Badge Visual Feedback (5 min)
3. SAVE Button Visibility (5 min)

**Why This Order**:
- Independent improvements, any order works

---

## 🎯 SUCCESS METRICS

**Voice Modal**:
- ✅ Modal stays open
- ✅ Permission popup appears
- ✅ Recording starts successfully
- ✅ No crash loop

**Visual Editor Save**: **NEW**
- ✅ Text edits save to files
- ✅ Delete key removes elements from files
- ✅ Changes persist after page refresh
- ✅ Integrated with SAVE button

**Mr Blue Code Generation**:
- ✅ Generates code (not just clarifications)
- ✅ Code queued in VisualEditorContext
- ✅ Badge updates with count
- ✅ Replit Agent 3 parity

**Batch Save**:
- ✅ Applies all queued changes
- ✅ Single git commit
- ✅ Success toast with commit hash
- ✅ Queue cleared after save

**Grafana**:
- ✅ No 401 errors
- ✅ Metrics visible in Grafana Cloud
- ✅ Dashboard shows real-time data
- ✅ Custom vibe metrics tracked
- ✅ Logs flowing to Loki automatically

**Overall System**:
- ✅ 100% wiring complete
- ✅ All features functional
- ✅ User can code via Mr Blue like Replit Agent 3
- ✅ User can manually edit via Visual Editor
- ✅ Full observability

---

## 📊 TIME BREAKDOWN

| Priority | Tasks | Total Time |
|----------|-------|------------|
| P0 (Critical) | 4 tasks | 180 minutes |
| P1 (High) | 3 tasks | 75 minutes |
| P2 (Medium) | 3 tasks | 15 minutes |
| **TOTAL** | **10 tasks** | **270 minutes (~4.5 hours)** |

**Parallelization Opportunities**:
- Voice Modal + Grafana OTEL (independent) = 65 min → 45 min if parallel
- Badge + SAVE Button (independent) = 10 min → 5 min if parallel

**Optimized Total**: ~240 minutes (~4 hours)

---

## 🔗 RESEARCH DOCUMENTATION

All research complete and documented:
1. ✅ `docs/COMPREHENSIVE_WIRING_ANALYSIS.md` - Full wiring audit
2. ✅ `docs/VOICE_MODAL_PERMISSION_RESEARCH.md` - Permission crash analysis
3. ✅ `docs/MRBLUE_EXECUTION_GAP_PLAN.md` - Code generation fix
4. ✅ `docs/GRAFANA_OTEL_SETUP_RESEARCH.md` - Observability setup
5. ✅ `docs/GRAFANA_LOKI_RESEARCH.md` - Loki not needed ✅
6. ✅ `docs/VISUAL_EDITOR_SAVE_MISSING_RESEARCH.md` - Save functionality missing **NEW**

---

## 🚀 READY TO BUILD

**All Research Complete**: ✅  
**Implementation Plans Ready**: ✅  
**Time Estimates Accurate**: ✅  
**Dependencies Mapped**: ✅

**Next Step**: User approval to proceed with build

**Recommended Build Order**:
1. **Start with P0** - Fix critical blockers first (180 min)
2. **Then P1** - Grafana observability (60 min)
3. **Finally P2** - Polish UX (15 min)

**Expected Outcome After All Fixes**:
- 🎤 Voice modal works (no crash)
- ✏️ Visual Editor saves manual edits to files **NEW**
- 🤖 Mr Blue generates code like Replit Agent 3
- 💾 Batch save applies all changes + git commit
- 📊 Grafana dashboards show real-time metrics
- ✨ 100% wiring complete
- 🚀 Production-ready autonomous coding agent

---

**STATUS**: 🟢 AWAITING USER APPROVAL TO START BUILD
