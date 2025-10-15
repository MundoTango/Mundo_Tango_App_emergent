/**
 * Phase 10 - Track B2: Circuit Breaker Pattern
 * Prevents cascading failures by failing fast when errors exceed threshold
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening (default: 5)
  successThreshold: number; // Successes in HALF_OPEN before closing (default: 2)
  timeout: number; // Time in ms before attempting HALF_OPEN (default: 60000)
  monitoringPeriod: number; // Period to track failures (default: 60000)
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime: Date | null;
  lastStateChange: Date;
}

export class CircuitBreaker<T = any> {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private successes: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime: Date | null = null;
  private lastStateChange: Date = new Date();
  private nextAttempt: number = Date.now();
  private failureTimestamps: number[] = [];

  private options: Required<CircuitBreakerOptions>;

  constructor(
    private name: string,
    private action: () => Promise<T>,
    options: Partial<CircuitBreakerOptions> = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      successThreshold: options.successThreshold || 2,
      timeout: options.timeout || 60000,
      monitoringPeriod: options.monitoringPeriod || 60000
    };
  }

  /**
   * Execute the action through the circuit breaker
   */
  async execute(): Promise<T> {
    this.totalRequests++;

    // Check circuit state
    if (this.state === 'OPEN') {
      // Check if timeout has elapsed
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker [${this.name}] is OPEN - failing fast`);
      }
      // Timeout elapsed, transition to HALF_OPEN
      this.setState('HALF_OPEN');
    }

    try {
      const result = await this.action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failures = 0;
    this.failureTimestamps = [];

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.setState('CLOSED');
        this.successes = 0;
        console.log(`✅ [Circuit Breaker: ${this.name}] CLOSED - service recovered`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    const now = Date.now();
    this.failures++;
    this.lastFailureTime = new Date();
    this.failureTimestamps.push(now);

    // Remove old failures outside monitoring period
    this.failureTimestamps = this.failureTimestamps.filter(
      timestamp => now - timestamp < this.options.monitoringPeriod
    );

    if (this.state === 'HALF_OPEN') {
      // Any failure in HALF_OPEN state reopens circuit
      this.setState('OPEN');
      this.nextAttempt = now + this.options.timeout;
      console.error(`🚨 [Circuit Breaker: ${this.name}] REOPENED - test failed`);
    } else if (this.failureTimestamps.length >= this.options.failureThreshold) {
      // Too many failures in monitoring period
      this.setState('OPEN');
      this.nextAttempt = now + this.options.timeout;
      console.error(`🚨 [Circuit Breaker: ${this.name}] OPENED - ${this.failures} failures in ${this.options.monitoringPeriod}ms`);
    }
  }

  /**
   * Change circuit state
   */
  private setState(newState: CircuitState): void {
    this.state = newState;
    this.lastStateChange = new Date();
  }

  /**
   * Get current stats
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failureTimestamps.length,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange
    };
  }

  /**
   * Manually reset circuit
   */
  reset(): void {
    this.setState('CLOSED');
    this.failures = 0;
    this.successes = 0;
    this.failureTimestamps = [];
    this.lastFailureTime = null;
    console.log(`🔄 [Circuit Breaker: ${this.name}] Manually reset to CLOSED`);
  }

  /**
   * Get state
   */
  getState(): CircuitState {
    return this.state;
  }
}

/**
 * Circuit Breaker Manager
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker<any>> = new Map();

  /**
   * Create or get circuit breaker
   */
  getBreaker<T>(
    name: string,
    action: () => Promise<T>,
    options?: Partial<CircuitBreakerOptions>
  ): CircuitBreaker<T> {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, action, options));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breaker stats
   */
  getAllStats(): Map<string, CircuitBreakerStats> {
    const stats = new Map<string, CircuitBreakerStats>();
    for (const [name, breaker] of this.breakers.entries()) {
      stats.set(name, breaker.getStats());
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Singleton instance
export const circuitBreakerManager = new CircuitBreakerManager();
