// MT Ocean Form Date Picker Component
// ESA LIFE CEO 61x21 Date Field

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export interface MTFormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  'data-testid'?: string;
}

export default function MTFormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder = 'Pick a date',
  description,
  disabled = false,
  className,
  required = false,
  minDate,
  maxDate,
  dateFormat = 'PPP',
  'data-testid': testId,
}: MTFormDatePickerProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1 dark:text-neutral-300">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'h-12 px-4 justify-start text-left font-normal',
                    'border-gray-200 hover:border-teal-300',
                    'hover:bg-teal-50/50',
                    'rounded-xl',
                    'transition-all duration-200',
                    !field.value && 'text-muted-foreground',
                    fieldState.error && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={disabled}
                  data-testid={testId || `date-picker-${name}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, dateFormat)
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 rounded-xl shadow-xl border-gray-200 dark:border-neutral-700" 
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => {
                  if (disabled) return true;
                  if (minDate && date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
                initialFocus
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>
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

// Date range picker variant
export interface MTFormDateRangePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  'data-testid'?: string;
}

export function MTFormDateRangePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder = 'Pick a date range',
  description,
  disabled = false,
  className,
  required = false,
  minDate,
  maxDate,
  dateFormat = 'PPP',
  'data-testid': testId,
}: MTFormDateRangePickerProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1 dark:text-neutral-300">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'h-12 px-4 justify-start text-left font-normal',
                    'border-gray-200 hover:border-teal-300',
                    'hover:bg-teal-50/50',
                    'rounded-xl',
                    'transition-all duration-200',
                    !field.value && 'text-muted-foreground',
                    fieldState.error && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={disabled}
                  data-testid={testId || `date-range-picker-${name}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value?.from ? (
                    field.value.to ? (
                      <>
                        {format(field.value.from, dateFormat)} -{' '}
                        {format(field.value.to, dateFormat)}
                      </>
                    ) : (
                      format(field.value.from, dateFormat)
                    )
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 rounded-xl shadow-xl border-gray-200 dark:border-neutral-700" 
              align="start"
            >
              <Calendar
                mode="range"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => {
                  if (disabled) return true;
                  if (minDate && date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
                numberOfMonths={2}
                initialFocus
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>
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