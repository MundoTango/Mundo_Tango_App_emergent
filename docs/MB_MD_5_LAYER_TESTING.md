# MB.MD 5-Layer Testing Protocol
**Created:** October 27, 2025  
**Purpose:** Prevent "code compiles" and "button exists" fallacies

---

## ⚠️ THE CRITICAL ISSUE

Previous MB.MD Rule 3 ("Screenshot Everything") only caught **UI layer** bugs.

**What we missed:**
- ❌ Backend functions that never execute
- ❌ API endpoints that never get called  
- ❌ Files that never get written
- ❌ Git commits that never happen
- ❌ Data that never persists

**Example Failure:**
```
✅ UI shows "Saved successfully" toast
✅ Code compiles without errors
✅ Screenshot shows green checkmark
❌ BUT: No files changed on disk
❌ BUT: No Git commit created
❌ BUT: Backend endpoint never called

Result: Feature LOOKS like it works, but is completely broken
```

---

## 🎯 NEW MB.MD RULE 3 (EXPANDED)

**BEFORE MARKING ANY FEATURE COMPLETE:**

Verify ALL 5 layers with evidence, or the feature is BROKEN:

### **Layer 1: UI Evidence**
What to verify:
- ✅ Screenshot showing visual change
- ✅ Browser console shows no errors
- ✅ Correct UI state (loading → success)
- ✅ Toast/notification appears

**Evidence Required:**
```
Screenshot: [feature_working_ui.png]
Browser logs: No errors in console
```

---

### **Layer 2: API Evidence**
What to verify:
- ✅ Network tab shows HTTP request sent
- ✅ Correct endpoint called
- ✅ HTTP 200/201 response received
- ✅ Response body matches expected structure

**Evidence Required:**
```
Network tab screenshot: POST /api/vibe/execute → 200 OK
Response body: { "success": true, "codeChanges": [...] }
```

**How to check:**
1. Open browser DevTools → Network tab
2. Trigger the feature
3. Filter by XHR/Fetch
4. Verify request appears and succeeds

---

### **Layer 3: Backend Execution**
What to verify:
- ✅ Server logs show function execution
- ✅ No error logs or exceptions
- ✅ All async operations completed
- ✅ Correct data passed through layers

**Evidence Required:**
```
Server logs:
[Vibe] Executing request: "make button red"
[Vibe] Generated 2 code changes
[Vibe] Applied changes successfully
```

**How to check:**
1. Read workflow logs via `refresh_all_logs`
2. Grep for relevant log messages
3. Verify execution path completed

---

### **Layer 4: Data Persistence**
What to verify:
- ✅ Files actually modified on disk
- ✅ Git status shows changes
- ✅ Database records inserted/updated (if applicable)
- ✅ File contents match expected changes

**Evidence Required:**
```bash
$ git status
modified: client/src/components/Button.tsx

$ git diff client/src/components/Button.tsx
-  className="bg-blue-500"
+  className="bg-red-500"
```

**How to check:**
1. Run `git status` to verify dirty files
2. Run `git diff` to see actual changes
3. Read file contents to verify mutations

---

### **Layer 5: Integration Flow**
What to verify:
- ✅ Full user journey works end-to-end
- ✅ Each step triggers the next correctly
- ✅ Error handling works at each layer
- ✅ No silent failures in the chain

**Evidence Required:**
```
User clicks "Save"
  → SaveOrchestrator.save() called
  → POST /api/visual-editor/apply-styles
  → Files written to disk
  → Git add + commit
  → Commit hash returned to UI
  → Toast shows "Committed abc123"
```

**How to check:**
1. Trace execution through all layers
2. Verify each layer completes before next starts
3. Test error cases (network failure, file locked, etc.)

---

## 📋 EXAMPLE: Testing Vibe Coding Feature

### **User Story:**
"I say 'make the button red' in voice mode → button turns red in preview"

### **5-Layer Verification:**

#### **Layer 1: UI** ✅
- Screenshot shows button is red in preview
- No browser console errors
- Toast: "Voice Command Applied! ✨"

#### **Layer 2: API** ✅
```
Network tab:
POST /api/vibe/execute → 200 OK
Response: { "status": "complete", "codeChanges": [{ 
  "filePath": "client/src/components/Button.tsx",
  "diff": "..."
}]}
```

#### **Layer 3: Backend** ✅
```
Server logs:
[Vibe] Executing request: "make the button red"
[VibeGraph] Planning phase complete
[VibeGraph] Generated unified diff
[Vibe] Execution complete: 1 change
```

#### **Layer 4: Data** ✅
```bash
$ git diff client/src/components/Button.tsx
- bg-blue-500
+ bg-red-500
```

#### **Layer 5: Integration** ✅
```
Voice input "make button red"
  → Transcript ends with "."
  → executeVibeFromVoice() called
  → executeVibeCoding() sends request
  → /api/vibe/execute processes request
  → VibeGraph generates diff
  → applyCodeChange() writes file
  → Preview iframe reloads
  → Button appears red
```

**RESULT: Feature is ACTUALLY working** ✅

---

## 🚫 FAILURE MODES

### **Failure at Layer 2: API not called**
```
✅ Layer 1: UI shows success
❌ Layer 2: No network request in DevTools
❌ Layer 3: No server logs
❌ Layer 4: No file changes
❌ Layer 5: Integration broken

Diagnosis: Frontend code path never reaches API call
Fix: Trace execution flow, find where it exits early
```

### **Failure at Layer 4: Data not persisted**
```
✅ Layer 1: UI shows success
✅ Layer 2: API returns 200 OK
✅ Layer 3: Server logs show execution
❌ Layer 4: git status shows no changes
❌ Layer 5: Integration broken

Diagnosis: Backend endpoint is a stub (returns success without writing)
Fix: Implement actual file mutations
```

---

## 🔧 INTEGRATION WITH EXISTING MB.MD RULES

### **Rule 1: VERIFY BEFORE BUILD**
- Read docs, understand requirements
- **NEW:** Define 5-layer test plan before coding

### **Rule 2: INTEGRATE IMMEDIATELY**  
- Import components as you build
- **NEW:** Test all 5 layers as you integrate

### **Rule 3: VERIFY AT ALL LAYERS (THIS DOCUMENT)**
- Screenshot everything
- **NEW:** + API logs + Server logs + File diffs + Integration trace

### **Rule 4: TEST USER JOURNEY**
- Test as regular user AND super admin
- **NEW:** Verify all 5 layers for each user role

### **Rule 5: ARCHITECT VALIDATES**
- Independent review mandatory
- **NEW:** Architect verifies 5-layer evidence

---

## 📝 CHECKLIST FOR AGENTS

Before marking ANY task as `completed`:

```markdown
[ ] Layer 1 (UI): Screenshot attached showing visual change
[ ] Layer 2 (API): Network tab shows endpoint called + 200 response
[ ] Layer 3 (Backend): Server logs show function execution
[ ] Layer 4 (Data): git diff shows file changes OR database updated
[ ] Layer 5 (Integration): Full user journey traced end-to-end
[ ] Architect reviewed: Independent validation with git diff
```

**If ANY checkbox is unchecked → Feature is BROKEN → DO NOT mark complete**

---

## 🎯 APPLIES TO ALL FEATURES

This protocol applies to:
- ✅ Vibe coding execution
- ✅ Voice auto-execute
- ✅ SAVE button Git commits
- ✅ Visual editor persistence
- ✅ SSE streaming
- ✅ Preview auto-reload
- ✅ Chat message streaming
- ✅ File uploads
- ✅ Database mutations
- ✅ ALL features that involve data flow beyond the UI

**Bottom Line:** If data flows from UI → API → Backend → Disk/DB, verify ALL 5 layers.

---

**Status:** ✅ ACTIVE - All agents must follow this protocol starting October 27, 2025
