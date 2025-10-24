/**
 * VISUAL EDITOR NAVIGATION HISTORY HOOK
 * 
 * MB.MD Architecture:
 * - Manages navigation history state
 * - Provides back/forward navigation
 * - Auto-saves to localStorage
 * - Handles history entry creation
 * 
 * Created: October 24, 2025
 */

import { useState, useCallback, useEffect } from 'react';
import type { EditorTab } from '@/components/visual-editor/TabSystem';
import {
  type NavigationHistoryState,
  type NavigationHistoryEntry,
  MAX_HISTORY_SIZE,
  createElementEntry,
  createPageEntry,
  createTabEntry,
  addToHistory,
  navigateBack as navBack,
  navigateForward as navForward,
  canNavigateBack,
  canNavigateForward,
  getCurrentEntry,
  getBreadcrumbTrail,
  saveToStorage,
  loadFromStorage,
  clearHistory as clearHistoryUtil
} from '@/lib/visual-editor/navigationHistory';

export interface UseNavigationHistoryReturn {
  // State
  history: NavigationHistoryState;
  currentEntry: NavigationHistoryEntry | null;
  breadcrumbTrail: NavigationHistoryEntry[];
  canGoBack: boolean;
  canGoForward: boolean;
  
  // Actions
  addElement: (element: {
    tag: string;
    id?: string;
    className?: string;
    xpath: string;
    innerHTML?: string;
  }) => void;
  addPage: (path: string, title: string) => void;
  addTab: (tabName: EditorTab, tabLabel: string) => void;
  goBack: () => NavigationHistoryEntry | null;
  goForward: () => NavigationHistoryEntry | null;
  clearHistory: () => void;
  jumpTo: (index: number) => void;
}

export function useNavigationHistory(): UseNavigationHistoryReturn {
  // Initialize state from localStorage or create empty
  const [history, setHistory] = useState<NavigationHistoryState>(() => {
    const stored = loadFromStorage();
    if (stored) {
      console.log('📚 [NavigationHistory] Loaded from storage:', stored);
      return stored;
    }
    
    return {
      entries: [],
      currentIndex: -1,
      maxSize: MAX_HISTORY_SIZE
    };
  });
  
  // Auto-save to localStorage whenever history changes
  useEffect(() => {
    saveToStorage(history);
  }, [history]);
  
  // Add element selection to history
  const addElement = useCallback((element: {
    tag: string;
    id?: string;
    className?: string;
    xpath: string;
    innerHTML?: string;
  }) => {
    const entry = createElementEntry(element);
    setHistory(prev => addToHistory(prev, entry));
    console.log('📚 [NavigationHistory] Added element:', entry);
  }, []);
  
  // Add page navigation to history
  const addPage = useCallback((path: string, title: string) => {
    const entry = createPageEntry(path, title);
    setHistory(prev => addToHistory(prev, entry));
    console.log('📚 [NavigationHistory] Added page:', entry);
  }, []);
  
  // Add tab switch to history
  const addTab = useCallback((tabName: EditorTab, tabLabel: string) => {
    const entry = createTabEntry(tabName, tabLabel);
    setHistory(prev => addToHistory(prev, entry));
    console.log('📚 [NavigationHistory] Added tab:', entry);
  }, []);
  
  // Navigate back
  const goBack = useCallback((): NavigationHistoryEntry | null => {
    const newState = navBack(history);
    if (!newState) {
      console.warn('📚 [NavigationHistory] Cannot navigate back');
      return null;
    }
    
    setHistory(newState);
    const entry = getCurrentEntry(newState);
    console.log('📚 [NavigationHistory] Navigated back to:', entry);
    return entry;
  }, [history]);
  
  // Navigate forward
  const goForward = useCallback((): NavigationHistoryEntry | null => {
    const newState = navForward(history);
    if (!newState) {
      console.warn('📚 [NavigationHistory] Cannot navigate forward');
      return null;
    }
    
    setHistory(newState);
    const entry = getCurrentEntry(newState);
    console.log('📚 [NavigationHistory] Navigated forward to:', entry);
    return entry;
  }, [history]);
  
  // Clear all history
  const clearHistory = useCallback(() => {
    const emptyState = clearHistoryUtil();
    setHistory(emptyState);
    console.log('📚 [NavigationHistory] Cleared all history');
  }, []);
  
  // Jump to specific index
  const jumpTo = useCallback((index: number) => {
    if (index < 0 || index >= history.entries.length) {
      console.warn('📚 [NavigationHistory] Invalid index:', index);
      return;
    }
    
    setHistory(prev => ({ ...prev, currentIndex: index }));
    const entry = history.entries[index];
    console.log('📚 [NavigationHistory] Jumped to index', index, ':', entry);
  }, [history]);
  
  // Computed values
  const currentEntry = getCurrentEntry(history);
  const breadcrumbTrail = getBreadcrumbTrail(history, 5);
  const canGoBack = canNavigateBack(history);
  const canGoForward = canNavigateForward(history);
  
  return {
    history,
    currentEntry,
    breadcrumbTrail,
    canGoBack,
    canGoForward,
    addElement,
    addPage,
    addTab,
    goBack,
    goForward,
    clearHistory,
    jumpTo
  };
}
