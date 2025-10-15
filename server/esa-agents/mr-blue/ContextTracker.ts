/**
 * TRACK 4: Mr. Blue Context Tracker
 * Tracks current page, recent actions, active editing component
 * Provides context awareness for autonomous orchestration
 */

import { EventEmitter } from 'events';

interface PageContext {
  currentPage: string;
  route: string;
  componentTree: string[];
  sessionId: string;
  userId?: string;
  timestamp: Date;
}

interface UserAction {
  id: string;
  type: 'click' | 'edit' | 'navigate' | 'save' | 'delete' | 'create';
  target: string;
  details: any;
  timestamp: Date;
}

interface EditingComponent {
  componentPath: string;
  componentName: string;
  startedAt: Date;
  changes: any[];
}

export class ContextTracker extends EventEmitter {
  private sessions: Map<string, PageContext> = new Map();
  private actions: Map<string, UserAction[]> = new Map();
  private editing: Map<string, EditingComponent> = new Map();

  constructor() {
    super();
  }

  /**
   * Track current page context
   */
  setPageContext(sessionId: string, context: Partial<PageContext>): PageContext {
    const existing = this.sessions.get(sessionId);
    
    const pageContext: PageContext = {
      currentPage: context.currentPage || existing?.currentPage || 'unknown',
      route: context.route || existing?.route || '/',
      componentTree: context.componentTree || existing?.componentTree || [],
      sessionId,
      userId: context.userId || existing?.userId,
      timestamp: new Date(),
    };

    this.sessions.set(sessionId, pageContext);
    this.emit('page-context-updated', sessionId, pageContext);

    return pageContext;
  }

  /**
   * Get current page context
   */
  getPageContext(sessionId: string): PageContext | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Track user action
   */
  trackAction(sessionId: string, action: Omit<UserAction, 'id' | 'timestamp'>): UserAction {
    const userAction: UserAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...action,
      timestamp: new Date(),
    };

    const sessionActions = this.actions.get(sessionId) || [];
    sessionActions.push(userAction);
    
    // Keep only last 50 actions per session
    if (sessionActions.length > 50) {
      sessionActions.shift();
    }
    
    this.actions.set(sessionId, sessionActions);
    this.emit('action-tracked', sessionId, userAction);

    return userAction;
  }

  /**
   * Get recent actions
   */
  getRecentActions(sessionId: string, limit: number = 10): UserAction[] {
    const sessionActions = this.actions.get(sessionId) || [];
    return sessionActions.slice(-limit).reverse();
  }

  /**
   * Get actions by type
   */
  getActionsByType(sessionId: string, type: UserAction['type']): UserAction[] {
    const sessionActions = this.actions.get(sessionId) || [];
    return sessionActions.filter((a) => a.type === type);
  }

  /**
   * Start tracking component editing
   */
  startEditing(sessionId: string, componentPath: string, componentName: string): EditingComponent {
    const editing: EditingComponent = {
      componentPath,
      componentName,
      startedAt: new Date(),
      changes: [],
    };

    this.editing.set(sessionId, editing);
    this.emit('editing-started', sessionId, editing);

    return editing;
  }

  /**
   * Track change to editing component
   */
  trackChange(sessionId: string, change: any): void {
    const editing = this.editing.get(sessionId);
    if (!editing) {
      console.warn('No active editing session');
      return;
    }

    editing.changes.push({
      ...change,
      timestamp: new Date(),
    });

    this.emit('change-tracked', sessionId, change);
  }

  /**
   * Stop tracking component editing
   */
  stopEditing(sessionId: string): EditingComponent | null {
    const editing = this.editing.get(sessionId);
    if (!editing) {
      return null;
    }

    this.editing.delete(sessionId);
    this.emit('editing-stopped', sessionId, editing);

    return editing;
  }

  /**
   * Get currently editing component
   */
  getCurrentlyEditing(sessionId: string): EditingComponent | null {
    return this.editing.get(sessionId) || null;
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId: string): {
    context: PageContext | null;
    recentActions: UserAction[];
    currentlyEditing: EditingComponent | null;
    totalActions: number;
    sessionDuration: number; // milliseconds
  } {
    const context = this.getPageContext(sessionId);
    const recentActions = this.getRecentActions(sessionId, 10);
    const currentlyEditing = this.getCurrentlyEditing(sessionId);
    const allActions = this.actions.get(sessionId) || [];

    const sessionStart = allActions[0]?.timestamp?.getTime() || Date.now();
    const sessionDuration = Date.now() - sessionStart;

    return {
      context,
      recentActions,
      currentlyEditing,
      totalActions: allActions.length,
      sessionDuration,
    };
  }

  /**
   * Analyze user behavior
   */
  analyzeBehavior(sessionId: string): {
    mostEditedComponents: string[];
    preferredActions: UserAction['type'][];
    sessionActivity: 'high' | 'medium' | 'low';
    focusedWork: boolean; // true if editing same component
  } {
    const actions = this.actions.get(sessionId) || [];
    
    // Count component edits
    const componentEdits: Record<string, number> = {};
    const actionTypes: Record<UserAction['type'], number> = {
      click: 0,
      edit: 0,
      navigate: 0,
      save: 0,
      delete: 0,
      create: 0,
    };

    actions.forEach((action) => {
      // Count components
      if (action.type === 'edit' && action.target) {
        componentEdits[action.target] = (componentEdits[action.target] || 0) + 1;
      }

      // Count action types
      actionTypes[action.type]++;
    });

    // Sort by frequency
    const mostEditedComponents = Object.entries(componentEdits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([comp]) => comp);

    const preferredActions = Object.entries(actionTypes)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0)
      .map(([type]) => type as UserAction['type']);

    // Determine activity level
    const recentActions = this.getRecentActions(sessionId, 10);
    const last5MinActions = recentActions.filter((a) => {
      const diff = Date.now() - (a.timestamp?.getTime() || 0);
      return diff < 5 * 60 * 1000; // 5 minutes
    });

    let sessionActivity: 'high' | 'medium' | 'low';
    if (last5MinActions.length > 10) {
      sessionActivity = 'high';
    } else if (last5MinActions.length > 3) {
      sessionActivity = 'medium';
    } else {
      sessionActivity = 'low';
    }

    // Focused work = editing same component repeatedly
    const focusedWork = mostEditedComponents.length > 0 && 
                        componentEdits[mostEditedComponents[0]] >= 5;

    return {
      mostEditedComponents,
      preferredActions,
      sessionActivity,
      focusedWork,
    };
  }

  /**
   * Clear session data
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.actions.delete(sessionId);
    this.editing.delete(sessionId);
    this.emit('session-cleared', sessionId);
  }
}

export const contextTracker = new ContextTracker();
