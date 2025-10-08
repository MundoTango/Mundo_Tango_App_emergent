// MT Ocean Form Field Component
// ESA LIFE CEO 61x21 Form Field

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export interface MTFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  className?: string;
  required?: boolean;
  autoComplete?: string;
  'data-testid'?: string;
}

export default function MTFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  description,
  type = 'text',
  disabled = false,
  className,
  required = false,
  autoComplete,
  'data-testid': testId,
}: MTFormFieldProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-2', className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                className={cn(
                  'h-12 px-4',
                  'border-[var(--color-border)] focus:border-teal-400',
                  'focus:ring-2 focus:ring-teal-400/20',
                  'rounded-xl',
                  'transition-all duration-200',
                  'hover:border-[var(--color-ocean-300)]',
                  fieldState.error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                  isPassword && 'pr-12'
                )}
                data-testid={testId || `input-${name}`}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} aria-label="Button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[var(--color-text-secondary)] transition-colors"
                  data-testid={`toggle-password-${name}`}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
}