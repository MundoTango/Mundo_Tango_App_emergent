import { Request, Response, NextFunction } from 'express';

/**
 * MB.MD Phase 5: Production Request Logging Middleware
 * Comprehensive request logging with performance metrics and PII protection
 */

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  ip: string;
  userAgent: string;
  userId?: number;
  error?: string;
}

// PII-safe logging - never log sensitive query params or body fields
const SENSITIVE_PARAMS = ['password', 'token', 'apiKey', 'secret', 'csrf', 'credit_card', 'ssn'];

const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (SENSITIVE_PARAMS.some(param => key.toLowerCase().includes(param))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Skip logging for health checks and static assets
  if (req.path === '/api/health' || req.path.startsWith('/assets/')) {
    return next();
  }
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override res.end to log response
  res.end = function(chunk?: any, encoding?: any, cb?: any): any {
    const duration = Date.now() - startTime;
    
    const logEntry: RequestLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      userId: (req as any).user?.id
    };
    
    // Log based on status code
    if (res.statusCode >= 500) {
      console.error('🔴 [REQUEST ERROR]', logEntry);
    } else if (res.statusCode >= 400) {
      console.warn('🟡 [REQUEST WARN]', logEntry);
    } else if (duration > 1000) {
      console.warn('⚠️  [SLOW REQUEST]', logEntry);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('🟢 [REQUEST]', {
        method: logEntry.method,
        path: logEntry.path,
        status: logEntry.statusCode,
        duration: `${duration}ms`
      });
    }
    
    // Call original end
    return originalEnd.call(res, chunk, encoding, cb);
  };
  
  next();
};

// Production-grade request logging with metrics aggregation
export class RequestMetrics {
  private static metrics = new Map<string, { count: number; totalDuration: number; errors: number }>();
  
  static record(path: string, duration: number, isError: boolean) {
    const existing = this.metrics.get(path) || { count: 0, totalDuration: 0, errors: 0 };
    
    this.metrics.set(path, {
      count: existing.count + 1,
      totalDuration: existing.totalDuration + duration,
      errors: existing.errors + (isError ? 1 : 0)
    });
  }
  
  static getSummary() {
    const summary: any[] = [];
    
    this.metrics.forEach((value, key) => {
      summary.push({
        path: key,
        count: value.count,
        avgDuration: Math.round(value.totalDuration / value.count),
        errorRate: ((value.errors / value.count) * 100).toFixed(2) + '%'
      });
    });
    
    return summary.sort((a, b) => b.count - a.count);
  }
  
  static reset() {
    this.metrics.clear();
  }
}
