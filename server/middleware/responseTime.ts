/**
 * Response Time Middleware
 * MB.MD Created: October 19, 2025
 */

import type { Request, Response, NextFunction } from 'express';

export function responseTimeLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;
    try {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`);
      }
      if (duration > 1000) {
        console.warn(`⚠️  Slow response: ${req.method} ${req.path} took ${duration}ms`);
      }
    } catch (err) {
      // Ignore header errors
    }
    return originalSend.call(this, data);
  };
  
  next();
}
