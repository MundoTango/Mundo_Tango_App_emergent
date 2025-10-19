/**
 * Mundo Tango ESA LIFE CEO - Error Handler Middleware
 * Custom error classes and centralized error handling
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

/**
 * Invalid token errors (401)
 */
export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid or expired token') {
    super(message, 401);
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Log error (in production, use proper logging service)
  if (!isOperational || statusCode === 500) {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
