/**
 * Multi-Agent Orchestration API Routes - WITH VALIDATION & AUTH
 * MB.MD Phase 3 REAL - Oct 21, 2025
 */

import { Router } from 'express';
import { z } from 'zod';
import { multiAgentOrchestrator } from '../services/multiAgentOrchestrator';
import { mlPredictionSystem } from '../services/mlPredictionSystem';
import { failedActionMonitor } from '../services/failedActionMonitor';

const router = Router();

// ============ VALIDATION SCHEMAS ============

const orchestrateBuildSchema = z.object({
  projectDescription: z.string().min(10, 'Description must be at least 10 characters').max(500),
  priority: z.number().min(1).max(10).optional(),
});

const predictNextActionSchema = z.object({
  userId: z.number().int().positive(),
  currentContext: z.object({
    currentPath: z.string().optional(),
    recentPaths: z.array(z.string()).optional(),
    timeOfDay: z.number().min(0).max(23).optional(),
    sessionDuration: z.number().optional(),
  }).optional(),
});

const predictAgentSchema = z.object({
  task: z.string().min(5, 'Task description must be at least 5 characters').max(300),
  userContext: z.any(),
});

const predictFeatureSchema = z.object({
  userId: z.number().int().positive(),
  breadcrumbs: z.array(z.any()).optional(),
});

const trainModelSchema = z.object({
  userId: z.number().int().positive(),
  behaviorData: z.object({
    paths: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    frustrations: z.array(z.string()).optional(),
    sessionCount: z.number().optional(),
    avgSessionDuration: z.number().optional(),
  }),
});

const recordFailureSchema = z.object({
  userId: z.number().int().positive(),
  action: z.string().min(1).max(255),
  error: z.any(),
  context: z.any().optional(),
});

const resolveFailureSchema = z.object({
  resolution: z.string().min(5, 'Resolution description required'),
});

// ============ MIDDLEWARE ============

/**
 * Authentication middleware - checks if user is logged in
 * In dev mode, allows requests without auth (same as existing pattern)
 */
const requireAuth = (req: any, res: any, next: any) => {
  // Dev mode bypass (matches existing auth pattern in codebase)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    // Allow in dev, but warn
    if (!req.user) {
      console.warn('[Multi-Agent API] Dev mode: Allowing unauthenticated request');
      req.user = { id: 1, name: 'Dev User' }; // Default dev user
    }
    return next();
  }

  // Production: require authentication
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  next();
};

/**
 * Validation middleware factory
 */
const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

// ============ MULTI-AGENT BUILD ORCHESTRATION ============

router.post('/orchestrate/build', requireAuth, validate(orchestrateBuildSchema), async (req, res) => {
  try {
    const { projectDescription, priority } = req.body;
    const userId = req.user.id;

    const result = await multiAgentOrchestrator.orchestrateBuild({
      projectDescription,
      userId,
      priority,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Multi-Agent API] Build orchestration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'ORCHESTRATION_FAILED'
    });
  }
});

router.get('/orchestrate/agents', requireAuth, async (_req, res) => {
  try {
    const agents = await multiAgentOrchestrator.getAgentStatus();
    res.json({ success: true, data: agents });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to get agent status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'AGENTS_FETCH_FAILED'
    });
  }
});

router.get('/orchestrate/progress/:buildId', requireAuth, async (req, res) => {
  try {
    const { buildId } = req.params;

    if (!buildId || buildId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Build ID is required',
        code: 'INVALID_BUILD_ID'
      });
    }

    const progress = await multiAgentOrchestrator.monitorProgress(buildId);
    res.json({ success: true, data: progress });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to get build progress:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'PROGRESS_FETCH_FAILED'
    });
  }
});

// ============ ML PREDICTION SYSTEM ============

router.post('/ml/predict/next-action', requireAuth, validate(predictNextActionSchema), async (req, res) => {
  try {
    const { userId, currentContext } = req.body;

    // Authorization: users can only get predictions for themselves (unless admin)
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You can only get predictions for your own account',
        code: 'FORBIDDEN'
      });
    }

    const prediction = await mlPredictionSystem.predictNextAction(userId, currentContext || {});
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    console.error('[Multi-Agent API] Next action prediction failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'PREDICTION_FAILED'
    });
  }
});

router.post('/ml/predict/agent', requireAuth, validate(predictAgentSchema), async (req, res) => {
  try {
    const { task, userContext } = req.body;
    const prediction = await mlPredictionSystem.predictAgentAssignment(task, { ...userContext, userId: req.user.id });
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    console.error('[Multi-Agent API] Agent prediction failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'PREDICTION_FAILED'
    });
  }
});

router.post('/ml/predict/feature', requireAuth, validate(predictFeatureSchema), async (req, res) => {
  try {
    const { userId, breadcrumbs } = req.body;

    // Authorization check
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You can only get predictions for your own account',
        code: 'FORBIDDEN'
      });
    }

    const prediction = await mlPredictionSystem.predictFeatureRecommendation(userId, breadcrumbs || []);
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    console.error('[Multi-Agent API] Feature prediction failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'PREDICTION_FAILED'
    });
  }
});

router.post('/ml/train', requireAuth, validate(trainModelSchema), async (req, res) => {
  try {
    const { userId, behaviorData } = req.body;

    // Authorization check
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You can only train models for your own account',
        code: 'FORBIDDEN'
      });
    }

    await mlPredictionSystem.trainModel(userId, behaviorData);
    res.json({ success: true, message: 'Model trained successfully' });
  } catch (error: any) {
    console.error('[Multi-Agent API] Model training failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'TRAINING_FAILED'
    });
  }
});

router.get('/ml/stats', requireAuth, async (_req, res) => {
  try {
    const stats = await mlPredictionSystem.getModelStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to get ML stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'STATS_FETCH_FAILED'
    });
  }
});

router.post('/ml/feedback/:predictionId', requireAuth, async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { wasCorrect } = req.body;

    if (typeof wasCorrect !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'wasCorrect must be a boolean',
        code: 'VALIDATION_ERROR'
      });
    }

    await mlPredictionSystem.recordFeedback(parseInt(predictionId), wasCorrect);
    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to record feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'FEEDBACK_FAILED'
    });
  }
});

// ============ FAILED ACTION MONITORING ============

router.post('/monitor/record', requireAuth, validate(recordFailureSchema), async (req, res) => {
  try {
    const { userId, action, error, context } = req.body;

    // Authorization check
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You can only record failures for your own account',
        code: 'FORBIDDEN'
      });
    }

    await failedActionMonitor.recordFailure(userId, action, error, context || {});
    res.json({ success: true, message: 'Failure recorded' });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to record failure:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'RECORD_FAILED'
    });
  }
});

router.get('/monitor/report', requireAuth, async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user.id;

    // Authorization: users can only see their own reports (unless admin)
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own failure reports',
        code: 'FORBIDDEN'
      });
    }

    const report = await failedActionMonitor.getFailureReport(userId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to get failure report:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'REPORT_FETCH_FAILED'
    });
  }
});

router.get('/monitor/patterns', requireAuth, async (_req, res) => {
  try {
    const patterns = await failedActionMonitor.getFailurePatterns();
    res.json({ success: true, data: patterns });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to get failure patterns:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'PATTERNS_FETCH_FAILED'
    });
  }
});

router.post('/monitor/resolve/:failureId', requireAuth, validate(resolveFailureSchema), async (req, res) => {
  try {
    const { failureId } = req.params;
    const { resolution } = req.body;

    // Only admins can resolve failures
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can resolve failures',
        code: 'FORBIDDEN'
      });
    }

    await failedActionMonitor.resolveFailure(failureId, resolution);
    res.json({ success: true, message: 'Failure resolved' });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to resolve failure:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'RESOLVE_FAILED'
    });
  }
});

router.get('/monitor/recommendations/:action', requireAuth, async (req, res) => {
  try {
    const { action } = req.params;

    if (!action || action.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Action parameter is required',
        code: 'INVALID_ACTION'
      });
    }

    const recommendations = await failedActionMonitor.getRecommendations(decodeURIComponent(action));
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to get recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'RECOMMENDATIONS_FAILED'
    });
  }
});

router.get('/monitor/analytics', requireAuth, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;

    if (days < 1 || days > 90) {
      return res.status(400).json({
        success: false,
        error: 'Days must be between 1 and 90',
        code: 'INVALID_DAYS'
      });
    }

    const analytics = await failedActionMonitor.getAnalytics(days);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('[Multi-Agent API] Failed to get analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'ANALYTICS_FAILED'
    });
  }
});

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    success: true, 
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '2.0.0-REAL'
  });
});

export default router;
