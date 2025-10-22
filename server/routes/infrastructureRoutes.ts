/**
 * Infrastructure API Routes
 * MB.MD All 13 Tracks: Unified API for all infrastructure services
 * Exposes: Security, Analytics, Testing, Mobile, Performance, Operations,
 *          Onboarding, Collaboration, DevEx, Design System, CI/CD, AI/ML, Growth
 */

import { Router } from 'express';
import { analyticsService } from '../services/analyticsService';
import { testingService } from '../services/testingService';
import { mobileService } from '../services/mobileService';
import { performanceService } from '../services/performanceService';
import { operationsService } from '../services/operationsService';
import { onboardingService } from '../services/onboardingService';
import { collaborationService } from '../services/collaborationService';
import { devExService } from '../services/devExService';
import { designSystemService } from '../services/designSystemService';
import { cicdService } from '../services/cicdService';
import { aimlService } from '../services/aimlService';
import { growthService } from '../services/growthService';

const router = Router();

// ===================================
// TRACK 2: ANALYTICS
// ===================================

// Track event
router.post('/analytics/track', async (req, res) => {
  try {
    await analyticsService.trackEvent(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard metrics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const timeRange = (req.query.timeRange as any) || 'day';
    const metrics = await analyticsService.getDashboardMetrics(timeRange);
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversion funnel
router.post('/analytics/funnel', async (req, res) => {
  try {
    const funnel = await analyticsService.getConversionFunnel(req.body);
    res.json(funnel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 3: TESTING
// ===================================

// Run all tests
router.post('/testing/run', async (req, res) => {
  try {
    const results = await testingService.runAllTests();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get test coverage
router.get('/testing/coverage', async (req, res) => {
  try {
    const coverage = await testingService.getCoverageReport();
    res.json(coverage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 4: MOBILE
// ===================================

// Detect device
router.post('/mobile/detect', (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = mobileService.parseDeviceInfo(userAgent, req.body.viewport);
    res.json(deviceInfo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get PWA manifest
router.get('/mobile/manifest', (req, res) => {
  try {
    const manifest = mobileService.generateManifest({
      name: 'Mundo Tango',
      shortName: 'MundoTango',
      description: 'Social platform for the global tango community',
      themeColor: '#14b8a6',
      backgroundColor: '#ffffff',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    });
    res.json(manifest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 5: PERFORMANCE
// ===================================

// Get performance summary
router.get('/performance/summary', (req, res) => {
  try {
    const summary = performanceService.getPerformanceSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get memory usage
router.get('/performance/memory', (req, res) => {
  try {
    const memory = performanceService.getMemoryUsage();
    res.json(memory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger garbage collection
router.post('/performance/gc', (req, res) => {
  try {
    performanceService.triggerGC();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 6: OPERATIONS
// ===================================

// Health check
router.get('/operations/health', async (req, res) => {
  try {
    const health = await operationsService.performHealthCheck();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active alerts
router.get('/operations/alerts', (req, res) => {
  try {
    const alerts = operationsService.getActiveAlerts();
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Query logs
router.get('/operations/logs', (req, res) => {
  try {
    const logs = operationsService.queryLogs({
      level: req.query.level as any,
      service: req.query.service as string,
      since: req.query.since ? Number(req.query.since) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 7: ONBOARDING
// ===================================

// Get onboarding steps
router.get('/onboarding/steps/:userId', (req, res) => {
  try {
    const steps = onboardingService.getOnboardingSteps(Number(req.params.userId));
    res.json(steps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete step
router.post('/onboarding/complete', (req, res) => {
  try {
    const result = onboardingService.completeStep(req.body.userId, req.body.stepId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get achievements
router.get('/onboarding/achievements', (req, res) => {
  try {
    const achievements = onboardingService.getAllAchievements();
    res.json(achievements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 8: COLLABORATION
// ===================================

// Update presence
router.post('/collaboration/presence', (req, res) => {
  try {
    collaborationService.updatePresence(req.body.userId, req.body.presence);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get online users
router.get('/collaboration/online', (req, res) => {
  try {
    const users = collaborationService.getOnlineUsers(req.query.page as string);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post('/collaboration/comments', (req, res) => {
  try {
    const comment = collaborationService.addComment(req.body);
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 9: DEVELOPER EXPERIENCE
// ===================================

// Get all API endpoints
router.get('/devex/endpoints', (req, res) => {
  try {
    const endpoints = devExService.getAllEndpoints();
    res.json(endpoints);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate API client code
router.post('/devex/generate/client', (req, res) => {
  try {
    const code = devExService.generateAPIClient(req.body.endpoint, req.body.language);
    res.json({ code });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get code templates
router.get('/devex/templates', (req, res) => {
  try {
    const templates = devExService.getTemplates(req.query.category as any);
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 10: DESIGN SYSTEM
// ===================================

// Get design tokens
router.get('/design/tokens', (req, res) => {
  try {
    const tokens = designSystemService.getDesignTokens();
    res.json(tokens);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get components
router.get('/design/components', (req, res) => {
  try {
    const components = designSystemService.getComponents();
    res.json(components);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get theme
router.get('/design/theme/:id', (req, res) => {
  try {
    const theme = designSystemService.getTheme(req.params.id as any);
    res.json(theme);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 11: CI/CD
// ===================================

// Create build
router.post('/cicd/builds', async (req, res) => {
  try {
    const build = await cicdService.createBuild(req.body);
    res.json(build);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get build status
router.get('/cicd/builds/:id', (req, res) => {
  try {
    const build = cicdService.getBuild(req.params.id);
    res.json(build);
  } catch (error: any) {
    res.status(404).json({ error: 'Build not found' });
  }
});

// Deploy
router.post('/cicd/deploy', async (req, res) => {
  try {
    const deployment = await cicdService.deploy(req.body);
    res.json(deployment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 12: AI/ML
// ===================================

// Run inference
router.post('/aiml/inference', async (req, res) => {
  try {
    const result = await aimlService.inference(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get models
router.get('/aiml/models', (req, res) => {
  try {
    const models = aimlService.getModels();
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start training
router.post('/aiml/train', async (req, res) => {
  try {
    const job = await aimlService.startTraining(req.body);
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// TRACK 13: GROWTH
// ===================================

// Create referral code
router.post('/growth/referral/create', (req, res) => {
  try {
    const referral = growthService.createReferralCode(req.body.userId);
    res.json(referral);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get referral stats
router.get('/growth/referral/stats/:userId', (req, res) => {
  try {
    const stats = growthService.getReferralStats(Number(req.params.userId));
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create campaign
router.post('/growth/campaigns', (req, res) => {
  try {
    const campaign = growthService.createCampaign(req.body);
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get growth metrics
router.get('/growth/metrics', (req, res) => {
  try {
    const metrics = growthService.getGrowthMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
