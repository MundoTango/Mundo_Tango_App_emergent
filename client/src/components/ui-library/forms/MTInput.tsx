import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';

export interface MTInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
}

const MTInput = React.forwardRef<HTMLInputElement, MTInputProps>(({
  className,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  label,
  error,
  helperText,
  showPasswordToggle = false,
  showClearButton = false,
  onClear,
  type = 'text',
  value,
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const baseInputClasses = cn(
    'w-full transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-teal-400/50 dark:focus:ring-teal-600/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-gray-600 dark:text-gray-400 dark:placeholder:text-gray-500'
  );

  const variants = {
    default: cn(
      'bg-white dark:bg-gray-900',
      'border border-gray-300 dark:border-gray-700',
      'hover:border-teal-400 dark:hover:border-teal-600',
      'focus:border-teal-500 dark:focus:border-teal-500'
    ),
    glass: cn(
      'bg-white/90 dark:bg-gray-900/90',
      'backdrop-blur-md',
      'border border-teal-200/50 dark:border-teal-700/50',
      'hover:border-teal-300 dark:hover:border-teal-600',
      'focus:border-teal-400 dark:focus:border-teal-500'
    ),
    gradient: cn(
      'bg-gradient-to-r from-teal-50/50 to-blue-50/50 dark:from-teal-900/20 dark:to-blue-900/20',
      'border border-teal-300/50 dark:border-teal-700/50',
      'hover:border-teal-400 dark:hover:border-teal-600',
      'focus:border-teal-500 dark:focus:border-teal-500'
    )
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-xl',
    lg: 'px-5 py-3 text-lg rounded-xl'
  };

  const iconPaddings = {
    left: {
      sm: 'pl-9',
      md: 'pl-11',
      lg: 'pl-13'
    },
    right: {
      sm: 'pr-9',
      md: 'pr-11',
      lg: 'pr-13'
    }
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          value={value}
          disabled={disabled}
          className={cn(
            baseInputClasses,
            variants[variant],
            sizes[size],
            icon && iconPosition === 'left' && iconPaddings.left[size],
            icon && iconPosition === 'right' && iconPaddings.right[size],
            (showPasswordToggle || showClearButton) && 'pr-10',
            error && 'border-red-500 dark:border-red-500 focus:ring-red-500/50',
            className
          )}
          onFocus={()  => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {icon && iconPosition === 'right' && !showPasswordToggle && !showClearButton && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}

        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={()  => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {showClearButton && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-600 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

MTInput.displayName = 'MTInput';

export default MTInput;