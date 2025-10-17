/**
 * Centralized Error Handling Hub
 * Provides unified error handling and logging across the application
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  userId?: number;
}

export class ErrorHubClass {
  private errors: Array<{ error: Error; context?: ErrorContext; timestamp: Date }> = [];
  private maxErrorsStored = 100;

  /**
   * Handle an error with optional context
   */
  handle(error: Error, context?: ErrorContext): void {
    // Store error for potential debugging
    this.errors.push({
      error,
      context,
      timestamp: new Date()
    });

    // Limit stored errors
    if (this.errors.length > this.maxErrorsStored) {
      this.errors.shift();
    }

    // Log error to console in development
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error('[ErrorHub]', {
        message: error.message,
        stack: error.stack,
        context
      });
    }

    // In production, you might want to send to an error tracking service
    // Example: Sentry, Rollbar, etc.
  }

  /**
   * Get recent errors (for debugging)
   */
  getRecentErrors(limit: number = 10): Array<{ error: Error; context?: ErrorContext; timestamp: Date }> {
    return this.errors.slice(-limit);
  }

  /**
   * Clear stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }
}

// Export singleton instance
export const ErrorHub = new ErrorHubClass();
