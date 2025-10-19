import { Request, Response, NextFunction } from 'express';

export class AuthenticationError extends Error {
  statusCode: number;
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
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

export class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof AuthenticationError ||
      err instanceof ValidationError ||
      err instanceof NotFoundError ||
      err instanceof ForbiddenError) {
    return res.status((err as any).statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}
