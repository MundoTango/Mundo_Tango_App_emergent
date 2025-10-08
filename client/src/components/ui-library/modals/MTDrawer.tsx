// MT Ocean Drawer Component
// ESA LIFE CEO 61x21 - Slide-out Drawer

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'glass' | 'solid' | 'ocean';
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showOverlay?: boolean;
  overlayClassName?: string;
  className?: string;
  zIndex?: number;
  'data-testid'?: string;
}

const MTDrawer: React.FC<MTDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  size = 'md',
  variant = 'glass',
  showHeader = true,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showOverlay = true,
  overlayClassName,
  className,
  zIndex = 50,
  'data-testid': testId = 'drawer'
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
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
      document.body.style.overflow = 'hidden';
      
      // Focus drawer
      if (drawerRef.current) {
        drawerRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  const sizes = {
    xs: {
      left: 'w-64',
      right: 'w-64',
      top: 'h-32',
      bottom: 'h-32'
    },
    sm: {
      left: 'w-80',
      right: 'w-80',
      top: 'h-48',
      bottom: 'h-48'
    },
    md: {
      left: 'w-96',
      right: 'w-96',
      top: 'h-64',
      bottom: 'h-64'
    },
    lg: {
      left: 'w-[32rem]',
      right: 'w-[32rem]',
      top: 'h-96',
      bottom: 'h-96'
    },
    xl: {
      left: 'w-[40rem]',
      right: 'w-[40rem]',
      top: 'h-[32rem]',
      bottom: 'h-[32rem]'
    }
  };

  const positions = {
    left: {
      base: 'left-0 top-0 h-full',
      translate: isOpen ? 'translate-x-0' : '-translate-x-full',
      size: sizes[size].left
    },
    right: {
      base: 'right-0 top-0 h-full',
      translate: isOpen ? 'translate-x-0' : 'translate-x-full',
      size: sizes[size].right
    },
    top: {
      base: 'top-0 left-0 w-full',
      translate: isOpen ? 'translate-y-0' : '-translate-y-full',
      size: sizes[size].top
    },
    bottom: {
      base: 'bottom-0 left-0 w-full',
      translate: isOpen ? 'translate-y-0' : 'translate-y-full',
      size: sizes[size].bottom
    }
  };

  const variants = {
    glass: {
      className: cn(
        'bg-[var(--color-surface)]/95 dark:bg-gray-900/95',
        'backdrop-blur-2xl backdrop-saturate-150',
        'border-opacity-30',
        position === 'left' && 'border-r border-[var(--color-border)] dark:border-gray-700',
        position === 'right' && 'border-l border-[var(--color-border)] dark:border-gray-700',
        position === 'top' && 'border-b border-[var(--color-border)] dark:border-gray-700',
        position === 'bottom' && 'border-t border-[var(--color-border)] dark:border-gray-700'
      ),
      style: applyGlassmorphism()
    },
    solid: {
      className: cn(
        'bg-[var(--color-surface)] dark:bg-gray-900',
        'shadow-2xl',
        position === 'left' && 'border-r border-[var(--color-border)] dark:border-gray-800',
        position === 'right' && 'border-l border-[var(--color-border)] dark:border-gray-800',
        position === 'top' && 'border-b border-[var(--color-border)] dark:border-gray-800',
        position === 'bottom' && 'border-t border-[var(--color-border)] dark:border-gray-800'
      ),
      style: {}
    },
    ocean: {
      className: cn(
        'bg-gradient-to-br from-teal-50/95 via-white/95 to-blue-50/95',
        'dark:from-teal-950/95 dark:via-gray-900/95 dark:to-blue-950/95',
        'backdrop-blur-2xl backdrop-saturate-150',
        'shadow-2xl',
        position === 'left' && 'border-r border-teal-200/30 dark:border-teal-700/30',
        position === 'right' && 'border-l border-teal-200/30 dark:border-teal-700/30',
        position === 'top' && 'border-b border-teal-200/30 dark:border-teal-700/30',
        position === 'bottom' && 'border-t border-teal-200/30 dark:border-teal-700/30'
      ),
      style: {
        ...applyGlassmorphism(),
        boxShadow: '0 20px 60px -15px rgba(94, 234, 212, 0.3)'
      }
    }
  };

  const currentPosition = positions[position];
  const currentVariant = variants[variant];

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          className={cn(
            'fixed inset-0',
            'bg-black/50 backdrop-blur-sm',
            'transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
            overlayClassName
          )}
          style={{ zIndex }}
          onClick={closeOnOverlayClick ? onClose : undefined}
          data-testid={`${testId}-overlay`}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={cn(
          'fixed',
          currentPosition.base,
          currentPosition.size,
          currentVariant.className,
          'transform transition-transform duration-300 ease-in-out',
          currentPosition.translate,
          'flex flex-col',
          'focus:outline-none',
          className
        )}
        style={{
          ...currentVariant.style,
          zIndex: zIndex + 1
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Drawer'}
        data-testid={`${testId}-content`}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] dark:border-gray-700">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--color-ocean-400)] to-blue-900 bg-clip-text text-transparent">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'ml-4 p-2 rounded-lg',
                  'hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-800',
                  'transition-colors duration-200',
                  'group'
                )}
                aria-label="Close drawer"
                data-testid={`${testId}-close`}
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[var(--color-text-secondary)] dark:group-hover:text-gray-200" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};

// Drawer Stack for managing multiple drawers
export const useDrawerStack = () => {
  const [drawers, setDrawers] = React.useState<Array<{
    id: string;
    component: React.ReactNode;
  }>>([]);

  const openDrawer = (component: React.ReactNode) => {
    const id = Date.now().toString();
    setDrawers(prev => [...prev, { id, component }]);
    return id;
  };

  const closeDrawer = (id: string) => {
    setDrawers(prev => prev.filter(drawer => drawer.id !== id));
  };

  const closeAllDrawers = () => {
    setDrawers([]);
  };

  const DrawerStack = () => (
    <>
      {drawers.map((drawer, index) => (
        <div key={drawer.id} style={{ zIndex: 100 + index * 10 }}>
          {drawer.component}
        </div>
      ))}
    </>
  );

  return { openDrawer, closeDrawer, closeAllDrawers, DrawerStack };
};

export default MTDrawer;