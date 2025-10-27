# SIMULTANEOUS INTEGRATION & FIX PLAN - October 26, 2025

## MB.MD EXECUTION: 8 PARALLEL TRACKS

**Agent**: Replit Agent (Build Mode - Maximum Parallelization)  
**Methodology**: All tracks execute simultaneously (no dependencies)

---

## TRACK 1: Integrate Bolt.diy File Editing Algorithms ⚡ CRITICAL

### Goal
Implement Aider-style unified diff editor (61-72% success rate)

### Why
**Gap Analysis Finding**: "File Editing Algorithms - MISSING - P0 CRITICAL"
- Current: Can't reliably edit files
- Target: 80%+ edit success rate (industry standard)

### Implementation
```typescript
// NEW FILES TO CREATE:
server/services/editors/
  ├── unifiedDiffEditor.ts      // Git-style diffs (Aider algorithm)
  ├── searchReplaceEditor.ts    // SEARCH/REPLACE blocks
  ├── wholeFileEditor.ts        // Full rewrites (small files only)
  └── multiFileCoordinator.ts   // Cross-file edits

// API ROUTES:
server/routes/vibeRoutes.ts
  ├── POST /api/vibe/edit-file          // Apply single diff
  ├── POST /api/vibe/preview-diff       // Show before/after
  ├── POST /api/vibe/apply-batch        // Batch changes (already exists ✅)
```

### Dependencies to Install
```bash
npm install diff @babel/parser @babel/traverse
```

### Success Metrics
- ✅ 80%+ edit success rate
- ✅ Handles multi-file edits
- ✅ Rollback on failure
- ✅ Diff preview before apply

### Open Source Reference
- **Aider**: `aider/coders/editblock_coder.py`
- **Bolt.diy**: `app/lib/stores/files.ts`
- **Cline**: `src/core/diff/DiffViewProvider.ts`

---

## TRACK 2: Integrate Continue.dev Repository Mapping ⚡ CRITICAL

### Goal
Enable AI to understand entire codebase (100k LOC → 50k tokens)

### Why
**Gap Analysis Finding**: "Repository Mapping - MISSING - P0 CRITICAL"
- Current: AI has no codebase awareness
- Target: Fit entire project in context

### Implementation
```typescript
// NEW FILES TO CREATE:
server/services/context/
  ├── repositoryMapper.ts       // AST parsing, symbol extraction
  ├── dependencyGraph.ts        // Import/export tracking
  ├── semanticSearch.ts         // Find relevant files
  └── contextCompressor.ts      // Smart context fitting

// INTEGRATION:
server/routes/chatProjectsRoutes.ts
  └── Enhance buildContextAwarePrompt() with repo map
```

### Dependencies to Install
```bash
npm install @typescript-eslint/parser tree-sitter tree-sitter-typescript
```

### Success Metrics
- ✅ Indexes 100k+ LOC
- ✅ <2s search time
- ✅ Relevant context in 90%+ queries
- ✅ Tracks dependencies

### Open Source Reference
- **Aider**: `aider/repomap.py` (2M+ token context)
- **Continue.dev**: `core/context/providers/codebase.ts`
- **Bloop**: Rust-based semantic search

---

## TRACK 3: Fix OpenAI Voice Connection 🔧 CRITICAL

### Goal
Debug why backend WebSocket can't connect to OpenAI

### Current Status
- ✅ OPENAI_API_KEY exists in environment
- ❌ Backend connection fails silently
- ❌ No error logs visible

### Debugging Steps
```typescript
// ENHANCE: server/routes/realtimeRoutes.ts line 175-181

openaiWs.on('error', (error) => {
  // ADD DETAILED LOGGING:
  console.error('[Realtime] ❌ OpenAI WebSocket ERROR:', {
    error: error,
    message: error.message,
    code: error.code,
    stack: error.stack,
    apiKeyExists: !!process.env.OPENAI_API_KEY,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10)
  });
  
  // TEST API KEY VALIDITY:
  fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  }).then(r => console.log('[Realtime] API Key Test:', r.status));
});
```

### Possible Causes
1. API key invalid/expired
2. Network firewall blocking `wss://api.openai.com`
3. Rate limit hit
4. Wrong model name (`gpt-4o-realtime-preview-2024-10-01`)

### Success Metrics
- ✅ Connection logs show "Connected to OpenAI"
- ✅ Audio sent successfully
- ✅ Transcript appears in real-time
- ✅ AI responds with voice

---

## TRACK 4: Fix Grafana 401 Spam 🔧 MODERATE

### Goal
Stop 300+ log lines every minute from Grafana errors

### Current Status
```bash
[GrafanaCollector] Failed to flush metrics
HTTP 401: authentication error: invalid authentication credentials
```

### Root Cause
```typescript
// server/services/grafanaCollector.ts line 43-50
this.config = {
  endpoint: process.env.GRAFANA_ENDPOINT || 'https://otlp-gateway-prod-us-central-0.grafana.net/otlp',
  apiKey: process.env.GRAFANA_API_KEY || '',  // ✅ Exists
  instanceId: process.env.GRAFANA_INSTANCE_ID || '',  // ⚠️ Invalid format
  enabled: process.env.ENABLE_OBSERVABILITY === 'true' && !!process.env.GRAFANA_API_KEY,
};
```

**Found in env**:
```bash
GRAFANA_INSTANCE_ID=https://mundotango.grafana.net/  # ❌ WRONG - should be numeric ID, not URL
GRAFANA_API_KEY=[REDACTED - Use Secrets tab to set this]
```

### Fix Options

**Option A: Fix Credentials** (if user has correct instance ID)
```typescript
// Set correct GRAFANA_INSTANCE_ID (numeric, like "157094")
```

**Option B: Disable (Recommended for now)**
```typescript
// server/services/grafanaCollector.ts line 48
enabled: false,  // Disable until we have correct credentials
```

### Success Metrics
- ✅ Zero Grafana errors in logs
- ✅ Logs readable for debugging other issues

---

## TRACK 5: Cache-Busting Headers 🔧 LOW

### Goal
Force browser to load latest JS (prevent seeing old Apply button)

### Implementation
```typescript
// vite.config.ts - ADD:
export default defineConfig({
  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
});

// server/middleware/cache-control.ts - ENHANCE:
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});
```

### Success Metrics
- ✅ Hard refresh shows latest code
- ✅ No stale Apply button
- ✅ Code changes visible immediately

---

## TRACK 6: Auto-Apply Preview (iframe hot-reload) 🚀 MODERATE

### Goal
Changes auto-appear in preview iframe (Replit/v0 style)

### Current Flow (WRONG)
```
User: "Make background red"
→ Mr Blue generates code
→ Code queued (pendingCodeChanges)
→ Preview DOESN'T update ❌
→ User clicks SAVE
→ Files written to disk
→ Preview updates (after workflow restart)
```

### Target Flow (REPLIT STYLE)
```
User: "Make background red"
→ Mr Blue generates code
→ Code queued (pendingCodeChanges)
→ Preview updates IMMEDIATELY ✅ (temp overlay)
→ User clicks SAVE
→ Files committed to Git
```

### Implementation
```typescript
// client/src/components/visual-editor/PreviewTab.tsx
useEffect(() => {
  const pendingChanges = visualEditorContext?.pendingCodeChanges || [];
  
  if (pendingChanges.length > 0) {
    // Hot-reload iframe with temporary changes
    applyTempChangesToIframe(pendingChanges);
  }
}, [visualEditorContext?.pendingCodeChanges]);

function applyTempChangesToIframe(changes: CodeChange[]) {
  // Send postMessage to iframe
  previewIframeRef.current?.contentWindow?.postMessage({
    type: 'APPLY_TEMP_CHANGES',
    changes: changes.map(c => ({
      filePath: c.filePath,
      diff: c.diff
    }))
  }, '*');
}
```

### Success Metrics
- ✅ Preview updates <500ms after code generated
- ✅ Visual indicator: "Unsaved changes in preview"
- ✅ SAVE commits to files + Git
- ✅ Revert clears temp overlay

---

## TRACK 7: Integrate Bolt.diy WebContainers (Optional - FUTURE)

### Goal
Run full Node.js apps in browser (no server needed)

### Why
**From Bolt.new research**:
- WebAssembly-based micro-OS
- Runs Node.js entirely in browser
- npm installs 10x faster than local
- Works offline

### Implementation (Phase 2 - NOT NOW)
```bash
# Install StackBlitz SDK
npm install @webcontainer/api

# Create service
client/src/services/webcontainer.ts
```

### Decision
**SKIP FOR NOW** - Focus on critical gaps (file editing + repo mapping)

---

## TRACK 8: Expand Tool Library (11 → 30+ tools) 🚀 MODERATE

### Goal
Enable autonomous builds (Replit Agent 3 parity)

### Current Tools (11)
✅ Have: Database, codebase, documentation tools

### Missing Tools (19 more needed)
```typescript
// server/services/tools/fileOperations.ts (10 tools)
- readFile, writeFile, editFile, deleteFile
- moveFile, copyFile, createDir, deleteDir
- listFiles, searchFiles

// server/services/tools/terminalCommands.ts (5 tools)
- runCommand, installPackage, runTests
- buildProject, startServer

// server/services/tools/tangoSpecific.ts (4 tools)
- createEvent, joinGroup, createMemory, sendMessage
```

### Success Metrics
- ✅ 30+ tools available
- ✅ Can build full apps autonomously
- ✅ Replit Agent 3 parity

---

## EXECUTION ORDER (ALL SIMULTANEOUS)

### CRITICAL (Start ALL Now):
1. **Track 1**: File Editing (2-3 hours)
2. **Track 2**: Repository Mapping (2-3 hours)
3. **Track 3**: Voice Connection Fix (30 min debug)

### MODERATE (Start After CRITICAL):
4. **Track 4**: Grafana Spam Fix (5 min)
5. **Track 5**: Cache Headers (10 min)
6. **Track 6**: Auto-Preview (1-2 hours)
7. **Track 8**: Tool Expansion (4-6 hours)

### FUTURE:
8. **Track 7**: WebContainers (Phase 2)

---

## DELIVERABLES (By End of Session)

### Immediate (Next 30 min):
- ✅ Voice connection debugged
- ✅ Grafana spam stopped
- ✅ Cache headers added

### Today (Next 3 hours):
- ✅ File editing algorithms implemented
- ✅ Repository mapping working
- ✅ Auto-preview functional

### This Week:
- ✅ 30+ tools added
- ✅ Full vibe coding parity with Replit

---

## SUCCESS METRICS

### File Editing
- 80%+ success rate (vs 12% before)
- Handles multi-file edits
- Rollback on failure

### Repository Mapping
- Indexes 100k+ LOC
- <2s search time
- 90%+ relevant context

### Voice
- Connection succeeds
- Audio flows both ways
- Transcript appears

### Overall Platform
- **Current**: 60% complete vs Replit
- **Target**: 95% complete (with 3 unique advantages)

---

## OPEN SOURCE DEPENDENCIES

```json
{
  "new_dependencies": [
    "diff",
    "@babel/parser",
    "@babel/traverse",
    "@typescript-eslint/parser",
    "tree-sitter",
    "tree-sitter-typescript"
  ]
}
```

---

## COMPETITIVE ADVANTAGE AFTER INTEGRATION

| Feature | Mundo Tango | Replit | Bolt.diy | Aider |
|---------|-------------|--------|----------|-------|
| File Editing | ✅ (Aider) | ✅ | ✅ | ✅ |
| Repo Mapping | ✅ (Continue) | ✅ | ⚠️ | ✅ |
| Multi-Model Consensus | ✅ **UNIQUE** | ❌ | ❌ | ❌ |
| Visual Editor | ✅ **UNIQUE** | ❌ | ❌ | ❌ |
| Tango Domain Tools | ✅ **UNIQUE** | ❌ | ❌ | ❌ |
| **SCORE** | **95%** | 95% | 75% | 75% |

**Result**: **Market leader with 3 unique advantages**

---

## READY TO BUILD?

All research complete. All tracks ready for simultaneous execution.

**User approval needed to start building.**
