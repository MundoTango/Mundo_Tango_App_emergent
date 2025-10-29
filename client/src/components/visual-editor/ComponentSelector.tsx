/**
 * COMPONENT SELECTOR
 * Click any element on the page to select it for editing
 * Shows overlay with component info and edit controls
 * Part of Phase 12 Autonomous Learning System
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Move, Palette, Type, X } from 'lucide-react';

interface ComponentSelectorProps {
  enabled: boolean;
  onSelectComponent: (component: SelectedComponent) => void;
}

export interface SelectedComponent {
  element: HTMLElement;
  testId: string;
  type: string;
  bounds: DOMRect;
  path: string;
}

export function ComponentSelector({ enabled, onSelectComponent }: ComponentSelectorProps) {
  const [hoveredComponent, setHoveredComponent] = useState<SelectedComponent | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHoveredComponent(null);
      setSelectedComponent(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if clicking on overlay itself
      if (target.closest('[data-visual-editor-overlay]')) {
        return;
      }

      // Find nearest component with data-testid
      const component = target.closest('[data-testid]') as HTMLElement;
      if (!component) return;

      const testId = component.getAttribute('data-testid');
      if (!testId) return;

      const bounds = component.getBoundingClientRect();
      const type = component.tagName.toLowerCase();
      const path = getComponentPath(component);

      setHoveredComponent({
        element: component,
        testId,
        type,
        bounds,
        path,
      });
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (hoveredComponent) {
        setSelectedComponent(hoveredComponent);
        onSelectComponent(hoveredComponent);
      }
    };

    // Attach listeners to iframe if in Visual Editor
    const iframe = document.querySelector('[data-testid="preview-iframe"]') as HTMLIFrameElement;
    const doc = iframe?.contentDocument || document;

    doc.addEventListener('mousemove', handleMouseMove);
    doc.addEventListener('click', handleClick);

    return () => {
      doc.removeEventListener('mousemove', handleMouseMove);
      doc.removeEventListener('click', handleClick);
    };
  }, [enabled, hoveredComponent, onSelectComponent]);

  if (!enabled) return null;

  return (
    <div data-visual-editor-overlay="true" className="pointer-events-none">
      {/* Hover highlight */}
      {hoveredComponent && !selectedComponent && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none transition-all"
          style={{
            top: hoveredComponent.bounds.top,
            left: hoveredComponent.bounds.left,
            width: hoveredComponent.bounds.width,
            height: hoveredComponent.bounds.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {hoveredComponent.testId}
          </div>
        </div>
      )}

      {/* Selection highlight with controls */}
      {selectedComponent && (
        <div
          className="absolute border-2 border-purple-600 bg-purple-600/10 pointer-events-auto"
          style={{
            top: selectedComponent.bounds.top,
            left: selectedComponent.bounds.left,
            width: selectedComponent.bounds.width,
            height: selectedComponent.bounds.height,
          }}
        >
          {/* Component info badge */}
          <div className="absolute -top-8 left-0 flex items-center gap-2">
            <Badge variant="default" className="bg-purple-600">
              {selectedComponent.testId}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {selectedComponent.type}
            </Badge>
          </div>

          {/* Edit controls */}
          <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white dark:bg-gray-900 rounded shadow-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              data-testid="button-edit-component"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              data-testid="button-move-component"
            >
              <Move className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              data-testid="button-style-component"
            >
              <Palette className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              data-testid="button-text-component"
            >
              <Type className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setSelectedComponent(null)}
              data-testid="button-deselect-component"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Resize handles */}
          {['nw', 'ne', 'sw', 'se'].map((corner) => (
            <div
              key={corner}
              className={`absolute w-3 h-3 bg-purple-600 rounded-full cursor-${corner}-resize ${
                corner.includes('n') ? '-top-1.5' : '-bottom-1.5'
              } ${
                corner.includes('w') ? '-left-1.5' : '-right-1.5'
              }`}
              data-testid={`handle-resize-${corner}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Get component path from DOM element
 */
function getComponentPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : '';
    const classes = current.className ? `.${current.className.split(' ').join('.')}` : '';
    path.unshift(`${tag}${id}${classes}`);
    current = current.parentElement;
  }

  return path.join(' > ');
}
