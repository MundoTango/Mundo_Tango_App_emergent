// MT Ocean Form Radio Group Component
// ESA LIFE CEO 61x21 Radio Field

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface MTFormRadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: string;
}

export interface MTFormRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  options: MTFormRadioOption[];
  disabled?: boolean;
  className?: string;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  'data-testid'?: string;
}

export default function MTFormRadioGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  options,
  disabled = false,
  className,
  required = false,
  orientation = 'vertical',
  'data-testid': testId,
}: MTFormRadioGroupProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-3', className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          {description && (
            <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </FormDescription>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
              className={cn(
                orientation === 'horizontal' ? 'flex flex-row gap-6' : 'space-y-3'
              )}
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className={cn(
                    'flex items-start space-x-3 space-y-0',
                    option.disabled && 'opacity-50'
                  )}
                >
                  <FormControl>
                    <RadioGroupItem
                      value={option.value}
                      disabled={option.disabled}
                      className={cn(
                        'mt-1',
                        'border-gray-300 dark:border-gray-600',
                        'text-[var(--color-primary-hover)]',
                        'focus:ring-teal-400',
                        'transition-all duration-200',
                        fieldState.error && 'border-red-500'
                      )}
                      data-testid={`${testId || 'radio'}-${option.value}`}
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                      {option.icon && <span>{option.icon}</span>}
                      {option.label}
                    </FormLabel>
                    {option.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
}

// Card-style radio group for better UX
export function MTFormRadioCards<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  options,
  disabled = false,
  className,
  required = false,
  columns = 1,
  'data-testid': testId,
}: MTFormRadioGroupProps<TFieldValues, TName> & { columns?: 1 | 2 | 3 | 4 }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-3', className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          {description && (
            <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </FormDescription>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
              className={cn(
                'grid gap-3',
                columns === 1 && 'grid-cols-1',
                columns === 2 && 'grid-cols-1 sm:grid-cols-2',
                columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              )}
            >
              {options.map((option) => (
                <FormItem key={option.value}>
                  <FormLabel
                    htmlFor={`${name}-${option.value}`}
                    className={cn(
                      'cursor-pointer',
                      '[&:has([data-state=checked])>div]:border-teal-400',
                      '[&:has([data-state=checked])>div]:bg-gradient-to-br',
                      '[&:has([data-state=checked])>div]:from-teal-50',
                      '[&:has([data-state=checked])>div]:to-cyan-50'
                    )}
                  >
                    <FormControl>
                      <RadioGroupItem
                        value={option.value}
                        id={`${name}-${option.value}`}
                        disabled={option.disabled}
                        className="sr-only"
                        data-testid={`${testId || 'radio-card'}-${option.value}`}
                      />
                    </FormControl>
                    <div className={cn(
                      'rounded-xl border-2 p-4',
                      'hover:border-[var(--color-ocean-300)] hover:bg-[var(--color-ocean-50)]/50',
                      'transition-all duration-200',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      fieldState.error && 'border-red-500'
                    )}>
                      <div className="flex items-start gap-3">
                        {option.icon && (
                          <span className="text-2xl">{option.icon}</span>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-[var(--color-text)] dark:text-white">
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
}