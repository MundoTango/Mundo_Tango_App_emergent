export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function success<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

export function error(message: string, errorDetails?: any): ApiResponse {
  return {
    success: false,
    message,
    ...(errorDetails && { error: errorDetails.toString() })
  };
}
