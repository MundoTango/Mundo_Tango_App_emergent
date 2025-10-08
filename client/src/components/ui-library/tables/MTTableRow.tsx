// MT Ocean Table Row - Interactive Table Row Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme } from '@/styles/mt-ocean-theme';

export interface MTTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (selected: boolean) => void;
  hoverable?: boolean;
  striped?: boolean;
  index?: number;
  expandable?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  expandContent?: React.ReactNode;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }>;
  className?: string;
  testId?: string;
}

export default function MTTableRow({
  children,
  onClick,
  onEdit,
  onDelete,
  onView,
  selected = false,
  selectable = false,
  onSelect,
  hoverable = true,
  striped = false,
  index = 0,
  expandable = false,
  expanded = false,
  onExpand,
  expandContent,
  actions,
  className,
  testId = 'mt-table-row'
}: MTTableRowProps) {
  const [showActions, setShowActions] = useState(false);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(e.target.checked);
    }
  };

  const hasActions = onEdit || onDelete || onView || (actions && actions.length > 0);

  return (
    <>
      <tr
        className={cn(
          'border-t border-gray-200/50 dark:border-gray-700/50',
          striped && index % 2 === 1 && 'bg-gray-50/30 dark:bg-gray-800/30',
          hoverable && 'hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-colors duration-200',
          selected && 'bg-teal-100/40 dark:bg-teal-800/30',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        data-testid={testId}
      >
        {/* Selection Checkbox */}
        {selectable && (
          <td className="px-4 py-3 w-12">
            <input
              type="checkbox"
              checked={selected}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-teal-300 text-teal-600 focus:ring-teal-500"
              data-testid={`${testId}-checkbox`}
            />
          </td>
        )}

        {/* Expand Toggle */}
        {expandable && (
          <td className="px-2 py-3 w-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand?.();
              }}
              className="p-1 rounded hover:bg-teal-100 dark:hover:bg-teal-800/50 transition-colors"
              data-testid={`${testId}-expand`}
            >
              <svg
                className={cn(
                  'w-4 h-4 text-gray-500 transition-transform duration-200',
                  expanded && 'rotate-90'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </td>
        )}

        {/* Row Content */}
        {children}

        {/* Row Actions */}
        {hasActions && (
          <td className="px-4 py-3 text-right w-32">
            <div className={cn(
              'inline-flex items-center gap-1 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0'
            )}>
              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="View"
                  data-testid={`${testId}-view`}
                >
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-600 dark:text-gray-400" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  title="Edit"
                  data-testid={`${testId}-edit`}
                >
                  <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete"
                  data-testid={`${testId}-delete`}
                >
                  <Trash className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              )}
              {actions && actions.length > 0 && (
                <div className="relative group">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    data-testid={`${testId}-more`}
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-600 dark:text-gray-400" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        className={cn(
                          'flex items-center gap-2 w-full px-4 py-2 text-left text-sm transition-colors',
                          'hover:bg-teal-50 dark:hover:bg-teal-900/30',
                          action.variant === 'danger' && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                        )}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        )}
      </tr>

      {/* Expanded Content */}
      {expandable && expanded && expandContent && (
        <tr className="bg-gray-50/50 dark:bg-gray-800/50">
          <td colSpan={100} className="px-8 py-4">
            {expandContent}
          </td>
        </tr>
      )}
    </>
  );
}