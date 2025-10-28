/**
 * MB.MD DEPLOYMENT ROUTES
 * Controlled rollout endpoints with QA Agent veto power
 * Created: October 28, 2025
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { DeploymentGate } from '../services/mbmd/DeploymentGate';
import { getUserId } from '../utils/authHelper';
import { storage } from '../storage';

const router = Router();
const deploymentGate = new DeploymentGate();

/**
 * POST /api/mbmd/deploy/validate
 * Validate deployment readiness with QA Agent
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only super admins can deploy
    const user = await storage.getUser(typeof userId === 'string' ? parseInt(userId) : userId);
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const schema = z.object({
      sessionId: z.number(),
      deploymentTarget: z.enum(['super_admin', 'beta_10_percent', 'production_100_percent']),
      screenshots: z.array(z.string()).min(3),
      browserLogs: z.string().optional(),
      serverLogs: z.string().optional(),
      testResults: z.any().optional(),
      integrationProof: z.any().optional(),
      architectReviewed: z.boolean(),
      architectApproval: z.string().optional()
    });

    const data = schema.parse(req.body);

    // Validate deployment with QA Agent
    const decision = await deploymentGate.validateDeployment({
      sessionId: data.sessionId,
      deploymentTarget: data.deploymentTarget,
      evidencePackage: {
        screenshots: data.screenshots,
        browserLogs: data.browserLogs,
        serverLogs: data.serverLogs,
        testResults: data.testResults,
        integrationProof: data.integrationProof,
        architectReviewed: data.architectReviewed,
        architectApproval: data.architectApproval
      }
    });

    return res.json({
      approved: decision.approved,
      phase: decision.phase,
      reason: decision.reason
    });

  } catch (error) {
    console.error('❌ [MB.MD Deploy] Validation error:', error);
    return res.status(500).json({ 
      error: 'Deployment validation failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/mbmd/deploy/execute
 * Execute controlled deployment (Phase 1 only for now)
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only super admins can deploy
    const user = await storage.getUser(typeof userId === 'string' ? parseInt(userId) : userId);
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const schema = z.object({
      sessionId: z.number(),
      featureName: z.string(),
      phase: z.enum(['phase_1', 'phase_2', 'phase_3'])
    });

    const data = schema.parse(req.body);

    // Phase 1: Super admin only (already deployed if running)
    if (data.phase === 'phase_1') {
      console.log(`✅ [MB.MD Deploy] Phase 1 deployment for ${data.featureName} (super admin only)`);
      
      return res.json({
        success: true,
        phase: 'phase_1',
        message: `${data.featureName} deployed to super admins`,
        rolloutPercentage: 0 // Super admin group only
      });
    }

    // Phase 2 & 3: Not implemented yet (requires feature flag infrastructure)
    return res.status(501).json({ 
      error: 'Phase 2 and 3 deployments require feature flag infrastructure',
      hint: 'Use /admin/feature-flags API to enable for specific groups'
    });

  } catch (error) {
    console.error('❌ [MB.MD Deploy] Execution error:', error);
    return res.status(500).json({ 
      error: 'Deployment execution failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/mbmd/deploy/health/:deploymentId
 * Check deployment health (for automated rollback)
 */
router.get('/health/:deploymentId', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const health = await deploymentGate.checkProductionHealth(req.params.deploymentId);

    return res.json({
      healthy: health.healthy,
      shouldRollback: health.shouldRollback,
      reason: health.reason
    });

  } catch (error) {
    console.error('❌ [MB.MD Deploy] Health check error:', error);
    return res.status(500).json({ 
      error: 'Health check failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
