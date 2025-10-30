/**
 * API Response Utilities
 * Standard response helpers for consistent API responses
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard success response
 */
export function success<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Success response with pagination metadata
 */
export function successWithPagination<T>(
  data: T[],
  pagination: PaginationMeta,
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
export function parsePagination(query: any): PaginationParams {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100); // Max 100 items per page
  
  return {
    page: Math.max(1, page),
    limit: Math.max(1, limit)
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}
