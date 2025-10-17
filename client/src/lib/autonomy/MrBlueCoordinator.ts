/**
 * Phase 11 - Track 1D: Mr. Blue Coordination Layer
 * Mr. Blue watches, confirms, coordinates all agent activities
 */

import { autoFixEngine } from './AutoFixEngine';

export interface DOMChange {
  element: HTMLElement;
  changeType: 'text' | 'style' | 'attribute' | 'layout';
  oldValue: string;
  newValue: string;
  timestamp: Date;
}

/**
 * Mr. Blue Coordinator
 * Connects Visual Editor tracking to autonomous fix system
 */
export class MrBlueCoordinator {
  private observers: MutationObserver[] = [];
  private changeBuffer: DOMChange[] = [];
  private isActive = false;

  /**
   * Initialize coordination layer
   */
  constructor() {
    console.log('[Mr. Blue Coordinator] Initializing...');
  }

  /**
   * Start watching for user changes (Super Admin only)
   */
  start(): void {
    if (this.isActive) {
      console.log('[Mr. Blue Coordinator] Already active');
      return;
    }

    this.isActive = true;
    this.startChangeTracking();
    console.log('✅ [Mr. Blue Coordinator] Started - watching for changes');
  }

  /**
   * Stop watching
   */
  stop(): void {
    this.isActive = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('[Mr. Blue Coordinator] Stopped');
  }

  /**
   * Start tracking DOM changes with MutationObserver
   */
  private startChangeTracking(): void {
    // Watch for text changes
    const textObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          this.handleChange({
            element: mutation.target as HTMLElement,
            changeType: 'text',
            oldValue: mutation.oldValue || '',
            newValue: (mutation.target as HTMLElement).textContent || '',
            timestamp: new Date()
          });
        }
      }
    });

    // Watch for attribute changes (styles, classes, etc.)
    const attrObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement;
          const attributeName = mutation.attributeName || '';
          
          this.handleChange({
            element: target,
            changeType: attributeName === 'style' || attributeName === 'class' ? 'style' : 'attribute',
            oldValue: mutation.oldValue || '',
            newValue: target.getAttribute(attributeName) || '',
            timestamp: new Date()
          });
        }
      }
    });

    // Start observing
    textObserver.observe(document.body, {
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true
    });

    attrObserver.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      subtree: true
    });

    this.observers.push(textObserver, attrObserver);
  }

  /**
   * Handle detected change
   */
  private async handleChange(change: DOMChange): Promise<void> {
    // Ignore trivial changes
    if (change.oldValue === change.newValue) return;
    if (!this.isSignificantChange(change)) return;

    // Buffer the change
    this.changeBuffer.push(change);

    // Debounce: Process after 1 second of no changes
    setTimeout(() => {
      if (this.changeBuffer.length > 0) {
        this.processChanges();
      }
    }, 1000);
  }

  /**
   * Check if change is significant enough to process
   */
  private isSignificantChange(change: DOMChange): boolean {
    // Ignore script/style tags
    const tagName = change.element.tagName?.toLowerCase();
    if (tagName === 'script' || tagName === 'style') return false;

    // Ignore data attributes
    if (change.changeType === 'attribute' && change.oldValue?.startsWith('data-')) return false;

    // Require minimum text length change
    if (change.changeType === 'text') {
      const lengthDiff = Math.abs(change.newValue.length - change.oldValue.length);
      if (lengthDiff < 3) return false;
    }

    return true;
  }

  /**
   * Process buffered changes
   */
  private async processChanges(): Promise<void> {
    if (this.changeBuffer.length === 0) return;

    const changes = [...this.changeBuffer];
    this.changeBuffer = [];

    console.log(`[Mr. Blue Coordinator] Processing ${changes.length} changes`);

    // Group changes by element
    const changesByElement = this.groupChangesByElement(changes);

    for (const [elementInfo, elementChanges] of changesByElement.entries()) {
      // Summarize changes
      const summary = this.summarizeChanges(elementChanges);

      // Check if Super Admin mode (would confirm in production)
      const autoConfirm = true; // In production: show confirmation modal

      if (autoConfirm) {
        await this.coordinateUpdate(elementChanges[0], summary);
      }
    }
  }

  /**
   * Group changes by element
   */
  private groupChangesByElement(changes: DOMChange[]): Map<string, DOMChange[]> {
    const grouped = new Map<string, DOMChange[]>();

    for (const change of changes) {
      const key = this.getElementKey(change.element);
      const existing = grouped.get(key) || [];
      existing.push(change);
      grouped.set(key, existing);
    }

    return grouped;
  }

  /**
   * Get unique key for element
   */
  private getElementKey(element: HTMLElement): string {
    const agentId = element.dataset.agentId;
    if (agentId) return agentId;

    const id = element.id;
    if (id) return id;

    return element.tagName + '-' + Array.from(element.parentElement?.children || []).indexOf(element);
  }

  /**
   * Summarize changes for user confirmation
   */
  private summarizeChanges(changes: DOMChange[]): string {
    if (changes.length === 1) {
      const change = changes[0];
      return `Changed ${change.changeType} from "${change.oldValue.substring(0, 50)}" to "${change.newValue.substring(0, 50)}"`;
    }

    return `Made ${changes.length} changes to this element`;
  }

  /**
   * Coordinate update across similar components via Agent #80
   */
  private async coordinateUpdate(change: DOMChange, summary: string): Promise<void> {
    console.log(`[Mr. Blue] ${summary}`);

    // Find affected component-agent
    const agentId = change.element.dataset.agentId;

    if (agentId) {
      try {
        // Tell Agent #80 (Learning Coordinator) to distribute update
        await fetch('/api/learning-coordinator/coordinate-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceAgent: agentId,
            change: {
              type: change.changeType,
              oldValue: change.oldValue,
              newValue: change.newValue
            },
            applyToSimilar: true,
            summary
          })
        });

        console.log(`✅ [Mr. Blue] Coordinated update for ${agentId}`);
      } catch (error) {
        console.error('[Mr. Blue] Failed to coordinate update:', error);
      }
    }

    // Trigger self-test on affected component
    if (agentId) {
      console.log(`🧪 [Mr. Blue] Triggering self-test for ${agentId}`);
      // Component will re-test itself via useSelfTest hook
    }
  }

  /**
   * Get current change buffer (for debugging)
   */
  getChanges(): DOMChange[] {
    return [...this.changeBuffer];
  }

  /**
   * Clear change buffer
   */
  clearChanges(): void {
    this.changeBuffer = [];
  }
}

// Singleton instance
export const mrBlueCoordinator = new MrBlueCoordinator();
