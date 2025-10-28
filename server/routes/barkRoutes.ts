/**
 * BARK TTS ROUTES - Text-to-Speech API
 * Voice Mode Week 2: Bark TTS endpoints
 * Replaces OpenAI TTS ($15/1M chars) with $0 cost
 * 
 * Created: October 28, 2025
 */

import express, { type Request, type Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { BarkService, BARK_VOICE_PRESETS } from '../services/voice/BarkService';

const router = express.Router();
const barkService = new BarkService();

/**
 * POST /api/bark/synthesize
 * Synthesize text to speech using Bark TTS
 * 
 * Body:
 * {
 *   text: string;
 *   voicePreset?: string; // Default: v2/en_speaker_1
 *   temperature?: number; // Default: 0.7
 *   outputFormat?: 'wav' | 'mp3'; // Default: wav
 * }
 * 
 * Response: Audio file (binary)
 */
router.post('/synthesize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { text, voicePreset, temperature, outputFormat } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 10000) {
      return res.status(400).json({ error: 'Text too long (max 10,000 characters)' });
    }

    console.log(`🎵 [Bark/Synthesize] Generating audio for text: "${text.substring(0, 50)}..."`);

    const audioBuffer = await barkService.synthesize(text, {
      voicePreset,
      temperature,
      outputFormat
    });

    // Set appropriate headers
    const mimeType = outputFormat === 'mp3' ? 'audio/mpeg' : 'audio/wav';
    res.set('Content-Type', mimeType);
    res.set('Content-Disposition', `attachment; filename="bark-output.${outputFormat || 'wav'}"`);

    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ [Bark/Synthesize] Error:', error);
    res.status(500).json({ 
      error: 'Text-to-speech synthesis failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/bark/voices
 * List available Bark voice presets
 */
router.get('/voices', authMiddleware, (req: Request, res: Response) => {
  res.json({
    voices: BARK_VOICE_PRESETS,
    count: BARK_VOICE_PRESETS.length,
    languages: ['en', 'es'],
    recommendation: 'v2/en_speaker_1 (English Female 1) for best balance of quality and naturalness'
  });
});

/**
 * GET /api/bark/status
 * Check Bark TTS service status
 */
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  const isReady = await barkService.isReady();

  res.json({
    status: isReady ? 'operational' : 'not_installed',
    service: 'Bark TTS',
    version: '1.0.0 (Week 2 Placeholder)',
    ready: isReady,
    message: isReady 
      ? 'Bark TTS is installed and operational' 
      : 'Bark TTS not installed - Week 2 deliverable pending',
    migration: {
      phase: 'Week 2: Bark TTS Integration',
      status: 'In Progress',
      nextPhase: 'Week 3: Unified Pipeline',
      costSavings: '$15/1M chars → $0 (FREE)'
    }
  });
});

/**
 * POST /api/bark/cost-estimate
 * Calculate cost savings for given text
 * 
 * Body:
 * {
 *   text: string;
 * }
 */
router.post('/cost-estimate', authMiddleware, (req: Request, res: Response) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  const characterCount = text.length;
  const costSavings = barkService.getCostSavings(characterCount);

  res.json({
    characterCount,
    estimatedDuration: `${Math.ceil(characterCount / 15)} seconds`, // ~15 chars/sec speaking rate
    costComparison: costSavings,
    annualSavings: {
      at1000Users: '$15,000/year',
      at10000Users: '$150,000/year',
      at100000Users: '$1,500,000/year'
    }
  });
});

export default router;
