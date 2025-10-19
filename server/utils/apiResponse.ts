import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function success<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  };
  return res.status(statusCode).json(response);
}

export function error(res: Response, message: string, statusCode: number = 500, error?: any) {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error && { error: error.toString() })
  };
  return res.status(statusCode).json(response);
}
