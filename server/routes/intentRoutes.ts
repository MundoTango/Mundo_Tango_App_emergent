/**
 * Intent Detection Routes
 * MB.MD Option A - Recursive Testing System
 * 
 * Endpoints for predicting user actions and proactive testing
 */

import express, { Request, Response } from 'express';
import { intentDetector } from '../services/intentDetector';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/intent/detect
 * Analyze user behavior and predict next action
 */
router.post('/detect', optionalAuth, async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId || req.sessionID;
    const userId = req.user?.id;

    const prediction = await intentDetector.detectIntent(sessionId, userId);

    if (!prediction) {
      return res.json({ prediction: null, message: 'Not enough data to predict' });
    }

    // Record prediction and trigger proactive testing
    await intentDetector.recordAndTest(prediction, sessionId, userId);

    res.json({
      prediction: {
        action: prediction.predictedAction,
        target: prediction.predictedTarget,
        confidence: Math.round(prediction.confidence * 100),
        pattern: prediction.patternMatched,
      },
      tested: prediction.confidence >= 0.6,
    });

  } catch (error) {
    console.error('[Intent Detection API] Error:', error);
    res.status(500).json({ error: 'Failed to detect intent' });
  }
});

/**
 * POST /api/intent/update
 * Update prediction accuracy when user actually acts
 */
router.post('/update', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { sessionId, actualAction, actualTarget } = req.body;

    if (!sessionId || !actualAction || !actualTarget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await intentDetector.updatePredictionAccuracy(
      sessionId,
      actualAction,
      actualTarget
    );

    res.json({ success: true });

  } catch (error) {
    console.error('[Intent Detection API] Error updating accuracy:', error);
    res.status(500).json({ error: 'Failed to update accuracy' });
  }
});

/**
 * GET /api/intent/stats
 * Get prediction statistics
 */
router.get('/stats', optionalAuth, async (req: Request, res: Response) => {
  try {
    const stats = await intentDetector.getStats();

    res.json(stats);

  } catch (error) {
    console.error('[Intent Detection API] Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/intent/predictions/:userId
 * Get recent predictions for a user
 */
router.get('/predictions/:userId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.userId);

    // Users can only see their own predictions (unless admin)
    if (req.user?.id !== targetUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // In production, query database for user's recent predictions
    res.json({ predictions: [] }); // Placeholder

  } catch (error) {
    console.error('[Intent Detection API] Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Ping endpoint for testing route registration
router.get('/ping', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Intent routes registered successfully' });
});

export default router;
