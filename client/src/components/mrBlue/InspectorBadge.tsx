/**
 * STREAM 2: Inspector Badge
 * Visual indicator showing currently selected element
 * MB.MD SIMULTANEOUS Build - October 23, 2025
 */

import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectedElement {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  xpath?: string;
  attributes?: Record<string, string>;
}

interface InspectorBadgeProps {
  element: SelectedElement;
  onClear: () => void;
}

export function InspectorBadge({ element, onClear }: InspectorBadgeProps) {
  // Format element for display
  const formatElement = () => {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? ` id="${element.id}"` : '';
    const className = element.className ? ` class="${element.className}"` : '';
    
    return `<${tag}${id}${className}>`;
  };

  return (
    <div 
      className="flex items-center gap-2 px-4 py-3 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-[#14B8A6] backdrop-blur-sm shadow-sm"
      data-testid="inspector-badge"
    >
      {/* Icon */}
      <Eye className="h-5 w-5 text-[#14B8A6] flex-shrink-0 animate-pulse" />
      
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Selected Element:{' '}
          <code className="bg-teal-100 dark:bg-teal-900 px-2 py-1 rounded text-xs font-mono text-[#14B8A6]">
            {formatElement()}
          </code>
        </p>
        
        {/* Element text content preview */}
        {element.textContent && (
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 truncate font-medium">
            "{element.textContent.substring(0, 50)}{element.textContent.length > 50 ? '...' : ''}"
          </p>
        )}
        
        {/* XPath display for debugging */}
        {element.xpath && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-mono truncate">
            {element.xpath}
          </p>
        )}
      </div>
      
      {/* Clear Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="ml-auto flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
        data-testid="button-clear-inspector"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
