// MT Ocean Data Table - Advanced Data Table with Pagination
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Download, Filter, Settings, RefreshCw } from 'lucide-react';
import MTTable, { MTTableColumn } from './MTTable';
import MTTablePagination from './MTTablePagination';
import MTTableFilter from './MTTableFilter';
import { cn } from '@/lib/utils';
import { MTOceanTheme } from '@/styles/mt-ocean-theme';

export interface MTDataTableProps<T = any> {
  columns: MTTableColumn<T>[];
  data: T[];
  pageSize?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  exportable?: boolean;
  onExport?: (format: 'csv' | 'json') => void;
  refreshable?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  headerActions?: boolean;
  bulkActions?: React.ReactNode;
  selectedRows?: Set<number>;
  onSelectRow?: (index: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  columnFilters?: Record<string, any>;
  onColumnFilter?: (column: string, value: any) => void;
  serverSide?: boolean;
  testId?: string;
}

export default function MTDataTable<T = any>({
  columns,
  data,
  pageSize = 10,
  totalItems,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  exportable = false,
  onExport,
  refreshable = false,
  onRefresh,
  loading = false,
  title,
  description,
  actions,
  className,
  tableClassName,
  headerActions = true,
  bulkActions,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  columnFilters = {},
  onColumnFilter,
  serverSide = false,
  testId = 'mt-data-table'
}: MTDataTableProps<T>) {
  const [localPage, setLocalPage] = useState(currentPage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(columnFilters);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.id))
  );

  // Calculate pagination
  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    
    let filteredData = [...data];
    
    // Apply search
    if (searchQuery && !serverSide) {
      filteredData = filteredData.filter(row => {
        return columns.some(column => {
          if (column.accessor) {
            const value = typeof column.accessor === 'function' 
              ? column.accessor(row)
              : row[column.accessor as keyof T];
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        });
      });
    }
    
    // Apply filters
    if (!serverSide) {
      Object.entries(localFilters).forEach(([columnId, filterValue]) => {
        if (filterValue !== undefined && filterValue !== '') {
          const column = columns.find(col => col.id === columnId);
          if (column && column.accessor) {
            filteredData = filteredData.filter(row => {
              const value = typeof column.accessor === 'function'
                ? column.accessor(row)
                : row[column.accessor as keyof T];
              return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            });
          }
        }
      });
    }
    
    // Apply sorting
    if (sortColumn && sortDirection && !serverSide) {
      const column = columns.find(col => col.id === sortColumn);
      if (column && column.accessor) {
        filteredData.sort((a, b) => {
          const aValue = typeof column.accessor === 'function'
            ? column.accessor(a)
            : a[column.accessor as keyof T];
          const bValue = typeof column.accessor === 'function'
            ? column.accessor(b)
            : b[column.accessor as keyof T];
          
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    
    // Apply pagination
    const startIndex = (localPage - 1) * localPageSize;
    const endIndex = startIndex + localPageSize;
    
    return {
      items: filteredData.slice(startIndex, endIndex),
      total: filteredData.length
    };
  }, [data, localPage, localPageSize, searchQuery, sortColumn, sortDirection, localFilters, columns, serverSide]);

  const handlePageChange = useCallback((page: number) => {
    setLocalPage(page);
    if (onPageChange) onPageChange(page);
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    setLocalPageSize(size);
    setLocalPage(1);
    if (onPageSizeChange) onPageSizeChange(size);
  }, [onPageSizeChange]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setLocalPage(1);
    if (onSearch) onSearch(query);
  }, [onSearch]);

  const handleSort = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    setSortColumn(direction ? column : undefined);
    setSortDirection(direction);
  }, []);

  const handleColumnFilter = useCallback((column: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [column]: value
    }));
    if (onColumnFilter) onColumnFilter(column, value);
  }, [onColumnFilter]);

  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export implementation
      const exportData = serverSide ? data : paginatedData.items;
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-export-${Date.now()}.json`;
        a.click();
      } else if (format === 'csv') {
        // Simple CSV export
        const headers = columns.filter(col => visibleColumns.has(col.id)).map(col => col.header).join(',');
        const rows = exportData.map(row => 
          columns.filter(col => visibleColumns.has(col.id)).map(col => {
            if (col.accessor) {
              const value = typeof col.accessor === 'function'
                ? col.accessor(row)
                : row[col.accessor as keyof T];
              return `"${String(value).replace(/"/g, '""')}"`;
            }
            return '""';
          }).join(',')
        ).join('\n');
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-export-${Date.now()}.csv`;
        a.click();
      }
    }
  }, [onExport, data, paginatedData, columns, serverSide, visibleColumns]);

  const visibleColumnsArray = useMemo(() => 
    columns.filter(col => visibleColumns.has(col.id)),
    [columns, visibleColumns]
  );

  const hasSelectedRows = selectedRows.size > 0;

  return (
    <div className={cn('mt-data-table-container space-y-4', className)} data-testid={testId}>
      {/* Header */}
      {(title || description || headerActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
          <div>
            {title && (
              <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-blue-800 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg',
                'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md',
                'border border-teal-200/50 dark:border-teal-700/50',
                'focus:border-teal-400 dark:focus:border-teal-500',
                'focus:ring-2 focus:ring-teal-400/20',
                'transition-all duration-300'
              )}
              data-testid={`${testId}-search`}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {hasSelectedRows && bulkActions && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-50/50 dark:bg-teal-900/20 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRows.size} selected
            </span>
            {bulkActions}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Filters */}
          {columns.some(col => col.filterable) && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'px-3 py-2 rounded-lg border transition-all duration-300',
                showFilters
                  ? 'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-teal-300'
              )}
              data-testid={`${testId}-filter-toggle`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}

          {/* Column Settings */}
          <button
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-teal-300 transition-all duration-300"
            data-testid={`${testId}-settings`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Export */}
          {exportable && (
            <div className="relative group">
              <button
                className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-teal-300 transition-all duration-300"
                data-testid={`${testId}-export`}
              >
                <Download className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-teal-50 dark:hover:bg-teal-900/30"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-teal-50 dark:hover:bg-teal-900/30"
                >
                  Export JSON
                </button>
              </div>
            </div>
          )}

          {/* Refresh */}
          {refreshable && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={cn(
                'px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-teal-300 transition-all duration-300',
                loading && 'opacity-50 cursor-not-allowed'
              )}
              data-testid={`${testId}-refresh`}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <MTTableFilter
          columns={columns.filter(col => col.filterable)}
          filters={localFilters}
          onFilterChange={handleColumnFilter}
        />
      )}

      {/* Table */}
      <MTTable
        columns={visibleColumnsArray}
        data={serverSide ? data : paginatedData.items}
        loading={loading}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        selectable={!!onSelectRow}
        selectedRows={selectedRows}
        onSelectRow={onSelectRow}
        onSelectAll={onSelectAll}
        stickyHeader
        hoverable
        striped
        glassmorphic
        tableClassName={tableClassName}
      />

      {/* Pagination */}
      <MTTablePagination
        currentPage={localPage}
        pageSize={localPageSize}
        totalItems={serverSide ? (totalItems || 0) : paginatedData.total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20, 50, 100]}
      />
    </div>
  );
}