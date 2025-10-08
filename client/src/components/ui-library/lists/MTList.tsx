// MT Ocean List - Base List Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState, useMemo } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTListItem {
  id: string | number;
  primary: string;
  secondary?: string;
  tertiary?: string;
  avatar?: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  actions?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  metadata?: Record<string, any>;
}

export interface MTListProps {
  items: MTListItem[];
  onItemClick?: (item: MTListItem, index: number) => void;
  selectable?: boolean;
  selectedItems?: Set<string | number>;
  onSelectItem?: (itemId: string | number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  emptyMessage?: string;
  loading?: boolean;
  loadingItems?: number;
  divided?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  glassmorphic?: boolean;
  className?: string;
  itemClassName?: string | ((item: MTListItem, index: number) => string);
  renderItem?: (item: MTListItem, index: number) => React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  testId?: string;
}

export default function MTList({
  items,
  onItemClick,
  selectable = false,
  selectedItems = new Set(),
  onSelectItem,
  onSelectAll,
  searchable = false,
  searchPlaceholder = 'Search items...',
  onSearch,
  emptyMessage = 'No items found',
  loading = false,
  loadingItems = 5,
  divided = true,
  hoverable = true,
  compact = false,
  glassmorphic = true,
  className,
  itemClassName,
  renderItem,
  header,
  footer,
  testId = 'mt-list'
}: MTListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedItems, setLocalSelectedItems] = useState(selectedItems);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.primary.toLowerCase().includes(query) ||
      item.secondary?.toLowerCase().includes(query) ||
      item.tertiary?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  const handleSelectItem = (itemId: string | number, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelectItem) {
      onSelectItem(itemId, e.target.checked);
    } else {
      const newSelected = new Set(localSelectedItems);
      if (e.target.checked) {
        newSelected.add(itemId);
      } else {
        newSelected.delete(itemId);
      }
      setLocalSelectedItems(newSelected);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    } else {
      if (e.target.checked) {
        setLocalSelectedItems(new Set(filteredItems.map(item => item.id)));
      } else {
        setLocalSelectedItems(new Set());
      }
    }
  };

  const allSelected = filteredItems.length > 0 && 
    filteredItems.every(item => localSelectedItems.has(item.id));
  const someSelected = filteredItems.some(item => localSelectedItems.has(item.id)) && !allSelected;

  const containerStyles = glassmorphic ? applyGlassmorphism() : {};

  return (
    <div
      className={cn(
        'mt-list-container',
        glassmorphic && 'backdrop-blur-xl rounded-xl border border-teal-200/30 dark:border-teal-700/30',
        className
      )}
      style={containerStyles}
      data-testid={testId}
    >
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-[var(--color-border)]/50 dark:border-gray-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg',
                'bg-[var(--color-surface)]/90 dark:bg-gray-800/90',
                'border border-teal-200/50 dark:border-teal-700/50',
                'focus:border-teal-400 dark:focus:border-[var(--color-primary)]',
                'focus:ring-2 focus:ring-teal-400/20',
                'transition-all duration-300'
              )}
              data-testid={`${testId}-search`}
              aria-label="Input field"
            />
          </div>
        </div>
      )}

      {/* Select All */}
      {selectable && filteredItems.length > 0 && (
        <div className="px-4 py-2 border-b border-[var(--color-border)]/50 dark:border-gray-700/50 bg-[var(--color-surface-elevated)]/50 dark:bg-gray-800/50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
              className="rounded border-[var(--color-ocean-300)] text-[var(--color-primary-hover)] focus:ring-teal-500"
              data-testid={`${testId}-select-all`}
              aria-label="Input field"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Select all ({filteredItems.length})
            </span>
          </label>
        </div>
      )}

      {/* Header */}
      {header}

      {/* List Items */}
      <div className={cn('mt-list-content', !glassmorphic && 'bg-[var(--color-surface)] dark:bg-gray-900')}>
        {loading ? (
          <LoadingState count={loadingItems} compact={compact} />
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {filteredItems.map((item, index) => (
              <ListItemComponent
                key={item.id}
                item={item}
                index={index}
                onItemClick={onItemClick}
                selectable={selectable}
                selected={localSelectedItems.has(item.id)}
                onSelect={handleSelectItem}
                divided={divided && index > 0}
                hoverable={hoverable}
                compact={compact}
                className={typeof itemClassName === 'function' 
                  ? itemClassName(item, index) 
                  : itemClassName}
                renderItem={renderItem}
                testId={`${testId}-item-${item.id}`}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {footer}
    </div>
  );
}

// List Item Component
interface ListItemComponentProps {
  item: MTListItem;
  index: number;
  onItemClick?: (item: MTListItem, index: number) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (itemId: string | number, e: React.ChangeEvent<HTMLInputElement>) => void;
  divided?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
  renderItem?: (item: MTListItem, index: number) => React.ReactNode;
  testId?: string;
}

function ListItemComponent({
  item,
  index,
  onItemClick,
  selectable,
  selected,
  onSelect,
  divided,
  hoverable,
  compact,
  className,
  renderItem,
  testId
}: ListItemComponentProps) {
  if (renderItem) {
    return <li data-testid={testId}>{renderItem(item, index)}</li>;
  }

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item, index);
    }
  };

  const isClickable = item.onClick || onItemClick;

  return (
    <li
      className={cn(
        'flex items-center gap-3',
        compact ? 'px-4 py-2' : 'px-4 py-3',
        hoverable && !item.disabled && 'hover:bg-[var(--color-ocean-50)]/30 dark:hover:bg-teal-900/20',
        isClickable && !item.disabled && 'cursor-pointer',
        selected && 'bg-[var(--color-ocean-100)]/40 dark:bg-teal-800/30',
        item.disabled && 'opacity-50 cursor-not-allowed',
        'transition-colors duration-200',
        className
      )}
      onClick={!item.disabled ? handleClick : undefined}
      data-testid={testId}
    >
      {/* Selection Checkbox */}
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect?.(item.id, e)} aria-label="Input field"
          onClick={(e) => e.stopPropagation()}
          disabled={item.disabled}
          className="rounded border-[var(--color-ocean-300)] text-[var(--color-primary-hover)] focus:ring-teal-500"
          data-testid={`${testId}-checkbox`}
        />
      )}

      {/* Avatar/Icon */}
      {(item.avatar || item.icon) && (
        <div className="flex-shrink-0">
          {typeof item.avatar === 'string' ? (
            <img
              src={item.avatar}
              alt=""
              className={cn(
                'rounded-full',
                compact ? 'w-8 h-8' : 'w-10 h-10'
              )}
            />
          ) : item.avatar ? (
            <div className={cn(
              'rounded-full bg-gradient-to-br from-[var(--color-ocean-400)] to-[var(--color-ocean-600)] flex items-center justify-center text-white',
              compact ? 'w-8 h-8' : 'w-10 h-10'
            )}>
              {item.avatar}
            </div>
          ) : (
            <div className="text-gray-400">{item.icon}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'font-medium text-[var(--color-text)] dark:text-gray-100 truncate',
            compact && 'text-sm'
          )}>
            {item.primary}
          </p>
          {item.badge !== undefined && (
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              item.badgeVariant === 'primary' && 'bg-[var(--color-ocean-100)] text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
              item.badgeVariant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
              item.badgeVariant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
              item.badgeVariant === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
              (!item.badgeVariant || item.badgeVariant === 'default') && 'bg-[var(--color-neutral-100)] text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            )}>
              {item.badge}
            </span>
          )}
        </div>
        {item.secondary && (
          <p className={cn(
            'text-gray-600 dark:text-gray-400 truncate',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {item.secondary}
          </p>
        )}
        {item.tertiary && (
          <p className={cn(
            'text-gray-500 dark:text-gray-500 truncate',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {item.tertiary}
          </p>
        )}
      </div>

      {/* Actions */}
      {item.actions && (
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {item.actions}
        </div>
      )}

      {/* Chevron for clickable items */}
      {isClickable && !item.disabled && (
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </li>
  );
}

// Loading State Component
function LoadingState({ count, compact }: { count: number; compact?: boolean }) {
  return (
    <ul className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className={cn(
            'flex items-center gap-3',
            compact ? 'px-4 py-2' : 'px-4 py-3'
          )}
        >
          <div className={cn(
            'rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse',
            compact ? 'w-8 h-8' : 'w-10 h-10'
          )} />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}