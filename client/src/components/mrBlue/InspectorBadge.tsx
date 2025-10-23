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
      className="flex items-center gap-2 px-4 py-3 bg-[var(--inspector-badge-bg)] border-l-4 border-[var(--inspector-badge-border)] backdrop-blur-sm"
      data-testid="inspector-badge"
    >
      {/* Icon */}
      <Eye className="h-4 w-4 text-[var(--mrblue-teal)] flex-shrink-0" />
      
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Inspecting:{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono text-[var(--mrblue-teal)]">
            {formatElement()}
          </code>
        </p>
        
        {/* Element text content preview */}
        {element.textContent && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            "{element.textContent.substring(0, 50)}{element.textContent.length > 50 ? '...' : ''}"
          </p>
        )}
      </div>
      
      {/* Clear Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="ml-auto flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
        data-testid="button-clear-inspector"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
