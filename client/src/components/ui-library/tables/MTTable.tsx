// MT Ocean Table - Base Table Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTTableColumn<T = any> {
  id: string;
  header: string;
  accessor?: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface MTTableProps<T = any> {
  columns: MTTableColumn<T>[];
  data: T[];
  onSort?: (column: string, direction: 'asc' | 'desc' | null) => void;
  onFilter?: (column: string, value: any) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc' | null;
  filters?: Record<string, any>;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T, index: number) => void;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectRow?: (index: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;
  glassmorphic?: boolean;
  testId?: string;
}

export default function MTTable<T = any>({
  columns,
  data,
  onSort,
  onFilter,
  sortColumn,
  sortDirection,
  filters = {},
  loading = false,
  emptyMessage = 'No data available',
  className,
  tableClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  stickyHeader = false,
  striped = false,
  hoverable = true,
  compact = false,
  bordered = true,
  glassmorphic = true,
  testId = 'mt-table'
}: MTTableProps<T>) {
  const [localSortColumn, setLocalSortColumn] = useState(sortColumn);
  const [localSortDirection, setLocalSortDirection] = useState(sortDirection);

  const handleSort = useCallback((columnId: string) => {
    if (!columns.find(col => col.id === columnId)?.sortable) return;

    let newDirection: 'asc' | 'desc' | null = 'asc';
    
    if (localSortColumn === columnId) {
      if (localSortDirection === 'asc') newDirection = 'desc';
      else if (localSortDirection === 'desc') newDirection = null;
      else newDirection = 'asc';
    }

    setLocalSortColumn(newDirection ? columnId : undefined);
    setLocalSortDirection(newDirection);
    
    if (onSort) {
      onSort(columnId, newDirection);
    }
  }, [localSortColumn, localSortDirection, columns, onSort]);

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  }, [onSelectAll]);

  const handleSelectRow = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelectRow) {
      onSelectRow(index, e.target.checked);
    }
  }, [onSelectRow]);

  const allSelected = useMemo(() => {
    return data.length > 0 && data.every((_, index) => selectedRows.has(index));
  }, [data, selectedRows]);

  const someSelected = useMemo(() => {
    return data.some((_, index) => selectedRows.has(index)) && !allSelected;
  }, [data, selectedRows, allSelected]);

  const getCellValue = (row: T, column: MTTableColumn<T>) => {
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
      return row[column.accessor];
    }
    return null;
  };

  const containerStyles = glassmorphic
    ? applyGlassmorphism()
    : {};

  return (
    <div
      className={cn(
        'mt-table-container overflow-hidden rounded-xl',
        bordered && 'border border-teal-200/30 dark:border-teal-700/30',
        glassmorphic && 'backdrop-blur-xl',
        className
      )}
      style={containerStyles}
      data-testid={testId}
    >
      <div className={cn(
        'overflow-x-auto',
        stickyHeader && 'relative'
      )}>
        <table className={cn(
          'w-full',
          compact ? 'text-sm' : 'text-base',
          tableClassName
        )}>
          <thead
            className={cn(
              'bg-gradient-to-r from-teal-50/50 to-blue-50/50 dark:from-teal-900/30 dark:to-blue-900/30',
              stickyHeader && 'sticky top-0 z-10',
              headerClassName
            )}
          >
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    className="rounded border-[var(--color-ocean-300)] text-[var(--color-primary-hover)] focus:ring-teal-500"
                    data-testid={`${testId}-select-all`}
              aria-label="Input field"
            />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 font-semibold text-[var(--color-text-secondary)] dark:text-gray-200',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.align !== 'center' && column.align !== 'right' && 'text-left',
                    column.sortable && 'cursor-pointer hover:bg-[var(--color-ocean-100)]/30 dark:hover:bg-teal-800/30 transition-colors',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                  data-testid={`${testId}-header-${column.id}`}
                >
                  <div className="flex items-center gap-2">
                    {column.headerRender ? column.headerRender() : column.header}
                    {column.sortable && (
                      <span className="inline-flex">
                        {localSortColumn === column.id ? (
                          localSortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4 text-[var(--color-primary-hover)]" />
                          ) : localSortDirection === 'desc' ? (
                            <ChevronDown className="w-4 h-4 text-[var(--color-primary-hover)]" />
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(bodyClassName)}>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
                    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-t border-[var(--color-border)]/50 dark:border-gray-700/50',
                    striped && rowIndex % 2 === 1 && 'bg-[var(--color-surface-elevated)]/30 dark:bg-gray-800/30',
                    hoverable && 'hover:bg-[var(--color-ocean-50)]/30 dark:hover:bg-teal-900/20 transition-colors',
                    onRowClick && 'cursor-pointer',
                    typeof rowClassName === 'function' 
                      ? rowClassName(row, rowIndex)
                      : rowClassName
                  )}
                  onClick={() => onRowClick && onRowClick(row, rowIndex)}
                  data-testid={`${testId}-row-${rowIndex}`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={(e) => handleSelectRow(rowIndex, e)} aria-label="Input field"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-[var(--color-ocean-300)] text-[var(--color-primary-hover)] focus:ring-teal-500"
                        data-testid={`${testId}-select-${rowIndex}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = getCellValue(row, column);
                    return (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4',
                          compact ? 'py-2' : 'py-3',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                        data-testid={`${testId}-cell-${rowIndex}-${column.id}`}
                      >
                        {column.render ? column.render(value, row, rowIndex) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}