/**
 * TRACK 5: Error Boundaries & Graceful Degradation
 * Agent #72 - Production Safety
 * 
 * Prevents cascade failures, provides fallbacks
 */

import { Request, Response, NextFunction } from 'express';

export interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error boundary middleware
 */
export function globalErrorBoundary(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error('❌ [ErrorBoundary] Caught error:', {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(status).json({
    error: {
      message: isDevelopment ? message : 'An error occurred',
      status,
      ...(isDevelopment && { stack: err.stack })
    }
  });
}

/**
 * Graceful degradation wrapper for async routes
 */
export function gracefulHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      console.error('❌ [GracefulHandler] Route error:', error);
      
      // Try to provide a fallback response
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Service temporarily unavailable',
          fallback: true
        });
      }
    }
  };
}

/**
 * Service degradation detector
 */
export class ServiceDegradation {
  private errorCounts: Map<string, number> = new Map();
  private degradedServices: Set<string> = new Set();
  private readonly ERROR_THRESHOLD = 5;
  private readonly RECOVERY_TIME_MS = 60000; // 1 minute

  /**
   * Record error for a service
   */
  recordError(serviceName: string) {
    const current = this.errorCounts.get(serviceName) || 0;
    this.errorCounts.set(serviceName, current + 1);

    if (current + 1 >= this.ERROR_THRESHOLD) {
      this.degradedServices.add(serviceName);
      console.warn(`⚠️ [Degradation] Service degraded: ${serviceName} (${current + 1} errors)`);
      
      // Auto-recovery after timeout
      setTimeout(() => {
        this.recoverService(serviceName);
      }, this.RECOVERY_TIME_MS);
    }
  }

  /**
   * Check if service is degraded
   */
  isDegraded(serviceName: string): boolean {
    return this.degradedServices.has(serviceName);
  }

  /**
   * Recover service
   */
  private recoverService(serviceName: string) {
    this.errorCounts.delete(serviceName);
    this.degradedServices.delete(serviceName);
    console.log(`✅ [Degradation] Service recovered: ${serviceName}`);
  }

  /**
   * Get all degraded services
   */
  getDegradedServices(): string[] {
    return Array.from(this.degradedServices);
  }
}

export const serviceDegradation = new ServiceDegradation();

/**
 * Fallback response provider
 */
export class FallbackProvider {
  /**
   * Provide cached or default response when service fails
   */
  static async getFallback(serviceName: string, operation: string): Promise<any> {
    console.log(`🔄 [Fallback] Providing fallback for ${serviceName}.${operation}`);

    switch (serviceName) {
      case 'user-context':
        return {
          profile: { name: 'User', city: 'Unknown' },
          friends: [],
          events: { attended: [], upcoming: [] },
          fallback: true
        };
      
      case 'lancedb':
        return {
          results: [],
          fallback: true,
          message: 'Semantic search temporarily unavailable'
        };

      case 'ai-chat':
        return {
          message: 'AI assistant is temporarily unavailable. Please try again.',
          fallback: true
        };

      default:
        return {
          fallback: true,
          message: 'Service temporarily unavailable'
        };
    }
  }
}
