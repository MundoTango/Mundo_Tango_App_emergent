/**
 * MULTI-MODEL CONSENSUS API ROUTES
 * MB.MD Stream 2: All Models feature
 * MB.MD FIX Oct 22: Added message persistence to database
 * 
 * Endpoints for multi-model AI coordination
 */

import { Router } from 'express';
import { modelCoordinator } from '../services/multiModel/ModelCoordinator';
import { db } from '../db';
import { aiChatMessages } from '@shared/schema';
import { storage } from '../storage';

const router = Router();

/**
 * POST /api/multimodel/consensus
 * Execute query across all models and return consensus
 * MB.MD FIX: Now saves messages to database
 */
router.post('/consensus', async (req: any, res) => {
  try {
    const { query, projectId, systemPrompt } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // MB.MD FIX: Get user for saving messages
    let userId: number | undefined;
    if (req.user?.claims?.sub) {
      const user = await storage.getUserByReplitId(req.user.claims.sub);
      userId = user?.id;
    }
    
    console.log('[MultiModel] Executing consensus for:', query.substring(0, 50));

    // MB.MD FIX: Save user message to database BEFORE processing
    if (projectId && userId) {
      await db.insert(aiChatMessages).values({
        projectId,
        userId,
        role: 'user',
        content: query,
        model: null,
      });
      console.log(`[MultiModel] Saved user message to project ${projectId}`);
    }
    
    const result = await modelCoordinator.executeAll(query, systemPrompt);

    // MB.MD FIX: Save AI response to database AFTER processing
    if (projectId && userId && result.finalPlan) {
      await db.insert(aiChatMessages).values({
        projectId,
        userId,
        role: 'assistant',
        content: result.finalPlan,
        model: 'multi-model-consensus',
        tokens: result.finalPlan.split(' ').length, // Rough estimate
      });
      console.log(`[MultiModel] Saved AI response to project ${projectId}`);
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('[MultiModel] Consensus error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute consensus' });
  }
});

/**
 * POST /api/multimodel/single
 * Execute query on single model
 */
router.post('/single', async (req, res) => {
  try {
    const { model, query, systemPrompt } = req.body;
    
    if (!model || !query) {
      return res.status(400).json({ error: 'Model and query are required' });
    }
    
    console.log(`[MultiModel] Executing ${model} for:`, query.substring(0, 50));
    
    const result = await modelCoordinator.executeModel(model, query, systemPrompt);
    
    res.json({ model, content: result });
  } catch (error: any) {
    console.error('[MultiModel] Single model error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute model' });
  }
});

export default router;
