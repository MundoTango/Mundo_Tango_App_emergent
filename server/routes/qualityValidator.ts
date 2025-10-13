import { Router, Request, Response } from 'express';
import { qualityValidatorService } from '../services/qualityValidatorService';

/**
 * Agent #79: Quality Validator Backend API
 * Root cause analysis, pattern library search, agent collaboration, solution tracking
 */

const router = Router();

/**
 * POST /api/quality-validator/analyze
 * Analyze an issue and find root cause with AI
 */
router.post('/api/quality-validator/analyze', async (req: Request, res: Response) => {
  try {
    const { issue, type, context, stackTrace, affectedComponents } = req.body;

    if (!issue) {
      return res.status(400).json({ error: 'Issue description required' });
    }

    const analysis = await qualityValidatorService.analyzeIssue({
      description: issue,
      type,
      context,
      stackTrace,
      affectedComponents
    });

    res.json(analysis);
  } catch (error) {
    console.error('[Quality Validator] Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze issue',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality-validator/patterns
 * Search pattern library with query
 */
router.get('/api/quality-validator/patterns', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const patterns = await qualityValidatorService.searchPatternLibrary(query);

    res.json({
      query,
      patterns,
      total: patterns.length
    });
  } catch (error) {
    console.error('[Quality Validator] Pattern search error:', error);
    res.status(500).json({ error: 'Pattern search failed' });
  }
});

/**
 * POST /api/quality-validator/ask-agents
 * Request help from peer agents (A2A communication)
 */
router.post('/api/quality-validator/ask-agents', async (req: Request, res: Response) => {
  try {
    const { question, issueType } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const responses = await qualityValidatorService.askPeerAgents(question, issueType);

    res.json({
      question,
      responses,
      agentsConsulted: responses.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Quality Validator] Collaboration error:', error);
    res.status(500).json({ error: 'Collaboration request failed' });
  }
});

/**
 * GET /api/quality-validator/solutions/:issueId
 * Get solutions for a specific issue pattern
 */
router.get('/api/quality-validator/solutions/:issueId', async (req: Request, res: Response) => {
  try {
    const issueId = parseInt(req.params.issueId);

    if (isNaN(issueId)) {
      return res.status(400).json({ error: 'Invalid issue ID' });
    }

    const patterns = await qualityValidatorService.searchPatternLibrary('');
    const pattern = patterns.find(p => p.id === issueId);

    if (!pattern) {
      return res.status(404).json({ error: 'Pattern not found' });
    }

    const stats = await qualityValidatorService.getSolutionStats(issueId);

    res.json({
      issueId,
      pattern: pattern.pattern,
      rootCause: pattern.rootCause,
      solutions: pattern.solutions,
      codeExamples: pattern.codeExamples,
      effectiveness: pattern.effectiveness,
      stats
    });
  } catch (error) {
    console.error('[Quality Validator] Get solutions error:', error);
    res.status(500).json({ error: 'Failed to get solutions' });
  }
});

/**
 * POST /api/quality-validator/add-pattern
 * Add a new pattern to the library
 */
router.post('/api/quality-validator/add-pattern', async (req: Request, res: Response) => {
  try {
    const { pattern, issueType, rootCause, solutions, codeExamples, agentId, category, tags } = req.body;

    if (!pattern || !issueType || !rootCause || !solutions) {
      return res.status(400).json({ 
        error: 'Missing required fields: pattern, issueType, rootCause, solutions' 
      });
    }

    const newPattern = await qualityValidatorService.addPattern({
      pattern,
      issueType,
      rootCause,
      solutions,
      codeExamples,
      agentId,
      category,
      tags
    });

    res.json({
      success: true,
      pattern: newPattern,
      message: 'Pattern added successfully'
    });
  } catch (error) {
    console.error('[Quality Validator] Add pattern error:', error);
    res.status(500).json({ error: 'Failed to add pattern' });
  }
});

/**
 * POST /api/quality-validator/track-solution
 * Track solution reuse and effectiveness
 */
router.post('/api/quality-validator/track-solution', async (req: Request, res: Response) => {
  try {
    const { solutionId, reusedBy, issueContext, successful, feedback } = req.body;

    if (!solutionId || !reusedBy || !issueContext || successful === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: solutionId, reusedBy, issueContext, successful' 
      });
    }

    await qualityValidatorService.trackSolutionReuse({
      solutionId: parseInt(solutionId),
      reusedBy,
      issueContext,
      successful,
      feedback
    });

    res.json({
      success: true,
      message: 'Solution reuse tracked successfully'
    });
  } catch (error) {
    console.error('[Quality Validator] Track solution error:', error);
    res.status(500).json({ error: 'Failed to track solution' });
  }
});

/**
 * POST /api/quality-validator/suggest-solutions
 * Get AI-suggested solutions for a root cause
 */
router.post('/api/quality-validator/suggest-solutions', async (req: Request, res: Response) => {
  try {
    const { rootCause } = req.body;

    if (!rootCause) {
      return res.status(400).json({ error: 'Root cause required' });
    }

    const solutions = await qualityValidatorService.suggestSolutions(rootCause);

    res.json({
      rootCause,
      solutions,
      count: solutions.length
    });
  } catch (error) {
    console.error('[Quality Validator] Suggest solutions error:', error);
    res.status(500).json({ error: 'Failed to suggest solutions' });
  }
});

/**
 * GET /api/quality-validator/stats
 * Get overall quality validation statistics
 */
router.get('/api/quality-validator/stats', async (req: Request, res: Response) => {
  try {
    const patterns = await qualityValidatorService.searchPatternLibrary('');

    const stats = {
      totalPatterns: patterns.length,
      avgEffectiveness: patterns.reduce((sum, p) => sum + p.effectiveness, 0) / Math.max(patterns.length, 1),
      totalReuses: patterns.reduce((sum, p) => sum + p.timesReused, 0),
      topPatterns: patterns
        .sort((a, b) => b.effectiveness - a.effectiveness)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          pattern: p.pattern,
          effectiveness: p.effectiveness,
          timesReused: p.timesReused
        }))
    };

    res.json(stats);
  } catch (error) {
    console.error('[Quality Validator] Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
