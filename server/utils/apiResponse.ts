/**
 * Mundo Tango ESA LIFE CEO - Standardized API Response Utilities
 * Phase 11 Task 5.3: Consistent response format across all endpoints
 */

// Success response format
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Error response format (matches errorHandler.ts)
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

/**
 * Create a standardized success response
 */
export function success<T = any>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Create a standardized success response with pagination
 */
export function successWithPagination<T = any>(
  data: T,
  page: number,
  pageSize: number,
  total: number,
  message?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total
    }
  };
}

/**
 * Parse pagination parameters from query string
 */
export function parsePagination(query: any): { page: number; pageSize: number; offset: number } {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 20));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * Create a standardized error response (use custom Error classes instead when possible)
 */
export function error(message: string, code: string = 'ERROR', statusCode: number = 500): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode
    }
  };
}
