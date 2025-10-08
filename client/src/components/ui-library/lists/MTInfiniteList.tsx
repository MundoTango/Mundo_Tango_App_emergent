// MT Ocean Infinite List - Infinite Scrolling List Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTInfiniteListProps<T = any> {
  loadMore: (page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  initialItems?: T[];
  pageSize?: number;
  threshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
  containerClassName?: string;
  itemClassName?: string;
  glassmorphic?: boolean;
  useIntersectionObserver?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  testId?: string;
}

export default function MTInfiniteList<T = any>({
  loadMore,
  renderItem,
  initialItems = [],
  pageSize = 20,
  threshold = 100,
  loading: externalLoading = false,
  loadingComponent,
  emptyComponent,
  errorComponent,
  headerComponent,
  footerComponent,
  onItemClick,
  keyExtractor = (item, index) => index,
  className,
  containerClassName,
  itemClassName,
  glassmorphic = true,
  useIntersectionObserver = true,
  retryOnError = true,
  maxRetries = 3,
  testId = 'mt-infinite-list'
}: MTInfiniteListProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (loadingRef.current || !hasMore || error) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadMore(page);
      
      setItems(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
      setRetryCount(0);
    } catch (err) {
      setError(err as Error);
      if (retryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadMoreItems(), 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, hasMore, error, loadMore, retryOnError, retryCount, maxRetries]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!useIntersectionObserver || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreItems();
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.current);
    
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading, loadMoreItems, threshold, useIntersectionObserver]);

  // Manual scroll detection (fallback)
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (useIntersectionObserver) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - (scrollTop + clientHeight) < threshold && hasMore && !loading) {
      loadMoreItems();
    }
  }, [hasMore, loading, loadMoreItems, threshold, useIntersectionObserver]);

  // Load initial items
  useEffect(() => {
    if (initialItems.length === 0 && items.length === 0) {
      loadMoreItems();
    }
  }, []);

  // Retry on error
  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    loadMoreItems();
  };

  const containerStyles = glassmorphic ? applyGlassmorphism() : {};

  const renderContent = () => {
    if (items.length === 0 && !loading && !error) {
      return (
        <div className="flex items-center justify-center py-12">
          {emptyComponent || (
            <p className="text-gray-500">No items to display</p>
          )}
        </div>
      );
    }

    return (
      <>
        {items.map((item, index) => {
          const key = keyExtractor(item, index);
          return (
            <div
              key={key}
              className={cn(
                'border-b border-gray-200/50 dark:border-gray-700/50',
                'hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-colors',
                onItemClick && 'cursor-pointer',
                itemClassName
              )}
              onClick={() => onItemClick?.(item, index)}
              data-testid={`${testId}-item-${key}`}
             role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); () => onItemClick?.(item, index)(e); } }}>
              {renderItem(item, index)}
            </div>
          );
        })}
        
        {/* Loading indicator */}
        {(loading || externalLoading) && (
          <div className="flex items-center justify-center py-4">
            {loadingComponent || <DefaultLoadingComponent />}
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {errorComponent || (
              <DefaultErrorComponent 
                error={error} 
                onRetry={handleRetry}
                retryCount={retryCount}
                maxRetries={maxRetries}
              />
            )}
          </div>
        )}
        
        {/* Intersection Observer Sentinel */}
        {hasMore && !error && (
          <div 
            ref={sentinelRef} 
            className="h-1"
            data-testid={`${testId}-sentinel`}
          />
        )}
        
        {/* End of list indicator */}
        {!hasMore && items.length > 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No more items to load
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={cn(
        'mt-infinite-list-container',
        glassmorphic && 'backdrop-blur-xl rounded-xl border border-teal-200/30 dark:border-teal-700/30',
        containerClassName
      )}
      style={containerStyles}
      data-testid={testId}
    >
      {headerComponent}
      
      <div
        ref={containerRef}
        className={cn(
          'overflow-auto',
          'scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-800',
          className
        )}
        onScroll={handleScroll}
      >
        {renderContent()}
      </div>
      
      {footerComponent}
    </div>
  );
}

// Default Loading Component
function DefaultLoadingComponent() {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-ocean-500" />
      <span className="text-gray-500">Loading more...</span>
    </div>
  );
}

// Default Error Component
interface DefaultErrorComponentProps {
  error: Error;
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
}

function DefaultErrorComponent({ 
  error, 
  onRetry, 
  retryCount, 
  maxRetries 
}: DefaultErrorComponentProps) {
  return (
    <>
      <div className="text-red-500 mb-2">
        {error.message || 'Failed to load items'}
      </div>
      {retryCount < maxRetries && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-ocean-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
          Retry ({retryCount}/{maxRetries})
        </button>
      )}
    </>
  );
}

// Hook for infinite list management
export function useInfiniteListState<T>(
  initialItems: T[] = []
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setPage(1);
    setLoading(false);
    setError(null);
  }, []);

  const append = useCallback((newItems: T[]) => {
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const prepend = useCallback((newItems: T[]) => {
    setItems(prev => [...newItems, ...prev]);
  }, []);

  const remove = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item)));
  }, []);

  const update = useCallback((predicate: (item: T) => boolean, updater: (item: T) => T) => {
    setItems(prev => prev.map(item => predicate(item) ? updater(item) : item));
  }, []);

  return {
    items,
    hasMore,
    page,
    loading,
    error,
    setItems,
    setHasMore,
    setPage,
    setLoading,
    setError,
    reset,
    append,
    prepend,
    remove,
    update
  };
}