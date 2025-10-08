/**
 * ESA 61x21 - Code Quality Expert API Routes
 * Agent 14: Linting, security scanning, code standards
 */

import { Router } from 'express';
import { getExpertAgent } from '../esa-agents/agent-system';

const router = Router();

function getAgent() {
  return getExpertAgent('code_quality');
}

/**
 * GET /api/code-quality/status
 * Get agent status and capabilities
 */
router.get('/status', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Code Quality Expert not initialized' });
    }

    res.json({
      agent: 'Code Quality Expert',
      status: 'operational',
      capabilities: [
        'ESLint and TypeScript linting',
        'Security vulnerability scanning',
        'Code complexity analysis',
        'Best practices enforcement',
      ],
      tools: ['ESLint', 'SonarQube Community', 'Snyk', 'Prettier'],
      layers: [6, 7, 57],
    });
  } catch (error) {
    console.error('[Code Quality Expert] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * POST /api/code-quality/lint
 * Run linter on codebase
 */
router.post('/lint', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Code Quality Expert not initialized' });
    }

    const { files } = req.body;
    const issues = await agent.execute('lint', { files });
    res.json({ issues });
  } catch (error) {
    console.error('[Code Quality Expert] Lint error:', error);
    res.status(500).json({ error: 'Failed to lint' });
  }
});

/**
 * GET /api/code-quality/security
 * Check for security vulnerabilities
 */
router.get('/security', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Code Quality Expert not initialized' });
    }

    const vulnerabilities = await agent.execute('checkSecurity', {});
    res.json({ vulnerabilities });
  } catch (error) {
    console.error('[Code Quality Expert] Security check error:', error);
    res.status(500).json({ error: 'Failed to check security' });
  }
});

/**
 * GET /api/code-quality/analysis
 * Get code quality analysis
 */
router.get('/analysis', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Code Quality Expert not initialized' });
    }

    const analysis = await agent.execute('analyzeQuality', {});
    res.json(analysis);
  } catch (error) {
    console.error('[Code Quality Expert] Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze quality' });
  }
});

/**
 * POST /api/code-quality/suggest-fixes
 * Get fix suggestions for a file
 */
router.post('/suggest-fixes', async (req, res) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Code Quality Expert not initialized' });
    }

    const { file } = req.body;
    const fixes = await agent.execute('suggestFixes', { file });
    res.json(fixes);
  } catch (error) {
    console.error('[Code Quality Expert] Suggest fixes error:', error);
    res.status(500).json({ error: 'Failed to suggest fixes' });
  }
});

export default router;
