/**
 * KEYBOARD SHORTCUTS HOOK
 * MB.MD Track 7: Hotkeys for Visual Editor
 */

import { useEffect } from 'react';

export type ShortcutAction = 
  | 'tab-1' | 'tab-2' | 'tab-3' | 'tab-4' | 'tab-5' | 'tab-6' | 'tab-7'
  | 'refresh' | 'commit' | 'push' | 'save' | 'close';

interface ShortcutConfig {
  [key: string]: ShortcutAction;
}

const DEFAULT_SHORTCUTS: ShortcutConfig = {
  // Tab switching (Cmd/Ctrl + 1-7)
  'Meta+1': 'tab-1',
  'Control+1': 'tab-1',
  'Meta+2': 'tab-2',
  'Control+2': 'tab-2',
  'Meta+3': 'tab-3',
  'Control+3': 'tab-3',
  'Meta+4': 'tab-4',
  'Control+4': 'tab-4',
  'Meta+5': 'tab-5',
  'Control+5': 'tab-5',
  'Meta+6': 'tab-6',
  'Control+6': 'tab-6',
  'Meta+7': 'tab-7',
  'Control+7': 'tab-7',

  // Actions
  'Meta+r': 'refresh',
  'Control+r': 'refresh',
  'Meta+Enter': 'commit',
  'Control+Enter': 'commit',
  'Meta+p': 'push',
  'Control+p': 'push',
  'Meta+s': 'save',
  'Control+s': 'save',
  'Escape': 'close'
};

interface UseKeyboardShortcutsOptions {
  onShortcut: (action: ShortcutAction) => void;
  shortcuts?: ShortcutConfig;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onShortcut,
  shortcuts = DEFAULT_SHORTCUTS,
  enabled = true
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to close even in input fields
        if (event.key !== 'Escape') {
          return;
        }
      }

      const key = getKeyCombo(event);
      const action = shortcuts[key];

      if (action) {
        event.preventDefault();
        event.stopPropagation();
        onShortcut(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, shortcuts, onShortcut]);
}

function getKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.metaKey) parts.push('Meta');
  if (event.ctrlKey) parts.push('Control');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');

  const key = event.key;
  if (key !== 'Meta' && key !== 'Control' && key !== 'Alt' && key !== 'Shift') {
    parts.push(key);
  }

  return parts.join('+');
}

// Visual hint component
export function ShortcutHint({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono">
        {keys}
      </kbd>
      <span>{action}</span>
    </div>
  );
}
