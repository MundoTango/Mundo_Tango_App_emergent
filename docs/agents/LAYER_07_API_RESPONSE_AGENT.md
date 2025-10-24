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
