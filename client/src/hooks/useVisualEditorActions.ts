/**
 * React Hook for Visual Editor Actions
 * Connects Visual Editor to Mr Blue and Phase 12 learning system
 */

import { useState, useEffect, useCallback } from 'react';
import { getVisualEditorTracker, VisualAction } from '@/lib/autonomy/VisualEditorTracker';

export function useVisualEditorActions() {
  const [actions, setActions] = useState<VisualAction[]>([]);
  const [tracker] = useState(() => getVisualEditorTracker());

  // Subscribe to tracker updates
  useEffect(() => {
    const unsubscribe = tracker.subscribe((updatedActions) => {
      setActions(updatedActions);
    });

    // Initialize with current actions
    setActions(tracker.getActions());

    return unsubscribe;
  }, [tracker]);

  const addAction = useCallback((action: VisualAction) => {
    tracker.recordAction(action);
  }, [tracker]);

  const clearActions = useCallback(() => {
    tracker.clearActions();
  }, [tracker]);

  const getRecentActions = useCallback((count: number = 5) => {
    return tracker.getRecentActions(count);
  }, [tracker]);

  const getContextForMrBlue = useCallback(() => {
    return tracker.getContextForMrBlue();
  }, [tracker]);

  const getDataForMrBlue = useCallback(() => {
    return tracker.getDataForMrBlue();
  }, [tracker]);

  return {
    actions,
    addAction,
    clearActions,
    getRecentActions,
    getContextForMrBlue,
    getDataForMrBlue,
    tracker,
  };
}
