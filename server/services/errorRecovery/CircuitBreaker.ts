/**
 * Circuit Breaker Pattern
 * MB.MD SIMULTANEOUS Stream 2: Error Recovery Infrastructure
 * Prevents cascading failures in AI API calls
 * Created: October 28, 2025
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Blocking requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  successThreshold: number;    // Successes needed to close from half-open
  timeout: number;             // Time to wait before attempting half-open (ms)
  monitoringPeriod: number;    // Time window for counting failures (ms)
}

interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  lastStateChange: number;
  totalRequests: number;
  totalFailures: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private lastStateChange: number = Date.now();
  private nextAttempt: number = 0;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  
  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,        // 1 minute
      monitoringPeriod: 120000 // 2 minutes
    }
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;
    
    // Check if circuit is OPEN
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`[Circuit Breaker: ${this.name}] Circuit is OPEN. Service unavailable.`);
      }
      // Try to transition to HALF_OPEN
      this.state = CircuitState.HALF_OPEN;
      this.lastStateChange = Date.now();
      console.log(`[Circuit Breaker: ${this.name}] Transitioning to HALF_OPEN for testing`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        this.lastStateChange = Date.now();
        console.log(`[Circuit Breaker: ${this.name}] Circuit CLOSED - service recovered`);
      }
    }
  }

  private onFailure() {
    this.failures++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();
    
    // Remove old failures outside monitoring period
    if (this.lastFailureTime) {
      const periodStart = Date.now() - this.config.monitoringPeriod;
      if (this.lastFailureTime < periodStart) {
        this.failures = 1; // Reset count, this is first failure in new period
      }
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Immediately open on any failure in HALF_OPEN
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;
      this.successes = 0;
      this.lastStateChange = Date.now();
      console.warn(`[Circuit Breaker: ${this.name}] Circuit OPENED - test failed in HALF_OPEN`);
    } else if (this.failures >= this.config.failureThreshold) {
      // Open circuit after threshold failures
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;
      this.lastStateChange = Date.now();
      console.warn(`[Circuit Breaker: ${this.name}] Circuit OPENED - failure threshold reached (${this.failures}/${this.config.failureThreshold})`);
    }
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures
    };
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.lastStateChange = Date.now();
    this.nextAttempt = 0;
    console.log(`[Circuit Breaker: ${this.name}] Manual reset - circuit CLOSED`);
  }
}

// Global circuit breakers for different AI services
export const circuitBreakers = {
  openai: new CircuitBreaker('OpenAI API', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,      // 30 seconds
    monitoringPeriod: 60000 // 1 minute
  }),
  anthropic: new CircuitBreaker('Anthropic API', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
    monitoringPeriod: 60000
  }),
  groq: new CircuitBreaker('Groq Cloud', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 20000,      // 20 seconds (faster recovery for free tier)
    monitoringPeriod: 60000
  }),
  huggingface: new CircuitBreaker('Hugging Face', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 20000,
    monitoringPeriod: 60000
  }),
  ollama: new CircuitBreaker('Ollama Local', {
    failureThreshold: 2,
    successThreshold: 1,
    timeout: 10000,      // 10 seconds (local service)
    monitoringPeriod: 30000
  })
};
