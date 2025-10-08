// MT Ocean Table Pagination - Pagination Controls
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme } from '@/styles/mt-ocean-theme';

export interface MTTablePaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showPageNumbers?: boolean;
  showTotalItems?: boolean;
  maxPageButtons?: number;
  className?: string;
  compact?: boolean;
  testId?: string;
}

export default function MTTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  showPageNumbers = true,
  showTotalItems = true,
  maxPageButtons = 5,
  className,
  compact = false,
  testId = 'mt-table-pagination'
}: MTTablePaginationProps) {
  const calculatedTotalPages = totalPages || Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (calculatedTotalPages <= maxPageButtons) {
      // Show all pages if total is less than max
      for (let i = 1; i <= calculatedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      const halfRange = Math.floor((maxPageButtons - 3) / 2);
      let start = Math.max(2, currentPage - halfRange);
      let end = Math.min(calculatedTotalPages - 1, currentPage + halfRange);
      
      // Adjust range if at boundaries
      if (currentPage <= halfRange + 2) {
        end = maxPageButtons - 2;
      } else if (currentPage >= calculatedTotalPages - halfRange - 1) {
        start = calculatedTotalPages - maxPageButtons + 3;
      }
      
      // Add ellipsis if needed
      if (start > 2) pages.push('...');
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < calculatedTotalPages - 1) pages.push('...');
      
      // Always show last page
      pages.push(calculatedTotalPages);
    }
    
    return pages;
  };

  const PaginationButton = ({ 
    page, 
    disabled = false,
    children,
    variant = 'default'
  }: { 
    page?: number;
    disabled?: boolean;
    children: React.ReactNode;
    variant?: 'default' | 'active' | 'icon';
  }) => {
    const isActive = variant === 'active' || page === currentPage;
    
    return (
      <button
        onClick={() => page && onPageChange(page)} aria-label="Button"
        disabled={disabled}
        className={cn(
          'transition-all duration-200',
          compact ? 'px-2 py-1 text-sm' : 'px-3 py-2',
          variant === 'icon' && 'p-2',
          isActive
            ? 'bg-gradient-to-r from-[var(--color-ocean-400)] to-[var(--color-ocean-600)] text-white shadow-md'
            : 'bg-[var(--color-surface)] dark:bg-gray-800 text-[var(--color-text-secondary)] dark:text-gray-300 hover:bg-[var(--color-ocean-50)] dark:hover:bg-teal-900/30',
          'border border-gray-300 dark:border-gray-700',
          disabled && 'opacity-50 cursor-not-allowed hover:bg-[var(--color-surface)] dark:hover:bg-gray-800',
          'rounded-lg'
        )}
        data-testid={`${testId}-page-${page || variant}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-4',
      compact ? 'text-sm' : 'text-base',
      className
    )} data-testid={testId}>
      {/* Left side - Items info and page size */}
      <div className="flex items-center gap-4">
        {showTotalItems && (
          <span className="text-gray-600 dark:text-gray-400">
            {totalItems === 0 ? (
              'No items'
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-[var(--color-text)] dark:text-gray-100">
                  {startItem}-{endItem}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-[var(--color-text)] dark:text-gray-100">
                  {totalItems}
                </span>
              </>
            )}
          </span>
        )}
        
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-gray-600 dark:text-gray-400">
              Rows:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={cn(
                'rounded-lg border border-gray-300 dark:border-gray-700',
                'bg-[var(--color-surface)] dark:bg-gray-800',
                'text-[var(--color-text-secondary)] dark:text-gray-300',
                'focus:border-teal-400 dark:focus:border-[var(--color-primary)]',
                'focus:ring-2 focus:ring-teal-400/20',
                compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'
              )}
              data-testid={`${testId}-page-size`}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <PaginationButton
          page={1}
          disabled={currentPage === 1}
          variant="icon"
        >
          <ChevronsLeft className="w-4 h-4" />
        </PaginationButton>

        {/* Previous page */}
        <PaginationButton
          page={Math.max(1, currentPage - 1)}
          disabled={currentPage === 1}
          variant="icon"
        >
          <ChevronLeft className="w-4 h-4" />
        </PaginationButton>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <PaginationButton
                  key={page}
                  page={page as number}
                  variant={page === currentPage ? 'active' : 'default'}
                >
                  {page}
                </PaginationButton>
              )
            ))}
          </div>
        )}

        {/* Mobile page indicator */}
        <div className="flex sm:hidden items-center px-3 py-2 bg-[var(--color-surface)] dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
          <span className="text-[var(--color-text-secondary)] dark:text-gray-300">
            {currentPage} / {calculatedTotalPages}
          </span>
        </div>

        {/* Next page */}
        <PaginationButton
          page={Math.min(calculatedTotalPages, currentPage + 1)}
          disabled={currentPage === calculatedTotalPages}
          variant="icon"
        >
          <ChevronRight className="w-4 h-4" />
        </PaginationButton>

        {/* Last page */}
        <PaginationButton
          page={calculatedTotalPages}
          disabled={currentPage === calculatedTotalPages}
          variant="icon"
        >
          <ChevronsRight className="w-4 h-4" />
        </PaginationButton>
      </div>
    </div>
  );
}