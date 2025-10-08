import React from 'react';
import { cn } from '@/lib/utils';
import { MTOceanTheme, getGradient } from '@/styles/mt-ocean-theme';
import { Loader2 } from 'lucide-react';

export interface MTButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
}

const MTButton = React.forwardRef<HTMLButtonElement, MTButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  glow = false,
  children,
  disabled,
  ...props
}, ref) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300',
    'transform hover:-translate-y-0.5 active:translate-y-0',
    'focus:outline-none focus:ring-4 focus:ring-teal-300/50 dark:focus:ring-teal-700/50',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    fullWidth && 'w-full'
  );

  const variants = {
    primary: 'bg-teal-400 hover:bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent hover:bg-[var(--color-ocean-50)] dark:hover:bg-teal-900/20 text-[var(--color-primary-hover)] dark:text-teal-300',
    gradient: 'bg-gradient-to-r from-teal-300 to-blue-900 hover:from-[var(--color-ocean-400)] hover:to-blue-800 text-white shadow-lg hover:shadow-2xl',
    glass: 'bg-[var(--color-surface)]/20 dark:bg-gray-900/20 backdrop-blur-md border border-white/30 dark:border-white/10 text-[var(--color-primary-hover)] dark:text-teal-300 hover:bg-[var(--color-surface)]/30 dark:hover:bg-gray-900/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const glowEffect = glow ? 'hover:shadow-[0_0_20px_rgba(94,234,212,0.5)]' : '';

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        glowEffect,
        className
      )}
      disabled={disabled || isLoading}
      {...props} data-testid="button-element" aria-label="Button">

      {isLoading &&
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      }
      {!isLoading && icon && iconPosition === 'left' &&
      <span className="mr-2">{icon}</span>
      }
      {children}
      {!isLoading && icon && iconPosition === 'right' &&
      <span className="ml-2">{icon}</span>
      }
    </button>);

});

MTButton.displayName = 'MTButton';

export default MTButton;