/**
 * Mundo Tango ESA LIFE CEO - Global Error Handler
 * Phase 11 Task 3.1: Centralized error handling with sanitized responses
 */

import { Request, Response, NextFunction } from 'express';

// Error type enumeration
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Authentication errors (401)
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

// Base error class with code and status
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes for easy throwing
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(ErrorCode.AUTHENTICATION_REQUIRED, message, 401);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid or expired token') {
    super(ErrorCode.INVALID_TOKEN, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(ErrorCode.FORBIDDEN, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(ErrorCode.NOT_FOUND, message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.CONFLICT, message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(ErrorCode.DATABASE_ERROR, message, 500);
  }
}

// Standardized error response format
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    details?: any;
  };
}

/**
 * Global error handler middleware
 * MUST be registered AFTER all routes in server/routes.ts
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const timestamp = new Date().toISOString();

  // Default to 500 Internal Server Error
  let statusCode = 500;
  let code = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;

    // Log application errors
    console.error(`[${timestamp}] ${code}: ${message}`, {
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
      details: err.details,
    });
  } 
  // Handle Zod validation errors
  else if (err.name === 'ZodError') {
    statusCode = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
    details = (err as any).errors;

    console.error(`[${timestamp}] Validation Error:`, {
      path: req.path,
      errors: details,
    });
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = ErrorCode.INVALID_TOKEN;
    message = 'Invalid authentication token';

    console.error(`[${timestamp}] JWT Error:`, {
      path: req.path,
      error: err.message,
    });
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = ErrorCode.TOKEN_EXPIRED;
    message = 'Authentication token has expired';

    console.error(`[${timestamp}] Token Expired:`, {
      path: req.path,
    });
  }
  // Handle unknown errors (CRITICAL - potential bugs)
  else {
    console.error(`[${timestamp}] ❌ UNHANDLED ERROR:`, {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
    });

    // In production, don't leak error details
    if (isProduction) {
      message = 'An unexpected error occurred. Please try again later.';
    } else {
      message = err.message;
      details = { stack: err.stack };
    }
  }

  // Build standardized error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      statusCode,
      timestamp,
      ...(details && !isProduction ? { details } : {}),
    },
  };

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler for unknown routes
 * Register this BEFORE the global error handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();

  console.warn(`[${timestamp}] 404 Not Found: ${req.method} ${req.path}`);

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route not found: ${req.method} ${req.path}`,
      statusCode: 404,
      timestamp,
    },
  };

  res.status(404).json(errorResponse);
};
