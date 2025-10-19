/**
 * Mundo Tango - API Response Utilities
 * 
 * Provides standardized response formats for API endpoints,
 * ensuring consistent structure across all API responses.
 */

import { Response } from 'express';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a success response object (without sending)
 * 
 * @param data - The data to include in the response
 * @param message - Optional success message
 * @returns ApiResponse object
 */
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

/**
 * Send a success response
 * 
 * @param res - Express response object
 * @param data - The data to include in the response
 * @param message - Optional success message
 * @returns Express response
 */
export function successResponse<T>(res: Response, data: T, message?: string) {
  return res.json(success(data, message));
}

/**
 * Create an error response object (without sending)
 * 
 * @param errorMsg - The error type/category
 * @param message - Optional detailed error message
 * @returns ApiResponse object
 */
export function error(errorMsg: string, message?: string): ApiResponse {
  const response: ApiResponse = {
    success: false,
    error: errorMsg,
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Send an error response with status code
 * 
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param errorMsg - The error type/category
 * @param message - Optional detailed error message
 * @returns Express response
 */
export function errorResponse(
  res: Response, 
  statusCode: number, 
  errorMsg: string, 
  message?: string
) {
  return res.status(statusCode).json(error(errorMsg, message));
}

/**
 * Send a 404 Not Found response
 * 
 * @param res - Express response object
 * @param resource - The type of resource that wasn't found
 * @returns Express response
 */
export function notFoundResponse(res: Response, resource: string = 'Resource') {
  return errorResponse(res, 404, 'Not Found', `${resource} not found`);
}

/**
 * Send a 401 Unauthorized response
 * 
 * @param res - Express response object
 * @param message - Optional custom message
 * @returns Express response
 */
export function unauthorizedResponse(res: Response, message: string = 'Unauthorized') {
  return errorResponse(res, 401, 'Unauthorized', message);
}

/**
 * Send a 403 Forbidden response
 * 
 * @param res - Express response object
 * @param message - Optional custom message
 * @returns Express response
 */
export function forbiddenResponse(res: Response, message: string = 'Forbidden') {
  return errorResponse(res, 403, 'Forbidden', message);
}

/**
 * Send a 400 Bad Request / Validation Error response
 * 
 * @param res - Express response object
 * @param message - Optional custom validation message
 * @returns Express response
 */
export function validationErrorResponse(res: Response, message: string = 'Validation failed') {
  return errorResponse(res, 400, 'Validation Error', message);
}
