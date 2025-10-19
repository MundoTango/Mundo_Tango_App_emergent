/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

// Alias for backward compatibility
export const success = successResponse;

export function errorResponse(error: string, errors?: any[]): ApiResponse {
  return {
    success: false,
    error,
    ...(errors && { errors })
  };
}

// Alias for backward compatibility  
export const error = errorResponse;

export function validationErrorResponse(errors: any[]): ApiResponse {
  return {
    success: false,
    error: 'Validation failed',
    errors
  };
}
