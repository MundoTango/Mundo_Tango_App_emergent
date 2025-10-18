/**
 * Mundo Tango ESA LIFE CEO - Request Validation Middleware
 * Phase 11 Task 5.1: Zod-based request validation factory
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from './errorHandler';

/**
 * Create a validation middleware for request body
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Extract user-friendly error messages
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError('Validation failed', errors);
      }

      // Attach validated data to request (optional, for type safety)
      (req as any).validatedData = result.data;

      next();
    } catch (error) {
      next(error); // Pass to global error handler
    }
  };
};

/**
 * Validate request query parameters
 * @param schema - Zod schema for query validation
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError('Invalid query parameters', errors);
      }

      (req as any).validatedQuery = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate request params (URL parameters)
 * @param schema - Zod schema for params validation
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError('Invalid URL parameters', errors);
      }

      (req as any).validatedParams = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas for reuse
export const commonSchemas = {
  // ID parameter validation
  id: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  }),

  // Pagination validation
  pagination: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    pageSize: z.string().optional().transform(val => Math.min(100, parseInt(val || '20'))),
  }),

  // Date range validation
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  // Search validation
  search: z.object({
    q: z.string().min(1).max(200),
    limit: z.string().optional().transform(val => Math.min(50, parseInt(val || '10'))),
  }),
};
