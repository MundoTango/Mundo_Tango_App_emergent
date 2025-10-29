# Auth Context User ID Mismatch Bug Fix

**Date:** October 5, 2025  
**Status:** ✅ Fixed  
**Severity:** Critical - Caused 401 errors and prevented posts from displaying

## Problem Summary

PostFeed component was showing user ID 1 instead of the authenticated user ID 7, causing authentication errors and preventing the feed from displaying posts. This occurred even though the backend was correctly returning posts for user ID 7.

## Root Cause Analysis

The platform had **TWO different auth implementations** being used by different components:

1. **`client/src/hooks/useAuth.ts`** - Fetches user from `/api/auth/user` endpoint (correct, returns user ID 7)
2. **`client/src/contexts/auth-context.tsx`** - Had hardcoded fallback user with ID 1

### The Issue

**PostFeed.tsx** (line 12) was importing:
```typescript
import { useAuth } from '@/contexts/auth-context';
```

**auth-context.tsx** (lines 34-92) contained a hardcoded user object:
```typescript
const adminUser: any = {
  id: 1,  // ❌ Hardcoded ID 1!
  name: 'Pierre Dubois',
  username: 'pierre_dancer',
  // ... rest of hardcoded data
};
setUser(adminUser);
```

This hardcoded fallback was being used instead of fetching the real authenticated user from the server.

## Solution

### Step 1: Unified Auth Context Import
Changed PostFeed to use the correct auth context:
```typescript
// Before
import { useAuth } from '@/hooks/useAuth';

// After  
import { useAuth } from '@/contexts/auth-context';
```

### Step 2: Removed Hardcoded Fallback
Removed the entire hardcoded user block from `auth-context.tsx` (lines 28-96) and replaced it with a direct server fetch:

```typescript
const checkAuthentication = async () => {
  try {
    // ESA Framework Layer 4: Fetch authenticated user from server
    const authResponse = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    
    if (authResponse.ok) {
      const userData = await authResponse.json();
      if (userData && userData.id) {
        setUser(userData);
        console.log('User authenticated via auth bypass:', userData);
        setIsLoading(false);
        return;
      }
    }
    // ... fallback to token validation
  } catch (error) {
    console.error('Authentication check failed:', error);
    setIsLoading(false);
  }
};
```

## Testing Results

### Before Fix
```
[Framework] User authenticated from context, ID: 1 ❌
Backend: Fetching feed posts for userId: 7
Frontend: No posts displayed due to auth mismatch
```

### After Fix
```
[Framework] User authenticated from context, ID: 7 ✅
Backend: Fetching feed posts for userId: 7
Backend: ✅ Found 20 posts in database
Frontend: Posts fetched successfully
```

## Impact

- **Before:** Users could not see any posts in their feed
- **After:** Posts load correctly for the authenticated user
- **Side Effects:** None - all components now use the same auth context

## Related Files

- `client/src/components/moments/PostFeed.tsx` (line 12)
- `client/src/contexts/auth-context.tsx` (lines 27-43)
- `client/src/hooks/useAuth.ts` (reference implementation)
- `client/src/pages/ESAMemoryFeed.tsx` (uses auth-context correctly)

## Prevention

1. ✅ Use single source of truth for authentication
2. ✅ Always fetch user from server, never use hardcoded fallbacks
3. ✅ Document which auth implementation to use (auth-context.tsx)
4. 🔄 Need to add TypeScript checks to prevent multiple auth imports
5. 🔄 Consider merging useAuth hook and auth-context into single implementation

## Architecture Decision

Going forward, **ALL components must use**:
```typescript
import { useAuth } from '@/contexts/auth-context';
```

The `client/src/hooks/useAuth.ts` file should be deprecated or updated to re-export from auth-context.tsx to prevent future confusion.

## Notes

- Required workflow restart for changes to take effect
- Browser cache may need to be cleared if issues persist
- WebSocket connections will reconnect automatically with correct user ID
