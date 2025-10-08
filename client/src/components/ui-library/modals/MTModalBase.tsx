// MT Ocean Modal Base Component
// ESA LIFE CEO 61x21 - Core Modal Foundation

import React, { useEffect, useRef, ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'glass' | 'solid' | 'ocean' | 'teal';
  position?: 'center' | 'top' | 'bottom';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
  animationType?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  zIndex?: number;
  preventScroll?: boolean;
  maxHeight?: string;
  customStyles?: CSSProperties;
  'data-testid'?: string;
}

const MTModalBase: React.FC<MTModalBaseProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  variant = 'glass',
  position = 'center',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  overlayClassName,
  contentClassName,
  animationType = 'scale',
  zIndex = 50,
  preventScroll = true,
  maxHeight = '90vh',
  customStyles,
  'data-testid': testId = 'modal-base'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscape);
      
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }

      // Focus trap
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (preventScroll) {
        document.body.style.overflow = '';
      }
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose, closeOnEscape, preventScroll]);

  if (!isOpen) return null;

  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] mx-4'
  };

  const positions = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16'
  };

  const variants = {
    glass: {
      className: cn(
        'bg-white/90 dark:bg-gray-900/90',
        'backdrop-blur-2xl backdrop-saturate-150',
        'border border-white/30 dark:border-white/10',
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]'
      ),
      style: applyGlassmorphism()
    },
    solid: {
      className: cn(
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-800',
        'shadow-2xl'
      ),
      style: {}
    },
    ocean: {
      className: cn(
        'bg-gradient-to-br from-teal-50/95 via-white/95 to-blue-50/95',
        'dark:from-teal-950/95 dark:via-gray-900/95 dark:to-blue-950/95',
        'backdrop-blur-2xl backdrop-saturate-150',
        'border border-teal-200/30 dark:border-teal-700/30',
        'shadow-[0_20px_60px_-15px_rgba(94,234,212,0.5)]'
      ),
      style: {
        ...applyGlassmorphism(),
        background: `linear-gradient(135deg, 
          rgba(94, 234, 212, 0.05) 0%, 
          rgba(255, 255, 255, 0.95) 50%, 
          rgba(21, 94, 117, 0.05) 100%)`
      }
    },
    teal: {
      className: cn(
        'bg-gradient-to-br from-teal-300/20 to-blue-900/20',
        'backdrop-blur-2xl backdrop-saturate-200',
        'border border-teal-400/40 dark:border-teal-600/40',
        'shadow-[0_20px_60px_-15px_rgba(94,234,212,0.7)]'
      ),
      style: {
        ...applyGlassmorphism(),
        boxShadow: '0 20px 60px -15px rgba(94, 234, 212, 0.7), inset 0 0 20px rgba(94, 234, 212, 0.1)'
      }
    }
  };

  const animations = {
    fade: 'animate-fadeIn',
    slide: 'animate-slideInUp',
    scale: 'animate-scaleIn',
    slideUp: 'animate-slideUp',
    slideDown: 'animate-slideDown'
  };

  const currentVariant = variants[variant];

  return (
    <div 
      className="fixed inset-0 flex overflow-auto"
      style={{ zIndex }}
      data-testid={testId}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-to-br from-black/60 via-black/50 to-blue-900/30',
          'backdrop-blur-sm animate-fadeIn',
          overlayClassName
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        data-testid={`${testId}-overlay`}
      / role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeOnOverlayClick ? onClose : undefined(e); } }}>

      {/* Container */}
      <div className={cn('relative w-full flex', positions[position])}>
        {/* Modal Content */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={cn(
            'relative w-full',
            sizes[size],
            currentVariant.className,
            'rounded-2xl',
            'transform transition-all duration-300',
            animations[animationType],
            contentClassName
          )}
          style={{
            ...currentVariant.style,
            maxHeight,
            ...customStyles
          }}
          data-testid={`${testId}-content`}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4 z-10',
                'p-2 rounded-full',
                'bg-white/20 hover:bg-white/30 dark:bg-gray-800/20 dark:hover:bg-gray-800/30',
                'backdrop-blur-md',
                'border border-white/20 dark:border-white/10',
                'transition-all duration-200',
                'hover:scale-110',
                'group'
              )}
              aria-label="Close modal"
              data-testid={`${testId}-close`}
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
            </button>
          )}

          {/* Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MTModalBase;