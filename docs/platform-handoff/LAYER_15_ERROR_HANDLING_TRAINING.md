# Layer #15: Error Handling - Training Evidence

**Training Status:** Evidence Collected from Production Codebase  
**Evidence Date:** October 10, 2025  
**Framework:** ESA Life CEO 61x21  

---

## Pattern 1: Error Boundaries (React Frontend)

### 1.1 ProfileErrorBoundary - Advanced Error Boundary with Recovery
**Location:** `client/src/components/profile/ProfileErrorBoundary.tsx`

**Key Features:**
- Retry mechanism with attempt limit (max 3 retries)
- User-friendly error UI with recovery options
- Error tracking integration (Plausible analytics)
- Development mode error details
- Multiple recovery paths: Retry, Reload, Go Home

**Implementation Pattern:**
```typescript
class ProfileErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Profile Error Boundary caught:', error, errorInfo);
    
    // Send to error tracking service
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Error', {
        props: {
          component: 'Profile',
          error: error.message,
          stack: errorInfo.componentStack || 'unknown'
        }
      });
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    if (retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });
    }
  };
}
```

**UI Recovery Options:**
- ✅ Retry button with attempt counter
- ✅ Reload page button
- ✅ Navigate to home link
- ✅ User-friendly error messaging
- ✅ Development error details (collapsible)

---

### 1.2 Generic ErrorBoundary Component
**Location:** `client/src/components/ErrorBoundary.tsx`

**Key Features:**
- Reusable error boundary for any component
- Higher-order component (HOC) wrapper available
- Customizable fallback UI
- Simple reset mechanism

**Implementation Pattern:**
```typescript
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI />;
    }
    return this.props.children;
  }
}

// HOC wrapper for easy component wrapping
export function withErrorBoundary<T>(Component: React.ComponentType<T>) {
  return (props: T) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
}
```

---

### 1.3 Lazy Loading Error Boundary
**Location:** `client/src/utils/lazyComponents.tsx`

**Key Features:**
- Handles errors during lazy component loading
- Integrated with React.Suspense
- Custom loading fallback
- Automatic retry mechanism

**Usage Pattern:**
```typescript
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  // Catches errors during lazy loading
}

export function lazyWithRetry<T>(importFunc: () => Promise<{ default: T }>) {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <LazyErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );
}
```

---

### 1.4 Sentry Error Boundary Integration
**Location:** `client/src/lib/sentry-config.ts`, `client/src/lib/sentry.ts`

**Key Features:**
- Production error tracking with Sentry
- Custom fallback components
- Automatic error reporting
- Context-aware error capture

**Implementation:**
```typescript
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Usage with custom fallback
<SentryErrorBoundary 
  fallback={CustomErrorFallback}
  showDialog={true}
>
  <App />
</SentryErrorBoundary>
```

---

## Pattern 2: Try-Catch Patterns (Server-Side)

### 2.1 API Route Error Handling
**Location:** `server/routes/agentRoutes.ts`, `server/routes/gamificationRoutes.ts`, `server/routes/friendsRoutes.ts`

**Standard Pattern:**
```typescript
router.get('/endpoint', async (req, res) => {
  try {
    // Business logic
    const data = await performOperation();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Operation failed:', error);
    res.status(500).json({ 
      error: 'Failed to perform operation',
      message: error.message 
    });
  }
});
```

**Error Response Pattern:**
```typescript
// 400 - Bad Request (validation errors)
return res.status(400).json({ error: 'Invalid parameters' });

// 404 - Not Found
return res.status(404).json({ error: 'Resource not found' });

// 500 - Internal Server Error
res.status(500).json({ error: 'Internal server error' });
```

### 2.2 Nested Try-Catch with Fallbacks
**Location:** `server/services/translationService.ts`

**Pattern:**
```typescript
async translateText(text: string, targetLanguage: string) {
  try {
    // Primary operation
    const translation = await openai.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error(`Translation error for ${targetLanguage}:`, error);
    return text; // Fallback to original text
  }
}
```

### 2.3 Error Handling with Type Guards
**Location:** `server/services/pageAuditOrchestrator.ts`

**Pattern:**
```typescript
try {
  // Operation
} catch (error) {
  findings.push({
    severity: 'critical',
    category: 'Audit Error',
    message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    recommendation: 'Check file path and permissions'
  });
}
```

---

## Pattern 3: Error Middleware (Express)

### 3.1 Admin Authentication Error Handler
**Location:** `server/middleware/adminAuth.ts`

**Pattern:**
```typescript
export const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    // Authentication logic
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};
```

### 3.2 Tenant Middleware Error Handling
**Location:** `server/middleware/tenantMiddleware.ts`

**Pattern:**
```typescript
export async function setUserContext(req: any, res: any, next: any) {
  try {
    // Tenant resolution logic
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
```

### 3.3 Process-Level Error Handlers
**Location:** `server/index-novite.ts`

**Pattern:**
```typescript
// Uncaught Exception Handler
process.on('uncaughtException', (error) => {
  logger.fatal({ error, stack: error.stack }, 'Uncaught Exception');
});

// HTTP Server Error Handler
httpServer.on('error', (error) => {
  console.error('❌ HTTP Server error:', error);
  logger.fatal('HTTP Server error:', error);
  throw error;
});
```

---

## Pattern 4: Retry Logic & Circuit Breakers

### 4.1 Exponential Backoff Retry
**Location:** `client/src/utils/retryLogic.ts`

**Implementation:**
```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryOn = (error) => {
      // Retry on network errors or 5xx server errors
      if (!error.response) return true;
      const status = error.response?.status || error.status;
      return status >= 500 && status < 600;
    },
    onRetry = (error, attempt) => {
      console.warn(`Retry attempt ${attempt}:`, error.message);
    }
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryOn(error)) {
        throw error;
      }

      onRetry(error, attempt + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}
```

**Features:**
- ✅ Exponential backoff with configurable multiplier
- ✅ Max delay cap to prevent excessive waits
- ✅ Customizable retry conditions
- ✅ Retry callbacks for logging/monitoring
- ✅ Automatic retry on network errors and 5xx responses

---

### 4.2 Circuit Breaker Pattern
**Location:** `client/src/utils/retryLogic.ts`

**Implementation:**
```typescript
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000,
    private readonly halfOpenRetries = 2
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        this.failures = this.threshold - this.halfOpenRetries;
      } else {
        throw new Error('Circuit breaker is open - service temporarily unavailable');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
}
```

**States:**
- **Closed:** Normal operation, requests pass through
- **Open:** Service unavailable, fail fast
- **Half-Open:** Testing if service recovered

---

### 4.3 Timeout with Fallback
**Location:** `client/src/utils/retryLogic.ts`

**Implementation:**
```typescript
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  fallback?: T
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), 
      timeoutMs
    );
  });

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } catch (error: any) {
    if (error.message.includes('timed out') && fallback !== undefined) {
      console.warn('Operation timed out, using fallback value');
      return fallback;
    }
    throw error;
  }
}
```

**Usage in Production:**
```typescript
// Profile page data fetching with retry + timeout
const response = await withRetry(
  () => withTimeout(
    () => fetch(`/api/user/stats`, { credentials: 'include' }),
    5000  // 5 second timeout
  )
);
```

---

### 4.4 Debounced Retry for User Actions
**Location:** `client/src/utils/retryLogic.ts`

**Implementation:**
```typescript
export function createDebouncedRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay = 300
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let activePromise: Promise<any> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          activePromise = fn(...args);
          const result = await activePromise;
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          activePromise = null;
        }
      }, delay);
    });
  }) as T;
}
```

---

## Pattern 5: Validation Errors (Zod)

### 5.1 Safe Parse Pattern
**Location:** Throughout codebase (server routes)

**Pattern:**
```typescript
import { z } from 'zod';

// Schema definition
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

// Safe parsing with error handling
const result = userSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({
    error: 'Validation failed',
    details: result.error.errors
  });
}

const validData = result.data;
```

### 5.2 Parse with Try-Catch
**Location:** Various service files

**Pattern:**
```typescript
try {
  const validatedData = schema.parse(inputData);
  // Use validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      issues: error.issues
    });
  }
  throw error;
}
```

### 5.3 JSON Parse Error Handling
**Location:** `client/src/utils/profileCache.ts`, `client/src/utils/fileUploadManager.ts`

**Pattern:**
```typescript
try {
  const item = JSON.parse(itemStr);
  // Use parsed data
} catch (error) {
  console.error('JSON parse error:', error);
  // Return default or handle gracefully
  return null;
}
```

---

## Pattern 6: Error Logging & Monitoring

### 6.1 Console Error Logging
**Location:** Throughout codebase

**Standard Pattern:**
```typescript
catch (error) {
  console.error('Operation failed:', error);
  // Additional handling
}
```

**Enhanced Pattern with Context:**
```typescript
catch (error) {
  console.error('❌ WebSocket initialization failed:', error);
  console.error('Context:', {
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
}
```

---

### 6.2 Sentry Integration
**Location:** `client/src/lib/sentry-config.ts`

**Initialization:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});
```

**Error Capture:**
```typescript
try {
  await criticalOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'ProfilePage',
      operation: 'dataFetch'
    },
    extra: {
      userId: user.id,
      timestamp: Date.now()
    }
  });
  throw error;
}
```

**Transaction Monitoring:**
```typescript
const transaction = Sentry.startTransaction({
  name: 'profile.load',
  op: 'navigation'
});

try {
  const result = await operation();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  Sentry.captureException(error);
  throw error;
} finally {
  transaction.finish();
}
```

---

### 6.3 Custom Error Tracking
**Location:** `client/src/components/profile/ProfileErrorBoundary.tsx`

**Pattern:**
```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Analytics tracking
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('Error', {
      props: {
        component: 'Profile',
        error: error.message,
        stack: errorInfo.componentStack || 'unknown'
      }
    });
  }
}
```

---

### 6.4 OpenReplay Error Integration
**Location:** `client/src/lib/openreplay-enhanced.ts`

**Pattern:**
```typescript
private setupErrorBoundary() {
  if (!this.enabled) return;
  
  // Global error handler integration
  window.addEventListener('error', (event) => {
    this.tracker?.handleError(event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    this.tracker?.handleError(event.reason);
  });
}
```

---

## Pattern 7: Server-Side Retry Logic

### 7.1 Onboarding Retry Service
**Location:** `server/utils/onboardingRetry.ts`

**Implementation:**
```typescript
class OnboardingRetryService {
  async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: RetryOptions
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    
    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === opts.maxRetries) {
          throw error;
        }
        
        opts.onRetry(attempt, error);
        await new Promise(resolve => 
          setTimeout(resolve, opts.delayMs * attempt)
        );
      }
    }
  }
}
```

---

## Key Learnings for Layer #15 Agent

### 1. Frontend Error Handling
- **Always use ErrorBoundary** for React components
- **Provide retry mechanisms** for user recovery
- **Show user-friendly messages** in production
- **Log detailed errors** in development only
- **Integrate with monitoring** (Sentry, Plausible, OpenReplay)

### 2. Backend Error Handling
- **Wrap all async operations** in try-catch
- **Use appropriate HTTP status codes** (400, 404, 500)
- **Return structured error objects** with error field
- **Log errors with context** (user, timestamp, operation)
- **Fail gracefully** with fallback values

### 3. Retry Strategies
- **Exponential backoff** for API retries
- **Circuit breaker** to prevent cascade failures
- **Timeout protection** with fallback values
- **Debouncing** for user-triggered actions

### 4. Validation Errors
- **Use safeParse()** for Zod validation
- **Return 400 status** for validation failures
- **Include error details** in response
- **Handle JSON parse errors** gracefully

### 5. Logging & Monitoring
- **Console.error** for development debugging
- **Sentry** for production error tracking
- **Analytics events** for error patterns
- **Transaction monitoring** for performance

---

## Training Complete

This evidence provides comprehensive patterns for implementing robust error handling across the ESA Life CEO platform. The Layer #15 agent can now apply these patterns to ensure reliable, user-friendly error management.

**Next Steps:**
- Create methodology documentation
- Build automated error detection system
- Implement proactive error prevention
- Establish error recovery workflows
