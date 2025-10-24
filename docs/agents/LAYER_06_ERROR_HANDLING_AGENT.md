# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Layer 06: Error Handling Agent
**Division:** Foundation Layer  
**Category:** Reliability Infrastructure  
**Complexity:** High  
**Dependencies:** Express Error Middleware, Custom Error Classes  
**Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity

**Role:** Centralized Error Handling & Recovery  
**Responsibility:** Catch and process all errors, provide user-friendly error messages, log errors for debugging, ensure graceful failure

**Key Files:**
- `server/middleware/errorHandler.ts` - Global error handler (125 lines)
- `server/utils/errors.ts` - Custom error classes
- `docs/PREVENTION_GUIDE.md` - Error prevention patterns

---

## Architecture

### **Error Middleware**

```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { apiError } from '../utils/apiResponse';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // 1. Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json(apiError('Validation failed', 400, {
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }));
  }

  // 2. Database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json(apiError('Resource already exists', 409));
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json(apiError('Invalid reference', 400));
  }

  // 3. Authentication errors
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(apiError('Token expired', 401));
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(apiError('Invalid token', 401));
  }

  // 4. Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(apiError(err.message, err.statusCode));
  }

  // 5. Unknown errors
  const isDev = process.env.NODE_ENV === 'development';
  const message = isDev ? err.message : 'Internal server error';
  const stack = isDev ? err.stack : undefined;

  res.status(500).json(apiError(message, 500, { stack }));
}

// Register as last middleware
app.use(errorHandler);
```

---

## Custom Error Classes

### **Pattern 1: Application Errors**

```typescript
// server/utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public metadata?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: any) {
    super(message, 400, { errors });
    this.name = 'ValidationError';
  }
}
```

---

### **Pattern 2: Using Custom Errors**

```typescript
// Throw custom errors in route handlers
app.get('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.privacy === 'private' && post.userId !== req.user.id) {
      throw new ForbiddenError('Cannot view private post');
    }

    res.json(apiSuccess({ data: post }));
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

---

## Async Error Handling

### **Pattern 1: Async Wrapper**

```typescript
// Utility to catch async errors automatically
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage: No need for try/catch
app.get('/api/posts', asyncHandler(async (req, res) => {
  const posts = await db.query.posts.findMany();
  
  if (posts.length === 0) {
    throw new NotFoundError('Posts');
  }
  
  res.json(apiSuccess({ data: posts }));
}));
```

---

### **Pattern 2: Express 5+ Native Async Support**

```typescript
// Express 5 automatically catches async errors
app.get('/api/posts', async (req, res) => {
  const posts = await db.query.posts.findMany();
  
  if (!posts) {
    throw new NotFoundError('Posts'); // Automatically caught
  }
  
  res.json(apiSuccess({ data: posts }));
});
```

---

## Client-Side Error Handling

### **Pattern 1: API Request Error Handler**

```typescript
// client/src/lib/queryClient.ts
export async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Request failed');
  }

  return response;
}

// Usage with React Query
const createPostMutation = useMutation({
  mutationFn: (data) => apiRequest('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  onError: (error) => {
    toast.error(error.message); // Show user-friendly error
  },
});
```

---

### **Pattern 2: Error Boundary**

```typescript
// client/src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to monitoring service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Logging & Monitoring

### **Pattern: Structured Error Logging**

```typescript
interface ErrorLog {
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  statusCode?: number;
  userId?: number;
  path?: string;
  stack?: string;
  metadata?: any;
}

export function logError(err: Error, req?: Request) {
  const log: ErrorLog = {
    timestamp: new Date(),
    level: 'error',
    message: err.message,
    statusCode: (err as AppError).statusCode || 500,
    userId: (req as any)?.user?.id,
    path: req?.path,
    stack: err.stack,
    metadata: (err as AppError).metadata,
  };

  console.error(JSON.stringify(log));

  // Send to monitoring service (PostHog, Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    // posthog.capture('server_error', log);
  }
}

// Use in error handler
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logError(err, req);
  
  // ... rest of error handling
}
```

---

## Recovery Strategies

### **1. Retry Logic**

```typescript
async function retryOperation<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }

  throw lastError!;
}

// Usage: Retry database connection
const user = await retryOperation(
  () => db.query.users.findFirst({ where: eq(users.id, userId) }),
  3
);
```

---

### **2. Circuit Breaker**

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const breaker = new CircuitBreaker();

app.get('/api/external-data', async (req, res, next) => {
  try {
    const data = await breaker.execute(() =>
      fetch('https://external-api.com/data').then(r => r.json())
    );
    res.json(apiSuccess({ data }));
  } catch (error) {
    next(error);
  }
});
```

---

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('Error Handling Agent', () => {
  it('handles 404 errors', async () => {
    const res = await request(app).get('/api/posts/999999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('not found');
  });

  it('handles validation errors', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: '' }); // Invalid data

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

---

## Best Practices

### **✅ DO:**
- Use custom error classes for different error types
- Log all errors with context (user, path, timestamp)
- Return user-friendly error messages
- Hide sensitive information in production
- Implement retry logic for transient failures

### **❌ DON'T:**
- Expose stack traces in production
- Return database error messages directly
- Swallow errors silently
- Use generic error messages for all cases
- Forget to call `next(error)` in async handlers

---

## Related Agents

- **Layer 07: API Response** - Consistent response format
- **Layer 08: Logging** - Error logging patterns
- **Layer 14: Rate Limiting** - Prevent abuse errors

**Next:** Read `docs/PREVENTION_GUIDE.md` for error prevention patterns
