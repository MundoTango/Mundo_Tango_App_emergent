/**
 * Collapsible Panel Component
 * Draggable, minimizable panel for Visual Editor
 * MB.MD Track 1 - Collapsible Panels
 */

import { useState } from 'react';
import { Minimize2, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultMinimized?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
}

export function CollapsiblePanel({
  title,
  children,
  defaultMinimized = false,
  onClose,
  icon
}: CollapsiblePanelProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-750 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {icon && <span className="text-blue-400">{icon}</span>}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            data-testid={`button-${isMinimized ? 'maximize' : 'minimize'}-${title}`}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              data-testid={`button-close-${title}`}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );
}
