/**
 * UI Sub-Agents API Routes
 * Endpoints for managing autonomous UI sub-agents under Agent #11
 */

import { Router } from 'express';
import { uiSubAgents } from '../esa-agents/ui-sub-agents';
import { db } from '../db';
import { agentSchedules, componentHistory } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// =============================================================================
// Agent #11.1: Dark Mode Fixer Routes
// =============================================================================

/**
 * POST /api/ui-sub-agents/dark-mode-fixer/scan
 * Trigger autonomous dark mode scan and fix
 */
router.post('/dark-mode-fixer/scan', async (req, res) => {
  try {
    const { autoFix = true, reportOnly = false } = req.body;

    console.log('[UI Sub-Agents] Starting Dark Mode Fixer scan...');
    const report = await uiSubAgents.darkModeFixer.execute('scanAndFix', {
      autoFix,
      reportOnly,
    });

    res.json({
      success: true,
      report,
      message: `Scan complete: ${report.issuesFixed} issues fixed out of ${report.issuesFound} found`,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Dark Mode Fixer error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ui-sub-agents/dark-mode-fixer/report
 * Get latest dark mode fixer report
 */
router.get('/dark-mode-fixer/report', async (req, res) => {
  try {
    const report = await uiSubAgents.darkModeFixer.execute('getReport', {});

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'No report available. Run a scan first.',
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================================================================
// Agent #11.2: Translation Fixer Routes
// =============================================================================

/**
 * POST /api/ui-sub-agents/translation-fixer/scan
 * Trigger autonomous translation scan and fix
 */
router.post('/translation-fixer/scan', async (req, res) => {
  try {
    const { autoFix = true, reportOnly = false } = req.body;

    console.log('[UI Sub-Agents] Starting Translation Fixer scan...');
    const report = await uiSubAgents.translationFixer.execute('scanAndFix', {
      autoFix,
      reportOnly,
    });

    res.json({
      success: true,
      report,
      message: `Scan complete: ${report.stringsFixed} strings fixed out of ${report.stringsFound} found`,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Translation Fixer error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ui-sub-agents/translation-fixer/report
 * Get latest translation fixer report
 */
router.get('/translation-fixer/report', async (req, res) => {
  try {
    const report = await uiSubAgents.translationFixer.execute('getReport', {});

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'No report available. Run a scan first.',
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================================================================
// Agent #11.3: Accessibility Auditor Routes
// =============================================================================

/**
 * POST /api/ui-sub-agents/accessibility-auditor/audit
 * Audit a specific file for accessibility issues
 */
router.post('/accessibility-auditor/audit', async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'filePath is required',
      });
    }

    console.log('[UI Sub-Agents] Auditing file:', filePath);
    const report = await uiSubAgents.accessibilityAuditor.execute('auditFile', { filePath });

    res.json({
      success: true,
      report,
      message: `Audit complete: ${report.issuesFound} issues found, ${report.issuesFixed} fixed`,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Accessibility Auditor error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================================================================
// Agent #11.5: Component Watcher Routes
// =============================================================================

/**
 * POST /api/ui-sub-agents/component-watcher/start
 * Start the component file watcher
 */
router.post('/component-watcher/start', async (req, res) => {
  try {
    await uiSubAgents.componentWatcher.execute('start', {});

    res.json({
      success: true,
      message: 'Component watcher started successfully',
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Component Watcher start error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ui-sub-agents/component-watcher/stop
 * Stop the component file watcher
 */
router.post('/component-watcher/stop', async (req, res) => {
  try {
    await uiSubAgents.componentWatcher.execute('stop', {});

    res.json({
      success: true,
      message: 'Component watcher stopped successfully',
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Component Watcher stop error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ui-sub-agents/component-watcher/stats
 * Get component watcher statistics
 */
router.get('/component-watcher/stats', async (req, res) => {
  try {
    const stats = await uiSubAgents.componentWatcher.execute('getStats', {});

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Component Watcher stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================================================================
// Agent Schedule Management
// =============================================================================

/**
 * POST /api/ui-sub-agents/schedules
 * Create or update agent schedule
 */
router.post('/schedules', async (req, res) => {
  try {
    const { agentId, agentName, schedule } = req.body;

    if (!agentId || !agentName || !schedule) {
      return res.status(400).json({
        success: false,
        error: 'agentId, agentName, and schedule are required',
      });
    }

    // Calculate next run time based on cron schedule
    const nextRun = new Date(Date.now() + 60000); // Simple: 1 minute from now

    const result = await db
      .insert(agentSchedules)
      .values({
        agentId,
        agentName,
        schedule,
        nextRun,
        status: 'active',
      })
      .onConflictDoUpdate({
        target: [agentSchedules.agentId],
        set: {
          agentName,
          schedule,
          nextRun,
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({
      success: true,
      schedule: result[0],
      message: 'Schedule created/updated successfully',
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Schedule creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ui-sub-agents/schedules
 * Get all agent schedules
 */
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await db.select().from(agentSchedules);

    res.json({
      success: true,
      schedules,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ui-sub-agents/schedules/:agentId
 * Get specific agent schedule
 */
router.get('/schedules/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    const schedule = await db
      .select()
      .from(agentSchedules)
      .where(eq(agentSchedules.agentId, agentId))
      .limit(1);

    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    res.json({
      success: true,
      schedule: schedule[0],
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================================================================
// Component History
// =============================================================================

/**
 * GET /api/ui-sub-agents/component-history/:componentPath
 * Get history for a specific component
 */
router.get('/component-history/:componentPath(*)', async (req, res) => {
  try {
    const { componentPath } = req.params;

    const history = await db
      .select()
      .from(componentHistory)
      .where(eq(componentHistory.componentPath, componentPath))
      .orderBy(componentHistory.timestamp);

    res.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Error fetching component history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ui-sub-agents/summary
 * Get summary of all UI sub-agents
 */
router.get('/summary', async (req, res) => {
  try {
    const schedules = await db.select().from(agentSchedules);
    const darkModeReport = await uiSubAgents.darkModeFixer.execute('getReport', {});
    const translationReport = await uiSubAgents.translationFixer.execute('getReport', {});
    const watcherStats = await uiSubAgents.componentWatcher.execute('getStats', {});

    res.json({
      success: true,
      summary: {
        totalAgents: 4,
        activeSchedules: schedules.filter((s) => s.status === 'active').length,
        darkMode: darkModeReport
          ? {
              issuesFound: darkModeReport.issuesFound,
              issuesFixed: darkModeReport.issuesFixed,
              coverage: darkModeReport.issuesFound > 0
                ? Math.round((darkModeReport.issuesFixed / darkModeReport.issuesFound) * 100)
                : 100,
            }
          : null,
        translation: translationReport
          ? {
              stringsFound: translationReport.stringsFound,
              stringsFixed: translationReport.stringsFixed,
              coverage: translationReport.stringsFound > 0
                ? Math.round((translationReport.stringsFixed / translationReport.stringsFound) * 100)
                : 100,
            }
          : null,
        watcher: watcherStats,
      },
    });
  } catch (error: any) {
    console.error('[UI Sub-Agents] Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
