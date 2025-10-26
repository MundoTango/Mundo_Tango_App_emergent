/**
 * AGENT #147: Click-to-Select System
 * Hover outlines, element selection, DOM traversal
 * MB.MD: Visual Editor foundation for "point and ask" workflow
 */

import { useState, useEffect, useCallback } from 'react';
import { useVisualEditor } from '@/contexts/VisualEditorContext';

export interface SelectedElementData {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  attributes: Record<string, string>;
  computedStyles: Record<string, string>; // Changed to match ElementSelection
  xpath: string; // Unique identifier for element
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface ClickToSelectSystemProps {
  enabled: boolean;
  onElementSelected?: (element: SelectedElementData) => void;
}

export function ClickToSelectSystem({ enabled, onElementSelected }: ClickToSelectSystemProps) {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const { setSelectedElement } = useVisualEditor();
  
  /**
   * Generate XPath for an element (unique identifier)
   */
  const getXPath = useCallback((element: HTMLElement): string => {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    const parts: string[] = [];
    let current: HTMLElement | null = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling: Element | null = current.previousElementSibling;
      
      while (sibling) {
        if (sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }
      
      const tagName = current.nodeName.toLowerCase();
      const pathIndex = index > 0 ? `[${index + 1}]` : '';
      parts.unshift(`${tagName}${pathIndex}`);
      
      current = current.parentElement;
    }
    
    return `/${parts.join('/')}`;
  }, []);
  
  /**
   * Extract comprehensive element data
   */
  const extractElementData = useCallback((element: HTMLElement): SelectedElementData => {
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    // Get all attributes
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    
    // Convert computed style to Record<string, string>
    const computedStyles: Record<string, string> = {
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      width: computedStyle.width,
      height: computedStyle.height,
      padding: computedStyle.padding,
      margin: computedStyle.margin,
      display: computedStyle.display,
      position: computedStyle.position,
    };
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      textContent: element.textContent?.trim().substring(0, 100) || undefined,
      attributes,
      computedStyles,
      xpath: getXPath(element),
      boundingBox: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    };
  }, [getXPath]);
  
  /**
   * Mouse move handler - show hover outline
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled) return;
    
    const target = e.target as HTMLElement;
    
    // Ignore overlay elements
    if (target.closest('[data-visual-editor-overlay]')) {
      return;
    }
    
    setHoveredElement(target);
  }, [enabled]);
  
  /**
   * Click handler - select element
   */
  const handleClick = useCallback((e: MouseEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // Ignore overlay elements
    if (target.closest('[data-visual-editor-overlay]')) {
      return;
    }
    
    const elementData = extractElementData(target);
    
    console.log('✅ [ClickToSelect] Element selected:', elementData);
    
    // Update context
    setSelectedElement(elementData);
    
    // Notify parent
    onElementSelected?.(elementData);
    
    // Clear hover
    setHoveredElement(null);
  }, [enabled, extractElementData, setSelectedElement, onElementSelected]);
  
  /**
   * Attach/detach event listeners
   */
  useEffect(() => {
    if (!enabled) {
      setHoveredElement(null);
      return;
    }
    
    const iframe = document.querySelector('iframe[data-visual-editor-preview]') as HTMLIFrameElement;
    const targetDocument = iframe?.contentDocument || document;
    
    targetDocument.addEventListener('mousemove', handleMouseMove);
    targetDocument.addEventListener('click', handleClick);
    
    return () => {
      targetDocument.removeEventListener('mousemove', handleMouseMove);
      targetDocument.removeEventListener('click', handleClick);
    };
  }, [enabled, handleMouseMove, handleClick]);
  
  /**
   * Render hover outline
   */
  if (!enabled || !hoveredElement) {
    return null;
  }
  
  const rect = hoveredElement.getBoundingClientRect();
  
  return (
    <div
      data-visual-editor-overlay
      style={{
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        border: '2px solid #0EA5E9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        pointerEvents: 'none',
        zIndex: 999999,
        transition: 'all 0.1s ease',
      }}
    >
      {/* Element tag badge */}
      <div
        style={{
          position: 'absolute',
          top: '-24px',
          left: '0',
          backgroundColor: '#0EA5E9',
          color: 'white',
          padding: '2px 8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '4px 4px 0 0',
          whiteSpace: 'nowrap',
        }}
      >
        {hoveredElement.tagName.toLowerCase()}
        {hoveredElement.id && `#${hoveredElement.id}`}
        {hoveredElement.className && `.${hoveredElement.className.split(' ')[0]}`}
      </div>
    </div>
  );
}

/**
 * Keyboard shortcuts for element selection
 */
export function useElementNavigationShortcuts() {
  const { selectedElement, setSelectedElement } = useVisualEditor();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;
      
      // Find the actual DOM element from selected element data
      const currentElement = document.evaluate(
        selectedElement.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as HTMLElement;
      
      if (!currentElement) return;
      
      let nextElement: HTMLElement | null = null;
      
      // Arrow key navigation
      switch (e.key) {
        case 'ArrowUp':
          // Select parent
          nextElement = currentElement.parentElement;
          break;
        case 'ArrowDown':
          // Select first child
          nextElement = currentElement.firstElementChild as HTMLElement;
          break;
        case 'ArrowLeft':
          // Select previous sibling
          nextElement = currentElement.previousElementSibling as HTMLElement;
          break;
        case 'ArrowRight':
          // Select next sibling
          nextElement = currentElement.nextElementSibling as HTMLElement;
          break;
        case 'Escape':
          // Deselect
          setSelectedElement(null);
          return;
      }
      
      if (nextElement) {
        e.preventDefault();
        // Extract data and update selection
        const getXPath = (element: HTMLElement): string => {
          if (element.id) return `//*[@id="${element.id}"]`;
          // Simplified XPath for navigation
          return element.tagName.toLowerCase();
        };
        
        const computedStyle = window.getComputedStyle(nextElement);
        const rect = nextElement.getBoundingClientRect();
        
        const attributes: Record<string, string> = {};
        for (let i = 0; i < nextElement.attributes.length; i++) {
          const attr = nextElement.attributes[i];
          attributes[attr.name] = attr.value;
        }
        
        setSelectedElement({
          tagName: nextElement.tagName.toLowerCase(),
          id: nextElement.id || undefined,
          className: nextElement.className || undefined,
          textContent: nextElement.textContent?.trim().substring(0, 100) || undefined,
          attributes,
          computedStyles: {
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor,
            fontSize: computedStyle.fontSize,
          },
          xpath: getXPath(nextElement),
          boundingBox: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, setSelectedElement]);
}
