/**
 * AI Research Expert API Routes
 * Endpoints for accessing AI intelligence, news, and tool discovery
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// In-memory reference to the AI Research Expert agent
// Will be injected when the agent system initializes
let aiExpertAgent: any = null;

export function setAIExpertAgent(agent: any) {
  aiExpertAgent = agent;
}

/**
 * GET /api/ai-expert/news
 * Get latest AI news from RSS sources
 */
router.get('/news', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    const { limit = 20, category } = req.query;
    
    const news = await aiExpertAgent.execute('getLatestNews', {
      limit: Number(limit),
      category,
    });
    
    res.json({
      success: true,
      count: news.length,
      news,
    });
  } catch (error: any) {
    console.error('AI Expert news error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-expert/trending
 * Get trending GitHub repositories
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    const { language = 'typescript', topic = 'ai', limit = 10 } = req.query;
    
    const repos = await aiExpertAgent.execute('searchTrending', {
      language,
      topic,
      limit: Number(limit),
    });
    
    res.json({
      success: true,
      count: repos.length,
      repos,
    });
  } catch (error: any) {
    console.error('AI Expert trending error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-expert/brief
 * Get daily AI intelligence brief
 */
router.get('/brief', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    const brief = await aiExpertAgent.execute('generateBrief', {});
    
    res.json({
      success: true,
      brief,
    });
  } catch (error: any) {
    console.error('AI Expert brief error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-expert/evaluate-framework
 * Evaluate an AI framework
 */
router.post('/evaluate-framework', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    const { framework } = req.body;
    
    if (!framework) {
      return res.status(400).json({ error: 'Framework name required' });
    }
    
    const evaluation = await aiExpertAgent.execute('evaluateFramework', {
      framework,
    });
    
    res.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    console.error('AI Expert evaluation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-expert/find-alternatives
 * Find open source alternatives to a tool
 */
router.post('/find-alternatives', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    const { tool, category } = req.body;
    
    if (!tool || !category) {
      return res.status(400).json({ error: 'Tool and category required' });
    }
    
    const alternatives = await aiExpertAgent.execute('findAlternatives', {
      tool,
      category,
    });
    
    res.json({
      success: true,
      alternatives,
    });
  } catch (error: any) {
    console.error('AI Expert alternatives error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-expert/critique-esa
 * Get ESA framework critique
 */
router.post('/critique-esa', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    // Queue the critique job
    await aiExpertAgent.addJob('critique_esa', {});
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the critique from shared state
    const critique = await aiExpertAgent.getSharedState('esa_framework_critique');
    
    res.json({
      success: true,
      critique: critique?.critique || { message: 'Critique is being generated' },
    });
  } catch (error: any) {
    console.error('AI Expert critique error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-expert/discover-tools
 * Discover open source tools
 */
router.post('/discover-tools', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    const { category = 'ai-agents', limit = 20 } = req.body;
    
    // Queue the discovery job
    await aiExpertAgent.addJob('discover_tools', { category, limit });
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get discoveries from shared state
    const discoveries = await aiExpertAgent.getSharedState('tool_discoveries');
    
    res.json({
      success: true,
      discoveries: discoveries?.discoveries || { message: 'Discovery in progress' },
    });
  } catch (error: any) {
    console.error('AI Expert discovery error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-expert/aggregate-news
 * Manually trigger news aggregation
 */
router.post('/aggregate-news', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ error: 'AI Expert not initialized' });
    }
    
    // Queue the aggregation job
    const job = await aiExpertAgent.addJob('aggregate_ai_news', {});
    
    res.json({
      success: true,
      message: 'News aggregation started',
      jobId: job.id,
    });
  } catch (error: any) {
    console.error('AI Expert aggregation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-expert/status
 * Get agent status and capabilities
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    if (!aiExpertAgent) {
      return res.status(503).json({ 
        error: 'AI Expert not initialized',
        initialized: false,
      });
    }
    
    res.json({
      success: true,
      initialized: true,
      agent: {
        id: aiExpertAgent.id,
        name: aiExpertAgent.name,
        layers: aiExpertAgent.layers,
      },
      capabilities: [
        'RSS News Aggregation (7 sources, unlimited, free)',
        'GitHub Trending Search (60 req/hour, free)',
        'Tavily Web Search (1000/month, optional)',
        'ESA Framework Critique',
        'Tool Discovery & Evaluation',
        'Daily Intelligence Briefs',
        'Open Source Alternative Finder',
      ],
      sources: {
        rss: ['HuggingFace', 'Google AI', 'VentureBeat AI', 'The Verge AI', 'Analytics Vidhya', 'OpenAI Blog', 'Anthropic News'],
        apis: ['GitHub API (free)', 'Tavily API (optional)'],
      },
    });
  } catch (error: any) {
    console.error('AI Expert status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
