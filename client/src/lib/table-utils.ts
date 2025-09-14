// MT Ocean Table & List Utilities
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { MTTableColumn } from '@/components/ui-library/tables/MTTable';

// Sorting Types & Functions
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

export function sortData<T extends Record<string, any>>(
  data: T[],
  sortConfig: SortConfig | null
): T[] {
  if (!sortConfig || !sortConfig.direction) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.column);
    const bValue = getNestedValue(b, sortConfig.column);

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
}

// Filtering Types & Functions
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 
  'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn';

export interface FilterConfig {
  column: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operator
}

export function filterData<T extends Record<string, any>>(
  data: T[],
  filters: FilterConfig[]
): T[] {
  if (!filters || filters.length === 0) {
    return data;
  }

  return data.filter(item => {
    return filters.every(filter => {
      const itemValue = getNestedValue(item, filter.column);
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'equals':
          return itemValue === filterValue;
        
        case 'contains':
          return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
        
        case 'startsWith':
          return String(itemValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
        
        case 'endsWith':
          return String(itemValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
        
        case 'greaterThan':
          return itemValue > filterValue;
        
        case 'lessThan':
          return itemValue < filterValue;
        
        case 'between':
          return itemValue >= filterValue && itemValue <= filter.value2;
        
        case 'in':
          return Array.isArray(filterValue) && filterValue.includes(itemValue);
        
        case 'notIn':
          return Array.isArray(filterValue) && !filterValue.includes(itemValue);
        
        default:
          return true;
      }
    });
  });
}

// Search Functions
export function searchData<T extends Record<string, any>>(
  data: T[],
  searchQuery: string,
  searchColumns?: string[]
): T[] {
  if (!searchQuery) {
    return data;
  }

  const query = searchQuery.toLowerCase();

  return data.filter(item => {
    if (searchColumns && searchColumns.length > 0) {
      return searchColumns.some(column => {
        const value = getNestedValue(item, column);
        return String(value).toLowerCase().includes(query);
      });
    } else {
      // Search all string values if no columns specified
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(query)
      );
    }
  });
}

// Pagination Functions
export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationResult {
  startIndex: number;
  endIndex: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageNumbers: number[];
}

export function calculatePagination(config: PaginationConfig): PaginationResult {
  const { currentPage, pageSize, totalItems } = config;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Generate page numbers for pagination UI
  const pageNumbers: number[] = [];
  const maxVisiblePages = 7;
  const halfVisible = Math.floor(maxVisiblePages / 2);
  
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return {
    startIndex,
    endIndex,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
    pageNumbers
  };
}

export function paginateData<T>(
  data: T[],
  currentPage: number,
  pageSize: number
): T[] {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

// Export Functions
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: MTTableColumn<T>[],
  filename: string = 'export.csv'
): void {
  if (data.length === 0) return;

  // Create CSV header
  const headers = columns
    .filter(col => !col.hidden)
    .map(col => `"${col.header}"`);
  
  // Create CSV rows
  const rows = data.map(item => {
    return columns
      .filter(col => !col.hidden)
      .map(col => {
        let value = col.accessor ? getNestedValue(item, col.accessor as string) : '';
        
        if (col.cell) {
          const cellResult = col.cell(value, item, 0);
          value = typeof cellResult === 'string' ? cellResult : String(value);
        }
        
        // Escape quotes and wrap in quotes
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      });
  });

  // Combine header and rows
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON<T>(
  data: T[],
  filename: string = 'export.json'
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Column Configuration
export interface ColumnConfig<T> {
  id: string;
  visible: boolean;
  order: number;
  width?: number;
  pinned?: 'left' | 'right' | null;
}

export function applyColumnConfig<T>(
  columns: MTTableColumn<T>[],
  config: Record<string, ColumnConfig<T>>
): MTTableColumn<T>[] {
  return columns
    .map(column => {
      const colConfig = config[column.id];
      if (!colConfig) return column;

      return {
        ...column,
        hidden: !colConfig.visible,
        width: colConfig.width,
        pinned: colConfig.pinned
      };
    })
    .sort((a, b) => {
      const aOrder = config[a.id]?.order ?? 999;
      const bOrder = config[b.id]?.order ?? 999;
      return aOrder - bOrder;
    });
}

// Bulk Actions
export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (selectedItems: T[]) => void | Promise<void>;
  variant?: 'default' | 'danger' | 'warning';
  requireConfirm?: boolean;
}

export function executeBulkAction<T>(
  action: BulkAction<T>,
  selectedItems: T[],
  onComplete?: () => void
): void {
  if (action.requireConfirm) {
    const confirmed = window.confirm(
      `Are you sure you want to ${action.label.toLowerCase()} ${selectedItems.length} items?`
    );
    if (!confirmed) return;
  }

  const result = action.action(selectedItems);
  
  if (result instanceof Promise) {
    result.then(() => {
      if (onComplete) onComplete();
    });
  } else {
    if (onComplete) onComplete();
  }
}

// Utility Functions
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined) return null;
    value = value[key];
  }
  
  return value;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Format utilities for table cells
export const formatters = {
  currency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  },

  date: (value: Date | string, format: 'short' | 'long' = 'short'): string => {
    const date = value instanceof Date ? value : new Date(value);
    return format === 'short'
      ? date.toLocaleDateString()
      : date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
  },

  percentage: (value: number, decimals: number = 0): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  number: (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  boolean: (value: boolean): string => {
    return value ? 'Yes' : 'No';
  },

  fileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
};