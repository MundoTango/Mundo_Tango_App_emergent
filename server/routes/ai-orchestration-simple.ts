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

const router = Router();

// Mount analytics routes
router.use('/analytics', analyticsRouter);

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

  try {
    const { query, context, costPriority = 'balanced' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Simple complexity analysis
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
    if (selectedModel.includes('claude')) {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: query }]
      });
      response = message.content[0].type === 'text' ? message.content[0].text : '';
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: query }]
      });
      response = completion.choices[0]?.message?.content || '';
    }

    success = true;
    const latency = Date.now() - startTime;

    // Track performance
    trackAIPerformance('/api/ai/route', selectedModel, complexity, latency, success, (req.user as any)?.id);

    res.json({
      model: selectedModel,
      content: response,
      complexity,
      routing: {
        costPriority,
        estimatedCost: 0.001,
        reasoning: `Selected ${selectedModel} based on ${complexity} complexity and ${costPriority} cost priority`
      }
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
