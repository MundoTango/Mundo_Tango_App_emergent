/**
 * Mundo Tango ESA LIFE CEO - Global Error Handler
 * Phase 11 Task 5.3: Centralized error handling with standardized responses
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  public statusCode: number = 400;
  public errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends Error {
  public statusCode: number = 401;

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  public statusCode: number = 403;

  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  public statusCode: number = 404;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  public statusCode: number = 409;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.path}`);
  next(error);
};

/**
 * Global Error Handler
 * Catches all errors and returns standardized JSON responses
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details (only in development or for server errors)
  if (process.env.NODE_ENV === 'development' || error.statusCode >= 500) {
    console.error('[Error Handler]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Build error response
  const errorResponse: any = {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      type: error.name || 'Error',
    },
  };

  // Add validation errors if present
  if (error instanceof ValidationError && error.errors.length > 0) {
    errorResponse.error.details = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
