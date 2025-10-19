import { Request, Response, NextFunction } from 'express';

/**
 * Response time logger middleware - tracks how long each API request takes
 * Logs performance metrics for monitoring and optimization
 */
export function responseTimeLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Store original end method
  const originalEnd = res.end;

  // Override res.end to log when response is sent
  res.end = function(this: Response, ...args: any[]) {
    const duration = Date.now() - startTime;
    
    // Log slow requests (over 1000ms)
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Add custom header with response time (before headers are sent)
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    
    // Call original end method
    return originalEnd.apply(this, args);
  };

  next();
}

export default responseTimeLogger;
