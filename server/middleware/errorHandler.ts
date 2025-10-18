/**
 * Mundo Tango ESA LIFE CEO - Error Handling Middleware
 * Custom error classes and global error handler
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Base API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Validation Error
 */
export class ValidationError extends ApiError {
  details?: any;

  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * 401 - Authentication Error
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * 401 - Invalid Token Error
 */
export class InvalidTokenError extends ApiError {
  constructor(message: string = 'Invalid or expired token') {
    super(message, 401);
    this.name = 'InvalidTokenError';
  }
}

/**
 * 403 - Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 - Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 - Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 500 - Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

/**
 * 404 Not Found Handler - must be registered before errorHandler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`
  });
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError && err.isOperational) {
    const response: any = {
      success: false,
      error: err.message
    };

    if (err instanceof ValidationError && err.details) {
      response.details = err.details;
    }

    console.error(`[${err.name}] ${err.message}`, {
      path: req.path,
      method: req.method,
      statusCode: err.statusCode
    });

    return res.status(err.statusCode).json(response);
  }

  console.error('[Unhandled Error]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}
