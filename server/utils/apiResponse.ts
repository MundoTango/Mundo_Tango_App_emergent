/**
 * Mundo Tango - API Response Utilities
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function success<T>(data: T, message?: string): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

export function successResponse<T>(res: Response, data: T, message?: string) {
  return res.json(success(data, message));
}

export function error(error: string, message?: string): ApiResponse {
  const response: ApiResponse = {
    success: false,
    error,
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

export function errorResponse(res: Response, statusCode: number, errorMsg: string, message?: string) {
  return res.status(statusCode).json(error(errorMsg, message));
}

export function notFoundResponse(res: Response, resource: string = 'Resource') {
  return errorResponse(res, 404, 'Not Found', `${resource} not found`);
}

export function unauthorizedResponse(res: Response, message: string = 'Unauthorized') {
  return errorResponse(res, 401, 'Unauthorized', message);
}

export function forbiddenResponse(res: Response, message: string = 'Forbidden') {
  return errorResponse(res, 403, 'Forbidden', message);
}

export function validationErrorResponse(res: Response, message: string = 'Validation failed') {
  return errorResponse(res, 400, 'Validation Error', message);
}
