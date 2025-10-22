/**
 * PAGES TAB - Route & File Manager
 * MB.MD Track 8: Pages and file navigation
 */

import { FileText, Plus, Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

export default function PagesTab() {
  // REAL API: Fetch pages dynamically
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['/api/pages/list']
  });

  const pages = pagesData?.pages || [];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pages & Routes</h3>
        <Button variant="outline" size="sm" data-testid="button-new-page">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          No pages found. Create your first page!
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page: any, i: number) => (
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
                  // MB.MD FIX (Oct 22): Proper URL construction prevents double-encoding
                  const url = new URL(window.location.origin + page.path);
                  url.searchParams.set('edit', 'true');
                  window.location.href = url.toString();
                }}
              >
                Edit
              </Button>
            </div>
          </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Folder className="w-4 h-4" />
            <span className="text-xs">{pages.length} pages total</span>
          </div>
        </div>
      )}
    </div>
  );
}
