/**
 * Mundo Tango - Error Handling Middleware and Custom Error Classes
 * 
 * Provides centralized error handling for the Express application with
 * custom error types for different failure scenarios.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for invalid JWT tokens
 */
export class InvalidTokenError extends Error {
  constructor(message: string = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

/**
 * Custom error class for authentication failures
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom error class for authorization failures
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Authorization failed') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Custom error class for validation failures
 */
export class ValidationError extends Error {
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for resource not found errors
 */
export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Global error handler middleware for Express
 * 
 * Catches all errors thrown in route handlers and middleware,
 * formats them appropriately, and sends proper HTTP responses.
 * 
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error for debugging
  console.error('Error caught by errorHandler:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle specific error types with appropriate status codes
  if (err instanceof InvalidTokenError || err instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: err.message,
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({
      success: false,
      error: 'Authorization failed',
      message: err.message,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: 'Not found',
      message: err.message,
    });
  }

  // Default to 500 Internal Server Error for unhandled errors
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
  });
}
