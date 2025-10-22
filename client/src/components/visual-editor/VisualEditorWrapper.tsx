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
import { ElementInspector } from './ElementInspector';
import PreviewTab from './PreviewTab';
import DeployTab from './DeployTab';
import GitTab from './GitTab';
import PagesTab from './PagesTab';
import ShellTab from './ShellTab';
import FilesTab from './FilesTab';
import AITab from './AITab';
import ConsoleTab from './ConsoleTab';
import SecretsTab from './SecretsTab';
import { ModelMonitorTab } from './ModelMonitorTab';
import { WhatDoesThisDoPanel } from './WhatDoesThisDoPanel';
import { InlineTextEditor } from './InlineTextEditor';
import { UniversalSaveSystem } from './UniversalSaveSystem';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';

interface SelectedElement {
  tag: string;
  id?: string;
  className?: string;
  innerHTML?: string;
  xpath: string;
}

interface Change {
  id: string;
  timestamp: Date;
  elementSelector: string;
  changeType: 'style' | 'content' | 'layout' | 'delete';
  before: any;
  after: any;
}

export default function VisualEditorWrapper({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('ai');
  const [changes, setChanges] = useState<Change[]>([]);
  const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
  const [selectedHTMLElement, setSelectedHTMLElement] = useState<HTMLElement | null>(null);
  
  // 🔍 INSPECTOR MODE: Page vs Sidebar (Oct 22, 2025)
  const [inspectorMode, setInspectorMode] = useState<'page' | 'sidebar'>('page');
  
  // 🎨 VISUAL EDITOR CONTEXT: Share selected element with Mr Blue (Phase 2 Fix - Oct 22)
  const visualEditorContext = useVisualEditorOptional();

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
    
    // MB.MD: Click = INSPECT, Cmd+Click = NORMAL (User requested Oct 22, 2025)
    // Default click = Inspector mode (block normal behavior)
    // Cmd/Ctrl+Click = Normal navigation (don't inspect, just navigate)
    if (e.metaKey || e.ctrlKey) {
      // Let the normal click behavior happen (navigation, etc.)
      return;
    }
    
    // For normal clicks without modifier keys, intercept for inspection
    
    const target = e.target as HTMLElement;
    const isSidebarElement = !!target.closest('[data-testid="visual-editor-sidebar"]');
    
    // 🔍 INSPECTOR MODE LOGIC (Oct 22, 2025)
    if (inspectorMode === 'page') {
      // Page mode: Skip sidebar elements (allow normal sidebar clicks)
      if (isSidebarElement) return;
    } else if (inspectorMode === 'sidebar') {
      // Sidebar mode: ONLY inspect sidebar elements
      if (!isSidebarElement) return;
    }
    
    // NOW block the event for selected elements
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

    const elementData = {
      tag: target.tagName.toLowerCase(),
      id: target.id || undefined,
      className: target.className || undefined,
      innerHTML: target.innerHTML?.substring(0, 100) || undefined,
      xpath: getXPath(target)
    };
    
    setSelectedElement(elementData);
    
    // 🎨 PHASE 2 FIX: Update Visual Editor Context for Mr Blue integration
    if (visualEditorContext) {
      const rect = target.getBoundingClientRect();
      console.log('🎨 [VisualEditorWrapper] Setting selected element in context:', {
        tagName: target.tagName.toLowerCase(),
        id: target.id,
        className: target.className
      });
      visualEditorContext.setSelectedElement({
        tagName: target.tagName.toLowerCase(),
        id: target.id || undefined,
        className: target.className || undefined,
        xpath: getXPath(target),
        computedStyles: {},
        boundingBox: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        attributes: {}
      });
    } else {
      console.warn('⚠️ [VisualEditorWrapper] VisualEditorContext not available - element selection will not reach Mr Blue');
    }
    
    // MB.MD: Store actual HTML element for inline editing
    setSelectedHTMLElement(target);

    // Visual feedback
    document.querySelectorAll('[data-visual-editor-selected]').forEach(el => {
      el.removeAttribute('data-visual-editor-selected');
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.boxShadow = '';
    });
    
    target.setAttribute('data-visual-editor-selected', 'true');
    // MB.MD: Different colors for page vs sidebar inspection
    const outlineColor = inspectorMode === 'sidebar' ? '#3b82f6' : '#a855f7'; // Blue for sidebar, Purple for page
    target.style.outline = `2px solid ${outlineColor}`;
    target.style.outlineOffset = '2px';
    target.style.boxShadow = inspectorMode === 'sidebar' 
      ? '0 0 0 4px rgba(59, 130, 246, 0.2)' 
      : '0 0 0 4px rgba(168, 85, 247, 0.2)';

    toast({
      title: `${inspectorMode === 'sidebar' ? '🔍 Sidebar' : '📄 Page'} Element Selected`,
      description: `<${target.tagName.toLowerCase()}> ${target.id ? `#${target.id}` : ''} • Double-click to edit text`,
      duration: 2000
    });
  }, [isSelectMode, inspectorMode, toast]);

  // MB.MD: Double-click to edit text inline
  const handleElementDoubleClick = useCallback((e: MouseEvent) => {
    if (!isSelectMode || !selectedHTMLElement) return;
    
    const target = e.target as HTMLElement;
    
    // Only allow text editing on selected element
    if (target === selectedHTMLElement) {
      e.preventDefault();
      e.stopPropagation();
      setEditingElement(selectedHTMLElement);
    }
  }, [isSelectMode, selectedHTMLElement]);

  // Add/remove click listener
  useEffect(() => {
    if (isSelectMode) {
      document.addEventListener('click', handleElementClick, true);
      document.addEventListener('dblclick', handleElementDoubleClick, true);
      document.body.style.cursor = 'crosshair';
      
      return () => {
        document.removeEventListener('click', handleElementClick, true);
        document.removeEventListener('dblclick', handleElementDoubleClick, true);
        document.body.style.cursor = '';
      };
    }
  }, [isSelectMode, handleElementClick, handleElementDoubleClick]);

  // MB.MD: Handle inline text editing save
  const handleSaveInlineText = (newText: string) => {
    if (!editingElement || !selectedElement) return;
    
    const oldText = editingElement.textContent || '';
    editingElement.textContent = newText;
    
    // Track change in Universal Save system
    const change: Change = {
      id: Date.now().toString(),
      timestamp: new Date(),
      elementSelector: selectedElement.xpath,
      changeType: 'content',
      before: { text: oldText },
      after: { text: newText }
    };
    
    setChanges(prev => [...prev, change]);
    setEditingElement(null);
  };

  const handleCancelInlineEdit = () => {
    setEditingElement(null);
  };

  const handleSaveComplete = () => {
    setChanges([]);
    toast({
      title: "All Changes Saved",
      description: "Your edits are now live!",
      duration: 3000
    });
  };

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
      
      {/* MB.MD: Inline Text Editor */}
      {editingElement && (
        <InlineTextEditor
          element={editingElement}
          onSave={handleSaveInlineText}
          onCancel={handleCancelInlineEdit}
        />
      )}

      {isEditorActive && (
        <>
          {/* Overlay hint */}
          {isSelectMode && !selectedElement && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-40 animate-pulse">
              <p className="text-sm font-medium">⌘+Click (Cmd+Click) any element to inspect it</p>
              <p className="text-xs mt-1 opacity-80">Figma-style element selection • Double-click to edit text</p>
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
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Visual Editor</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Page Editor</p>
                </div>
              </div>
              
              {/* 🔍 Inspector Mode Toggle (Oct 22, 2025) */}
              <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setInspectorMode('page')}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    inspectorMode === 'page'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  data-testid="inspector-mode-page"
                  title="Inspect page elements (purple outline)"
                >
                  📄 Page
                </button>
                <button
                  onClick={() => setInspectorMode('sidebar')}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    inspectorMode === 'sidebar'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  data-testid="inspector-mode-sidebar"
                  title="Inspect sidebar elements (blue outline)"
                >
                  🔍 Sidebar
                </button>
              </div>
              
              <TabSystem
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={handleClose}
              />
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {activeTab === 'inspector' && (
                <ElementInspector 
                  selectedElement={visualEditorContext?.selectedElement ?? null} 
                />
              )}
              {activeTab === 'preview' && <PreviewTab currentPath={location} />}
              {activeTab === 'deploy' && <DeployTab />}
              {activeTab === 'git' && <GitTab />}
              {activeTab === 'models' && <ModelMonitorTab />}
              {activeTab === 'pages' && <PagesTab />}
              {activeTab === 'shell' && <ShellTab />}
              {activeTab === 'files' && <FilesTab />}
              {activeTab === 'console' && <ConsoleTab />}
              {activeTab === 'secrets' && <SecretsTab />}
              {activeTab === 'ai' && (
                <>
                  {/* MB.MD: Universal Save System */}
                  <UniversalSaveSystem 
                    changes={changes} 
                    onSaveComplete={handleSaveComplete}
                  />
                  
                  {/* MB.MD: What Does This Element Do? Panel */}
                  <WhatDoesThisDoPanel selectedElement={selectedElement} />
                  
                  {/* AI Code Generation */}
                  <AITab
                    selectedElement={selectedElement}
                    onGenerateCode={handleGenerateCode}
                  />
                </>
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
