/**
 * VISUAL EDITOR NAVIGATION HISTORY SYSTEM
 * 
 * MB.MD Architecture:
 * - Tracks element selections, page changes, and tab switches
 * - Browser-style back/forward navigation
 * - LocalStorage persistence across sessions
 * - Max history size with circular buffer
 * 
 * Created: October 24, 2025
 */

import type { EditorTab } from '@/components/visual-editor/TabSystem';

export interface NavigationHistoryEntry {
  id: string;
  timestamp: number;
  type: 'element' | 'page' | 'tab';
  
  // Element selection data
  element?: {
    tag: string;
    id?: string;
    className?: string;
    xpath: string;
    textPreview?: string;
  };
  
  // Page navigation data
  page?: {
    path: string;
    title: string;
  };
  
  // Tab switch data
  tab?: {
    name: EditorTab;
    label: string;
  };
  
  // Breadcrumb display
  label: string;
  icon?: string;
}

export interface NavigationHistoryState {
  entries: NavigationHistoryEntry[];
  currentIndex: number;
  maxSize: number;
}

export const MAX_HISTORY_SIZE = 50;
export const STORAGE_KEY = 'visual-editor-navigation-history';

/**
 * Create a history entry for element selection
 */
export function createElementEntry(
  element: {
    tag: string;
    id?: string;
    className?: string;
    xpath: string;
    innerHTML?: string;
  }
): NavigationHistoryEntry {
  const elementLabel = element.id 
    ? `#${element.id}` 
    : element.className?.split(' ')[0] 
    ? `.${element.className.split(' ')[0]}`
    : element.tag.toLowerCase();
  
  return {
    id: `element-${Date.now()}`,
    timestamp: Date.now(),
    type: 'element',
    element: {
      tag: element.tag,
      id: element.id,
      className: element.className,
      xpath: element.xpath,
      textPreview: element.innerHTML?.substring(0, 50)
    },
    label: `<${element.tag.toLowerCase()}> ${elementLabel}`,
    icon: '🎯'
  };
}

/**
 * Create a history entry for page navigation
 */
export function createPageEntry(
  path: string,
  title: string
): NavigationHistoryEntry {
  return {
    id: `page-${Date.now()}`,
    timestamp: Date.now(),
    type: 'page',
    page: {
      path,
      title
    },
    label: title || path,
    icon: '📄'
  };
}

/**
 * Create a history entry for tab switch
 */
export function createTabEntry(
  tabName: EditorTab,
  tabLabel: string
): NavigationHistoryEntry {
  return {
    id: `tab-${Date.now()}`,
    timestamp: Date.now(),
    type: 'tab',
    tab: {
      name: tabName,
      label: tabLabel
    },
    label: `Tab: ${tabLabel}`,
    icon: '📑'
  };
}

/**
 * Add entry to history (circular buffer)
 */
export function addToHistory(
  state: NavigationHistoryState,
  entry: NavigationHistoryEntry
): NavigationHistoryState {
  // Remove any entries after current index (when navigating back then making new action)
  const newEntries = state.entries.slice(0, state.currentIndex + 1);
  
  // Add new entry
  newEntries.push(entry);
  
  // Maintain max size (circular buffer)
  const trimmedEntries = newEntries.slice(-state.maxSize);
  
  return {
    ...state,
    entries: trimmedEntries,
    currentIndex: trimmedEntries.length - 1
  };
}

/**
 * Navigate back in history
 */
export function navigateBack(
  state: NavigationHistoryState
): NavigationHistoryState | null {
  if (!canNavigateBack(state)) return null;
  
  return {
    ...state,
    currentIndex: state.currentIndex - 1
  };
}

/**
 * Navigate forward in history
 */
export function navigateForward(
  state: NavigationHistoryState
): NavigationHistoryState | null {
  if (!canNavigateForward(state)) return null;
  
  return {
    ...state,
    currentIndex: state.currentIndex + 1
  };
}

/**
 * Check if can navigate back
 */
export function canNavigateBack(state: NavigationHistoryState): boolean {
  return state.currentIndex > 0;
}

/**
 * Check if can navigate forward
 */
export function canNavigateForward(state: NavigationHistoryState): boolean {
  return state.currentIndex < state.entries.length - 1;
}

/**
 * Get current history entry
 */
export function getCurrentEntry(
  state: NavigationHistoryState
): NavigationHistoryEntry | null {
  return state.entries[state.currentIndex] || null;
}

/**
 * Get breadcrumb trail (last N entries up to current)
 */
export function getBreadcrumbTrail(
  state: NavigationHistoryState,
  maxItems: number = 5
): NavigationHistoryEntry[] {
  const startIndex = Math.max(0, state.currentIndex - maxItems + 1);
  return state.entries.slice(startIndex, state.currentIndex + 1);
}

/**
 * Save history to localStorage
 */
export function saveToStorage(state: NavigationHistoryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save navigation history:', error);
  }
}

/**
 * Load history from localStorage
 */
export function loadFromStorage(): NavigationHistoryState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as NavigationHistoryState;
    
    // Validate structure
    if (!parsed.entries || !Array.isArray(parsed.entries)) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load navigation history:', error);
    return null;
  }
}

/**
 * Clear all history
 */
export function clearHistory(): NavigationHistoryState {
  const emptyState: NavigationHistoryState = {
    entries: [],
    currentIndex: -1,
    maxSize: MAX_HISTORY_SIZE
  };
  
  saveToStorage(emptyState);
  return emptyState;
}
