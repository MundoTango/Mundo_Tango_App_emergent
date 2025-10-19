/**
 * API Response Utilities
 */

interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

export function success<T = any>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function error(errorMsg: string, message?: string): ErrorResponse {
  return {
    success: false,
    error: errorMsg,
    ...(message && { message }),
  };
}
