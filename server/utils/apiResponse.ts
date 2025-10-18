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
    timestamp: string;
    details?: any;
  };
}

/**
 * Send a successful response
 * @param data - Response data
 * @param message - Optional success message
 */
export function success<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Send a successful response with pagination metadata
 * @param data - Array of items
 * @param page - Current page number
 * @param pageSize - Number of items per page
 * @param total - Total number of items
 */
export function successWithPagination<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): SuccessResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total,
    },
  };
}

/**
 * Send a created response (201)
 * @param data - Created resource
 * @param message - Optional message (defaults to "Resource created successfully")
 */
export function created<T>(data: T, message: string = 'Resource created successfully'): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Send a no content response (204)
 * Use this for successful deletes or updates with no response body
 */
export function noContent(): { success: true } {
  return { success: true };
}

/**
 * Helper to parse pagination query parameters
 */
export function parsePagination(query: any): { page: number; pageSize: number; offset: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * Helper to parse sort query parameter
 * @param query - Express query object
 * @param allowedFields - Array of allowed sort fields
 * @param defaultField - Default field to sort by
 * @returns Sort field and direction
 */
export function parseSort(
  query: any,
  allowedFields: string[],
  defaultField: string = 'createdAt'
): { field: string; direction: 'asc' | 'desc' } {
  const sortParam = query.sort as string || defaultField;
  const direction: 'asc' | 'desc' = sortParam.startsWith('-') ? 'desc' : 'asc';
  const field = sortParam.replace(/^-/, '');

  // Validate field is allowed
  if (!allowedFields.includes(field)) {
    return { field: defaultField, direction: 'desc' };
  }

  return { field, direction };
}
