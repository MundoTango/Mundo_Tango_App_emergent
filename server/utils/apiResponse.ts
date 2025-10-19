/**
 * Mundo Tango ESA LIFE CEO - API Response Utilities
 * Standardized API response helpers
 */

import { Request } from 'express';

/**
 * Standard success response
 */
export function success<T = any>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Success response with pagination metadata
 */
export function successWithPagination<T = any>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
) {
  return {
    success: true,
    data,
    pagination,
    ...(message && { message })
  };
}

/**
 * Parse pagination parameters from request query
 */
export function parsePagination(req: Request) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
}

/**
 * Error response
 */
export function error(message: string, statusCode: number = 400, details?: any) {
  return {
    success: false,
    error: message,
    ...(details && { details })
  };
}
