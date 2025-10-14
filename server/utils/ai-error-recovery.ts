/**
 * AI Error Recovery - Production hardening
 * Graceful degradation and automatic failover for AI models
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  exponential: boolean;
}

export interface FallbackChain {
  primary: string;
  fallbacks: string[];
}

// Default retry configuration
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponential: true,
};

// Model fallback chains
const modelFallbacks: Record<string, string[]> = {
  'claude-sonnet-4.5': ['gpt-4o', 'gemini-2.5-pro'],
  'gpt-4o': ['gemini-2.5-pro', 'claude-sonnet-4.5'],
  'gemini-2.5-pro': ['gpt-4o', 'gemini-2.5-flash'],
  'gemini-2.5-flash': ['gpt-4o', 'gemini-2.5-pro'],
};

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const {
    maxRetries,
    baseDelay,
    maxDelay,
    exponential,
  } = { ...defaultRetryConfig, ...config };

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw error;
      }

      // Last attempt failed
      if (attempt === maxRetries) {
        console.error(`[AI Recovery] All ${maxRetries} retry attempts failed`);
        throw lastError;
      }

      // Calculate delay
      const delay = exponential
        ? Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        : baseDelay;

      console.warn(`[AI Recovery] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Try models with fallback chain
 */
export async function tryWithFallback<T>(
  modelId: string,
  operation: (model: string) => Promise<T>
): Promise<{ result: T; modelUsed: string; attempted: string[] }> {
  const fallbackChain = [modelId, ...(modelFallbacks[modelId] || [])];
  const attempted: string[] = [];
  let lastError: Error;

  for (const model of fallbackChain) {
    attempted.push(model);

    try {
      console.log(`[AI Recovery] Attempting model: ${model}`);
      const result = await operation(model);
      
      if (model !== modelId) {
        console.warn(`[AI Recovery] Fallback successful: ${modelId} → ${model}`);
      }

      return {
        result,
        modelUsed: model,
        attempted,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`[AI Recovery] Model ${model} failed:`, error);

      // Check if we should continue to next fallback
      if (isNonRetryableError(error) || attempted.length === fallbackChain.length) {
        break;
      }
    }
  }

  // All models failed
  console.error(`[AI Recovery] All fallback models failed. Attempted: ${attempted.join(', ')}`);
  throw new Error(
    `All AI models failed. Attempted: ${attempted.join(', ')}. Last error: ${lastError!.message}`
  );
}

/**
 * Circuit breaker pattern
 */
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
        console.log('[Circuit Breaker] Transitioning to half-open state');
      } else {
        throw new Error('Circuit breaker is open. Service temporarily unavailable.');
      }
    }

    try {
      const result = await operation();

      if (this.state === 'half-open') {
        this.reset();
        console.log('[Circuit Breaker] Reset to closed state');
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold && this.state === 'closed') {
      this.state = 'open';
      console.error(`[Circuit Breaker] Opened after ${this.failures} failures`);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  getState(): string {
    return this.state;
  }
}

// Circuit breakers for each AI model
const circuitBreakers: Record<string, CircuitBreaker> = {
  'claude-sonnet-4.5': new CircuitBreaker(),
  'gpt-4o': new CircuitBreaker(),
  'gemini-2.5-pro': new CircuitBreaker(),
  'gemini-2.5-flash': new CircuitBreaker(),
};

/**
 * Get circuit breaker for model
 */
export function getCircuitBreaker(modelId: string): CircuitBreaker {
  if (!circuitBreakers[modelId]) {
    circuitBreakers[modelId] = new CircuitBreaker();
  }
  return circuitBreakers[modelId];
}

/**
 * Check if error should not be retried
 */
function isNonRetryableError(error: any): boolean {
  const nonRetryableStatuses = [400, 401, 403, 404, 422];
  const statusCode = error.status || error.statusCode;

  if (nonRetryableStatuses.includes(statusCode)) {
    return true;
  }

  // Check error messages
  const message = error.message?.toLowerCase() || '';
  if (message.includes('invalid api key') || message.includes('unauthorized')) {
    return true;
  }

  return false;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Graceful degradation response
 */
export function getDegradedResponse(complexity: 'low' | 'medium' | 'high'): {
  content: string;
  degraded: boolean;
} {
  const messages = {
    low: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
    medium: 'The AI service is temporarily unavailable. Your question has been logged and will be processed shortly.',
    high: 'All AI models are currently unavailable. Please try again later or contact support if this persists.',
  };

  return {
    content: messages[complexity],
    degraded: true,
  };
}
