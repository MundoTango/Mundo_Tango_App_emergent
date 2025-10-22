/**
 * Visual Editor Context - Bridges Visual Editor and Mr Blue
 * MB.MD Track 5 - Context Integration
 * Oct 22, 2025: Added previewPath to track what page is shown in preview
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';

interface VisualEditorContextType {
  selectedElement: ElementSelection | null;
  setSelectedElement: (element: ElementSelection | null) => void;
  pendingChangesCount: number;
  setPendingChangesCount: (count: number) => void;
  // 🎯 PREVIEW CONTEXT: What page is being shown in the preview iframe
  previewPath: string;
  setPreviewPath: (path: string) => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [selectedElement, setSelectedElement] = useState<ElementSelection | null>(null);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [previewPath, setPreviewPath] = useState<string>('/'); // Default to homepage
  
  // 🐛 DEBUG: Log when context updates
  const handleSetSelectedElement = (element: ElementSelection | null) => {
    console.log('🎨 [VisualEditorContext] setSelectedElement called:', {
      hasElement: !!element,
      element: element,
      previewPath: previewPath
    });
    setSelectedElement(element);
  };
  
  const handleSetPreviewPath = (path: string) => {
    console.log('📍 [VisualEditorContext] Preview path changed:', path);
    setPreviewPath(path);
  };

  return (
    <VisualEditorContext.Provider 
      value={{
        selectedElement,
        setSelectedElement: handleSetSelectedElement,
        pendingChangesCount,
        setPendingChangesCount,
        previewPath,
        setPreviewPath: handleSetPreviewPath
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
