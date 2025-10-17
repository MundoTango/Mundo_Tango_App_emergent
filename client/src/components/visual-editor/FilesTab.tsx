/**
 * FILES TAB - File Tree Navigator
 * MB.MD Track 8: File management
 */

import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FilesTab() {
  const [expanded, setExpanded] = useState<string[]>(['client/src/components']);

  const toggleFolder = (path: string) => {
    setExpanded(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  return (
    <div className="p-2">
      <div className="space-y-1">
        {/* Components folder */}
        <div>
          <button
            onClick={() => toggleFolder('client/src/components')}
            className="flex items-center gap-1 w-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
          >
            {expanded.includes('client/src/components') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Folder className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">components</span>
          </button>

          {expanded.includes('client/src/components') && (
            <div className="ml-6 space-y-1">
              <div className="flex items-center gap-1 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm cursor-pointer">
                <FileCode className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 text-xs">VisualEditorWrapper.tsx</span>
              </div>
              <div className="flex items-center gap-1 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm cursor-pointer">
                <FileCode className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 text-xs">TabSystem.tsx</span>
              </div>
            </div>
          )}
        </div>

        {/* Pages folder */}
        <div>
          <button
            onClick={() => toggleFolder('client/src/pages')}
            className="flex items-center gap-1 w-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
          >
            {expanded.includes('client/src/pages') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Folder className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">pages</span>
          </button>
        </div>
      </div>
    </div>
  );
}
