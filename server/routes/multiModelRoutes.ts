/**
 * MULTI-MODEL CONSENSUS API ROUTES
 * MB.MD Stream 2: All Models feature
 * 
 * Endpoints for multi-model AI coordination
 */

import { Router } from 'express';
import { modelCoordinator } from '../services/multiModel/ModelCoordinator';

const router = Router();

/**
 * POST /api/multimodel/consensus
 * Execute query across all models and return consensus
 */
router.post('/consensus', async (req, res) => {
  try {
    const { query, systemPrompt } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('[MultiModel] Executing consensus for:', query.substring(0, 50));
    
    const result = await modelCoordinator.executeAll(query, systemPrompt);
    
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
