/**
 * MB.MD Visual Editor Tracker
 * Tracks ALL changes made in Visual Editor for autonomous learning
 * 
 * Usage:
 * <VisualEditorTracker isActive={true} onChangeDetected={handleChange} />
 */

import { useEffect, useRef, useCallback } from 'react';

export interface VisualEditorChange {
  type: 'attribute' | 'text' | 'style' | 'class' | 'structure';
  componentId: string;
  target: Element;
  attributeName?: string;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
  userId?: number;
}

interface VisualEditorTrackerProps {
  isActive: boolean;
  onChangeDetected: (change: VisualEditorChange) => void;
  userId?: number;
}

export function VisualEditorTracker({ 
  isActive, 
  onChangeDetected,
  userId 
}: VisualEditorTrackerProps) {
  const observerRef = useRef<MutationObserver | null>(null);
  const changeCountRef = useRef<number>(0);

  // Extract component ID from element (data-component-id or closest parent with it)
  const getComponentId = useCallback((element: Element): string => {
    const dataId = element.getAttribute('data-component-id');
    if (dataId) return dataId;

    // Try to find in parents
    let parent = element.parentElement;
    while (parent) {
      const parentId = parent.getAttribute('data-component-id');
      if (parentId) return parentId;
      parent = parent.parentElement;
    }

    // Fallback: generate from element info
    const tagName = element.tagName.toLowerCase();
    const className = element.className;
    return `${tagName}-${className.split(' ')[0] || 'unknown'}`;
  }, []);

  // Determine change type from mutation
  const getChangeType = useCallback((mutation: MutationRecord): VisualEditorChange['type'] => {
    if (mutation.type === 'attributes') {
      const attrName = mutation.attributeName;
      if (attrName === 'style') return 'style';
      if (attrName === 'class') return 'class';
      return 'attribute';
    }
    if (mutation.type === 'characterData') return 'text';
    if (mutation.type === 'childList') return 'structure';
    return 'attribute';
  }, []);

  useEffect(() => {
    if (!isActive) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }

    console.log('🎨 [VisualEditorTracker] Starting to track changes...');

    // Create mutation observer to watch DOM changes
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Skip mutations from tracking system itself
        if ((mutation.target as Element).getAttribute?.('data-tracker') === 'true') {
          return;
        }

        const changeType = getChangeType(mutation);
        const componentId = getComponentId(mutation.target as Element);

        let oldValue: string | null = null;
        let newValue: string | null = null;
        let attributeName: string | undefined = undefined;

        if (mutation.type === 'attributes' && mutation.attributeName) {
          attributeName = mutation.attributeName;
          oldValue = mutation.oldValue;
          newValue = (mutation.target as Element).getAttribute(mutation.attributeName);
        } else if (mutation.type === 'characterData') {
          oldValue = mutation.oldValue;
          newValue = mutation.target.textContent;
        }

        const change: VisualEditorChange = {
          type: changeType,
          componentId,
          target: mutation.target as Element,
          attributeName,
          oldValue,
          newValue,
          timestamp: new Date().toISOString(),
          userId
        };

        changeCountRef.current += 1;
        console.log(`🔍 [VisualEditorTracker] Change #${changeCountRef.current}:`, {
          type: change.type,
          componentId: change.componentId,
          attribute: change.attributeName,
          oldValue: change.oldValue?.substring(0, 50),
          newValue: change.newValue?.substring(0, 50)
        });

        onChangeDetected(change);
      });
    });

    // Observe the entire document with comprehensive settings
    observerRef.current.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true
    });

    return () => {
      if (observerRef.current) {
        console.log(`🎨 [VisualEditorTracker] Stopped tracking. Total changes: ${changeCountRef.current}`);
        observerRef.current.disconnect();
        observerRef.current = null;
        changeCountRef.current = 0;
      }
    };
  }, [isActive, onChangeDetected, userId, getComponentId, getChangeType]);

  // This component doesn't render anything
  return null;
}
