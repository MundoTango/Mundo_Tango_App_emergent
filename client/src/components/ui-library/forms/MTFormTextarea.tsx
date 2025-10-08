// MT Ocean Form Textarea Component
// ESA LIFE CEO 61x21 Textarea Field

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export interface MTFormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  'data-testid'?: string;
}

export default function MTFormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  description,
  rows = 4,
  maxLength,
  showCount = true,
  disabled = false,
  className,
  required = false,
  'data-testid': testId,
}: MTFormTextareaProps<TFieldValues, TName>) {
  const [charCount, setCharCount] = useState(0);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        useEffect(() => {
          setCharCount(field.value?.length || 0);
        }, [field.value]);

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
              <FormLabel className="text-sm font-medium text-gray-700 flex items-center justify-between dark:text-neutral-300">
                <span className="flex items-center gap-1">
                  {label}
                  {required && <span className="text-red-500">*</span>}
                </span>
                {showCount && maxLength && (
                  <span className={cn(
                    'text-xs',
                    charCount > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'
                  )}>
                    {charCount} / {maxLength}
                  </span>
                )}
              </FormLabel>
            )}
            <FormControl>
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={cn(
                  'px-4 py-3',
                  'border-gray-200 focus:border-teal-400',
                  'focus:ring-2 focus:ring-teal-400/20',
                  'rounded-xl',
                  'transition-all duration-200',
                  'hover:border-teal-300',
                  'resize-none',
                  fieldState.error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
                onChange={(e) => {
                  field.onChange(e);
                  setCharCount(e.target.value.length);
                }}
                data-testid={testId || `textarea-${name}`}
              />
            </FormControl>
            {description && (
              <FormDescription className="text-xs text-gray-500">
                {description}
              </FormDescription>
            )}
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        );
      }}
    />
  );
}