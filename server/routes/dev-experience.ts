/**
 * ESA 61x21 - Developer Experience Expert API Routes
 * Agent 15: Testing, documentation, dev tooling
 */

import { Router } from 'express';
import { getExpertAgent } from '../esa-agents/agent-system';

const router = Router();

function getAgent() {
  return getExpertAgent('dev_experience');
}

/**
 * GET /api/dev-experience/status
 * Get agent status and capabilities
 */
router.get('/status', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Developer Experience Expert not initialized' });
    }

    res.json({
      agent: 'Developer Experience Expert',
      status: 'operational',
      capabilities: [
        'Test coverage analysis',
        'Documentation completeness checks',
        'Developer tooling audit',
        'Workflow optimization',
      ],
      tools: ['Vitest', 'Storybook', 'Playwright', 'TypeDoc'],
      layers: [1, 2, 3, 57],
    });
  } catch (error) {
    console.error('[Dev Experience Expert] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * GET /api/dev-experience/coverage
 * Get test coverage metrics
 */
router.get('/coverage', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Developer Experience Expert not initialized' });
    }

    const coverage = await agent.execute('getTestCoverage', {});
    res.json(coverage);
  } catch (error) {
    console.error('[Dev Experience Expert] Coverage error:', error);
    res.status(500).json({ error: 'Failed to get coverage' });
  }
});

/**
 * POST /api/dev-experience/suggest-tests
 * Get test suggestions for a file
 */
router.post('/suggest-tests', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Developer Experience Expert not initialized' });
    }

    const { file } = req.body;
    const suggestions = await agent.execute('suggestTests', { file });
    res.json(suggestions);
  } catch (error) {
    console.error('[Dev Experience Expert] Suggest tests error:', error);
    res.status(500).json({ error: 'Failed to suggest tests' });
  }
});

/**
 * GET /api/dev-experience/docs
 * Check documentation status
 */
router.get('/docs', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Developer Experience Expert not initialized' });
    }

    const docs = await agent.execute('checkDocs', {});
    res.json(docs);
  } catch (error) {
    console.error('[Dev Experience Expert] Docs check error:', error);
    res.status(500).json({ error: 'Failed to check docs' });
  }
});

/**
 * GET /api/dev-experience/setup
 * Analyze developer setup
 */
router.get('/setup', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Developer Experience Expert not initialized' });
    }

    const setup = await agent.execute('analyzeDevSetup', {});
    res.json(setup);
  } catch (error) {
    console.error('[Dev Experience Expert] Setup analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze setup' });
  }
});

export default router;
