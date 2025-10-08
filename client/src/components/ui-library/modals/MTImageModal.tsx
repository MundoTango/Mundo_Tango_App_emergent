// MT Ocean Image Modal Component  
// ESA LIFE CEO 61x21 - Lightbox for Images & Galleries

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Share2,
  Maximize2,
  Grid3X3
} from 'lucide-react';
import MTModalBase from './MTModalBase';

export interface MTImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    src: string;
    alt?: string;
    caption?: string;
    thumbnail?: string;
  }> | string;
  currentIndex?: number;
  showThumbnails?: boolean;
  showCaption?: boolean;
  showControls?: boolean;
  enableZoom?: boolean;
  enableRotation?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  onShare?: (image: string) => void;
  onDownload?: (image: string) => void;
  'data-testid'?: string;
}

const MTImageModal: React.FC<MTImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex = 0,
  showThumbnails = true,
  showCaption = true,
  showControls = true,
  enableZoom = true,
  enableRotation = true,
  enableDownload = true,
  enableShare = false,
  onShare,
  onDownload,
  'data-testid': testId = 'image-modal'
}) => {
  const imageArray = Array.isArray(images) 
    ? images 
    : [{ src: images, alt: 'Image' }];
  
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showThumbnailGrid, setShowThumbnailGrid] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    // Reset zoom and rotation when changing images
    setZoom(1);
    setRotation(0);
    setImageLoading(true);
  }, [activeIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case '+':
      case '=':
        if (enableZoom) handleZoomIn();
        break;
      case '-':
      case '_':
        if (enableZoom) handleZoomOut();
        break;
      case 'r':
      case 'R':
        if (enableRotation) handleRotate();
        break;
    }
  }, [isOpen, activeIndex, imageArray.length, enableZoom, enableRotation]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handlePrevious = () => {
    setActiveIndex((prev) => 
      prev === 0 ? imageArray.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => 
      prev === imageArray.length - 1 ? 0 : prev + 1
    );
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const currentImage = imageArray[activeIndex];
    if (onDownload) {
      onDownload(currentImage.src);
    } else {
      // Default download implementation
      const link = document.createElement('a');
      link.href = currentImage.src;
      link.download = currentImage.alt || `image-${activeIndex}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    const currentImage = imageArray[activeIndex];
    if (onShare) {
      onShare(currentImage.src);
    }
  };

  const currentImage = imageArray[activeIndex];

  return (
    <MTModalBase
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      variant="glass"
      showCloseButton={false}
      contentClassName="bg-black/95"
      overlayClassName="bg-black/80"
      data-testid={testId}
    >
      <div className="relative w-full h-screen flex flex-col">
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              {imageArray.length > 1 && (
                <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                  {activeIndex + 1} / {imageArray.length}
                </span>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {showControls && (
                <>
                  {enableZoom && (
                    <>
                      <button
                        onClick={handleZoomOut}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                        aria-label="Zoom out"
                        data-testid={`${testId}-zoom-out`}
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm min-w-[60px] text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                        aria-label="Zoom in"
                        data-testid={`${testId}-zoom-in`}
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {enableRotation && (
                    <button
                      onClick={handleRotate}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                      aria-label="Rotate"
                      data-testid={`${testId}-rotate`}
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  )}

                  {showThumbnails && imageArray.length > 1 && (
                    <button
                      onClick={() => setShowThumbnailGrid(!showThumbnailGrid)} aria-label="Button"
                      className={cn(
                        "p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors",
                        showThumbnailGrid && "bg-[var(--color-primary-hover)]/50"
                      )}
                      aria-label="Toggle thumbnails"
                      data-testid={`${testId}-thumbnails`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                  )}

                  {enableShare && (
                    <button
                      onClick={handleShare}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                      aria-label="Share"
                      data-testid={`${testId}-share`}
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  )}

                  {enableDownload && (
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                      aria-label="Download"
                      data-testid={`${testId}-download`}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}

              <button
                onClick={onClose}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-600/50 transition-colors ml-2"
                aria-label="Close"
                data-testid={`${testId}-close`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Image Container */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Navigation Arrows */}
          {imageArray.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all hover:scale-110 z-10"
                aria-label="Previous image"
                data-testid={`${testId}-previous`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all hover:scale-110 z-10"
                aria-label="Next image"
                data-testid={`${testId}-next`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div 
            className="relative transition-all duration-300"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={currentImage.src}
              alt={currentImage.alt || `Image ${activeIndex + 1}`}
              className={cn(
                "max-w-[90vw] max-h-[80vh] object-contain",
                "transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setImageLoading(false)}
              draggable={false}
            />
          </div>
        </div>

        {/* Caption */}
        {showCaption && currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-center max-w-3xl mx-auto">
              {currentImage.caption}
            </p>
          </div>
        )}

        {/* Thumbnail Grid Overlay */}
        {showThumbnailGrid && imageArray.length > 1 && (
          <div className="absolute inset-0 bg-black/95 z-30 overflow-y-auto p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imageArray.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    setShowThumbnailGrid(false);}} aria-label="Button"
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg",
                    "border-2 transition-all hover:scale-105",
                    index === activeIndex 
                      ? "border-teal-400 shadow-lg shadow-teal-400/50" 
                      : "border-transparent hover:border-gray-600"
                  )}
                >
                  <img
                    src={img.thumbnail || img.src}
                    alt={img.alt || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === activeIndex && (
                    <div className="absolute inset-0 bg-teal-400/20" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </MTModalBase>
  );
};

export default MTImageModal;