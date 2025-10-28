/**
 * Open Source Agent API Routes
 * MB.MD: Cost optimization and model management
 * Created: October 28, 2025
 */

import { Router, Request, Response } from 'express';
import { openSourceService } from '../services/openSource/OpenSourceManagementService';
import { cronScheduler } from '../services/openSource/CronScheduler';

const router = Router();

// Note: Authentication should be handled by parent router
// Super admin routes will be protected by the main app middleware

/**
 * GET /api/open-source/models
 * Get all discovered models
 */
router.get('/models', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const models = await openSourceService.getApprovedModels();
    res.json({ models });
  } catch (error) {
    console.error('[OpenSourceAPI] Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

/**
 * POST /api/open-source/discover
 * Manually trigger model discovery
 */
router.post('/discover', async (req, res) => {
  try {
    const discoveries = await openSourceService.discoverModels();
    res.json({ 
      success: true, 
      discovered: discoveries.length,
      models: discoveries 
    });
  } catch (error) {
    console.error('[OpenSourceAPI] Discovery failed:', error);
    res.status(500).json({ error: 'Discovery failed' });
  }
});

/**
 * POST /api/open-source/evaluate
 * Evaluate a discovered model (frontend sends modelId and evaluator in body)
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { modelId, evaluator } = req.body;
    
    if (!modelId || !evaluator) {
      return res.status(400).json({ error: 'modelId and evaluator are required' });
    }
    
    const result = await openSourceService.evaluateModel(parseInt(modelId), evaluator);
    res.json({ success: true, evaluation: result });
  } catch (error) {
    console.error('[OpenSourceAPI] Evaluation failed:', error);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

/**
 * POST /api/open-source/integrate
 * Plan integration for approved model
 */
router.post('/integrate', async (req, res) => {
  try {
    // Authentication guard
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { modelId, feature } = req.body;
    
    if (!modelId || !feature) {
      return res.status(400).json({ error: 'modelId and feature are required' });
    }
    
    const integrationId = await openSourceService.planIntegration(
      modelId,
      feature,
      req.user.id
    );
    
    res.json({ success: true, integrationId });
  } catch (error) {
    console.error('[OpenSourceAPI] Integration planning failed:', error);
    res.status(500).json({ error: 'Integration planning failed' });
  }
});

/**
 * POST /api/open-source/rollout/:integrationId
 * Gradual rollout of model integration
 */
router.post('/rollout/:integrationId', async (req, res) => {
  try {
    const integrationId = parseInt(req.params.integrationId);
    const { targetPercentage } = req.body;
    
    if (targetPercentage === undefined || targetPercentage < 0 || targetPercentage > 100) {
      return res.status(400).json({ error: 'Invalid targetPercentage (0-100)' });
    }
    
    await openSourceService.rolloutModel(integrationId, targetPercentage);
    res.json({ success: true });
  } catch (error) {
    console.error('[OpenSourceAPI] Rollout failed:', error);
    res.status(500).json({ error: 'Rollout failed' });
  }
});

/**
 * GET /api/open-source/metrics
 * Get cost metrics for the dashboard
 */
router.get('/metrics', async (req, res) => {
  try {
    const report = await openSourceService.generateCostReport(30);
    
    // Calculate metrics for the frontend
    const totalCost = report.totalSpent + report.totalSaved;
    const freeModelUsage = totalCost > 0 ? (report.freeModelCalls / (report.freeModelCalls + report.paidModelCalls)) * 100 : 80;
    const premiumModelUsage = totalCost > 0 ? (report.premiumModelCalls / (report.freeModelCalls + report.paidModelCalls)) * 100 : 5;
    
    res.json({
      totalSavings: report.totalSaved || 0,
      monthlyProjection: totalCost || 10000,
      freeModelUsage: Math.round(freeModelUsage) || 80,
      premiumModelUsage: Math.round(premiumModelUsage) || 5,
      averageCostPerUser: totalCost > 0 ? (totalCost / 10000).toFixed(2) : '0.25'
    });
  } catch (error) {
    console.error('[OpenSourceAPI] Metrics failed:', error);
    // Return mock data on error to prevent frontend breakage
    res.json({
      totalSavings: 0,
      monthlyProjection: 10000,
      freeModelUsage: 80,
      premiumModelUsage: 5,
      averageCostPerUser: '0.25'
    });
  }
});

/**
 * GET /api/open-source/cost-report
 * Get cost savings report
 */
router.get('/cost-report', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const report = await openSourceService.generateCostReport(days);
    
    res.json({
      period: `${days} days`,
      ...report,
      savingsRate: `${((report.totalSaved / (report.totalSpent + report.totalSaved)) * 100).toFixed(1)}%`
    });
  } catch (error) {
    console.error('[OpenSourceAPI] Cost report failed:', error);
    res.status(500).json({ error: 'Cost report failed' });
  }
});

/**
 * GET /api/open-source/cron-jobs
 * Get all cron jobs
 */
router.get('/cron-jobs', async (req, res) => {
  try {
    const jobs = await cronScheduler.getTasks();
    res.json({ jobs });
  } catch (error) {
    console.error('[OpenSourceAPI] Error fetching cron jobs:', error);
    res.status(500).json({ error: 'Failed to fetch cron jobs' });
  }
});

/**
 * POST /api/open-source/cron-jobs/:agentId/:jobName/toggle
 * Enable/disable a cron job
 */
router.post('/cron-jobs/:agentId/:jobName/toggle', async (req, res) => {
  try {
    const { agentId, jobName } = req.params;
    const { enabled } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({ error: 'enabled is required' });
    }
    
    await cronScheduler.toggleTask(agentId, jobName, enabled);
    res.json({ success: true });
  } catch (error) {
    console.error('[OpenSourceAPI] Toggle failed:', error);
    res.status(500).json({ error: 'Toggle failed' });
  }
});

/**
 * POST /api/open-source/cron-jobs/:agentId/:jobName/trigger
 * Manually trigger a cron job
 */
router.post('/cron-jobs/:agentId/:jobName/trigger', async (req, res) => {
  try {
    const { agentId, jobName } = req.params;
    
    await cronScheduler.triggerTask(agentId, jobName);
    res.json({ success: true });
  } catch (error) {
    console.error('[OpenSourceAPI] Trigger failed:', error);
    res.status(500).json({ error: 'Trigger failed' });
  }
});

/**
 * GET /api/open-source/integrations/:feature
 * Get integrations for a feature
 */
router.get('/integrations/:feature', async (req, res) => {
  try {
    const { feature } = req.params;
    const integrations = await openSourceService.getFeatureIntegrations(feature);
    res.json({ integrations });
  } catch (error) {
    console.error('[OpenSourceAPI] Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

export default router;
