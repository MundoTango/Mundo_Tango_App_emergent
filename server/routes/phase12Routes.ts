/**
 * PHASE 12: Complete UI/UX Autonomy Routes
 * API endpoints for all Phase 12 autonomous systems
 */

import { Router } from 'express';
import { componentTrainer } from '../services/ComponentTrainer';
import { visualEditorLoop } from '../services/VisualEditorLoop';
import { bottomUpLearning } from '../services/BottomUpLearning';
import { parallelExecutor } from '../services/ParallelExecutor';

const router = Router();

/**
 * POST /api/phase12/train-all
 * Train all 559 components with autonomy standards
 */
router.post('/api/phase12/train-all', async (req, res) => {
  try {
    const result = await componentTrainer.trainAll();
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({
      error: 'Failed to train components',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/phase12/visual-edit
 * Process Visual Editor change through full autonomous loop
 */
router.post('/api/phase12/visual-edit', async (req, res) => {
  try {
    const { edit, context } = req.body;
    
    const result = await visualEditorLoop.processVisualEdit(edit, context);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Visual edit error:', error);
    res.status(500).json({
      error: 'Failed to process visual edit',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/phase12/learn-history/:componentId
 * Enable component to learn full organizational history
 */
router.post('/api/phase12/learn-history/:componentId', async (req, res) => {
  try {
    const componentId = parseInt(req.params.componentId);
    
    const learning = await bottomUpLearning.learnOrganizationalHistory(componentId);
    const applied = await bottomUpLearning.applyLearning(componentId, learning);
    
    res.json({
      success: true,
      learning,
      applied,
    });
  } catch (error) {
    console.error('Learning error:', error);
    res.status(500).json({
      error: 'Failed to learn history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/phase12/execute-all-parallel
 * Execute all 27 tasks across 3 tracks in parallel
 */
router.post('/api/phase12/execute-all-parallel', async (req, res) => {
  try {
    const result = await parallelExecutor.executeAll3LayerPlan();
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Parallel execution error:', error);
    res.status(500).json({
      error: 'Failed to execute parallel plan',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/phase12/status
 * Get Phase 12 rollout status
 */
router.get('/api/phase12/status', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { componentAgents, esaAgents } = await import('@shared/schema');

    const components = await db.select().from(componentAgents);
    const agents = await db.select().from(esaAgents);

    // Calculate training status
    const trained = components.filter(c => (c.learningCount || 0) > 0).length;
    const healthy = components.filter(c => c.currentHealth === 'healthy').length;

    res.json({
      components: {
        total: components.length,
        trained,
        healthy,
        trainingProgress: ((trained / components.length) * 100).toFixed(1) + '%',
        healthScore: ((healthy / components.length) * 100).toFixed(1) + '%',
      },
      agents: {
        total: agents.length,
        uiSubAgents: agents.filter(a => a.id?.startsWith('AGENT-11')).length,
      },
      autonomyReady: trained === components.length && healthy > (components.length * 0.9),
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to get status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
