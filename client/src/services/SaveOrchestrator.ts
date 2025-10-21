/**
 * Save Orchestrator - Universal Change Persistence
 * Handles saving ALL types of changes across the application
 * MB.MD Track 2 - Universal Save System
 */

import type { StyleMutation } from '@/lib/visual-editor/iframeMessaging';

export interface PendingChange {
  id: string;
  type: 'style' | 'content' | 'structure' | 'chat';
  description: string;
  data: any;
  timestamp: number;
}

export class SaveOrchestrator {
  private pendingChanges: PendingChange[] = [];
  private listeners: Set<(changes: PendingChange[]) => void> = new Set();

  /**
   * Add a pending change to the queue
   */
  addChange(change: Omit<PendingChange, 'id' | 'timestamp'>) {
    const fullChange: PendingChange = {
      ...change,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    this.pendingChanges.push(fullChange);
    this.notifyListeners();
  }

  /**
   * Get all pending changes
   */
  getPendingChanges(): PendingChange[] {
    return [...this.pendingChanges];
  }

  /**
   * Save all pending changes
   */
  async saveAll(): Promise<{ success: boolean; message: string }> {
    if (this.pendingChanges.length === 0) {
      return { success: false, message: 'No changes to save' };
    }

    try {
      // Group changes by type
      const styleChanges = this.pendingChanges.filter(c => c.type === 'style');
      const contentChanges = this.pendingChanges.filter(c => c.type === 'content');
      const structureChanges = this.pendingChanges.filter(c => c.type === 'structure');
      const chatChanges = this.pendingChanges.filter(c => c.type === 'chat');

      // Save style changes via AI code generation
      if (styleChanges.length > 0) {
        await this.saveStyleChanges(styleChanges);
      }

      // Save content changes directly to files
      if (contentChanges.length > 0) {
        await this.saveContentChanges(contentChanges);
      }

      // Save structure changes via AI
      if (structureChanges.length > 0) {
        await this.saveStructureChanges(structureChanges);
      }

      // Save chat changes to database
      if (chatChanges.length > 0) {
        await this.saveChatChanges(chatChanges);
      }

      // Clear all changes
      this.pendingChanges = [];
      this.notifyListeners();

      return { 
        success: true, 
        message: `Saved ${styleChanges.length + contentChanges.length + structureChanges.length + chatChanges.length} changes` 
      };
    } catch (error) {
      console.error('[SaveOrchestrator] Save failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Save failed' 
      };
    }
  }

  /**
   * Save style changes via AI code generation
   */
  private async saveStyleChanges(changes: PendingChange[]): Promise<void> {
    const mutations = changes.map(c => c.data as StyleMutation);
    
    const response = await fetch('/api/visual-editor/apply-styles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mutations })
    });

    if (!response.ok) {
      throw new Error('Failed to save style changes');
    }
  }

  /**
   * Save content changes directly
   */
  private async saveContentChanges(changes: PendingChange[]): Promise<void> {
    const response = await fetch('/api/visual-editor/apply-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ changes: changes.map(c => c.data) })
    });

    if (!response.ok) {
      throw new Error('Failed to save content changes');
    }
  }

  /**
   * Save structure changes via AI
   */
  private async saveStructureChanges(changes: PendingChange[]): Promise<void> {
    const response = await fetch('/api/visual-editor/apply-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ changes: changes.map(c => c.data) })
    });

    if (!response.ok) {
      throw new Error('Failed to save structure changes');
    }
  }

  /**
   * Save chat changes to database
   */
  private async saveChatChanges(changes: PendingChange[]): Promise<void> {
    // Chat changes are typically auto-saved, but handle any pending ones
    const response = await fetch('/api/chat/save-pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ changes: changes.map(c => c.data) })
    });

    if (!response.ok) {
      throw new Error('Failed to save chat changes');
    }
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: (changes: PendingChange[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getPendingChanges()));
  }

  /**
   * Clear all pending changes
   */
  clear() {
    this.pendingChanges = [];
    this.notifyListeners();
  }

  /**
   * Remove specific change
   */
  removeChange(id: string) {
    this.pendingChanges = this.pendingChanges.filter(c => c.id !== id);
    this.notifyListeners();
  }
}

// Singleton instance
export const saveOrchestrator = new SaveOrchestrator();
