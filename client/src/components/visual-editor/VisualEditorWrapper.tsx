/**
 * VISUAL EDITOR WRAPPER - Main Controller
 * 
 * MB.MD Architecture:
 * - Activates on ?edit=true URL parameter
 * - Click-to-select element inspector
 * - AI code generation integration
 * - Replit-style UX
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import TabSystem, { EditorTab } from './TabSystem';
import PreviewTab from './PreviewTab';
import DeployTab from './DeployTab';
import GitTab from './GitTab';
import PagesTab from './PagesTab';
import ShellTab from './ShellTab';
import FilesTab from './FilesTab';
import AITab from './AITab';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SelectedElement {
  tag: string;
  id?: string;
  className?: string;
  innerHTML?: string;
  xpath: string;
}

export default function VisualEditorWrapper({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('ai');

  // Check if edit mode is enabled via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';
    setIsEditorActive(editMode);
    setIsSelectMode(editMode);
  }, [location]);

  // Element selection click handler
  const handleElementClick = useCallback((e: MouseEvent) => {
    if (!isSelectMode) return;
    
    const target = e.target as HTMLElement;
    
    // Check if clicking the sidebar FIRST - allow normal clicks
    if (target.closest('[data-testid="visual-editor-sidebar"]')) {
      return; // Don't block sidebar interactions
    }
    
    // NOW block the event for page elements
    e.preventDefault();
    e.stopPropagation();

    // Get XPath
    const getXPath = (element: HTMLElement): string => {
      if (element.id) return `//*[@id="${element.id}"]`;
      
      const idx = (sib: HTMLElement, name: string): number => {
        let count = 1;
        let prev = sib.previousElementSibling;
        while (prev) {
          if (prev.nodeName === name) count++;
          prev = prev.previousElementSibling;
        }
        return count;
      };

      const segments: string[] = [];
      let currentElement: HTMLElement | null = element;
      
      while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
        const nodeName = currentElement.nodeName.toLowerCase();
        const index = idx(currentElement, currentElement.nodeName);
        segments.unshift(`${nodeName}[${index}]`);
        currentElement = currentElement.parentElement;
      }
      
      return segments.length ? `/${segments.join('/')}` : '';
    };

    setSelectedElement({
      tag: target.tagName.toLowerCase(),
      id: target.id || undefined,
      className: target.className || undefined,
      innerHTML: target.innerHTML?.substring(0, 100) || undefined,
      xpath: getXPath(target)
    });

    // Visual feedback
    document.querySelectorAll('[data-visual-editor-selected]').forEach(el => {
      el.removeAttribute('data-visual-editor-selected');
      (el as HTMLElement).style.outline = '';
    });
    
    target.setAttribute('data-visual-editor-selected', 'true');
    target.style.outline = '2px solid #3b82f6';
    target.style.outlineOffset = '2px';

    toast({
      title: "Element Selected",
      description: `<${target.tagName.toLowerCase()}> ${target.id ? `#${target.id}` : ''}`,
      duration: 2000
    });
  }, [isSelectMode, toast]);

  // Add/remove click listener
  useEffect(() => {
    if (isSelectMode) {
      document.addEventListener('click', handleElementClick, true);
      document.body.style.cursor = 'crosshair';
      
      return () => {
        document.removeEventListener('click', handleElementClick, true);
        document.body.style.cursor = '';
      };
    }
  }, [isSelectMode, handleElementClick]);

  // AI Code Generation
  const handleGenerateCode = async (prompt: string) => {
    if (!selectedElement) {
      toast({
        title: "No Element Selected",
        description: "Please select an element first",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest('/api/visual-editor/generate-code', {
        method: 'POST',
        body: JSON.stringify({
          changes: [{
            id: Date.now().toString(),
            timestamp: new Date(),
            elementSelector: selectedElement.xpath,
            elementPath: selectedElement.xpath,
            componentName: selectedElement.tag,
            changeType: 'style',
            before: {},
            after: { prompt },
            element: selectedElement
          }]
        })
      });

      toast({
        title: "Code Generated",
        description: "AI has generated the code changes. Check the preview!",
        duration: 3000
      });

      // In a real implementation, this would apply the changes
      console.log('Generated code:', response);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  // Preview staging URL
  const handlePreview = () => {
    const stagingUrl = `${window.location.origin}/staging${location}`;
    window.open(stagingUrl, '_blank');
    
    toast({
      title: "Preview Opened",
      description: "Staging URL opened in new tab",
      duration: 2000
    });
  };

  // Deploy to production
  const handleDeploy = async () => {
    try {
      await apiRequest('/api/visual-editor/deploy', {
        method: 'POST',
        body: JSON.stringify({
          page: location,
          element: selectedElement
        })
      });

      toast({
        title: "Deployed Successfully",
        description: "Changes are now live!",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Deploy Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setIsEditorActive(false);
    setIsSelectMode(false);
    setSelectedElement(null);
    
    // Remove URL parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.pushState({}, '', url);
    
    // Clear visual feedback
    document.querySelectorAll('[data-visual-editor-selected]').forEach(el => {
      el.removeAttribute('data-visual-editor-selected');
      (el as HTMLElement).style.outline = '';
    });
  };

  return (
    <>
      {children}
      
      {isEditorActive && (
        <>
          {/* Overlay hint */}
          {isSelectMode && !selectedElement && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-40 animate-pulse">
              <p className="text-sm font-medium">Click any element to inspect it</p>
            </div>
          )}

          {/* Replit-Style Visual Editor with Tab System */}
          <div 
            className="fixed right-0 top-0 h-screen w-[500px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 flex flex-col"
            data-testid="visual-editor-sidebar"
          >
            {/* Header with Tab System */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Visual Editor</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Page Editor</p>
                </div>
              </div>
              
              <TabSystem
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={handleClose}
              />
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'preview' && <PreviewTab currentPath={location} />}
              {activeTab === 'deploy' && <DeployTab />}
              {activeTab === 'git' && <GitTab />}
              {activeTab === 'pages' && <PagesTab />}
              {activeTab === 'shell' && <ShellTab />}
              {activeTab === 'files' && <FilesTab />}
              {activeTab === 'ai' && (
                <AITab
                  selectedElement={selectedElement}
                  onGenerateCode={handleGenerateCode}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                AI-powered by OpenAI GPT-4o
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
