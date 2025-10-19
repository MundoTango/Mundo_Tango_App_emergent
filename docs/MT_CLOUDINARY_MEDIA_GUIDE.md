# Mundo Tango Cloudinary Media Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Platform:** Cloudinary (Image & Video CDN)  
**References:** 14 codebase instances (integration planned)

## Overview

Mundo Tango will use **Cloudinary** for media storage, optimization, and delivery. This guide covers upload, transformation, and CDN integration patterns for production deployment.

**Status:** ⚠️ Planned for production (file-based storage currently used)

---

## Configuration

### **Environment Variables**

```bash
# .env
CLOUDINARY_CLOUD_NAME=mundo-tango
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=mundotango
CLOUDINARY_ENABLE=true
```

---

## Installation

```bash
npm install cloudinary multer
```

---

## Backend Integration

### **Pattern 1: Upload Middleware**

```typescript
// server/middleware/upload.ts
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || 'mundotango',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'],
    transformation: [
      { width: 2000, height: 2000, crop: 'limit' }, // Max dimensions
      { quality: 'auto' }, // Auto quality
      { fetch_format: 'auto' }, // Auto format (WebP for supported browsers)
    ],
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
```

---

### **Pattern 2: Image Upload Endpoint**

```typescript
// POST /api/upload/image
app.post(
  '/api/upload/image',
  authMiddleware,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json(apiError('No file uploaded', 400));
      }

      const imageUrl = req.file.path; // Cloudinary URL
      const publicId = req.file.filename; // Cloudinary public ID

      res.json(apiSuccess({
        data: {
          url: imageUrl,
          publicId,
          format: req.file.mimetype,
          size: req.file.size,
        },
      }));
    } catch (error) {
      next(error);
    }
  }
);
```

---

### **Pattern 3: Multiple File Upload**

```typescript
// POST /api/upload/images (up to 5 images)
app.post(
  '/api/upload/images',
  authMiddleware,
  upload.array('images', 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(apiError('No files uploaded', 400));
      }

      const uploadedFiles = (req.files as Express.Multer.File[]).map(file => ({
        url: file.path,
        publicId: file.filename,
        size: file.size,
      }));

      res.json(apiSuccess({ data: uploadedFiles }));
    } catch (error) {
      next(error);
    }
  }
);
```

---

### **Pattern 4: Delete Image**

```typescript
import { v2 as cloudinary } from 'cloudinary';

async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// DELETE /api/images/:publicId
app.delete('/api/images/:publicId', authMiddleware, async (req, res, next) => {
  try {
    const { publicId } = req.params;

    // Verify ownership
    const image = await db.query.images.findFirst({
      where: eq(images.publicId, publicId),
    });

    if (!image) {
      return res.status(404).json(apiError('Image not found', 404));
    }

    if (image.userId !== req.user.id) {
      return res.status(403).json(apiError('Access denied', 403));
    }

    // Delete from Cloudinary
    await deleteImage(publicId);

    // Delete from database
    await db.delete(images).where(eq(images.publicId, publicId));

    res.json(apiSuccess({ message: 'Image deleted' }));
  } catch (error) {
    next(error);
  }
});
```

---

## Frontend Integration

### **Pattern 1: File Upload Component**

```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ImageUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiRequest('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      return await res.json();
    },
    onSuccess: (data) => {
      onUploadComplete(data.data.url);
      toast.success('Image uploaded!');
    },
    onError: () => {
      toast.error('Upload failed');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        data-testid="input-image-upload"
      />

      {preview && (
        <img src={preview} alt="Preview" className="mt-4 w-full max-w-sm rounded" />
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || uploadMutation.isPending}
        data-testid="button-upload-image"
      >
        {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
}
```

---

## Image Transformations

### **Pattern: On-the-Fly Transformations**

```typescript
// Cloudinary URL transformations (client-side)
function transformImage(publicId: string, options: any): string {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  const transformations = [];

  if (options.width) {
    transformations.push(`w_${options.width}`);
  }

  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  if (options.crop) {
    transformations.push(`c_${options.crop}`); // fill, crop, scale, fit
  }

  if (options.quality) {
    transformations.push(`q_${options.quality}`); // auto, 100, 80, etc.
  }

  const transformStr = transformations.join(',');

  return `${baseUrl}/${transformStr}/${publicId}`;
}

// Usage
function PostCard({ post }: { post: Post }) {
  const thumbnailUrl = transformImage(post.imagePublicId, {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
  });

  const fullSizeUrl = transformImage(post.imagePublicId, {
    quality: 'auto',
  });

  return (
    <div>
      <img src={thumbnailUrl} alt={post.title} />
      <a href={fullSizeUrl} target="_blank">View full size</a>
    </div>
  );
}
```

---

## Common Transformation Patterns

### **1. Thumbnails**

```typescript
// Square thumbnail (300x300)
const thumbnail = transformImage(publicId, {
  width: 300,
  height: 300,
  crop: 'fill',
  gravity: 'face', // Focus on faces
});
```

### **2. Responsive Images**

```typescript
// Multiple sizes for responsive design
const sizes = {
  small: transformImage(publicId, { width: 400 }),
  medium: transformImage(publicId, { width: 800 }),
  large: transformImage(publicId, { width: 1200 }),
};

<picture>
  <source srcSet={sizes.large} media="(min-width: 1024px)" />
  <source srcSet={sizes.medium} media="(min-width: 768px)" />
  <img src={sizes.small} alt="Responsive image" />
</picture>
```

### **3. Image Optimization**

```typescript
// Auto-optimize
const optimized = transformImage(publicId, {
  quality: 'auto',
  fetch_format: 'auto', // WebP for supported browsers
});
```

---

## Video Upload

```typescript
// server/middleware/upload.ts
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mundotango/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi'],
  },
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// POST /api/upload/video
app.post('/api/upload/video', authMiddleware, uploadVideo.single('video'), async (req, res) => {
  const videoUrl = req.file!.path;
  res.json(apiSuccess({ data: { url: videoUrl } }));
});
```

---

## Cost Optimization

### **1. Lazy Transformations**

```typescript
// Only transform on-demand (Cloudinary caches result)
// First request: Generates and caches
// Subsequent requests: Served from cache
```

### **2. Compression**

```typescript
const compressed = transformImage(publicId, {
  quality: 80, // Good balance of quality/size
  fetch_format: 'auto', // WebP where supported
});
```

### **3. Storage Limits**

```bash
# Monitor Cloudinary usage
# Free tier: 25GB storage, 25GB bandwidth/month
# Upgrade as needed
```

---

## Next Steps

1. Create Cloudinary account: https://cloudinary.com
2. Get API credentials
3. Implement upload endpoints
4. Migrate existing file-based storage to Cloudinary
5. Configure CDN for global delivery

**Related Files:**
- `server/middleware/upload.ts` - Upload configuration (to be created)
- `server/routes/upload.ts` - Upload endpoints (to be created)
- `client/src/components/ImageUploader.tsx` - Upload UI (to be created)
