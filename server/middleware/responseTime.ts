import { Request, Response, NextFunction } from 'express';

export function responseTimeMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
}

export default responseTimeMiddleware;
