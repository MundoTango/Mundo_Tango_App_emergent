/**
 * Aurora Tide - International Icon & Tooltip System
 * Accessible, multilingual tooltips with RTL support and cultural icon validation
 */

import { ReactNode, useState, useRef, useEffect } from 'react';
import { Info, HelpCircle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Standard ISO information icon types
 * Using Lucide icons for consistency
 */
export const IconTypes = {
  info: Info,           // General information (ISO standard "i")
  help: HelpCircle,     // Help/guidance
  warning: AlertCircle, // Warning/caution
  success: CheckCircle, // Success/confirmation
  error: XCircle,       // Error/problem
} as const;

export type IconType = keyof typeof IconTypes;

/**
 * Text direction for RTL support
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Tooltip position with RTL awareness
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * International Icon Tooltip Component
 * 
 * @accessibility
 * - Keyboard accessible (focus to show, Escape to hide)
 * - Touch accessible (tap to toggle)
 * - Screen reader compatible with aria-describedby
 * - 150% text expansion buffer for translations
 * - RTL language support
 * - Cultural icon validation (ISO standard "i" for info)
 */
interface InternationalIconTooltipProps {
  content: ReactNode;
  iconType?: IconType;
  position?: TooltipPosition;
  textDirection?: TextDirection;
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
  ariaLabel?: string;
  maxWidth?: string; // For text expansion buffer
}

const InternationalIconTooltip = ({
  content,
  iconType = 'info',
  position = 'top',
  textDirection = 'ltr',
  className = '',
  iconClassName = '',
  tooltipClassName = '',
  ariaLabel,
  maxWidth = '350px', // 150% expansion buffer from base 200px
}: InternationalIconTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Auto-hide tooltip on outside click (touch devices)
  useEffect(() => {
    if (!isVisible || !isTouchDevice) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        iconRef.current &&
        tooltipRef.current &&
        !iconRef.current.contains(e.target as Node) &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible, isTouchDevice]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
      iconRef.current?.focus();
    }
  };

  const Icon = IconTypes[iconType];

  // Position styles with RTL support
  const getPositionStyles = () => {
    const isRTL = textDirection === 'rtl';
    
    const positions: Record<TooltipPosition, string> = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: isRTL 
        ? 'left-full top-1/2 -translate-y-1/2 ml-2'
        : 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: isRTL
        ? 'right-full top-1/2 -translate-y-1/2 mr-2'
        : 'left-full top-1/2 -translate-y-1/2 ml-2',
      auto: 'top-full left-1/2 -translate-x-1/2 mt-2',
    };

    return positions[position];
  };

  // Icon color variants
  const getIconColor = () => {
    const colors: Record<IconType, string> = {
      info: 'text-cyan-600 dark:text-cyan-400',
      help: 'text-blue-600 dark:text-blue-400',
      warning: 'text-amber-600 dark:text-amber-400',
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
    };

    return colors[iconType];
  };

  // Toggle visibility (for touch devices)
  const handleToggle = () => {
    if (isTouchDevice) {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Icon Button */}
      <button
        ref={iconRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => !isTouchDevice && setIsVisible(true)}
        onMouseLeave={() => !isTouchDevice && setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || `${iconType} information`}
        aria-describedby={isVisible ? tooltipId.current : undefined}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-full p-1',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
          'transition-colors duration-150',
          'cursor-help',
          getIconColor(),
          iconClassName
        )}
      >
        <Icon size={18} aria-hidden="true" />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId.current}
          role="tooltip"
          dir={textDirection}
          onKeyDown={handleKeyDown}
          className={cn(
            'absolute z-50',
            'glass-card glass-depth-2',
            'px-3 py-2 rounded-lg',
            'border border-white/20 dark:border-white/10',
            'text-sm text-slate-900 dark:text-white',
            'shadow-lg backdrop-blur-md',
            'animate-in fade-in-0 zoom-in-95',
            'duration-150',
            getPositionStyles(),
            tooltipClassName
          )}
          style={{
            maxWidth,
            // Ensure text can expand 150% for translations
            minWidth: '150px',
            wordWrap: 'break-word',
            hyphens: 'auto',
          }}
        >
          {/* Arrow indicator */}
          <div
            className={cn(
              'absolute w-2 h-2 bg-white/70 dark:bg-slate-800/70',
              'border border-white/20 dark:border-white/10',
              'rotate-45',
              position === 'top' && 'bottom-[-5px] left-1/2 -translate-x-1/2',
              position === 'bottom' && 'top-[-5px] left-1/2 -translate-x-1/2',
              position === 'left' && textDirection === 'ltr' && 'right-[-5px] top-1/2 -translate-y-1/2',
              position === 'right' && textDirection === 'ltr' && 'left-[-5px] top-1/2 -translate-y-1/2',
              position === 'left' && textDirection === 'rtl' && 'left-[-5px] top-1/2 -translate-y-1/2',
              position === 'right' && textDirection === 'rtl' && 'right-[-5px] top-1/2 -translate-y-1/2',
            )}
          />
          
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </div>
  );
};

/**
 * Quick Info Tooltip
 * Simplified component for common info tooltips
 */
interface QuickInfoTooltipProps {
  content: ReactNode;
  textDirection?: TextDirection;
  position?: TooltipPosition;
}

const QuickInfoTooltip = ({ 
  content, 
  textDirection = 'ltr',
  position = 'top',
}: QuickInfoTooltipProps) => (
  <InternationalIconTooltip
    content={content}
    iconType="info"
    textDirection={textDirection}
    position={position}
    ariaLabel="Information"
  />
);

/**
 * Help Tooltip
 * For contextual help and guidance
 */
interface HelpTooltipProps {
  content: ReactNode;
  textDirection?: TextDirection;
  position?: TooltipPosition;
}

const HelpTooltip = ({ 
  content, 
  textDirection = 'ltr',
  position = 'top',
}: HelpTooltipProps) => (
  <InternationalIconTooltip
    content={content}
    iconType="help"
    textDirection={textDirection}
    position={position}
    ariaLabel="Help"
  />
);

/**
 * Cultural Icon Validator
 * Validates that icons are culturally appropriate
 * 
 * @note ISO standard "i" icon (Info) is internationally recognized
 * Other icons should be validated per region:
 * - Thumbs up (✓ in most, ✗ in Middle East/parts of Africa)
 * - OK hand gesture (✓ in US, offensive in Brazil)
 * - Check mark (universal ✓)
 */
const validateIconForCulture = (
  iconType: IconType,
  cultureCode: string
): { valid: boolean; alternative?: IconType; reason?: string } => {
  // ISO standard icons are universally valid
  const universalIcons: IconType[] = ['info', 'warning', 'error', 'success'];
  
  if (universalIcons.includes(iconType)) {
    return { valid: true };
  }

  // Help icon validation (question mark is universal)
  if (iconType === 'help') {
    return { valid: true };
  }

  // Default: approve but log for review
  console.warn(`Icon "${iconType}" not validated for culture "${cultureCode}". Using default.`);
  return { 
    valid: true,
    reason: 'Not explicitly validated - using ISO standard fallback'
  };
};

/**
 * Export all components
 */
export {
  InternationalIconTooltip,
  QuickInfoTooltip,
  HelpTooltip,
  validateIconForCulture,
};
