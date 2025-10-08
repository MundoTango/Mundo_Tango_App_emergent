// MT Ocean Table Filter - Column Filtering Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState } from 'react';
import { X, Calendar, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme } from '@/styles/mt-ocean-theme';
import { MTTableColumn } from './MTTable';

export interface MTTableFilterProps {
  columns: MTTableColumn[];
  filters: Record<string, any>;
  onFilterChange: (column: string, value: any) => void;
  onClearFilters?: () => void;
  className?: string;
  testId?: string;
}

export default function MTTableFilter({
  columns,
  filters,
  onFilterChange,
  onClearFilters,
  className,
  testId = 'mt-table-filter'
}: MTTableFilterProps) {
  const [activeFilters, setActiveFilters] = useState(filters);

  const handleFilterChange = (columnId: string, value: any) => {
    const newFilters = { ...activeFilters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[columnId];
    } else {
      newFilters[columnId] = value;
    }
    
    setActiveFilters(newFilters);
    onFilterChange(columnId, value);
  };

  const handleClearAll = () => {
    setActiveFilters({});
    if (onClearFilters) {
      onClearFilters();
    } else {
      columns.forEach(col => {
        if (col.filterable) {
          onFilterChange(col.id, '');
        }
      });
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const filterableColumns = columns.filter(col => col.filterable);

  if (filterableColumns.length === 0) return null;

  return (
    <div
      className={cn(
        'p-4 bg-gradient-to-r from-teal-50/30 to-blue-50/30 dark:from-teal-900/20 dark:to-blue-900/20',
        'rounded-xl border border-teal-200/30 dark:border-teal-700/30',
        'backdrop-blur-sm',
        className
      )}
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] dark:text-gray-300">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            data-testid={`${testId}-clear-all`}
           aria-label="Button">
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filterableColumns.map(column => (
          <div key={column.id} className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {column.header}
            </label>
            <div className="relative">
              <FilterInput
                columnId={column.id}
                value={activeFilters[column.id] || ''}
                onChange={(value) => handleFilterChange(column.id, value)}
                testId={`${testId}-${column.id}`}
              />
              {activeFilters[column.id] && (
                <button
                  onClick={() => handleFilterChange(column.id, '')} aria-label="Button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  data-testid={`${testId}-${column.id}-clear`}
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([columnId, value]) => {
            const column = columns.find(col => col.id === columnId);
            if (!column) return null;
            
            return (
              <div
                key={columnId}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-ocean-100)] dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full text-sm"
              >
                <span className="font-medium">{column.header}:</span>
                <span>{String(value)}</span>
                <button
                  onClick={() => handleFilterChange(columnId, '')} aria-label="Button"
                  className="ml-1 p-0.5 hover:bg-teal-200 dark:hover:bg-teal-800 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Filter Input Component
interface FilterInputProps {
  columnId: string;
  value: any;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: Array<{ label: string; value: any }>;
  testId?: string;
}

function FilterInput({
  columnId,
  value,
  onChange,
  type = 'text',
  options = [],
  testId
}: FilterInputProps) {
  const inputClass = cn(
    'w-full px-3 py-1.5 text-sm rounded-lg',
    'bg-[var(--color-surface)] dark:bg-gray-800',
    'border border-gray-300 dark:border-gray-700',
    'focus:border-teal-400 dark:focus:border-[var(--color-primary)]',
    'focus:ring-2 focus:ring-teal-400/20',
    'transition-all duration-200'
  );

  switch (type) {
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          data-testid={testId}
        >
          <option value="">All</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)} aria-label="Input field"
          className={inputClass}
          data-testid={testId}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)} aria-label="Input field"
          placeholder="Filter..."
          className={inputClass}
          data-testid={testId}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)} aria-label="Input field"
          placeholder="Filter..."
          className={inputClass}
          data-testid={testId}
        />
      );
  }
}