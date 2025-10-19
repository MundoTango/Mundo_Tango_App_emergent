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
