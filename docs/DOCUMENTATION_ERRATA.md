# Documentation Errata & Implementation Notes
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Purpose:** Critical corrections and clarifications for agent documentation

## Overview

This document addresses issues identified during architect review of tasks #3-4 documentation, plus provides implementation guidance for pseudo-code patterns referenced in guides.

---

## CRITICAL FIXES APPLIED

### **1. SQL Injection Vulnerability (SECURITY) - FIXED ✅**

**Location:** `docs/MT_API_CONVENTIONS.md` lines 66-104

**Issue:** Dynamic field sorting using `posts[sort]` bracket notation created SQL injection vulnerability and TypeScript error.

**Fix Applied:**
- Added whitel list of sortable fields
- Validated sort parameter before use
- Returned 400 error for invalid sort fields

**Pattern to use:**
```typescript
// Whitelist allowed sort fields
const sortableFields = {
  'createdAt': table.createdAt,
  '-createdAt': table.createdAt,
  'title': table.title,
  '-title': table.title,
} as const;

// Validate
const sortField = sortableFields[sortParam as keyof typeof sortableFields];
if (!sortField) {
  return res.status(400).json(apiError('Invalid sort field', 400));
}
```

---

## REACT QUERY CONFIGURATION CLARIFICATIONS

### **Actual Configuration (client/src/lib/queryClient.ts)**

The queryClient **DOES** have a default queryFn configured (line 144):

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // ← Default exists
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: false,
    },
  },
});
```

### **Common Pitfall: Queries Not Using Default**

**Browser Console Errors:**
```
No queryFn was passed as an option, and no default queryFn was found
```

**Root Causes:**
1. **Using different QueryClient instance** (not importing from `@lib/queryClient`)
2. **Explicitly passing `queryFn: undefined`** (overrides default)
3. **Using queryClient.setDefaultOptions later** (can override earlier config)

**Correct Pattern:**
```typescript
// ✅ CORRECT: Uses default queryFn from queryClient
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['/api/posts'], // queryFn auto-provided
});

// ❌ WRONG: Overrides default with undefined
const { data } = useQuery({
  queryKey: ['/api/posts'],
  queryFn: undefined, // ← Breaks default!
});

// ❌ WRONG: Using different client
import { QueryClient } from '@tanstack/react-query';
const localClient = new QueryClient(); // ← No default queryFn!

const { data } = useQuery({
  queryKey: ['/api/posts'],
}, localClient);
```

**Investigation Needed:**
- Search for `/api/mrblue/conversations` query usage (errors in browser console)
- Verify all useQuery calls import from correct queryClient
- Check for explicit `queryFn: undefined` overrides

---

## HELPER FUNCTION IMPLEMENTATIONS

Several guides reference utility functions that need implementation. Here's the status:

### **1. Monitoring Helpers (REPLIT_PERFORMANCE_MONITORING.md)**

**Referenced Functions:**
- `logMetric(name, value, tags)`
- `logWarning(event, context)`
- `logAlert(alert)`
- `getCPUUsage()`
- `getRequestCount()`
- `logToSentry(error)`

**Implementation Status:** ⚠️ **NOT IMPLEMENTED - Placeholder Code**

**To Implement:**
```typescript
// server/monitoring/metrics.ts
export function logMetric(name: string, value: number, tags?: Record<string, any>) {
  // Implementation options:
  // 1. Log to console (development)
  console.log(`[METRIC] ${name}:`, value, tags);
  
  // 2. Send to PostHog (when implemented)
  // posthog.capture('metric', { name, value, ...tags });
  
  // 3. Send to custom metrics endpoint
  // await fetch('/api/metrics/log', { method: 'POST', body: JSON.stringify({ name, value, tags }) });
}

export function logWarning(event: string, context?: Record<string, any>) {
  console.warn(`[WARNING] ${event}:`, context);
  // TODO: Send to logging service
}

export function logAlert(alert: Alert) {
  console.error(`[ALERT] ${alert.severity}: ${alert.message}`, alert.metrics);
  // TODO: Send to PagerDuty/Slack
}
```

**Until Implemented:** Documentation examples show ideal patterns, but agents must implement or use console.log placeholders.

---

### **2. Theme Utilities (MT_COMPONENT_LIBRARY_GUIDE.md)**

**Referenced Utilities:**
- Theme context provider
- `useTheme()` hook
- Dark mode toggle

**Implementation Status:** ✅ **DOCUMENTED WITH FULL IMPLEMENTATION**

The guide provides complete implementation code (lines 90-125) including:
- ThemeProvider component
- useTheme hook
- localStorage persistence
- Document class toggling

**No action needed** - implementation is included in documentation.

---

### **3. API Response Helpers (MT_API_CONVENTIONS.md)**

**Referenced Functions:**
- `apiSuccess(data, meta?)`
- `apiError(message, statusCode, details?)`

**Implementation Status:** ⚠️ **REFERENCED BUT NOT SHOWN**

**To Implement:**
```typescript
// server/utils/apiResponse.ts (may already exist)
export function apiSuccess<T>(data: T, meta?: Record<string, any>) {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function apiError(message: string, statusCode: number, details?: any) {
  return {
    success: false,
    error: {
      message,
      statusCode,
      ...(details && { details }),
    },
  };
}
```

**Action Required:** Verify if `server/utils/apiResponse.ts` exists. If not, create it with above implementation.

---

## NEXT STEPS FOR AGENTS

### **Before Using Documentation:**

1. **Verify React Query Setup:**
   - Confirm all queries import from `@lib/queryClient`
   - Search codebase for `queryFn: undefined` (anti-pattern)
   - Fix Mr Blue conversation queries causing browser errors

2. **Implement Missing Helpers:**
   - Create `server/monitoring/metrics.ts` with logging functions
   - Verify `server/utils/apiResponse.ts` exists
   - Update imports in example code to use actual implementations

3. **Test Security Patterns:**
   - Verify all dynamic sorting uses whitelist pattern
   - Check for other potential SQL injection vectors
   - Run security audit (ESA_CHECK_BEFORE_BUILD.md)

### **When Following Guides:**

**If you see placeholder code:**
- ✅ Understand the pattern/principle being taught
- ✅ Implement the actual helper function
- ❌ Don't copy-paste expecting it to work

**If example doesn't compile:**
- ✅ Check this errata document for known issues
- ✅ Verify imports and dependencies
- ✅ Adapt example to actual codebase structure

---

## DOCUMENTATION QUALITY ASSURANCE

### **Validation Checklist for Future Docs:**

- [ ] All code examples compile with actual project dependencies
- [ ] Helper functions either exist or are clearly marked as "TO IMPLEMENT"
- [ ] Security patterns follow whitelist/validation approach
- [ ] React Query examples use actual queryClient configuration
- [ ] Database examples use Drizzle type-safe patterns (no bracket notation)
- [ ] API examples validate all user input (Zod schemas)

---

## ARCHITECT FEEDBACK SUMMARY

**Tasks #3-4 Review (October 19, 2025):**

**Findings:**
1. ❌ React Query guidance assumes default queryFn works everywhere (browser errors show it doesn't)
2. ❌ SQL injection vulnerability in dynamic sorting example
3. ❌ Missing helper function implementations (logMetric, etc.)

**Actions Taken:**
1. ✅ Fixed SQL injection with whitelist pattern
2. ✅ Added this errata document clarifying React Query actual behavior
3. ✅ Documented which helpers need implementation

**Status:** Awaiting re-review after corrections applied.

---

**Document Owner:** Documentation Quality Team  
**Review Cycle:** After each architect feedback  
**Last Updated:** October 19, 2025
