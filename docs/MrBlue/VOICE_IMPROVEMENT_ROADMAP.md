# Voice Improvement Roadmap - Fix Horrible Voice Quality

**Date**: October 22, 2025  
**Status**: Implementation Guide  
**Priority**: HIGH - Current voice is "horrible"  
**Methodology**: MB.MD (Mapping→Breakdown→Mitigation→Deployment)

---

## 🎯 **Problem Statement**

**Current State**: Voice mode works but uses browser SpeechSynthesis API  
**User Feedback**: "the one you gave me is horrible"  
**Root Cause**: Browser TTS is robotic, unnatural, poor quality

**Goal**: Replace with professional, natural-sounding AI voices

---

## 📋 **MB.MD Phase 1: MAPPING**

### **What Exists**
✅ Voice mode toggle (ON/OFF button)  
✅ Speech-to-text (browser Web Speech API)  
✅ Text-to-speech (browser SpeechSynthesis - HORRIBLE)  
✅ Auto-speak functionality  
✅ VoiceControls component  

### **What's Broken**
❌ Voice quality: Robotic, mechanical, unnatural  
❌ No voice options (stuck with system default)  
❌ No premium TTS integration  

### **What We Need**
✅ Professional TTS API (OpenAI recommended)  
✅ Multiple natural voices (6+ options)  
✅ Voice selector UI  
✅ Fast response (<500ms latency)  

---

## 📋 **MB.MD Phase 2: BREAKDOWN**

### **Task List**

1. **Backend: OpenAI TTS Integration**
   - Add `/api/tts/synthesize` endpoint
   - Handle audio streaming
   - Error handling + fallbacks

2. **Frontend: Voice Selector**
   - Update `useVoiceOutput.ts` hook
   - Create voice selector dropdown
   - Add voice preview feature

3. **Settings: Voice Preferences**
   - Voice selection persistence
   - Speed/pitch controls (optional)
   - Test playback

4. **Testing: Quality Assurance**
   - Test all 6 voices
   - Test latency
   - Test mobile playback

---

## 📋 **MB.MD Phase 3: MITIGATION** (Implementation)

### **Step 1: Backend - OpenAI TTS Endpoint**

**File**: `server/routes/ttsRoutes.ts` (NEW)

```typescript
import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Synthesize text to speech
router.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, voice = 'nova', model = 'tts-1' } = req.body;
    
    // Validate input
    if (!text || text.length > 4096) {
      return res.status(400).json({ error: 'Invalid text length' });
    }
    
    // Valid voices
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ error: 'Invalid voice' });
    }
    
    // Generate speech
    const mp3 = await openai.audio.speech.create({
      model, // 'tts-1' or 'tts-1-hd'
      voice,
      input: text,
      speed: 1.0,
    });
    
    // Stream audio back
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
    
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// Get available voices
router.get('/api/tts/voices', (req, res) => {
  res.json({
    voices: [
      { id: 'nova', name: 'Nova', gender: 'female', description: 'Energetic, friendly' },
      { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced, neutral' },
      { id: 'echo', name: 'Echo', gender: 'male', description: 'Clear, professional' },
      { id: 'fable', name: 'Fable', gender: 'male', description: 'Warm, British accent' },
      { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Deep, authoritative' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Soft, gentle' },
    ],
  });
});

export default router;
```

**File**: `server/index.ts` (UPDATE - add route)

```typescript
import ttsRoutes from './routes/ttsRoutes';

// Add after other routes
app.use(ttsRoutes);
```

---

### **Step 2: Frontend - Update Voice Output Hook**

**File**: `client/src/hooks/useVoiceOutput.ts` (UPDATE)

```typescript
import { useState, useCallback } from 'react';

export interface VoiceSettings {
  voice: string; // 'nova', 'alloy', 'echo', 'fable', 'onyx', 'shimmer'
  usePremium: boolean; // true = OpenAI TTS, false = browser fallback
  speed: number;
}

export function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('mrBlue_voiceSettings');
    return saved ? JSON.parse(saved) : {
      voice: 'nova',
      usePremium: true, // Default to OpenAI
      speed: 1.0,
    };
  });

  // Speak using OpenAI TTS (PREMIUM)
  const speakWithOpenAI = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.voice,
          model: 'tts-1-hd', // High quality
        }),
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowser(text);
    }
  }, [settings.voice]);

  // Speak using browser (FALLBACK)
  const speakWithBrowser = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speed;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  }, [settings.speed]);

  // Main speak function
  const speak = useCallback((text: string) => {
    // Stop any current speech
    stop();
    
    // Use premium or fallback
    if (settings.usePremium) {
      speakWithOpenAI(text);
    } else {
      speakWithBrowser(text);
    }
  }, [settings.usePremium, speakWithOpenAI, speakWithBrowser]);

  // Stop speaking
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('mrBlue_voiceSettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    settings,
    updateSettings,
  };
}
```

---

### **Step 3: Frontend - Voice Selector UI**

**File**: `client/src/components/mrBlue/VoiceSelector.tsx` (NEW)

```typescript
import { Volume2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { useState, useEffect } from 'react';

interface Voice {
  id: string;
  name: string;
  gender: string;
  description: string;
}

export function VoiceSelector() {
  const { settings, updateSettings, speak } = useVoiceOutput();
  const [voices, setVoices] = useState<Voice[]>([]);

  // Load available voices
  useEffect(() => {
    fetch('/api/tts/voices')
      .then(res => res.json())
      .then(data => setVoices(data.voices))
      .catch(console.error);
  }, []);

  // Test voice
  const testVoice = () => {
    speak('Hello! This is how I sound.');
  };

  return (
    <div className="space-y-4 p-4 bg-white/50 rounded-lg border border-cyan-200">
      <h3 className="font-semibold flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        Voice Settings
      </h3>

      {/* Premium Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Premium Voice</Label>
          <p className="text-xs text-gray-500">
            High-quality AI voices (uses OpenAI)
          </p>
        </div>
        <Switch
          checked={settings.usePremium}
          onCheckedChange={(checked) => updateSettings({ usePremium: checked })}
          data-testid="switch-premium-voice"
        />
      </div>

      {/* Voice Selector */}
      {settings.usePremium && (
        <div className="space-y-2">
          <Label>Voice</Label>
          <Select
            value={settings.voice}
            onValueChange={(voice) => updateSettings({ voice })}
          >
            <SelectTrigger data-testid="select-voice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-gray-500">
                      ({voice.gender})
                    </span>
                    <span className="text-xs text-gray-400">
                      - {voice.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Test Button */}
      <Button
        onClick={testVoice}
        variant="outline"
        className="w-full gap-2"
        data-testid="button-test-voice"
      >
        <Sparkles className="h-4 w-4" />
        Test Voice
      </Button>
    </div>
  );
}
```

---

### **Step 4: Integration - Wire to ChatInterface**

**File**: `client/src/components/mrBlue/ChatInterface.tsx` (UPDATE)

```typescript
import { VoiceSelector } from './VoiceSelector';

// Add to settings area (or separate settings modal)
<div className="p-4 space-y-4">
  <VoiceSelector />
</div>
```

---

### **Step 5: Update VoiceControls to Use New Hook**

**File**: `client/src/components/mrBlue/VoiceControls.tsx` (UPDATE)

```typescript
import { useVoiceOutput } from '@/hooks/useVoiceOutput';

export function VoiceControls({ onTranscript, lastMessage, autoSpeak }: Props) {
  const { speak, isSpeaking } = useVoiceOutput(); // Use updated hook
  
  // Auto-speak when new message arrives
  useEffect(() => {
    if (autoSpeak && lastMessage && !isSpeaking) {
      speak(lastMessage); // Now uses OpenAI TTS!
    }
  }, [autoSpeak, lastMessage, speak, isSpeaking]);
  
  // Manual speak button
  const handleSpeak = () => {
    if (lastMessage) {
      speak(lastMessage);
    }
  };
  
  // ... rest of component
}
```

---

## 📋 **MB.MD Phase 4: DEPLOYMENT**

### **Deployment Checklist**

**Backend:**
- [ ] Add `OPENAI_API_KEY` to secrets (already exists)
- [ ] Create `server/routes/ttsRoutes.ts`
- [ ] Register routes in `server/index.ts`
- [ ] Test `/api/tts/synthesize` endpoint
- [ ] Test `/api/tts/voices` endpoint

**Frontend:**
- [ ] Update `useVoiceOutput.ts` hook
- [ ] Create `VoiceSelector.tsx` component
- [ ] Wire VoiceSelector to ChatInterface
- [ ] Update VoiceControls to use new hook
- [ ] Test voice selector dropdown
- [ ] Test premium toggle
- [ ] Test all 6 voices

**Testing:**
- [ ] Enable voice mode
- [ ] Select each voice (nova, alloy, echo, fable, onyx, shimmer)
- [ ] Test "Test Voice" button
- [ ] Test auto-speak with each voice
- [ ] Test manual speak button
- [ ] Test premium toggle (ON/OFF)
- [ ] Test fallback to browser TTS
- [ ] Test on mobile
- [ ] Test latency (<500ms target)

**Documentation:**
- [ ] Update voice mode documentation
- [ ] Add voice selection guide
- [ ] Update user onboarding

---

## 🎯 **Expected Results**

**Before** (Current):
- ❌ Robotic, horrible voice
- ❌ No options
- ❌ Poor quality

**After** (Upgraded):
- ✅ 6 natural AI voices
- ✅ Professional quality
- ✅ Voice selector UI
- ✅ Fast response (<500ms)
- ✅ Premium toggle (OpenAI vs browser)
- ✅ Test voice feature

---

## 💰 **Cost Impact**

**OpenAI TTS Pricing:**
- $15 per 1M characters
- Average response: 200 characters
- 100 interactions/day = 20K chars
- Daily cost: $0.30
- **Monthly: ~$9 for active user**

**Optimization:**
- Use `tts-1` for testing (standard quality)
- Use `tts-1-hd` for production (high quality)
- Cache common responses (optional)
- Rate limiting (prevent abuse)

---

## 🚀 **Timeline**

**Day 1: Backend**
- Create TTS routes
- Test OpenAI API
- Deploy endpoints

**Day 2: Frontend**
- Update voice hook
- Create voice selector
- Wire to ChatInterface

**Day 3: Testing**
- Test all voices
- Test auto-speak
- Mobile testing

**Day 4: Polish**
- Fix bugs
- Optimize latency
- Update docs

**Total**: 4 days to production-quality voices

---

## 📊 **Voice Quality Comparison**

| Voice | Gender | Style | Best For |
|-------|--------|-------|----------|
| **Nova** ⭐ | Female | Energetic, friendly | Default (recommended) |
| **Alloy** | Neutral | Balanced, professional | Business use |
| **Echo** | Male | Clear, articulate | Professional settings |
| **Fable** | Male | Warm, British accent | Storytelling |
| **Onyx** | Male | Deep, authoritative | Leadership, commands |
| **Shimmer** | Female | Soft, gentle | Empathetic conversations |

**User Recommendation**: Start with **Nova** (most popular, friendly tone)

---

## ✅ **Success Criteria**

- [ ] User can select from 6 voices
- [ ] Voice quality is professional (not robotic)
- [ ] Latency <500ms (fast response)
- [ ] Premium toggle works (ON/OFF)
- [ ] Settings persist across sessions
- [ ] Auto-speak uses selected voice
- [ ] Manual speak uses selected voice
- [ ] Test voice button works
- [ ] Mobile playback works
- [ ] No "horrible" feedback from users! 🎉

---

## 📝 **Files to Create/Modify**

**New Files:**
- `server/routes/ttsRoutes.ts`
- `client/src/components/mrBlue/VoiceSelector.tsx`

**Modified Files:**
- `server/index.ts` (add routes)
- `client/src/hooks/useVoiceOutput.ts` (upgrade hook)
- `client/src/components/mrBlue/VoiceControls.tsx` (use new hook)
- `client/src/components/mrBlue/ChatInterface.tsx` (add VoiceSelector)

**Total Changes**: 6 files (2 new, 4 modified)

---

## 🎉 **Final Result**

**User Experience:**
1. Open Mr Blue chat
2. Click voice settings
3. Toggle "Premium Voice" ON
4. Select voice (e.g., "Nova - Energetic, friendly")
5. Click "Test Voice" → Hear natural AI voice
6. Enable voice mode → AI speaks with selected voice
7. No more robotic, horrible voice! 🎊

**Mission Complete**: Professional, natural AI voices for Mr Blue! 🚀
