/**
 * AGENT #142 (Multi-Model): Terminal Command Execution Routes
 * 
 * Secure terminal execution with allow/deny lists
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md
 */

import { Router, type Request, type Response } from 'express';
import { terminalExecutor } from '../services/terminalExecutor';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { logger } from '../lib/logger';

const router = Router();

/**
 * POST /api/terminal/execute
 * Execute single terminal command (super admin only)
 */
router.post('/execute', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { command, timeout } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    const result = await terminalExecutor.execute(command, timeout);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error({ error }, '[Terminal API] Failed to execute command');
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

/**
 * POST /api/terminal/execute-sequence
 * Execute multiple commands sequentially (super admin only)
 */
router.post('/execute-sequence', requireAuth, requireRole({ roles: ['super_admin'] }), async (req: Request, res: Response) => {
  try {
    const { commands } = req.body;

    if (!Array.isArray(commands) || commands.length === 0) {
      return res.status(400).json({ error: 'Commands array is required' });
    }

    const results = await terminalExecutor.executeSequence(commands);

    const allSuccessful = results.every((r) => r.success);

    res.json({
      success: allSuccessful,
      results,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    logger.error({ error }, '[Terminal API] Failed to execute sequence');
    res.status(500).json({ error: 'Failed to execute command sequence' });
  }
});

/**
 * GET /api/terminal/config
 * Get terminal executor configuration
 */
router.get('/config', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const config = terminalExecutor.getConfig();
    res.json({ success: true, config });
  } catch (error) {
    logger.error({ error }, '[Terminal API] Failed to get config');
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

/**
 * POST /api/terminal/allowed-command
 * Add allowed command (super admin only)
 */
router.post('/allowed-command', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    terminalExecutor.addAllowedCommand(command);

    res.json({
      success: true,
      message: `Command added to allowed list: ${command}`,
      config: terminalExecutor.getConfig(),
    });
  } catch (error) {
    logger.error({ error }, '[Terminal API] Failed to add allowed command');
    res.status(500).json({ error: 'Failed to add allowed command' });
  }
});

/**
 * DELETE /api/terminal/allowed-command
 * Remove allowed command (super admin only)
 */
router.delete('/allowed-command', requireAuth, requireRole({ roles: ['super_admin'] }), (req: Request, res: Response) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    terminalExecutor.removeAllowedCommand(command);

    res.json({
      success: true,
      message: `Command removed from allowed list: ${command}`,
      config: terminalExecutor.getConfig(),
    });
  } catch (error) {
    logger.error({ error }, '[Terminal API] Failed to remove allowed command');
    res.status(500).json({ error: 'Failed to remove allowed command' });
  }
});

export default router;
