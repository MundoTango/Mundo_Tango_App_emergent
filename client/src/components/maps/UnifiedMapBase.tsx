import { useEffect, useRef, ReactNode } from 'react';
import L from 'leaflet';
import { initializeLeaflet, DEFAULT_TILE_LAYER, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/utils/leafletConfig';

interface UnifiedMapBaseProps {
  center?: [number, number];
  zoom?: number;
  children?: ReactNode;
  className?: string;
  onMapReady?: (map: L.Map) => void;
  fitBounds?: boolean; // Auto-fit bounds to show all markers
}

/**
 * Unified Map Base Component
 * Provides common Leaflet map setup with:
 * - Consistent icon configuration
 * - OpenStreetMap tile layer
 * - Automatic cleanup
 * - Customizable center and zoom
 * 
 * Usage:
 * <UnifiedMapBase center={[lat, lng]} zoom={12} onMapReady={(map) => { ... }}>
 *   <YourMapLegendOrOverlay />
 * </UnifiedMapBase>
 */
export default function UnifiedMapBase({
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  children,
  className = 'h-full w-full rounded-lg',
  onMapReady,
  fitBounds = false,
}: UnifiedMapBaseProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize Leaflet configuration once
  useEffect(() => {
    initializeLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current).setView(center, zoom);

    // Add OpenStreetMap tile layer
    L.tileLayer(DEFAULT_TILE_LAYER.url, {
      attribution: DEFAULT_TILE_LAYER.attribution,
      maxZoom: DEFAULT_TILE_LAYER.maxZoom,
    }).addTo(map);

    mapRef.current = map;

    // Notify parent component that map is ready
    if (onMapReady) {
      onMapReady(map);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update view when center or zoom changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className={className} data-testid="unified-map-container" />
      {children}
    </div>
  );
}

/**
 * Helper hook to manage markers on a unified map
 * Returns methods to add, remove, and clear markers
 */
export function useMapMarkers() {
  const markersRef = useRef<L.Marker[]>([]);

  const addMarker = (marker: L.Marker) => {
    markersRef.current.push(marker);
  };

  const removeMarker = (marker: L.Marker) => {
    const index = markersRef.current.indexOf(marker);
    if (index > -1) {
      markersRef.current.splice(index, 1);
      marker.remove();
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const fitBoundsToMarkers = (map: L.Map, padding: number = 0.1) => {
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(padding));
    }
  };

  return {
    markers: markersRef.current,
    addMarker,
    removeMarker,
    clearMarkers,
    fitBoundsToMarkers,
  };
}
