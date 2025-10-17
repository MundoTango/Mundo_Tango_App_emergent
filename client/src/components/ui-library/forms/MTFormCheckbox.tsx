// MT Ocean Form Checkbox Component
// ESA LIFE CEO 61x21 Checkbox Field

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface MTFormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  'data-testid'?: string;
}

export default function MTFormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
  required = false,
  'data-testid': testId,
}: MTFormCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(
          'flex flex-row items-start space-x-3 space-y-0',
          className
        )}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                'mt-1',
                'border-gray-300',
                'data-[state=checked]:bg-gradient-to-r',
                'data-[state=checked]:from-teal-400',
                'data-[state=checked]:to-cyan-600',
                'data-[state=checked]:border-teal-400',
                'transition-all duration-200',
                fieldState.error && 'border-red-500'
              )}
              data-testid={testId || `checkbox-${name}`}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel className={cn(
                'text-sm font-medium text-gray-700 cursor-pointer',
                disabled && 'opacity-50'
              )}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            )}
            {description && (
              <FormDescription className="text-xs text-gray-500">
                {description}
              </FormDescription>
            )}
            <FormMessage className="text-xs text-red-500" />
          </div>
        </FormItem>
      )}
    />
  );
}

// Multiple checkbox group component
export interface MTFormCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  'data-testid'?: string;
}

export function MTFormCheckboxGroup<
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
  'data-testid': testId,
}: MTFormCheckboxGroupProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          {description && (
            <FormDescription className="text-xs text-gray-500 mb-3">
              {description}
            </FormDescription>
          )}
          <div className="space-y-3">
            {options.map((option) => (
              <FormItem
                key={option.value}
                className="flex flex-row items-start space-x-3 space-y-0"
              >
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, option.value]);
                      } else {
                        field.onChange(current.filter((v: string) => v !== option.value));
                      }
                    }}
                    disabled={disabled || option.disabled}
                    className={cn(
                      'mt-1',
                      'border-gray-300',
                      'data-[state=checked]:bg-gradient-to-r',
                      'data-[state=checked]:from-teal-400',
                      'data-[state=checked]:to-cyan-600',
                      'data-[state=checked]:border-teal-400',
                      'transition-all duration-200'
                    )}
                    data-testid={`${testId || 'checkbox-group'}-${option.value}`}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className={cn(
                    'text-sm font-normal cursor-pointer',
                    (disabled || option.disabled) && 'opacity-50'
                  )}>
                    {option.label}
                  </FormLabel>
                  {option.description && (
                    <p className="text-xs text-gray-500">
                      {option.description}
                    </p>
                  )}
                </div>
              </FormItem>
            ))}
          </div>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
}