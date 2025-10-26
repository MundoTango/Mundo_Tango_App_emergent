/**
 * AGENT #145 (Testing): DeepEval Testing Routes
 * 
 * LLM-as-Judge evaluation endpoints
 * Research: docs/research/TESTING_OBSERVABILITY_RESEARCH.md
 */

import { Router, type Request, type Response } from 'express';
import { deepEvalTesting, type TestCase } from '../services/deepEvalTesting';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { logger } from '../lib/logger';

const router = Router();

/**
 * POST /api/testing/evaluate
 * Evaluate single test case
 */
router.post('/evaluate', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const testCase: TestCase = req.body;

    if (!testCase.id || !testCase.input || !testCase.actualOutput) {
      return res.status(400).json({
        error: 'Missing required fields: id, input, actualOutput',
      });
    }

    const result = await deepEvalTesting.evaluate(testCase);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error({ error }, '[Testing API] Failed to evaluate test case');
    res.status(500).json({ error: 'Failed to evaluate test case' });
  }
});

/**
 * POST /api/testing/evaluate-batch
 * Evaluate multiple test cases
 */
router.post('/evaluate-batch', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { testCases }: { testCases: TestCase[] } = req.body;

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ error: 'Test cases array is required' });
    }

    const results = await deepEvalTesting.evaluateBatch(testCases);

    const passRate = results.filter((r) => r.passed).length / results.length;

    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
        passRate: passRate,
      },
    });
  } catch (error) {
    logger.error({ error }, '[Testing API] Failed to evaluate batch');
    res.status(500).json({ error: 'Failed to evaluate test cases' });
  }
});

/**
 * POST /api/testing/monte-carlo
 * Run Monte Carlo test (multiple runs with success threshold)
 */
router.post('/monte-carlo', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { testCase, runs = 100, successThreshold = 0.9 }: {
      testCase: TestCase;
      runs?: number;
      successThreshold?: number;
    } = req.body;

    if (!testCase || !testCase.id || !testCase.input || !testCase.actualOutput) {
      return res.status(400).json({
        error: 'Valid test case is required',
      });
    }

    const result = await deepEvalTesting.monteCarloTest(testCase, runs, successThreshold);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error({ error }, '[Testing API] Failed to run Monte Carlo test');
    res.status(500).json({ error: 'Failed to run Monte Carlo test' });
  }
});

export default router;
