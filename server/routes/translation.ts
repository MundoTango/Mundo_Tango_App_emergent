/**
 * Translation Expert API Routes
 * Endpoints for i18n management, translation coverage, and automation
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getExpertAgent } from '../esa-agents/agent-system';

const router = Router();

function getAgent() {
  return getExpertAgent('translation_expert');
}

/**
 * GET /api/translation/status
 * Get Translation Expert status and capabilities
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Translation Expert not initialized' });
    }
    
    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        layers: agent.layers,
      },
      capabilities: {
        scan_components: 'Detect hardcoded strings and translation usage',
        detect_missing: 'Find missing translations across languages',
        batch_translate: 'Automated translation via OpenAI GPT-4o',
        coverage_report: 'Generate translation coverage metrics',
        validate_usage: 'Validate i18n implementation patterns',
      },
      supportedLanguages: {
        active: 6,
        total: 68,
      },
    });
  } catch (error: any) {
    console.error('Translation status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/translation/scan-components
 * Scan components for translation coverage
 */
router.post('/scan-components', async (req: Request, res: Response) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Translation Expert not initialized' });
    }
    
    const { componentPath } = req.body;
    
    const results = await agent.execute('scanComponents', {
      componentPath,
    });
    
    const summary = {
      totalComponents: results.length,
      averageCoverage: Math.round(
        results.reduce((sum: number, r: any) => sum + r.coverage, 0) / results.length
      ),
      componentsNeedingWork: results.filter((r: any) => r.coverage < 100).length,
      totalHardcodedStrings: results.reduce(
        (sum: number, r: any) => sum + r.hardcodedStrings.length,
        0
      ),
    };
    
    res.json({
      success: true,
      summary,
      components: results,
    });
  } catch (error: any) {
    console.error('Translation scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/translation/detect-missing
 * Detect missing translations across languages
 */
router.post('/detect-missing', async (req: Request, res: Response) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Translation Expert not initialized' });
    }
    
    const { languages } = req.body;
    
    const missing = await agent.execute('detectMissingTranslations', {
      languages,
    });
    
    res.json({
      success: true,
      count: missing.length,
      missing,
    });
  } catch (error: any) {
    console.error('Translation detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/translation/batch-translate
 * Batch translate keys via OpenAI
 */
router.post('/batch-translate', async (req: Request, res: Response) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Translation Expert not initialized' });
    }
    
    const { keys, targetLanguages } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'Keys array is required' });
    }
    
    const translations = await agent.execute('batchTranslate', {
      keys,
      targetLanguages,
    });
    
    res.json({
      success: true,
      translations,
    });
  } catch (error: any) {
    console.error('Translation batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/translation/coverage-report
 * Generate translation coverage report
 */
router.get('/coverage-report', async (req: Request, res: Response) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Translation Expert not initialized' });
    }
    
    const { languages } = req.query;
    const languageList = languages ? (languages as string).split(',') : undefined;
    
    const coverage = await agent.execute('getCoverageReport', {
      languages: languageList,
    });
    
    const summary = {
      averageCoverage: Math.round(
        coverage.reduce((sum: number, c: any) => sum + c.coverage, 0) / coverage.length
      ),
      totalLanguages: coverage.length,
      fullyTranslated: coverage.filter((c: any) => c.coverage === 100).length,
      needsWork: coverage.filter((c: any) => c.coverage < 100).length,
    };
    
    res.json({
      success: true,
      summary,
      coverage,
    });
  } catch (error: any) {
    console.error('Translation coverage error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/translation/hardcoded-strings
 * Get all hardcoded strings across components
 */
router.get('/hardcoded-strings', async (req: Request, res: Response) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Translation Expert not initialized' });
    }
    
    const { componentPath } = req.query;
    
    const hardcoded = await agent.execute('getHardcodedStrings', {
      componentPath,
    });
    
    res.json({
      success: true,
      count: hardcoded.length,
      hardcoded,
    });
  } catch (error: any) {
    console.error('Hardcoded strings error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/translation/validate
 * Validate i18n implementation patterns
 */
router.get('/validate', async (req: Request, res: Response) => {
  try {
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: 'Translation Expert not initialized' });
    }
    
    const { componentPath } = req.query;
    
    const issues = await agent.execute('validateI18nUsage', {
      componentPath,
    });
    
    res.json({
      success: true,
      issueCount: issues.length,
      issues,
    });
  } catch (error: any) {
    console.error('Translation validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
