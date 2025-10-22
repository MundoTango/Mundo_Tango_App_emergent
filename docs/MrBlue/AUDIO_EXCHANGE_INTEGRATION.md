# Audio Exchange Integration Guide - All AI Models

**Date**: October 22, 2025  
**Status**: Reference Guide for Voice Conversations  
**Methodology**: MB.MD (Mapping→Breakdown→Mitigation→Deployment)

---

## 🎙️ **Overview**

Guide for implementing voice conversations with Claude, GPT-4o, Gemini, and other AI models. Covers both directions:
- **Speech-to-Text (STT)**: User speaks → AI understands
- **Text-to-Speech (TTS)**: AI responds → User hears

---

## 🤖 **Model-Specific Audio Capabilities**

### **1. Claude (Anthropic)**

**Current Implementation**: ✅ **ACTIVE IN MR BLUE**

**Audio Support:**
- ❌ **No native audio input** - Claude doesn't process audio directly
- ✅ **Text-based only** - Requires STT preprocessing
- ✅ **Streaming text responses** - Perfect for TTS conversion

**How We Use It:**
```typescript
// STT: Browser → Text → Claude
const transcript = await speechRecognition.start(); // Browser Web Speech API
const response = await fetch('/api/chat/projects', {
  body: JSON.stringify({ message: transcript, model: 'claude-3-sonnet' })
});

// TTS: Claude → Text → Voice
const aiResponse = await response.text();
speechSynthesis.speak(new SpeechSynthesisUtterance(aiResponse));
```

**Integration Pattern:**
```
User Voice → Web Speech API (STT) → Text → Claude API → Text Response → TTS API → Audio Output
```

**Best For:**
- Long-form conversations
- Complex reasoning tasks
- Tool use with voice commands
- Document analysis via voice

**Limitations:**
- No audio input understanding (can't process tone, emotion, accent nuances)
- Requires separate STT/TTS services

---

### **2. GPT-4o (OpenAI)**

**Audio Support:**
- ✅ **Native audio input** - Understands speech directly (GPT-4o Audio Preview)
- ✅ **Native audio output** - Can generate speech responses
- ✅ **Real-time API** - WebSocket-based voice conversations
- ✅ **Streaming responses** - Low latency

**Native Audio API (Recommended):**
```typescript
// OpenAI Realtime API - Direct audio exchange
import { RealtimeClient } from '@openai/realtime-api-beta';

const client = new RealtimeClient({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-realtime-preview',
});

// Connect WebSocket
await client.connect();

// Send audio directly
client.sendUserMessageContent([{
  type: 'input_audio',
  audio: base64AudioData, // Raw audio bytes
}]);

// Receive audio directly
client.on('conversation.item.completed', (event) => {
  const audioOutput = event.item.audio; // Direct audio response
  playAudio(audioOutput);
});
```

**Text-Based Alternative:**
```typescript
// STT preprocessing if needed
const transcript = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
});

// Text completion
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: transcript.text }],
});

// TTS output
const speech = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
  input: response.choices[0].message.content,
});
```

**Integration Pattern:**
```
NATIVE: User Voice → GPT-4o Audio API → AI Voice (end-to-end)
HYBRID: User Voice → Whisper STT → GPT-4o Text → TTS-1 → AI Voice
```

**Best For:**
- Real-time voice conversations
- Low-latency responses
- Natural voice interactions
- Voice assistants

**Voices Available:**
- `alloy` - Neutral, balanced
- `echo` - Clear, professional
- `fable` - Warm, expressive
- `onyx` - Deep, authoritative
- `nova` - Energetic, youthful
- `shimmer` - Soft, gentle

---

### **3. Gemini (Google)**

**Audio Support:**
- ✅ **Native audio input** - Can process audio directly
- ❌ **No native audio output** - Text responses only
- ✅ **Multimodal input** - Audio + text + images simultaneously
- ✅ **Streaming responses** - Text streaming available

**Audio Input API:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Send audio directly
const audioPart = {
  inlineData: {
    mimeType: 'audio/wav',
    data: base64AudioData,
  },
};

const result = await model.generateContent([
  'What is being said in this audio?',
  audioPart,
]);

// Get text response
const response = result.response.text();

// Use external TTS for voice output
await textToSpeech(response);
```

**Integration Pattern:**
```
User Voice → Gemini Audio API → Text Response → External TTS → AI Voice
```

**Best For:**
- Multimodal analysis (audio + visual)
- Audio transcription with context
- Long audio processing
- Multiple input types simultaneously

**Limitations:**
- No native voice output (need external TTS)
- Text responses require TTS conversion

---

## 🎤 **Text-to-Speech (TTS) Options**

### **Current (Browser Native) - ACTIVE**
```typescript
// What we currently use (basic, robotic)
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 1.0;
utterance.pitch = 1.0;
utterance.volume = 1.0;
speechSynthesis.speak(utterance);
```

**Pros**: Free, no API, works offline  
**Cons**: ❌ **HORRIBLE QUALITY** - Robotic, unnatural, limited voices

---

### **Option 1: ElevenLabs (RECOMMENDED - Best Quality)**

**Quality**: ⭐⭐⭐⭐⭐ (Most natural, human-like)  
**Cost**: $5/mo (30k chars), $22/mo (100k chars), $99/mo (500k chars)  
**Latency**: ~300-500ms  

```typescript
// ElevenLabs API
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam (clear male)

async function elevenLabsTTS(text: string): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2', // Fastest, lowest latency
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );
  
  return await response.arrayBuffer();
}

// Usage
const audioData = await elevenLabsTTS('Hello from Mr Blue!');
const audio = new Audio(URL.createObjectURL(new Blob([audioData])));
audio.play();
```

**Popular Voices:**
- `pNInz6obpgDQGcFmaJgB` - Adam (clear, professional male)
- `EXAVITQu4vr4xnSDxMaL` - Bella (warm, friendly female)
- `ErXwobaYiN019PkySvjV` - Antoni (calm, narrator male)
- `VR6AewLTigWG4xSOukaG` - Arnold (deep, authoritative)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (energetic, youthful female)

**Best For**: Production apps, premium experience, natural conversations

---

### **Option 2: OpenAI TTS (RECOMMENDED - Good Balance)**

**Quality**: ⭐⭐⭐⭐ (Very good, natural)  
**Cost**: $15/1M chars ($0.015 per 1K chars)  
**Latency**: ~200-400ms  

```typescript
// OpenAI TTS API
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function openAiTTS(text: string, voice: string = 'alloy'): Promise<ArrayBuffer> {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1', // or 'tts-1-hd' for higher quality
    voice: voice, // alloy, echo, fable, onyx, nova, shimmer
    input: text,
    speed: 1.0, // 0.25 to 4.0
  });
  
  return await mp3.arrayBuffer();
}

// Usage
const audioData = await openAiTTS('Hello from Mr Blue!', 'nova');
const audio = new Audio(URL.createObjectURL(new Blob([audioData])));
audio.play();
```

**Voices:**
- `alloy` - Balanced, neutral (good default)
- `echo` - Clear, professional
- `fable` - Warm, British accent
- `onyx` - Deep, authoritative male
- `nova` - Energetic, friendly female
- `shimmer` - Soft, gentle female

**Models:**
- `tts-1` - Standard quality, faster
- `tts-1-hd` - Higher quality, slightly slower

**Best For**: Cost-effective, good quality, OpenAI ecosystem integration

---

### **Option 3: Google Cloud TTS**

**Quality**: ⭐⭐⭐⭐ (Very good, many languages)  
**Cost**: $4/1M chars  
**Latency**: ~300-600ms  

```typescript
// Google Cloud TTS
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient();

async function googleTTS(text: string): Promise<Buffer> {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-J', // Natural female voice
      ssmlGender: 'FEMALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0,
    },
  });
  
  return response.audioContent as Buffer;
}
```

**Best Voices:**
- `en-US-Neural2-J` - Natural female (Journey voice)
- `en-US-Neural2-D` - Natural male
- `en-US-Wavenet-A` - High-quality female
- `en-US-Studio-O` - Studio quality female

**Best For**: Multilingual apps, Google Cloud users, many language options

---

### **Option 4: Azure Speech (Microsoft)**

**Quality**: ⭐⭐⭐⭐ (Excellent, neural voices)  
**Cost**: Free tier: 500K chars/month, then $16/1M chars  
**Latency**: ~250-450ms  

```typescript
// Azure Speech
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

async function azureTTS(text: string): Promise<ArrayBuffer> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_REGION
  );
  
  speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
  
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      result => resolve(result.audioData),
      error => reject(error)
    );
  });
}
```

**Best Voices:**
- `en-US-JennyNeural` - Professional female
- `en-US-GuyNeural` - Professional male
- `en-US-AriaNeural` - Warm, friendly female
- `en-US-DavisNeural` - Clear, authoritative male

**Best For**: Enterprise, Microsoft ecosystem, free tier

---

## 🎯 **Recommended Integration for Mr Blue**

### **Phase 1: Immediate (Current)**
```typescript
// Browser SpeechSynthesis (ACTIVE - but horrible quality)
// Location: client/src/hooks/useVoiceOutput.ts
const utterance = new SpeechSynthesisUtterance(text);
speechSynthesis.speak(utterance);
```

**Status**: ✅ Working but poor quality

---

### **Phase 2: Premium Upgrade (RECOMMENDED)**

**Best Option: OpenAI TTS** (Good balance of quality, cost, integration)

```typescript
// Backend: server/routes/ttsRoutes.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/api/tts/synthesize', async (req, res) => {
  const { text, voice = 'nova' } = req.body;
  
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice,
    input: text,
  });
  
  const buffer = Buffer.from(await mp3.arrayBuffer());
  res.set('Content-Type', 'audio/mpeg');
  res.send(buffer);
});

// Frontend: client/src/hooks/useVoiceOutput.ts
async function speakWithOpenAI(text: string, voice: string = 'nova') {
  const response = await fetch('/api/tts/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });
  
  const audioBlob = await response.blob();
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
}
```

**Why OpenAI TTS:**
- ✅ Already using OpenAI API (existing integration)
- ✅ Cost-effective ($15/1M characters)
- ✅ 6 natural voices (nova, alloy, echo, fable, onyx, shimmer)
- ✅ Low latency (~300ms)
- ✅ HD quality option
- ✅ Simple API, easy integration

---

### **Phase 3: Premium Option (Optional)**

**ElevenLabs for Ultra-Realistic Voices**

```typescript
// For users who want the best possible voice quality
// Requires separate API key: ELEVENLABS_API_KEY

async function speakWithElevenLabs(text: string, voiceId: string) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
      }),
    }
  );
  
  const audioBlob = await response.blob();
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
}
```

---

## 📊 **TTS Comparison Matrix**

| Provider | Quality | Cost | Latency | Voices | Best For |
|----------|---------|------|---------|--------|----------|
| **Browser** | ⭐⭐ | Free | Instant | Limited | Testing only |
| **OpenAI** | ⭐⭐⭐⭐ | $15/1M | 300ms | 6 | **Production (Recommended)** |
| **ElevenLabs** | ⭐⭐⭐⭐⭐ | $5-99/mo | 400ms | 100+ | Premium apps |
| **Google** | ⭐⭐⭐⭐ | $4/1M | 500ms | 50+ | Multilingual |
| **Azure** | ⭐⭐⭐⭐ | Free→$16/1M | 350ms | 75+ | Enterprise |

---

## 🎨 **Voice Personality Matching**

**Map Mr Blue personalities to TTS voices:**

```typescript
const VOICE_PERSONALITIES = {
  // OpenAI TTS voices
  friendly: 'nova',      // Energetic, warm
  professional: 'echo',  // Clear, business-like
  empathetic: 'shimmer', // Soft, caring
  creative: 'fable',     // Expressive, storytelling
  analytical: 'onyx',    // Deep, authoritative
  balanced: 'alloy',     // Neutral default
  
  // ElevenLabs voices (if integrated)
  premium_friendly: 'Bella',
  premium_professional: 'Adam',
  premium_narrator: 'Antoni',
};

// Usage in VoiceControls
function VoiceControls({ personality }: { personality: PersonalityMode }) {
  const voice = VOICE_PERSONALITIES[personality] || 'nova';
  
  const speak = async (text: string) => {
    await fetch('/api/tts/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, voice }),
    });
  };
}
```

---

## 🚀 **Implementation Roadmap**

### **Week 1: OpenAI TTS Integration**
1. Add `/api/tts/synthesize` endpoint
2. Update `useVoiceOutput.ts` hook
3. Add voice selector in UI (6 voices)
4. Test with voice mode

### **Week 2: Voice Settings Panel**
1. Create VoiceSettings component
2. Add voice preview (test each voice)
3. Add speed/pitch controls
4. Save preferences to localStorage

### **Week 3: ElevenLabs (Optional Premium)**
1. Add ElevenLabs integration
2. Premium voice tier (super admins only)
3. Voice cloning option
4. Custom voice upload

---

## 🔧 **Testing Checklist**

**Before deploying voice changes:**
- [ ] Test all 6 OpenAI voices
- [ ] Test with different text lengths
- [ ] Test with voice mode ON/OFF
- [ ] Test audio playback on mobile
- [ ] Test concurrent audio requests
- [ ] Test error handling (API down)
- [ ] Test voice preference persistence
- [ ] Measure latency (target <500ms)

---

## 💡 **Cost Estimation**

**OpenAI TTS Pricing:**
- Average AI response: ~200 characters
- 100 voice interactions/day = 20K chars
- Cost: 20K × $0.015/1K = **$0.30/day**
- Monthly: **~$9/month** for active user

**Optimization:**
- Cache common responses
- Use `tts-1` (standard) for testing
- Use `tts-1-hd` (HD) for production
- Implement rate limiting

---

## 📋 **Integration Requirements**

**Backend:**
- `OPENAI_API_KEY` secret (already have)
- `/api/tts/synthesize` endpoint
- Audio streaming support
- Error handling + fallbacks

**Frontend:**
- Update `useVoiceOutput.ts`
- Add voice selector UI
- Audio playback handling
- Loading states

**Database:**
- User voice preferences table
- Voice usage analytics
- Premium voice access control

---

## ✅ **Next Steps**

1. **Immediate**: Switch from browser to OpenAI TTS
2. **Week 1**: Deploy 6-voice system
3. **Week 2**: Add voice settings panel
4. **Week 3**: Optional ElevenLabs premium tier

**Expected Result**: Professional, natural voice conversations that don't sound horrible! 🎉
