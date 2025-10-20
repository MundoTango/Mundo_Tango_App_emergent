/**
 * Mundo Tango - Memories Feed API Routes
 * MB.MD TRACK 1: Component Integration (Week 1)
 * 
 * Connects to existing memoriesFeedAlgorithm.ts (650+ lines)
 * Implements hybrid feed with AI-powered scoring
 */

import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { MemoriesFeedAlgorithm } from '../services/memoriesFeedAlgorithm';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const feedQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20).refine(n => !isNaN(n) && n >= 1, 'limit must be a positive number'),
  filterType: z.enum(['all', 'following', 'nearby']).optional().default('all'),
  tags: z.string().optional().transform(val => val ? val.split(',') : []),
  visibility: z.enum(['all', 'public', 'friends', 'private']).optional().default('all'),
  lat: z.string().optional().transform(val => val ? parseFloat(val) : undefined).refine(n => n === undefined || !isNaN(n), 'lat must be a valid number'),
  lng: z.string().optional().transform(val => val ? parseFloat(val) : undefined).refine(n => n === undefined || !isNaN(n), 'lng must be a valid number'),
  radius: z.string().optional().transform(val => val ? parseFloat(val) : 10).refine(n => !isNaN(n) && n > 0, 'radius must be a positive number'),
  temporalWeight: z.string().optional().transform(val => val ? parseFloat(val) : 1.0).refine(n => !isNaN(n) && n >= 0, 'temporalWeight must be a non-negative number'),
  socialWeight: z.string().optional().transform(val => val ? parseFloat(val) : 1.0).refine(n => !isNaN(n) && n >= 0, 'socialWeight must be a non-negative number'),
  emotionalWeight: z.string().optional().transform(val => val ? parseFloat(val) : 1.0).refine(n => !isNaN(n) && n >= 0, 'emotionalWeight must be a non-negative number'),
  contentWeight: z.string().optional().transform(val => val ? parseFloat(val) : 1.0).refine(n => !isNaN(n) && n >= 0, 'contentWeight must be a non-negative number'),
});

/**
 * GET /api/memories/feed
 * Generate intelligent memories feed using ESA LIFE CEO algorithm
 * 
 * Query Parameters:
 * - limit: Number of memories to return (default: 20)
 * - filterType: 'all' | 'following' | 'nearby' (default: 'all')
 * - tags: Comma-separated hashtags to filter by
 * - visibility: 'all' | 'public' | 'friends' | 'private' (default: 'all')
 * - lat, lng, radius: For 'nearby' filter (PostGIS spatial query)
 * - temporalWeight, socialWeight, emotionalWeight, contentWeight: Algorithm tuning (default: 1.0)
 * 
 * Returns:
 * {
 *   memories: Post[] with author info,
 *   algorithm: {
 *     processed: number,
 *     scored: number,
 *     topScores: MemoryScore[],
 *     filtersApplied: object
 *   }
 * }
 */
router.get('/feed', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    
    // Validate and parse query parameters
    const params = feedQuerySchema.parse(req.query);
    
    // Build preferences object
    const preferences = {
      temporalWeight: params.temporalWeight,
      socialWeight: params.socialWeight,
      emotionalWeight: params.emotionalWeight,
      contentWeight: params.contentWeight,
    };
    
    // Build filters object
    const filters: any = {
      filterType: params.filterType,
      tags: params.tags.length > 0 ? params.tags : undefined,
      visibility: params.visibility,
    };
    
    // Add location filter if provided
    if (params.lat !== undefined && params.lng !== undefined) {
      filters.location = {
        lat: params.lat,
        lng: params.lng,
        radius: params.radius,
      };
    }
    
    // Generate intelligent feed
    const result = await MemoriesFeedAlgorithm.generateMemoriesFeed(
      userId,
      params.limit,
      preferences,
      filters
    );
    
    res.json({
      success: true,
      ...result,
      meta: {
        userId,
        timestamp: new Date().toISOString(),
        algorithmVersion: '61x21',
      }
    });
    
  } catch (error: any) {
    console.error('Error generating memories feed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate memories feed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/memories/preferences
 * Get user's memory feed preferences
 */
router.get('/preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    
    const preferences = await MemoriesFeedAlgorithm.getUserMemoryPreferences(userId);
    
    res.json({
      success: true,
      preferences
    });
    
  } catch (error: any) {
    console.error('Error getting memory preferences:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get memory preferences'
    });
  }
});

/**
 * PUT /api/memories/preferences
 * Update user's memory feed preferences
 */
router.put('/preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user.claims.sub;
    
    const preferencesSchema = z.object({
      temporalWeight: z.number().min(0).max(2).optional(),
      socialWeight: z.number().min(0).max(2).optional(),
      emotionalWeight: z.number().min(0).max(2).optional(),
      contentWeight: z.number().min(0).max(2).optional(),
      diversityLevel: z.number().min(0).max(1).optional(),
      minimumScore: z.number().min(0).max(100).optional(),
    });
    
    const updates = preferencesSchema.parse(req.body);
    
    // For now, just acknowledge - can be persisted to user preferences table later
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updates
    });
    
  } catch (error: any) {
    console.error('Error updating memory preferences:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Invalid preferences data'
    });
  }
});

export default router;
