import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X, Eye, Code, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SelectionLayer } from './SelectionLayer';
import { ChangeTracker } from './ChangeTracker';
import { AICodeGenerator } from './AICodeGenerator';
import { useVisualEditorActions } from '@/hooks/useVisualEditorActions';

/**
 * ESA Agent #78: Visual Page Editor
 * Figma-like visual editing mode for any page
 * MB.MD Fix Oct 21: Made enabled/onToggle optional for standalone tab usage
 */

interface VisualPageEditorProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export default function VisualPageEditor({ enabled: externalEnabled, onToggle }: VisualPageEditorProps = {}) {
  const [internalEnabled, setInternalEnabled] = useState(externalEnabled ?? true);
  const enabled = externalEnabled ?? internalEnabled;
  
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Visual Editor Tracker - connects to Mr Blue + Phase 12
  const { actions, getDataForMrBlue, tracker } = useVisualEditorActions();

  const handleToggle = (newEnabled: boolean) => {
    if (onToggle) {
      onToggle(newEnabled);
    } else {
      setInternalEnabled(newEnabled);
    }
  };

  useEffect(() => {
    if (enabled) {
      // Enable visual editing mode
      document.body.classList.add('visual-edit-mode');
      toast({
        title: "Visual Editor Activated",
        description: "Click any element to edit it visually",
      });
    } else {
      document.body.classList.remove('visual-edit-mode');
      setSelectedElement(null);
    }

    return () => {
      document.body.classList.remove('visual-edit-mode');
    };
  }, [enabled, toast]);

  const handleElementClick = (e: MouseEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // Skip if clicking editor controls
    if (target.closest('.visual-editor-controls')) return;
    
    setSelectedElement(target);
  };

  const handleStyleChange = (property: string, value: string) => {
    if (!selectedElement) return;

    const change = {
      element: selectedElement,
      property,
      oldValue: selectedElement.style[property as any],
      newValue: value,
      timestamp: Date.now(),
    };

    selectedElement.style[property as any] = value;
    setChanges([...changes, change]);
  };

  const handleSaveChanges = async () => {
    try {
      console.log('[Visual Editor] Saving changes and triggering learning...');
      
      // Get tracked actions for Phase 12 learning
      const actionsData = getDataForMrBlue();
      
      if (actionsData.length === 0) {
        toast({
          title: "No Changes",
          description: "Make some edits first, then save",
        });
        return;
      }

      // Send to Phase 12 learning system
      const response = await fetch('/api/visual-editor/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actions: actionsData,
          userConfirmed: true,
          userFeedback: `User saved ${actionsData.length} visual edits`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Changes Saved & Learned! 🎓",
          description: result.message,
        });
        
        // Clear local changes
        setChanges([]);
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('[Visual Editor] Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Could not save changes",
        variant: "destructive",
      });
    }
  };

  const handleGenerateCode = async () => {
    if (!selectedElement) return;
    
    setIsGenerating(true);
    try {
      // AI generates optimized code for current element
      const code = await generateElementCode(selectedElement);
      setShowCode(true);
      
      toast({
        title: "Code Generated",
        description: "AI optimized your visual changes",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      document.addEventListener('click', handleElementClick, true);
      return () => {
        document.removeEventListener('click', handleElementClick, true);
      };
    }
  }, [enabled, selectedElement]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Info Panel when not in edit mode */}
      {!enabled && (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4">
                <Edit3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Visual Page Editor
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Edit any page visually with drag-and-drop controls. Click, select, and modify elements in real-time with AI assistance.
            </p>
            <Button
              size="lg"
              onClick={() => handleToggle(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              data-testid="button-activate-editor"
            >
              <Edit3 className="h-5 w-5 mr-2" />
              Activate Visual Editor
            </Button>
          </div>
        </div>
      )}

      {/* Editor Active State */}
      {enabled && (
        <>
          {/* Visual Editor Controls */}
          <div 
            className="visual-editor-controls fixed top-4 right-4 z-[9999] bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 flex items-center gap-2"
            data-testid="visual-editor-controls"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCode(!showCode)}
              data-testid="button-toggle-code"
            >
              <Code className="h-4 w-4 mr-1" />
              {showCode ? 'Hide' : 'Show'} Code
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateCode}
              disabled={!selectedElement || isGenerating}
              data-testid="button-generate-code"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              AI Generate
            </Button>

            <Button
              size="sm"
              variant="default"
              onClick={handleSaveChanges}
              disabled={changes.length === 0}
              data-testid="button-save-changes"
            >
              <Save className="h-4 w-4 mr-1" />
              Save ({changes.length})
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleToggle(false)}
              data-testid="button-exit-editor"
            >
              <X className="h-4 w-4 mr-1" />
              Exit
            </Button>
          </div>

          {/* Selection Layer - highlights selected element */}
          <SelectionLayer
            selectedElement={selectedElement}
            onStyleChange={handleStyleChange}
          />

          {/* Change Tracker - shows all modifications */}
          <ChangeTracker
            changes={changes}
            onUndo={(index) => {
              const change = changes[index];
              if (change.element) {
                change.element.style[change.property] = change.oldValue;
              }
              setChanges(changes.filter((_, i) => i !== index));
            }}
          />

          {/* AI Code Generator - shows generated code */}
          {showCode && selectedElement && (
            <AICodeGenerator
              element={selectedElement}
              changes={changes.filter(c => c.element === selectedElement)}
              onClose={() => setShowCode(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

async function generateElementCode(element: HTMLElement): Promise<string> {
  // Simulate AI code generation (in production: call OpenAI)
  return new Promise((resolve) => {
    setTimeout(() => {
      const styles = window.getComputedStyle(element);
      const code = `
// Generated by Agent #78 AI
<div className="${element.className}">
  ${element.textContent}
</div>

// Optimized styles
.${element.className.split(' ')[0]} {
  display: ${styles.display};
  padding: ${styles.padding};
  background: ${styles.background};
  border-radius: ${styles.borderRadius};
}
      `.trim();
      resolve(code);
    }, 1000);
  });
}
