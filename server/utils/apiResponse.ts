/**
 * Standardized API response utilities
 * Created: Oct 19, 2025
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

export function errorResponse(error: string, errors?: any[]): ApiResponse {
  return {
    success: false,
    error,
    ...(errors && { errors })
  };
}

export function validationErrorResponse(errors: any[]): ApiResponse {
  return {
    success: false,
    error: 'Validation failed',
    errors
  };
}
