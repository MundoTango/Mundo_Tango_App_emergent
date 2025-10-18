/**
 * Phase 15 Batch 1: Client-Side Cache Monitoring
 * Tracks React Query localStorage cache performance
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheMetrics {
  totalQueries: number;
  cachedQueries: number;
  hitRate: number;
  cacheSize: number;
  cacheSizeKB: number;
  oldestCacheEntry: Date | null;
  newestCacheEntry: Date | null;
  staleQueries: number;
}

export function useCacheMonitoring() {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<CacheMetrics>({
    totalQueries: 0,
    cachedQueries: 0,
    hitRate: 0,
    cacheSize: 0,
    cacheSizeKB: 0,
    oldestCacheEntry: null,
    newestCacheEntry: null,
    staleQueries: 0,
  });

  useEffect(() => {
    const calculateMetrics = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Count cached vs fetching queries
      const cachedQueries = queries.filter(q => 
        q.state.status === 'success' && q.state.dataUpdatedAt > 0
      );
      
      // Count stale queries (can be used but will refetch)
      const staleQueries = queries.filter(q => 
        q.isStale()
      );
      
      // Calculate localStorage size
      let cacheSize = 0;
      try {
        const cacheData = localStorage.getItem('MUNDO_TANGO_QUERY_CACHE');
        cacheSize = cacheData ? new Blob([cacheData]).size : 0;
      } catch (error) {
        console.warn('Could not calculate cache size:', error);
      }
      
      // Find oldest and newest cache entries
      let oldest: number | null = null;
      let newest: number | null = null;
      
      cachedQueries.forEach(q => {
        const timestamp = q.state.dataUpdatedAt;
        if (!oldest || timestamp < oldest) oldest = timestamp;
        if (!newest || timestamp > newest) newest = timestamp;
      });

      const newMetrics = {
        totalQueries: queries.length,
        cachedQueries: cachedQueries.length,
        hitRate: queries.length > 0 
          ? (cachedQueries.length / queries.length) * 100 
          : 0,
        cacheSize,
        cacheSizeKB: cacheSize / 1024,
        oldestCacheEntry: oldest ? new Date(oldest) : null,
        newestCacheEntry: newest ? new Date(newest) : null,
        staleQueries: staleQueries.length,
      };

      setMetrics(newMetrics);
      
      // Send metrics to server for monitoring (every 30 seconds)
      if (Math.random() < 0.1) { // 10% chance each calculation = ~30s intervals
        sendMetricsToServer(newMetrics);
      }
    };

    // Initial calculation
    calculateMetrics();

    // Update every 5 seconds
    const interval = setInterval(calculateMetrics, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return metrics;
}

async function sendMetricsToServer(metrics: CacheMetrics) {
  try {
    await fetch('/api/monitoring/client-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hitRate: metrics.hitRate,
        cacheSize: metrics.cacheSize,
        totalQueries: metrics.totalQueries,
        cachedQueries: metrics.cachedQueries,
        staleQueries: metrics.staleQueries,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silent fail - monitoring should not break the app
    console.debug('Failed to send cache metrics:', error);
  }
}
