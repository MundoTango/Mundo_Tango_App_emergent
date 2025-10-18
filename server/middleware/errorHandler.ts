/**
 * Mundo Tango ESA LIFE CEO - Global Error Handler & Custom Error Classes
 * Phase 11: Standardized error handling across all routes
 */

import { Request, Response, NextFunction } from 'express';

// Custom Error Classes
export class AuthenticationError extends Error {
  statusCode = 401;
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string = 'Invalid request data') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class InvalidTokenError extends Error {
  statusCode = 401;
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Global error handler middleware (also exported as errorHandler for compatibility)
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error for debugging
  console.error('[Global Error Handler]', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Get status code from custom error or default to 500
  const statusCode = (err as any).statusCode || 500;
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Not found handler (404)
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
}

// Async route wrapper to catch errors
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Success response helper (re-export for convenience)
export function success<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

// Error response helper
export function error(message: string) {
  return {
    success: false,
    error: message
  };
}

// Export as errorHandler for compatibility
export const errorHandler = globalErrorHandler;
