// MT Ocean List Item - Versatile List Item Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { cn } from '@/lib/utils';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { MTBadge } from '../badges/MTBadge';

export type MTListItemLayout = 'default' | 'compact' | 'card' | 'media' | 'detailed';

export interface MTListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  media?: string | React.ReactNode;
  mediaPosition?: 'left' | 'right' | 'top';
  icon?: React.ReactNode;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  }>;
  metadata?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  actions?: React.ReactNode;
  layout?: MTListItemLayout;
  selected?: boolean;
  disabled?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  onActionClick?: (action: string) => void;
  className?: string;
  testId?: string;
}

export default function MTListItem({
  title,
  subtitle,
  description,
  media,
  mediaPosition = 'left',
  icon,
  badges,
  metadata,
  actions,
  layout = 'default',
  selected = false,
  disabled = false,
  hoverable = true,
  onClick,
  onActionClick,
  className,
  testId = 'mt-list-item'
}: MTListItemProps) {
  const renderMedia = () => {
    if (!media) return null;

    const mediaClass = cn(
      'flex-shrink-0',
      layout === 'compact' && 'w-8 h-8',
      layout === 'default' && 'w-12 h-12',
      layout === 'media' && 'w-24 h-24',
      layout === 'card' && mediaPosition === 'top' && 'w-full h-48',
      layout === 'card' && mediaPosition !== 'top' && 'w-32 h-full'
    );

    if (typeof media === 'string') {
      return (
        <div className={cn(mediaClass, 'overflow-hidden', 
          mediaPosition !== 'top' && 'rounded-lg',
          mediaPosition === 'top' && 'rounded-t-lg'
        )}>
          <img
            src={media}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className={cn(
        mediaClass,
        'bg-gradient-to-br from-[var(--color-ocean-400)] to-[var(--color-ocean-600)] rounded-lg',
        'flex items-center justify-center text-white'
      )}>
        {media}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="flex-1 min-w-0">
        {/* Title and Badges */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h3 className={cn(
              'font-medium text-[var(--color-text)] dark:text-gray-100',
              layout === 'compact' ? 'text-sm' : 'text-base',
              layout === 'card' && 'text-lg'
            )}>
              {title}
            </h3>
            {subtitle && (
              <p className={cn(
                'text-gray-600 dark:text-gray-400',
                layout === 'compact' ? 'text-xs' : 'text-sm'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {badges && badges.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {badges.map((badge, index) => (
                <MTBadge
                  key={index}
                  variant={badge.variant}
                  size={layout === 'compact' ? 'sm' : 'md'}
                >
                  {badge.label}
                </MTBadge>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {description && layout !== 'compact' && (
          <p className={cn(
            'text-gray-600 dark:text-gray-400 mt-1',
            layout === 'card' ? 'text-sm' : 'text-xs',
            layout === 'detailed' && 'line-clamp-3'
          )}>
            {description}
          </p>
        )}

        {/* Metadata */}
        {metadata && metadata.length > 0 && layout !== 'compact' && (
          <div className="flex flex-wrap gap-3 mt-2">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 dark:text-gray-400">
                {item.icon}
                <span className="font-medium">{item.label}:</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getLayoutClass = () => {
    switch (layout) {
      case 'compact':
        return 'px-3 py-2';
      case 'card':
        return mediaPosition === 'top' 
          ? 'flex-col p-0' 
          : 'p-4';
      case 'media':
        return 'p-4';
      case 'detailed':
        return 'p-4';
      default:
        return 'px-4 py-3';
    }
  };

  const content = (
    <>
      {/* Icon */}
      {icon && layout !== 'card' && (
        <div className="flex-shrink-0 text-gray-400">
          {icon}
        </div>
      )}

      {/* Media - Left */}
      {media && mediaPosition === 'left' && layout !== 'card' && renderMedia()}
      
      {/* Media - Top (Card Layout) */}
      {media && mediaPosition === 'top' && layout === 'card' && renderMedia()}

      {/* Content Wrapper for Card Layout */}
      {layout === 'card' && mediaPosition === 'top' ? (
        <div className="p-4 flex-1">
          {renderContent()}
        </div>
      ) : (
        renderContent()
      )}

      {/* Media - Right */}
      {media && mediaPosition === 'right' && layout !== 'card' && renderMedia()}

      {/* Actions */}
      {actions && (
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}

      {/* Chevron for clickable items */}
      {onClick && !disabled && layout !== 'card' && (
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </>
  );

  const itemClass = cn(
    'flex items-center gap-3 transition-all duration-200',
    getLayoutClass(),
    hoverable && !disabled && 'hover:bg-[var(--color-ocean-50)]/30 dark:hover:bg-teal-900/20',
    onClick && !disabled && 'cursor-pointer',
    selected && 'bg-[var(--color-ocean-100)]/40 dark:bg-teal-800/30',
    disabled && 'opacity-50 cursor-not-allowed',
    layout === 'card' && 'bg-[var(--color-surface)] dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border border-[var(--color-border)]/50 dark:border-gray-700/50',
    className
  );

  if (layout === 'card') {
    return (
      <div
        className={itemClass}
        onClick={!disabled ? onClick : undefined}
        data-testid={testId}
      >
        {content}
      </div>
    );
  }

  return (
    <li
      className={itemClass}
      onClick={!disabled ? onClick : undefined}
      data-testid={testId}
    >
      {content}
    </li>
  );
}