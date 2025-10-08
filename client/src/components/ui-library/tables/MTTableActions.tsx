// MT Ocean Table Actions - Bulk and Row Actions Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState } from 'react'
import { useTranslation } from 'react-i18next';;
import { 
  Trash, 
  Download, 
  Upload, 
  Edit, 
  Copy, 
  Archive,
  Star,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme } from '@/styles/mt-ocean-theme';
import MTButton from '../buttons/MTButton';

export interface MTTableAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedItems: any[]) => void;
  variant?: 'default' | 'primary' | 'danger';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  disabled?: boolean | ((selectedItems: any[]) => boolean);
  hidden?: boolean | ((selectedItems: any[]) => boolean);
}

export interface MTTableActionsProps {
  actions: MTTableAction[];
  selectedItems: any[];
  position?: 'top' | 'bottom' | 'inline';
  className?: string;
  testId?: string;
}

export default function MTTableActions({
  actions,
  selectedItems,
  position = 'top',
  className,
  testId = 'mt-table-actions'
}: MTTableActionsProps) {
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);
  const hasSelection = selectedItems.length > 0;

  const handleAction = (action: MTTableAction) => {
  const { t } = useTranslation();
    if (action.requiresConfirmation) {
      setConfirmingAction(action.id);
    } else {
      action.onClick(selectedItems);
    }
  };

  const confirmAction = (action: MTTableAction) => {
    action.onClick(selectedItems);
    setConfirmingAction(null);
  };

  const cancelConfirmation = () => {
    setConfirmingAction(null);
  };

  const visibleActions = actions.filter(action => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(selectedItems);
    }
    return !action.hidden;
  });

  const isActionDisabled = (action: MTTableAction) => {
    if (typeof action.disabled === 'function') {
      return action.disabled(selectedItems);
    }
    return action.disabled || (!hasSelection && selectedItems !== undefined);
  };

  if (visibleActions.length === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        position === 'inline' && 'inline-flex',
        className
      )}
      data-testid={testId}
    >
      {hasSelection && (
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
          {selectedItems.length} selected
        </span>
      )}

      {visibleActions.map(action => {
        const isConfirming = confirmingAction === action.id;
        const isDisabled = isActionDisabled(action);

        if (isConfirming) {
          return (
            <div
              key={action.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <span className="text-sm text-red-700 dark:text-red-300">
                {action.confirmationMessage || `${action.label}?`}
              </span>
              <button
                onClick={() = aria-label="Button"> confirmAction(action)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded transition-colors"
                data-testid={`${testId}-confirm-${action.id}`}
              >
                <Check className="w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={cancelConfirmation}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded transition-colors"
                data-testid={`${testId}-cancel-${action.id}`}
               aria-label="Button">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          );
        }

        return (
          <ActionButton
            key={action.id}
            action={action}
            onClick={() => handleAction(action)}
            disabled={isDisabled}
            testId={`${testId}-${action.id}`}
          />
        );
      })}
    </div>
  );
}

// Individual Action Button Component
interface ActionButtonProps {
  action: MTTableAction;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
}

function ActionButton({ action, onClick, disabled, testId }: ActionButtonProps) {
  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-[var(--color-neutral-100)] dark:bg-gray-800 text-gray-400 cursor-not-allowed';
    }

    switch (action.variant) {
      case 'primary':
        return cn(
          'bg-gradient-to-r from-[var(--color-ocean-400)] to-[var(--color-ocean-600)]',
          'hover:from-[var(--color-primary)] hover:to-blue-700',
          'text-white shadow-md hover:shadow-lg'
        );
      case 'danger':
        return cn(
          'bg-red-500 hover:bg-red-600',
          'text-white shadow-md hover:shadow-lg'
        );
      default:
        return cn(
          'bg-[var(--color-surface)] dark:bg-gray-800',
          'hover:bg-[var(--color-ocean-50)] dark:hover:bg-teal-900/30',
          'text-[var(--color-text-secondary)] dark:text-gray-300',
          'border border-gray-300 dark:border-gray-700'
        );
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'text-sm font-medium transition-all duration-200',
        getVariantClasses()
      )}
      data-testid={testId}
     aria-label="Button">
      {action.icon}
      {action.label}
    </button>
  );
}

// Pre-configured Actions
export const commonTableActions = {
  delete: (onDelete: (items: any[]) => void): MTTableAction => ({
    id: 'delete',
    label: {t('actions.delete', 'Delete')},
    icon: <Trash className="w-4 h-4" />,
    onClick: onDelete,
    variant: 'danger',
    requiresConfirmation: true,
    confirmationMessage: 'Delete selected items?'
  }),

  export: (onExport: (items: any[]) => void): MTTableAction => ({
    id: 'export',
    label: 'Export',
    icon: <Download className="w-4 h-4" />,
    onClick: onExport,
    variant: 'default'
  }),

  duplicate: (onDuplicate: (items: any[]) => void): MTTableAction => ({
    id: 'duplicate',
    label: 'Duplicate',
    icon: <Copy className="w-4 h-4" />,
    onClick: onDuplicate,
    variant: 'default'
  }),

  archive: (onArchive: (items: any[]) => void): MTTableAction => ({
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="w-4 h-4" />,
    onClick: onArchive,
    variant: 'default',
    requiresConfirmation: true,
    confirmationMessage: 'Archive selected items?'
  }),

  star: (onStar: (items: any[]) => void): MTTableAction => ({
    id: 'star',
    label: 'Star',
    icon: <Star className="w-4 h-4" />,
    onClick: onStar,
    variant: 'default'
  })
};

// Quick Actions Menu for Row
export interface MTQuickActionsProps {
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
    divider?: boolean;
  }>;
  className?: string;
  testId?: string;
}

export function MTQuickActions({ actions, className, testId = 'mt-quick-actions' }: MTQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() = aria-label="Button"> setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-700 transition-colors"
        data-testid={testId}
      >
        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-[var(--color-surface)] dark:bg-gray-800 rounded-lg shadow-xl border border-[var(--color-border)] dark:border-gray-700 z-20">
            {actions.map((action, index) => (
              <div key={index}>
                {action.divider && index > 0 && (
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                )}
                <button
                  onClick={() = aria-label="Button"> {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-4 py-2 text-left text-sm transition-colors',
                    action.variant === 'danger'
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                      : 'text-[var(--color-text-secondary)] dark:text-gray-300 hover:bg-[var(--color-ocean-50)] dark:hover:bg-teal-900/30'
                  )}
                  data-testid={`${testId}-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {action.icon}
                  {action.label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}