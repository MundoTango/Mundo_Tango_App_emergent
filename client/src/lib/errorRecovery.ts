/**
 * AGENT #144 (UX/A11y): Tiered Error Recovery System
 * 
 * Auto → Guided → Human escalation pattern
 * Research: docs/research/UX_PATTERNS_RESEARCH.md
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecoveryTier = 'auto' | 'guided' | 'human';

export interface ErrorContext {
  code: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: any;
  stackTrace?: string;
}

export interface RecoveryStrategy {
  tier: RecoveryTier;
  action: string;
  description: string;
  automated?: boolean;
  estimatedTime?: string;
}

/**
 * Error messages library (10+ varied responses)
 * Prevents repetitive "An error occurred" messages
 */
const ERROR_MESSAGES: Record<string, string[]> = {
  network: [
    "Hmm, we're having trouble connecting. Mind trying again?",
    "The connection seems a bit wobbly. Let's give it another shot.",
    "Network hiccup detected. Ready to retry when you are!",
  ],
  validation: [
    "Oops! That doesn't quite look right. Could you check your input?",
    "Almost there! A few fields need your attention.",
    "We need a bit more information to continue.",
  ],
  timeout: [
    "This is taking longer than expected. Want to try again?",
    "The request timed out. Let's give it another go!",
    "That took too long. How about we retry?",
  ],
  server: [
    "Something went wrong on our end. We're looking into it!",
    "Our servers had a hiccup. Try again in a moment?",
    "Technical difficulties. We've been notified!",
  ],
  auth: [
    "Your session expired. Mind logging in again?",
    "Authentication needed. Let's sign you back in.",
    "Session timeout. A quick re-login will fix this!",
  ],
  general: [
    "Something unexpected happened. Let's try that again.",
    "Oops! That didn't work as planned. Want to retry?",
    "We hit a snag. Ready to give it another shot?",
    "That didn't quite work. Let's troubleshoot together!",
  ]
};

/**
 * Determine error severity based on error type and context
 */
export function classifyError(error: Error | unknown): ErrorContext {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Network errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: errorMessage,
      severity: 'medium',
      timestamp: new Date(),
      stackTrace: stack
    };
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      code: 'VALIDATION_ERROR',
      message: errorMessage,
      severity: 'low',
      timestamp: new Date(),
      stackTrace: stack
    };
  }

  // Auth errors
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return {
      code: 'AUTH_ERROR',
      message: errorMessage,
      severity: 'high',
      timestamp: new Date(),
      stackTrace: stack
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      code: 'TIMEOUT_ERROR',
      message: errorMessage,
      severity: 'medium',
      timestamp: new Date(),
      stackTrace: stack
    };
  }

  // Server errors (5xx)
  if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
    return {
      code: 'SERVER_ERROR',
      message: errorMessage,
      severity: 'high',
      timestamp: new Date(),
      stackTrace: stack
    };
  }

  // Default: general error
  return {
    code: 'GENERAL_ERROR',
    message: errorMessage,
    severity: 'medium',
    timestamp: new Date(),
    stackTrace: stack
  };
}

/**
 * Get friendly error message (varied, non-repetitive)
 */
export function getFriendlyErrorMessage(errorContext: ErrorContext, attemptCount: number = 0): string {
  const category = errorContext.code.toLowerCase().replace('_error', '');
  const messages = ERROR_MESSAGES[category] || ERROR_MESSAGES.general;
  
  // Rotate through messages based on attempt count
  const messageIndex = attemptCount % messages.length;
  return messages[messageIndex];
}

/**
 * Determine recovery strategy based on error severity
 */
export function getRecoveryStrategy(errorContext: ErrorContext, attemptCount: number): RecoveryStrategy {
  const { severity, code } = errorContext;

  // TIER 1: AUTO RECOVERY (low severity, first 2 attempts)
  if (severity === 'low' && attemptCount < 2) {
    return {
      tier: 'auto',
      action: 'retry',
      description: 'Automatically retrying...',
      automated: true,
      estimatedTime: '2s'
    };
  }

  // Network errors: auto-retry with exponential backoff
  if (code === 'NETWORK_ERROR' && attemptCount < 3) {
    return {
      tier: 'auto',
      action: 'retry_with_backoff',
      description: `Retrying in ${Math.pow(2, attemptCount)}s...`,
      automated: true,
      estimatedTime: `${Math.pow(2, attemptCount)}s`
    };
  }

  // TIER 2: GUIDED RECOVERY (medium severity or after failed auto-retries)
  if (severity === 'medium' || (severity === 'low' && attemptCount >= 2)) {
    switch (code) {
      case 'VALIDATION_ERROR':
        return {
          tier: 'guided',
          action: 'show_validation_hints',
          description: 'Please review the highlighted fields and try again.',
          automated: false
        };
      
      case 'TIMEOUT_ERROR':
        return {
          tier: 'guided',
          action: 'suggest_simplification',
          description: 'Try a smaller request or check your connection.',
          automated: false
        };

      case 'NETWORK_ERROR':
        return {
          tier: 'guided',
          action: 'check_connection',
          description: 'Check your internet connection and retry.',
          automated: false
        };
      
      default:
        return {
          tier: 'guided',
          action: 'manual_retry',
          description: 'Review the issue and try again when ready.',
          automated: false
        };
    }
  }

  // TIER 3: HUMAN ESCALATION (high/critical severity or repeated failures)
  if (severity === 'high' || severity === 'critical' || attemptCount >= 3) {
    return {
      tier: 'human',
      action: 'contact_support',
      description: 'This needs attention. Contact support or check the logs.',
      automated: false
    };
  }

  // Fallback: guided recovery
  return {
    tier: 'guided',
    action: 'manual_intervention',
    description: 'Please try again or contact support if the issue persists.',
    automated: false
  };
}

/**
 * Execute recovery action
 */
export async function executeRecovery(
  strategy: RecoveryStrategy,
  retryFn: () => Promise<any>
): Promise<{ success: boolean; result?: any; error?: Error }> {
  try {
    switch (strategy.action) {
      case 'retry':
        const result = await retryFn();
        return { success: true, result };

      case 'retry_with_backoff':
        const delay = parseInt(strategy.estimatedTime || '1s');
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
        const backoffResult = await retryFn();
        return { success: true, result: backoffResult };

      default:
        // For guided/human strategies, don't auto-retry
        return { success: false };
    }
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * Track error attempts for recovery escalation
 */
class ErrorTracker {
  private attempts: Map<string, number> = new Map();

  recordAttempt(errorCode: string): number {
    const count = (this.attempts.get(errorCode) || 0) + 1;
    this.attempts.set(errorCode, count);
    return count;
  }

  resetAttempts(errorCode: string): void {
    this.attempts.delete(errorCode);
  }

  getAttemptCount(errorCode: string): number {
    return this.attempts.get(errorCode) || 0;
  }
}

export const errorTracker = new ErrorTracker();
