/**
 * Standardized API Response Utilities
 */

import { Response } from 'express';

interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  });
}

// Helper function that returns the response object (not Response)
export function success<T>(data?: T, message?: string) {
  return {
    success: true as const,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
}

export function sendError(
  res: Response,
  error: Error | string,
  statusCode: number = 500,
  details?: any
): Response {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorName = typeof error === 'string' ? 'Error' : error.name;

  return res.status(statusCode).json({
    success: false,
    error: {
      name: errorName,
      message: errorMessage,
      ...(details && { details }),
    },
  });
}

// Helper function that returns the error object (not Response)
export function error(message: string, details?: any) {
  return {
    success: false as const,
    error: {
      name: 'Error',
      message,
      ...(details && { details }),
    },
  };
}

export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
