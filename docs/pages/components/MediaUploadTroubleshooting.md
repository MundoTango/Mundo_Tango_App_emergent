# Media Upload & Post Integration - Troubleshooting Guide

## Quick Reference

### Common Issues & Solutions

#### 1. Uploads Hang at 25% Progress ❌

**Symptoms:**
- Upload progress bar stops at ~25%
- Console shows `worker.js` 404 error
- File processing appears to freeze

**Cause:** `browser-image-compression` with `useWebWorker: true` tries to load worker.js that Vite cannot find.

**Solution:**
```typescript
// mediaCompression.ts & advancedMediaProcessor.ts
const options = {
  useWebWorker: false,  // ✅ Disable for Vite compatibility
  // ... other options
};
```

---

#### 2. Posts Created Without Media ❌

**Symptoms:**
- Upload completes successfully
- Preview thumbnails display correctly
- Post created with text only (no media)
- No error messages shown

**Cause:** PostCreator's custom `onSubmit` handler doesn't include `internalMediaUrls`.

**Solution:**
```typescript
// PostCreator.tsx - Type definition
onSubmit?: (data: {
  media: File[];
  internalMediaUrls?: string[];  // ✅ Add this
  // ...
}) => void;

// PostCreator.tsx - Include in submission
onSubmit({
  media: mediaFiles,
  internalMediaUrls,  // ✅ Include uploaded URLs
  // ...
});
```

---

#### 3. Failed Uploads Show Success Message ❌

**Symptoms:**
- Server returns error (4xx/5xx)
- Success toast displayed
- Modal closes
- Post not actually created

**Cause:** Fetch handler doesn't check `res.ok` before parsing JSON.

**Solution:**
```typescript
fetch('/api/posts/direct', { /* ... */ })
  .then(async res => {
    if (!res.ok) {  // ✅ Check response status
      const errorText = await res.text();
      throw new Error(`Failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  })
  .catch(err => {
    // ✅ Show error toast
    toast({ 
      title: "Failed to create post",
      description: err.message,
      variant: "destructive"
    });
  });
```

---

#### 4. Uploaded Media Not Persisting ❌

**Symptoms:**
- Media appears in preview
- Post submission succeeds
- Media missing from feed

**Cause:** State not reset properly or backend not saving `mediaEmbeds`.

**Solution:**
```typescript
// 1. Reset state after submission
setInternalMediaUrls([]);  // ✅ Clear uploaded URLs

// 2. Backend saves to mediaEmbeds
const postData = {
  content,
  mediaEmbeds: mediaUrls,  // ✅ Save as JSONB array
  // ...
};

// 3. Storage query includes mediaEmbeds
const posts = await db
  .select({
    mediaEmbeds: posts.mediaEmbeds,  // ✅ Include in query
    // ...
  })
  .from(posts);
```

---

#### 5. Video Thumbnails Not Generating ❌

**Symptoms:**
- Video uploads successfully
- Thumbnail shows placeholder image
- No extraction errors in console

**Cause:** Video metadata not loaded or canvas errors.

**Solution:**
```typescript
// videoThumbnail.ts - Add timeout protection
export async function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve('/placeholder-video.png');  // ✅ Fallback
    }, 5000);  // 5-second timeout
    
    video.onloadeddata = () => {
      clearTimeout(timeout);
      video.currentTime = 0.1;
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      resolve('/placeholder-video.png');  // ✅ Graceful fallback
    };
    
    video.src = URL.createObjectURL(file);
  });
}
```

---

## Integration Checklist

### Frontend (PostCreator)
- [ ] `internalMediaUrls` state defined
- [ ] Upload complete handler updates state
- [ ] `internalMediaUrls` included in onSubmit data
- [ ] State reset after successful submission
- [ ] TypeScript types include `internalMediaUrls`

### Frontend (ESAMemoryFeed)
- [ ] Routes to `/api/posts/direct` for uploaded media
- [ ] Checks `res.ok` before parsing JSON
- [ ] Shows error toast on failure
- [ ] Keeps modal open on error
- [ ] Invalidates cache only on success

### Backend (/api/posts/direct)
- [ ] Accepts `mediaUrls` in request body
- [ ] Saves to `mediaEmbeds` field (JSONB)
- [ ] Returns proper error responses
- [ ] Validates media URLs

### Storage Layer
- [ ] Queries include `mediaEmbeds` field
- [ ] Handles JSONB array properly
- [ ] Returns media in response

### Display Layer
- [ ] Renders `mediaEmbeds` array
- [ ] Detects video vs image by extension
- [ ] Shows proper media player/viewer

---

## Testing Commands

### Manual Testing
```bash
# 1. Start the application
npm run dev

# 2. Navigate to Memories feed
# 3. Click "Upload Media Files" button
# 4. Select video/image
# 5. Wait for upload completion (check progress bar)
# 6. Verify thumbnail appears in preview
# 7. Add text content
# 8. Click "Post" button
# 9. Verify post appears with media in feed
```

### Check Console Logs
```javascript
// Look for these success indicators:
✅ "📦 [Media Processor] Initialized"
✅ "🏠 [ESAMemoryFeed] Internal media URLs: 1"
✅ "✅ Post created successfully via /api/posts/direct"

// Watch for these errors:
❌ "worker.js 404" → Disable useWebWorker
❌ "Failed to create post" → Check error handling
❌ "mediaEmbeds is null" → Check storage query
```

### Database Verification
```sql
-- Check if media is saved
SELECT id, content, "mediaEmbeds" 
FROM posts 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Should show mediaEmbeds as JSONB array:
-- ["uploads/file1.mp4", "uploads/file2.jpg"]
```

---

## Architecture Flow

```
┌─────────────────────────────────────────────────┐
│                 USER ACTIONS                     │
└────────────────┬────────────────────────────────┘
                 │
                 ├─> 1. SELECT MEDIA FILES
                 │   └─> InternalUploader component
                 │
                 ├─> 2. UPLOAD & COMPRESS
                 │   ├─> Client-side compression (no Web Workers)
                 │   ├─> XHR upload with progress
                 │   └─> Server saves to /uploads
                 │
                 ├─> 3. PREVIEW & EDIT
                 │   ├─> Thumbnails generated
                 │   ├─> URLs added to internalMediaUrls state
                 │   └─> User adds content/text
                 │
                 ├─> 4. SUBMIT POST
                 │   ├─> onSubmit includes internalMediaUrls
                 │   ├─> Routes to /api/posts/direct
                 │   └─> Check res.ok for errors
                 │
                 ├─> 5. BACKEND PROCESSING
                 │   ├─> Validate request
                 │   ├─> Save to mediaEmbeds (JSONB)
                 │   └─> Return success/error
                 │
                 └─> 6. DISPLAY IN FEED
                     ├─> Query includes mediaEmbeds
                     ├─> Detect media type (video/image)
                     └─> Render with proper player/viewer
```

---

## Files to Check

### Upload System
- `client/src/components/upload/InternalUploader.tsx`
- `client/src/utils/mediaCompression.ts`
- `client/src/utils/advancedMediaProcessor.ts`
- `client/src/utils/videoThumbnail.ts`

### Integration
- `client/src/components/universal/PostCreator.tsx`
- `client/src/pages/ESAMemoryFeed.tsx`

### Backend
- `server/routes/postsRoutes.ts` (`/api/posts/direct` endpoint)
- `server/routes/upload.ts`
- `server/storage.ts` (mediaEmbeds queries)

### Display
- `client/src/components/feed/EnhancedPostItem.tsx`
- `client/src/components/feed/UnifiedPostFeed.tsx`

---

## Quick Fixes

### Reset Upload State
```typescript
// If uploads are stuck, reset state
setInternalMediaUrls([]);
setMediaFiles([]);
setMediaPreviews([]);
setIsUploading(false);
setUploadProgress(0);
```

### Debug Upload Flow
```typescript
// Add console logs to trace flow
console.log('1. Upload started:', files);
console.log('2. Compression complete:', compressedSize);
console.log('3. Upload progress:', percentage);
console.log('4. Upload complete:', urls);
console.log('5. Submit data:', { internalMediaUrls });
console.log('6. Backend response:', result);
```

### Clear Browser Cache
```bash
# If seeing stale data
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or: Application tab → Clear storage → Clear site data
```

---

## Support

For additional help:
- Check `docs/pages/esa-layers/layer-12-file-upload-media.md` for complete architecture
- Review `docs/pages/testing/MediaUploadTest.md` for test cases
- See `replit.md` "Recent Changes" section for latest updates

**Last Updated:** September 30, 2025  
**Status:** ✅ Production Ready
