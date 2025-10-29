// MT Ocean Accordion List - Collapsible List Sections
// ESA LIFE CEO 61x21 - Phase 10: Tables & Lists

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MTOceanTheme, applyGlassmorphism } from '@/styles/mt-ocean-theme';

export interface MTAccordionItem {
  id: string | number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  defaultOpen?: boolean;
}

export interface MTAccordionListProps {
  items: MTAccordionItem[];
  variant?: 'default' | 'separated' | 'bordered' | 'minimal';
  allowMultiple?: boolean;
  defaultOpenItems?: (string | number)[];
  expandIcon?: 'chevron' | 'plus' | 'custom';
  customExpandIcon?: {
    open: React.ReactNode;
    closed: React.ReactNode;
  };
  onItemToggle?: (itemId: string | number, isOpen: boolean) => void;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  glassmorphic?: boolean;
  animated?: boolean;
  testId?: string;
}

export default function MTAccordionList({
  items,
  variant = 'default',
  allowMultiple = false,
  defaultOpenItems = [],
  expandIcon = 'chevron',
  customExpandIcon,
  onItemToggle,
  className,
  containerClassName,
  headerClassName,
  contentClassName,
  glassmorphic = true,
  animated = true,
  testId = 'mt-accordion-list'
}: MTAccordionListProps) {
  const [openItems, setOpenItems] = useState<Set<string | number>>(
    new Set(defaultOpenItems.length > 0 ? defaultOpenItems : 
      items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const handleToggle = (itemId: string | number) => {
    const newOpenItems = new Set(openItems);
    
    if (openItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(itemId);
    }
    
    setOpenItems(newOpenItems);
    
    if (onItemToggle) {
      onItemToggle(itemId, newOpenItems.has(itemId));
    }
  };

  const getExpandIcon = (isOpen: boolean) => {
    if (customExpandIcon) {
      return isOpen ? customExpandIcon.open : customExpandIcon.closed;
    }
    
    switch (expandIcon) {
      case 'plus':
        return isOpen ? (
          <Minus className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        );
      case 'chevron':
      default:
        return isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        );
    }
  };

  const containerStyles = glassmorphic && variant !== 'separated' 
    ? applyGlassmorphism() 
    : {};

  const getVariantClasses = () => {
    switch (variant) {
      case 'separated':
        return 'space-y-4';
      case 'bordered':
        return 'divide-y divide-gray-200/50 dark:divide-gray-700/50';
      case 'minimal':
        return '';
      default:
        return 'divide-y divide-gray-200/50 dark:divide-gray-700/50';
    }
  };

  const getItemClasses = (isOpen: boolean, disabled?: boolean) => {
    const base = cn(
      'transition-all duration-300',
      disabled && 'opacity-50 cursor-not-allowed'
    );
    
    switch (variant) {
      case 'separated':
        return cn(
          base,
          'rounded-xl overflow-hidden',
          glassmorphic ? 'backdrop-blur-xl border border-teal-200/30 dark:border-teal-700/30' : 
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          isOpen && 'ring-2 ring-teal-400 shadow-lg'
        );
      case 'minimal':
        return base;
      default:
        return base;
    }
  };

  return (
    <div
      className={cn(
        'mt-accordion-list-container',
        variant !== 'separated' && glassmorphic && 
          'backdrop-blur-xl rounded-xl border border-teal-200/30 dark:border-teal-700/30',
        variant !== 'separated' && !glassmorphic && 
          'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700',
        containerClassName
      )}
      style={variant !== 'separated' ? containerStyles : {}}
      data-testid={testId}
    >
      <div className={cn(getVariantClasses(), className)}>
        {items.map((item) => {
          const isOpen = openItems.has(item.id);
          const itemStyles = variant === 'separated' && glassmorphic 
            ? applyGlassmorphism() 
            : {};
          
          return (
            <div
              key={item.id}
              className={getItemClasses(isOpen, item.disabled)}
              style={variant === 'separated' ? itemStyles : {}}
              data-testid={`${testId}-item-${item.id}`}
            >
              {/* Header */}
              <button
                onClick={() => !item.disabled && handleToggle(item.id)}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-3 text-left',
                  variant === 'separated' || variant === 'minimal' ? 'p-4' : 'py-4 px-4',
                  'hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-colors',
                  isOpen && 'bg-teal-50/20 dark:bg-teal-900/10',
                  item.disabled && 'cursor-not-allowed',
                  headerClassName
                )}
                data-testid={`${testId}-header-${item.id}`}
              >
                {/* Expand Icon */}
                <div className={cn(
                  'flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform',
                  animated && 'duration-300'
                )}>
                  {getExpandIcon(isOpen)}
                </div>
                
                {/* Item Icon */}
                {item.icon && (
                  <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                    {item.icon}
                  </div>
                )}
                
                {/* Title and Subtitle */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'font-medium text-gray-900 dark:text-gray-100',
                    isOpen && 'text-teal-700 dark:text-teal-300'
                  )}>
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                
                {/* Badge */}
                {item.badge !== undefined && (
                  <span className={cn(
                    'flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    item.badgeVariant === 'primary' && 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
                    item.badgeVariant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                    item.badgeVariant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                    item.badgeVariant === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                    (!item.badgeVariant || item.badgeVariant === 'default') && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
              
              {/* Content */}
              <div
                className={cn(
                  'overflow-hidden transition-all',
                  animated ? 'duration-500 ease-in-out' : 'duration-0',
                  isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className={cn(
                  variant === 'separated' ? 'px-4 pb-4' : 'px-4 pb-4',
                  variant === 'minimal' && 'pl-10',
                  contentClassName
                )}>
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Accordion Group Component for nested accordions
export interface MTAccordionGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function MTAccordionGroup({
  title,
  children,
  defaultOpen = false,
  icon,
  className
}: MTAccordionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('mt-accordion-group', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 py-2 text-left hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <ChevronRight className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-90'
        )} />
        {icon}
        <span className="font-medium">{title}</span>
      </button>
      {isOpen && (
        <div className="pl-6 mt-2 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}