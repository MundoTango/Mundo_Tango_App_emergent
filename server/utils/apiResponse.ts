/**
 * Mundo Tango ESA LIFE CEO - Standardized API Response Utilities
 * Phase 11: Created for consistent API responses across all routes
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Success response helper
 */
export function success<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Success response with pagination
 */
export function successWithPagination<T>(
  data: T,
  page: number,
  pageSize: number,
  totalCount: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    }
  };
}

/**
 * Error response helper
 */
export function error(message: string, statusCode?: number): ApiResponse {
  return {
    success: false,
    error: message
  };
}

/**
 * Parse pagination parameters from query string
 */
export function parsePagination(query: any): {
  page: number;
  pageSize: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 20));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}
