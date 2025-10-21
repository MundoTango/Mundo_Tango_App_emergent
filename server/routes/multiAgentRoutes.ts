/**
 * Multi-Agent Orchestration API Routes
 * MB.MD Phase 3R - Oct 21, 2025
 */

import { Router } from 'express';
import { multiAgentOrchestrator } from '../services/multiAgentOrchestrator';
import { mlPredictionSystem } from '../services/mlPredictionSystem';
import { failedActionMonitor } from '../services/failedActionMonitor';

const router = Router();

// Multi-Agent Build Orchestration
router.post('/orchestrate/build', async (req, res) => {
  try {
    const { projectDescription } = req.body;
    const result = await multiAgentOrchestrator.orchestrateBuild(projectDescription);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orchestrate/agents', async (_req, res) => {
  try {
    const agents = await multiAgentOrchestrator.getAgentStatus();
    res.json({ success: true, data: agents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orchestrate/progress/:buildId', async (req, res) => {
  try {
    const { buildId } = req.params;
    const progress = await multiAgentOrchestrator.monitorProgress(buildId);
    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ML Prediction System
router.post('/ml/predict/next-action', async (req, res) => {
  try {
    const { userId, currentContext } = req.body;
    const prediction = await mlPredictionSystem.predictNextAction(userId, currentContext);
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/ml/predict/agent', async (req, res) => {
  try {
    const { task, userContext } = req.body;
    const prediction = await mlPredictionSystem.predictAgentAssignment(task, userContext);
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/ml/predict/feature', async (req, res) => {
  try {
    const { userId, breadcrumbs } = req.body;
    const prediction = await mlPredictionSystem.predictFeatureRecommendation(userId, breadcrumbs);
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/ml/train', async (req, res) => {
  try {
    const { userId, behaviorData } = req.body;
    await mlPredictionSystem.trainModel(userId, behaviorData);
    res.json({ success: true, message: 'Model trained successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/ml/stats', async (_req, res) => {
  try {
    const stats = await mlPredictionSystem.getModelStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Failed Action Monitoring
router.post('/monitor/failure', async (req, res) => {
  try {
    const { userId, action, error, context } = req.body;
    await failedActionMonitor.recordFailure(userId, action, error, context);
    res.json({ success: true, message: 'Failure recorded' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/monitor/report/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : undefined;
    const report = await failedActionMonitor.getFailureReport(userId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/monitor/patterns', async (_req, res) => {
  try {
    const patterns = await failedActionMonitor.getFailurePatterns();
    res.json({ success: true, data: patterns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/monitor/resolve/:failureId', async (req, res) => {
  try {
    const { failureId } = req.params;
    const { resolution } = req.body;
    await failedActionMonitor.resolveFailure(failureId, resolution);
    res.json({ success: true, message: 'Failure resolved' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/monitor/recommendations/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const recommendations = await failedActionMonitor.getRecommendations(action);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
