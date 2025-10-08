// MT Ocean Timeline List - Timeline Display Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { cn } from '@/lib/utils';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTTimelineItem {
  id: string | number;
  title: string;
  description?: string;
  date: Date | string;
  time?: string;
  status?: 'completed' | 'current' | 'upcoming' | 'cancelled';
  icon?: React.ReactNode;
  iconColor?: string;
  metadata?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export interface MTTimelineListProps {
  items: MTTimelineItem[];
  variant?: 'default' | 'alternating' | 'condensed' | 'detailed';
  showConnector?: boolean;
  showDate?: boolean;
  showTime?: boolean;
  groupByDate?: boolean;
  onItemClick?: (item: MTTimelineItem, index: number) => void;
  className?: string;
  containerClassName?: string;
  itemClassName?: string | ((item: MTTimelineItem, index: number) => string);
  renderItem?: (item: MTTimelineItem, index: number) => React.ReactNode;
  loading?: boolean;
  loadingItems?: number;
  emptyMessage?: string;
  glassmorphic?: boolean;
  testId?: string;
}

export default function MTTimelineList({
  items,
  variant = 'default',
  showConnector = true,
  showDate = true,
  showTime = true,
  groupByDate = false,
  onItemClick,
  className,
  containerClassName,
  itemClassName,
  renderItem,
  loading = false,
  loadingItems = 5,
  emptyMessage = 'No timeline items',
  glassmorphic = true,
  testId = 'mt-timeline-list'
}: MTTimelineListProps) {
  const containerStyles = glassmorphic ? applyGlassmorphism() : {};

  // Group items by date if requested
  const groupedItems = groupByDate
    ? items.reduce((groups, item) => {
        const date = new Date(item.date).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {} as Record<string, MTTimelineItem[]>)
    : { '': items };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <Circle className="w-5 h-5 text-ocean-500 fill-current" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'upcoming':
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const renderTimelineItem = (item: MTTimelineItem, index: number, isLast: boolean) => {
    if (renderItem) {
      return renderItem(item, index);
    }

    const itemClass = typeof itemClassName === 'function'
      ? itemClassName(item, index)
      : itemClassName;

    const isAlternating = variant === 'alternating';
    const isCondensed = variant === 'condensed';
    const isDetailed = variant === 'detailed';
    const isRightSide = isAlternating && index % 2 === 1;

    return (
      <div
        key={item.id}
        className={cn(
          'relative flex',
          isAlternating && 'w-full',
          isRightSide && 'flex-row-reverse',
          itemClass
        )}
        data-testid={`${testId}-item-${item.id}`}
      >
        {/* Date/Time for alternating layout */}
        {isAlternating && (
          <div className={cn(
            'flex-1',
            isRightSide ? 'text-left pl-8' : 'text-right pr-8'
          )}>
            {showDate && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {formatDate(item.date)}
              </p>
            )}
            {showTime && item.time && (
              <p className="text-xs text-gray-400">
                {formatTime(item.time)}
              </p>
            )}
          </div>
        )}

        {/* Timeline connector */}
        <div className={cn(
          'relative flex flex-col items-center',
          !isAlternating && 'mr-4'
        )}>
          {/* Icon */}
          <div className={cn(
            'flex items-center justify-center rounded-full',
            'bg-white dark:bg-gray-800 border-2',
            item.status === 'completed' && 'border-green-500',
            item.status === 'current' && 'border-teal-500',
            item.status === 'cancelled' && 'border-red-500',
            (!item.status || item.status === 'upcoming') && 'border-gray-300 dark:border-gray-600',
            isCondensed ? 'w-8 h-8' : 'w-10 h-10',
            'z-10'
          )}
          style={{ backgroundColor: item.iconColor }}
          >
            {item.icon || getStatusIcon(item.status)}
          </div>
          
          {/* Connector line */}
          {showConnector && !isLast && (
            <div className={cn(
              'absolute top-10 w-0.5 bg-gray-300 dark:bg-gray-700',
              isCondensed ? 'h-[calc(100%+var(--spacing-4))]' : 'h-[calc(100%+var(--spacing-8))]'
            )} />
          )}
        </div>

        {/* Content */}
        <div className={cn(
          'flex-1',
          isAlternating && 'flex-none w-5/12',
          isRightSide && 'pr-8',
          !isAlternating && !isRightSide && 'pb-8'
        )}>
          <div
            className={cn(
              'p-4 rounded-xl',
              'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
              'border border-gray-200/50 dark:border-gray-700/50',
              'hover:shadow-lg transition-all duration-300',
              item.onClick && 'cursor-pointer hover:scale-[1.02]',
              item.status === 'current' && 'ring-2 ring-teal-400 bg-teal-50/20 dark:bg-teal-900/20'
            )}
            onClick={() => {
              if (item.onClick) item.onClick();
              else if (onItemClick) onItemClick(item, index);
            }}
          >
            {/* Date/Time for default layout */}
            {!isAlternating && showDate && (
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(item.date)}</span>
                {showTime && item.time && (
                  <>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{formatTime(item.time)}</span>
                  </>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className={cn(
              'font-semibold text-gray-900 dark:text-gray-100',
              isCondensed ? 'text-sm' : 'text-base'
            )}>
              {item.title}
            </h3>

            {/* Description */}
            {item.description && !isCondensed && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.description}
              </p>
            )}

            {/* Metadata */}
            {item.metadata && item.metadata.length > 0 && isDetailed && (
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
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                {item.actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="space-y-8">
      {Array.from({ length: loadingItems }).map((_, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        'mt-timeline-list-container',
        glassmorphic && 'backdrop-blur-xl rounded-xl border border-teal-200/30 dark:border-teal-700/30 p-6',
        containerClassName
      )}
      style={containerStyles}
      data-testid={testId}
    >
      {loading ? (
        renderLoadingState()
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {emptyMessage}
        </div>
      ) : groupByDate ? (
        <div className={cn('space-y-8', className)}>
          {Object.entries(groupedItems).map(([date, dateItems]) => (
            <div key={date}>
              {date && (
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {date}
                </h3>
              )}
              <div className="space-y-4">
                {dateItems.map((item, index) => 
                  renderTimelineItem(
                    item, 
                    index, 
                    index === dateItems.length - 1
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(className)}>
          {items.map((item, index) => 
            renderTimelineItem(
              item, 
              index, 
              index === items.length - 1
            )
          )}
        </div>
      )}
    </div>
  );
}