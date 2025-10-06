import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { insertRecommendationSchema } from '../../shared/schema';
import { z } from 'zod';
import { recommendationAccessService } from '../services/recommendationAccessService';

const router = Router();

// ESA LIFE CEO 61x21 - Layer 28: Recommendations System
// User-Generated Recommendations with Aurora Tide Design + Social Connection Filtering

// GET /api/recommendations - Get recommendations with comprehensive filters
router.get('/recommendations', async (req: any, res) => {
  try {
    const {
      city,
      type,
      priceLevel,
      minRating,
      tags,
      connectionDegree,
      minClosenessScore,
      localStatus,
      originCountry,
      limit = '20',
      offset = '0'
    } = req.query;

    // Get viewer ID for connection-based filtering (if authenticated)
    let viewerId: number | null = null;
    if (req.user?.claims?.sub) {
      const viewer = await storage.getUserByReplitId(req.user.claims.sub);
      viewerId = viewer?.id || null;
    }

    // Build base query filters
    const baseFilters: any = {};
    if (city) baseFilters.city = city as string;
    if (type) baseFilters.type = type as string;
    if (priceLevel) baseFilters.priceLevel = priceLevel as string;
    if (minRating) baseFilters.minRating = parseInt(minRating as string);
    if (tags) {
      baseFilters.tags = Array.isArray(tags) ? tags : [tags];
    }

    // Get initial recommendations using base filters
    let recommendations = await storage.getRecommendationsByFilters({
      ...baseFilters,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    // Extract recommendation IDs for social filtering
    const recIds = recommendations.map((r: any) => r.id);

    // Apply social connection filters if viewer is authenticated
    if (viewerId && recIds.length > 0) {
      const socialFilters = {
        connectionDegree: connectionDegree as any,
        minClosenessScore: minClosenessScore ? parseInt(minClosenessScore as string) : undefined,
        localStatus: localStatus as any,
        originCountry: originCountry as string | undefined
      };

      const filteredIds = await recommendationAccessService.applyAllFilters(
        viewerId,
        recIds,
        socialFilters
      );

      // Filter recommendations to only include filtered IDs
      recommendations = recommendations.filter((r: any) => filteredIds.includes(r.id));
    }

    res.json({
      success: true,
      data: recommendations,
      meta: {
        total: recommendations.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        filters: {
          connection: connectionDegree || 'anyone',
          localStatus: localStatus || 'all',
          originCountry: originCountry || null
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations',
      message: error.message
    });
  }
});

// GET /api/recommendations/:id - Get single recommendation by ID
router.get('/recommendations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await storage.getRecommendationById(parseInt(id));
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found'
      });
    }
    
    res.json({
      success: true,
      data: recommendation
    });
  } catch (error: any) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendation',
      message: error.message
    });
  }
});

// GET /api/recommendations/user/:userId - Get recommendations by user
router.get('/recommendations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = '20', offset = '0' } = req.query;
    
    const recommendations = await storage.getRecommendationsByUser(
      parseInt(userId),
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error: any) {
    console.error('Error fetching user recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user recommendations',
      message: error.message
    });
  }
});

// POST /api/recommendations - Create new recommendation (requires auth)
// ESA LIFE CEO 61x21 - Layer 28: Recommendations ARE memories with social engagement
router.post('/recommendations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Validate request body
    const validatedData = insertRecommendationSchema.parse({
      ...req.body,
      userId: user.id
    });
    
    // ESA Framework: Transaction-safe creation - both post and recommendation succeed or both fail
    // This prevents orphan posts if recommendation creation fails
    const { recommendation, post } = await storage.createRecommendationWithPost({
      ...validatedData,
      photos: validatedData.photos || undefined,
      tags: validatedData.tags || undefined,
      isActive: validatedData.isActive ?? true,
      userId: user.id,
    });
    
    res.status(201).json({
      success: true,
      data: {
        ...recommendation,
        post // Include post data in response
      },
      message: 'Recommendation created successfully'
    });
  } catch (error: any) {
    console.error('Error creating recommendation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create recommendation',
      message: error.message
    });
  }
});

// PATCH /api/recommendations/:id - Update recommendation (requires auth & ownership)
router.patch('/recommendations/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if recommendation exists and user owns it
    const existing = await storage.getRecommendationById(parseInt(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found'
      });
    }
    
    if (existing.userId !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own recommendations'
      });
    }
    
    // Update recommendation
    const updated = await storage.updateRecommendation(parseInt(id), req.body);
    
    res.json({
      success: true,
      data: updated,
      message: 'Recommendation updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update recommendation',
      message: error.message
    });
  }
});

// DELETE /api/recommendations/:id - Soft delete recommendation (requires auth & ownership)
router.delete('/recommendations/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if recommendation exists and user owns it
    const existing = await storage.getRecommendationById(parseInt(id));
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found'
      });
    }
    
    if (existing.userId !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own recommendations'
      });
    }
    
    // Soft delete
    await storage.deleteRecommendation(parseInt(id));
    
    res.json({
      success: true,
      message: 'Recommendation deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete recommendation',
      message: error.message
    });
  }
});

export default router;
