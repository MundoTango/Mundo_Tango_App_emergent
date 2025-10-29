/**
 * REPLIT-STYLE TAB SYSTEM
 * MB.MD Track 3: Multi-tab navigation for Visual Editor
 * 
 * Tabs: Preview | Deploy | Git | Pages | Shell | Files | AI Editor
 */

import { useState } from 'react';
import { 
  Eye, 
  Rocket, 
  GitBranch, 
  FileText, 
  Terminal, 
  Folder, 
  Wand2,
  ScrollText,
  Key,
  X
} from 'lucide-react';

export type EditorTab = 'preview' | 'deploy' | 'git' | 'pages' | 'shell' | 'files' | 'ai' | 'console' | 'secrets';

interface TabSystemProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  onClose: () => void;
}

const TABS = [
  { id: 'preview' as const, label: 'Preview', icon: Eye },
  { id: 'console' as const, label: 'Console', icon: ScrollText },
  { id: 'deploy' as const, label: 'Deploy', icon: Rocket },
  { id: 'git' as const, label: 'Git', icon: GitBranch },
  { id: 'pages' as const, label: 'Pages', icon: FileText },
  { id: 'shell' as const, label: 'Shell', icon: Terminal },
  { id: 'files' as const, label: 'Files', icon: Folder },
  { id: 'secrets' as const, label: 'Secrets', icon: Key },
  { id: 'ai' as const, label: 'AI', icon: Wand2 }
];

export default function TabSystem({ activeTab, onTabChange, onClose }: TabSystemProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-2 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-1 py-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      <button
        onClick={onClose}
        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        data-testid="button-close-editor"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
