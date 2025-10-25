# STREAM 3: Mr Blue Voice Components - Complete Mapping
**MB.MD Phase: Mapping (100% Complete) → Breakdown (Next)**
**Date:** October 25, 2025
**Status:** ✅ ALL 5 VOICE COMPONENTS MAPPED (100%)

## Overview
Complete mapping of all Mr Blue voice-related components including language detection, waveform visualization, compact toggle, realtime mode, and voice selection. These integrate GPT-4o Realtime API with premium OpenAI TTS.

---

## 1. VoiceLanguageDetector (MAPPED ✅)
**Location:** `client/src/components/mrBlue/VoiceLanguageDetector.tsx` (161 lines)
**Agent:** #127 (Voice)
**Purpose:** Auto-detect and switch languages in voice conversations

### Features:
- **10 Language Support:** EN, ES, FR, DE, IT, PT, RU, ZH, JA, KO
- **Auto-Switch Mode:** Automatically change to detected language
- **Manual Override:** Dropdown menu to manually select language
- **Detection Notification:** Shows "Language detected - Switch or Dismiss"
- **Real-time Detection:** Updates based on speech input

### Key Props:
```typescript
interface VoiceLanguageDetectorProps {
  currentLanguage: string;           // Currently selected language
  detectedLanguage?: string;         // Auto-detected language
  onLanguageChange: (language: string) => void;
  autoSwitch?: boolean;              // Enable auto-switching
  onAutoSwitchChange?: (enabled: boolean) => void;
}
```

### Data Flow:
1. User speaks → detectedLanguage prop updates
2. If autoSwitch=true → Automatically calls onLanguageChange()
3. If autoSwitch=false → Shows notification with Switch/Dismiss buttons
4. Manual selection → Dropdown menu with all 10 languages

### UI Elements:
- Language selector dropdown (Globe icon + flag + name)
- Auto-detect badge toggle
- Language detection notification (slide-in animation)
- Switch/Dismiss buttons

---

## 2. VoiceVisualizerWaveform (MAPPED ✅)
**Location:** `client/src/components/mrBlue/VoiceVisualizerWaveform.tsx` (159 lines)
**Agent:** #127 (Voice)
**Purpose:** Canvas-based real-time audio waveform visualization

### Visualization Types:
1. **Waveform:** Classic oscilloscope-style wave
2. **Frequency:** Frequency spectrum display
3. **Bars:** Bar graph frequency visualization (32 bars)

### Features:
- **Real-time Audio:** Uses Web Audio API via useVoiceVisualization hook
- **Canvas Rendering:** 60 FPS smooth animation
- **Customizable:** Width, height, color, background color
- **Inactive State:** Shows flat line when no audio
- **Active State:** Animated visualization based on audio data

### Key Props:
```typescript
interface VoiceVisualizerWaveformProps {
  audioStream: MediaStream | null;  // Input audio stream
  width?: number;                    // Canvas width (default: 400)
  height?: number;                   // Canvas height (default: 100)
  color?: string;                    // Waveform color (default: purple-500)
  backgroundColor?: string;          // Canvas bg (default: transparent)
  type?: 'waveform' | 'frequency' | 'bars';
}
```

### Technical Implementation:
```typescript
// Uses custom hook for audio analysis
const visualizationData = useVoiceVisualization(audioStream);

// Visualization data structure:
{
  isActive: boolean;
  timeData: Uint8Array;      // Time-domain data
  frequencyData: Uint8Array; // Frequency-domain data
}
```

### Drawing Functions:
- `drawWaveform()` - Time-domain oscilloscope
- `drawFrequency()` - Frequency spectrum line
- `drawBars()` - 32-bar frequency graph

---

## 3. CompactVoiceToggle (MAPPED ✅)
**Location:** `client/src/components/mrBlue/CompactVoiceToggle.tsx` (186 lines)
**Agent:** #127 (Voice)
**Purpose:** Inline mic button for voice conversations (no modal)

### Design Philosophy:
- **No Full-Screen Modal:** Voice conversations happen inline
- **Visual Feedback:** Recording indicator, connection status, speaking status
- **Seamless Integration:** Can be embedded anywhere in the UI

### Features:
- **Single Button Toggle:** Mic icon → Start, Phone icon → Stop
- **Real-time Status:** Connected, Speaking, Recording indicators
- **Auto-Transcript:** Calls onTranscriptUpdate callback
- **Error Handling:** Toast notifications for failures
- **Permission Management:** Checks mic permission before starting

### Key Props:
```typescript
interface CompactVoiceToggleProps {
  voiceSettings: {
    selectedVoice: string;
    usePremiumTTS: boolean;
  };
  onTranscriptUpdate?: (transcript: string) => void;
  className?: string;
}
```

### States:
1. **Inactive:** Gray mic button
2. **Active + Connected:** Teal gradient button with pulse
3. **Recording:** Animated red dot in top-right corner
4. **Speaking:** "Speaking..." status text

### Hooks Used:
- `useRealtimeConversation` - GPT-4o Realtime API
- `useAudioCapture` - Microphone access
- `useAudioPlayback` - Audio output

---

## 4. RealtimeVoiceMode (MAPPED ✅)
**Location:** `client/src/components/mrBlue/RealtimeVoiceMode.tsx` (309 lines)
**Purpose:** Full two-way voice conversation UI for Mr Blue

### Features:
- **Full-Screen Voice UI:** Large phone icon with status indicators
- **VAD (Voice Activity Detection):** Visual feedback when user speaks
- **Push-to-Talk Mode:** Toggle between auto-detect and manual
- **Multi-Language Support:** Language selector dropdown (6 languages)
- **3-Button Controls:** Mute, End Call, Speaker
- **Live Transcript:** Shows current conversation text
- **Connection Indicators:** Connection, Microphone, Speaker status dots

### Visual States:
1. **User Speaking:** Green pulsing gradient (STREAM 3 VAD)
2. **Assistant Speaking:** Blue-purple pulsing gradient
3. **Connected/Idle:** Solid blue-purple gradient
4. **Disconnected:** Gray

### UI Components:
- **Status Indicator:** 128px circular icon with gradient
- **VAD Badge:** "🎤 You're speaking" when user talks
- **Language Selector:** Top-right dropdown (Globe icon)
- **Push-to-Talk Toggle:** Hand icon button
- **Control Panel:** 3 circular buttons (Mute, End, Speaker)
- **Connection Status:** Bottom indicators with pulsing dots

### Hooks Used:
- `useRealtimeConversation` - GPT-4o Realtime API with events
- `useAudioCapture` - Mic capture with permission check
- `useAudioPlayback` - Audio queue management

### Event Handling:
```typescript
onEvent: (event) => {
  // VAD events
  if (event.type === 'input_audio_buffer.speech_started') {
    setIsUserSpeaking(true);
  }
  // Transcript events
  else if (event.type === 'response.audio_transcript.delta') {
    // Update transcript
  }
  // Error events
  else if (event.type === 'error') {
    toast({ title: 'Voice Error', description: event.error.message });
  }
}
```

---

## 5. VoiceSelector (MAPPED ✅)
**Location:** `client/src/components/mrBlue/VoiceSelector.tsx` (187 lines)
**Date:** October 22, 2025
**Purpose:** Premium OpenAI TTS Voice Selector

### Supported Voices:
1. **Nova** ⭐ (Recommended) - Female, energetic, friendly
2. **Alloy** - Neutral, balanced
3. **Echo** - Male, clear, professional
4. **Fable** - Male, warm, British accent
5. **Onyx** - Male, deep, authoritative
6. **Shimmer** - Female, soft, gentle

### Features:
- **Premium Toggle:** Enable/disable OpenAI TTS
- **Voice Dropdown:** Select from 6 voices
- **Test Button:** Preview voice with sample phrase
- **Voice Info Card:** Shows gender + description
- **Cost Display:** "$15 per 1M characters • ~300ms latency"
- **Fallback Message:** Shows when premium disabled

### Key Props:
```typescript
interface VoiceSelectorProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: Partial<VoiceSettings>) => void;
  className?: string;
}

interface VoiceSettings {
  voice: string;        // Voice ID (nova, alloy, etc.)
  usePremium: boolean;  // Enable OpenAI TTS
}
```

### Test Voice Flow:
1. User clicks "Test Voice" button
2. POST to `/api/tts/test` with selected voice
3. Server returns audio blob
4. Play audio in browser
5. Show "Playing..." state during playback

### UI Elements:
- Premium toggle switch
- Voice dropdown selector
- Voice info card (icon, name, description, gender)
- Test button with loading state
- Cost information footer

---

## Integration Summary

### All 5 Voice Components Work Together:
1. **VoiceSelector** - User picks voice + enables premium
2. **RealtimeVoiceMode** - Full-screen conversation with all features
3. **CompactVoiceToggle** - Inline mic button for quick access
4. **VoiceVisualizerWaveform** - Visual feedback during conversation
5. **VoiceLanguageDetector** - Auto-detect and switch languages

### Voice Architecture:
```
User clicks mic
  ↓
CompactVoiceToggle / RealtimeVoiceMode
  ↓
useRealtimeConversation (GPT-4o API)
  ↓
useAudioCapture (WebRTC) → sendAudio() → OpenAI
  ↓
Audio Response ← OpenAI
  ↓
useAudioPlayback → Speaker output
  ↓
VoiceVisualizerWaveform (visual feedback)
  ↓
VoiceLanguageDetector (language switching)
```

---

## API Endpoints Referenced

1. **`/api/tts/test`** - Test voice preview (POST)
   - Body: `{ voice: string }`
   - Returns: Audio blob

2. **GPT-4o Realtime API** - Two-way voice conversation
   - Events: speech_started, speech_stopped, audio_transcript.delta, error
   - Functions: connect(), disconnect(), sendAudio(), interrupt()

---

## Next Steps (Breakdown Phase)

1. **Verify All Hooks Exist:**
   - ✅ useRealtimeConversation
   - ✅ useAudioCapture
   - ✅ useAudioPlayback
   - ⚠️ useVoiceVisualization (needs verification)

2. **Verify API Routes:**
   - ⚠️ `/api/tts/test` endpoint
   - ⚠️ GPT-4o Realtime API integration

3. **Test Integration:**
   - Voice selector → Realtime mode
   - Compact toggle → Transcript updates
   - Language detector → Auto-switching
   - Waveform visualizer → Audio stream

4. **Visual Testing:**
   - Screenshot of voice selector
   - Screenshot of realtime mode (idle, speaking, user speaking)
   - Test compact toggle inline placement
   - Verify waveform animations

---

## Completion Metrics

**MAPPING: 100% COMPLETE** ✅
- 5/5 components mapped
- All props documented
- All hooks identified
- All API endpoints listed
- Integration architecture defined

**BREAKDOWN: 0% COMPLETE** ⏳
- Hook verification pending
- API route verification pending
- Integration testing pending

**TESTING: 0% COMPLETE** ⏳
- No visual testing yet
- No user journey testing
- No integration testing

**DEPLOYMENT: 0% COMPLETE** ⏳
- No production testing
- No performance benchmarks
- No error monitoring
