import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  formats?: ('webp' | 'jpeg' | 'png' | 'avif')[];
}

export class ImageOptimizer {
  private uploadDir: string;

  constructor(uploadDir: string = './uploads') {
    this.uploadDir = uploadDir;
  }

  async optimizeImage(
    inputPath: string,
    outputDir: string,
    options: ImageOptimizationOptions = {}
  ): Promise<{ original: string; optimized: string[]; sizes: number[] }> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 80,
      formats = ['webp', 'jpeg']
    } = options;

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Calculate dimensions maintaining aspect ratio
    let width = metadata.width || maxWidth;
    let height = metadata.height || maxHeight;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const optimized: string[] = [];
    const sizes: number[] = [];
    const baseName = path.basename(inputPath, path.extname(inputPath));

    // Generate optimized versions
    for (const format of formats) {
      const outputPath = path.join(outputDir, `${baseName}.${format}`);
      
      let pipeline = image.clone().resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });

      if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      } else if (format === 'png') {
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
      } else if (format === 'avif') {
        pipeline = pipeline.avif({ quality });
      }

      await pipeline.toFile(outputPath);
      
      const stats = await fs.stat(outputPath);
      optimized.push(outputPath);
      sizes.push(stats.size);
    }

    return {
      original: inputPath,
      optimized,
      sizes
    };
  }

  async generateResponsiveImages(
    inputPath: string,
    outputDir: string,
    widths: number[] = [320, 640, 1024, 1920]
  ): Promise<{ [key: number]: string }> {
    const image = sharp(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const responsive: { [key: number]: string } = {};

    for (const width of widths) {
      const outputPath = path.join(outputDir, `${baseName}-${width}w.webp`);
      
      await image
        .clone()
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      responsive[width] = outputPath;
    }

    return responsive;
  }

  async compressImage(inputPath: string, quality: number = 80): Promise<Buffer> {
    return sharp(inputPath)
      .webp({ quality })
      .toBuffer();
  }

  async getThumbnail(
    inputPath: string,
    size: number = 200
  ): Promise<Buffer> {
    return sharp(inputPath)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();
  }
}

export const imageOptimizer = new ImageOptimizer();
