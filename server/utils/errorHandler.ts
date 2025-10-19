/**
 * Error Handler Middleware
 * MB.MD Created: October 19, 2025
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * 404 Not Found handler - catches unmatched routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
}

/**
 * Global error handler - catches all errors
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('❌ Error:', err);
  
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: isDev ? err.message : 'Internal server error',
    stack: isDev ? err.stack : undefined,
  });
}
