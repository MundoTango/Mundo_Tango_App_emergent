/**
 * UI/UX Design Expert API Routes
 * Endpoints for Aurora Tide design system analysis and optimization
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// In-memory reference to the UI/UX Expert agent
// Will be injected when the agent system initializes
let uiUXExpertAgent: any = null;

export function setUIUXExpertAgent(agent: any) {
  uiUXExpertAgent = agent;
}

/**
 * GET /api/ui-ux/components
 * Get all Aurora Tide components with metadata
 */
router.get('/components', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const { type, includeStats = 'true' } = req.query;
    
    const components = await uiUXExpertAgent.execute('getComponents', {
      type,
      includeStats: includeStats === 'true',
    });
    
    res.json({
      success: true,
      count: components.length,
      components,
    });
  } catch (error: any) {
    console.error('UI/UX components error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ui-ux/audit/accessibility
 * Run accessibility audit on components
 */
router.post('/audit/accessibility', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const { component, severity } = req.body;
    
    const issues = await uiUXExpertAgent.execute('auditAccessibility', {
      component,
      severity,
    });
    
    res.json({
      success: true,
      count: issues.length,
      issues,
      summary: {
        critical: issues.filter((i: any) => i.severity === 'critical').length,
        serious: issues.filter((i: any) => i.severity === 'serious').length,
        moderate: issues.filter((i: any) => i.severity === 'moderate').length,
        minor: issues.filter((i: any) => i.severity === 'minor').length,
      },
    });
  } catch (error: any) {
    console.error('UI/UX accessibility audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ui-ux/design-system
 * Analyze entire Aurora Tide design system
 */
router.get('/design-system', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const analysis = await uiUXExpertAgent.execute('analyzeDesign', {});
    
    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('UI/UX design system analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ui-ux/report
 * Generate comprehensive design system report
 */
router.get('/report', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const { format = 'json' } = req.query;
    
    const report = await uiUXExpertAgent.execute('generateReport', {
      format,
    });
    
    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('UI/UX report generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ui-ux/suggestions
 * Get component improvement suggestions
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const { type, impact, effort } = req.query;
    
    const suggestions = await uiUXExpertAgent.execute('suggestImprovements', {
      type,
      impact,
      effort,
    });
    
    res.json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error: any) {
    console.error('UI/UX suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ui-ux/consistency
 * Check design consistency across platform
 */
router.get('/consistency', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const consistency = await uiUXExpertAgent.execute('checkConsistency', {});
    
    res.json({
      success: true,
      consistency,
    });
  } catch (error: any) {
    console.error('UI/UX consistency check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ui-ux/dark-mode
 * Verify dark mode coverage
 */
router.get('/dark-mode', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    // Trigger dark mode verification job
    await uiUXExpertAgent.addJob('verify_dark_mode', {});
    
    // Get cached results
    const darkMode = await uiUXExpertAgent.getSharedState('dark_mode_coverage');
    
    res.json({
      success: true,
      darkMode: darkMode || { supported: 0, missing: 0, issues: [] },
    });
  } catch (error: any) {
    console.error('UI/UX dark mode check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ui-ux/i18n
 * Check internationalization coverage
 */
router.get('/i18n', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    // Trigger i18n check job
    await uiUXExpertAgent.addJob('check_i18n', {});
    
    // Get cached results
    const i18n = await uiUXExpertAgent.getSharedState('i18n_coverage');
    
    res.json({
      success: true,
      i18n: i18n || { supported: 0, missing: 0, issues: [] },
    });
  } catch (error: any) {
    console.error('UI/UX i18n check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ui-ux/evaluate-tool
 * Evaluate a design tool for ESA platform
 */
router.post('/evaluate-tool', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const { tool } = req.body;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool name required (penpot, storybook, axeCore, playwright)' });
    }
    
    const evaluation = await uiUXExpertAgent.addJob('evaluate_tool', { tool });
    
    res.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    console.error('UI/UX tool evaluation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ui-ux/scan
 * Trigger full design system scan
 */
router.post('/scan', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    // Trigger comprehensive scan
    await uiUXExpertAgent.addJob('scan_components', {});
    await uiUXExpertAgent.addJob('analyze_design_patterns', {});
    await uiUXExpertAgent.addJob('audit_accessibility', {});
    await uiUXExpertAgent.addJob('suggest_components', {});
    
    res.json({
      success: true,
      message: 'Design system scan initiated',
    });
  } catch (error: any) {
    console.error('UI/UX scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ui-ux/status
 * Get UI/UX Expert agent status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    if (!uiUXExpertAgent) {
      return res.status(503).json({ error: 'UI/UX Expert not initialized' });
    }
    
    const status = {
      initialized: true,
      name: uiUXExpertAgent.name,
      layers: uiUXExpertAgent.layers,
      lastScan: await uiUXExpertAgent.getSharedState('ui_components_latest'),
    };
    
    res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    console.error('UI/UX status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
