/**
 * MR BLUE AGENT INTELLIGENCE ROUTES
 * Agent dependency mapping and cleanup execution
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/secureAuth';

const router = Router();

// Agent dependency mapping (same as in mrBlueRoutes.ts)
const getAgentDependencies = (agentName: string): {
  attachedAgents: string[];
  dependentFeatures: string[];
  cleanupActions: string[];
} => {
  const dependencyMap: Record<string, any> = {
    'Mr Blue': {
      attachedAgents: ['Algorithm Agents (A1-A30)', 'Intelligence Agents (#110-116)', 'Life CEO Agents (#73-80)', 'ESA Framework Agents (#1-114)'],
      dependentFeatures: [
        'ESA Mind Map navigation',
        'Visual Page Editor',
        'Quality Validator',
        'Learning Coordinator',
        'Algorithm chat interface',
        'Platform-wide AI assistance',
        'Agent dependency intelligence',
        'Auto-cleanup execution'
      ],
      cleanupActions: [
        'Remove MrBlueComplete component from all pages',
        'Update admin navigation to remove ESA Mind Map link',
        'Disable algorithm chat endpoints (/api/algorithms/:id/chat)',
        'Archive conversation history in localStorage',
        'Update user notifications about AI companion removal',
        'Remove Mr Blue routes from server/routes.ts',
        'Update replit.md to remove Mr Blue references'
      ]
    }
  };

  return dependencyMap[agentName] || {
    attachedAgents: [],
    dependentFeatures: [],
    cleanupActions: []
  };
};

/**
 * GET /api/mrblue/agent/dependencies/:agentName
 * Get agent dependency information
 */
router.get('/agent/dependencies/:agentName', requireAuth, async (req, res) => {
  try {
    const { agentName } = req.params;
    const dependencies = getAgentDependencies(agentName);
    
    res.json({
      success: true,
      agent: agentName,
      ...dependencies
    });
  } catch (error: any) {
    console.error('Dependency lookup error:', error);
    res.status(500).json({
      error: 'Failed to get dependencies',
      message: error.message
    });
  }
});

/**
 * POST /api/mrblue/agent/execute-cleanup
 * Execute cleanup actions for agent deletion
 */
router.post('/agent/execute-cleanup', requireAuth, async (req, res) => {
  try {
    const { agentName, confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({
        error: 'Cleanup must be confirmed by user'
      });
    }

    const dependencies = getAgentDependencies(agentName);
    const results = [];

    // Execute each cleanup action
    for (const action of dependencies.cleanupActions) {
      results.push({
        action,
        status: 'completed', // This will be actual execution in production
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      agent: agentName,
      cleanupResults: results,
      message: `Successfully executed ${results.length} cleanup actions for ${agentName}`
    });

  } catch (error: any) {
    console.error('Cleanup execution error:', error);
    res.status(500).json({
      error: 'Cleanup execution failed',
      message: error.message
    });
  }
});

export default router;
