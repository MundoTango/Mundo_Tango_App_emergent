// MT Ocean Tooltip Component
// ESA LIFE CEO 61x21 - Hover Tooltips

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'dark' | 'light' | 'ocean';
  delay?: number;
  showArrow?: boolean;
  maxWidth?: string;
  trigger?: 'hover' | 'click' | 'focus';
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  'data-testid'?: string;
}

const MTTooltip: React.FC<MTTooltipProps> = ({
  content,
  children,
  position = 'top',
  variant = 'dark',
  delay = 200,
  showArrow = true,
  maxWidth = '250px',
  trigger = 'hover',
  disabled = false,
  className,
  contentClassName,
  'data-testid': testId = 'tooltip'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8;
    const arrowSize = showArrow ? 6 : 0;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing - arrowSize;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing + arrowSize;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - spacing - arrowSize;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + spacing + arrowSize;
        break;
    }

    // Viewport boundaries check
    const padding = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isVisible]);

  const showTooltip = () => {
    if (disabled) return;
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const toggleTooltip = () => {
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  const handleTriggerProps = () => {
    switch (trigger) {
      case 'hover':
        return {
          onMouseEnter: showTooltip,
          onMouseLeave: hideTooltip,
        };
      case 'click':
        return {
          onClick: toggleTooltip,
        };
      case 'focus':
        return {
          onFocus: showTooltip,
          onBlur: hideTooltip,
        };
      default:
        return {};
    }
  };

  const variants = {
    dark: {
      className: cn(
        'bg-gray-900/95 text-white',
        'border border-gray-700/50',
        'shadow-xl'
      ),
      arrowClassName: 'bg-gray-900/95 border-gray-700/50',
      style: {}
    },
    light: {
      className: cn(
        'bg-[var(--color-surface)] dark:bg-gray-900/95 text-[var(--color-text)] dark:text-white',
        'border border-[var(--color-border)]/50',
        'shadow-xl'
      ),
      arrowClassName: 'bg-[var(--color-surface)] dark:bg-gray-900/95 border-[var(--color-border)]/50',
      style: {}
    },
    ocean: {
      className: cn(
        'bg-gradient-to-br from-teal-800/95 to-blue-900/95 text-white',
        'border border-teal-600/30',
        'shadow-[0_8px_32px_rgba(94,234,212,0.3)]'
      ),
      arrowClassName: 'bg-teal-800/95 border-teal-600/30',
      style: applyGlassmorphism()
    }
  };

  const currentVariant = variants[variant];

  const arrowPositions = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 rotate-45',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 rotate-45',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 rotate-45',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 rotate-45'
  };

  if (disabled || !content) return <>{children}</>;

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

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-[9999] px-3 py-2 rounded-lg',
            'backdrop-blur-xl backdrop-saturate-150',
            'pointer-events-none',
            'animate-fadeIn',
            currentVariant.className,
            contentClassName
          )}
          style={{
            ...currentVariant.style,
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            maxWidth
          }}
          role="tooltip"
          data-testid={`${testId}-content`}
        >
          <div className="relative text-sm">
            {content}
          </div>

          {showArrow && (
            <div
              className={cn(
                'absolute w-3 h-3',
                arrowPositions[position],
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

// Tooltip Provider for managing multiple tooltips
export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="relative">{children}</div>;
};

// Quick tooltip wrapper for simple text tooltips
export const QuickTooltip: React.FC<{
  text: string;
  children: ReactNode;
  position?: MTTooltipProps['position'];
}> = ({ text, children, position = 'top' }) => {
  return (
    <MTTooltip content={text} position={position} variant="ocean">
      {children}
    </MTTooltip>
  );
};

export default MTTooltip;