// MT Ocean Virtual List - High Performance Virtual Scrolling List
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTVirtualListProps<T = any> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  height: number | string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glassmorphic?: boolean;
  testId?: string;
}

interface VisibleRange {
  start: number;
  end: number;
}

export default function MTVirtualList<T = any>({
  items,
  itemHeight,
  renderItem,
  height,
  overscan = 3,
  onScroll,
  onEndReached,
  endReachedThreshold = 100,
  loading = false,
  loadingComponent,
  emptyComponent,
  headerComponent,
  footerComponent,
  className,
  containerClassName,
  glassmorphic = true,
  testId = 'mt-virtual-list'
}: MTVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({ start: 0, end: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate item positions
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index);
    }
    return itemHeight;
  }, [itemHeight]);

  const itemPositions = useCallback(() => {
    const positions: number[] = [];
    let totalHeight = 0;
    
    for (let i = 0; i < items.length; i++) {
      positions.push(totalHeight);
      totalHeight += getItemHeight(i);
    }
    
    return { positions, totalHeight };
  }, [items.length, getItemHeight]);

  const { positions, totalHeight } = itemPositions();

  // Calculate visible range
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return { start: 0, end: 0 };

    const containerTop = scrollTop;
    const containerBottom = scrollTop + containerHeight;

    let start = 0;
    let end = items.length - 1;

    // Binary search for start
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const itemTop = positions[mid];
      const itemBottom = itemTop + getItemHeight(mid);

      if (itemBottom < containerTop) {
        low = mid + 1;
      } else if (itemTop > containerTop) {
        high = mid - 1;
      } else {
        start = mid;
        break;
      }
    }
    start = Math.max(0, Math.min(low, items.length - 1) - overscan);

    // Binary search for end
    low = start;
    high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const itemTop = positions[mid];
      const itemBottom = itemTop + getItemHeight(mid);

      if (itemTop > containerBottom) {
        high = mid - 1;
      } else if (itemBottom < containerBottom) {
        low = mid + 1;
      } else {
        end = mid;
        break;
      }
    }
    end = Math.min(items.length - 1, Math.max(high, 0) + overscan);

    return { start, end };
  }, [scrollTop, containerHeight, items.length, positions, getItemHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(newScrollTop);
    }

    // Check if end reached
    if (onEndReached) {
      const scrollHeight = e.currentTarget.scrollHeight;
      const clientHeight = e.currentTarget.clientHeight;
      
      if (scrollHeight - (newScrollTop + clientHeight) < endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onScroll, onEndReached, endReachedThreshold]);

  // Update visible range when scroll changes
  useEffect(() => {
    const newRange = calculateVisibleRange();
    setVisibleRange(newRange);
  }, [calculateVisibleRange]);

  // Update container height on resize
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    return () => window.removeEventListener('resize', updateContainerHeight);
  }, []);

  // Render visible items
  const visibleItems = [];
  for (let i = visibleRange.start; i <= visibleRange.end && i < items.length; i++) {
    const item = items[i];
    const style: React.CSSProperties = {
      position: 'absolute',
      top: positions[i],
      left: 0,
      right: 0,
      height: getItemHeight(i)
    };
    
    visibleItems.push(
      <div key={i} style={style}>
        {renderItem(item, i, style)}
      </div>
    );
  }

  const containerStyles = glassmorphic ? applyGlassmorphism() : {};

  return (
    <div
      className={cn(
        'mt-virtual-list-container',
        glassmorphic && 'backdrop-blur-xl rounded-xl border border-teal-200/30 dark:border-teal-700/30',
        containerClassName
      )}
      style={{ ...containerStyles, height }}
      data-testid={testId}
    >
      {headerComponent}
      
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-auto',
          'scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-800',
          className
        )}
        onScroll={handleScroll}
        style={{ height: '100%' }}
      >
        {/* Virtual spacer to maintain scroll height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {items.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full">
              {emptyComponent || (
                <p className="text-gray-500">No items to display</p>
              )}
            </div>
          ) : (
            visibleItems
          )}
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            {loadingComponent || (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full" />
                <span className="text-gray-500">Loading more...</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {footerComponent}
    </div>
  );
}

// Memoized List Item Component for performance
export const VirtualListItem = memo(({ 
  children, 
  style,
  className
}: { 
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => {
  return (
    <div 
      style={style}
      className={cn(
        'px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50',
        'hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
});

VirtualListItem.displayName = 'VirtualListItem';

// Hook for dynamic height calculation
export function useDynamicHeights<T>(
  items: T[],
  estimatedHeight: number = 50
) {
  const heightsRef = useRef<Map<number, number>>(new Map());
  const [heights, setHeights] = useState<Map<number, number>>(new Map());

  const setItemHeight = useCallback((index: number, height: number) => {
    if (heightsRef.current.get(index) !== height) {
      heightsRef.current.set(index, height);
      setHeights(new Map(heightsRef.current));
    }
  }, []);

  const getItemHeight = useCallback((index: number) => {
    return heights.get(index) || estimatedHeight;
  }, [heights, estimatedHeight]);

  const measuredHeights = useCallback(() => {
    const positions: number[] = [];
    let totalHeight = 0;
    
    for (let i = 0; i < items.length; i++) {
      positions.push(totalHeight);
      totalHeight += getItemHeight(i);
    }
    
    return { positions, totalHeight };
  }, [items.length, getItemHeight]);

  return {
    getItemHeight,
    setItemHeight,
    measuredHeights
  };
}