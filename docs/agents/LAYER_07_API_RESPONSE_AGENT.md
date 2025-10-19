# Layer 07: API Response Agent
**Division:** Foundation Layer | **Category:** API Infrastructure  
**Complexity:** Low | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Consistent API Response Formatting  
**Responsibility:** Ensure all API responses follow uniform structure for success/error cases

**Key Files:** `server/utils/apiResponse.ts` (132 lines)

## Core Patterns

### Success Response
```typescript
export function apiSuccess<T>(payload: {
  data?: T;
  message?: string;
  meta?: { page?: number; total?: number; };
}) {
  return {
    success: true,
    ...payload,
    timestamp: new Date().toISOString(),
  };
}

// Usage
res.json(apiSuccess({ data: posts, meta: { page: 1, total: 100 } }));
```

### Error Response
```typescript
export function apiError(
  message: string,
  statusCode: number,
  details?: any
) {
  return {
    success: false,
    error: {
      message,
      statusCode,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

// Usage
res.status(404).json(apiError('Post not found', 404));
```

## Response Structure
```typescript
// Success
{ success: true, data: {...}, meta: {...}, timestamp: "..." }

// Error
{ success: false, error: { message: "...", statusCode: 404 }, timestamp: "..." }
```

**Related:** Layer 06 (Error Handling), All API route handlers
