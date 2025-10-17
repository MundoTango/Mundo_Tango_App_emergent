// MT Ocean Confirmation Modal Component
// ESA LIFE CEO 61x21 - Confirmation Dialogs

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, AlertCircle, Trash2, LucideIcon } from 'lucide-react';
import MTModalBase from './MTModalBase';
import MTButton from '../buttons/MTButton';

export interface MTConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  icon?: LucideIcon | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'danger' | 'success';
  showCancelButton?: boolean;
  loading?: boolean;
  size?: 'xs' | 'sm' | 'md';
  'data-testid'?: string;
}

const MTConfirmModal: React.FC<MTConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  icon,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonVariant,
  showCancelButton = true,
  loading = false,
  size = 'sm',
  'data-testid': testId = 'confirm-modal'
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const typeConfig = {
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      confirmVariant: 'primary' as const
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      confirmVariant: 'primary' as const
    },
    danger: {
      icon: Trash2,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      confirmVariant: 'danger' as const
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      confirmVariant: 'success' as const
    }
  };

  const config = typeConfig[type];
  const Icon = icon || config.icon;
  const buttonVariant = confirmButtonVariant || config.confirmVariant;

  return (
    <MTModalBase
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      variant="ocean"
      animationType="scale"
      showCloseButton={false}
      data-testid={testId}
    >
      <div className="p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              config.iconBg,
              'backdrop-blur-sm'
            )}
          >
            {React.isValidElement(Icon) ? (
              Icon
            ) : Icon ? (
              <Icon className={cn('w-8 h-8', config.iconColor)} />
            ) : (
              <AlertCircle className={cn('w-8 h-8', config.iconColor)} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-blue-900 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className={cn(
          'flex gap-3',
          showCancelButton ? 'justify-center' : 'justify-center'
        )}>
          {showCancelButton && (
            <MTButton
              variant="outline"
              onClick={onClose}
              disabled={loading || isProcessing}
              className="min-w-[100px]"
              data-testid={`${testId}-cancel`}
            >
              {cancelText}
            </MTButton>
          )}
          <MTButton
            variant={buttonVariant}
            onClick={handleConfirm}
            loading={loading || isProcessing}
            disabled={loading || isProcessing}
            className="min-w-[100px]"
            data-testid={`${testId}-confirm`}
          >
            {confirmText}
          </MTButton>
        </div>
      </div>
    </MTModalBase>
  );
};

// Hook for easy confirmation dialogs
export const useConfirmModal = () => {
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    props: Partial<MTConfirmModalProps>;
  }>({
    isOpen: false,
    props: {}
  });

  const confirm = (props: Omit<MTConfirmModalProps, 'isOpen' | 'onClose'>) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        props: {
          ...props,
          onConfirm: () => {
            resolve(true);
            setModalState({ isOpen: false, props: {} });
          },
          onClose: () => {
            resolve(false);
            setModalState({ isOpen: false, props: {} });
          }
        }
      });
    });
  };

  const ConfirmModalComponent = () => (
    <MTConfirmModal
      isOpen={modalState.isOpen}
      onClose={() => setModalState({ isOpen: false, props: {} })}
      title=""
      message=""
      onConfirm={() => {}}
      {...modalState.props}
    />
  );

  return { confirm, ConfirmModal: ConfirmModalComponent };
};

export default MTConfirmModal;