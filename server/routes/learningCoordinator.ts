import { Router, Request, Response } from 'express';

/**
 * Agent #80: Learning Coordinator Backend API
 * Knowledge flows UP (to CEO), ACROSS (to peers), DOWN (to all agents)
 */

const router = Router();

interface Learning {
  id: string;
  agentId: string;
  agentName: string;
  pattern: string;
  category: 'strategic' | 'tactical' | 'best-practice';
  flowDirection: 'UP' | 'ACROSS' | 'DOWN';
  recipients: string[];
  effectiveness: number;
  timesReused: number;
  timestamp: Date;
}

interface KnowledgeFlow {
  direction: 'UP' | 'ACROSS' | 'DOWN';
  count: number;
  avgEffectiveness: number;
  recentLearnings: Learning[];
}

// In-memory knowledge base (production would use database)
const learnings: Learning[] = [
  {
    id: 'learn-1',
    agentId: 'AGENT_14',
    agentName: 'Code Quality',
    pattern: 'ESLint rule performance-no-await-in-loop prevents sequential async operations',
    category: 'best-practice',
    flowDirection: 'DOWN',
    recipients: ['ALL_AGENTS'],
    effectiveness: 0.95,
    timesReused: 45,
    timestamp: new Date('2025-10-12')
  },
  {
    id: 'learn-2',
    agentId: 'AGENT_31',
    agentName: 'AI Integration',
    pattern: 'User engagement increased 40% with conversational AI vs traditional forms',
    category: 'strategic',
    flowDirection: 'UP',
    recipients: ['AGENT_0'],
    effectiveness: 0.88,
    timesReused: 3,
    timestamp: new Date('2025-10-13')
  },
  {
    id: 'learn-3',
    agentId: 'AGENT_2',
    agentName: 'Frontend',
    pattern: 'React Query cache invalidation pattern for optimistic updates',
    category: 'tactical',
    flowDirection: 'ACROSS',
    recipients: ['AGENT_1', 'AGENT_11', 'AGENT_36'],
    effectiveness: 0.92,
    timesReused: 18,
    timestamp: new Date('2025-10-13')
  }
];

/**
 * Get all knowledge flows (UP, ACROSS, DOWN)
 */
router.get('/api/learning-coordinator/flows', (req: Request, res: Response) => {
  try {
    const upFlow: KnowledgeFlow = {
      direction: 'UP',
      count: learnings.filter(l => l.flowDirection === 'UP').length,
      avgEffectiveness: calculateAvgEffectiveness(learnings.filter(l => l.flowDirection === 'UP')),
      recentLearnings: learnings
        .filter(l => l.flowDirection === 'UP')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)
    };

    const acrossFlow: KnowledgeFlow = {
      direction: 'ACROSS',
      count: learnings.filter(l => l.flowDirection === 'ACROSS').length,
      avgEffectiveness: calculateAvgEffectiveness(learnings.filter(l => l.flowDirection === 'ACROSS')),
      recentLearnings: learnings
        .filter(l => l.flowDirection === 'ACROSS')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)
    };

    const downFlow: KnowledgeFlow = {
      direction: 'DOWN',
      count: learnings.filter(l => l.flowDirection === 'DOWN').length,
      avgEffectiveness: calculateAvgEffectiveness(learnings.filter(l => l.flowDirection === 'DOWN')),
      recentLearnings: learnings
        .filter(l => l.flowDirection === 'DOWN')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)
    };

    res.json({
      up: upFlow,
      across: acrossFlow,
      down: downFlow
    });
  } catch (error) {
    console.error('Failed to load knowledge flows:', error);
    res.status(500).json({ error: 'Failed to load knowledge flows' });
  }
});

/**
 * Capture new learning
 */
router.post('/api/learning-coordinator/capture', (req: Request, res: Response) => {
  try {
    const { agentId, agentName, pattern, category, flowDirection, recipients } = req.body;

    if (!agentId || !pattern || !flowDirection) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLearning: Learning = {
      id: `learn-${Date.now()}`,
      agentId,
      agentName: agentName || agentId,
      pattern,
      category: category || 'tactical',
      flowDirection,
      recipients: recipients || [],
      effectiveness: 0,
      timesReused: 0,
      timestamp: new Date()
    };

    learnings.push(newLearning);

    // Log A2A message for knowledge distribution
    console.log('[Agent #80] Knowledge captured:', {
      from: agentId,
      direction: flowDirection,
      to: recipients,
      pattern: pattern.substring(0, 50) + '...'
    });

    res.json({
      success: true,
      learning: newLearning,
      totalLearnings: learnings.length
    });
  } catch (error) {
    console.error('Failed to capture learning:', error);
    res.status(500).json({ error: 'Failed to capture learning' });
  }
});

/**
 * Get learnings for specific agent
 */
router.get('/api/learning-coordinator/agent/:agentId', (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agentLearnings = learnings.filter(l => 
      l.agentId === agentId || l.recipients.includes(agentId)
    );

    res.json({
      agentId,
      learnings: agentLearnings,
      count: agentLearnings.length
    });
  } catch (error) {
    console.error('Failed to get agent learnings:', error);
    res.status(500).json({ error: 'Failed to get agent learnings' });
  }
});

/**
 * Update learning effectiveness (after reuse)
 */
router.post('/api/learning-coordinator/update-effectiveness', (req: Request, res: Response) => {
  try {
    const { learningId, wasEffective } = req.body;

    const learning = learnings.find(l => l.id === learningId);
    if (!learning) {
      return res.status(404).json({ error: 'Learning not found' });
    }

    learning.timesReused++;
    
    // Calculate rolling average effectiveness
    const currentTotal = learning.effectiveness * (learning.timesReused - 1);
    learning.effectiveness = (currentTotal + (wasEffective ? 1 : 0)) / learning.timesReused;

    res.json({
      success: true,
      learning,
      message: `Effectiveness updated: ${Math.round(learning.effectiveness * 100)}%`
    });
  } catch (error) {
    console.error('Failed to update effectiveness:', error);
    res.status(500).json({ error: 'Failed to update effectiveness' });
  }
});

/**
 * Get knowledge flow statistics
 */
router.get('/api/learning-coordinator/stats', (req: Request, res: Response) => {
  try {
    const stats = {
      totalLearnings: learnings.length,
      byDirection: {
        UP: learnings.filter(l => l.flowDirection === 'UP').length,
        ACROSS: learnings.filter(l => l.flowDirection === 'ACROSS').length,
        DOWN: learnings.filter(l => l.flowDirection === 'DOWN').length
      },
      byCategory: {
        strategic: learnings.filter(l => l.category === 'strategic').length,
        tactical: learnings.filter(l => l.category === 'tactical').length,
        'best-practice': learnings.filter(l => l.category === 'best-practice').length
      },
      avgEffectiveness: calculateAvgEffectiveness(learnings),
      totalReuses: learnings.reduce((sum, l) => sum + l.timesReused, 0),
      activeAgents: new Set(learnings.map(l => l.agentId)).size
    };

    res.json(stats);
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * Helper: Calculate average effectiveness
 */
function calculateAvgEffectiveness(learningList: Learning[]): number {
  if (learningList.length === 0) return 0;
  const sum = learningList.reduce((acc, l) => acc + l.effectiveness, 0);
  return sum / learningList.length;
}

export default router;
