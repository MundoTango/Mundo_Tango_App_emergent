/**
 * PHASE 9 INTELLIGENCE ROUTES
 * MB.MD Phase 9 - Track 69
 * 
 * API endpoints for all Phase 9 intelligence systems
 */

import { Router } from 'express';
import { agent111 } from '../agents/Agent111_VisualPreview';
import { agent112 } from '../agents/Agent112_DesignToCode';
import { agent113 } from '../agents/Agent113_CrossPhaseCoordinator';
import { agent114 } from '../agents/Agent114_PredictivePlanner';
import { agent115 } from '../agents/Agent115_DynamicPriorityManager';
import { agent116 } from '../agents/Agent116_DependencyMapper';
import { predictivePlanningEngine } from '../intelligence/PredictivePlanningEngine';
import { dynamicPriorityEngine } from '../intelligence/DynamicPriorityEngine';
import { dependencyMappingEngine } from '../intelligence/DependencyMappingEngine';

const router = Router();

// ============================================================================
// VISUAL PREVIEW (Agent #111)
// ============================================================================

router.post('/visual-preview/generate', async (req, res) => {
  try {
    const { code, language, template, dependencies } = req.body;
    
    const result = await agent111.generatePreview({
      code,
      language: language || 'jsx',
      template: template || 'react',
      dependencies,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Preview generation failed' 
    });
  }
});

router.post('/visual-preview/hmr/:previewId', async (req, res) => {
  try {
    const { previewId } = req.params;
    const { code } = req.body;
    
    await agent111.enableHMR(previewId, (updatedCode) => {
      // Would use WebSocket for real updates
      console.log('HMR update:', updatedCode);
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'HMR setup failed' });
  }
});

// ============================================================================
// DESIGN-TO-CODE (Agent #112)
// ============================================================================

router.post('/design-to-code/convert', async (req, res) => {
  try {
    const { design, framework } = req.body;
    
    const result = await agent112.convertDesignToCode(design, framework || 'react');

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    });
  }
});

router.get('/design-to-code/metadata', async (req, res) => {
  res.json(agent112.getMetadata());
});

// ============================================================================
// CROSS-PHASE COORDINATION (Agent #113)
// ============================================================================

router.post('/cross-phase/coordinate', async (req, res) => {
  try {
    const { phases } = req.body;
    
    const plan = await agent113.coordinateCrossPhase(phases);

    res.json(plan);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Coordination failed' 
    });
  }
});

router.post('/cross-phase/sync', async (req, res) => {
  try {
    const { sourcePhase, targetPhases } = req.body;
    
    await agent113.syncLearnings(sourcePhase, targetPhases);

    res.json({ success: true, synced: targetPhases.length });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// ============================================================================
// PREDICTIVE PLANNING (Agent #114)
// ============================================================================

router.post('/predictive/plan', async (req, res) => {
  try {
    const { tracks, context } = req.body;
    
    const plan = await predictivePlanningEngine.predictExecutionPlan(tracks, context || {});

    res.json(plan);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Planning failed' 
    });
  }
});

router.post('/predictive/learn', async (req, res) => {
  try {
    const { planId, actualDuration, actualSuccess } = req.body;
    
    await agent114.learnFromOutcome(planId, actualDuration, actualSuccess);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Learning failed' });
  }
});

// ============================================================================
// DYNAMIC PRIORITY (Agent #115)
// ============================================================================

router.post('/priority/adjust', async (req, res) => {
  try {
    const { tasks, context } = req.body;
    
    const update = await agent115.adjustPriorities(tasks, context);

    res.json(update);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Priority adjustment failed' 
    });
  }
});

router.post('/priority/realtime-update', async (req, res) => {
  try {
    const { event, currentTasks } = req.body;
    
    const update = await agent115.handleRealtimeUpdate(event, currentTasks);

    res.json({ success: true, update });
  } catch (error) {
    res.status(500).json({ error: 'Real-time update failed' });
  }
});

// ============================================================================
// DEPENDENCY MAPPING (Agent #116)
// ============================================================================

router.post('/dependency/map', async (req, res) => {
  try {
    const { entities } = req.body;
    
    const graph = await agent116.mapDependencies(entities);

    res.json(graph);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Mapping failed' 
    });
  }
});

router.post('/dependency/resolve', async (req, res) => {
  try {
    const { graph, conflictingNodes } = req.body;
    
    const plan = await agent116.resolveDependencyConflict(graph, conflictingNodes);

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Resolution failed' });
  }
});

router.post('/dependency/visualize', async (req, res) => {
  try {
    const { graph } = req.body;
    
    const layout = await dependencyMappingEngine.generateLayout(graph);

    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: 'Visualization failed' });
  }
});

router.post('/dependency/optimize', async (req, res) => {
  try {
    const { graph } = req.body;
    
    const suggestions = await dependencyMappingEngine.suggestOptimizations(graph);

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Optimization failed' });
  }
});

// ============================================================================
// AGENT METADATA
// ============================================================================

router.get('/agents/metadata', async (req, res) => {
  res.json({
    agents: [
      agent111.getMetadata(),
      agent112.getMetadata(),
      agent113.getMetadata(),
      agent114.getMetadata(),
      agent115.getMetadata(),
      agent116.getMetadata(),
    ]
  });
});

export default router;
