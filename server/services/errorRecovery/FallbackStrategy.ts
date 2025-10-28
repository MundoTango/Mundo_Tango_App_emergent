/**
 * Fallback Strategy for AI Model Failures
 * MB.MD SIMULTANEOUS Stream 2: Error Recovery Infrastructure
 * Graceful degradation when models fail
 * Created: October 28, 2025
 */

import { circuitBreakers } from './CircuitBreaker';

export interface ModelTier {
  name: string;
  provider: 'openai' | 'anthropic' | 'groq' | 'huggingface' | 'ollama';
  model: string;
  costPerToken: number;
  priority: number; // Lower = higher priority
}

// Fallback chain: Premium → Cheap → Free → Local
const FALLBACK_MODELS: ModelTier[] = [
  // Tier 1: Premium (5% traffic)
  { 
    name: 'Claude 3.5 Sonnet', 
    provider: 'anthropic', 
    model: 'claude-3-5-sonnet-20241022', 
    costPerToken: 0.000003,
    priority: 1
  },
  { 
    name: 'GPT-4o', 
    provider: 'openai', 
    model: 'gpt-4o', 
    costPerToken: 0.000005,
    priority: 2
  },
  
  // Tier 2: Cheap (15% traffic)
  { 
    name: 'GPT-4o Mini', 
    provider: 'openai', 
    model: 'gpt-4o-mini', 
    costPerToken: 0.00000015,
    priority: 3
  },
  { 
    name: 'Claude 3.5 Haiku', 
    provider: 'anthropic', 
    model: 'claude-3-5-haiku-20241022', 
    costPerToken: 0.00000025,
    priority: 4
  },
  
  // Tier 3: Free (80% traffic)
  { 
    name: 'Llama 3.3 70B (Groq)', 
    provider: 'groq', 
    model: 'llama-3.3-70b-versatile', 
    costPerToken: 0,
    priority: 5
  },
  { 
    name: 'Llama 3.1 8B (Groq)', 
    provider: 'groq', 
    model: 'llama-3.1-8b-instant', 
    costPerToken: 0,
    priority: 6
  },
  { 
    name: 'Mixtral 8x7B (HF)', 
    provider: 'huggingface', 
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', 
    costPerToken: 0,
    priority: 7
  },
  
  // Tier 4: Local fallback (always available)
  { 
    name: 'Llama 3.2 (Local)', 
    provider: 'ollama', 
    model: 'llama3.2', 
    costPerToken: 0,
    priority: 8
  }
];

export class FallbackStrategy {
  async executeWithFallback<T>(
    fn: (model: ModelTier) => Promise<T>,
    preferredTier: 'premium' | 'cheap' | 'free' = 'free'
  ): Promise<{ result: T; usedModel: ModelTier; attempts: number }> {
    // Sort models by priority, filtering based on preferred tier
    const candidates = this.getCandidates(preferredTier);
    let lastError: Error | null = null;
    let attempts = 0;

    for (const model of candidates) {
      attempts++;
      const circuitBreaker = circuitBreakers[model.provider];
      
      try {
        // Execute through circuit breaker
        const result = await circuitBreaker.execute(() => fn(model));
        
        console.log(`[Fallback Strategy] ✅ Success with ${model.name} (attempt ${attempts})`);
        return { result, usedModel: model, attempts };
      } catch (error) {
        lastError = error as Error;
        console.warn(`[Fallback Strategy] ❌ Failed with ${model.name}: ${(error as Error).message}`);
        
        // Continue to next model in fallback chain
        if (attempts < candidates.length) {
          console.log(`[Fallback Strategy] Trying next model in chain...`);
        }
      }
    }

    // All models failed
    throw new Error(
      `All ${attempts} fallback models failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  private getCandidates(preferredTier: 'premium' | 'cheap' | 'free'): ModelTier[] {
    let startPriority: number;
    
    switch (preferredTier) {
      case 'premium':
        startPriority = 1;
        break;
      case 'cheap':
        startPriority = 3;
        break;
      case 'free':
      default:
        startPriority = 5;
        break;
    }
    
    // Get models starting from preferred tier, falling back to cheaper/free options
    return FALLBACK_MODELS.filter(m => m.priority >= startPriority).sort((a, b) => a.priority - b.priority);
  }

  getFallbackChain(preferredTier: 'premium' | 'cheap' | 'free' = 'free'): ModelTier[] {
    return this.getCandidates(preferredTier);
  }

  getCircuitBreakerStats() {
    return Object.entries(circuitBreakers).map(([name, breaker]) => ({
      provider: name,
      ...breaker.getStats()
    }));
  }

  resetAllCircuitBreakers() {
    Object.values(circuitBreakers).forEach(breaker => breaker.reset());
    console.log('[Fallback Strategy] All circuit breakers reset');
  }
}

export const fallbackStrategy = new FallbackStrategy();
