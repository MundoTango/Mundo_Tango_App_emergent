/**
 * Media Upload & Analysis Routes
 * Handles image/video/audio uploads with AI analysis
 * MB.MD Track 4: Media Upload - Oct 21, 2025
 */

import { Router, type Request, Response } from 'express';
import multer from 'multer';
import { huggingFaceService } from '../services/huggingFaceService';
import sharp from 'sharp';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * POST /api/media/upload - Upload and analyze media
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const file = req.file;
    const fileType = file.mimetype.split('/')[0]; // image, video, audio

    let analysis: any = {};

    // Analyze based on file type
    if (fileType === 'image') {
      // Optimize image
      const optimized = await sharp(file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Convert to base64 for storage/display
      const base64 = optimized.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // AI Analysis
      try {
        const imageAnalysis = await huggingFaceService.analyzeImage(dataUrl);
        analysis = {
          type: 'image',
          labels: imageAnalysis.labels,
          size: optimized.length,
          dimensions: await sharp(optimized).metadata(),
        };
      } catch (error) {
        console.error('[Media] Image analysis failed:', error);
        analysis = { type: 'image', error: 'Analysis failed' };
      }

      res.json({
        url: dataUrl,
        analysis,
      });
    } else if (fileType === 'audio') {
      // Audio transcription
      try {
        const audioBlob = new Blob([file.buffer], { type: file.mimetype });
        const transcription = await huggingFaceService.transcribeAudio(audioBlob);
        
        analysis = {
          type: 'audio',
          transcription: transcription.text,
          size: file.size,
        };

        res.json({
          url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          analysis,
        });
      } catch (error) {
        console.error('[Media] Audio transcription failed:', error);
        res.status(500).json({ error: 'Audio processing failed' });
      }
    } else {
      // Unsupported file type
      res.status(400).json({ error: 'Unsupported file type' });
    }
  } catch (error) {
    console.error('[Media] Upload error:', error);
    res.status(500).json({ error: 'Failed to process media' });
  }
});

/**
 * POST /api/media/analyze-url - Analyze image from URL
 */
router.post('/analyze-url', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const analysis = await huggingFaceService.analyzeImage(url);
    res.json(analysis);
  } catch (error) {
    console.error('[Media] URL analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
