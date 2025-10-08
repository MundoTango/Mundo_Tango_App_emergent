/**
 * ESA 61x21 - Content & Media Expert API Routes
 * Agent 13: Image optimization, video processing, media management
 */

import { Router } from 'express';

const router = Router();

// In-memory reference to the Content Media Expert agent
let contentMediaExpertAgent: any = null;

export function setContentMediaExpertAgent(agent: any) {
  contentMediaExpertAgent = agent;
}

/**
 * GET /api/content-media/status
 * Get agent status and capabilities
 */
router.get('/status', async (req, res) => {
  try {
    if (!contentMediaExpertAgent) {
      return res.status(503).json({ error: 'Content Media Expert not initialized' });
    }

    res.json({
      agent: 'Content & Media Expert',
      status: 'operational',
      capabilities: [
        'Image optimization (WebP conversion, compression)',
        'Video processing (transcoding, thumbnails)',
        'Media usage analysis',
        'Format recommendations',
      ],
      tools: ['Sharp', 'FFmpeg.wasm', 'Imagemin', 'Pexels API'],
      layers: [25, 26, 58],
    });
  } catch (error) {
    console.error('[Content Media Expert] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * POST /api/content-media/optimize-image
 * Optimize a single image
 */
router.post('/optimize-image', async (req, res) => {
  try {
    if (!contentMediaExpertAgent) {
      return res.status(503).json({ error: 'Content Media Expert not initialized' });
    }

    const { path, quality } = req.body;
    const optimization = await contentMediaExpertAgent.execute('optimizeImage', { path, quality });
    res.json(optimization);
  } catch (error) {
    console.error('[Content Media Expert] Optimize image error:', error);
    res.status(500).json({ error: 'Failed to optimize image' });
  }
});

/**
 * POST /api/content-media/process-video
 * Process video file
 */
router.post('/process-video', async (req, res) => {
  try {
    if (!contentMediaExpertAgent) {
      return res.status(503).json({ error: 'Content Media Expert not initialized' });
    }

    const { path, targetFormat } = req.body;
    const processing = await contentMediaExpertAgent.execute('processVideo', { path, targetFormat });
    res.json(processing);
  } catch (error) {
    console.error('[Content Media Expert] Process video error:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

/**
 * GET /api/content-media/stats
 * Get media usage statistics
 */
router.get('/stats', async (req, res) => {
  try {
    if (!contentMediaExpertAgent) {
      return res.status(503).json({ error: 'Content Media Expert not initialized' });
    }

    const stats = await contentMediaExpertAgent.execute('getMediaStats', {});
    res.json(stats);
  } catch (error) {
    console.error('[Content Media Expert] Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * POST /api/content-media/suggest-format
 * Get format recommendations
 */
router.post('/suggest-format', async (req, res) => {
  try {
    if (!contentMediaExpertAgent) {
      return res.status(503).json({ error: 'Content Media Expert not initialized' });
    }

    const { type, usage } = req.body;
    const suggestion = await contentMediaExpertAgent.execute('suggestFormat', { type, usage });
    res.json(suggestion);
  } catch (error) {
    console.error('[Content Media Expert] Suggest format error:', error);
    res.status(500).json({ error: 'Failed to suggest format' });
  }
});

export default router;
