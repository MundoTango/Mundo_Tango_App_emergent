/**
 * Error Handler - Custom error classes
 */

export class InvalidTokenError extends Error {
  constructor(message: string = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}
