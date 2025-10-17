/**
 * Responsive Image Component with WebP/AVIF support
 * Implements modern image format fallbacks with lazy loading
 * Based on web.dev best practices
 */

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export const ResponsiveImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  priority = false,
}: ResponsiveImageProps) => {
  // Generate different format URLs (assuming CDN or image service)
  const baseUrl = src.replace(/\.(jpg|jpeg|png)$/i, '');
  const extension = src.match(/\.(jpg|jpeg|png)$/i)?.[0] || '.jpg';
  
  // Generate srcset for different resolutions
  const generateSrcSet = (format: string) => {
    const widths = [400, 800, 1200, 1600];
    return widths
      .map(w => `${baseUrl}-${w}w.${format} ${w}w`)
      .join(', ');
  };

  return (
    <picture>
      {/* AVIF format (best compression) */}
      <source
        type="image/avif"
        srcSet={generateSrcSet('avif')}
        sizes={sizes}
      />
      
      {/* WebP format (good compression) */}
      <source
        type="image/webp"
        srcSet={generateSrcSet('webp')}
        sizes={sizes}
      />
      
      {/* JPEG fallback */}
      <img
        src={src}
        srcSet={generateSrcSet(extension.slice(1))}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    </picture>
  );
};
