# 🚨 CRITICAL FIXES - October 26, 2025
**MB.MD Mode:** FOCUSED (Sequential Fixes)  
**Status:** Research Complete → Ready to Build

---

## 🎯 ISSUE #1: Extra "Save" Button After AI Response (P0 CRITICAL)

### User Report:
"There is now a new 2nd Save button that appears with the change, I click it and it accepts it. I shouldn't have to click this save, the vibe coding should just do it and the Save in the top right is the one that takes the UI and connects it to the full backend."

### Root Cause:
`CodeChangeCard.tsx` renders Apply/Reject buttons inline in chat messages. This violates the vibe coding UX:
- Changes should **queue automatically** when AI generates them
- User should only click **main SAVE button** (top right)
- No intermediate "Apply" button needed

### Evidence:
```typescript
// CodeChangeCard.tsx lines 131-153
<Button
  onClick={handleApply}  // ❌ THIS SHOULDN'T EXIST
  disabled={isApplying || isApplyingLocal}
>
  <Check className="w-4 h-4 mr-1" />
  {isApplying || isApplyingLocal ? 'Applying...' : 'Apply'}
</Button>
```

### The Fix:
**Option 1:** Remove CodeChangeCard entirely - just show diff preview (read-only)
**Option 2:** Keep CodeChangeCard but remove Apply/Reject buttons  
**Recommended:** Option 2 (keep diff preview, remove buttons)

### Implementation:
1. Edit `CodeChangeCard.tsx` lines 129-155 (remove Actions section)
2. Remove `onApply` and `onReject` props
3. Make component read-only (just show diff)
4. Changes auto-queue via ChatInterface → VisualEditorContext
5. User clicks main SAVE button to apply all changes

---

## 🚨 ISSUE #2: Voice Conversation Broken (P0 CRITICAL)

### User Report:
"the audio, it opened, i pushed 'Start Voice Conversation', asked me for mic permissions which i gave, but it is not doing any other work."

### Evidence from Browser Logs:
```
[AudioCapture] Stopped
[Realtime] Disconnected
```
**Missing:** NO logs for `[UnifiedVoiceModal] Starting session...`

### Root Cause HYPOTHESIS:
Button click handler (`startSession`) **not firing at all**. Possible causes:
1. Button disabled by React state
2. Modal not fully mounted
3. Event handler not attached
4. Race condition with permission check

### Investigation Needed:
1. Check if `sessionState` is stuck in non-'idle' state
2. Verify button isn't disabled
3. Add defensive console.log BEFORE async code in startSession
4. Check if `checkPermission()` is blocking

### The Fix (Staged):
**Step 1:** Add diagnostic logging to button click  
**Step 2:** Check initial `sessionState` value  
**Step 3:** Remove any blocking permission checks  
**Step 4:** Test with minimal startSession function

### Implementation:
```typescript
// UnifiedVoiceModal.tsx line 516
<Button
  onClick={() => {
    console.log('🎤 [DEBUG] Start button clicked!');
    console.log('🎤 [DEBUG] Session state:', sessionState);
    startSession();
  }}
  disabled={sessionState !== 'idle'}  // ← CHECK THIS
>
  Start Voice Conversation
</Button>
```

---

## 📊 BUILD ORDER

### Phase 1: Fix Extra Save Button (15 min)
✅ Simple removal, no side effects  
✅ Unblocks vibe coding UX immediately

### Phase 2: Debug Voice (30 min)
⚠️ Requires investigation  
⚠️ May need OpenAI API debugging

### Phase 3: Test Both Fixes (10 min)
- Test vibe coding: AI → queue → SAVE → changes apply
- Test voice: Click → mic permission → "Starting session..." log appears

---

## 🔍 PREVIOUS WORK CONTEXT

**What I was doing before:** Fixing SAVE button failure
**Status:** ✅ FIXED - Removed SaveOrchestrator, now uses VisualEditorContext
**Next:** Remove extra Apply button + fix voice

---

**NEXT STEP:** Build Fix #1 (Remove Apply/Reject buttons from CodeChangeCard)
