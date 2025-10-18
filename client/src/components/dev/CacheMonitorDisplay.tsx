/**
 * Phase 15 Batch 1: Cache Monitor Dev Display
 * Shows cache metrics in development mode
 */

import { useCacheMonitoring } from '@/hooks/useCacheMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CacheMonitorDisplay() {
  const metrics = useCacheMonitoring();
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>📊 Cache Monitor</span>
          <Badge variant={metrics.hitRate > 50 ? "default" : "destructive"}>
            {metrics.hitRate.toFixed(1)}% Hit Rate
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total Queries:</span>
          <span className="font-mono">{metrics.totalQueries}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Cached:</span>
          <span className="font-mono text-green-600">{metrics.cachedQueries}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Stale:</span>
          <span className="font-mono text-yellow-600">{metrics.staleQueries}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Cache Size:</span>
          <span className="font-mono">{metrics.cacheSizeKB.toFixed(2)} KB</span>
        </div>
        {metrics.oldestCacheEntry && (
          <div className="text-[10px] text-gray-500 pt-2 border-t">
            Oldest: {metrics.oldestCacheEntry.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
