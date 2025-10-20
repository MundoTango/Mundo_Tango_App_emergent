/**
 * Mundo Tango - Recommendations API Routes
 * MB.MD TRACK 1: Component Integration (Week 1)
 * 
 * Connects to existing recommendationEngineService.ts (516+ lines)
 * Implements ML-powered personalized recommendations
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { isAuthenticated } from '../replitAuth';
import { recommendationEngineService } from '../services/recommendationEngineService';
import { z } from 'zod';

const router = express.Router();

// MB.MD MITIGATION: Rate limiting to prevent API abuse
// 10 requests per minute per user for recommendations
const recommendationsRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  message: 'Too many recommendation requests. Please wait a minute before trying again.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Rate limit per authenticated user
    return String((req as any).user?.claims?.sub || req.ip);
  },
});

// Validation schemas
const recommendationQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10).refine(n => !isNaN(n) && n >= 1, 'limit must be a positive number'),
});

const trackActionSchema = z.object({
  action: z.enum(['view', 'like', 'attend', 'join', 'follow']),
  targetId: z.string(),
  targetType: z.enum(['event', 'user', 'group', 'post']),
});

const updateProfileSchema = z.object({
  preferences: z.object({
    tangoStyles: z.array(z.string()).optional(),
    eventTypes: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    timeSlots: z.array(z.string()).optional(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']).optional(),
  }).optional(),
  demographics: z.object({
    age: z.number().optional(),
    location: z.string().optional(),
    experience: z.number().optional(),
  }).optional(),
});

/**
 * GET /api/recommendations/:context
 * Generate personalized recommendations for user
 * 
 * Params:
 * - context: 'home_feed' | 'events' | 'users' | 'groups' | 'discover'
 * 
 * Query:
 * - limit: Number of recommendations (default: 10)
 * 
 * Returns:
 * {
 *   success: true,
 *   recommendations: RecommendationItem[],
 *   meta: { context, timestamp, algorithmVersion }
 * }
 */
router.get('/:context', isAuthenticated, recommendationsRateLimiter, async (req, res) => {
  try {
    const userId = String((req as any).user.claims.sub);
    const { context } = req.params;
    
    // Validate context
    const validContexts = ['home_feed', 'events', 'users', 'groups', 'discover'];
    if (!validContexts.includes(context)) {
      return res.status(400).json({
        success: false,
        error: `Invalid context. Must be one of: ${validContexts.join(', ')}`
      });
    }
    
    // Parse query params
    const { limit } = recommendationQuerySchema.parse(req.query);
    
    // Generate recommendations
    const recommendations = await recommendationEngineService.generateRecommendations(
      userId,
      context as any,
      limit
    );
    
    res.json({
      success: true,
      recommendations,
      meta: {
        context,
        count: recommendations.length,
        timestamp: new Date().toISOString(),
        algorithmVersion: 'collaborative_content_hybrid',
      }
    });
    
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate recommendations'
    });
  }
});

/**
 * POST /api/recommendations/track
 * Track user action for personalization
 * 
 * Body:
 * {
 *   action: 'view' | 'like' | 'attend' | 'join' | 'follow',
 *   targetId: string,
 *   targetType: 'event' | 'user' | 'group' | 'post'
 * }
 */
router.post('/track', isAuthenticated, recommendationsRateLimiter, async (req, res) => {
  try {
    const userId = String((req as any).user.claims.sub);
    
    const { action, targetId, targetType } = trackActionSchema.parse(req.body);
    
    await recommendationEngineService.trackUserAction(
      userId,
      action,
      targetId,
      targetType
    );
    
    res.json({
      success: true,
      message: 'Action tracked successfully',
      meta: {
        userId,
        action,
        targetType,
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error: any) {
    console.error('Error tracking user action:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track action'
    });
  }
});

/**
 * GET /api/recommendations/profile
 * Get user's recommendation profile
 */
router.get('/profile', isAuthenticated, recommendationsRateLimiter, async (req, res) => {
  try {
    const userId = String((req as any).user.claims.sub);
    
    // Get historical recommendations for this user
    const history = recommendationEngineService.getUserRecommendations(userId);
    
    // Get system metrics
    const metrics = recommendationEngineService.getSystemMetrics();
    
    res.json({
      success: true,
      history: history.slice(0, 10), // Last 10 recommendation sets
      systemMetrics: metrics,
    });
    
  } catch (error: any) {
    console.error('Error getting recommendation profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recommendation profile'
    });
  }
});

/**
 * PUT /api/recommendations/profile
 * Update user's recommendation profile
 */
router.put('/profile', isAuthenticated, recommendationsRateLimiter, async (req, res) => {
  try {
    const userId = String((req as any).user.claims.sub);
    
    const updates = updateProfileSchema.parse(req.body);
    
    await recommendationEngineService.updateUserProfile(userId, updates as any);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      meta: {
        userId,
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error: any) {
    console.error('Error updating recommendation profile:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Invalid profile data'
    });
  }
});

/**
 * GET /api/recommendations/metrics
 * Get recommendation engine system metrics (admin only)
 */
router.get('/system/metrics', isAuthenticated, recommendationsRateLimiter, async (req, res) => {
  try {
    // TODO: Add admin check here
    // if (!req.user!.isAdmin) {
    //   return res.status(403).json({ success: false, error: 'Admin access required' });
    // }
    
    const metrics = recommendationEngineService.getSystemMetrics();
    
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get system metrics'
    });
  }
});

export default router;
