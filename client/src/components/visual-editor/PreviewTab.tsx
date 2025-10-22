/**
 * PREVIEW TAB - Full Page Iframe
 * MB.MD Track 2: Real-time preview with refresh
 * 
 * Shows current page without edit mode in scrollable iframe
 */

import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';

interface PreviewTabProps {
  currentPath: string;
}

export default function PreviewTab({ currentPath }: PreviewTabProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const visualEditorContext = useVisualEditorOptional();
  
  // 🎯 SYNC PREVIEW PATH TO CONTEXT (Oct 22, 2025)
  // This tells Mr Blue what page is being shown in the preview
  useEffect(() => {
    if (visualEditorContext) {
      visualEditorContext.setPreviewPath(currentPath);
      console.log('📍 [PreviewTab] Updated preview path in context:', currentPath);
    }
  }, [currentPath, visualEditorContext]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Build preview URL without edit mode + cache-busting timestamp
  // MB.MD: Add refreshKey to force browser to bypass cache (Oct 22, 2025)
  const previewUrl = `${window.location.origin}${currentPath}${
    currentPath.includes('?') ? '&' : '?'
  }_preview=${refreshKey}`;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Controls */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            data-testid="button-refresh-preview"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded ${
                previewMode === 'desktop'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid="button-preview-desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded ${
                previewMode === 'mobile'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid="button-preview-mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {previewUrl}
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        <div 
          className={`h-full mx-auto transition-all ${
            previewMode === 'mobile' 
              ? 'w-[375px]' 
              : 'w-full'
          }`}
        >
          <iframe
            key={refreshKey}
            ref={iframeRef}
            src={previewUrl}
            title="Live Preview"
            className="w-full h-full border-none"
            data-testid="preview-iframe"
            style={{ minHeight: '100vh' }}
          />
        </div>
      </div>
    </div>
  );
}
