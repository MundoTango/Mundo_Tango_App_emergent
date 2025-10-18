/**
 * Mundo Tango ESA LIFE CEO - Search Routes
 * Phase 11 Parallel Batch 2: Updated with secure pattern (direct DB + error handling + Zod validation)
 */

import { Router, Response, NextFunction } from 'express';
import { SearchService } from '../services/searchService';
import { ValidationError } from '../middleware/errorHandler';
import { success } from '../utils/apiResponse';
import { z } from 'zod';

const router = Router();

// Search query schema
const searchQuerySchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').max(100, 'Query too long'),
  type: z.array(z.enum(['user', 'post', 'event', 'group', 'memory'])).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  location: z.string().optional()
});

// Suggestions query schema
const suggestionsSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').max(50, 'Query too long'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(20)).optional()
});

// Track click schema
const trackClickSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  resultId: z.number().int().positive(),
  resultType: z.enum(['user', 'post', 'event', 'group', 'memory']),
  position: z.number().int().nonnegative()
});

/**
 * Universal search endpoint
 * GET /api/search/all?q=query&type[]=user&type[]=post&limit=20&offset=0
 */
router.get('/all', async (req, res, next: NextFunction) => {
  try {
    const validated = searchQuerySchema.parse(req.query);
    const { q, type, limit = 20, offset = 0, dateFrom, dateTo, location } = validated;
    const userId = (req as any).user?.id;

    const results = await SearchService.searchAll({
      query: q,
      filters: {
        type,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        location
      },
      limit,
      offset,
      userId
    });

    res.json(success({
      results: results.results,
      total: results.total,
      query: q,
      filters: { type, dateFrom, dateTo, location },
      pagination: {
        limit,
        offset,
        hasMore: results.results.length === limit
      }
    }, 'Search completed successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

/**
 * Get search suggestions (autocomplete)
 * GET /api/search/suggestions?q=query&limit=10
 */
router.get('/suggestions', async (req, res, next: NextFunction) => {
  try {
    const validated = suggestionsSchema.parse(req.query);
    const { q, limit = 10 } = validated;

    const suggestions = await SearchService.getSuggestions(q, limit);

    res.json(success({ suggestions }, 'Suggestions fetched successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

/**
 * Get trending searches
 * GET /api/search/trending?limit=10&category=all
 */
router.get('/trending', async (req, res, next: NextFunction) => {
  try {
    const limitStr = req.query.limit as string;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    const category = (req.query.category as string) || 'all';

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new ValidationError('Invalid limit parameter');
    }

    const trending = await SearchService.getTrending(limit, category);

    res.json(success({ trending }, 'Trending searches fetched successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * Test search endpoints individually
 * GET /api/search/test/:type
 */
router.get('/test/:type', async (req, res, next: NextFunction) => {
  try {
    const searchType = req.params.type;
    const query = 'tango';
    let results;

    switch (searchType) {
      case 'users':
        results = await SearchService['searchUsers'](query, 5);
        break;
      case 'posts':
        results = await SearchService['searchPosts'](query, 5);
        break;
      case 'events':
        results = await SearchService['searchEvents'](query, 5);
        break;
      case 'groups':
        results = await SearchService['searchGroups'](query, 5);
        break;
      case 'memories':
        results = await SearchService['searchMemories'](query, 5);
        break;
      default:
        throw new ValidationError(`Invalid search type: ${searchType}`);
    }

    res.json(success({
      type: searchType,
      results
    }, `${searchType} search test completed`));
  } catch (error) {
    next(error);
  }
});

/**
 * Track search click (for analytics and relevance improvement)
 * POST /api/search/track
 */
router.post('/track', async (req, res, next: NextFunction) => {
  try {
    const validated = trackClickSchema.parse(req.body);
    const userId = (req as any).user?.id;

    // TODO: Implement click tracking for search relevance improvement
    console.log('Search click tracked:', {
      query: validated.query,
      resultId: validated.resultId,
      resultType: validated.resultType,
      position: validated.position,
      userId
    });

    res.json(success({ tracked: true }, 'Click tracked successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
});

/**
 * Test endpoint to check data
 * GET /api/search/test-data
 */
router.get('/test-data', async (req, res, next: NextFunction) => {
  try {
    const { db } = await import('../db');
    const { users, posts, events, groups } = await import('@shared/schema');
    
    // Get sample data
    const [sampleUsers, samplePosts, sampleEvents, sampleGroups] = await Promise.all([
      db.select().from(users).limit(3),
      db.select().from(posts).limit(3),
      db.select().from(events).limit(3),
      db.select().from(groups).limit(3)
    ]);
    
    res.json(success({
      users: sampleUsers,
      posts: samplePosts,
      events: sampleEvents,
      groups: sampleGroups
    }, 'Test data fetched successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
