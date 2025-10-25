/**
 * Visual Editor Context - Bridges Visual Editor and Mr Blue
 * MB.MD Track 5 - Context Integration
 * Oct 22, 2025: Added previewPath to track what page is shown in preview
 * Oct 25, 2025: Added pendingCodeChanges for vibe coding integration
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';

export interface CodeChange {
  id: string;
  taskId: string;
  filePath: string;
  diff: string;
  type: 'unified_diff' | 'search_replace' | 'new_file';
  status: 'pending' | 'applied' | 'failed';
  error?: string;
  timestamp: Date;
}

interface VisualEditorContextType {
  selectedElement: ElementSelection | null;
  setSelectedElement: (element: ElementSelection | null) => void;
  pendingChangesCount: number;
  setPendingChangesCount: (count: number) => void;
  // 🎯 PREVIEW CONTEXT: What page is being shown in the preview iframe
  previewPath: string;
  setPreviewPath: (path: string) => void;
  // 🚀 STREAM 2: Pending code changes from vibe coding API
  pendingCodeChanges: CodeChange[];
  setPendingCodeChanges: (changes: CodeChange[] | ((prev: CodeChange[]) => CodeChange[])) => void;
  addCodeChange: (change: CodeChange) => void;
  clearCodeChanges: () => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [selectedElement, setSelectedElement] = useState<ElementSelection | null>(null);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [previewPath, setPreviewPath] = useState<string>('/'); // Default to homepage
  const [pendingCodeChanges, setPendingCodeChanges] = useState<CodeChange[]>([]);
  
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
  
  // 🚀 STREAM 2: Code change management functions
  const addCodeChange = (change: CodeChange) => {
    console.log('📝 [VisualEditorContext] Adding code change:', change.filePath);
    setPendingCodeChanges(prev => [...prev, change]);
    setPendingChangesCount(prev => prev + 1);
  };
  
  const clearCodeChanges = () => {
    console.log('🗑️ [VisualEditorContext] Clearing all code changes');
    setPendingCodeChanges([]);
    setPendingChangesCount(0);
  };

  return (
    <VisualEditorContext.Provider 
      value={{
        selectedElement,
        setSelectedElement: handleSetSelectedElement,
        pendingChangesCount,
        setPendingChangesCount,
        previewPath,
        setPreviewPath: handleSetPreviewPath,
        pendingCodeChanges,
        setPendingCodeChanges,
        addCodeChange,
        clearCodeChanges
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
