/**
 * Smart Agents V2 API Routes
 * MB.MD PHASE 5 - Enhanced Agent Control & Monitoring
 */

import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { agent106v2 } from '../agents/Agent106_APIPathValidator_v2';
import { parallelOrchestrator } from '../agents/ParallelAgentOrchestrator';
import { agentCollaboration } from '../agents/AgentCollaborationSystem';

const router = Router();

/**
 * GET /api/smart-agents/orchestrator/stats
 * Get parallel orchestrator statistics
 */
router.get('/orchestrator/stats', requireAdmin, async (req, res) => {
  try {
    const stats = parallelOrchestrator.getStats();
    res.json(stats);
  } catch (error) {
    console.error('[Smart Agents V2] Orchestrator stats failed:', error);
    res.status(500).json({ error: 'Failed to get orchestrator stats' });
  }
});

/**
 * GET /api/smart-agents/collaboration/stats
 * Get collaboration system statistics
 */
router.get('/collaboration/stats', requireAdmin, async (req, res) => {
  try {
    const stats = agentCollaboration.getStats();
    res.json(stats);
  } catch (error) {
    console.error('[Smart Agents V2] Collaboration stats failed:', error);
    res.status(500).json({ error: 'Failed to get collaboration stats' });
  }
});

/**
 * POST /api/smart-agents/106/auto-fix
 * Trigger Agent #106 v2 auto-fix
 */
router.post('/106/auto-fix', requireAdmin, async (req, res) => {
  try {
    const { dryRun = false } = req.body;
    
    const result = await agent106v2.validateAndFix(dryRun);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('[Smart Agents V2] Auto-fix failed:', error);
    res.status(500).json({ error: 'Failed to auto-fix API paths' });
  }
});

/**
 * POST /api/smart-agents/parallel/execute
 * Execute multiple agents in parallel
 */
router.post('/parallel/execute', requireAdmin, async (req, res) => {
  try {
    const { agentIds } = req.body;
    
    if (!Array.isArray(agentIds)) {
      return res.status(400).json({ error: 'agentIds must be an array' });
    }
    
    const tasks = agentIds.map((id: number) => ({
      id: `task-${id}-${Date.now()}`,
      agentId: id,
      priority: 'normal' as const,
      execute: async () => {
        // Execute corresponding agent
        if (id === 106) return await agent106v2.validateAndFix(true);
        // Add other agents here
        return { agentId: id, status: 'completed' };
      }
    }));
    
    const results = await parallelOrchestrator.executeParallel(tasks);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('[Smart Agents V2] Parallel execution failed:', error);
    res.status(500).json({ error: 'Failed to execute agents in parallel' });
  }
});

/**
 * POST /api/smart-agents/collaboration/analyze
 * Perform root cause analysis
 */
router.post('/collaboration/analyze', requireAdmin, async (req, res) => {
  try {
    const { issue } = req.body;
    
    if (!issue) {
      return res.status(400).json({ error: 'issue description is required' });
    }
    
    const analysis = await agentCollaboration.performRootCauseAnalysis(issue);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('[Smart Agents V2] Root cause analysis failed:', error);
    res.status(500).json({ error: 'Failed to perform root cause analysis' });
  }
});

export default router;
