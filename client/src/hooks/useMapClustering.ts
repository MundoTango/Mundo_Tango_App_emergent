import { useMemo } from 'react';

export interface ClusterableItem {
  id: string | number;
  lat: number;
  lng: number;
  [key: string]: any;
}

export type ClusteredItem<T extends ClusterableItem = ClusterableItem> = T & {
  isCluster?: boolean;
  clusterCount?: number;
  items?: T[];
};

export interface UseMapClusteringOptions {
  enabled?: boolean;
  distanceThreshold?: number;
}

export function useMapClustering<T extends ClusterableItem>(
  items: T[],
  options: UseMapClusteringOptions = {}
): ClusteredItem<T>[] {
  const { enabled = true, distanceThreshold = 0.1 } = options;

  return useMemo(() => {
    if (!enabled || !items || items.length === 0) {
      return items as ClusteredItem<T>[];
    }

    const clusters: ClusteredItem<T>[] = [];
    const processed = new Set<number>();

    items.forEach((item, idx) => {
      if (processed.has(idx)) return;

      const nearbyItems = items.filter((other, otherIdx) => {
        if (idx === otherIdx || processed.has(otherIdx)) return false;
        const distance = Math.sqrt(
          Math.pow(item.lat - other.lat, 2) + Math.pow(item.lng - other.lng, 2)
        );
        return distance < distanceThreshold;
      });

      if (nearbyItems.length > 0) {
        clusters.push({
          ...item,
          isCluster: true,
          clusterCount: nearbyItems.length + 1,
          items: [item, ...nearbyItems],
        } as ClusteredItem<T>);
        nearbyItems.forEach((_, idx2) => processed.add(items.indexOf(nearbyItems[idx2])));
      } else {
        clusters.push(item as ClusteredItem<T>);
      }
      processed.add(idx);
    });

    return clusters;
  }, [items, enabled, distanceThreshold]);
}
