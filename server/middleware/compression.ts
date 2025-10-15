/**
 * Phase 8 - Track D2: Response Compression
 * Reduce API response sizes with gzip compression
 */

import compression from 'compression';
import { Request, Response } from 'express';

// Compression middleware with optimized settings
export const compressionMiddleware = compression({
  // Only compress responses above 1KB
  threshold: 1024,
  
  // Compression level (0-9, higher = more compression but slower)
  level: 6,
  
  // Filter function to determine what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for JSON and text responses
    return compression.filter(req, res);
  }
});

export default compressionMiddleware;
