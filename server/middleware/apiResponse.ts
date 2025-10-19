/**
 * API Response Utilities
 * MB.MD Created: October 19, 2025
 */

import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(res: Response, data: T, message?: string) {
  return res.json({
    success: true,
    data,
    message,
  });
}

export function errorResponse(res: Response, error: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error,
  });
}
