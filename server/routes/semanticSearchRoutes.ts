/**
 * TRACK 1: SEMANTIC SEARCH ROUTES
 * LanceDB + EventMemoryGraph integration for Mr Blue omniscient intelligence
 */

import { Router } from 'express';
import { optionalAuth } from '../middleware/secureAuth';
import { lanceDBService } from '../services/LanceDBService';
import { eventMemoryGraph } from '../services/EventMemoryGraph';

export const semanticSearchRouter = Router();

/**
 * POST /api/semantic/search
 * Semantic search across all platform data
 */
semanticSearchRouter.post('/search', optionalAuth, async (req, res) => {
  try {
    const { query, filters, limit = 10 } = req.body;
    const userId = req.user?.id;

    console.log('🔍 [Semantic Search] Query:', { query, userId, limit });

    // TODO: Generate query embedding and search LanceDB
    // For now, return placeholder
    const results = {
      query,
      results: [],
      total: 0,
      searchType: 'semantic'
    };

    res.json(results);

  } catch (error) {
    console.error('❌ [Semantic Search] Error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/semantic/context-query
 * EventMemoryGraph: "Who did I meet where?" queries
 */
semanticSearchRouter.post('/context-query', optionalAuth, async (req, res) => {
  try {
    const { eventId, occupation, city, isTeacher } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('🧠 [Context Query] Request:', { eventId, occupation, city, isTeacher, userId });

    const results = await eventMemoryGraph.findAttendeesAtEvent(
      eventId,
      { occupation, city, isTeacher }
    );

    console.log('✅ [Context Query] Found:', results.length, 'results');

    res.json({
      query: { eventId, occupation, city, isTeacher },
      results,
      total: results.length
    });

  } catch (error) {
    console.error('❌ [Context Query] Error:', error);
    res.status(500).json({
      error: 'Context query failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/semantic/stats
 * Get semantic search statistics
 */
semanticSearchRouter.get('/stats', optionalAuth, async (req, res) => {
  try {
    const stats = {
      lancedb: {
        enabled: lanceDBService.isEnabled(),
        tables: 0 // TODO: Get actual table count
      },
      eventMemoryGraph: {
        enabled: true
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('❌ [Semantic Stats] Error:', error);
    res.status(500).json({
      error: 'Stats retrieval failed'
    });
  }
});

export default semanticSearchRouter;
