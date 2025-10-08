// MT Ocean Form Select Component
// ESA LIFE CEO 61x21 Select Field

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface MTFormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export interface MTFormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  options: MTFormSelectOption[];
  disabled?: boolean;
  className?: string;
  required?: boolean;
  'data-testid'?: string;
}

export default function MTFormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder = 'Select an option',
  description,
  options,
  disabled = false,
  className,
  required = false,
  'data-testid': testId,
}: MTFormSelectProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-2', className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1 dark:text-neutral-600 dark:text-neutral-300">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  'h-12 px-4',
                  'border-gray-200 focus:border-teal-400',
                  'focus:ring-2 focus:ring-teal-400/20',
                  'rounded-xl',
                  'transition-all duration-200',
                  'hover:border-teal-300',
                  fieldState.error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
                data-testid={testId || `select-${name}`}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="rounded-xl border-gray-200 shadow-xl dark:border-neutral-700">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="hover:bg-teal-50 cursor-pointer transition-colors"
                  data-testid={`option-${option.value}`}
                >
                  <span className="flex items-center gap-2">
                    {option.icon && <span>{option.icon}</span>}
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && (
            <FormDescription className="text-xs text-gray-500">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
}