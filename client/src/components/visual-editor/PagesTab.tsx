/**
 * PAGES TAB - Route & File Manager
 * MB.MD Track 8: Pages and file navigation
 */

import { FileText, Plus, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PagesTab() {
  // Mock pages data
  const pages = [
    { path: '/', file: 'client/src/pages/HomePage.tsx', name: 'Home' },
    { path: '/memories', file: 'client/src/pages/MemoriesPage.tsx', name: 'Memories' },
    { path: '/events', file: 'client/src/pages/EventsPage.tsx', name: 'Events' },
    { path: '/groups', file: 'client/src/pages/GroupsPage.tsx', name: 'Groups' }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pages & Routes</h3>
        <Button variant="outline" size="sm" data-testid="button-new-page">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {pages.map((page, i) => (
          <div
            key={i}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
            data-testid={`page-item-${i}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{page.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{page.path}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{page.file}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = page.path + '?edit=true';
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Folder className="w-4 h-4" />
          <span className="text-xs">{pages.length} pages total</span>
        </div>
      </div>
    </div>
  );
}
