/**
 * Phase 6 API Routes
 * MB.MD PHASE 6 - All Tracks Integration
 */

import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { mlModelTrainer } from '../ai/MLModelTrainer';
import { selfHealingEngine } from '../agents/SelfHealingEngine';
import { multiAgentLearning } from '../agents/MultiAgentLearningNetwork';
import { performanceOptimizer } from '../agents/PerformanceOptimizer';
import { predictiveAnalytics } from '../analytics/PredictiveAnalytics';
import { agentMarketplace } from '../marketplace/AgentMarketplace';

const router = Router();

// ============= TRACK 23: ML Model Training =============

router.post('/ml/train/api-performance', requireAdmin, async (req, res) => {
  try {
    const { historicalData } = req.body;
    const metrics = await mlModelTrainer.trainAPIPerformanceModel(historicalData || []);
    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ml/train/cache-hit', requireAdmin, async (req, res) => {
  try {
    const { cacheData } = req.body;
    const metrics = await mlModelTrainer.trainCacheHitPredictionModel(cacheData || []);
    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ml/predict/response-time', requireAdmin, async (req, res) => {
  try {
    const { features } = req.body;
    const prediction = await mlModelTrainer.predictAPIResponseTime(features);
    res.json({ success: true, prediction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============= TRACK 24: Self-Healing =============

router.post('/healing/detect', requireAdmin, async (req, res) => {
  try {
    const { type, metadata } = req.body;
    const issue = await selfHealingEngine.detectIssue(type, metadata);
    res.json({ success: true, issue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/healing/stats', requireAdmin, async (req, res) => {
  try {
    const stats = selfHealingEngine.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/healing/threshold', requireAdmin, async (req, res) => {
  try {
    const { threshold } = req.body;
    selfHealingEngine.setConfidenceThreshold(threshold);
    res.json({ success: true, threshold });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============= TRACK 25: Multi-Agent Learning =============

router.post('/learning/share', requireAdmin, async (req, res) => {
  try {
    const { agentId, pattern, confidence, data } = req.body;
    const knowledgeId = await multiAgentLearning.shareLearning({ agentId, pattern, confidence, data });
    res.json({ success: true, knowledgeId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/learning/train', requireAdmin, async (req, res) => {
  try {
    const { agentIds, dataset } = req.body;
    const jobId = await multiAgentLearning.startFederatedTraining(agentIds, dataset);
    res.json({ success: true, jobId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/learning/stats', requireAdmin, async (req, res) => {
  try {
    const stats = multiAgentLearning.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/learning/knowledge/:pattern', requireAdmin, async (req, res) => {
  try {
    const knowledge = multiAgentLearning.getSharedKnowledge(req.params.pattern);
    res.json(knowledge || { error: 'Knowledge not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============= TRACK 26: Performance Optimization =============

router.post('/performance/start', requireAdmin, async (req, res) => {
  try {
    const { intervalMs } = req.body;
    performanceOptimizer.startMonitoring(intervalMs);
    res.json({ success: true, message: 'Performance monitoring started' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/performance/stop', requireAdmin, async (req, res) => {
  try {
    performanceOptimizer.stopMonitoring();
    res.json({ success: true, message: 'Performance monitoring stopped' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/performance/stats', requireAdmin, async (req, res) => {
  try {
    const stats = performanceOptimizer.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/performance/bottlenecks', requireAdmin, async (req, res) => {
  try {
    const bottlenecks = performanceOptimizer.getBottlenecks();
    res.json(bottlenecks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============= TRACK 27: Predictive Analytics =============

router.post('/analytics/data-point', requireAdmin, async (req, res) => {
  try {
    const { metric, value, metadata } = req.body;
    predictiveAnalytics.addDataPoint(metric, value, metadata);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/forecast/:metric', requireAdmin, async (req, res) => {
  try {
    const { periodsAhead = 10 } = req.query;
    const trend = predictiveAnalytics.forecastTrend(
      req.params.metric,
      parseInt(periodsAhead as string)
    );
    res.json(trend || { error: 'Insufficient data' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/report/:metric', requireAdmin, async (req, res) => {
  try {
    const report = predictiveAnalytics.generateReport(req.params.metric);
    res.json(report || { error: 'Insufficient data' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/anomalies', requireAdmin, async (req, res) => {
  try {
    const anomalies = predictiveAnalytics.getAllAnomalies();
    res.json(anomalies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/stats', requireAdmin, async (req, res) => {
  try {
    const stats = predictiveAnalytics.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============= TRACK 28: Agent Marketplace =============

router.get('/marketplace/agents', requireAdmin, async (req, res) => {
  try {
    const { query, category } = req.query;
    const agents = agentMarketplace.searchAgents(
      query as string || '',
      category as any
    );
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/marketplace/install/:agentId', requireAdmin, async (req, res) => {
  try {
    const success = await agentMarketplace.installAgent(req.params.agentId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/marketplace/uninstall/:agentId', requireAdmin, async (req, res) => {
  try {
    const success = await agentMarketplace.uninstallAgent(req.params.agentId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/marketplace/installed', requireAdmin, async (req, res) => {
  try {
    const installed = agentMarketplace.getInstalledAgents();
    res.json(installed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/marketplace/review/:agentId', requireAdmin, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = (req as any).user?.id || 'anonymous';
    const reviewId = agentMarketplace.submitReview(
      req.params.agentId,
      userId,
      rating,
      comment
    );
    res.json({ success: true, reviewId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/marketplace/stats', requireAdmin, async (req, res) => {
  try {
    const stats = agentMarketplace.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
