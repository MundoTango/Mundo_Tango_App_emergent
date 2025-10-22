import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Valid voice options
const VALID_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
type VoiceType = typeof VALID_VOICES[number];

/**
 * POST /api/tts/synthesize
 * Convert text to speech using OpenAI TTS
 */
router.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, voice = 'nova', model = 'tts-1-hd' } = req.body;
    
    // Validate text
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 4096) {
      return res.status(400).json({ error: 'Text too long (max 4096 characters)' });
    }
    
    // Validate voice
    if (!VALID_VOICES.includes(voice as VoiceType)) {
      return res.status(400).json({ 
        error: 'Invalid voice',
        validVoices: VALID_VOICES 
      });
    }
    
    // Validate model
    if (model !== 'tts-1' && model !== 'tts-1-hd') {
      return res.status(400).json({ 
        error: 'Invalid model. Use tts-1 or tts-1-hd' 
      });
    }
    
    console.log(`[TTS] Generating speech: ${text.slice(0, 50)}... (voice: ${voice}, model: ${model})`);
    
    // Generate speech
    const mp3 = await openai.audio.speech.create({
      model,
      voice: voice as VoiceType,
      input: text,
      speed: 1.0,
    });
    
    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    console.log(`[TTS] Generated ${buffer.length} bytes of audio`);
    
    // Send audio response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    });
    
    res.send(buffer);
    
  } catch (error: any) {
    console.error('[TTS] Error:', error);
    
    // Handle OpenAI API errors
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'OpenAI API key invalid or missing' 
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      error: 'TTS generation failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/tts/voices
 * Get list of available voices with metadata
 */
router.get('/api/tts/voices', (req, res) => {
  const voices = [
    {
      id: 'nova',
      name: 'Nova',
      gender: 'female',
      description: 'Energetic, friendly',
      recommended: true,
    },
    {
      id: 'alloy',
      name: 'Alloy',
      gender: 'neutral',
      description: 'Balanced, neutral',
      recommended: false,
    },
    {
      id: 'echo',
      name: 'Echo',
      gender: 'male',
      description: 'Clear, professional',
      recommended: false,
    },
    {
      id: 'fable',
      name: 'Fable',
      gender: 'male',
      description: 'Warm, British accent',
      recommended: false,
    },
    {
      id: 'onyx',
      name: 'Onyx',
      gender: 'male',
      description: 'Deep, authoritative',
      recommended: false,
    },
    {
      id: 'shimmer',
      name: 'Shimmer',
      gender: 'female',
      description: 'Soft, gentle',
      recommended: false,
    },
  ];
  
  res.json({ voices });
});

/**
 * POST /api/tts/test
 * Test endpoint to verify TTS is working
 */
router.post('/api/tts/test', async (req, res) => {
  try {
    const { voice = 'nova' } = req.body;
    
    const testText = 'Hello! This is a test of the OpenAI text to speech system.';
    
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as VoiceType,
      input: testText,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
    });
    
    res.send(buffer);
    
  } catch (error: any) {
    console.error('[TTS Test] Error:', error);
    res.status(500).json({ error: 'TTS test failed', message: error.message });
  }
});

export default router;
