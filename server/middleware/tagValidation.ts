/**
 * [A2A] Agent #5 (Business Logic) → Tag Whitelist Validation
 * Coordinates with Agent #2 (Frontend) Zod validation for secure tag handling
 */

import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Allowed tags whitelist (expandable)
const ALLOWED_TAGS = [
  'travel',
  'food',
  'culture',
  'adventure',
  'nightlife',
  'nature',
  'art',
  'music',
  'sports',
  'photography',
  'family',
  'friends',
  'work',
  'milestone',
  'celebration'
];

/**
 * Validate and sanitize tags array
 */
export const validateTags = [
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .isString()
    .trim()
    .toLowerCase()
    .isIn(ALLOWED_TAGS)
    .withMessage(`Tag must be one of: ${ALLOWED_TAGS.join(', ')}`),
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('[A2A] Agent #5: Tag validation failed -', errors.array()[0].msg);
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  
  console.log('[A2A] Agent #5: Tag validation passed ✓');
  next();
};

/**
 * Get allowed tags (for frontend reference)
 */
export const getAllowedTags = () => ALLOWED_TAGS;
