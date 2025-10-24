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

# Layer 29: Media Agent
**Division:** Core Layer | **Category:** Media Management  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** Media File Upload & Processing  
**Responsibility:** Handle image/video uploads, storage, optimization, CDN delivery

**Core Operations:**
```typescript
// Upload image (Multer + Cloudinary)
app.post('/api/upload/image', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json(apiError('No file uploaded', 400));
  }

  // Store metadata in database
  const [media] = await db.insert(postMedia).values({
    postId: req.body.postId,
    type: 'image',
    url: req.file.path, // Cloudinary URL
    publicId: req.file.filename,
    size: req.file.size,
  }).returning();

  res.json(apiSuccess({ data: media }));
});

// Delete media
async function deleteMedia(publicId: string) {
  // Delete from Cloudinary
  await cloudinary.uploader.destroy(publicId);

  // Delete from database
  await db.delete(postMedia).where(eq(postMedia.publicId, publicId));
}
```

**Features:** Image/video upload, Cloudinary integration, optimization, transformations, deletion  
**Supported Formats:** JPG, PNG, GIF, WebP (images), MP4, MOV (video)  
**Related:** Layer 10 (File Storage), Layer 17 (Post), Cloudinary Integration
