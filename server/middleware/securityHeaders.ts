import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.headers['x-request-id'] = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-ID', req.headers['x-request-id']);
  next();
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}
