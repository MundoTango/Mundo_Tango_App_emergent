/**
 * Save Orchestrator - Universal Change Persistence
 * Handles saving ALL types of changes across the application
 * MB.MD Track 2 - Universal Save System
 */

import type { StyleMutation } from '@/lib/visual-editor/iframeMessaging';

export interface PendingChange {
  id: string;
  type: 'style' | 'content' | 'structure' | 'chat' | 'ai-build';
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
  async saveAll(): Promise<{ success: boolean; message: string; commitHash?: string }> {
    if (this.pendingChanges.length === 0) {
      return { success: false, message: 'No changes to save' };
    }

    try {
      // ✅ FIX #2 (Oct 27, ARCHITECT CORRECTION): 
      // MUST write changes to disk BEFORE Git commit!
      console.log(`[SaveOrchestrator] Applying ${this.pendingChanges.length} changes to disk...`);
      
      // Group changes by type
      const styleChanges = this.pendingChanges.filter(c => c.type === 'style');
      const contentChanges = this.pendingChanges.filter(c => c.type === 'content');
      const structureChanges = this.pendingChanges.filter(c => c.type === 'structure');
      const chatChanges = this.pendingChanges.filter(c => c.type === 'chat');
      const aiBuildChanges = this.pendingChanges.filter(c => c.type === 'ai-build');

      // ✅ ARCHITECT FIX (Oct 27): Write ALL changes to disk before Git commit
      // - AI-build changes: Already on disk via applyCodeChange() 
      // - Style/content/structure: Must be persisted NOW via file writes
      
      console.log(`[SaveOrchestrator] ${aiBuildChanges.length} vibe coding changes already on disk (via applyCodeChange)`);
      
      // ✅ FIX: Persist visual editor changes to disk NOW
      if (styleChanges.length > 0 || contentChanges.length > 0 || structureChanges.length > 0) {
        console.log(`[SaveOrchestrator] Persisting ${styleChanges.length + contentChanges.length + structureChanges.length} visual editor changes to disk...`);
        
        try {
          // Apply style changes (generates code and writes to disk)
          if (styleChanges.length > 0) {
            await this.saveStyleChanges(styleChanges);
            console.log(`[SaveOrchestrator] ✅ ${styleChanges.length} style changes written to disk`);
          }
          
          // Apply content changes (modifies HTML/JSX and writes to disk)
          if (contentChanges.length > 0) {
            await this.saveContentChanges(contentChanges);
            console.log(`[SaveOrchestrator] ✅ ${contentChanges.length} content changes written to disk`);
          }
          
          // Apply structure changes (modifies DOM structure and writes to disk)
          if (structureChanges.length > 0) {
            await this.saveStructureChanges(structureChanges);
            console.log(`[SaveOrchestrator] ✅ ${structureChanges.length} structure changes written to disk`);
          }
        } catch (error) {
          console.error('[SaveOrchestrator] Failed to persist visual editor changes:', error);
          throw new Error(`Failed to write changes to disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // ✅ NOW commit everything to Git
      const response = await fetch('/api/git/commit-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          changes: this.pendingChanges,
          message: `Visual Editor: ${this.pendingChanges.length} changes`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Git commit failed');
      }

      const result = await response.json();
      
      // ✅ Reload preview iframe after save
      console.log('[SaveOrchestrator] Triggering preview reload...');
      window.dispatchEvent(new CustomEvent('visual-editor-reload'));
      
      // Clear all changes
      this.pendingChanges = [];
      this.notifyListeners();

      return { 
        success: true, 
        message: `Saved ${result.filesChanged || this.pendingChanges.length} changes to Git`,
        commitHash: result.commitHash
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
   * Execute AI build intents (Agent #5)
   * Sends pending build intents to backend for execution
   */
  private async executeAIBuilds(changes: PendingChange[]): Promise<void> {
    const buildIntents = changes.map(c => c.data);
    const messageIds = buildIntents.map((b: any) => b.messageId);
    const projectId = buildIntents[0]?.projectId;

    if (!projectId) {
      throw new Error('No project ID found in build intents');
    }

    const response = await fetch('/api/chat/execute-builds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        messageIds,
        projectId 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute AI builds');
    }

    const result = await response.json();
    console.log('[SaveOrchestrator] AI builds executed:', result);
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
