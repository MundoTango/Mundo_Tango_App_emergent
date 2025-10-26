# Vibe Coding User Testing Guide
**MB.MD Option 3 Implementation - Complete**  
**Created:** October 26, 2025  
**Status:** ✅ ARCHITECT APPROVED - Production Ready

## 🎯 Overview

This guide provides 6 comprehensive user journeys to test the complete Vibe Coding system, including:
- AI-powered code generation via Mr Blue
- Visual Editor manual editing (text changes + element deletion)
- Change queue accumulation
- Batch save with Git commit
- AST-based JSX manipulation

---

## 🧪 Test Environment Setup

### Prerequisites
1. ✅ Application running (`npm run dev`)
2. ✅ No LSP errors (confirmed)
3. ✅ User logged in as Super Admin (for Mr Blue access)
4. ✅ Visual Editor available from navigation

### Key URLs
- **Main App**: https://[your-replit-url].replit.dev/
- **Mr Blue**: Click "Mr Blue" icon in header
- **Visual Editor**: Navigate to "Visual Editor" page

---

## 📋 User Journey #1: AI Code Generation Flow

**Goal**: Test Mr Blue generating code changes → Visual Editor queue → SAVE → Git commit

### Steps:
1. **Open Mr Blue Chat**:
   - Click "Mr Blue" icon in header
   - Verify chat interface loads
   - See "Omniscient Mode" badge

2. **Request Code Change**:
   - Type: *"Change the homepage header text to 'Welcome to Mundo Tango'"*
   - Click Send or press Enter

3. **Verify AI Response**:
   - ✅ See thinking steps (optional, may be collapsed)
   - ✅ See unified diff preview in chat
   - ✅ See "Add to Visual Editor Queue" button

4. **Add to Queue**:
   - Click "Add to Visual Editor Queue"
   - ✅ Toast notification: "Change added to queue"
   - ✅ Badge on Visual Editor nav updates (shows count)

5. **Open Visual Editor**:
   - Navigate to Visual Editor page
   - ✅ See change in queue panel (right side)
   - ✅ File path visible (e.g., `client/src/pages/Home.tsx`)

6. **Apply Changes**:
   - Click **SAVE ALL CHANGES** button
   - ✅ Progress indicator shows
   - ✅ Success toast: "Changes applied successfully"
   - ✅ Queue clears
   - ✅ Check console logs for git commit confirmation

### Expected Results:
- ✅ AI generates valid unified diff
- ✅ Change queues without auto-application
- ✅ SAVE button applies change
- ✅ Git commit created with user attribution
- ✅ Homepage text updates on refresh

---

## 📋 User Journey #2: Manual Text Edit

**Goal**: Test Visual Editor manual text editing → queue → batch save

### Steps:
1. **Open Visual Editor**:
   - Navigate to Visual Editor page
   - ✅ Preview loads showing current page

2. **Select Element with Text**:
   - Click on any text element (e.g., heading, paragraph)
   - ✅ Blue selection border appears
   - ✅ Inspector panel shows element details (tag, id, className)

3. **Edit Text**:
   - In Inspector panel, find "Content" or text field
   - Change text (e.g., "Home" → "Homepage")
   - Press Enter or blur field

4. **Verify Queue Update**:
   - ✅ Change appears in queue panel
   - ✅ Shows: "Replace text in [file]"
   - ✅ Badge count increments

5. **Apply Change**:
   - Click **SAVE ALL CHANGES**
   - ✅ Success notification
   - ✅ Queue clears
   - ✅ Text updates in preview

### Expected Results:
- ✅ Text change generates EDIT_INSTRUCTION
- ✅ Backend AST parser finds and replaces text
- ✅ Unified diff applied correctly
- ✅ Git commit includes change

---

## 📋 User Journey #3: Delete Element with ID

**Goal**: Test delete key functionality for element with ID attribute

### Steps:
1. **Find Element with ID**:
   - In Visual Editor preview, click element with `id` attribute
   - ✅ Inspector shows: `id="someId"`

2. **Delete Element**:
   - With element selected, press **Delete** key
   - ✅ Change appears in queue: "Delete element from [file]"

3. **Review Queue**:
   - Check queue panel shows deletion instruction
   - ✅ File path correct
   - ✅ Element identifier visible

4. **Apply Deletion**:
   - Click **SAVE ALL CHANGES**
   - ✅ Element disappears from preview
   - ✅ Check file diff shows entire element removed

### Expected Results:
- ✅ AST parser matches element by `id="..."`
- ✅ Removes complete element (opening + closing tags + children)
- ✅ No orphaned tags or broken JSX
- ✅ Git commit shows deletion

---

## 📋 User Journey #4: Delete Element with className

**Goal**: Test delete for element identified by className only

### Steps:
1. **Find Element WITHOUT ID**:
   - Select element that has `className` but NO `id`
   - ✅ Inspector shows: `className="btn-primary"` (no id field)

2. **Delete Element**:
   - Press **Delete** key
   - ✅ Queue shows deletion with className identifier

3. **Apply Deletion**:
   - Click **SAVE ALL CHANGES**
   - ✅ Element removed from preview
   - ✅ Correct element deleted (not siblings with same class)

### Expected Results:
- ✅ AST parser matches by `className="..."`
- ✅ Deletes first occurrence with that className
- ✅ No false positives (doesn't delete wrong elements)

---

## 📋 User Journey #5: Delete Plain Element (Tag Only)

**Goal**: Test delete fallback for element with NO id or className

### Steps:
1. **Find Generic Element**:
   - Select plain `<div>`, `<span>`, or `<button>` with no attributes
   - ✅ Inspector shows: `tagName="DIV"`, no id/className

2. **Delete Element**:
   - Press **Delete** key
   - ✅ Queue shows deletion with tag name

3. **Apply Deletion**:
   - Click **SAVE ALL CHANGES**
   - ⚠️ **IMPORTANT**: May delete first matching tag in file
   - Verify correct element removed

### Expected Results:
- ✅ Frontend normalizes DOM `tagName` to lowercase (`DIV` → `div`)
- ✅ AST parser matches JSX tag case-insensitively
- ✅ Deletes first occurrence of tag (least specific, but works)

### Known Limitation:
- Without id/className, deletion is ambiguous
- Best practice: Add `id` or `className` to elements for reliable deletion

---

## 📋 User Journey #6: Multi-Change Batch Flow

**Goal**: Test accumulating multiple changes → single batch save → single Git commit

### Steps:
1. **Queue Multiple Changes**:
   - Ask Mr Blue: *"Change header to red"* → Add to queue
   - Manually edit text on another element → Added to queue
   - Delete an element → Added to queue
   - ✅ Badge shows: "3 changes"

2. **Review All Changes**:
   - Open Visual Editor
   - ✅ Queue panel lists all 3 changes
   - ✅ Each shows file path and operation type

3. **Batch Save**:
   - Click **SAVE ALL CHANGES**
   - ✅ Progress shows 3/3 applying
   - ✅ Success: "3 changes applied"

4. **Verify Git Commit**:
   - Check backend logs for commit message
   - ✅ Single commit contains all 3 files
   - ✅ Commit message lists changes
   - ✅ User attribution correct (`req.user.id`)

### Expected Results:
- ✅ All changes accumulate without conflict
- ✅ Single SAVE operation applies all
- ✅ Single Git commit (not 3 separate commits)
- ✅ All changes persist after refresh

---

## 🔍 Edge Cases to Test

### 1. Nested Element Deletion
- Delete outer `<div>` containing inner `<div>`
- ✅ AST should remove entire nested structure
- ✅ No orphaned closing tags

### 2. Multi-Line Attributes
- Delete element with attributes on separate lines:
  ```jsx
  <button
    id="test"
    className="btn"
  >
    Click
  </button>
  ```
- ✅ AST should match by id despite multi-line format

### 3. Self-Closing Tags
- Delete `<img />` or `<input />`
- ✅ AST recognizes self-closing syntax

### 4. JSX Expressions
- Text replacement in `{someVariable}` blocks
- ✅ Should handle StringLiteral nodes

---

## ⚠️ Known Issues & Workarounds

### Issue: Voice Modal Permission
- **Problem**: Browser blocks microphone without user gesture
- **Fix**: Manual "Start Voice Conversation" button (not auto-start)
- **Test**: Click button → browser shows permission prompt

### Issue: Grafana 401 Errors
- **Expected**: Telemetry auth fails until Grafana Cloud setup
- **Impact**: None - graceful degradation
- **Fix**: Follow `docs/GRAFANA_SETUP.md` (optional)

---

## 🎯 Success Criteria Checklist

After testing all 6 journeys, verify:

- [ ] **AI Code Generation**: Mr Blue → queue → SAVE → Git commit
- [ ] **Manual Text Edit**: Inspector → queue → SAVE
- [ ] **Delete by ID**: Works reliably
- [ ] **Delete by className**: Works reliably
- [ ] **Delete by tag**: Works (first occurrence)
- [ ] **Batch Save**: Multiple changes → single commit
- [ ] **Git Attribution**: Commits show correct user
- [ ] **No File Corruption**: JSX remains valid after edits
- [ ] **Queue Management**: Badge updates, clears on save
- [ ] **Error Handling**: Graceful failures (e.g., element not found)

---

## 🐛 Bug Reporting Template

If you encounter issues:

```
**Journey**: [Journey #X]
**Step**: [Which step failed]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Logs**: [Paste relevant console errors]
**File**: [Which file was being edited]
**Element**: [id/className/tagName]
```

---

## 📊 Performance Benchmarks

Expected timings:
- **AI Code Generation**: 2-5 seconds (Claude API)
- **Queue Add**: <100ms
- **Batch Save (1 change)**: 200-500ms
- **Batch Save (5 changes)**: 1-2 seconds
- **Git Commit**: 100-300ms

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. ✅ Mark MB.MD Option 3 as COMPLETE
2. Document any discovered edge cases
3. Plan v2 enhancements:
   - Undo/redo functionality
   - Global text replacement (all occurrences)
   - AST preview before applying deletes
   - Automated tests for critical flows

---

## 📝 Revision History

- **Oct 26, 2025**: Initial version - All 6 journeys documented
- AST implementation: ✅ ARCHITECT APPROVED
- Tag case normalization: ✅ FIXED (DOM uppercase → JSX lowercase)
