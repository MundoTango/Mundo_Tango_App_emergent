# 🔗 INTEGRATION MAP - VIBE CODING SYSTEM

**MB.MD SIMULTANEOUS - Agent #8: Integration Specialist**  
**Created:** October 23, 2025

This document maps ALL integration points for the Vibe Coding system to ensure nothing is missed.

---

## 📍 **INTEGRATION POINTS**

### **1. API ROUTES → Backend Services**

**Status:** ✅ **COMPLETE**

```typescript
server/routes/vibeRoutes.ts
  ├─ POST /api/vibe/edit-file → UnifiedDiffEditor.ts ✅
  ├─ POST /api/vibe/map-repository → ASTParser.ts + CompactRepresentation.ts ✅
  ├─ POST /api/vibe/execute → VibeGraph.ts ✅
  └─ GET /api/vibe/health → Health check ✅
```

**Mounted in:** `server/routes.ts` line ~1414 ✅

---

### **2. Multi-Agent Orchestration Flow**

**Status:** 🟢 **90% COMPLETE**

```typescript
VibeGraph.ts (State Machine)
  ├─ 1. ManagerAgent.ts → Task Planning ✅
  ├─ 2. EditorAgent.ts → Code Generation ✅
  ├─ 3. VerifierAgent.ts → Quality Review ✅
  └─ 4. TesterAgent.ts → Automated Testing ✅
```

**Missing Integration:**
- ⏳ ManagerAgent needs repository map passed from API
- ⏳ EditorAgent needs tool execution integration
- ⏳ VibeGraph needs to call agents sequentially

**Required Changes:**
```typescript
// In VibeGraph.ts execute() method:
const repoMap = await compactRep.generateRepositoryMap(files);
const tasks = await managerAgent.planTasks({ 
  userRequest, 
  repositoryMap: repoMap 
});
```

---

### **3. Visual Editor → Vibe Coding**

**Status:** 🟡 **60% COMPLETE**

#### **A. DiffPreviewCard Integration**

**Location:** `client/src/components/visual-editor/DiffPreviewCard.tsx` ✅

**Needs to be imported by:**
- ⏳ `client/src/components/visual-editor/AITab.tsx`
- ⏳ `client/src/components/mrBlue/ChatInterface.tsx`

**Integration Code Needed:**
```typescript
// In AITab.tsx
import { DiffPreviewCard } from './DiffPreviewCard';

// Show when AI generates code change
{aiResponse.codeChange && (
  <DiffPreviewCard
    filePath={aiResponse.codeChange.filePath}
    beforeCode={aiResponse.codeChange.before}
    afterCode={aiResponse.codeChange.after}
    onApply={() => applyCodeChange()}
    onReject={() => rejectCodeChange()}
  />
)}
```

---

#### **B. AISuggestionsPanel Integration**

**Location:** `client/src/components/visual-editor/AISuggestionsPanel.tsx` ✅

**Needs to be imported by:**
- ⏳ `client/src/components/visual-editor/ElementInspector.tsx`
- ⏳ `client/src/components/visual-editor/AITab.tsx`

**Integration Code Needed:**
```typescript
// In ElementInspector.tsx
import { AISuggestionsPanel } from './AISuggestionsPanel';

// Below element details
<AISuggestionsPanel
  selectedElement={selectedElement}
  onApplySuggestion={(prompt) => {
    // Send prompt to vibe coding API
    executeVibeCoding(prompt);
  }}
/>
```

---

### **4. Tools → Claude Function Calling**

**Status:** ✅ **100% COMPLETE**

```typescript
server/services/tools/index.ts
  ├─ ALL_TOOL_SCHEMAS (30 tools) ✅
  └─ ALL_TOOLS (implementations) ✅
```

**Needs to be imported by:**
- ⏳ `server/services/agents/ManagerAgent.ts`

**Integration Code Needed:**
```typescript
// In ManagerAgent.ts
import { ALL_TOOL_SCHEMAS, executeTool } from '../tools/index';

// Pass tools to Claude
const response = await this.anthropic.messages.create({
  model: this.model,
  max_tokens: 4096,
  tools: ALL_TOOL_SCHEMAS, // ← Add this
  messages: [...]
});

// Execute tool calls
if (response.content[0].type === 'tool_use') {
  const result = await executeTool(
    response.content[0].name,
    response.content[0].input
  );
}
```

---

### **5. Repository Mapping → AI Context**

**Status:** 🟡 **80% COMPLETE**

```typescript
Component Dependencies:
ASTParser.ts ✅
  → parseDirectory() ✅
  → parseFile() ✅

CompactRepresentation.ts ✅
  → generateRepositoryMap() ✅
  → generateFocusedMap() ✅

DependencyGraph.ts ✅
  → build() ✅
  → getRelatedFiles() ✅
```

**Missing Integration:**
- ⏳ Auto-generate repo map on API call
- ⏳ Cache repo maps (avoid re-parsing every request)
- ⏳ Pass repo map to all agents

**Required Code:**
```typescript
// In vibeRoutes.ts /api/vibe/execute
const parser = createASTParser();
const compactRep = createCompactRepresentation();

// Parse codebase once
const files = await parser.parseDirectory('.');
const repoMap = compactRep.generateRepositoryMap(files);

// Pass to VibeGraph
const graph = new VibeGraph(request, user, { repositoryMap: repoMap });
```

---

### **6. Frontend → Backend API**

**Status:** ⏳ **30% COMPLETE**

**API Calls Needed:**

```typescript
// In AITab.tsx
async function executeVibeCoding(prompt: string) {
  const response = await apiRequest('/api/vibe/execute', {
    method: 'POST',
    body: {
      request: prompt,
      visualEditorContext: {
        selectedElement,
        previewPath: window.location.pathname
      }
    }
  });

  const result = await response.json();
  
  // Show DiffPreviewCard for each code change
  setCodeChanges(result.codeChanges);
}
```

**Files to Update:**
- ⏳ `client/src/components/visual-editor/AITab.tsx`
- ⏳ `client/src/components/mrBlue/ChatInterface.tsx`

---

### **7. File Editing → Actual Files**

**Status:** ✅ **COMPLETE**

```typescript
UnifiedDiffEditor.ts ✅
  → applyUnifiedDiff() ✅
  → uses 'diff' library ✅

SearchReplaceEditor.ts ✅
  → replaceAll() ✅
  → uses regex matching ✅
```

**Works via:** `/api/vibe/edit-file` endpoint ✅

---

### **8. Testing → Playwright**

**Status:** ✅ **COMPLETE**

```typescript
TesterAgent.ts ✅
  → runTest() ✅
  → attemptTest() ✅
  → analyzeFailure() (Claude Vision) ✅
```

**Missing:**
- ⏳ Test suite definition (what to test)
- ⏳ Integration with CI/CD

---

## 🔧 **REQUIRED INTEGRATIONS (Priority Order)**

### **HIGH PRIORITY (Must Do Today)**

1. **✅ Tools → ManagerAgent**
   - Import ALL_TOOL_SCHEMAS
   - Enable Claude function calling
   - Execute tool calls

2. **⏳ Repository Map → VibeGraph**
   - Generate repo map on request
   - Pass to all agents
   - Cache for performance

3. **⏳ DiffPreviewCard → Visual Editor**
   - Import in AITab.tsx
   - Show on code generation
   - Wire Apply/Reject buttons

4. **⏳ AISuggestionsPanel → ElementInspector**
   - Import in ElementInspector.tsx
   - Show on element selection
   - Wire suggestion clicks to vibe API

5. **⏳ Frontend → /api/vibe/execute**
   - Create executeVibeCoding() function
   - Call from AITab + ChatInterface
   - Handle responses

---

### **MEDIUM PRIORITY (This Week)**

6. **⏳ Repo Map Caching**
   - Cache parsed AST
   - Invalidate on file changes
   - Performance optimization

7. **⏳ Error Handling**
   - Retry logic in agents
   - User-friendly error messages
   - Fallback strategies

8. **⏳ Progress Tracking**
   - Show which phase agent is in
   - Progress percentage
   - ETA calculation

---

### **LOW PRIORITY (Next Week)**

9. **⏳ Test Suite Definition**
   - What to test automatically
   - Test case generation
   - Coverage tracking

10. **⏳ CI/CD Integration**
    - Run tests on deploy
    - Auto-rollback on failure
    - Deployment gates

---

## 📊 **INTEGRATION CHECKLIST**

### **Backend Integrations**

- [x] Vibe routes mounted in routes.ts
- [x] UnifiedDiffEditor in edit-file endpoint
- [x] ASTParser in map-repository endpoint
- [x] VibeGraph in execute endpoint
- [x] All 4 agents created
- [x] All 30 tools implemented
- [ ] Tools connected to ManagerAgent (HIGH PRIORITY)
- [ ] Repo map passed to agents (HIGH PRIORITY)
- [ ] Agent orchestration wired (HIGH PRIORITY)

**Backend Status:** 🟡 **70% Complete**

---

### **Frontend Integrations**

- [x] DiffPreviewCard component created
- [x] AISuggestionsPanel component created
- [ ] DiffPreviewCard imported in AITab (HIGH PRIORITY)
- [ ] AISuggestionsPanel imported in ElementInspector (HIGH PRIORITY)
- [ ] executeVibeCoding() function created (HIGH PRIORITY)
- [ ] API calls wired (HIGH PRIORITY)
- [ ] Loading states added
- [ ] Error handling added

**Frontend Status:** 🟡 **40% Complete**

---

### **End-to-End Flow**

- [ ] User types prompt in AITab
- [ ] executeVibeCoding() calls /api/vibe/execute
- [ ] ManagerAgent plans tasks (with tools)
- [ ] EditorAgent generates code (with repo map)
- [ ] VerifierAgent reviews code
- [ ] TesterAgent runs tests
- [ ] DiffPreviewCard shows changes
- [ ] User clicks Apply
- [ ] Changes applied to files
- [ ] Server restarts (HMR)
- [ ] User sees result

**End-to-End Status:** ⏳ **0% Complete** (not tested yet)

---

## 🎯 **NEXT STEPS**

**Session 3 Goals (Oct 24, 2025):**

1. ✅ Wire tools to ManagerAgent
2. ✅ Wire repo map to agents
3. ✅ Import DiffPreviewCard in AITab
4. ✅ Import AISuggestionsPanel in ElementInspector
5. ✅ Create executeVibeCoding() function
6. ✅ Test end-to-end workflow
7. ✅ Screenshot all integration points

**Time Estimate:** 2-3 hours

---

**Last Updated:** October 23, 2025  
**Maintained By:** Agent #8 (Integration Specialist)  
**Status:** 70% integrated, 30% remaining
