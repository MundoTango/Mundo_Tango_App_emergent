import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function CacheMonitorDisplay() {
  const { data: cacheStats } = useQuery({
    queryKey: ['/api/cache/stats'],
    refetchInterval: 5000,
  });

  if (!cacheStats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-turquoise-200 dark:border-cyan-500 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-white">
            <Activity className="h-4 w-4 text-turquoise-500" />
            Cache Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Hit Rate</span>
            <span className="font-mono text-turquoise-600 dark:text-cyan-400">
              {cacheStats?.hitRate || '0'}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Queries</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {cacheStats?.queryCount || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Stale</span>
            <span className="font-mono text-orange-600">
              {cacheStats?.staleCount || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CacheMonitorDisplay;
