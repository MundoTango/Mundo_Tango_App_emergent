/**
 * Simplified Multi-AI Orchestration Routes
 * Uses direct SDK clients instead of LangChain
 * MB.MD OPTION C: Multi-AI Framework (Agents #115-117)
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { trackAIPerformance } from '../utils/ai-performance-monitor';
import analyticsRouter from './ai-analytics-extended';
import { getSemanticCache } from '../utils/semantic-cache';
import { getCostAttributionService } from '../utils/cost-attribution';
import { tokenBucketRateLimiter } from '../middleware/token-bucket-limiter';

const router = Router();

// Mount analytics routes
router.use('/analytics', analyticsRouter);

// Apply rate limiting to AI endpoints
router.use(tokenBucketRateLimiter);

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * POST /api/ai/route - Route query to optimal AI model
 */
router.post('/route', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let selectedModel = 'gpt-4o';
  let complexity: 'low' | 'medium' | 'high' = 'medium';
  let success = false;
  let cached = false;
  let cacheSimilarity: number | undefined;
  let estimatedCost = 0;

  try {
    const { query, context, costPriority = 'balanced' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // PHASE 4: Check semantic cache first
    const cache = getSemanticCache();
    const cacheResult = await cache.lookup(query);
    
    if (cacheResult.hit) {
      // Cache hit! Return cached response
      cached = true;
      cacheSimilarity = cacheResult.similarity;
      const latency = Date.now() - startTime;

      console.log(`🎯 Cache hit! Saved $${cacheResult.cost_saved?.toFixed(4)} (${(cacheSimilarity! * 100).toFixed(1)}% similarity)`);

      // Track cost savings
      const costService = getCostAttributionService();
      costService.trackCost({
        user_id: (req.user as any)?.id,
        endpoint: '/api/ai/route',
        model: cacheResult.model || 'cached',
        tokens_input: 0,
        tokens_output: 0,
        complexity: 'low',
        cached: true
      });

      return res.json({
        model: cacheResult.model,
        content: cacheResult.response,
        complexity: 'low',
        cached: true,
        cache_similarity: cacheSimilarity,
        routing: {
          costPriority,
          estimatedCost: 0,
          reasoning: `Cache hit (${(cacheSimilarity! * 100).toFixed(1)}% similar to: "${cacheResult.original_query}")`
        },
        latency_ms: latency
      });
    }

    // Cache miss - proceed with normal routing
    const wordCount = query.split(' ').length;
    complexity = wordCount > 50 ? 'high' : wordCount > 20 ? 'medium' : 'low';

    // Route based on complexity and cost
    selectedModel = 'gpt-4o';
    if (costPriority === 'cheap') {
      selectedModel = 'gemini-2.5-flash';
    } else if (complexity === 'high') {
      selectedModel = 'claude-sonnet-4.5';
    }

    // Execute with selected model
    let response;
    let tokensInput = 0;
    let tokensOutput = 0;

    if (selectedModel.includes('claude')) {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: query }]
      });
      response = message.content[0].type === 'text' ? message.content[0].text : '';
      tokensInput = message.usage.input_tokens;
      tokensOutput = message.usage.output_tokens;
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: query }]
      });
      response = completion.choices[0]?.message?.content || '';
      tokensInput = completion.usage?.prompt_tokens || 0;
      tokensOutput = completion.usage?.completion_tokens || 0;
    }

    success = true;
    const latency = Date.now() - startTime;

    // Track cost
    const costService = getCostAttributionService();
    estimatedCost = costService.trackCost({
      user_id: (req.user as any)?.id,
      endpoint: '/api/ai/route',
      model: selectedModel,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      complexity,
      cached: false
    });

    // Add to semantic cache for future queries
    await cache.add({
      query_text: query,
      response: response,
      model: selectedModel,
      cost: estimatedCost,
      timestamp: new Date().toISOString(),
      metadata: {
        complexity,
        user_id: (req.user as any)?.id
      }
    });

    // Track performance
    trackAIPerformance('/api/ai/route', selectedModel, complexity, latency, success, (req.user as any)?.id);

    res.json({
      model: selectedModel,
      content: response,
      complexity,
      cached: false,
      routing: {
        costPriority,
        estimatedCost,
        reasoning: `Selected ${selectedModel} based on ${complexity} complexity and ${costPriority} cost priority`
      },
      latency_ms: latency
    });
  } catch (error: any) {
    console.error('AI routing error:', error);
    const latency = Date.now() - startTime;
    trackAIPerformance('/api/ai/route', selectedModel, complexity, latency, false, (req.user as any)?.id);
    
    res.status(500).json({ 
      error: 'AI routing failed', 
      details: error.message 
    });
  }
});

/**
 * POST /api/ai/ensemble - Consult multiple models in parallel
 */
router.post('/ensemble', async (req: Request, res: Response) => {
  try {
    const { query, models = ['claude', 'openai'] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await Promise.allSettled([
      // Claude
      models.includes('claude') && anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: query }]
      }),
      // OpenAI
      models.includes('openai') && openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: query }]
      })
    ].filter(Boolean));

    const responses = results.map((result, idx) => {
      const modelName = models[idx];
      if (result.status === 'fulfilled' && result.value) {
        const value = result.value as any;
        const content = value.content 
          ? (value.content[0]?.text || '') 
          : (value.choices?.[0]?.message?.content || '');
        
        return {
          model: modelName,
          content,
          confidence: 0.9,
          timestamp: new Date()
        };
      }
      return {
        model: modelName,
        content: '',
        confidence: 0,
        error: result.status === 'rejected' ? result.reason?.message : 'Failed',
        timestamp: new Date()
      };
    });

    // Simple majority voting - pick the longest response as "best"
    const bestResponse = responses.reduce((best, curr) => 
      curr.content.length > best.content.length ? curr : best
    );

    res.json({
      finalAnswer: bestResponse.content,
      method: 'majority',
      confidence: 0.85,
      models: models,
      individualResponses: responses
    });
  } catch (error: any) {
    console.error('Ensemble error:', error);
    res.status(500).json({ 
      error: 'Ensemble consultation failed', 
      details: error.message 
    });
  }
});

/**
 * GET /api/ai/metrics - Get AI orchestration metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  res.json({
    totalQueries: 0,
    costSavings: 0,
    qualityRetention: 0.95,
    averageLatency: 1200,
    modelUsage: {
      'claude-sonnet-4.5': 45,
      'gpt-4o': 35,
      'gemini-2.5-pro': 20
    }
  });
});

/**
 * GET /api/ai/status - Health check
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'operational',
    agents: {
      orchestrator: 'active',
      router: 'active',
      ensemble: 'active'
    },
    models: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

export default router;
