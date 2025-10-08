// MT Ocean Grid List - Responsive Grid Layout Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState, useMemo } from 'react';
import { Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTGridListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  actions?: React.ReactNode;
  metadata?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export interface MTGridListProps {
  items: MTGridListItem[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto';
  gap?: 'sm' | 'md' | 'lg';
  cardVariant?: 'default' | 'compact' | 'media' | 'detailed';
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | 'auto';
  viewMode?: 'grid' | 'list';
  allowViewModeToggle?: boolean;
  onItemClick?: (item: MTGridListItem, index: number) => void;
  selectable?: boolean;
  selectedItems?: Set<string | number>;
  onSelectItem?: (itemId: string | number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  loading?: boolean;
  loadingItems?: number;
  emptyMessage?: string;
  renderCard?: (item: MTGridListItem, index: number) => React.ReactNode;
  className?: string;
  containerClassName?: string;
  cardClassName?: string | ((item: MTGridListItem, index: number) => string);
  glassmorphic?: boolean;
  testId?: string;
}

export default function MTGridList({
  items,
  columns = 'auto',
  gap = 'md',
  cardVariant = 'default',
  aspectRatio = 'auto',
  viewMode: initialViewMode = 'grid',
  allowViewModeToggle = true,
  onItemClick,
  selectable = false,
  selectedItems = new Set(),
  onSelectItem,
  onSelectAll,
  loading = false,
  loadingItems = 6,
  emptyMessage = 'No items to display',
  renderCard,
  className,
  containerClassName,
  cardClassName,
  glassmorphic = true,
  testId = 'mt-grid-list'
}: MTGridListProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [localSelectedItems, setLocalSelectedItems] = useState(selectedItems);

  const handleSelectItem = (itemId: string | number) => {
    if (onSelectItem) {
      onSelectItem(itemId, !localSelectedItems.has(itemId));
    } else {
      const newSelected = new Set(localSelectedItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      setLocalSelectedItems(newSelected);
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(localSelectedItems.size !== items.length);
    } else {
      if (localSelectedItems.size === items.length) {
        setLocalSelectedItems(new Set());
      } else {
        setLocalSelectedItems(new Set(items.map(item => item.id)));
      }
    }
  };

  const getGridColumns = () => {
    if (columns === 'auto') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
    const columnMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
    };
    return columnMap[columns] || columnMap[3];
  };

  const getGapClass = () => {
    const gapMap = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    };
    return gapMap[gap];
  };

  const getAspectRatioClass = () => {
    const aspectMap = {
      square: 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
      'auto': ''
    };
    return aspectMap[aspectRatio];
  };

  const containerStyles = glassmorphic ? applyGlassmorphism() : {};

  const renderGridCard = (item: MTGridListItem, index: number) => {
    if (renderCard) {
      return renderCard(item, index);
    }

    const isSelected = localSelectedItems.has(item.id);
    const cardClass = typeof cardClassName === 'function' 
      ? cardClassName(item, index) 
      : cardClassName;

    return (
      <div
        key={item.id}
        className={cn(
          'group relative overflow-hidden rounded-xl',
          'bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50',
          'hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
          isSelected && 'ring-2 ring-teal-400 bg-teal-50/20 dark:bg-teal-900/20',
          item.disabled && 'opacity-50 cursor-not-allowed',
          !item.disabled && (item.onClick || onItemClick) && 'cursor-pointer',
          cardClass
        )}
        onClick={() => {
          if (item.disabled) return;
          if (item.onClick) item.onClick();
          else if (onItemClick) onItemClick(item, index);
        }}
        data-testid={`${testId}-card-${item.id}`}
       role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); () => {
          if (item.disabled) return;
          if (item.onClick) item.onClick();
          else if (onItemClick) onItemClick(item, index, e) }}>
        {/* Selection Checkbox */}
        {selectable && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectItem(item.id);
              }}
              className="rounded border-white/50 bg-white/90 text-teal-600 focus:ring-teal-500"
              data-testid={`${testId}-select-${item.id}`}
            />
          </div>
        )}

        {/* Image */}
        {item.image && (
          <div className={cn('overflow-hidden', getAspectRatioClass())}>
            <img
              src={item.image}
              alt={item.imageAlt || item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {item.badge && (
              <div className="absolute top-2 right-2">
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm',
                  item.badgeVariant === 'primary' && 'bg-teal-100/90 text-teal-800',
                  item.badgeVariant === 'success' && 'bg-green-100/90 text-green-800',
                  item.badgeVariant === 'warning' && 'bg-yellow-100/90 text-yellow-800',
                  item.badgeVariant === 'error' && 'bg-red-100/90 text-red-800',
                  (!item.badgeVariant || item.badgeVariant === 'default') && 'bg-gray-100/90 text-gray-800'
                )}>
                  {item.badge}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'p-4',
          cardVariant === 'compact' && 'p-3',
          cardVariant === 'detailed' && 'p-5'
        )}>
          <h3 className={cn(
            'font-semibold text-gray-900 dark:text-gray-100',
            cardVariant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {item.title}
          </h3>
          
          {item.subtitle && (
            <p className={cn(
              'text-gray-600 dark:text-gray-600 dark:text-gray-400 mt-1',
              cardVariant === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {item.subtitle}
            </p>
          )}
          
          {item.description && cardVariant !== 'compact' && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-3">
              {item.description}
            </p>
          )}
          
          {/* Metadata */}
          {item.metadata && item.metadata.length > 0 && cardVariant !== 'compact' && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              {item.metadata.map((meta, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                  {meta.icon}
                  <span>{meta.label}:</span>
                  <span className="font-medium">{meta.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Actions */}
          {item.actions && (
            <div className="mt-3" onClick={(e) => e.stopPropagation()} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e) => e.stopPropagation()(e); } }}>
              {item.actions}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'mt-grid-list-container',
        glassmorphic && 'backdrop-blur-xl rounded-xl border border-teal-200/30 dark:border-teal-700/30 p-4',
        containerClassName
      )}
      style={containerStyles}
      data-testid={testId}
    >
      {/* Header Controls */}
      {(allowViewModeToggle || selectable) && (
        <div className="flex items-center justify-between mb-4">
          {selectable && items.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSelectedItems.size === items.length}
                indeterminate={localSelectedItems.size > 0 && localSelectedItems.size < items.length}
                onChange={handleSelectAll}
                className="rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                data-testid={`${testId}-select-all`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                Select all ({localSelectedItems.size}/{items.length})
              </span>
            </label>
          )}
          
          {allowViewModeToggle && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid'
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                data-testid={`${testId}-view-grid`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list'
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                data-testid={`${testId}-view-list`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={cn(
          viewMode === 'grid' ? `grid ${getGridColumns()} ${getGapClass()}` : 'space-y-2'
        )}>
          {Array.from({ length: loadingItems }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
              style={{ height: aspectRatio === 'auto' ? '200px' : undefined }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {emptyMessage}
        </div>
      ) : viewMode === 'grid' ? (
        <div className={cn(
          'grid',
          getGridColumns(),
          getGapClass(),
          className
        )}>
          {items.map((item, index) => renderGridCard(item, index))}
        </div>
      ) : (
        <div className={cn('space-y-2', className)}>
          {items.map((item, index) => renderGridCard(item, index))}
        </div>
      )}
    </div>
  );
}