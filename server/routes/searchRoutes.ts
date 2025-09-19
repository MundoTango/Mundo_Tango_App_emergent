/**
 * ESA Layer 15: Search & Discovery Routes
 * API endpoints for Elasticsearch/Fuse.js powered search
 */

import { Router } from 'express';
import { searchService, SearchType } from '../services/search';
import { z } from 'zod';

const router = Router();

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  type: z.enum(['users', 'posts', 'events', 'communities']).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  fuzzy: z.string().transform(val => val === 'true').optional(),
  language: z.enum(['en', 'es']).optional(),
});

const suggestQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['users', 'posts', 'events', 'communities']),
});

/**
 * GET /api/search
 * Search in a specific index type or default to posts
 */
router.get('/api/search', async (req, res) => {
  try {
    // Validate query parameters
    const validation = searchQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: validation.error.errors 
      });
    }
    
    const { q, type = 'posts', limit = 20, offset = 0, fuzzy = true, language = 'en' } = validation.data;
    
    console.log(`🔍 ESA Layer 15: Search query="${q}" type="${type}" fuzzy=${fuzzy} lang=${language}`);
    
    // Perform search
    const results = await searchService.search(q, type as SearchType, {
      limit,
      offset,
      fuzzy,
      language,
    });
    
    // Log search metrics
    console.log(`✅ ESA Layer 15: Found ${results.length} results for "${q}" in ${type}`);
    
    res.json({
      success: true,
      query: q,
      type,
      count: results.length,
      results,
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit
      }
    });
  } catch (error: any) {
    console.error('❌ ESA Layer 15: Search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Search failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/search/multi
 * Search across multiple index types
 */
router.get('/api/search/multi', async (req, res) => {
  try {
    // Validate query parameters
    const { q, limit = '20', offset = '0', fuzzy = 'true', language = 'en' } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }
    
    const searchLimit = Math.min(parseInt(limit as string) || 20, 100);
    const searchOffset = Math.max(parseInt(offset as string) || 0, 0);
    const isFuzzy = fuzzy === 'true';
    
    console.log(`🔍 ESA Layer 15: Multi-search query="${q}" fuzzy=${isFuzzy}`);
    
    // Search across all types
    const results = await searchService.multiSearch(q, ['users', 'posts', 'events', 'communities']);
    
    // Apply pagination to combined results
    const paginatedResults = results.slice(searchOffset, searchOffset + searchLimit);
    
    // Group results by type for better organization
    const groupedResults = paginatedResults.reduce((acc: any, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {});
    
    console.log(`✅ ESA Layer 15: Multi-search found ${results.length} total results`);
    
    res.json({
      success: true,
      query: q,
      totalCount: results.length,
      results: paginatedResults,
      grouped: groupedResults,
      pagination: {
        limit: searchLimit,
        offset: searchOffset,
        hasMore: results.length > searchOffset + searchLimit
      }
    });
  } catch (error: any) {
    console.error('❌ ESA Layer 15: Multi-search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Multi-search failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/search/suggest
 * Get search suggestions for autocomplete
 */
router.get('/api/search/suggest', async (req, res) => {
  try {
    // Validate query parameters
    const validation = suggestQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: validation.error.errors 
      });
    }
    
    const { q, type } = validation.data;
    
    console.log(`💡 ESA Layer 15: Suggest query="${q}" type="${type}"`);
    
    // Get suggestions
    const suggestions = await searchService.suggest(q, type as SearchType);
    
    console.log(`✅ ESA Layer 15: Found ${suggestions.length} suggestions for "${q}"`);
    
    res.json({
      success: true,
      query: q,
      type,
      suggestions
    });
  } catch (error: any) {
    console.error('❌ ESA Layer 15: Suggest error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Suggestions failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/search/status
 * Get search service status
 */
router.get('/api/search/status', async (req, res) => {
  try {
    const status = searchService.getStatus();
    
    res.json({
      success: true,
      status,
      message: status.elasticsearch.available 
        ? 'Elasticsearch is active' 
        : 'Using Fuse.js fallback search'
    });
  } catch (error: any) {
    console.error('❌ ESA Layer 15: Status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get search status',
      message: error.message 
    });
  }
});

/**
 * POST /api/search/index
 * Manually trigger indexing of a document
 * (Internal use only - normally indexing happens automatically)
 */
router.post('/api/search/index', async (req, res) => {
  try {
    const { type, id, document } = req.body;
    
    if (!type || !id || !document) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, id, document' 
      });
    }
    
    // Validate type
    if (!['users', 'posts', 'events', 'communities'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be one of: users, posts, events, communities' 
      });
    }
    
    console.log(`📝 ESA Layer 15: Indexing ${type} document ${id}`);
    
    // Index the document
    const success = await searchService.indexDocument(type as SearchType, id, document);
    
    res.json({
      success,
      message: success ? `Document indexed successfully` : `Failed to index document`
    });
  } catch (error: any) {
    console.error('❌ ESA Layer 15: Index error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Indexing failed',
      message: error.message 
    });
  }
});

/**
 * PUT /api/search/index
 * Update an indexed document
 */
router.put('/api/search/index', async (req, res) => {
  try {
    const { type, id, updates } = req.body;
    
    if (!type || !id || !updates) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, id, updates' 
      });
    }
    
    // Validate type
    if (!['users', 'posts', 'events', 'communities'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be one of: users, posts, events, communities' 
      });
    }
    
    console.log(`📝 ESA Layer 15: Updating ${type} document ${id}`);
    
    // Update the document
    const success = await searchService.updateDocument(type as SearchType, id, updates);
    
    res.json({
      success,
      message: success ? `Document updated successfully` : `Failed to update document`
    });
  } catch (error: any) {
    console.error('❌ ESA Layer 15: Update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Update failed',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/search/index
 * Delete an indexed document
 */
router.delete('/api/search/index', async (req, res) => {
  try {
    const { type, id } = req.body;
    
    if (!type || !id) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, id' 
      });
    }
    
    // Validate type
    if (!['users', 'posts', 'events', 'communities'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be one of: users, posts, events, communities' 
      });
    }
    
    console.log(`🗑️ ESA Layer 15: Deleting ${type} document ${id}`);
    
    // Delete the document
    const success = await searchService.deleteDocument(type as SearchType, id);
    
    res.json({
      success,
      message: success ? `Document deleted successfully` : `Failed to delete document`
    });
  } catch (error: any) {
    console.error('❌ ESA Layer 15: Delete error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Delete failed',
      message: error.message 
    });
  }
});

// Keep backward compatibility with existing routes
router.get('/all', async (req, res) => {
  // Redirect to new search endpoint
  const query = req.query.q || req.query.query || '';
  res.redirect(`/api/search/multi?q=${encodeURIComponent(query as string)}`);
});

router.get('/suggestions', async (req, res) => {
  // Redirect to new suggest endpoint
  const query = req.query.q || req.query.query || '';
  res.redirect(`/api/search/suggest?q=${encodeURIComponent(query as string)}&type=users`);
});

export default router;