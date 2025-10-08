// MT Ocean Form Modal Component
// ESA LIFE CEO 61x21 - Modal with Embedded Forms

import React, { FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Save, X, Loader2 } from 'lucide-react';
import MTModalBase from './MTModalBase';
import MTButton from '../buttons/MTButton';

export interface MTFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  showFooter?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'glass' | 'solid' | 'ocean';
  submitButtonVariant?: 'primary' | 'success';
  showHeaderDivider?: boolean;
  showFooterDivider?: boolean;
  additionalActions?: React.ReactNode;
  'data-testid'?: string;
}

const MTFormModal: React.FC<MTFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  showFooter = true,
  size = 'md',
  variant = 'ocean',
  submitButtonVariant = 'primary',
  showHeaderDivider = true,
  showFooterDivider = true,
  additionalActions,
  'data-testid': testId = 'form-modal'
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <MTModalBase
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      variant={variant}
      showCloseButton={false}
      closeOnOverlayClick={!isSubmitting && !loading}
      closeOnEscape={!isSubmitting && !loading}
      data-testid={testId}
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-900 bg-clip-text text-transparent">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting || loading}
              className={cn(
                'ml-4 p-1.5 rounded-lg',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Close modal"
              data-testid={`${testId}-close`}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          {showHeaderDivider && (
            <div className="mt-4 -mx-6 border-b border-gray-200 dark:border-gray-700" />
          )}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
            data-testid={`${testId}-form`}
          >
            {children}
          </form>
        </div>

        {/* Footer */}
        {showFooter && (
          <>
            {showFooterDivider && (
              <div className="border-t border-gray-200 dark:border-gray-700" />
            )}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>{additionalActions}</div>
                <div className="flex gap-3">
                  <MTButton
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting || loading}
                    data-testid={`${testId}-cancel`}
                  >
                    {cancelText}
                  </MTButton>
                  <MTButton
                    variant={submitButtonVariant}
                    onClick={handleFormSubmit}
                    loading={isSubmitting || loading}
                    disabled={isSubmitting || loading}
                    icon={isSubmitting ? Loader2 : Save}
                    data-testid={`${testId}-submit`}
                  >
                    {submitText}
                  </MTButton>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MTModalBase>
  );
};

// Form Modal with validation
export const MTValidatedFormModal: React.FC<MTFormModalProps & {
  validationSchema?: any;
  initialValues?: Record<string, any>;
}> = ({ validationSchema, initialValues, ...props }) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const validateForm = (data: any) => {
    // Implement validation logic here
    // This is a placeholder - integrate with your validation library
    return true;
  };

  const handleSubmit = async (data: any) => {
    if (validationSchema && !validateForm(data)) {
      return;
    }
    
    if (props.onSubmit) {
      await props.onSubmit(data);
    }
  };

  return (
    <MTFormModal {...props} onSubmit={handleSubmit}>
      {React.Children.map(props.children, child => {
        // Clone children and inject error props if needed
        return child;
      })}
    </MTFormModal>
  );
};

export default MTFormModal;