/**
 * Error Orchestration Hub for Platform Resilience
 * Centralizes error handling, recovery strategies, and degradation logic
 */

export enum ErrorLevel {
  RECOVERABLE = 'recoverable',
  DEGRADABLE = 'degradable', 
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  DATA = 'data',
  MEDIA = 'media',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  route?: string;
  metadata?: Record<string, unknown>;
}

export interface RecoveryStrategy {
  name: string;
  pattern: RegExp;
  recover: (error: Error, context: ErrorContext) => Promise<unknown>;
  maxRetries?: number;
}

export class ErrorHub {
  private static strategies = new Map<string, RecoveryStrategy>();
  private static errorCounts = new Map<string, number>();
  private static lastErrors = new Map<string, Error>();
  
  /**
   * Register a recovery strategy for specific error patterns
   */
  static register(strategy: RecoveryStrategy) {
    this.strategies.set(strategy.name, strategy);
  }
  
  /**
   * Main error handling entry point
   */
  static async handle(error: Error, context: ErrorContext): Promise<unknown> {
    // Track error occurrence
    this.trackError(error, context);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorHub] ${context.component}:${context.action}`, error);
    }
    
    // Classify error severity
    const level = this.classifyError(error);
    const category = this.categorizeError(error);
    
    // Log to monitoring service (if configured)
    this.logToMonitoring(error, context, level, category);
    
    // Handle based on severity
    switch (level) {
      case ErrorLevel.RECOVERABLE:
        return this.attemptRecovery(error, context);
      
      case ErrorLevel.DEGRADABLE:
        return this.degradeGracefully(error, context);
      
      case ErrorLevel.CRITICAL:
        return this.handleCriticalError(error, context);
    }
  }
  
  /**
   * Classify error severity based on type and content
   */
  private static classifyError(error: Error): ErrorLevel {
    const errorMessage = error.message.toLowerCase();
    
    // Network errors are often recoverable
    if (error.name === 'NetworkError' || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('network')) {
      return ErrorLevel.RECOVERABLE;
    }
    
    // Validation errors can degrade functionality
    if (error.name === 'ValidationError' ||
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid')) {
      return ErrorLevel.DEGRADABLE;
    }
    
    // Type errors and reference errors are critical
    if (error.name === 'TypeError' || 
        error.name === 'ReferenceError') {
      return ErrorLevel.CRITICAL;
    }
    
    // Authentication errors are recoverable (re-login)
    if (errorMessage.includes('auth') ||
        errorMessage.includes('unauthorized')) {
      return ErrorLevel.RECOVERABLE;
    }
    
    // Default to degradable
    return ErrorLevel.DEGRADABLE;
  }
  
  /**
   * Categorize error for better tracking
   */
  private static categorizeError(error: Error): ErrorCategory {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
      return ErrorCategory.PERMISSION;
    }
    if (errorMessage.includes('data') || errorMessage.includes('null') || errorMessage.includes('undefined')) {
      return ErrorCategory.DATA;
    }
    if (errorMessage.includes('media') || errorMessage.includes('image') || errorMessage.includes('video')) {
      return ErrorCategory.MEDIA;
    }
    
    return ErrorCategory.UNKNOWN;
  }
  
  /**
   * Attempt to recover from recoverable errors
   */
  private static async attemptRecovery(
    error: Error, 
    context: ErrorContext
  ): Promise<unknown> {
    // Check if we have a specific recovery strategy
    for (const [name, strategy] of this.strategies) {
      if (strategy.pattern.test(error.message)) {
        const errorKey = `${context.component}-${name}`;
        const retryCount = this.errorCounts.get(errorKey) || 0;
        
        // Check max retries
        if (strategy.maxRetries && retryCount >= strategy.maxRetries) {
          console.warn(`[ErrorHub] Max retries reached for ${name}`);
          return this.degradeGracefully(error, context);
        }
        
        // Attempt recovery
        this.errorCounts.set(errorKey, retryCount + 1);
        try {
          const result = await strategy.recover(error, context);
          // Reset count on successful recovery
          this.errorCounts.delete(errorKey);
          return result;
        } catch (recoveryError) {
          console.error(`[ErrorHub] Recovery failed for ${name}`, recoveryError);
          return this.degradeGracefully(error, context);
        }
      }
    }
    
    // Default recovery: exponential backoff retry
    return this.retryWithBackoff(context);
  }
  
  /**
   * Degrade functionality gracefully
   */
  private static degradeGracefully(
    error: Error,
    context: ErrorContext
  ): unknown {
    console.warn(`[ErrorHub] Degrading ${context.component} due to:`, error.message);
    
    // Return degraded mode indicator
    return {
      degraded: true,
      reason: error.message,
      component: context.component,
      fallbackMode: 'cache', // or 'minimal' or 'readonly'
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle critical errors that can't be recovered
   */
  private static handleCriticalError(
    error: Error,
    context: ErrorContext
  ): unknown {
    console.error(`[ErrorHub] CRITICAL ERROR in ${context.component}:`, error);
    
    // Return critical error state
    return {
      critical: true,
      error: {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      component: context.component,
      action: context.action,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Retry with exponential backoff
   */
  private static async retryWithBackoff(
    context: ErrorContext,
    maxRetries = 3
  ): Promise<unknown> {
    const errorKey = `${context.component}-${context.action}`;
    const retryCount = this.errorCounts.get(errorKey) || 0;
    
    if (retryCount >= maxRetries) {
      this.errorCounts.delete(errorKey);
      throw new Error(`Max retries exceeded for ${errorKey}`);
    }
    
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    this.errorCounts.set(errorKey, retryCount + 1);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ retry: true, attempt: retryCount + 1, delay });
      }, delay);
    });
  }
  
  /**
   * Track error occurrences
   */
  private static trackError(error: Error, context: ErrorContext) {
    const errorKey = `${context.component}-${context.action}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    this.lastErrors.set(errorKey, error);
  }
  
  /**
   * Log to monitoring service (placeholder for actual implementation)
   */
  private static logToMonitoring(
    error: Error,
    context: ErrorContext,
    level: ErrorLevel,
    category: ErrorCategory
  ) {
    // This would integrate with Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        level: level === ErrorLevel.CRITICAL ? 'error' : 'warning',
        tags: {
          component: context.component,
          action: context.action,
          category
        },
        extra: context.metadata
      });
    }
  }
  
  /**
   * Get error statistics
   */
  static getStats() {
    return {
      errorCounts: Object.fromEntries(this.errorCounts),
      lastErrors: Object.fromEntries(
        Array.from(this.lastErrors.entries()).map(([key, error]) => [
          key,
          { message: error.message, name: error.name }
        ])
      ),
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0)
    };
  }
  
  /**
   * Clear error history
   */
  static clearHistory() {
    this.errorCounts.clear();
    this.lastErrors.clear();
  }
}

// Register default recovery strategies
ErrorHub.register({
  name: 'network-retry',
  pattern: /network|fetch|timeout/i,
  maxRetries: 3,
  recover: async (error, context) => {
    // Wait and signal retry
    await new Promise(r => setTimeout(r, 1000));
    return { shouldRetry: true };
  }
});

ErrorHub.register({
  name: 'auth-refresh',
  pattern: /unauthorized|401|token/i,
  maxRetries: 1,
  recover: async (error, context) => {
    // Attempt to refresh auth token
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        return { authRefreshed: true };
      }
    } catch {
      // Refresh failed
    }
    return { needsLogin: true };
  }
});

ErrorHub.register({
  name: 'validation-fallback',
  pattern: /validation|invalid|schema/i,
  maxRetries: 0,
  recover: async (error, context) => {
    // Return with validation error flag
    return { validationError: true, fallbackToDefault: true };
  }
});