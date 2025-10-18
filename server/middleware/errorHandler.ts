/**
 * Mundo Tango ESA LIFE CEO - Global Error Handler
 * Phase 11 Task 5.4: Centralized error handling with custom error classes
 */

import { Request, Response, NextFunction } from 'express';

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

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

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class InvalidTokenError extends Error {
  statusCode = 401;
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
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
  console.error('[Error Handler]', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Determine status code
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof AuthenticationError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof AuthorizationError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ConflictError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof RateLimitError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof InvalidTokenError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.name || 'ERROR',
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    ...(message && { message })
  });
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
