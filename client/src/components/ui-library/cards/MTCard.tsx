import React from 'react';
import { cn } from '@/lib/utils';
import { applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient';
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const MTCard = React.forwardRef<HTMLDivElement, MTCardProps>(({
  className,
  variant = 'glass',
  hover = true,
  glow = false,
  padding = 'md',
  rounded = 'xl',
  style,
  children,
  ...props
}, ref) => {
  const baseClasses = cn(
    'transition-all duration-300',
    hover && 'hover:scale-[1.02] hover:-translate-y-1'
  );

  const variants = {
    glass: cn(
      'bg-white/85 dark:bg-gray-900/85',
      'backdrop-blur-xl',
      'border border-white/30 dark:border-white/10',
      'shadow-xl hover:shadow-2xl'
    ),
    solid: cn(
      'bg-white dark:bg-gray-900',
      'border border-gray-200 dark:border-gray-800',
      'shadow-lg hover:shadow-xl'
    ),
    gradient: cn(
      'bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20',
      'border border-teal-200/50 dark:border-teal-700/50',
      'shadow-lg hover:shadow-xl'
    )
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const roundings = {
    none: '',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  };

  const glowEffect = glow ? 'hover:shadow-[0_0_30px_rgba(94,234,212,0.4)]' : '';

  const glassmorphicStyle = variant === 'glass' ? applyGlassmorphism() : {};

  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        paddings[padding],
        roundings[rounded],
        glowEffect,
        className
      )}
      style={{
        ...glassmorphicStyle,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
});

MTCard.displayName = 'MTCard';

export default MTCard;