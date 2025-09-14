import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface MTBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  pulse?: boolean;
  glow?: boolean;
}

const MTBadge = React.forwardRef<HTMLSpanElement, MTBadgeProps>(({
  className,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  removable = false,
  onRemove,
  icon,
  pulse = false,
  glow = false,
  children,
  ...props
}, ref) => {
  const baseClasses = cn(
    'inline-flex items-center font-medium transition-all duration-300',
    'hover:scale-105'
  );

  const variants = {
    default: cn(
      'bg-gray-100 dark:bg-gray-800',
      'text-gray-700 dark:text-gray-300',
      'border border-gray-200 dark:border-gray-700'
    ),
    success: cn(
      'bg-green-100 dark:bg-green-900/30',
      'text-green-800 dark:text-green-300',
      'border border-green-200 dark:border-green-800'
    ),
    warning: cn(
      'bg-amber-100 dark:bg-amber-900/30',
      'text-amber-800 dark:text-amber-300',
      'border border-amber-200 dark:border-amber-800'
    ),
    error: cn(
      'bg-red-100 dark:bg-red-900/30',
      'text-red-800 dark:text-red-300',
      'border border-red-200 dark:border-red-800'
    ),
    info: cn(
      'bg-blue-100 dark:bg-blue-900/30',
      'text-blue-800 dark:text-blue-300',
      'border border-blue-200 dark:border-blue-800'
    ),
    gradient: cn(
      'bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30',
      'text-teal-800 dark:text-teal-300',
      'border border-teal-200/50 dark:border-teal-700/50'
    )
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2'
  };

  const roundings = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const pulseEffect = pulse ? 'animate-pulse' : '';
  const glowEffect = glow ? 'shadow-[0_0_10px_rgba(94,234,212,0.5)]' : '';

  return (
    <span
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        roundings[rounded],
        pulseEffect,
        glowEffect,
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 -mr-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
        >
          <X className={cn(
            'flex-shrink-0',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-3.5 h-3.5',
            size === 'lg' && 'w-4 h-4'
          )} />
        </button>
      )}
    </span>
  );
});

MTBadge.displayName = 'MTBadge';

export default MTBadge;