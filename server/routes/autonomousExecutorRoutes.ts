/**
 * TRACK 6: Autonomous Executor Routes
 * API endpoints for triggering agent execution
 */

import { Router } from 'express';
import { autonomousExecutor } from '../services/AutonomousExecutor';

const router = Router();

/**
 * POST /api/autonomous/execute-all
 * Execute all UI Sub-Agents in parallel
 */
router.post('/api/autonomous/execute-all', async (req, res) => {
  try {
    const result = await autonomousExecutor.executeAll();
    res.json({
      success: true,
      results: result,
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      error: 'Failed to execute agents',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/autonomous/execute/:agentId
 * Execute single agent
 */
router.post('/api/autonomous/execute/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await autonomousExecutor.executeAgent(agentId);
    res.json({
      success: true,
      agentId,
      result,
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      error: 'Failed to execute agent',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
