# 🧪 TEST EXECUTION PLAN - MB.MD 5-Layer Verification
**Date:** October 27, 2025, 4:35 AM  
**Scope:** Verify all 6 fixes work end-to-end

---

## 🎯 TEST OBJECTIVES

Verify each fix using **ALL 5 LAYERS** of the new MB.MD protocol:
1. **Layer 1 (UI):** Screenshot proof
2. **Layer 2 (API):** Network tab verification
3. **Layer 3 (Backend):** Server logs verification
4. **Layer 4 (Data):** File/Git changes verification
5. **Layer 5 (Integration):** Full user journey trace

---

## 📋 TEST CASES

### **TEST CASE 1: Chat Vibe Coding Execution**

**User Story:**  
"I chat with Mr Blue and say 'make the button red' → Mr Blue executes vibe coding → button turns red"

**Pre-requisites:**
- Visual Editor tab open
- Some page with a button visible in preview

**Test Steps:**
1. Open Mr Blue chat (NOT in Visual Editor - testing the fix that removed VE requirement)
2. Type: "change the save button to red color"
3. Send message
4. Observe response

**Expected Results:**

| Layer | Expected Behavior | Evidence Required |
|-------|-------------------|-------------------|
| **1. UI** | Chat shows AI response + toast "Code changes applied" | Screenshot |
| **2. API** | Network tab shows `POST /api/vibe/execute` → 200 OK | Network screenshot |
| **3. Backend** | Server logs show `[Vibe] Executing request` + `[Vibe] Execution complete` | Server log grep |
| **4. Data** | `git status` shows modified file, `git diff` shows color change | Terminal output |
| **5. Integration** | Chat → vibe API → file write → preview reload (all steps traced) | Combined evidence |

**Failure Criteria:**
- ❌ No network request to `/api/vibe/execute`
- ❌ Server logs silent (regression #1)
- ❌ No file changes (`git status` clean)

---

### **TEST CASE 2: Voice Auto-Execute**

**User Story:**  
"I open Voice Session → say 'make button green' → AI Summary updates → Mr Blue executes automatically → button turns green"

**Pre-requisites:**
- Visual Editor tab open
- Preview showing a page with a button

**Test Steps:**
1. Click headphone icon (open Unified Voice Modal)
2. Click "Start Voice Conversation"
3. Say: "make the button green"
4. Wait for transcript to end with "."
5. Observe AI Summary tab
6. Observe preview

**Expected Results:**

| Layer | Expected Behavior | Evidence Required |
|-------|-------------------|-------------------|
| **1. UI** | AI Summary shows bullet + preview button turns green | Screenshot of both |
| **2. API** | Network shows `POST /api/chat/summarize` + `POST /api/vibe/execute` | Network timeline |
| **3. Backend** | Logs show `[UnifiedVoiceModal] Processing NEW command` + vibe execution | Server grep |
| **4. Data** | File modified, git shows change | `git diff` |
| **5. Integration** | Voice → Transcript → Summary → executeVibeFromVoice → /api/vibe/execute → file write | Trace log |

**Failure Criteria:**
- ❌ AI Summary generates but no code execution
- ❌ No `/api/vibe/execute` call after voice input
- ❌ Preview doesn't update

---

### **TEST CASE 3: SAVE Button Git Commits**

**User Story:**  
"I queue changes (delete text, change style) → click SAVE → all changes commit to Git with hash"

**Pre-requisites:**
- Visual Editor tab open
- Some page loaded in preview

**Test Steps:**
1. Click any text in preview (activates inline editor)
2. Delete some text (should queue change)
3. Verify SAVE badge shows "1" (or "2" if multiple changes)
4. Click SAVE button
5. Observe toast notification

**Expected Results:**

| Layer | Expected Behavior | Evidence Required |
|-------|-------------------|-------------------|
| **1. UI** | Toast shows "Saved 2 changes successfully" + commit hash | Screenshot |
| **2. API** | Network shows `POST /api/visual-editor/apply-content` → 200 + `POST /api/git/commit-changes` → 200 | Network tab |
| **3. Backend** | Logs show `[VisualEditor] Applying content changes` + `[Git] ✅ Commit abc123` | Server grep |
| **4. Data** | `git log --oneline \| head -1` shows new commit | Terminal |
| **5. Integration** | SAVE → persist visual changes → stage files → Git commit → hash returned | Full trace |

**Failure Criteria:**
- ❌ Visual editor endpoints return success but no files changed
- ❌ Git commit fails with "nothing to commit"
- ❌ Empty staging area (regression #2 & #3)

---

### **TEST CASE 4: Visual Editor Persistence (AST-Based)**

**User Story:**  
"I directly edit text in preview → SAVE → file actually changes on disk (not just UI)"

**Pre-requisites:**
- Visual Editor with editable text element

**Test Steps:**
1. Click text "Welcome" in preview
2. Inline editor appears
3. Change text to "Hello World"
4. Text updates in preview (optimistic)
5. Click SAVE
6. Read actual file from disk

**Expected Results:**

| Layer | Expected Behavior | Evidence Required |
|-------|-------------------|-------------------|
| **1. UI** | Text shows "Hello World" in preview | Screenshot |
| **2. API** | `POST /api/visual-editor/apply-content` returns `{ success: true, results: [...] }` | Network response |
| **3. Backend** | Logs show `[VisualEditor] Applied 1/1 content changes` (not 0/1) | Server logs |
| **4. Data** | `git diff <file>` shows "Welcome" → "Hello World" change | Terminal |
| **5. Integration** | Edit → applyTextReplacementAST → file write → git stage → ready for commit | AST trace |

**Failure Criteria:**
- ❌ API returns success but `git diff` shows no changes (stub behavior)
- ❌ File content unchanged after SAVE

---

### **TEST CASE 5: SSE Streaming to AI Work Feed**

**User Story:**  
"I trigger vibe coding → AI Work Feed shows live updates 'Editing Button.tsx...'"

**Pre-requisites:**
- Visual Editor open
- AI Work Feed visible (if implemented)

**Test Steps:**
1. Send chat message: "add a new button component"
2. Watch for SSE events in Network tab
3. Observe AI Work Feed panel (if visible)

**Expected Results:**

| Layer | Expected Behavior | Evidence Required |
|-------|-------------------|-------------------|
| **1. UI** | AI Work Feed shows streaming activity | Screenshot |
| **2. API** | Network tab shows EventSource connection to `/api/ai/stream/...` | Network tab |
| **3. Backend** | Logs show `[SSE] Broadcast: file_edit` events | Server grep |
| **4. Data** | N/A (streaming only) | - |
| **5. Integration** | Vibe execute → broadcast SSE → EventSource receives → UI updates | Event trace |

**Failure Criteria:**
- ❌ No SSE events in Network tab
- ❌ AI Work Feed silent (no live updates)

---

### **TEST CASE 6: Preview Auto-Reload**

**User Story:**  
"Vibe coding changes a file → preview iframe auto-reloads to show changes"

**Pre-requisites:**
- Visual Editor with preview visible

**Test Steps:**
1. Send chat: "change button text to 'Click Me'"
2. Wait for vibe coding to complete
3. Observe preview iframe

**Expected Results:**

| Layer | Expected Behavior | Evidence Required |
|-------|-------------------|-------------------|
| **1. UI** | Preview shows updated button text WITHOUT manual refresh | Screenshot |
| **2. API** | N/A (client-side event) | - |
| **3. Backend** | Vibe coding completes successfully | Server logs |
| **4. Data** | File changed | git diff |
| **5. Integration** | File write → dispatch 'visual-editor-reload' → iframe reloads | Console logs |

**Failure Criteria:**
- ❌ File changes but preview shows old content
- ❌ User must manually refresh preview

---

## 🔧 TESTING TOOLS

### **Layer 1 (UI):**
- `screenshot` tool
- Manual visual inspection

### **Layer 2 (API):**
- Browser DevTools → Network tab
- Filter by Fetch/XHR
- Look for status codes + response bodies

### **Layer 3 (Backend):**
- `refresh_all_logs` tool
- `grep` over server logs
- Search for: `[Vibe]`, `[VisualEditor]`, `[Git]`, `[SSE]`

### **Layer 4 (Data):**
- `bash git status`
- `bash git diff <file>`
- `bash git log --oneline | head -5`
- `read <file>` to verify content

### **Layer 5 (Integration):**
- Combine logs from all layers
- Trace execution path step-by-step
- Verify no broken links in the chain

---

## 📊 TEST EXECUTION TRACKING

| Test Case | Layer 1 | Layer 2 | Layer 3 | Layer 4 | Layer 5 | Status |
|-----------|---------|---------|---------|---------|---------|--------|
| 1. Chat Vibe Coding | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | PENDING |
| 2. Voice Auto-Execute | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | PENDING |
| 3. SAVE Button Git | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | PENDING |
| 4. Visual Editor Persist | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | PENDING |
| 5. SSE Streaming | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | PENDING |
| 6. Preview Reload | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | PENDING |

**Legend:**
- ⏳ Pending
- ✅ Pass
- ❌ Fail
- ⚠️ Partial (some layers pass, some fail)

---

## 📝 NEXT STEPS

1. **Execute Test Case 1** (Chat Vibe Coding) - Most critical
2. Take screenshot of UI
3. Check Network tab
4. Grep server logs
5. Verify git changes
6. Document results
7. Move to Test Case 2 (Voice)
8. Repeat for all 6 test cases
9. Compile evidence for Architect review

---

**Status:** Ready for execution
