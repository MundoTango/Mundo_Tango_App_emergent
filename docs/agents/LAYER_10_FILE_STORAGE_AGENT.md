# Layer 10: File Storage Agent
**Division:** Foundation Layer | **Category:** Storage Infrastructure  
**Complexity:** Medium | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** File Upload & Storage Management  
**Responsibility:** Handle file uploads, store media files, serve static assets

**Key Files:** `server/middleware/upload.ts`, Cloudinary integration (planned)

## Core Patterns

### File Upload Middleware (Multer)
```typescript
import multer from 'multer';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
});
```

### Upload Endpoint
```typescript
app.post('/api/upload/image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json(apiError('No file uploaded', 400));
  }

  res.json(apiSuccess({
    data: {
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
    },
  }));
});
```

## Migration to Cloudinary
See `docs/MT_CLOUDINARY_MEDIA_GUIDE.md` for production storage patterns

**Related:** Layer 01 (Database), Cloudinary Integration
