# Mr Blue Voice Activation Plan
## Connecting Existing TTS/STT to Chat Interface

**Status:** Ready to Build (blocked by server)  
**Estimated Time:** 2-3 hours  
**Infrastructure:** ✅ Already exists, just needs wiring

---

## 🎯 **What We're Building**

Transform Mr Blue from text-only chat to **full voice-enabled AI assistant** by connecting existing voice infrastructure to the chat interface.

### **Current State**
- ✅ `client/src/lib/voice/text-to-speech.ts` - TTS engine exists
- ✅ `client/src/lib/voice/speech-recognition.ts` - STT exists
- ✅ `client/src/hooks/useVoiceOutput.ts` - Voice hook exists
- ✅ `client/src/components/voice/VoiceVisualizer.tsx` - Visual feedback exists
- ❌ **Not connected to Mr Blue chat**

### **Target State**
- ✅ Mr Blue reads responses aloud (TTS)
- ✅ User can speak to Mr Blue (STT)
- ✅ Voice toggle button in chat UI
- ✅ 68-language support (already documented in replit.md)

---

## 📋 **Implementation Steps**

### **Step 1: Connect TTS to Chat Output** (30 min)

**File:** `client/src/components/mr-blue/MrBlueChat.tsx` (or equivalent)

```typescript
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { textToSpeech } from '@/lib/voice/text-to-speech';

function MrBlueChat() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { speak, speaking } = useVoiceOutput();
  
  // When AI responds
  const handleAIResponse = (message: string) => {
    // Display text as usual
    addMessage({ role: 'assistant', content: message });
    
    // Speak if voice enabled
    if (voiceEnabled) {
      textToSpeech({
        text: message,
        lang: currentLanguage, // From i18n
        voice: 'default' // or user preference
      });
    }
  };
  
  return (
    <div>
      {/* Existing chat UI */}
      <ChatMessages messages={messages} />
      
      {/* Voice toggle button */}
      <VoiceToggle 
        enabled={voiceEnabled}
        speaking={speaking}
        onToggle={() => setVoiceEnabled(!voiceEnabled)}
      />
    </div>
  );
}
```

**Files to modify:**
1. Find Mr Blue chat component (search for "mr-blue" or "MrBlue" in components)
2. Import voice hooks
3. Add state for voice toggle
4. Wire response → TTS

---

### **Step 2: Add Speech Recognition Input** (45 min)

**File:** `client/src/components/mr-blue/VoiceChatInput.tsx` (create new)

```typescript
import { useSpeechRecognition } from '@/lib/voice/speech-recognition';
import { Mic, MicOff } from 'lucide-react';

interface VoiceChatInputProps {
  onTranscript: (text: string) => void;
  language?: string;
}

export function VoiceChatInput({ onTranscript, language = 'en-US' }: VoiceChatInputProps) {
  const { 
    transcript, 
    listening, 
    startListening, 
    stopListening 
  } = useSpeechRecognition({ language });
  
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript]);
  
  return (
    <button
      onClick={listening ? stopListening : startListening}
      className={`p-2 rounded-full ${listening ? 'bg-red-500' : 'bg-blue-500'}`}
      data-testid="button-voice-input"
    >
      {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
```

**Files to modify:**
1. Create `VoiceChatInput.tsx` component
2. Add to chat input area
3. Wire transcript → chat input field

---

### **Step 3: Create Voice Toggle UI** (30 min)

**File:** `client/src/components/mr-blue/VoiceToggle.tsx` (create new)

```typescript
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceToggleProps {
  enabled: boolean;
  speaking: boolean;
  onToggle: () => void;
}

export function VoiceToggle({ enabled, speaking, onToggle }: VoiceToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
      data-testid="button-voice-toggle"
    >
      {enabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          {speaking && <span className="animate-pulse">Speaking...</span>}
        </>
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </Button>
  );
}
```

---

### **Step 4: Multilingual Support** (45 min)

**Use existing i18n setup:**

```typescript
import { useTranslation } from 'react-i18next';

function MrBlueChat() {
  const { i18n } = useTranslation();
  
  // Map i18n language to speech codes
  const languageMap = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    // ... all 68 languages from replit.md
  };
  
  const speechLang = languageMap[i18n.language] || 'en-US';
  
  // Pass to TTS/STT
  textToSpeech({ 
    text: message, 
    lang: speechLang 
  });
}
```

**Supported Languages (from replit.md):**
68 total languages including: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, Russian, and 56 more.

---

## 🔍 **Finding the Right Files**

### **Locate Mr Blue Chat Component:**
```bash
# Search for Mr Blue components
grep -r "MrBlue.*Chat" client/src/components/
grep -r "mr-blue" client/src/components/

# Check routes
grep "mr.blue\|mrblue" client/src/App.tsx
```

### **Verify Voice Infrastructure:**
```bash
# Check TTS exists
ls client/src/lib/voice/text-to-speech.ts

# Check STT exists  
ls client/src/lib/voice/speech-recognition.ts

# Check hooks
ls client/src/hooks/useVoiceOutput.ts
```

**All verified ✅ - infrastructure is ready!**

---

## 🧪 **Testing Checklist**

### **Voice Output (TTS)**
- [ ] Voice toggle button appears in chat
- [ ] Clicking toggle enables/disables voice
- [ ] AI responses are spoken when enabled
- [ ] Visual indicator shows "Speaking..." state
- [ ] Multiple languages work (test 3-5)

### **Voice Input (STT)**
- [ ] Microphone button appears
- [ ] Clicking starts/stops listening
- [ ] Transcript appears in chat input
- [ ] Can send voice message
- [ ] Multiple languages work

### **Edge Cases**
- [ ] Long responses (>1000 chars) - should speak in chunks
- [ ] Fast toggle on/off - no audio glitches
- [ ] Network issues - graceful degradation
- [ ] Browser compatibility (Chrome, Safari, Firefox)

---

## 🚀 **Quick Start (When Server Runs)**

### **Step-by-Step Execution:**

1. **Find Mr Blue chat file:**
   ```bash
   grep -r "MrBlue" client/src/components/ --include="*.tsx"
   ```

2. **Read the file:**
   ```bash
   read client/src/components/[found-file].tsx
   ```

3. **Add imports:**
   ```typescript
   import { useVoiceOutput } from '@/hooks/useVoiceOutput';
   import { textToSpeech } from '@/lib/voice/text-to-speech';
   ```

4. **Add voice state:**
   ```typescript
   const [voiceEnabled, setVoiceEnabled] = useState(false);
   ```

5. **Wire response → TTS:**
   ```typescript
   if (voiceEnabled) {
     textToSpeech({ text: aiResponse, lang: 'en-US' });
   }
   ```

6. **Test:**
   - Start server: `npm run dev`
   - Open Mr Blue chat
   - Toggle voice on
   - Send message
   - Hear AI response!

---

## 📊 **Expected Outcomes**

### **User Experience**
- **Before:** Text-only chat with Mr Blue
- **After:** Full voice conversation with Mr Blue
  - Speak to Mr Blue (like Siri/Alexa)
  - Mr Blue speaks back in 68 languages
  - Visual feedback (mic pulse, speaking indicator)

### **Technical Achievement**
- ✅ Voice I/O activated (matches Replit Agent 3)
- ✅ Multilingual support (surpasses most AI assistants)
- ✅ Accessibility improved (hands-free coding)
- ✅ Professional UX (visual indicators)

---

## 🔗 **Dependencies**

### **What Exists (No Install Needed):**
- ✅ Web Speech API (browser native)
- ✅ `useVoiceOutput.ts` hook
- ✅ `text-to-speech.ts` library
- ✅ `speech-recognition.ts` library
- ✅ `VoiceVisualizer.tsx` component

### **What's Needed (Already Installed):**
- ✅ React hooks
- ✅ i18next for language detection
- ✅ Lucide icons (Mic, Volume2, etc.)

**Total new dependencies:** 0  
**Just wire existing code!**

---

## 💡 **Pro Tips**

1. **Start with TTS** - Easier to test, immediate user value
2. **Test in Chrome first** - Best Web Speech API support
3. **Use localStorage** for voice preference - Remember user's choice
4. **Add keyboard shortcut** - Spacebar to trigger mic (like Google)
5. **Chunk long responses** - TTS works better with <500 char chunks

---

## 📝 **Code Snippets Reference**

### **TTS Quick Wire:**
```typescript
// In AI response handler
textToSpeech({
  text: response.content,
  lang: userLanguage,
  rate: 1.0, // speed
  pitch: 1.0, // tone
  volume: 1.0 // loudness
});
```

### **STT Quick Wire:**
```typescript
// In voice input component
const { transcript, startListening, stopListening } = useSpeechRecognition({
  language: 'en-US',
  continuous: false // stop after one sentence
});

// Send to chat when done
onTranscript(transcript);
```

### **Language Detection:**
```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const voiceLang = i18n.language === 'es' ? 'es-ES' : 'en-US';
```

---

## ✅ **Ready to Execute**

Everything is prepared. When the server runs:
1. **Read this document**
2. **Follow Step 1-4** in order
3. **Test thoroughly**
4. **Mark complete!**

**Time estimate:** 2-3 hours total  
**Complexity:** Low (wiring existing code)  
**Impact:** HIGH (full voice AI assistant!)

---

**Status:** 🟡 Ready to build (waiting for server)  
**Next:** Fix npm/esbuild blocker, then execute this plan
