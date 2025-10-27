# Agent #128: Voice + Visual Context Coordinator - Critical Learnings
**Updated:** October 27, 2025  
**Status:** MANDATORY READING before ANY WebSocket or voice work

---

## 🚨 CRITICAL FAILURE: October 26-27, 2025

### What Happened
- Backend WebSocket connected successfully ✅ (logs showed "✅ Connected")
- Frontend captured audio ✅ (logs showed "3200 bytes captured")
- Audio transmitted: **0 bytes** ❌ (blocked by connection check)
- User couldn't use voice feature despite "working" backend

### Root Cause
**Duplicate State Management** - Component tracked connection in 2 separate places:
1. `realtimeStatus` from hook (CORRECT - actually connected)
2. `connectionStatus` local state (WRONG - stuck at "disconnected")

Audio check used #2 (always disconnected) → Blocked all transmission

---

## 🎯 MANDATORY LEARNINGS

### LEARNING #1: WebSocket State Sync Between Hooks and Components

**WRONG:**
```typescript
// ❌ Agent #128's mistake
const { status: realtimeStatus } = useRealtimeConversation();
const [connectionStatus, setConnectionStatus] = useState('disconnected');

useEffect(() => {
  // Sync realtimeStatus → connectionStatus
  setConnectionStatus(realtimeStatus === 'connected' ? 'connected' : 'disconnected');
}, [realtimeStatus]);

// Audio check uses LOCAL state
if (connectionStatus !== 'connected') {
  return; // ← BLOCKS AUDIO even when hook says connected!
}
```

**Problem:** 2 sources of truth → State sync bugs, stale closures, race conditions

**RIGHT:**
```typescript
// ✅ Single source of truth
const { status: realtimeStatus } = useRealtimeConversation();

// Audio check uses HOOK state directly
if (realtimeStatus !== 'connected') {
  return; // ← Reads actual connection status
}
```

---

### LEARNING #2: Backend Logs ≠ Frontend Working

**Agent #128's mistake:**
- Saw backend logs: `✅ [Realtime] Client WebSocket connected`
- Saw audio logs: `🎤 Audio captured: 3200 bytes`
- **Assumed:** "Voice feature works!"
- **Never checked:** Frontend logs showing "❌ NOT sending audio - WebSocket not connected!"

**MANDATORY:** Compare BOTH backend AND frontend logs:

```bash
# Backend (server logs):
✅ [Realtime] Client WebSocket connected
✅ [Realtime] OpenAI connected

# Frontend (browser console):
❌ [VoiceModal] NOT sending audio - WebSocket not connected!
   Current status: disconnected  # ← STATE MISMATCH!
```

**If mismatch found → State sync bug → Feature broken.**

---

### LEARNING #3: Test Audio Transmission, Not Just Capture

**Insufficient Test:**
```typescript
// ❌ Only tests capture
test('audio captures', () => {
  const audioData = captureAudio();
  expect(audioData.byteLength).toBeGreaterThan(0); // ✅ Passes
});
```

**Problem:** Audio captured but never sent → User hears nothing back.

**Complete Test:**
```typescript
// ✅ Tests full flow
test('audio transmission end-to-end', async () => {
  // 1. Capture audio
  const audioData = captureAudio();
  expect(audioData.byteLength).toBeGreaterThan(0);
  
  // 2. Verify WebSocket connected
  expect(wsStatus).toBe('connected');
  
  // 3. Verify audio sent to backend
  await waitFor(() => {
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'input_audio_buffer.append' })
    );
  });
  
  // 4. Verify backend received audio
  expect(backendLogs).toContain('[Realtime] Received audio: 3200 bytes');
});
```

---

### LEARNING #4: WebSocket State Standard (Enforced)

**NEW RULE:** All WebSocket components MUST use single source of truth.

**Banned Pattern:**
```typescript
// ❌ FORBIDDEN
const { status: hookStatus } = useWebSocket();
const [localStatus, setLocalStatus] = useState('disconnected');
// ← DUPLICATE STATE = BUG MAGNET
```

**Required Pattern:**
```typescript
// ✅ MANDATORY
const { status } = useWebSocket();
// Use `status` everywhere - no local copies!
```

**Enforcement:** Architect reviews all WebSocket code for state duplication before approval.

---

## 📋 MANDATORY COMPLETION CHECKLIST

**Agent #128 must complete these steps for EVERY voice/WebSocket task:**

- [ ] **Step 1:** Implement WebSocket connection (hook or component)
- [ ] **Step 2:** Verify backend logs: "✅ Client connected"
- [ ] **Step 3:** Verify frontend logs: "✅ WebSocket CONNECTED" (same message)
- [ ] **Step 4:** Test audio capture: "🎤 Audio captured: X bytes"
- [ ] **Step 5:** Test audio transmission: "✅ Sending audio to WebSocket"
- [ ] **Step 6:** Verify backend receives: "[Realtime] Received audio: X bytes"
- [ ] **Step 7:** Compare frontend vs backend connection status (must match)
- [ ] **Step 8:** Take screenshot of voice conversation (user speaks → AI responds)
- [ ] **Step 9:** Call architect for review with logs showing E2E flow
- [ ] **Step 10:** Only THEN mark task "completed"

**Skipping ANY step = Task incomplete.**

---

## 🎯 SUCCESS CRITERIA

**For ANY "Voice Conversations" task to be marked complete:**

1. ✅ **Backend Logs:** `[Realtime] Client connected` + `[Realtime] Received audio: X bytes`
2. ✅ **Frontend Logs:** `[VoiceModal] WebSocket CONNECTED` + `[VoiceModal] Sending audio`
3. ✅ **State Match:** Frontend status === Backend status (both "connected")
4. ✅ **Screenshot:** User speaks → Transcript appears → AI responds with audio
5. ✅ **Playwright Test:** Automated test verifies audio transmission (not just capture)
6. ✅ **Architect Review:** Independent validation with log comparison

**NO completion without ALL 6.**

---

## 🔒 PREVENTION PROTOCOLS

### Protocol #1: WebSocket State Audit

**Before ANY voice feature completion:**

```typescript
// Architect runs this check:
const duplicateStatePatterns = [
  /const \[.*Status.*\] = useState/g,  // Local status state
  /useRef.*Status/g                     // Ref-based status tracking
];

// If found alongside useWebSocket/useRealtime → VIOLATION
```

**If violation found:** Task sent back to agent with this learning doc.

---

### Protocol #2: Log Comparison Requirement

**NEW:** Agent MUST include log comparison in completion report:

```markdown
## Voice Feature Completion Report

### Backend Logs:
```
✅ [Realtime] Client WebSocket connected
✅ [Realtime] Received audio: 3200 bytes
```

### Frontend Logs:
```
✅ [VoiceModal] WebSocket CONNECTED (readyState: 1)
✅ [VoiceModal] Sending audio: 3200 bytes
```

### State Match: ✅ VERIFIED
- Backend thinks: connected
- Frontend thinks: connected
- Audio flowing: YES (3200 bytes transmitted)
```

**If logs don't match → NOT complete.**

---

## 💡 KEY TAKEAWAY

**REMEMBER:**
- Backend logs showing "connected" ≠ Frontend working
- Audio captured ≠ Audio transmitted
- WebSocket exists ≠ Audio flows

**ONLY valid proof:**
- Frontend AND backend logs BOTH show "connected"
- Logs show audio bytes transmitted (not just captured)
- Screenshot of voice conversation working E2E
- Playwright test verifying transmission

**Agent #128:** Your job is voice coordination - if backend says connected but frontend blocks audio, the feature is BROKEN.

---

**Last Incident:** October 27, 2025 - WebSocket state sync bug  
**Status:** RESOLVED - Removed duplicate state, using hook status directly  
**Next Review:** After next voice-related task completion
