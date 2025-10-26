# MB.MD FIX PLAN: Visual Editor Manual Edits Not Tracking
**Date:** October 26, 2025  
**Methodology:** MB.MD (Mapping → Breakdown → Mitigation → Deployment)  
**Execution:** PARALLEL STREAMS

---

## 🗺️ MAPPING - Problem Summary

**Root Causes Identified:**
1. **CRITICAL**: InspectorPanel `onTextChange` is TODO stub (lines 733-736 VisualEditorWrapper.tsx)
   - Just logs to console
   - Doesn't call context `setPendingCodeChanges`
   - User edits text → Nothing happens

2. **MEDIUM**: Delete key event listener has dependency issues
   - Re-attaches on every `selectedElement` change (performance)
   - May miss some key presses

**Research Complete:** `docs/research/VIBE_CODING_MANUAL_EDIT_BUG_RESEARCH.md`

---

## 🧩 BREAKDOWN - Parallel Execution Streams

### STREAM 1: Fix InspectorPanel Text Editing 🔴 CRITICAL
**Files:**
- `client/src/components/visual-editor/VisualEditorWrapper.tsx` (lines 733-736)

**Tasks:**
1. Replace console.log stub with proper handler
2. Copy logic from `handleSaveInlineText` (lines 408-470)
3. Use `generateTextChangeDiff()` from code generation lib
4. Add to `visualEditorContext.setPendingCodeChanges`
5. Show toast notification

**Dependencies:** None (standalone)
**ETA:** 5 minutes

---

### STREAM 2: Optimize Delete Key Handler 🟡 MEDIUM
**Files:**
- `client/src/components/visual-editor/VisualEditorWrapper.tsx` (lines 82-142)

**Tasks:**
1. Fix useEffect dependency array
2. Move selectedElement check INSIDE handler (not in deps)
3. Only re-attach listener when `isEditorActive` changes
4. Add ref for selectedElement if needed

**Dependencies:** None (standalone)
**ETA:** 3 minutes

---

### STREAM 3: Verification Testing 🔵 TESTING
**Files:**
- Browser console monitoring
- Queue badge visual verification
- SAVE button state verification

**Tasks:**
1. Test InspectorPanel text edit → queue updates
2. Test Delete key → queue updates  
3. Test badge count increments
4. Test SAVE button enables
5. Test batch save applies changes

**Dependencies:** STREAM 1 + STREAM 2 must complete first
**ETA:** 10 minutes

---

## ⚠️ MITIGATION - Solution Code

### STREAM 1 Solution: InspectorPanel onTextChange

**Replace lines 733-736 with:**

```typescript
onTextChange={(newText) => {
  // ✅ FIX: Wire to context for vibe coding queue
  if (!visualEditorContext?.selectedElement) {
    toast({
      title: 'No Element Selected',
      description: 'Please select an element first',
      variant: 'destructive'
    });
    return;
  }
  
  const selectedEl = visualEditorContext.selectedElement;
  const oldText = selectedEl.textContent || '';
  const currentPath = visualEditorContext.previewPath || '/';
  
  // Skip if no actual change
  if (oldText === newText) {
    console.log('⚠️ [Inspector] Text unchanged, skipping');
    return;
  }
  
  console.log('✏️ [Inspector] Text changed:', { oldText, newText });
  
  // Generate diff using code generation lib
  const diff = generateTextChangeDiff(
    selectedEl,
    oldText,
    newText,
    currentPath
  );
  
  // Create change object
  const newChange = {
    id: `inspector-text-${Date.now()}`,
    taskId: 'inspector-text-edit',
    filePath: diff.filePath,
    diff: diff.diff,
    type: 'unified_diff' as const,
    status: 'pending' as const,
    timestamp: new Date()
  };
  
  // Add to context queue
  visualEditorContext.setPendingCodeChanges([
    ...(visualEditorContext.pendingCodeChanges || []),
    newChange
  ]);
  
  console.log('✅ [Inspector] Text edit queued:', newChange);
  
  toast({
    title: '✏️ Text Edit Queued',
    description: `Updating "${oldText.substring(0, 20)}" → "${newText.substring(0, 20)}" - Click SAVE to apply`,
    duration: 3000
  });
}}
```

---

### STREAM 2 Solution: Delete Key Handler Optimization

**Replace lines 82-142 with:**

```typescript
// 🎯 BATCH 3: Delete key handler (Oct 26, 2025) - OPTIMIZED
useEffect(() => {
  if (!isEditorActive) return;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check selectedElement INSIDE handler (uses latest value)
    if (!selectedElement) return;
    
    // Only handle Delete/Backspace
    if (e.key !== 'Delete' && e.key !== 'Backspace') return;
    
    // Prevent default backspace navigation
    e.preventDefault();
    
    console.log('🗑️ [BATCH 3] Delete key pressed for element:', selectedElement);
    
    // Generate delete diff and send to context
    if (visualEditorContext?.setPendingCodeChanges) {
      const currentPath = visualEditorContext.previewPath || '/';
      const elementData = {
        tagName: selectedElement.tag,
        id: selectedElement.id,
        className: selectedElement.className,
        xpath: selectedElement.xpath,
        computedStyles: {},
        boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        attributes: {}
      };
      
      const diff = generateDeleteDiff(elementData, currentPath);
      
      const newChange = {
        id: `delete-${Date.now()}`,
        taskId: 'delete-element',
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
      
      console.log('✅ [BATCH 3] Delete queued in context:', newChange);
      
      toast({
        title: '🗑️ Delete Queued',
        description: `Removing <${selectedElement.tag}> - Click SAVE to apply`,
        duration: 2000
      });
      
      // Clear selection after queueing delete
      setSelectedElement(null);
      setSelectedHTMLElement(null);
    }
  };
  
  // Only re-attach when editor activated/deactivated (not on every selection change)
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isEditorActive, visualEditorContext, toast]); // selectedElement NOT in deps
```

---

## 🚀 DEPLOYMENT - Execution Order

### Phase 1: PARALLEL IMPLEMENTATION (Simultaneous)
- **STREAM 1** ⚡: Fix InspectorPanel text handler
- **STREAM 2** ⚡: Optimize delete key handler
- **Duration**: 5 minutes (parallel execution)

### Phase 2: VERIFICATION (Sequential after Phase 1)
- **STREAM 3** 🧪: Run all tests from user testing guide
- Check LSP for errors
- Restart workflow
- **Duration**: 10 minutes

### Phase 3: ARCHITECT REVIEW (After verification)
- Submit all changes for architect review
- Include git diff
- Get approval before user handoff
- **Duration**: 5 minutes

---

## ✅ Success Criteria

After implementation:
1. ✅ InspectorPanel text edit adds change to queue
2. ✅ Delete key adds change to queue
3. ✅ Badge count updates correctly
4. ✅ SAVE button enables when queue has items
5. ✅ Toast notifications appear for both actions
6. ✅ Multiple edits accumulate without conflicts
7. ✅ Batch SAVE applies all changes via AST parser
8. ✅ Git commit created
9. ✅ Zero LSP errors
10. ✅ Architect approval

---

## 🎯 Test Plan (STREAM 3)

### Test 1: InspectorPanel Text Edit
1. Select element in preview
2. Open Inspector tab
3. Edit text in textarea
4. Click "Apply Changes"
5. **Verify**: Toast shows "✏️ Text Edit Queued"
6. **Verify**: Badge count = 1
7. **Verify**: SAVE button enabled

### Test 2: Delete Key
1. Select element in preview
2. Press Delete key
3. **Verify**: Toast shows "🗑️ Delete Queued"
4. **Verify**: Badge count increments
5. **Verify**: Element deselected

### Test 3: Multi-Change Batch
1. Edit text via Inspector (change #1)
2. Select different element
3. Delete via Delete key (change #2)
4. **Verify**: Badge shows "2"
5. Click SAVE
6. **Verify**: Success toast
7. **Verify**: Queue clears
8. **Verify**: Changes applied to files

---

## 📊 Timeline

- **Research**: ✅ COMPLETE (20 minutes)
- **Planning**: ✅ COMPLETE (10 minutes)
- **Implementation**: ⏳ 5 minutes (parallel)
- **Testing**: ⏳ 10 minutes
- **Architect Review**: ⏳ 5 minutes
- **Total**: ~50 minutes

---

## 🔄 Rollback Plan

If issues arise:
1. Git revert to pre-fix state
2. Re-test old functionality
3. Document new issues
4. Iterate on fix

**Risk Level**: 🟢 LOW
- Changes are isolated to two functions
- Copying proven patterns from existing code
- AST parser backend already tested and approved
