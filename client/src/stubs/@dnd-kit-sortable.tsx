/**
 * Stub for @dnd-kit/sortable - Provides minimal DnD Kit Sortable stubs
 * This stub allows the app to run without the actual @dnd-kit/sortable package
 */

import { ReactNode } from 'react';

export const SortableContext = ({ children, items, strategy, ...props }: { 
  children?: ReactNode; 
  items: any[];
  strategy?: any;
  [key: string]: any;
}) => {
  console.warn('@dnd-kit/sortable is not installed - sortable drag and drop is stubbed');
  return <>{children}</>;
};

export const useSortable = ({ id }: { id: string | number }) => {
  return {
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
    isSorting: false,
    index: 0,
    over: null,
  };
};

export const verticalListSortingStrategy = {};
export const horizontalListSortingStrategy = {};
export const rectSortingStrategy = {};
export const rectSwappingStrategy = {};

export const arrayMove = (array: any[], from: number, to: number) => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};

export const sortableKeyboardCoordinates = () => {};
