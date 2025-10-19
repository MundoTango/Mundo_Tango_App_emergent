import { Request, Response, NextFunction } from 'express';

export function responseTimeLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Override res.end to calculate time before headers are sent
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;
    try {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`);
      }
    } catch (e) {
      // Ignore header setting errors
    }
    return originalEnd.apply(res, args as any);
  };
  
  next();
}

export default responseTimeLogger;
