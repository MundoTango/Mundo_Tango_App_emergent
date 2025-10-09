/**
 * [A2A] Agent #13 (Media) → Sharp Image Optimization
 * Generates WebP/AVIF variants coordinating with Agent #1's ResponsiveImage component
 */

import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';

// Responsive sizes to generate
const RESPONSIVE_SIZES = [400, 800, 1200];

// Image formats to generate
const OUTPUT_FORMATS = ['webp', 'avif'] as const;

interface OptimizationResult {
  originalUrl: string;
  optimizedUrls: {
    webp: string[];
    avif: string[];
  };
  sizes: number[];
}

/**
 * [A2A] Agent #13: Generate responsive image variants
 * Coordinates with Agent #1's ResponsiveImage component which expects:
 * - image-400w.webp, image-800w.webp, image-1200w.webp
 * - image-400w.avif, image-800w.avif, image-1200w.avif
 */
export async function generateResponsiveVariants(
  inputPath: string,
  outputDir: string
): Promise<OptimizationResult> {
  const basename = path.basename(inputPath, path.extname(inputPath));
  const result: OptimizationResult = {
    originalUrl: inputPath,
    optimizedUrls: {
      webp: [],
      avif: []
    },
    sizes: RESPONSIVE_SIZES
  };

  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate variants for each size and format
    for (const width of RESPONSIVE_SIZES) {
      for (const format of OUTPUT_FORMATS) {
        const filename = `${basename}-${width}w.${format}`;
        const outputPath = path.join(outputDir, filename);

        // [A2A] Agent #13: WebP quality 80, AVIF quality 65 (expert-recommended)
        if (format === 'webp') {
          await sharp(inputPath)
            .resize(width, null, { withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toFile(outputPath);
          
          result.optimizedUrls.webp.push(`/optimized/${filename}`);
          console.log(`[A2A] Agent #13: Generated WebP ${width}w ✓`);
        } else {
          await sharp(inputPath)
            .resize(width, null, { withoutEnlargement: true })
            .avif({ quality: 65, effort: 4 })
            .toFile(outputPath);
          
          result.optimizedUrls.avif.push(`/optimized/${filename}`);
          console.log(`[A2A] Agent #13: Generated AVIF ${width}w ✓`);
        }
      }
    }

    console.log(`[A2A] Agent #13 → Agent #1: Responsive variants ready for ${basename}`);
    return result;
  } catch (error) {
    console.error('[A2A] Agent #13: Image optimization failed:', error);
    throw error;
  }
}

/**
 * [A2A] Agent #13: Optimize single image without responsive variants
 * For thumbnails and avatars where responsive sizes aren't needed
 */
export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: { format: 'webp' | 'avif'; quality?: number } = { format: 'webp', quality: 80 }
): Promise<string> {
  try {
    const quality = options.format === 'webp' 
      ? options.quality || 80 
      : options.quality || 65;

    await sharp(inputPath)
      .toFormat(options.format, { quality, effort: 4 })
      .toFile(outputPath);

    console.log(`[A2A] Agent #13: Optimized to ${options.format.toUpperCase()} @ quality ${quality} ✓`);
    return outputPath;
  } catch (error) {
    console.error('[A2A] Agent #13: Image optimization failed:', error);
    throw error;
  }
}

/**
 * [A2A] Agent #13: Express middleware for automatic image optimization
 * Intercepts uploaded images and generates optimized variants
 */
export const imageOptimizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if files were uploaded
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.file ? [req.file] : (req.files as Express.Multer.File[]) || [];
    const optimizedResults: OptimizationResult[] = [];

    for (const file of files) {
      // Only optimize image files
      if (!file.mimetype.startsWith('image/')) {
        continue;
      }

      const outputDir = path.join(process.cwd(), 'public', 'optimized');
      const result = await generateResponsiveVariants(file.path, outputDir);
      optimizedResults.push(result);
    }

    // Attach optimization results to request for route handler
    (req as any).optimizedImages = optimizedResults;
    console.log(`[A2A] Agent #13: Optimized ${optimizedResults.length} image(s) ✓`);
    
    next();
  } catch (error) {
    console.error('[A2A] Agent #13: Middleware optimization error:', error);
    next(error);
  }
};

/**
 * Get optimized image URLs for frontend
 */
export function getOptimizedUrls(basename: string): OptimizationResult {
  return {
    originalUrl: `/uploads/${basename}`,
    optimizedUrls: {
      webp: RESPONSIVE_SIZES.map(w => `/optimized/${basename}-${w}w.webp`),
      avif: RESPONSIVE_SIZES.map(w => `/optimized/${basename}-${w}w.avif`)
    },
    sizes: RESPONSIVE_SIZES
  };
}
