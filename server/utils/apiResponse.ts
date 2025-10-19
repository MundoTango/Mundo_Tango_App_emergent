import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): Response<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
}

export function sendValidationError(
  res: Response,
  errors: Record<string, string[]>,
  message: string = 'Validation failed'
): Response<ApiResponse> {
  return sendError(res, message, 400, errors);
}

export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): Response<ApiResponse> {
  return sendError(res, message, 404);
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): Response<ApiResponse> {
  return sendError(res, message, 401);
}

export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): Response<ApiResponse> {
  return sendError(res, message, 403);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response<ApiResponse<T[]>> {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    ...(message && { message }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return res.status(200).json(response);
}
