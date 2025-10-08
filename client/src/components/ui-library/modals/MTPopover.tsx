// MT Ocean Popover Component
// ESA LIFE CEO 61x21 - Click-triggered Popovers

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTPopoverProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  align?: 'start' | 'center' | 'end';
  variant?: 'glass' | 'solid' | 'ocean';
  trigger?: 'click' | 'hover' | 'focus' | 'manual';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showArrow?: boolean;
  showCloseButton?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  'data-testid'?: string;
}

const MTPopover: React.FC<MTPopoverProps> = ({
  content,
  children,
  position = 'bottom',
  align = 'center',
  variant = 'glass',
  trigger = 'click',
  open: controlledOpen,
  onOpenChange,
  showArrow = true,
  showCloseButton = false,
  maxWidth = '320px',
  maxHeight = '400px',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  disabled = false,
  className,
  contentClassName,
  'data-testid': testId = 'popover'
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !popoverRef.current || !isOpen) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const spacing = 8;
    const arrowSize = showArrow ? 8 : 0;

    let top = 0;
    let left = 0;
    let finalPosition = position;

    // Auto positioning
    if (position === 'auto') {
      const spaceAbove = triggerRect.top;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = window.innerWidth - triggerRect.right;

      if (spaceBelow >= popoverRect.height + spacing) {
        finalPosition = 'bottom';
      } else if (spaceAbove >= popoverRect.height + spacing) {
        finalPosition = 'top';
      } else if (spaceRight >= popoverRect.width + spacing) {
        finalPosition = 'right';
      } else if (spaceLeft >= popoverRect.width + spacing) {
        finalPosition = 'left';
      } else {
        finalPosition = 'bottom'; // Default fallback
      }
    }

    setActualPosition(finalPosition);

    // Calculate coordinates based on position
    switch (finalPosition) {
      case 'top':
        top = triggerRect.top - popoverRect.height - spacing - arrowSize;
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing + arrowSize;
        break;
      case 'left':
        left = triggerRect.left - popoverRect.width - spacing - arrowSize;
        break;
      case 'right':
        left = triggerRect.right + spacing + arrowSize;
        break;
    }

    // Handle alignment
    if (finalPosition === 'top' || finalPosition === 'bottom') {
      switch (align) {
        case 'start':
          left = triggerRect.left;
          break;
        case 'center':
          left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
          break;
        case 'end':
          left = triggerRect.right - popoverRect.width;
          break;
      }
    } else {
      switch (align) {
        case 'start':
          top = triggerRect.top;
          break;
        case 'center':
          top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
          break;
        case 'end':
          top = triggerRect.bottom - popoverRect.height;
          break;
      }
    }

    // Viewport boundaries check
    const padding = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + popoverRect.width > viewportWidth - padding) {
      left = viewportWidth - popoverRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + popoverRect.height > viewportHeight - padding) {
      top = viewportHeight - popoverRect.height - padding;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnOutsideClick &&
        isOpen &&
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && isOpen && event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnOutsideClick, closeOnEscape]);

  const handleTriggerProps = () => {
    if (trigger === 'manual') return {};

    switch (trigger) {
      case 'click':
        return {
          onClick: () => !disabled && setOpen(!isOpen),
        };
      case 'hover':
        return {
          onMouseEnter: () => !disabled && setOpen(true),
          onMouseLeave: () => setOpen(false),
        };
      case 'focus':
        return {
          onFocus: () => !disabled && setOpen(true),
          onBlur: () => setOpen(false),
        };
      default:
        return {};
    }
  };

  const variants = {
    glass: {
      className: cn(
        'bg-[var(--color-surface)]/95 dark:bg-gray-900/95',
        'backdrop-blur-2xl backdrop-saturate-150',
        'border border-[var(--color-border)]/30 dark:border-gray-700/30',
        'shadow-2xl'
      ),
      arrowClassName: 'bg-[var(--color-surface)]/95 dark:bg-gray-900/95 border-[var(--color-border)]/30 dark:border-gray-700/30',
      style: applyGlassmorphism()
    },
    solid: {
      className: cn(
        'bg-[var(--color-surface)] dark:bg-gray-900',
        'border border-[var(--color-border)] dark:border-gray-800',
        'shadow-2xl'
      ),
      arrowClassName: 'bg-[var(--color-surface)] dark:bg-gray-900 border-[var(--color-border)] dark:border-gray-800',
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
      arrowClassName: cn(
        'bg-gradient-to-br from-teal-50/95 to-white/95',
        'dark:from-teal-950/95 dark:to-gray-900/95',
        'border-teal-200/30 dark:border-teal-700/30'
      ),
      style: applyGlassmorphism()
    }
  };

  const currentVariant = variants[variant];

  const arrowPositions = {
    top: {
      className: 'bottom-[-8px] rotate-45',
      alignments: {
        start: 'left-4',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-4'
      }
    },
    bottom: {
      className: 'top-[-8px] rotate-45',
      alignments: {
        start: 'left-4',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-4'
      }
    },
    left: {
      className: 'right-[-8px] rotate-45',
      alignments: {
        start: 'top-4',
        center: 'top-1/2 -translate-y-1/2',
        end: 'bottom-4'
      }
    },
    right: {
      className: 'left-[-8px] rotate-45',
      alignments: {
        start: 'top-4',
        center: 'top-1/2 -translate-y-1/2',
        end: 'bottom-4'
      }
    }
  };

  if (disabled) return <>{children}</>;

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        {...handleTriggerProps()}
        data-testid={`${testId}-trigger`}
      >
        {children}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={cn(
            'fixed z-[9998] rounded-xl',
            'transform transition-all duration-200',
            'animate-scaleIn',
            currentVariant.className,
            contentClassName
          )}
          style={{
            ...currentVariant.style,
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            maxWidth,
            maxHeight
          }}
          role="dialog"
          aria-modal="true"
          data-testid={`${testId}-content`}
        >
          {showCloseButton && (
            <button
              onClick={() = aria-label="Button"> setOpen(false)}
              className={cn(
                'absolute top-2 right-2 z-10',
                'p-1.5 rounded-lg',
                'hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-800',
                'transition-colors duration-200'
              )}
              aria-label="Close popover"
              data-testid={`${testId}-close`}
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}

          <div className="p-4 overflow-auto max-h-[inherit]">
            {content}
          </div>

          {showArrow && (
            <div
              className={cn(
                'absolute w-4 h-4',
                arrowPositions[actualPosition].className,
                arrowPositions[actualPosition].alignments[align],
                currentVariant.arrowClassName,
                'border-b border-r'
              )}
              style={variant === 'ocean' ? applyGlassmorphism() : {}}
            />
          )}
        </div>
      )}
    </>
  );
};

// Popover Menu Component
export const MTPopoverMenu: React.FC<{
  items: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
  }>;
  children: ReactNode;
  position?: MTPopoverProps['position'];
  align?: MTPopoverProps['align'];
}> = ({ items, children, position = 'bottom', align = 'start' }) => {
  const [open, setOpen] = useState(false);

  const handleItemClick = (onClick: () => void) => {
    onClick();
    setOpen(false);
  };

  return (
    <MTPopover
      open={open}
      onOpenChange={setOpen}
      position={position}
      align={align}
      variant="ocean"
      showArrow={false}
      content={
        <div className="py-1 min-w-[200px]">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() = aria-label="Button"> handleItemClick(item.onClick)}
              disabled={item.disabled}
              className={cn(
                'w-full px-3 py-2 text-left flex items-center gap-3',
                'hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-800',
                'transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                item.danger && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              )}
            >
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      }
    >
      {children}
    </MTPopover>
  );
};

export default MTPopover;