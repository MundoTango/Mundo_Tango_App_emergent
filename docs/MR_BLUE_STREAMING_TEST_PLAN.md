# Mr Blue Streaming & Vibe Coding Test Plan

## Test Date: Oct 27, 2025
## Status: READY FOR EXECUTION

---

## Critical Requirements

### 1. Streaming Status Display
**Requirement:** MB.MD phase indicators must appear on the NEW message being sent, not previous messages

**Test Steps:**
1. Open Mr Blue chat
2. Send message: "Add a ⭐ emoji to the page"
3. **VERIFY:** Status messages appear BELOW the user message as it streams:
   - 🔍 **MAPPING:** Analyzing your request...
   - 📋 **BREAKDOWN:** Planning response...
   - 🤖 **MITIGATION:** Consulting AI...
   - 💾 **DEPLOYMENT:** Saving response...
   - ✅ **COMPLETE:** Response complete!

**Pass Criteria:**
- ✅ Status indicators visible for 2+ seconds
- ✅ Status appears on CURRENT message thread, not previous
- ✅ Console logs show correct message ID tracking

---

### 2. Preview Updates Automatically
**Requirement:** Changes must appear in preview iframe without manual refresh

**Test Steps:**
1. Send message: "Change 'Welcome Back!' to 'Welcome Home!'"
2. Wait for vibe coding to complete
3. **VERIFY:** 
   - Console shows: `✅ [Vibe] Applied client/src/pages/landing.tsx to preview`
   - Console shows: `[Vibe] Triggering preview reload...`
   - Preview iframe shows updated text immediately

**Pass Criteria:**
- ✅ No manual reload needed
- ✅ Change visible within 2 seconds of completion
- ✅ Console shows preview reload event dispatched

---

### 3. Diff Cards Display
**Requirement:** Code diff cards must appear in chat showing what changed

**Test Steps:**
1. Send message: "Add a 🎯 emoji next to 'Share Memories'"
2. Wait for response
3. **VERIFY:**
   - Green/red diff card appears in chat
   - Shows file path: `client/src/pages/landing.tsx`
   - Shows actual diff with + and - lines
   - Card has expand/collapse toggle

**Pass Criteria:**
- ✅ Diff card visible immediately after vibe execution
- ✅ Diff card attached to CORRECT (current) message
- ✅ Diff shows actual code changes
- ✅ Console shows: `🎨 [Vibe] Added 1 diff cards to message {CURRENT_ID}`

---

### 4. SaveOrchestrator Accumulation
**Requirement:** Multiple changes must queue until SAVE button clicked

**Test Steps:**
1. Send message: "Add 🎉 to Welcome Back!"
2. **VERIFY:** Console shows: `✅ [Vibe] Added 1 changes to SaveOrchestrator`
3. **VERIFY:** Console shows: `🔢 [Vibe] SaveOrchestrator now has 1 pending changes`
4. Send another message: "Add ⭐ to Find Events"
5. **VERIFY:** Console shows: `🔢 [Vibe] SaveOrchestrator now has 2 pending changes`
6. **DO NOT** click SAVE yet

**Pass Criteria:**
- ✅ Both changes show in pending count
- ✅ No Git commits until SAVE clicked
- ✅ Preview shows BOTH changes accumulated

---

### 5. SAVE Button Git Commit
**Requirement:** SAVE button commits all queued changes in one Git operation

**Test Steps:**
1. After completing test #4 (with 2 pending changes)
2. Click the SAVE button in Visual Editor
3. **VERIFY:** Console shows:
   - `Saving 2 pending changes...`
   - Git commit messages for each file
   - `✅ All changes saved successfully`
4. Check Git log: `git log --oneline -5`

**Pass Criteria:**
- ✅ Single commit or batch of commits created
- ✅ Both files committed
- ✅ SaveOrchestrator pending count resets to 0
- ✅ Toast notification confirms save

---

## Automated Test Commands

```bash
# Check workflow is running
curl -I http://127.0.0.1:5000/

# Monitor console logs during test
tail -f /tmp/logs/browser_console_*.log | grep -E 'ChatInterface|Vibe|SaveOrchestrator'

# Check Git commits
git log --oneline -10 --grep="Mr Blue"

# Check pending changes count
# (Send test message and check console for "SaveOrchestrator now has X pending changes")
```

---

## Expected Console Log Sequence

```javascript
// USER SENDS MESSAGE
🚀 [ChatInterface] ========== SENDING MESSAGE ==========
🔍 [ChatInterface] Message details: {projectId: 19938, ...}

// STREAMING STARTS
📡 [Stream Status] 🔍 **MAPPING:** Analyzing your request...
📡 [Stream Status] 📋 **BREAKDOWN:** Planning response...
📡 [Stream Status] 🤖 **MITIGATION:** Consulting GPT AI...

// STREAM COMPLETES
✅ [Stream Complete] Accumulated 123 chars
🔄 [ChatInterface] Refetching messages...
✅ [ChatInterface] Refetch complete. Fresh message count: 14
🎯 [ChatInterface] Tracking assistant message ID: 115  // ✅ NEW ID TRACKED

// VIBE CODING EXECUTES
🚀 [Vibe] Executing with Visual Editor context
✅ [VibeGraph] Manager planned 1 tasks
✅ [VibeGraph] Editor generated diff for client/src/pages/landing.tsx
✅ [Vibe] Applied client/src/pages/landing.tsx to preview
[Vibe] Triggering preview reload...
✅ [Vibe] Added 1 changes to SaveOrchestrator
🔢 [Vibe] SaveOrchestrator now has 2 pending changes
🎨 [Vibe] Added 1 diff cards to message 115  // ✅ CORRECT MESSAGE ID
```

---

## Known Issues to Test

1. ❌ **FIXED:** Streaming status appearing on previous message (fixed with `currentAssistantMessageId.current`)
2. ⚠️ **TO TEST:** Preview updates automatically
3. ⚠️ **TO TEST:** Diff cards visible in UI
4. ⚠️ **TO TEST:** SaveOrchestrator accumulation works
5. ⚠️ **TO TEST:** SAVE button commits everything

---

## Test Execution Log

### Test #1: Streaming Status Display
- **Date:**
- **Result:**
- **Evidence:**
- **Notes:**

### Test #2: Preview Updates
- **Date:**
- **Result:**
- **Evidence:**
- **Notes:**

### Test #3: Diff Cards Display
- **Date:**
- **Result:**
- **Evidence:**
- **Notes:**

### Test #4: SaveOrchestrator
- **Date:**
- **Result:**
- **Evidence:**
- **Notes:**

### Test #5: SAVE Button
- **Date:**
- **Result:**
- **Evidence:**
- **Notes:**
