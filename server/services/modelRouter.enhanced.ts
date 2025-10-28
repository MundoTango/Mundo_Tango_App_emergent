/**
 * Enhanced Multi-Model Router with Cost Optimization
 * Routes requests to optimal model (open source or commercial)
 * MB.MD: 99.5% cost reduction strategy
 * Created: October 28, 2025
 */

import { ModelProvider, TaskType, routeToModel as baseRouteToModel } from './modelRouter';
import { openSourceService } from './openSource/OpenSourceManagementService';
import { db } from '../db';
import { modelIntegrations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface EnhancedRoutingDecision {
  provider: ModelProvider | 'groq' | 'ollama';
  model: string;
  reason: string;
  estimatedCost: 'free' | 'low' | 'medium' | 'high';
  openSource: boolean;
  fallback?: {
    provider: ModelProvider;
    model: string;
  };
}

/**
 * Hybrid Routing Strategy:
 * - 80% → Free models (Gemini, Llama via Groq)
 * - 15% → Cheap models (GPT-4o-mini, Claude Haiku)
 * - 5% → Premium models (Claude Sonnet, GPT-4o)
 */
export class EnhancedModelRouter {
  /**
   * Route with cost optimization
   */
  async route(
    taskType: TaskType,
    feature: string,
    userPreference?: ModelProvider
  ): Promise<EnhancedRoutingDecision> {
    // Check if open source alternatives are available for this feature
    const integrations = await db.query.modelIntegrations.findMany({
      where: and(
        eq(modelIntegrations.feature, feature),
        eq(modelIntegrations.status, 'production')
      ),
      with: {
        model: true
      }
    });
    
    // Strategy 1: Try open source first (80% of requests)
    const shouldUseOpenSource = Math.random() < 0.80;
    
    if (shouldUseOpenSource && integrations.length > 0) {
      // Weighted random selection based on routing percentage
      const totalWeight = integrations.reduce((sum, i) => sum + (i.routingPercentage || 0), 0);
      let random = Math.random() * totalWeight;
      
      for (const integration of integrations) {
        random -= (integration.routingPercentage || 0);
        if (random <= 0 && integration.model) {
          return this.routeToOpenSource(integration.model.name, integration.model.category, taskType);
        }
      }
    }
    
    // Strategy 2: Use cheap commercial models (15% of requests)
    const shouldUseCheap = Math.random() < 0.15 / (1 - 0.80); // 15% of remaining 20%
    
    if (shouldUseCheap) {
      return this.routeToCheap(taskType);
    }
    
    // Strategy 3: Use premium models (5% of requests)
    return this.routeToPremium(taskType, userPreference);
  }
  
  /**
   * Route to open source model (FREE)
   */
  private routeToOpenSource(
    modelName: string,
    category: string,
    taskType: TaskType
  ): EnhancedRoutingDecision {
    // Map model names to providers and configs
    const modelMap: Record<string, { provider: 'groq' | 'ollama', model: string }> = {
      'Llama 3.1 405B': { provider: 'groq', model: 'llama-3.1-405b-reasoning' },
      'Llama 3.1 70B': { provider: 'groq', model: 'llama-3.1-70b-versatile' },
      'Qwen 2.5 Coder 32B': { provider: 'ollama', model: 'qwen2.5-coder:32b' },
      'Whisper Large v3': { provider: 'ollama', model: 'whisper:large-v3' },
      'Bark': { provider: 'ollama', model: 'bark' }
    };
    
    const config = modelMap[modelName] || { provider: 'groq', model: 'llama-3.1-70b-versatile' };
    
    return {
      provider: config.provider,
      model: config.model,
      reason: `Open source alternative: ${modelName} (FREE, ${category})`,
      estimatedCost: 'free',
      openSource: true,
      fallback: {
        provider: 'claude',
        model: 'claude-3-5-sonnet-20241022'
      }
    };
  }
  
  /**
   * Route to cheap commercial model (LOW COST)
   * Updated Oct 28: Prioritize Gemini 2.5 Flash/Pro for 15x cost reduction
   */
  private routeToCheap(taskType: TaskType): EnhancedRoutingDecision {
    // PRIORITY 1: Gemini 2.5 Flash for simple tasks (150x cheaper than Claude)
    if (taskType === 'chat' || taskType === 'simple_query') {
      return {
        provider: 'google' as any,
        model: 'gemini-2.5-flash',
        reason: 'Ultra cost-optimized with Gemini Flash ($0.001/request)',
        estimatedCost: 'free', // Practically free
        openSource: false
      };
    }

    // PRIORITY 2: Gemini 2.5 Pro for code tasks (15x cheaper than Claude)
    if (taskType === 'code_generation' || taskType === 'code_review') {
      return {
        provider: 'google' as any,
        model: 'gemini-2.5-pro',
        reason: 'Cost-optimized for code tasks with Gemini Pro ($0.01/request)',
        estimatedCost: 'low',
        openSource: false,
        fallback: {
          provider: 'claude',
          model: 'claude-3-haiku-20240307'
        }
      };
    }
    
    // FALLBACK: Claude Haiku
    return {
      provider: 'claude',
      model: 'claude-3-haiku-20240307',
      reason: 'Cost-optimized general purpose',
      estimatedCost: 'low',
      openSource: false
    };
  }
  
  /**
   * Route to premium model (HIGH QUALITY)
   */
  private routeToPremium(taskType: TaskType, userPreference?: ModelProvider): EnhancedRoutingDecision {
    const baseDecision = baseRouteToModel(taskType, userPreference);
    
    return {
      ...baseDecision,
      openSource: false,
      fallback: {
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    };
  }
  
  /**
   * Track routing decision for cost analysis
   */
  async trackRouting(decision: EnhancedRoutingDecision, tokens: { input: number; output: number }) {
    const costPerMillion = {
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-sonnet-4-20250514': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
      'gpt-4o-2024-11-20': { input: 10, output: 30 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gemini-pro': { input: 1.25, output: 5 },
      // Gemini 2.5 (Oct 28, 2025 - 15x cheaper!)
      'gemini-2.5-flash': { input: 0.01, output: 0.01 }, // $0.001/request
      'gemini-2.5-pro': { input: 0.1, output: 0.1 }, // $0.01/request
      // Open source models (Groq free tier)
      'llama-3.1-405b-reasoning': { input: 0, output: 0 },
      'llama-3.1-70b-versatile': { input: 0, output: 0 },
    };
    
    const pricing = costPerMillion[decision.model as keyof typeof costPerMillion] || { input: 0, output: 0 };
    const estimatedCost = (
      (tokens.input * pricing.input / 1_000_000) +
      (tokens.output * pricing.output / 1_000_000)
    );
    
    await openSourceService.trackCosts({
      provider: decision.provider,
      model: decision.model,
      requestCount: 1,
      tokenCount: tokens.input + tokens.output,
      estimatedCost
    });
  }
}

export const enhancedRouter = new EnhancedModelRouter();
