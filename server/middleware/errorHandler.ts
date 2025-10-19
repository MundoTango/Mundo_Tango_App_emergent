/**
 * Error Handler Middleware
 * Custom error classes and error handling middleware
 */

import { Request, Response, NextFunction } from 'express';

// Custom Error Classes
export class InvalidTokenError extends Error {
  statusCode: number;
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
    this.statusCode = 401;
  }
}

export class AuthenticationError extends Error {
  statusCode: number;
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  statusCode: number;
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

// Global error handler middleware
export function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`❌ [${err.name}] ${message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      name: err.name,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
