import { useMemo } from 'react';

export interface UseProgressiveLoadingOptions {
  enabled?: boolean;
  currentZoom?: number;
  customLimits?: {
    [zoom: number]: number;
  };
}

const DEFAULT_ZOOM_LIMITS = {
  0: 30,
  5: 75,
  8: 150,
  10: 300,
  12: 500,
};

export function useProgressiveLoading<T>(
  items: T[],
  options: UseProgressiveLoadingOptions = {}
): T[] {
  const { enabled = true, currentZoom = 3, customLimits } = options;

  return useMemo(() => {
    if (!enabled || !items || items.length === 0) {
      return items;
    }

    const limits: Record<number, number> = customLimits || DEFAULT_ZOOM_LIMITS;
    
    let maxMarkers = 500;
    const zoomLevels = Object.keys(limits)
      .map(Number)
      .sort((a, b) => b - a);

    for (const zoomLevel of zoomLevels) {
      if (currentZoom >= zoomLevel) {
        maxMarkers = limits[zoomLevel] ?? 500;
        break;
      }
    }

    maxMarkers = Math.min(maxMarkers, 500);

    const result = items.slice(0, maxMarkers);

    if (items.length > 500) {
      setTimeout(() => {
        // Allow browser to garbage collect unused items
      }, 0);
    }

    return result;
  }, [items, enabled, currentZoom, customLimits]);
}
