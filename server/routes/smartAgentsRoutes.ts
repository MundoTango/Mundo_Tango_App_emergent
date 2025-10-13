/**
 * Smart Agents API Routes
 * MB.MD PHASE 4 - Agent Control & Monitoring
 */

import { Router } from 'express';
import { smartAgents } from '../agents';
import { requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/smart-agents/status
 * Get status of all smart agents
 */
router.get('/status', requireAdmin, async (req, res) => {
  try {
    const status = await smartAgents.getStatus();
    res.json(status);
  } catch (error) {
    console.error('[Smart Agents API] Status check failed:', error);
    res.status(500).json({ error: 'Failed to get agent status' });
  }
});

/**
 * POST /api/smart-agents/:agentId/trigger
 * Manually trigger an agent execution
 */
router.post('/:agentId/trigger', requireAdmin, async (req, res) => {
  try {
    const agentId = parseInt(req.params.agentId);
    
    if (![106, 107, 108, 109].includes(agentId)) {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }
    
    const result = await smartAgents.triggerAgent(agentId);
    
    res.json({
      success: true,
      agentId,
      result
    });
  } catch (error) {
    console.error('[Smart Agents API] Trigger failed:', error);
    res.status(500).json({ error: 'Failed to trigger agent' });
  }
});

export default router;
