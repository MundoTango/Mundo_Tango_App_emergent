# Vibe Coding Manual Edit Bug - MB.MD Research
**Date:** October 26, 2025  
**Issue:** Delete key and Inspector text edits not tracking changes  
**Status:** 🔴 CRITICAL - Blocks manual editing workflow

---

## 🔍 MAPPING - Root Cause Analysis

### User Report
- **Symptom**: Deleted element and changed text, but changes weren't tracked
- **Expected**: Changes appear in queue, SAVE button enabled
- **Actual**: No queue updates, SAVE button greyed out

### Code Investigation

#### ✅ DELETE KEY - WORKS (Partially)
**File:** `client/src/components/visual-editor/VisualEditorWrapper.tsx` lines 82-142

**Implementation:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && isEditorActive) {
      e.preventDefault();
      
      if (visualEditorContext?.setPendingCodeChanges) {
        const diff = generateDeleteDiff(elementData, currentPath);
        const newChange = { /* ... */ };
        
        visualEditorContext.setPendingCodeChanges([
          ...(visualEditorContext.pendingCodeChanges || []),
          newChange
        ]);
        
        toast({ title: '🗑️ Delete Queued' });
      }
    }
  };
  
  if (isEditorActive) {
    window.addEventListener('keydown', handleKeyDown);
  }
}, [selectedElement, isEditorActive, visualEditorContext]);
```

**Analysis:**
- ✅ Generates delete diff correctly
- ✅ Adds to context `pendingCodeChanges`
- ✅ Shows toast notification
- ⚠️ **BUG**: Event listener only attached when `isEditorActive` changes
- ⚠️ **BUG**: Dependencies missing from useEffect (should include `toast`)

#### ❌ INSPECTOR TEXT EDIT - STUB/TODO
**File:** `client/src/components/visual-editor/VisualEditorWrapper.tsx` lines 733-736

**Current Implementation:**
```typescript
<InspectorPanel 
  selectedElement={visualEditorContext?.selectedElement ?? null}
  onTextChange={(newText) => {
    // TODO: Apply text change via iframe messaging
    console.log('Text change:', newText);
  }}
/>
```

**Analysis:**
- ❌ **CRITICAL BUG**: Just logs to console, doesn't queue change
- ❌ Doesn't call `visualEditorContext.setPendingCodeChanges`
- ❌ No toast notification
- ❌ No diff generation

#### ✅ INLINE TEXT EDIT (DOUBLE-CLICK) - WORKS
**File:** `client/src/components/visual-editor/VisualEditorWrapper.tsx` lines 408-470

**Implementation:**
```typescript
const handleSaveInlineText = (newText: string) => {
  if (!editingElement || !selectedElement) return;
  
  const oldText = editingElement.textContent || '';
  editingElement.textContent = newText;
  
  if (visualEditorContext?.setPendingCodeChanges) {
    const diff = generateTextChangeDiff(elementData, oldText, newText, currentPath);
    const newChange = { /* ... */ };
    
    visualEditorContext.setPendingCodeChanges([
      ...(visualEditorContext.pendingCodeChanges || []),
      newChange
    ]);
    
    toast({ title: '✏️ Edit Queued' });
  }
};
```

**Analysis:**
- ✅ Generates text change diff correctly
- ✅ Adds to context
- ✅ Shows toast
- ✅ THIS IS THE MODEL TO COPY for Inspector text edit

---

## 🧩 BREAKDOWN - Component Architecture

### Visual Editor State Flow
```
┌─────────────────────────────────────────────────────┐
│ VisualEditorWrapper (Main Controller)              │
│                                                     │
│ ┌───────────────────┐    ┌─────────────────────┐  │
│ │ InspectorPanel    │───▶│ onTextChange (STUB) │  │ ← BUG HERE
│ │ (Text textarea)   │    │ console.log only    │  │
│ └───────────────────┘    └─────────────────────┘  │
│                                                     │
│ ┌───────────────────┐    ┌─────────────────────┐  │
│ │ Delete Key        │───▶│ handleKeyDown       │  │ ← WORKS
│ │ (Backspace/Delete)│    │ Adds to context     │  │
│ └───────────────────┘    └─────────────────────┘  │
│                                                     │
│ ┌───────────────────┐    ┌─────────────────────┐  │
│ │ InlineTextEditor  │───▶│ handleSaveInlineText│  │ ← WORKS
│ │ (Double-click)    │    │ Adds to context     │  │
│ └───────────────────┘    └─────────────────────┘  │
│                                                     │
│                          ▼                          │
│                 VisualEditorContext                │
│                 .setPendingCodeChanges()           │
│                                                     │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
                    UniversalSaveSystem
                    (SAVE ALL CHANGES button)
```

### Context Integration
**File:** `client/src/contexts/VisualEditorContext.tsx`

**Interface:**
```typescript
export interface VisualEditorContextType {
  pendingCodeChanges: CodeChange[];
  setPendingCodeChanges: (changes: CodeChange[] | ((prev: CodeChange[]) => CodeChange[])) => void;
  addCodeChange: (change: CodeChange) => void;
  clearCodeChanges: () => void;
}
```

**Usage Pattern:**
```typescript
// ✅ CORRECT (from handleSaveInlineText)
const newChange = {
  id: `manual-${Date.now()}`,
  taskId: 'manual-edit',
  filePath: diff.filePath,
  diff: diff.diff,
  type: 'unified_diff' as const,
  status: 'pending' as const,
  timestamp: new Date()
};

visualEditorContext.setPendingCodeChanges([
  ...(visualEditorContext.pendingCodeChanges || []),
  newChange
]);
```

---

## ⚠️ MITIGATION - Solution Design

### Fix #1: Implement InspectorPanel onTextChange Handler

**Current (BROKEN):**
```typescript
onTextChange={(newText) => {
  console.log('Text change:', newText);  // ❌ STUB
}}
```

**Fixed (TO IMPLEMENT):**
```typescript
onTextChange={(newText) => {
  if (!visualEditorContext?.selectedElement) return;
  
  const oldText = visualEditorContext.selectedElement.textContent || '';
  const currentPath = visualEditorContext.previewPath || '/';
  const elementData = visualEditorContext.selectedElement;
  
  // Generate diff using same logic as inline edit
  const diff = generateTextChangeDiff(
    elementData,
    oldText,
    newText,
    currentPath
  );
  
  // Add to context
  const newChange = {
    id: `inspector-${Date.now()}`,
    taskId: 'inspector-text-edit',
    filePath: diff.filePath,
    diff: diff.diff,
    type: 'unified_diff' as const,
    status: 'pending' as const,
    timestamp: new Date()
  };
  
  visualEditorContext.setPendingCodeChanges([
    ...(visualEditorContext.pendingCodeChanges || []),
    newChange
  ]);
  
  toast({
    title: '✏️ Text Edit Queued',
    description: 'Click SAVE to apply changes',
    duration: 2000
  });
}}
```

### Fix #2: Fix Delete Key Event Listener Dependencies

**Current (POTENTIALLY BUGGY):**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => { /* ... */ };
  
  if (isEditorActive) {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }
}, [selectedElement, isEditorActive, visualEditorContext, toast]);
```

**Issues:**
- Missing `toast` in dependency array (fixed)
- Event listener re-attached on EVERY `selectedElement` change (performance issue)
- Better: Only re-attach when `isEditorActive` changes

**Fixed (TO IMPLEMENT):**
```typescript
useEffect(() => {
  if (!isEditorActive) return;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check selectedElement inside handler (uses current ref)
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
      e.preventDefault();
      // ... rest of logic
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isEditorActive]); // Only re-attach when editor activated/deactivated
```

---

## 🚀 DEPLOYMENT - Implementation Plan

### Phase 1: Fix InspectorPanel Text Editing (CRITICAL)
1. ✅ Research completed - Found onTextChange is just a console.log stub
2. ⏳ Implement proper handler (copy logic from handleSaveInlineText)
3. ⏳ Test: Edit text in Inspector → verify queue updates
4. ⏳ Test: Click SAVE → verify AST parser applies change

### Phase 2: Optimize Delete Key Handler (MEDIUM)
1. ⏳ Fix useEffect dependencies
2. ⏳ Optimize event listener attachment
3. ⏳ Test: Delete element → verify queue updates

### Phase 3: Integration Testing (CRITICAL)
1. ⏳ Test Journey #2: Manual Text Edit (from user testing guide)
2. ⏳ Test Journey #3: Delete Element with ID
3. ⏳ Test Journey #6: Multi-Change Batch Flow
4. ⏳ Verify SAVE button enables when queue has items
5. ⏳ Verify badge count updates

---

## 📊 Expected Behavior After Fix

### InspectorPanel Text Edit Flow:
1. User selects element → Inspector shows in sidebar
2. User types in "Text Content" textarea
3. User clicks "Apply Changes" button
4. **OLD**: Console.log only → No queue update
5. **NEW**: 
   - `generateTextChangeDiff()` creates EDIT_INSTRUCTION
   - Added to `visualEditorContext.pendingCodeChanges`
   - Toast: "✏️ Text Edit Queued"
   - Badge count increments
   - SAVE button enabled

### Delete Key Flow (After Fix):
1. User selects element
2. User presses Delete/Backspace key
3. **CURRENT**: Works but may miss some key presses due to deps
4. **AFTER FIX**: Consistently captures all delete key presses

---

## 🔬 Testing Checklist

After implementing fixes:

- [ ] InspectorPanel text edit queues change
- [ ] Delete key queues change
- [ ] Badge count updates
- [ ] SAVE button enables
- [ ] Toast notifications appear
- [ ] Multiple edits accumulate in queue
- [ ] SAVE applies all changes via AST parser
- [ ] Git commit created with all changes

---

## 📝 Notes

**Why This Wasn't Caught Earlier:**
- Focus was on AI code generation flow (Mr Blue → Queue)
- Manual edit flow was stubbed with TODO comments
- Delete key handler was implemented but had subtle dependency issues
- No end-to-end testing of Inspector → Queue → SAVE flow

**Architecture Insight:**
- Three separate entry points for edits:
  1. InspectorPanel (sidebar textarea) ← **BROKEN**
  2. InlineTextEditor (double-click) ← **WORKS**
  3. Delete key (keyboard) ← **WORKS (with issues)**
- All three MUST use same context pattern
- `handleSaveInlineText` is the correct model

**AST Parser Status:**
- ✅ Backend AST parser implemented and architect-approved
- ✅ `applyTextReplacementAST()` handles JSX text nodes
- ✅ `deleteElementByTextAST()` handles element removal
- The bug is purely frontend integration, backend is solid

---

## 🎯 Success Criteria

After fixes applied:
1. User edits text in Inspector → Change queued ✅
2. User presses Delete key → Element queued for deletion ✅
3. Badge shows correct count ✅
4. SAVE button enabled when queue has items ✅
5. Clicking SAVE applies all changes ✅
6. Git commit created ✅

**ETA:** 20 minutes (research complete, implementation straightforward)
