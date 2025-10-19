# Layer 08: Logging Agent
**Division:** Foundation Layer | **Category:** Observability Infrastructure  
**Complexity:** Medium | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Application Logging & Monitoring  
**Responsibility:** Log important events, errors, and performance metrics for debugging and monitoring

**Key Files:** `server/utils/logger.ts` (to be created), Console logs throughout codebase

## Core Patterns

### Structured Logging
```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  userId?: number;
  path?: string;
  metadata?: any;
}

export function log(level: LogEntry['level'], message: string, metadata?: any) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date(),
    metadata,
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
```

### Request Logging Middleware
```typescript
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    log('info', `${req.method} ${req.path} - ${res.statusCode}`, {
      duration,
      userId: (req as any).user?.id,
    });
  });

  next();
});
```

## Best Practices
✅ Log all errors with stack traces  
✅ Log performance metrics (API response times)  
✅ Log user actions (login, post creation, etc.)  
✅ Use structured logging (JSON format)  
❌ Don't log sensitive data (passwords, tokens)  
❌ Don't over-log in production (performance impact)

**Related:** Layer 06 (Error Handling), PostHog Analytics
