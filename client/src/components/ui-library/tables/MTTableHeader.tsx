// MT Ocean Table Header - Sortable Column Headers
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { ChevronUp, ChevronDown, ChevronsUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme } from '@/styles/mt-ocean-theme';

export interface MTTableHeaderProps {
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
  onFilter?: () => void;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  className?: string;
  children?: React.ReactNode;
  resizable?: boolean;
  onResize?: (width: number) => void;
  testId?: string;
}

export default function MTTableHeader({
  header,
  sortable = false,
  filterable = false,
  sorted = null,
  onSort,
  onFilter,
  align = 'left',
  width,
  className,
  children,
  resizable = false,
  onResize,
  testId = 'mt-table-header'
}: MTTableHeaderProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !onResize) return;
    
    const startX = e.clientX;
    const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
      onResize(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <th
      className={cn(
        'relative px-4 py-3 font-semibold text-gray-700 dark:text-gray-200',
        'bg-gradient-to-r from-teal-50/50 to-blue-50/50 dark:from-teal-900/30 dark:to-blue-900/30',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        align === 'left' && 'text-left',
        sortable && 'cursor-pointer select-none',
        sortable && 'hover:bg-teal-100/50 dark:hover:bg-teal-800/30 transition-colors',
        className
      )}
      style={{ width }}
      onClick={sortable ? onSort : undefined}
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        {children || (
          <>
            <span className="flex-1">{header}</span>
            
            {/* Sort Indicator */}
            {sortable && (
              <span className="inline-flex shrink-0">
                {sorted === 'asc' ? (
                  <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : sorted === 'desc' ? (
                  <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : (
                  <ChevronsUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
              </span>
            )}
            
            {/* Filter Indicator */}
            {filterable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFilter?.();
                }}
                className="inline-flex shrink-0 p-1 rounded hover:bg-teal-200/50 dark:hover:bg-teal-700/50 transition-colors"
                data-testid={`${testId}-filter`}
              >
                <Filter className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Resize Handle */}
      {resizable && (
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-teal-400/50 transition-colors"
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </th>
  );
}