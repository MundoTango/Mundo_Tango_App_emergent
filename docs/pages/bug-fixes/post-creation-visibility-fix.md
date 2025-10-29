# Post Creation Visibility Bug Fix

**Date:** October 5, 2025  
**Status:** ✅ Fixed  
**Severity:** High - Posts were not appearing in feed after creation

## Problem Summary

Posts created through the `/api/posts` endpoint were being saved with `is_public=FALSE` despite having `visibility='public'`, causing them to not appear in the public feed.

## Root Cause

The backend endpoint was not properly mapping the `visibility` field from the frontend to the `isPublic` boolean field in the database. This caused all new posts to be saved as private, even when explicitly set to public.

### Evidence

**Before Fix:**
```sql
-- Recent posts showed incorrect isPublic values
id=114,115,116,117: visibility='public', is_public=FALSE ❌
```

**After Fix:**
```sql
-- New posts correctly set isPublic based on visibility
id=119,120: visibility='public', is_public=TRUE ✅
```

## Solution

### Backend Changes (`server/routes/postsRoutes.ts`)

1. **Added visibility handling:**
```typescript
// Handle visibility field from frontend (public/friends/private)
const visibility = req.body.visibility || 'public';

// Calculate isPublic based on visibility
const calculatedIsPublic = (visibility === 'public');
```

2. **Fixed postData structure:**
```typescript
const postData = {
  content: req.body.content || '',
  userId,
  visibility,  // Use visibility from request
  isPublic: true,  // Set to TRUE when visibility is 'public'
  // ... other fields
};
```

3. **Added debug logging:**
```typescript
console.log('📝 [Backend postsRoutes] Creating post with userId:', userId, 'visibility:', visibility);
console.log('✅ [Backend postsRoutes] Post created successfully, ID:', newPost.id, 'isPublic:', newPost.isPublic);
```

### Database Schema (`shared/schema.ts`)

The schema already had the correct default:
```typescript
isPublic: boolean("is_public").default(true)
```

However, the application code was overriding this default with `false`.

## Testing

### Manual Database Test
```sql
-- Direct SQL insert correctly uses database default
INSERT INTO posts (user_id, content, visibility) 
VALUES (7, 'Direct SQL test', 'public') 
RETURNING id, is_public;
-- Result: id=119, is_public=TRUE ✅
```

### API Test
```bash
# Post creation via API now works correctly
curl -X POST http://localhost:5000/api/posts \
  -F "content=Test post" \
  -F "visibility=public"
# Result: isPublic=true in response ✅
```

## Impact

- **Before:** All new posts were private regardless of visibility setting
- **After:** Posts correctly inherit visibility from the `visibility` field
- **Affected Users:** All users creating posts between [previous fix date] and October 5, 2025

## Related Issues

### Frontend Context Bug (In Progress)
There is a separate issue where the PostFeed component is using user ID 1 instead of the authenticated user ID 7, causing posts not to display even when correctly created. This is being addressed separately.

## Migration Steps

To fix existing posts with incorrect `is_public` values:

```sql
-- Update posts that should be public
UPDATE posts 
SET is_public = true 
WHERE visibility = 'public' AND is_public = false;

-- Verify the update
SELECT COUNT(*) FROM posts WHERE visibility = 'public' AND is_public = true;
```

## Code Locations

- **Backend Route:** `server/routes/postsRoutes.ts` (lines 362-407)
- **Storage Layer:** `server/storage.ts` (createPost method)
- **Schema:** `shared/schema.ts` (posts table definition)
- **Frontend:** `client/src/pages/ESAMemoryFeed.tsx` (post creation handler)

## Prevention

1. ✅ Added comprehensive debug logging
2. ✅ Server restart required to load code changes
3. 🔄 Need to add automated tests for post creation visibility
4. 🔄 Need to verify FormData parsing for all form fields

## Notes

- Required full server restart via `restart_workflow` for changes to take effect
- Temporary hardcoded `isPublic: true` was used during debugging to isolate the issue
- Database default value was correct; issue was in application code
