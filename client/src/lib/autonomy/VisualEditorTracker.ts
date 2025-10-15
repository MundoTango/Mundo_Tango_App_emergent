/**
 * ESA Visual Editor Action Tracker
 * Tracks all visual edits and sends to Mr Blue for confirmation + autonomous learning
 * Part of Phase 12 Component Autonomy System
 */

export interface VisualAction {
  type: 'select' | 'move' | 'resize' | 'textChange' | 'styleChange' | 'delete' | 'add';
  component: {
    id: string;
    name: string;
    path: string;
    testId?: string;
  };
  before?: any;
  after?: any;
  timestamp: Date;
  description?: string;
}

export class VisualEditorTracker {
  private actions: VisualAction[] = [];
  private maxHistory = 10;
  private listeners: ((actions: VisualAction[]) => void)[] = [];

  // ========================================
  // ACTION RECORDING
  // ========================================

  recordAction(action: VisualAction) {
    console.log('📝 [Visual Editor] Recording action:', action);
    
    // Add description for readability
    action.description = this.formatActionDescription(action);
    
    // Add to history (keep last 10)
    this.actions = [...this.actions.slice(-this.maxHistory + 1), action];
    
    // Notify listeners
    this.notifyListeners();
  }

  private formatActionDescription(action: VisualAction): string {
    switch (action.type) {
      case 'move':
        return `Moved ${action.component.name}`;
      case 'textChange':
        return `Changed ${action.component.name} text to "${action.after}"`;
      case 'styleChange':
        return `Updated ${action.component.name} style: ${action.before} → ${action.after}`;
      case 'resize':
        return `Resized ${action.component.name}`;
      case 'delete':
        return `Deleted ${action.component.name}`;
      case 'add':
        return `Added ${action.component.name}`;
      default:
        return `Modified ${action.component.name}`;
    }
  }

  // ========================================
  // ELEMENT TRACKING
  // ========================================

  private findComponent(element: HTMLElement): VisualAction['component'] | null {
    // Find nearest component with data attributes
    const componentEl = element.closest('[data-component-id], [data-testid]');
    if (!componentEl) return null;
    
    return {
      id: componentEl.getAttribute('data-component-id') || 
          componentEl.getAttribute('data-testid') || 
          `element-${Date.now()}`,
      name: componentEl.getAttribute('data-component-name') || 
            componentEl.tagName.toLowerCase(),
      path: this.getElementPath(componentEl as HTMLElement),
      testId: componentEl.getAttribute('data-testid') || undefined,
    };
  }

  private getElementPath(element: HTMLElement): string {
    const path: string[] = [];
    let current: HTMLElement | null = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      // Add ID if exists
      if (current.id) {
        selector += `#${current.id}`;
      }
      
      // Add class if exists
      const classes = Array.from(current.classList)
        .filter(c => !c.startsWith('hover:') && !c.startsWith('dark:'))
        .slice(0, 2);
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  attachClickListener(editorElement: HTMLElement) {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const component = this.findComponent(target);
      
      if (component) {
        this.recordAction({
          type: 'select',
          component,
          timestamp: new Date(),
        });
      }
    };
    
    editorElement.addEventListener('click', handler, true);
    return () => editorElement.removeEventListener('click', handler, true);
  }

  attachDragListener(editorElement: HTMLElement) {
    let draggedComponent: VisualAction['component'] | null = null;
    let startPosition: { x: number; y: number } = { x: 0, y: 0 };

    const startHandler = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      draggedComponent = this.findComponent(target);
      
      if (draggedComponent) {
        const rect = target.getBoundingClientRect();
        startPosition = { x: rect.left, y: rect.top };
      }
    };

    const endHandler = (e: DragEvent) => {
      if (!draggedComponent) return;
      
      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const endPosition = { x: rect.left, y: rect.top };

      this.recordAction({
        type: 'move',
        component: draggedComponent,
        before: startPosition,
        after: endPosition,
        timestamp: new Date(),
      });

      draggedComponent = null;
    };

    editorElement.addEventListener('dragstart', startHandler);
    editorElement.addEventListener('dragend', endHandler);
    
    return () => {
      editorElement.removeEventListener('dragstart', startHandler);
      editorElement.removeEventListener('dragend', endHandler);
    };
  }

  attachStyleListener(editorElement: HTMLElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'style') {
          const element = mutation.target as HTMLElement;
          const component = this.findComponent(element);
          
          if (component) {
            this.recordAction({
              type: 'styleChange',
              component,
              before: mutation.oldValue,
              after: element.getAttribute('style'),
              timestamp: new Date(),
            });
          }
        }
      });
    });

    observer.observe(editorElement, {
      attributes: true,
      attributeOldValue: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }

  // ========================================
  // DATA ACCESS
  // ========================================

  getActions(): VisualAction[] {
    return [...this.actions];
  }

  getRecentActions(count: number = 5): VisualAction[] {
    return this.actions.slice(-count);
  }

  clearActions() {
    this.actions = [];
    this.notifyListeners();
  }

  // ========================================
  // OBSERVERS
  // ========================================

  subscribe(listener: (actions: VisualAction[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.actions]));
  }

  // ========================================
  // MR BLUE INTEGRATION
  // ========================================

  /**
   * Format actions for Mr Blue context
   * Returns human-readable summary of recent changes
   */
  getContextForMrBlue(): string {
    if (this.actions.length === 0) {
      return 'No recent visual edits';
    }

    const recent = this.getRecentActions(3);
    const descriptions = recent.map(a => a.description || 'Unknown action');
    
    return `Recent edits: ${descriptions.join(', ')}`;
  }

  /**
   * Get structured data for Mr Blue API
   */
  getDataForMrBlue(): Array<{
    type: string;
    component: string;
    details?: any;
  }> {
    return this.actions.map(action => ({
      type: action.type,
      component: action.component.name,
      details: action.before && action.after ? {
        from: action.before,
        to: action.after,
      } : undefined,
    }));
  }
}

// Singleton instance
let trackerInstance: VisualEditorTracker | null = null;

export function getVisualEditorTracker(): VisualEditorTracker {
  if (!trackerInstance) {
    trackerInstance = new VisualEditorTracker();
  }
  return trackerInstance;
}
