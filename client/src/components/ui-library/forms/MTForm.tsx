// MT Ocean Form Component
// ESA LIFE CEO 61x21 Form Wrapper

import { ReactNode } from 'react';
import { UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';

export interface MTFormProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export default function MTForm<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id,
  'data-testid': testId,
}: MTFormProps<TFieldValues>) {
  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'space-y-6',
          'transition-all duration-300',
          className
        )}
        data-testid={testId || 'mt-form'}
      >
        {children}
      </form>
    </Form>
  );
}

// Export styled form sections for consistent layout
export const MTFormSection = ({ 
  children, 
  title, 
  description,
  className 
}: { 
  children: ReactNode; 
  title?: string; 
  description?: string;
  className?: string;
}) => (
  <div className={cn(
    "space-y-4",
    "p-6 rounded-xl",
    "bg-gradient-to-br from-teal-50/50 to-sky-50/50",
    "border border-teal-100",
    "hover:shadow-lg transition-all duration-300",
    className
  )}>
    {title && (
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)] dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
        )}
      </div>
    )}
    {children}
  </div>
);

// Export form button styles
export const MTFormButton = ({ 
  children, 
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  className,
  onClick,
  'data-testid': testId,
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  'data-testid'?: string;
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-[var(--color-ocean-400)] to-cyan-600 text-white hover:from-[var(--color-primary)] hover:to-cyan-700 shadow-lg hover:shadow-xl",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300",
    outline: "border-2 border-teal-400 text-[var(--color-primary-hover)] hover:bg-[var(--color-ocean-50)]"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        loading && "animate-pulse",
        className
      )}
      onClick={onClick}
      data-testid={testId || `mt-form-button-${type}`}
     aria-label="Button">
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          Loading...
        </span>
      ) : children}
    </button>
  );
};