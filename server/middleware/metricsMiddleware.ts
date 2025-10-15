/**
 * Phase 8 - Track A3: HTTP Metrics Middleware
 * Track request duration and status codes
 */

import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestsTotal } from '../monitoring/prometheus';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Record metrics
    httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);

    httpRequestsTotal
      .labels(method, route, statusCode.toString())
      .inc();
  });

  next();
}

export default metricsMiddleware;
