// MT Ocean Table Cell - Versatile Table Cell Component
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { cn } from '@/lib/utils';
import { MTBadge } from '../badges/MTBadge';
import { format } from 'date-fns';

export type MTTableCellType = 
  | 'text' 
  | 'number' 
  | 'currency' 
  | 'percentage' 
  | 'date' 
  | 'datetime' 
  | 'boolean' 
  | 'badge' 
  | 'avatar' 
  | 'progress' 
  | 'rating'
  | 'custom';

export interface MTTableCellProps {
  value: any;
  type?: MTTableCellType;
  align?: 'left' | 'center' | 'right';
  format?: string | ((value: any) => string);
  className?: string;
  onClick?: () => void;
  editable?: boolean;
  onEdit?: (value: any) => void;
  badge?: {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
  };
  avatar?: {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
  };
  progress?: {
    max?: number;
    showLabel?: boolean;
    color?: string;
  };
  rating?: {
    max?: number;
    icon?: 'star' | 'heart';
  };
  truncate?: boolean;
  maxLength?: number;
  testId?: string;
  children?: React.ReactNode;
}

export default function MTTableCell({
  value,
  type = 'text',
  align = 'left',
  format: formatProp,
  className,
  onClick,
  editable = false,
  onEdit,
  badge = {},
  avatar = {},
  progress = {},
  rating = {},
  truncate = false,
  maxLength = 50,
  testId = 'mt-table-cell',
  children
}: MTTableCellProps) {
  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '-';
    
    if (formatProp) {
      if (typeof formatProp === 'function') {
        return formatProp(val);
      }
      if (type === 'date' || type === 'datetime') {
        return format(new Date(val), formatProp);
      }
    }
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
        
      case 'percentage':
        return `${(val * 100).toFixed(2)}%`;
        
      case 'date':
        return format(new Date(val), 'MMM dd, yyyy');
        
      case 'datetime':
        return format(new Date(val), 'MMM dd, yyyy HH:mm');
        
      case 'boolean':
        return val ? 'Yes' : 'No';
        
      default:
        const str = String(val);
        if (truncate && str.length > maxLength) {
          return str.substring(0, maxLength) + '...';
        }
        return str;
    }
  };

  const renderContent = () => {
    if (children) return children;
    
    switch (type) {
      case 'badge':
        return (
          <MTBadge 
            variant={badge.variant || 'default'}
            size={badge.size || 'sm'}
          >
            {formatValue(value)}
          </MTBadge>
        );
        
      case 'avatar':
        const { src, alt = '', fallback = '?', size = 'md' } = avatar;
        const sizeClasses = {
          sm: 'w-8 h-8',
          md: 'w-10 h-10',
          lg: 'w-12 h-12'
        };
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              'rounded-full overflow-hidden flex items-center justify-center',
              'bg-gradient-to-br from-teal-400 to-blue-600',
              sizeClasses[size]
            )}>
              {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold">
                  {fallback}
                </span>
              )}
            </div>
            {value && <span>{formatValue(value)}</span>}
          </div>
        );
        
      case 'progress':
        const { max = 100, showLabel = true, color = 'teal' } = progress;
        const percentage = (value / max) * 100;
        return (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  color === 'teal' && 'bg-gradient-to-r from-teal-400 to-teal-600',
                  color === 'blue' && 'bg-gradient-to-r from-blue-400 to-blue-600',
                  color === 'green' && 'bg-gradient-to-r from-green-400 to-green-600',
                  color === 'red' && 'bg-gradient-to-r from-red-400 to-red-600'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {showLabel && (
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[var(--spacing-12)]">
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        );
        
      case 'rating':
        const { max: maxRating = 5, icon = 'star' } = rating;
        const fullStars = Math.floor(value);
        const hasHalfStar = value % 1 !== 0;
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < fullStars 
                    ? 'text-yellow-400 fill-current' 
                    : i === fullStars && hasHalfStar
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
                fill={i < fullStars ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {icon === 'star' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                )}
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
              {value.toFixed(1)}
            </span>
          </div>
        );
        
      case 'boolean':
        return (
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            value 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {value ? '✓ Yes' : '✗ No'}
          </span>
        );
        
      default:
        return <span>{formatValue(value)}</span>;
    }
  };

  return (
    <td
      className={cn(
        'px-4 py-3',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        onClick && 'cursor-pointer hover:bg-teal-50/20 dark:hover:bg-teal-900/10',
        editable && 'relative group',
        className
      )}
      onClick={onClick}
      data-testid={testId}
    >
      {renderContent()}
      {editable && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(value);
          }}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </td>
  );
}