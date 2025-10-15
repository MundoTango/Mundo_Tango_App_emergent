/**
 * VISUAL EDITOR OVERLAY
 * Split-screen overlay for any page: Live Preview + Mr Blue Chat
 * Activates with ?edit=true URL parameter
 * Part of Phase 12 Autonomous Learning System
 */

import { useState, useEffect } from 'react';
import { X, Eye, Code, Maximize2, Minimize2 } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanel Group } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVisualEditorTracker } from '@/lib/autonomy/VisualEditorTracker';
import { useAuth } from '@/hooks/useAuth';

interface VisualEditorOverlayProps {
  currentUrl: string;
  onClose: () => void;
}

export function VisualEditorOverlay({ currentUrl, onClose }: VisualEditorOverlayProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [recentEdits, setRecentEdits] = useState<any[]>([]);
  const tracker = getVisualEditorTracker();

  // Subscribe to tracker updates
  useEffect(() => {
    const unsubscribe = tracker.subscribe((actions) => {
      setRecentEdits(tracker.getRecentActions(5));
    });
    return unsubscribe;
  }, [tracker]);

  // Super admin only
  if (user?.role !== 'super_admin') {
    return null;
  }

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
            {/* LEFT PANEL: Live Preview */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
                <div className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Live Preview</span>
                  </div>
                </div>
                
                <div className="flex-1 relative">
                  <iframe
                    src={currentUrl}
                    className="w-full h-full border-0"
                    title="Live Preview"
                    data-testid="preview-iframe"
                  />
                  
                  {/* Component overlay will go here */}
                  <div 
                    id="component-selection-overlay"
                    className="absolute inset-0 pointer-events-none"
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* RIGHT PANEL: Mr Blue Chat */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Mr Blue AI</span>
                  </div>
                </div>

                {/* Chat interface (will integrate MrBlueChat) */}
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <p className="text-sm">Mr Blue Chat Integration</p>
                    <p className="text-xs text-gray-400 mt-2">Coming in next step</p>
                  </div>
                </div>

                {/* Recent edits sidebar */}
                {recentEdits.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Recent Edits
                    </h4>
                    <div className="space-y-2">
                      {recentEdits.map((edit, i) => (
                        <div key={i} className="text-xs text-gray-600 dark:text-gray-400">
                          • {edit.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
