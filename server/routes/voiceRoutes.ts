// TRACK 3: Voice API Routes
import { Router } from 'express';
import { db } from '../db';
import { voiceSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { speechService } from '../services/SpeechService';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get user voice settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [settings] = await db
      .select()
      .from(voiceSettings)
      .where(eq(voiceSettings.userId, userId))
      .limit(1);

    if (!settings) {
      // Create default settings
      const [newSettings] = await db
        .insert(voiceSettings)
        .values({ userId })
        .returning();
      return res.json(newSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('[Voice Settings] Get error:', error);
    res.status(500).json({ error: 'Failed to get voice settings' });
  }
});

// Update voice settings
router.put('/settings', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [updated] = await db
      .update(voiceSettings)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(voiceSettings.userId, userId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('[Voice Settings] Update error:', error);
    res.status(500).json({ error: 'Failed to update voice settings' });
  }
});

// Text-to-Speech (OpenAI fallback)
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audio = await speechService.synthesizeSpeech(text, voice);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (error) {
    console.error('[Voice] TTS error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

// Speech-to-Text (Whisper)
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const { language } = req.body;

    if (!speechService.isValidAudioFormat(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid audio format' });
    }

    const transcription = await speechService.transcribeAudio(
      req.file.buffer,
      language
    );

    res.json({ text: transcription });
  } catch (error) {
    console.error('[Voice] STT error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Get available voices
router.get('/voices', (req, res) => {
  res.json(speechService.getAvailableVoices());
});

export default router;
