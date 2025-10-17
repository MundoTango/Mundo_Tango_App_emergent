/**
 * Stub for @dnd-kit/core - Provides minimal DnD Kit Core stubs
 * This stub allows the app to run without the actual @dnd-kit/core package
 */

import { ReactNode } from 'react';

export const DndContext = ({ children, ...props }: { children?: ReactNode; [key: string]: any }) => {
  console.warn('@dnd-kit/core is not installed - drag and drop is stubbed');
  return <>{children}</>;
};

export const useDraggable = ({ id }: { id: string }) => {
  return {
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    isDragging: false,
  };
};

export const useDroppable = ({ id }: { id: string }) => {
  return {
    setNodeRef: () => {},
    isOver: false,
    over: null,
  };
};

export const DragOverlay = ({ children, ...props }: { children?: ReactNode; [key: string]: any }) => {
  return null;
};

export const PointerSensor = class {};
export const KeyboardSensor = class {};
export const TouchSensor = class {};
export const MouseSensor = class {};

export const useSensor = (sensor: any, options?: any) => null;
export const useSensors = (...sensors: any[]) => [];

export interface CollisionDetection {
  (args: any): any;
}

export const rectIntersection: CollisionDetection = () => null;
export const closestCenter: CollisionDetection = () => null;
export const closestCorners: CollisionDetection = () => null;
export const pointerWithin: CollisionDetection = () => null;
