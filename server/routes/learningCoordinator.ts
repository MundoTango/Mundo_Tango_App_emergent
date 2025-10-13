import { Router, Request, Response } from 'express';
import { learningCoordinatorService } from '../services/learningCoordinatorService';
import { z } from 'zod';

/**
 * Agent #80: Learning Coordinator API Routes
 * Knowledge flows UP (to CEO), ACROSS (to peers), DOWN (to all agents)
 */

const router = Router();

// Validation schemas
const escalatePatternSchema = z.object({
  pattern: z.string().min(1),
  category: z.string(),
  impact: z.string(),
  strategicValue: z.number().min(0).max(1),
  sourceAgent: z.string(), // Agent ID
  recommendation: z.string().optional()
});

const distributeSolutionSchema = z.object({
  id: z.number(),
  description: z.string().min(1),
  steps: z.array(z.string()),
  codeExample: z.string().optional(),
  targetAgents: z.array(z.string()), // Agent IDs
  sourceAgent: z.string() // Agent ID
});

const broadcastBestPracticeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string(),
  sourceAgent: z.string(), // Agent ID
  codeExample: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const captureLearningSchema = z.object({
  agentId: z.string(), // Agent ID
  learning: z.object({
    agentId: z.string(), // Agent ID (redundant but required by Learning interface)
    learningType: z.enum(['pattern', 'solution', 'best-practice', 'insight']),
    content: z.string().min(1),
    context: z.string().optional(),
    effectiveness: z.number().min(0).max(1).optional(),
    metadata: z.any().optional()
  })
});

const trackEffectivenessSchema = z.object({
  solutionId: z.number(),
  feedback: z.object({
    successful: z.boolean(),
    improvement: z.number().optional(),
    notes: z.string().optional()
  })
});

/**
 * POST /api/learning-coordinator/escalate
 * Send pattern UP to CEO Agent #0
 */
router.post('/api/learning-coordinator/escalate', async (req: Request, res: Response) => {
  try {
    const validated = escalatePatternSchema.parse(req.body);
    
    await learningCoordinatorService.escalatePattern(validated);

    res.json({
      success: true,
      message: 'Pattern escalated to CEO Agent #0',
      direction: 'UP',
      strategicValue: validated.strategicValue
    });
  } catch (error) {
    console.error('[Learning Coordinator] Escalate error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to escalate pattern' });
  }
});

/**
 * POST /api/learning-coordinator/distribute
 * Share solution ACROSS to peer agents
 */
router.post('/api/learning-coordinator/distribute', async (req: Request, res: Response) => {
  try {
    const validated = distributeSolutionSchema.parse(req.body);
    
    await learningCoordinatorService.distributeSolution(validated);

    res.json({
      success: true,
      message: `Solution distributed to ${validated.targetAgents.length} peer agents`,
      direction: 'ACROSS',
      recipients: validated.targetAgents
    });
  } catch (error) {
    console.error('[Learning Coordinator] Distribute error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to distribute solution' });
  }
});

/**
 * POST /api/learning-coordinator/broadcast
 * Send best practice DOWN to all agents
 */
router.post('/api/learning-coordinator/broadcast', async (req: Request, res: Response) => {
  try {
    const validated = broadcastBestPracticeSchema.parse(req.body);
    
    const practice = await learningCoordinatorService.broadcastBestPractice(validated);

    res.json({
      success: true,
      message: 'Best practice broadcast to all agents',
      direction: 'DOWN',
      practice: {
        id: practice.id,
        title: practice.title,
        category: practice.category
      }
    });
  } catch (error) {
    console.error('[Learning Coordinator] Broadcast error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to broadcast best practice' });
  }
});

/**
 * POST /api/learning-coordinator/capture
 * Record agent learning (automatic knowledge capture)
 */
router.post('/api/learning-coordinator/capture', async (req: Request, res: Response) => {
  try {
    const validated = captureLearningSchema.parse(req.body);
    
    // Ensure learning has agentId set
    const learningWithAgentId = {
      ...validated.learning,
      agentId: validated.agentId
    };
    
    await learningCoordinatorService.captureLearning(
      validated.agentId,
      learningWithAgentId
    );

    res.json({
      success: true,
      message: 'Learning captured and distributed',
      agentId: validated.agentId,
      learningType: validated.learning.learningType
    });
  } catch (error) {
    console.error('[Learning Coordinator] Capture error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to capture learning' });
  }
});

/**
 * POST /api/learning-coordinator/track-effectiveness
 * Track solution effectiveness after reuse
 */
router.post('/api/learning-coordinator/track-effectiveness', async (req: Request, res: Response) => {
  try {
    const validated = trackEffectivenessSchema.parse(req.body);
    
    await learningCoordinatorService.trackEffectiveness(
      validated.solutionId,
      validated.feedback
    );

    res.json({
      success: true,
      message: 'Effectiveness tracked',
      solutionId: validated.solutionId,
      successful: validated.feedback.successful
    });
  } catch (error) {
    console.error('[Learning Coordinator] Track effectiveness error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to track effectiveness' });
  }
});

/**
 * GET /api/learning-coordinator/network-status
 * Get knowledge network health and statistics
 */
router.get('/api/learning-coordinator/network-status', async (req: Request, res: Response) => {
  try {
    const status = await learningCoordinatorService.syncKnowledgeNetwork();

    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Learning Coordinator] Network status error:', error);
    res.status(500).json({ error: 'Failed to get network status' });
  }
});

/**
 * GET /api/learning-coordinator/best-practices
 * Get all best practices (optionally filtered by category)
 */
router.get('/api/learning-coordinator/best-practices', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const practices = await learningCoordinatorService.getBestPractices(category);

    res.json({
      success: true,
      practices,
      count: practices.length
    });
  } catch (error) {
    console.error('[Learning Coordinator] Get best practices error:', error);
    res.status(500).json({ error: 'Failed to get best practices' });
  }
});

/**
 * GET /api/learning-coordinator/flows/:direction
 * Get knowledge flows by direction (UP/ACROSS/DOWN)
 */
router.get('/api/learning-coordinator/flows/:direction', async (req: Request, res: Response) => {
  try {
    const direction = req.params.direction.toUpperCase() as 'UP' | 'ACROSS' | 'DOWN';
    
    if (!['UP', 'ACROSS', 'DOWN'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid direction. Must be UP, ACROSS, or DOWN' });
    }

    const flows = await learningCoordinatorService.getFlowsByDirection(direction);

    res.json({
      success: true,
      direction,
      flows,
      count: flows.length
    });
  } catch (error) {
    console.error('[Learning Coordinator] Get flows error:', error);
    res.status(500).json({ error: 'Failed to get flows' });
  }
});

/**
 * GET /api/learning-coordinator/stats
 * Get overall learning statistics
 */
router.get('/api/learning-coordinator/stats', async (req: Request, res: Response) => {
  try {
    const status = await learningCoordinatorService.syncKnowledgeNetwork();

    res.json({
      success: true,
      stats: {
        totalFlows: status.totalFlows,
        flowsByDirection: {
          UP: status.upFlows,
          ACROSS: status.acrossFlows,
          DOWN: status.downFlows
        },
        activeBestPractices: status.activeBestPractices,
        avgEffectiveness: status.avgEffectiveness,
        learningsToday: status.learningsToday,
        networkHealth: status.networkHealth
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Learning Coordinator] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
