# Mr Blue Audio Interface - Complete Debug Plan
**Created:** October 23, 2025  
**Status:** 🔴 Audio Not Working - Debugging In Progress

---

## 📚 PART 1: What We've Built for Mr Blue Chat

### Core Chat System
**Files:**
- `client/src/components/mrBlue/ChatInterface.tsx` - Main chat UI with Visual Editor context integration
- `client/src/components/mrBlue/EnhancedMessageBubble.tsx` - AI message rendering with tool execution display
- `client/src/components/mrBlue/CodeChangeCard.tsx` - Inline diff preview with Apply/Reject buttons
- `server/routes/chatProjectsRoutes.ts` - Chat API with context-aware prompts
- `server/routes/multiModelRoutes.ts` - Multi-model consensus system (Claude, GPT-4o, Gemini)

### Features Implemented:
✅ **Context Awareness**
- Visual Editor selected element detection
- Preview path tracking (knows what page user is viewing)
- System prompt includes element details (xpath, classes, text)

✅ **Tool Execution** (11 tools for super admins)
- Database tools: get_platform_health, get_user_stats, get_recent_memories, search_memories, get_event_count, get_groups_by_city
- Codebase tools: search_codebase, list_react_components, find_api_endpoints
- Docs tools: search_documentation, read_documentation

✅ **Code Changes**
- Inline diff generation
- Apply/Reject buttons (fixed Oct 23 - field names: `diffContent`, `editType`)
- Vibe coding integration (`/api/vibe/edit-file`)

### Recent Fixes (Oct 23, 2025):
1. **Middleware Bypasses** - 3 security middleware layers blocking AI routes
2. **Tool Permissions** - Fixed `user.roles` → `user.role` check
3. **Apply Button** - Fixed field name mismatch (diff → diffContent, type → editType)
4. **"Use mb.md:" Prefix Confusion** - AI was calling `read_documentation` instead of answering about selected elements

---

## 📚 PART 2: What We've Built for Mr Blue Audio

### Frontend Audio Components

#### 1. **UnifiedVoiceModal.tsx** - Main Voice Interface
**Location:** `client/src/components/mrBlue/UnifiedVoiceModal.tsx`

**Features:**
- Split-screen layout: Live Transcript (left) + AI Summary (right)
- Voice settings submenu (collapsible)
- Status indicators: Connected, Recording, Speaking
- Visual element context badge (shows selected <element>)
- Auto-scrolling transcript
- Expandable summary bullets with details
- Session controls

**Dependencies:**
- `useRealtimeConversation` - WebSocket connection to GPT-4o Realtime API
- `useAudioCapture` - Browser microphone capture with PCM16 encoding
- `useAudioPlayback` - Audio playback queue for AI responses

**Key Methods:**
```typescript
startSession() - Request mic permission → connect WebSocket → start recording
endSession() - Stop recording → disconnect → clear state
generateSummary() - POST /api/chat/summarize with transcript + visual context
```

#### 2. **useAudioCapture.ts** - Microphone Input Hook
**Location:** `client/src/hooks/useAudioCapture.ts`

**Features:**
- Browser microphone access via `navigator.mediaDevices.getUserMedia()`
- PCM16 audio encoding (required for Realtime API)
- AudioContext with ScriptProcessorNode for real-time processing
- Microphone permissions handling
- Audio stream cleanup

**Audio Format:**
- Sample rate: 24000 Hz (Realtime API requirement)
- Format: PCM16 (16-bit signed integers)
- Channels: Mono (1 channel)

**States:**
- `idle` - Not recording
- `requesting` - Waiting for microphone permission
- `recording` - Active recording
- `error` - Permission denied or device error

#### 3. **useRealtimeConversation.ts** - WebSocket + Realtime API
**Location:** `client/src/hooks/useRealtimeConversation.ts`

**Features:**
- WebSocket connection to GPT-4o Realtime API
- Bidirectional audio streaming (send PCM16, receive base64 audio)
- Event handling: transcript deltas, audio chunks, errors
- Function calling support (tools integration)
- Session management

**Key Methods:**
```typescript
connect() - Establish WebSocket to /api/voice/realtime
disconnect() - Close WebSocket + clear state
sendAudio(audioData) - Send PCM16 audio buffer to backend
```

**Events Handled:**
- `session.created` - Connection established
- `response.audio_transcript.delta` - Real-time transcript updates
- `response.audio.delta` - AI audio response chunks (base64)
- `response.done` - Turn complete
- `error` - Connection/API errors

#### 4. **useVoiceOutput.ts** - Text-to-Speech Hook
**Location:** `client/src/hooks/useVoiceOutput.ts`

**Features:**
- Premium mode: OpenAI TTS API (nova, alloy, echo, fable, onyx, shimmer)
- Fallback mode: Browser Web Speech API
- Voice settings persistence (localStorage)
- Speed control (0.5x - 2.0x)

**Methods:**
```typescript
speak(text) - Choose OpenAI TTS or browser based on settings
speakWithOpenAI(text) - POST /api/tts/synthesize → play audio blob
speakWithBrowser(text) - Use window.speechSynthesis
```

### Backend Audio Routes

#### 1. **voiceConversationRoutes.ts**
**Location:** `server/routes/voiceConversationRoutes.ts`

**Endpoints:**
- `GET /api/voice/realtime` - WebSocket upgrade for Realtime API
- Proxies GPT-4o Realtime API with authentication

#### 2. **ttsRoutes.ts**
**Location:** `server/routes/ttsRoutes.ts`

**Endpoints:**
- `POST /api/tts/synthesize` - OpenAI TTS synthesis
- Accepts: `{ text, voice, model }`
- Returns: Audio blob (MP3)

#### 3. **chatProjectsRoutes.ts**
**Endpoint:** `POST /api/chat/summarize`

**Purpose:** AI summarization of voice transcripts with visual context
**Input:**
```json
{
  "text": "transcript...",
  "visualContext": {
    "tagName": "div",
    "id": "header",
    "className": "flex items-center"
  }
}
```

---

## 🔍 PART 3: Debugging Plan - Why Isn't Audio Working?

### Test Checkpoints (In Order)

#### ✅ CHECKPOINT 1: Modal Opens
**What to check:** Is the UnifiedVoiceModal rendering?
**Expected:** Modal visible, header shows "Voice Session Active"
**Status:** ✅ PASS (visible in screenshot)

---

#### 🔴 CHECKPOINT 2: Microphone Permission
**What to check:** Does browser request microphone access?

**Where to look:**
1. **Browser console logs:**
   ```
   [AudioCapture] Requesting microphone access...
   [AudioCapture] Recording started
   ```
   **OR errors:**
   ```
   [AudioCapture] Error: NotAllowedError - permission denied
   [AudioCapture] Error: NotFoundError - no microphone
   ```

2. **Browser UI:** Chrome should show microphone icon in address bar

**Expected behavior:**
- Status badge shows "🔴 Recording" with pulsing red dot
- Console: `[AudioCapture] Recording started`

**If FAIL:**
- Check browser permissions: chrome://settings/content/microphone
- Try different browser (Safari, Firefox)
- Check if other apps using microphone

**Logging to add:**
```typescript
// In UnifiedVoiceModal.tsx startSession()
console.log('🎤 [Debug 1] Checking microphone permission...');
const hasPermission = await checkPermission();
console.log('🎤 [Debug 2] Permission result:', hasPermission);

if (!hasPermission) {
  console.log('🎤 [Debug 3] Requesting permission now...');
}
```

---

#### 🔴 CHECKPOINT 3: WebSocket Connection
**What to check:** Does WebSocket connect to Realtime API?

**Where to look:**
1. **Browser console:**
   ```
   [Realtime] Connecting to WebSocket...
   [Realtime] Connected! Session ID: sess_xxx
   ```
   **OR errors:**
   ```
   [Realtime] Connection error: WebSocket failed
   ```

2. **Network tab:** Look for WebSocket upgrade request to `/api/voice/realtime`

**Expected behavior:**
- Status badge shows "🟢 Connected" with pulsing green dot
- Console: `[Realtime] Connected!`

**If FAIL:**
- Check backend logs for WebSocket errors
- Verify OpenAI API key is set (OPENAI_API_KEY secret)
- Check firewall/network blocking WebSocket

**Logging to add:**
```typescript
// In useRealtimeConversation.ts connect()
console.log('🌐 [Debug 4] Connecting to /api/voice/realtime...');
const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('🌐 [Debug 5] WebSocket OPEN!');
};

ws.onerror = (error) => {
  console.error('🌐 [Debug 6] WebSocket ERROR:', error);
};
```

---

#### 🔴 CHECKPOINT 4: Audio Streaming
**What to check:** Is audio being captured and sent?

**Where to look:**
1. **Browser console:**
   ```
   [AudioCapture] Processing audio chunk: 4096 samples
   [Realtime] Sending audio buffer: 8192 bytes
   ```

2. **Network tab:** WebSocket should show outgoing messages (binary frames)

**Expected behavior:**
- Continuous console logs showing audio processing
- Network tab shows binary WebSocket frames every ~100ms

**If FAIL:**
- Audio context not created (check for AudioContext errors)
- ScriptProcessorNode not firing (deprecated but should work)
- Audio data not reaching WebSocket (connection issue)

**Logging to add:**
```typescript
// In useAudioCapture.ts processor.onaudioprocess
let audioChunkCount = 0;
processor.onaudioprocess = (event) => {
  audioChunkCount++;
  if (audioChunkCount % 10 === 0) { // Log every 10th chunk
    console.log('🎵 [Debug 7] Audio chunk:', {
      count: audioChunkCount,
      samples: inputData.length,
      peak: Math.max(...Array.from(inputData).map(Math.abs))
    });
  }
  
  // ... existing PCM16 conversion ...
  
  if (options.onAudioData) {
    console.log('🎵 [Debug 8] Sending PCM16:', pcm16.buffer.byteLength, 'bytes');
    options.onAudioData(pcm16.buffer);
  }
};
```

---

#### 🔴 CHECKPOINT 5: Realtime API Response
**What to check:** Is GPT-4o responding with transcript?

**Where to look:**
1. **Browser console:**
   ```
   [Realtime] Event: response.audio_transcript.delta { delta: "Hello" }
   [Realtime] Event: response.audio.delta { delta: "base64..." }
   ```

2. **Backend logs:** Look for Realtime API responses

**Expected behavior:**
- Transcript appears in left panel: "Hello, how can I..."
- AI audio plays through speakers
- Status badge shows "💬 Speaking..."

**If FAIL:**
- GPT-4o not receiving audio (check step 4)
- Voice Activity Detection (VAD) not triggered (user not speaking loudly enough)
- API rate limit or authentication error

**Logging to add:**
```typescript
// In useRealtimeConversation.ts WebSocket message handler
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 [Debug 9] Realtime event:', data.type);
  
  if (data.type === 'response.audio_transcript.delta') {
    console.log('📨 [Debug 10] Transcript delta:', data.delta);
  }
  
  if (data.type === 'error') {
    console.error('📨 [Debug 11] Realtime API error:', data.error);
  }
};
```

---

#### 🔴 CHECKPOINT 6: Transcript Display
**What to check:** Is transcript updating in UI?

**Where to look:**
1. **Left panel** - Should show growing text
2. **React state** - Check transcript state updates

**Expected behavior:**
- Text appears in real-time as you speak
- Auto-scrolls to bottom

**If FAIL:**
- State not updating (check useState setTranscript)
- Event handler not triggering (check onEvent prop)
- React not re-rendering

**Logging to add:**
```typescript
// In UnifiedVoiceModal.tsx useRealtimeConversation onEvent
onEvent: (event) => {
  console.log('🎯 [Debug 12] Realtime event received:', event.type);
  
  if (event.type === 'response.audio_transcript.delta') {
    console.log('🎯 [Debug 13] Setting transcript:', event.delta);
    setTranscript(prev => {
      const newText = prev + event.delta;
      console.log('🎯 [Debug 14] New transcript length:', newText.length);
      return newText;
    });
  }
}
```

---

### 🛠️ Quick Diagnostic Script

Add this to browser console to check all systems:

```javascript
// Copy-paste into browser console while modal is open
console.log('🔍 AUDIO SYSTEM DIAGNOSTIC');
console.log('================================');

// 1. Check microphone permission
navigator.permissions.query({ name: 'microphone' }).then(result => {
  console.log('🎤 Microphone permission:', result.state);
});

// 2. Check AudioContext support
console.log('🎵 AudioContext:', 'AudioContext' in window ? '✅ Supported' : '❌ Not supported');

// 3. Check WebSocket support
console.log('🌐 WebSocket:', 'WebSocket' in window ? '✅ Supported' : '❌ Not supported');

// 4. Check Speech API
console.log('🗣️ Speech Synthesis:', 'speechSynthesis' in window ? '✅ Supported' : '❌ Not supported');

// 5. List available audio devices
navigator.mediaDevices.enumerateDevices().then(devices => {
  const mics = devices.filter(d => d.kind === 'audioinput');
  console.log('🎤 Microphones found:', mics.length);
  mics.forEach((mic, i) => {
    console.log(`  ${i + 1}. ${mic.label || 'Unnamed microphone'}`);
  });
});

// 6. Check for active WebSocket
const ws = performance.getEntriesByType('resource')
  .filter(r => r.name.includes('voice/realtime'));
console.log('🌐 Active WebSocket connections:', ws.length);

console.log('================================');
```

---

## 📝 Action Plan: Adding Debug Logging

### Phase 1: Enhanced Console Logging (Do This First)

**File to modify:** `client/src/components/mrBlue/UnifiedVoiceModal.tsx`

Add this at the top of startSession():
```typescript
const startSession = async () => {
  console.log('🚀 ============ VOICE SESSION START ============');
  console.log('🚀 [Step 1] Checking microphone permission...');
  
  try {
    const hasPermission = await checkPermission();
    console.log('🚀 [Step 2] Permission result:', hasPermission);
    
    if (!hasPermission) {
      console.log('🚀 [Step 3] No permission, showing toast and closing...');
      toast({ /* ... */ });
      onClose();
      return;
    }

    console.log('🚀 [Step 4] Connecting to Realtime API...');
    await connect();
    console.log('🚀 [Step 5] Realtime connected! Status:', realtimeStatus);

    console.log('🚀 [Step 6] Starting audio capture...');
    await startCapture();
    console.log('🚀 [Step 7] Audio capture started! Status:', captureStatus);

    console.log('🚀 [Step 8] Voice session fully initialized ✅');
    toast({ /* ... */ });
    
  } catch (error: any) {
    console.error('🚀 [ERROR] Session start failed at some step:', error);
    console.error('🚀 [ERROR] Error details:', {
      message: error.message,
      stack: error.stack,
      captureStatus,
      realtimeStatus
    });
    // ... existing error handling
  }
};
```

### Phase 2: Add Status Display in UI

Add this debug panel to UnifiedVoiceModal (after header, before main content):

```tsx
{/* 🐛 DEBUG PANEL - Remove after fixing */}
<div className="p-2 bg-yellow-50 border-b border-yellow-200 text-xs font-mono">
  <div className="flex gap-4">
    <span>Capture: {captureStatus}</span>
    <span>Realtime: {realtimeStatus}</span>
    <span>Transcript: {transcript.length} chars</span>
    <span>Audio Queue: {audioQueue.length}</span>
    <span>Element: {selectedElement ? '✅' : '❌'}</span>
  </div>
</div>
```

### Phase 3: Backend Logging

**File:** `server/routes/voiceConversationRoutes.ts`

Add logging to WebSocket handler:
```typescript
wss.on('connection', (ws, req) => {
  console.log('🎧 [Backend] New Realtime WebSocket connection');
  
  ws.on('message', (data) => {
    console.log('🎧 [Backend] Received message from client:', data.length, 'bytes');
  });
  
  ws.on('close', () => {
    console.log('🎧 [Backend] WebSocket closed');
  });
  
  ws.on('error', (error) => {
    console.error('🎧 [Backend] WebSocket error:', error);
  });
});
```

---

## 🎯 Expected Test Flow

When you click the headphone button:

1. ✅ Modal opens → "Voice Session Active" header visible
2. 🎤 Browser asks for microphone → User clicks "Allow"
3. 🟢 Status: "Connected" appears
4. 🔴 Status: "Recording" appears
5. 🗣️ User speaks → Transcript appears in left panel
6. 💬 GPT-4o responds → Status shows "Speaking...", audio plays
7. 📊 Summary bullets appear in right panel
8. 🔄 Repeat steps 5-7 for conversation

**Current issue:** We're stuck somewhere between steps 2-5.

---

## 🚨 Common Issues & Solutions

### Issue 1: "Microphone permission denied"
**Solution:**
- Chrome: chrome://settings/content/microphone
- Allow for your domain
- Refresh page

### Issue 2: "WebSocket failed to connect"
**Check:**
- OpenAI API key set? (`OPENAI_API_KEY` in Secrets)
- Backend running? (Check workflow logs)
- Firewall blocking WebSocket?

### Issue 3: "Recording but no transcript"
**Possible causes:**
- Audio too quiet (speak louder)
- Wrong audio format (should be PCM16 24kHz)
- VAD not triggering (need sustained speech)

### Issue 4: "Audio cutting out"
**Check:**
- Network quality (WebSocket disconnecting?)
- CPU usage (audio processing intensive)
- Audio context suspended (click page to resume)

---

## 📦 Files to Check

### Frontend:
- ✅ `client/src/components/mrBlue/UnifiedVoiceModal.tsx`
- ✅ `client/src/hooks/useAudioCapture.ts`
- ✅ `client/src/hooks/useRealtimeConversation.ts`
- ✅ `client/src/hooks/useAudioPlayback.ts`
- ✅ `client/src/hooks/useVoiceOutput.ts`

### Backend:
- ✅ `server/routes/voiceConversationRoutes.ts`
- ✅ `server/routes/ttsRoutes.ts`
- ✅ `server/routes/chatProjectsRoutes.ts` (summarize endpoint)

### Environment:
- ⚠️ `OPENAI_API_KEY` - Required for Realtime API
- ✅ Database - Stores chat projects/messages

---

## 🎯 Next Steps

1. **Add enhanced logging** (Phase 1 above)
2. **Add debug panel** to see real-time status
3. **Open browser console** and try starting session
4. **Check each checkpoint** in order
5. **Report back** which checkpoint fails
6. **We'll debug together** based on logs

Ready to add the logging and test! 🚀
