/**
 * VISUAL EDITOR OVERLAY
 * Complete integrated system: Live Preview + Component Selection + Edit Controls + Mr Blue AI
 * Activates with ?edit=true URL parameter
 * Part of Phase 12 Autonomous Learning System
 */

import { useState, useEffect } from 'react';
import { X, Eye, Maximize2, Minimize2 } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVisualEditorTracker } from '@/lib/autonomy/VisualEditorTracker';
import { useAuth } from '@/hooks/useAuth';
import { ComponentSelector, type SelectedComponent } from './ComponentSelector';
import { EditControls, type ComponentChanges } from './EditControls';
import { MrBlueVisualChat } from './MrBlueVisualChat';
import { DragDropHandler } from './DragDropHandler';

interface VisualEditorOverlayProps {
  currentUrl: string;
  onClose: () => void;
}

export function VisualEditorOverlay({ currentUrl, onClose }: VisualEditorOverlayProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [recentEdits, setRecentEdits] = useState<any[]>([]);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const tracker = getVisualEditorTracker();

  // Subscribe to tracker updates
  useEffect(() => {
    const unsubscribe = tracker.subscribe((actions) => {
      setRecentEdits(tracker.getRecentActions(5));
    });
    return unsubscribe;
  }, [tracker]);

  // Show edit panel when component is selected
  useEffect(() => {
    setShowEditPanel(!!selectedComponent);
  }, [selectedComponent]);

  // Super admin only
  if (user?.role !== 'super_admin') {
    return null;
  }

  const handleSelectComponent = (component: SelectedComponent) => {
    setSelectedComponent(component);
  };

  const handleDragPositionChange = (x: number, y: number) => {
    // Track position change in real-time
    if (selectedComponent) {
      tracker.trackMove(selectedComponent.testId, x - selectedComponent.bounds.left, y - selectedComponent.bounds.top);
    }
  };

  const handleSaveChanges = async (changes: ComponentChanges) => {
    // Apply changes to the actual element
    if (selectedComponent && changes) {
      // Register component in database
      await fetch('/api/components/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          componentName: selectedComponent.testId,
          componentPath: selectedComponent.path,
          componentType: selectedComponent.type as any,
        }),
      });

      // Close edit panel
      setShowEditPanel(false);
      setSelectedComponent(null);
    }
  };

  return (
    <div 
      className={`fixed ${isExpanded ? 'inset-0' : 'inset-0'} z-50 bg-black/5 backdrop-blur-sm`}
      data-testid="visual-editor-overlay"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600">
              Visual Editor
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Editing: {currentUrl}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-fullscreen"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              data-testid="button-close-editor"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Split-screen content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* LEFT PANEL: Live Preview with Component Selection */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
                <div className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Live Preview</span>
                    {selectedComponent && (
                      <Badge variant="default" className="ml-auto text-xs">
                        Selected: {selectedComponent.testId}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 relative">
                  <iframe
                    src={currentUrl}
                    className="w-full h-full border-0"
                    title="Live Preview"
                    data-testid="preview-iframe"
                  />
                  
                  {/* Component Selection Overlay */}
                  <ComponentSelector
                    enabled={true}
                    onSelectComponent={handleSelectComponent}
                  />

                  {/* Edit Controls Panel (floating) */}
                  {showEditPanel && selectedComponent && (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <EditControls
                        component={selectedComponent}
                        onSave={handleSaveChanges}
                        onCancel={() => {
                          setShowEditPanel(false);
                          setSelectedComponent(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Drag & Drop Handler */}
                  <DragDropHandler
                    enabled={!!selectedComponent}
                    selectedComponent={selectedComponent}
                    onPositionChange={handleDragPositionChange}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* RIGHT PANEL: Mr Blue Visual Chat */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <MrBlueVisualChat
                currentPage={currentUrl}
                selectedComponent={selectedComponent}
                recentEdits={recentEdits}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
