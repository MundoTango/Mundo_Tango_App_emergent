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
import VisualEditorSidebar from './VisualEditorSidebar';
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
    
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    
    // Don't select the editor sidebar itself
    if (target.closest('[data-testid="visual-editor-sidebar"]')) {
      return;
    }

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
      const response = await apiRequest('/api/visual-editor/generate', {
        method: 'POST',
        body: JSON.stringify({
          element: selectedElement,
          prompt,
          currentPage: location
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

          <VisualEditorSidebar
            isOpen={isEditorActive}
            onClose={handleClose}
            selectedElement={selectedElement}
            onGenerateCode={handleGenerateCode}
            onPreview={handlePreview}
            onDeploy={handleDeploy}
          />
        </>
      )}
    </>
  );
}
