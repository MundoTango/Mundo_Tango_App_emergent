import { useState, useRef, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReactDOMServer from 'react-dom/server';
import { useHotkeys } from 'react-hotkeys-hook';
import { CSVLink } from 'react-csv';
import { Search, Layers, Download, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useMapClustering } from '@/hooks/useMapClustering';
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading';
import { useMapFullscreen } from '@/hooks/useMapFullscreen';
import { useCsvExport } from '@/hooks/useCsvExport';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapItem {
  id: string | number;
  lat: number;
  lng: number;
  data: any;
  layerId?: string;
  isCluster?: boolean;
  clusterCount?: number;
}

export interface LayerConfig {
  id: string;
  label: string;
  enabled: boolean;
  color?: string;
  icon?: string;
}

export interface UnifiedMapSystemProps {
  items: MapItem[];
  markerRenderer: (item: MapItem) => ReactNode;
  popupRenderer: (item: MapItem) => ReactNode;
  filters?: ReactNode;
  clustering?: boolean;
  progressiveLoading?: boolean;
  fullscreen?: boolean;
  csvExport?: boolean;
  search?: boolean;
  layers?: LayerConfig[];
  onFilterChange?: (filters: any) => void;
  onItemClick?: (item: MapItem) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
}

interface MapNavigationControllerProps {
  center: [number, number];
  zoom: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onZoomChange?: (zoom: number) => void;
}

function MapNavigationController({ 
  center,
  zoom,
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onZoomChange 
}: MapNavigationControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    const handleZoomEnd = () => {
      onZoomChange?.(map.getZoom());
    };
    
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);
  
  useHotkeys('cmd+plus,ctrl+plus', (e) => {
    e.preventDefault();
    map.zoomIn();
    onZoomIn?.();
  }, [map]);
  
  useHotkeys('cmd+minus,ctrl+minus', (e) => {
    e.preventDefault();
    map.zoomOut();
    onZoomOut?.();
  }, [map]);
  
  useHotkeys('cmd+0,ctrl+0', (e) => {
    e.preventDefault();
    map.setView(center, zoom || 3);
    onReset?.();
  }, [map, center, zoom]);
  
  return null;
}

export function UnifiedMapSystem({
  items,
  markerRenderer,
  popupRenderer,
  filters,
  clustering = false,
  progressiveLoading = false,
  fullscreen = false,
  csvExport = false,
  search = false,
  layers = [],
  onFilterChange,
  onItemClick,
  center = [0, 0],
  zoom = 3,
  className,
  height = '100%',
}: UnifiedMapSystemProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    layers.reduce((acc, layer) => ({ ...acc, [layer.id]: layer.enabled }), {})
  );
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const { isFullscreen, toggleFullscreen } = useMapFullscreen(mapContainerRef);

  const filteredBySearch = useMemo(() => {
    if (!search || !debouncedSearchQuery) return items;
    
    const query = debouncedSearchQuery.toLowerCase();
    return items.filter(item => {
      const searchableText = JSON.stringify(item.data).toLowerCase();
      return searchableText.includes(query);
    });
  }, [items, debouncedSearchQuery, search]);

  const filteredByLayer = useMemo(() => {
    if (layers.length === 0) return filteredBySearch;
    
    return filteredBySearch.filter(item => {
      if (!item.layerId) return true;
      return layerVisibility[item.layerId] !== false;
    });
  }, [filteredBySearch, layerVisibility, layers]);

  const clusteredItems = useMapClustering(filteredByLayer, {
    enabled: clustering,
    distanceThreshold: 0.1,
  });

  const progressiveItems = useProgressiveLoading(clusteredItems, {
    enabled: progressiveLoading,
    currentZoom,
  });

  const { csvData, csvHeaders, filename } = useCsvExport(progressiveItems, {
    filename: `map-export-${new Date().toISOString().split('T')[0]}.csv`,
  });

  const handleZoomChange = useCallback((newZoom: number) => {
    setCurrentZoom(newZoom);
  }, []);

  const handleLayerToggle = useCallback((layerId: string) => {
    setLayerVisibility(prev => {
      const newVisibility = { ...prev, [layerId]: !prev[layerId] };
      onFilterChange?.({ layers: newVisibility });
      return newVisibility;
    });
  }, [onFilterChange]);

  const handleItemClick = useCallback((item: MapItem) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const validItems = progressiveItems.filter(
    item => item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng)
  );

  return (
    <div 
      ref={mapContainerRef}
      className={cn(
        'relative w-full',
        isFullscreen && 'fixed inset-0 z-[9999] bg-white',
        className
      )}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 flex-wrap">
        {search && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              data-testid="input-map-search"
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-lg"
            />
          </div>
        )}

        {filters && (
          <div className="bg-white rounded-lg shadow-lg p-2">
            {filters}
          </div>
        )}

        <div className="flex gap-2 ml-auto">
          {layers.length > 0 && (
            <Button
              data-testid="button-toggle-layers"
              variant="outline"
              size="sm"
              onClick={() => setShowLayerPanel(!showLayerPanel)}
              className="bg-white shadow-lg"
            >
              <Layers className="h-4 w-4 mr-2" />
              Layers
            </Button>
          )}

          {csvExport && validItems.length > 0 && (
            <CSVLink
              data={csvData}
              headers={csvHeaders.map(h => ({ label: h, key: h }))}
              filename={filename}
            >
              <Button
                data-testid="button-export-csv"
                variant="outline"
                size="sm"
                className="bg-white shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CSVLink>
          )}

          {fullscreen && (
            <Button
              data-testid="button-toggle-fullscreen"
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white shadow-lg"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {showLayerPanel && layers.length > 0 && (
        <Card className="absolute top-20 right-4 z-[1000] w-64 shadow-xl">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Map Layers</h3>
            <div className="space-y-2">
              {layers.map(layer => (
                <div 
                  key={layer.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleLayerToggle(layer.id)}
                  data-testid={`layer-toggle-${layer.id}`}
                >
                  <div className="flex items-center gap-2">
                    {layer.icon && <span>{layer.icon}</span>}
                    <span className="text-sm">{layer.label}</span>
                  </div>
                  {layerVisibility[layer.id] !== false ? (
                    <Eye className="h-4 w-4 text-blue-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        <Card className="shadow-lg">
          <CardContent className="p-2">
            <div className="flex flex-col gap-1">
              <Button
                data-testid="button-zoom-in"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const map = (window as any).leafletMap;
                  if (map) map.zoomIn();
                }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                data-testid="button-zoom-out"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const map = (window as any).leafletMap;
                  if (map) map.zoomOut();
                }}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                data-testid="button-reset-view"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const map = (window as any).leafletMap;
                  if (map) map.setView(center, zoom);
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {(progressiveLoading || clustering) && (
          <Card className="shadow-lg">
            <CardContent className="p-2 text-xs">
              <div className="space-y-1">
                {progressiveLoading && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Showing:</span>
                    <Badge variant="secondary" className="ml-2">
                      {validItems.length} / {items.length}
                    </Badge>
                  </div>
                )}
                {clustering && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zoom:</span>
                    <Badge variant="secondary" className="ml-2">
                      {currentZoom}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        ref={(ref) => {
          if (ref) (window as any).leafletMap = ref;
        }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapNavigationController
          center={center}
          zoom={zoom}
          onZoomChange={handleZoomChange}
        />

        {validItems.map((item) => {
          const markerContent = markerRenderer(item);
          const customIcon = L.divIcon({
            html: ReactDOMServer.renderToString(markerContent as React.ReactElement),
            className: 'custom-map-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          });

          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => handleItemClick(item),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {popupRenderer(item)}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {search && searchQuery && (
        <div className="absolute top-20 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 text-xs">
          Found {filteredBySearch.length} result{filteredBySearch.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default UnifiedMapSystem;
