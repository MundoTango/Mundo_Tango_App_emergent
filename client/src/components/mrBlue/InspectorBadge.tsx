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
  // Get element display name (ID if available, otherwise tag name)
  const getElementName = () => {
    if (element.id) return element.id;
    if (element.className) {
      const firstClass = element.className.split(' ')[0];
      return firstClass;
    }
    return element.tagName.toLowerCase();
  };

  return (
    <div 
      className="flex items-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-[#14B8A6] backdrop-blur-sm shadow-sm"
      data-testid="inspector-badge"
    >
      {/* Icon */}
      <Eye className="h-4 w-4 text-[#14B8A6] flex-shrink-0" />
      
      {/* Text - Simple "Selected: [Element]" format */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Selected:{' '}
          <span className="font-semibold text-[#14B8A6]">
            {getElementName()}
          </span>
        </p>
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
