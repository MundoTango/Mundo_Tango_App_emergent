# Audio Debug Logging - Copy-Paste Code
**Date:** October 23, 2025  
**Purpose:** Enhanced logging to troubleshoot Mr Blue audio interface

---

## 🚀 Step 1: Add Enhanced Logging to UnifiedVoiceModal

**File:** `client/src/components/mrBlue/UnifiedVoiceModal.tsx`

### Replace the `startSession` function with this version:

```typescript
const startSession = async () => {
  console.log('🚀 ============ VOICE SESSION START ============');
  console.log('🚀 [Step 1/7] Checking microphone permission...');
  console.log('🚀 [Step 1/7] Current states:', {
    captureStatus,
    realtimeStatus,
    isRecording,
    isConnected
  });
  
  try {
    const hasPermission = await checkPermission();
    console.log('🚀 [Step 2/7] Permission check result:', hasPermission);
    
    if (!hasPermission) {
      console.log('🚀 [Step 2/7] ❌ NO PERMISSION - Showing toast and closing...');
      toast({
        title: 'Microphone Required',
        description: 'Please allow microphone access to use voice mode.',
        variant: 'destructive'
      });
      onClose();
      return;
    }

    console.log('🚀 [Step 3/7] ✅ Permission granted - Connecting to Realtime API...');
    console.log('🚀 [Step 3/7] WebSocket URL will be: wss://' + window.location.host + '/api/realtime/connect');
    
    await connect();
    console.log('🚀 [Step 4/7] ✅ Realtime connect() called - Status:', realtimeStatus);

    console.log('🚀 [Step 5/7] Starting audio capture...');
    await startCapture();
    console.log('🚀 [Step 6/7] ✅ Audio capture started - Status:', captureStatus);

    console.log('🚀 [Step 7/7] ✅✅✅ VOICE SESSION FULLY INITIALIZED ✅✅✅');
    console.log('🚀 Current state:', {
      captureStatus,
      realtimeStatus,
      isRecording,
      isConnected,
      transcriptLength: transcript.length,
      audioQueueLength: audioQueue.length
    });
    
    toast({
      title: '🎧 Voice Session Started',
      description: 'Speak naturally - I\'m listening and taking notes!'
    });
    
  } catch (error: any) {
    console.error('🚀 ❌❌❌ SESSION START FAILED ❌❌❌');
    console.error('🚀 Error object:', error);
    console.error('🚀 Error message:', error.message);
    console.error('🚀 Error stack:', error.stack);
    console.error('🚀 Final states:', {
      captureStatus,
      realtimeStatus,
      isRecording,
      isConnected
    });
    
    toast({
      title: 'Voice Session Failed',
      description: error.message || 'Could not start voice mode',
      variant: 'destructive'
    });
    onClose();
  }
};
```

---

## 🎤 Step 2: Add Microphone Permission Logging

**File:** `client/src/hooks/useAudioCapture.ts`

### Replace the `startCapture` function with this version:

```typescript
const startCapture = useCallback(async () => {
  try {
    setStatus('requesting');
    setError(null);

    console.log('🎤 [AudioCapture] ============ START CAPTURE ============');
    console.log('🎤 [AudioCapture] Requesting microphone access...');
    console.log('🎤 [AudioCapture] Sample rate:', sampleRate);

    // Request microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: sampleRate
      }
    });

    console.log('🎤 [AudioCapture] ✅ Microphone stream obtained!');
    console.log('🎤 [AudioCapture] Stream details:', {
      active: stream.active,
      tracks: stream.getTracks().length,
      trackLabel: stream.getTracks()[0]?.label,
      trackEnabled: stream.getTracks()[0]?.enabled
    });

    streamRef.current = stream;
    setPermissionGranted(true);

    // Create audio context
    console.log('🎤 [AudioCapture] Creating AudioContext...');
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: sampleRate
    });
    audioContextRef.current = audioContext;
    console.log('🎤 [AudioCapture] AudioContext created:', {
      state: audioContext.state,
      sampleRate: audioContext.sampleRate
    });

    // Create audio source from stream
    console.log('🎤 [AudioCapture] Creating MediaStreamSource...');
    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;

    // Create script processor for PCM16 encoding
    console.log('🎤 [AudioCapture] Creating ScriptProcessor...');
    const bufferSize = 4096;
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
    processorRef.current = processor;

    let audioChunkCount = 0;
    processor.onaudioprocess = (event) => {
      audioChunkCount++;
      
      const inputData = event.inputBuffer.getChannelData(0);
      
      // Log every 50th chunk (about every 5 seconds at 24kHz)
      if (audioChunkCount % 50 === 0) {
        const peak = Math.max(...Array.from(inputData).map(Math.abs));
        console.log('🎵 [AudioCapture] Processing audio:', {
          chunkNumber: audioChunkCount,
          samples: inputData.length,
          peakVolume: (peak * 100).toFixed(1) + '%',
          silenceDetected: peak < 0.01
        });
      }
      
      // Convert Float32 to PCM16
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        // Clamp to [-1, 1] and convert to 16-bit integer
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Send PCM16 data
      if (options.onAudioData) {
        if (audioChunkCount === 1) {
          console.log('🎵 [AudioCapture] Sending first PCM16 chunk:', pcm16.buffer.byteLength, 'bytes');
        }
        options.onAudioData(pcm16.buffer);
      }
    };

    // Connect audio graph
    console.log('🎤 [AudioCapture] Connecting audio graph...');
    source.connect(processor);
    processor.connect(audioContext.destination);

    setStatus('recording');
    console.log('🎤 [AudioCapture] ✅✅✅ RECORDING STARTED ✅✅✅');
    console.log('🎤 [AudioCapture] Status:', {
      status: 'recording',
      contextState: audioContext.state,
      streamActive: stream.active
    });

  } catch (err: any) {
    console.error('🎤 [AudioCapture] ❌❌❌ ERROR ❌❌❌');
    console.error('🎤 [AudioCapture] Error name:', err.name);
    console.error('🎤 [AudioCapture] Error message:', err.message);
    console.error('🎤 [AudioCapture] Full error:', err);
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setError('Microphone permission denied. Please allow microphone access.');
    } else if (err.name === 'NotFoundError') {
      setError('No microphone found. Please connect a microphone.');
    } else {
      setError('Failed to start audio capture: ' + err.message);
    }
    
    setStatus('error');
  }
}, [options, sampleRate]);
```

---

## 🌐 Step 3: Add WebSocket Connection Logging

**File:** `client/src/hooks/useRealtimeConversation.ts`

### Replace the `connect` function with this version:

```typescript
const connect = useCallback(async () => {
  try {
    setStatus('connecting');
    
    // Get WebSocket URL (use wss:// for production, ws:// for development)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/realtime/connect`;
    
    console.log('🌐 [Realtime] ============ CONNECTING ============');
    console.log('🌐 [Realtime] WebSocket URL:', wsUrl);
    console.log('🌐 [Realtime] Protocol:', protocol);
    console.log('🌐 [Realtime] Host:', host);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🌐 [Realtime] ✅✅✅ CONNECTED ✅✅✅');
      console.log('🌐 [Realtime] WebSocket state:', ws.readyState);
      console.log('🌐 [Realtime] Expected states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3');
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        // Handle binary audio data (not JSON)
        if (event.data instanceof Blob) {
          console.log('🌐 [Realtime] Received binary audio blob:', event.data.size, 'bytes');
          event.data.arrayBuffer().then((buffer) => {
            setAudioQueue(prev => [...prev, buffer]);
          });
          return;
        }
        
        // Parse JSON messages
        const message = JSON.parse(event.data) as RealtimeEvent;
        
        // Enhanced logging for key events
        if (message.type === 'session.created') {
          console.log('🌐 [Realtime] 🎉 SESSION CREATED:', message);
        } else if (message.type === 'error') {
          console.error('🌐 [Realtime] ❌ ERROR EVENT:', message.error);
        } else if (message.type === 'input_audio_buffer.speech_started') {
          console.log('🌐 [Realtime] 🗣️ SPEECH STARTED - User is speaking!');
        } else if (message.type === 'input_audio_buffer.speech_stopped') {
          console.log('🌐 [Realtime] 🤐 SPEECH STOPPED - Processing...');
        } else if (message.type === 'response.audio_transcript.delta') {
          console.log('🌐 [Realtime] 📝 TRANSCRIPT DELTA:', message.delta);
        } else {
          console.log('🌐 [Realtime] Message:', message.type);
        }
        
        // Handle events
        switch (message.type) {
          case 'session.created':
          case 'session.updated':
            console.log('[Realtime] Session updated:', message);
            break;

          case 'input_audio_buffer.speech_started':
            console.log('[Realtime] User started speaking');
            break;

          case 'input_audio_buffer.speech_stopped':
            console.log('[Realtime] User stopped speaking');
            break;

          case 'response.created':
            console.log('🌐 [Realtime] 🤖 ASSISTANT RESPONDING...');
            setIsAssistantSpeaking(true);
            break;

          case 'response.audio.delta':
            // Queue audio chunk for playback
            const audioData = base64ToArrayBuffer(message.delta);
            console.log('🌐 [Realtime] 🔊 Audio chunk:', audioData.byteLength, 'bytes');
            setAudioQueue(prev => [...prev, audioData]);
            break;

          case 'response.audio_transcript.delta':
            console.log('🌐 [Realtime] 📝 Adding to transcript:', message.delta);
            setTranscript(prev => prev + message.delta);
            break;

          case 'response.done':
            console.log('🌐 [Realtime] ✅ Response complete');
            setIsAssistantSpeaking(false);
            break;

          case 'error':
            console.error('[Realtime] Error:', message.error);
            setStatus('error');
            break;
        }

        // Call user's event handler
        if (options.onEvent) {
          options.onEvent(message);
        }
      } catch (error) {
        console.error('🌐 [Realtime] ❌ Error parsing message:', error);
        console.error('🌐 [Realtime] Raw data:', event.data);
        console.error('🌐 [Realtime] Error details:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('🌐 [Realtime] ❌❌❌ WEBSOCKET ERROR ❌❌❌');
      console.error('🌐 [Realtime] Error event:', error);
      console.error('🌐 [Realtime] WebSocket state:', ws.readyState);
      setStatus('error');
    };

    ws.onclose = (event) => {
      console.log('🌐 [Realtime] 🔌 DISCONNECTED');
      console.log('🌐 [Realtime] Close code:', event.code);
      console.log('🌐 [Realtime] Close reason:', event.reason);
      console.log('🌐 [Realtime] Clean close:', event.wasClean);
      setStatus('disconnected');
    };

  } catch (error) {
    console.error('🌐 [Realtime] ❌ Connection setup error:', error);
    setStatus('error');
  }
}, [options]);
```

---

## 📊 Step 4: Add Debug Status Panel to UI

**File:** `client/src/components/mrBlue/UnifiedVoiceModal.tsx`

### Add this right after the `DialogHeader` and before the main content:

```tsx
{/* 🐛 DEBUG STATUS PANEL - Remove after fixing */}
<div className="px-4 py-3 bg-yellow-50 border-y border-yellow-300 font-mono text-xs space-y-1">
  <div className="font-bold text-yellow-900 mb-2">🐛 DEBUG STATUS:</div>
  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
    <div>
      <span className="text-gray-600">Capture Status:</span>
      <span className={`ml-2 font-bold ${captureStatus === 'recording' ? 'text-green-600' : 'text-red-600'}`}>
        {captureStatus}
      </span>
    </div>
    <div>
      <span className="text-gray-600">Realtime Status:</span>
      <span className={`ml-2 font-bold ${realtimeStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
        {realtimeStatus}
      </span>
    </div>
    <div>
      <span className="text-gray-600">Is Recording:</span>
      <span className={`ml-2 font-bold ${isRecording ? 'text-green-600' : 'text-gray-400'}`}>
        {isRecording ? 'YES' : 'NO'}
      </span>
    </div>
    <div>
      <span className="text-gray-600">Is Connected:</span>
      <span className={`ml-2 font-bold ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
        {isConnected ? 'YES' : 'NO'}
      </span>
    </div>
    <div>
      <span className="text-gray-600">Transcript Length:</span>
      <span className="ml-2 font-bold text-blue-600">{transcript.length} chars</span>
    </div>
    <div>
      <span className="text-gray-600">Audio Queue:</span>
      <span className="ml-2 font-bold text-purple-600">{audioQueue.length} chunks</span>
    </div>
    <div>
      <span className="text-gray-600">Selected Element:</span>
      <span className={`ml-2 font-bold ${selectedElement ? 'text-green-600' : 'text-gray-400'}`}>
        {selectedElement ? `<${selectedElement.tagName}>` : 'None'}
      </span>
    </div>
    <div>
      <span className="text-gray-600">Assistant Speaking:</span>
      <span className={`ml-2 font-bold ${isAssistantSpeaking ? 'text-cyan-600' : 'text-gray-400'}`}>
        {isAssistantSpeaking ? 'YES' : 'NO'}
      </span>
    </div>
  </div>
  <div className="mt-2 text-xs text-gray-500">
    💡 Check browser console for detailed logs starting with 🚀 🎤 🌐 🎵
  </div>
</div>
```

---

## 🔍 Step 5: Quick Diagnostic - Paste in Browser Console

When the modal is open, paste this into your browser console:

```javascript
console.log('🔍 ============ AUDIO SYSTEM DIAGNOSTIC ============');

// 1. Check microphone permission
navigator.permissions.query({ name: 'microphone' }).then(result => {
  console.log('🎤 Microphone permission:', result.state);
});

// 2. Check APIs
console.log('🎵 AudioContext:', 'AudioContext' in window ? '✅ Supported' : '❌ Not supported');
console.log('🌐 WebSocket:', 'WebSocket' in window ? '✅ Supported' : '❌ Not supported');
console.log('🗣️ Speech Synthesis:', 'speechSynthesis' in window ? '✅ Supported' : '❌ Not supported');

// 3. List audio devices
navigator.mediaDevices.enumerateDevices().then(devices => {
  const mics = devices.filter(d => d.kind === 'audioinput');
  console.log('🎤 Microphones found:', mics.length);
  mics.forEach((mic, i) => {
    console.log(`  ${i + 1}. ${mic.label || 'Unnamed microphone'} (${mic.deviceId.substring(0, 20)}...)`);
  });
});

// 4. Check environment
console.log('🌍 Window location:', window.location.href);
console.log('🌍 Protocol:', window.location.protocol);
console.log('🌍 Host:', window.location.host);

// 5. Test microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('🎤 ✅ Microphone access GRANTED');
    console.log('🎤 Stream active:', stream.active);
    console.log('🎤 Tracks:', stream.getTracks().length);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error('🎤 ❌ Microphone access DENIED:', err.name, err.message);
  });

console.log('🔍 ========================================');
```

---

## 📋 Testing Checklist

After adding the logging, test this sequence:

1. **Open Voice Modal** → Click headphone button
2. **Check Console** → Should see:
   ```
   🚀 ============ VOICE SESSION START ============
   🚀 [Step 1/7] Checking microphone permission...
   ```
3. **Allow Microphone** → Browser permission popup
4. **Watch Console** → Should progress through steps 1-7
5. **Check Debug Panel** → All statuses should turn green
6. **Speak** → Should see:
   ```
   🌐 [Realtime] 🗣️ SPEECH STARTED
   🎵 [AudioCapture] Processing audio: { peakVolume: "45.2%" }
   🌐 [Realtime] 📝 TRANSCRIPT DELTA: Hello
   ```

## 🎯 What to Report Back

After testing, tell me:
1. **Which step failed?** (Step 1-7 from console)
2. **What was the last log message?**
3. **What are the debug panel statuses?** (all red, some green, etc.)
4. **Any error messages?** (copy the full error)

This will help us pinpoint exactly where the audio is breaking! 🚀
