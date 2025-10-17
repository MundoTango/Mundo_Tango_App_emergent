/**
 * DRAG & DROP HANDLER
 * Visual element repositioning without manual X/Y inputs
 * Part of MB.MD Track A - Visual Editor Completion
 * Agent #77: Drag & Drop UX
 */

import { useState, useEffect } from 'react';
import type { SelectedComponent } from './ComponentSelector';

interface DragDropHandlerProps {
  enabled: boolean;
  selectedComponent: SelectedComponent | null;
  onPositionChange: (x: number, y: number) => void;
}

export function DragDropHandler({ 
  enabled, 
  selectedComponent, 
  onPositionChange 
}: DragDropHandlerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || !selectedComponent) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Only drag if clicking the element itself
      if (e.target === selectedComponent.element || selectedComponent.element.contains(e.target as Node)) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStart({ 
          x: selectedComponent.bounds.left, 
          y: selectedComponent.bounds.top 
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const newX = elementStart.x + deltaX;
      const newY = elementStart.y + deltaY;
      
      // Update visual position immediately
      if (selectedComponent.element) {
        selectedComponent.element.style.position = 'relative';
        selectedComponent.element.style.left = `${deltaX}px`;
        selectedComponent.element.style.top = `${deltaY}px`;
      }
      
      onPositionChange(newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, selectedComponent, isDragging, dragStart, elementStart, onPositionChange]);

  if (!enabled || !selectedComponent || !isDragging) return null;

  return (
    <div 
      className="fixed inset-0 z-50 cursor-move" 
      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
      data-testid="drag-drop-overlay"
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
        Dragging... Release to apply
      </div>
    </div>
  );
}
