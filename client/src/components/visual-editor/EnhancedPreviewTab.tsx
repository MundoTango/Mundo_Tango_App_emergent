/**
 * AGENT #147 (Visual Editor): Enhanced Preview Tab (Tab 3)
 * 
 * Live iframe preview with responsive toggles
 * Mobile/Tablet/Desktop views
 * Research: docs/research/VISUAL_EDITOR_RESEARCH.md
 */

import { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisualEditor } from '@/contexts/VisualEditorContext';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES: Record<DeviceType, { width: string; height: string; icon: any }> = {
  desktop: { width: '100%', height: '100%', icon: Monitor },
  tablet: { width: '768px', height: '1024px', icon: Tablet },
  mobile: { width: '375px', height: '667px', icon: Smartphone }
};

interface EnhancedPreviewTabProps {
  previewUrl: string;
}

export function EnhancedPreviewTab({ previewUrl }: EnhancedPreviewTabProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { previewPath } = useVisualEditor();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const deviceConfig = DEVICE_SIZES[device];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900" data-testid="enhanced-preview-tab">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Device Toggles */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {(Object.keys(DEVICE_SIZES) as DeviceType[]).map((deviceType) => {
            const DeviceIcon = DEVICE_SIZES[deviceType].icon;
            return (
              <Button
                key={deviceType}
                onClick={() => setDevice(deviceType)}
                variant={device === deviceType ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-3 ${device === deviceType ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                data-testid={`button-device-${deviceType}`}
              >
                <DeviceIcon className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-medium capitalize">{deviceType}</span>
              </Button>
            );
          })}
        </div>

        {/* URL Display */}
        <div className="flex items-center gap-2 flex-1 mx-4">
          <div className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
            {previewPath || '/'}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="h-8 px-3"
            data-testid="button-refresh-preview"
          >
            <span className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
          </Button>
        </div>

        {/* Dimensions Display */}
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {device === 'desktop' ? 'Responsive' : `${deviceConfig.width} × ${deviceConfig.height}`}
        </div>
      </div>

      {/* Preview Iframe Container */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
            device === 'desktop' ? 'w-full h-full' : ''
          }`}
          style={
            device !== 'desktop'
              ? {
                  width: deviceConfig.width,
                  height: deviceConfig.height,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }
              : undefined
          }
        >
          <iframe
            key={`${device}-${isRefreshing ? Date.now() : 'stable'}`}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            data-testid="iframe-preview"
          />
        </div>
      </div>
    </div>
  );
}
