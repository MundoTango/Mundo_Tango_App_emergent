/**
 * Visual Editor Context - Bridges Visual Editor and Mr Blue
 * MB.MD Track 5 - Context Integration
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';

interface VisualEditorContextType {
  selectedElement: ElementSelection | null;
  setSelectedElement: (element: ElementSelection | null) => void;
  pendingChangesCount: number;
  setPendingChangesCount: (count: number) => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [selectedElement, setSelectedElement] = useState<ElementSelection | null>(null);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  
  // 🐛 DEBUG: Log when context updates
  const handleSetSelectedElement = (element: ElementSelection | null) => {
    console.log('🎨 [VisualEditorContext] setSelectedElement called:', {
      hasElement: !!element,
      element: element
    });
    setSelectedElement(element);
  };

  return (
    <VisualEditorContext.Provider 
      value={{
        selectedElement,
        setSelectedElement: handleSetSelectedElement,
        pendingChangesCount,
        setPendingChangesCount
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
}

export function useVisualEditor() {
  const context = useContext(VisualEditorContext);
  if (!context) {
    throw new Error('useVisualEditor must be used within VisualEditorProvider');
  }
  return context;
}

// Optional version that doesn't throw - for components that may or may not be in Visual Editor
export function useVisualEditorOptional() {
  const context = useContext(VisualEditorContext);
  return context; // Returns null if not in provider
}
