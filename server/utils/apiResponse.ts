/**
 * Mundo Tango ESA LIFE CEO - API Response Utilities
 * Standardized response format for all API endpoints
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

/**
 * Standard success response helper
 */
export function success<T>(data: T, message?: string): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Paginated success response helper
 */
export function successWithPagination<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  message?: string
): ApiPaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  
  const response: ApiPaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages
    }
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Parse pagination parameters from query string
 */
export function parsePagination(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 20));
  const offset = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    offset
  };
}
