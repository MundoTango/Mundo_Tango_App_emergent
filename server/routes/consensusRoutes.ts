/**
 * Consensus API Routes
 * Multi-AI consensus and debate endpoints
 * MB.MD Track 3 - Consensus Engine
 */

import { Router, type Request, Response } from 'express';
import { consensusEngine } from '../services/ConsensusEngine';

const router = Router();

/**
 * POST /api/consensus/query
 * Query all models and get consensus answer
 */
router.post('/query', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { question, models } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('[Consensus] Starting consensus query:', question);

    const result = await consensusEngine.queryWithConsensus(
      question,
      models || ['gpt-4o', 'claude-3-sonnet', 'gemini-pro']
    );

    res.json(result);
  } catch (error) {
    console.error('[Consensus] Error:', error);
    res.status(500).json({ error: 'Failed to get consensus' });
  }
});

/**
 * POST /api/consensus/stream
 * Stream consensus process in real-time
 */
router.post('/stream', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { question, models } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial event
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Starting consensus process...' })}\n\n`);

    // Get consensus with streaming updates
    const result = await consensusEngine.queryWithConsensus(
      question,
      models || ['gpt-4o', 'claude-3-sonnet', 'gemini-pro']
    );

    // Send final result
    res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[Consensus] Stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Consensus failed' })}\n\n`);
    res.end();
  }
});

export default router;
