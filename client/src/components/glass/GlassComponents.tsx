/**
 * Aurora Tide - Glassmorphic Component Library
 * Accessible glass effects with dark mode support and WCAG 2.2 compliance
 */

import { ReactNode, HTMLAttributes, forwardRef, useRef, useEffect } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Check if user prefers reduced transparency
 */
const prefersReducedTransparency = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
};

/**
 * GlassCard Component
 * Primary glassmorphic card with WCAG AA contrast (4.5:1 minimum)
 * 
 * @accessibility
 * - Light mode: white/0.7 opacity with 12px blur ensures 4.5:1 contrast on text
 * - Dark mode: dark blue/0.7 opacity with 16px blur ensures 4.5:1 contrast on text
 * - Respects prefers-reduced-transparency
 */
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  depth?: 1 | 2 | 3 | 4; // Depth levels for varying opacity
  className?: string;
  animated?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, depth = 2, className = '', animated = false, ...props }, ref) => {
    const depthClass = `glass-depth-${depth}`;
    const reducedTransparency = prefersReducedTransparency();

    if (animated) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'glass-card',
            !reducedTransparency && depthClass,
            'rounded-xl border border-white/20 dark:border-white/10',
            'shadow-lg backdrop-blur-md',
            'transition-all duration-300',
            className
          )}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'glass-card',
          !reducedTransparency && depthClass,
          'rounded-xl border border-white/20 dark:border-white/10',
          'shadow-lg backdrop-blur-md',
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

/**
 * GlassPanel Component
 * Full-width glassmorphic panel
 */
interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className = '', ...props }, ref) => {
    const reducedTransparency = prefersReducedTransparency();

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white/70 dark:bg-slate-900/70',
          !reducedTransparency && 'backdrop-blur-lg',
          'border-y border-white/20 dark:border-white/10',
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';

/**
 * GlassButton Component
 * Glassmorphic button with hover/active states
 */
interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, variant = 'primary', className = '', ...props }, ref) => {
    const reducedTransparency = prefersReducedTransparency();

    const variantStyles = {
      primary: cn(
        'bg-gradient-to-r from-cyan-500/80 to-teal-500/80',
        'dark:from-cyan-400/80 dark:to-teal-400/80',
        'hover:from-cyan-500/90 hover:to-teal-500/90',
        'text-white dark:text-slate-900',
        'font-semibold',
        !reducedTransparency && 'backdrop-blur-sm'
      ),
      secondary: cn(
        'bg-white/60 dark:bg-slate-800/60',
        'hover:bg-white/70 dark:hover:bg-slate-800/70',
        'text-slate-900 dark:text-white',
        !reducedTransparency && 'backdrop-blur-md',
        'border border-white/30 dark:border-white/10'
      ),
      ghost: cn(
        'bg-transparent',
        'hover:bg-white/20 dark:hover:bg-white/10',
        'text-slate-900 dark:text-white',
        !reducedTransparency && 'backdrop-blur-sm'
      ),
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'px-4 py-2 rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

/**
 * GlassModal Component
 * Glassmorphic modal with backdrop
 * 
 * @accessibility
 * - Implements ARIA dialog pattern with role, aria-modal, and labeling
 * - Keyboard accessible (Escape to close)
 * - Focus trap keeps focus within modal
 * - Focus restoration returns to trigger element on close
 * - Prevents backdrop click from bubbling to content
 */
interface GlassModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const GlassModal = ({ 
  children, 
  isOpen, 
  onClose, 
  className = '',
  ariaLabelledBy,
  ariaDescribedBy,
}: GlassModalProps) => {
  const reducedTransparency = prefersReducedTransparency();
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element to restore later
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal content
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus when modal closes
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    }
  }, [isOpen]);

  // Focus trap: Keep focus within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: Move to last element if at first
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab: Move to first element if at last
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      {/* Backdrop */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/40',
          !reducedTransparency && 'backdrop-blur-sm'
        )}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={cn(
          'relative glass-card glass-depth-3',
          'max-w-lg w-full max-h-[90vh] overflow-auto',
          'rounded-2xl border border-white/20 dark:border-white/10',
          'shadow-2xl',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
          className
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/**
 * GlassTooltip Component
 * Glassmorphic tooltip for helper text
 */
interface GlassTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const GlassTooltip = ({ 
  children, 
  content, 
  position = 'top',
  className = ''
}: GlassTooltipProps) => {
  const reducedTransparency = prefersReducedTransparency();

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={cn(
        'absolute z-50 pointer-events-none',
        'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        'transition-opacity duration-200',
        positionStyles[position]
      )}>
        <div className={cn(
          'glass-card glass-depth-2',
          'px-3 py-2 rounded-lg',
          'border border-white/20 dark:border-white/10',
          'text-sm text-slate-900 dark:text-white',
          'whitespace-nowrap',
          'shadow-lg',
          className
        )}>
          {content}
        </div>
      </div>
    </div>
  );
};

/**
 * GlassBadge Component
 * Glassmorphic badge for status/labels
 */
interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ children, variant = 'info', className = '', ...props }, ref) => {
    const reducedTransparency = prefersReducedTransparency();

    const variantStyles = {
      info: 'bg-ocean-500/20 text-cyan-700 dark:text-cyan-300 border-ocean-500/30',
      success: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
      warning: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      error: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full',
          'text-xs font-medium',
          'border',
          !reducedTransparency && 'backdrop-blur-sm',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GlassBadge.displayName = 'GlassBadge';

/**
 * GlassInput Component
 * Glassmorphic input with focus states
 */
interface GlassInputProps extends HTMLAttributes<HTMLInputElement> {
  type?: string;
  placeholder?: string;
  className?: string;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ type = 'text', placeholder = '', className = '', ...props }, ref) => {
    const reducedTransparency = prefersReducedTransparency();

    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-2 rounded-lg',
          'bg-white/60 dark:bg-slate-800/60',
          'border border-white/30 dark:border-white/10',
          !reducedTransparency && 'backdrop-blur-md',
          'text-slate-900 dark:text-white',
          'placeholder:text-slate-500 dark:placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
          'focus:border-ocean-500/50',
          'transition-all duration-200',
          className
        )}
        {...props}
      / data-testid="input-element">
    );
  }
);

GlassInput.displayName = 'GlassInput';

/**
 * GlassTextarea Component
 * Glassmorphic textarea with focus states
 */
interface GlassTextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
  rows?: number;
  className?: string;
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ placeholder = '', rows = 4, className = '', ...props }, ref) => {
    const reducedTransparency = prefersReducedTransparency();

    return (
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full px-4 py-2 rounded-lg',
          'bg-white/60 dark:bg-slate-800/60',
          'border border-white/30 dark:border-white/10',
          !reducedTransparency && 'backdrop-blur-md',
          'text-slate-900 dark:text-white',
          'placeholder:text-slate-500 dark:placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
          'focus:border-ocean-500/50',
          'transition-all duration-200',
          'resize-none',
          className
        )}
        {...props}
      / data-testid="textarea-element">
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

/**
 * GlassNavbar Component
 * Glassmorphic navigation bar
 */
interface GlassNavbarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

const GlassNavbar = forwardRef<HTMLElement, GlassNavbarProps>(
  ({ children, className = '', ...props }, ref) => {
    const reducedTransparency = prefersReducedTransparency();

    return (
      <nav
        ref={ref}
        className={cn(
          'sticky top-0 z-40',
          'bg-white/80 dark:bg-slate-900/80',
          !reducedTransparency && 'backdrop-blur-lg',
          'border-b border-white/20 dark:border-white/10',
          'shadow-sm',
          className
        )}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

GlassNavbar.displayName = 'GlassNavbar';

/**
 * GlassDropdown Component
 * Glassmorphic dropdown menu
 */
interface GlassDropdownProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
}

const GlassDropdown = ({ children, isOpen, className = '' }: GlassDropdownProps) => {
  const reducedTransparency = prefersReducedTransparency();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'absolute top-full right-0 mt-2',
        'glass-card glass-depth-2',
        'min-w-[200px] rounded-lg',
        'border border-white/20 dark:border-white/10',
        'shadow-xl',
        'z-50',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

/**
 * Export all glass components
 */
export {
  GlassCard,
  GlassPanel,
  GlassButton,
  GlassModal,
  GlassTooltip,
  GlassBadge,
  GlassInput,
  GlassTextarea,
  GlassNavbar,
  GlassDropdown,
};
