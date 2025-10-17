/**
 * ESA LIFE CEO 61x21 - Optimized Image Component (Phase 12)
 * High-performance image component with lazy loading, WebP support, and blur placeholders
 */

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

// Generate blur placeholder
function generateBlurPlaceholder(width = 10, height = 10): string {
  return `data:image/svg+xml,%3Csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23e0f2fe' filter='url(%23b)'/%3E%3C/svg%3E`;
}

// Check WebP support
let webpSupported: boolean | null = null;
function checkWebPSupport(): Promise<boolean> {
  if (webpSupported !== null) return Promise.resolve(webpSupported);
  
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      webpSupported = webP.height === 2;
      resolve(webpSupported);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Generate optimized srcset
function generateSrcSet(src: string, sizes: number[] = [320, 640, 960, 1280, 1920]): string {
  // If src is already optimized or from external source, return as is
  if (src.includes('http') || src.includes('data:')) {
    return '';
  }
  
  return sizes
    .map(size => {
      const optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, `-${size}w.$1`);
      return `${optimizedSrc} ${size}w`;
    })
    .join(', ');
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes = '100vw',
  onLoad,
  onError,
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [useWebP, setUseWebP] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check WebP support
  useEffect(() => {
    checkWebPSupport().then(setUseWebP);
  }, []);

  // Setup Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Update image source when in view
  useEffect(() => {
    if (!isInView) return;

    let finalSrc = src;
    
    // Convert to WebP if supported and not already WebP
    if (useWebP && !src.includes('.webp') && !src.includes('http') && !src.includes('data:')) {
      finalSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    // Add quality parameter for CDN services
    if (src.includes('cloudinary.com')) {
      finalSrc = finalSrc.replace('/upload/', `/upload/q_${quality}/`);
    }

    setImageSrc(finalSrc);
  }, [isInView, src, useWebP, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // Fallback to original src if optimized version fails
    if (imageSrc !== src) {
      setImageSrc(src);
    } else {
      onError?.();
    }
  };

  // Generate placeholder
  const placeholderSrc = placeholder === 'blur' 
    ? (blurDataURL || generateBlurPlaceholder(width, height))
    : undefined;

  // Build srcSet
  const srcSet = generateSrcSet(imageSrc);

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        ...style
      }}
    >
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ 
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            objectFit
          }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? imageSrc : placeholderSrc}
        srcSet={isInView && srcSet ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{
          objectFit,
          ...style
        }}
      />

      {/* Loading skeleton */}
      {!isLoaded && placeholder !== 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// ============= Picture Component for Art Direction =============
interface PictureSource {
  media: string;
  srcSet: string;
  type?: string;
}

interface OptimizedPictureProps extends Omit<OptimizedImageProps, 'src'> {
  sources: PictureSource[];
  fallbackSrc: string;
}

export const OptimizedPicture: React.FC<OptimizedPictureProps> = ({
  sources,
  fallbackSrc,
  alt,
  ...props
}) => {
  const [isInView, setIsInView] = useState(props.priority || false);
  const pictureRef = useRef<HTMLPictureElement>(null);

  useEffect(() => {
    if (props.priority || !pictureRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observer.observe(pictureRef.current);

    return () => observer.disconnect();
  }, [props.priority]);

  return (
    <picture ref={pictureRef}>
      {isInView && sources.map((source, index) => (
        <source
          key={index}
          media={source.media}
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      <OptimizedImage
        {...props}
        src={fallbackSrc}
        alt={alt}
      />
    </picture>
  );
};

// ============= Background Image Component =============
interface OptimizedBackgroundProps {
  src: string;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  priority?: boolean;
}

export const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  src,
  className,
  style,
  children,
  overlay = false,
  overlayOpacity = 0.5,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style
      }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;