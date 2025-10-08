import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import MTButton from '../buttons/MTButton';
import { applyGlassmorphism } from '@/styles/mt-ocean-theme';
import { GlassCard } from '@/components/glass/GlassComponents';


export interface MTModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'glass' | 'solid';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const MTModal: React.FC<MTModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'glass',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const variants = {
    glass: cn(
      'bg-[var(--color-surface)]/95 dark:bg-gray-900/95',
      'backdrop-blur-xl',
      'border border-white/30 dark:border-white/10'
    ),
    solid: cn(
      'bg-[var(--color-surface)] dark:bg-gray-900',
      'border border-[var(--color-border)] dark:border-gray-800'
    )
  };

  const glassmorphicStyle = variant === 'glass' ? applyGlassmorphism() : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <GlassCard depth={1} className="absolute inset-0 animate-fadeIn" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full',
          sizes[size],
          variants[variant],
          'rounded-2xl shadow-2xl',
          'transform transition-all duration-300',
          'animate-slideInUp',
          className
        )}
        style={glassmorphicStyle}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-[var(--color-border)] dark:border-gray-700">
            <div>
              {title && (
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-ocean-400)] to-blue-900 bg-clip-text text-transparent">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-lg hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-800 transition-colors"
               aria-label="Button">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)] dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default MTModal;