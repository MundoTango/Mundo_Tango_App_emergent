/**
 * Phase 11 - Track 1A: Agent Registry API Routes
 * REST API for component-agent management
 */

import { Router } from 'express';
import { agentRegistry } from '../services/agentRegistry';
import type { ComponentAgent } from '../services/agentRegistry';

const router = Router();

/**
 * POST /api/agent-registry/register
 * Register a new component-agent
 */
router.post('/register', async (req, res) => {
  try {
    const agent: ComponentAgent = req.body;
    await agentRegistry.registerAgent(agent);
    res.json({ success: true, message: `Agent ${agent.id} registered successfully` });
  } catch (error) {
    console.error('[Agent Registry API] Registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to register agent' });
  }
});

/**
 * GET /api/agent-registry/:id
 * Get agent details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await agentRegistry.getAgent(id);
    
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    
    res.json({ success: true, agent });
  } catch (error) {
    console.error('[Agent Registry API] Get agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to get agent' });
  }
});

/**
 * GET /api/agent-registry/type/:type
 * Get all agents by type
 */
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const agents = await agentRegistry.getAgentsByType(type);
    res.json({ success: true, agents, count: agents.length });
  } catch (error) {
    console.error('[Agent Registry API] Get by type error:', error);
    res.status(500).json({ success: false, error: 'Failed to get agents by type' });
  }
});

/**
 * GET /api/agent-registry/category/:category
 * Get all agents by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const agents = await agentRegistry.getAgentsByCategory(category);
    res.json({ success: true, agents, count: agents.length });
  } catch (error) {
    console.error('[Agent Registry API] Get by category error:', error);
    res.status(500).json({ success: false, error: 'Failed to get agents by category' });
  }
});

/**
 * PATCH /api/agent-registry/:id/health
 * Update agent health status
 */
router.patch('/:id/health', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['healthy', 'warning', 'error'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid health status' });
    }
    
    await agentRegistry.updateHealth(id, status);
    res.json({ success: true, message: `Health updated for ${id}` });
  } catch (error) {
    console.error('[Agent Registry API] Update health error:', error);
    res.status(500).json({ success: false, error: 'Failed to update health' });
  }
});

/**
 * POST /api/agent-registry/test
 * Record test result
 */
router.post('/test', async (req, res) => {
  try {
    const { agentId, passed } = req.body;
    
    if (!agentId || typeof passed !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Missing agentId or passed' });
    }
    
    await agentRegistry.recordTest(agentId, passed);
    res.json({ success: true, message: `Test result recorded for ${agentId}` });
  } catch (error) {
    console.error('[Agent Registry API] Record test error:', error);
    res.status(500).json({ success: false, error: 'Failed to record test' });
  }
});

/**
 * POST /api/agent-registry/auto-fix
 * Record auto-fix attempt
 */
router.post('/auto-fix', async (req, res) => {
  try {
    const { agentId, successful } = req.body;
    
    if (!agentId || typeof successful !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Missing agentId or successful' });
    }
    
    await agentRegistry.recordAutoFix(agentId, successful);
    res.json({ success: true, message: `Auto-fix recorded for ${agentId}` });
  } catch (error) {
    console.error('[Agent Registry API] Record auto-fix error:', error);
    res.status(500).json({ success: false, error: 'Failed to record auto-fix' });
  }
});

/**
 * GET /api/agent-registry/unhealthy
 * Get all unhealthy agents
 */
router.get('/unhealthy', async (req, res) => {
  try {
    const agents = await agentRegistry.getUnhealthyAgents();
    res.json({ success: true, agents, count: agents.length });
  } catch (error) {
    console.error('[Agent Registry API] Get unhealthy error:', error);
    res.status(500).json({ success: false, error: 'Failed to get unhealthy agents' });
  }
});

/**
 * GET /api/agent-registry/stats
 * Get agent registry statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await agentRegistry.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('[Agent Registry API] Get stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

/**
 * POST /api/agent-registry/bulk-register
 * Bulk register multiple agents
 */
router.post('/bulk-register', async (req, res) => {
  try {
    const { agents } = req.body;
    
    if (!Array.isArray(agents)) {
      return res.status(400).json({ success: false, error: 'agents must be an array' });
    }
    
    await agentRegistry.bulkRegister(agents);
    res.json({ success: true, message: `${agents.length} agents registered successfully` });
  } catch (error) {
    console.error('[Agent Registry API] Bulk register error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk register agents' });
  }
});

export default router;
