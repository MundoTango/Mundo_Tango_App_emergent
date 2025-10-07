import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Home, Star, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { initializeLeaflet } from '@/utils/leafletConfig';
import CommunityMapFilters, { CommunityMapFilters as FilterType } from './CommunityMapFilters';

// ESA LIFE CEO 61x21 - Initialize Leaflet with local icons (no CDN dependency)
initializeLeaflet();

interface MapItem {
  id: number;
  type: 'event' | 'housing' | 'recommendation';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  metadata?: {
    price?: string;
    date?: string;
    rating?: number;
    friendLevel?: number;
    isLocal?: boolean;
    propertyType?: string;
  };
}

interface CommunityMapWithLayersProps {
  groupSlug?: string;
  city?: string;
  country?: string;
  center?: [number, number];
}

// Helper component to change map view
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function CommunityMapWithLayers({ 
  groupSlug, 
  city = 'Buenos Aires', 
  country = 'Argentina',
  center = [-34.6037, -58.3816] // Buenos Aires default
}: CommunityMapWithLayersProps) {
  const [activeLayers, setActiveLayers] = useState({
    events: true,
    housing: true,
    recommendations: true
  });
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterType>({
    eventType: 'all',
    startDate: null,
    endDate: null,
    hasSpace: false,
    roomType: 'all',
    minGuests: 'all',
    connectionLevel: 'all',
    cuisine: 'all',
    category: 'all',
    priceLevel: 'all',
  });

  // Fetch map data for the city/community
  const { data: mapData = [], isLoading } = useQuery({
    queryKey: ['/api/community/map-data', city, country, groupSlug, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (country) params.append('country', country);
      if (groupSlug) params.append('groupSlug', groupSlug);
      
      // Add filter parameters
      if (filters.eventType !== 'all') params.append('eventType', filters.eventType);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.hasSpace) params.append('hasSpace', 'true');
      
      if (filters.roomType !== 'all') params.append('roomType', filters.roomType);
      if (filters.minGuests !== 'all') params.append('minGuests', filters.minGuests);
      if (filters.connectionLevel !== 'all') params.append('connectionLevel', filters.connectionLevel);
      
      if (filters.cuisine !== 'all') params.append('cuisine', filters.cuisine);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.priceLevel !== 'all') params.append('priceLevel', filters.priceLevel);
      
      const response = await fetch(`/api/community/map-data?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch map data');
        return [];
      }
      
      const result = await response.json();
      return result.data || [];
    }
  });

  // Filter data based on active layers
  const filteredData = mapData.filter((item: MapItem) => {
    const layerKey = item.type === 'event' ? 'events' : 
                     item.type === 'recommendation' ? 'recommendations' : 
                     item.type;
    return activeLayers[layerKey as keyof typeof activeLayers];
  });

  // ESA LIFE CEO 61x21 - MT Ocean Theme gradient icons for different item types
  const eventIcon = L.divIcon({
    className: 'mt-ocean-event-marker',
    html: '<div style="background: linear-gradient(135deg, #9C27B0 0%, #E91E63 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const housingIcon = L.divIcon({
    className: 'mt-ocean-housing-marker',
    html: '<div style="background: linear-gradient(135deg, #38B2AC 0%, #06B6D4 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const recommendationIcon = L.divIcon({
    className: 'mt-ocean-recommendation-marker',
    html: '<div style="background: linear-gradient(135deg, #F50057 0%, #FF1744 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return eventIcon;
      case 'housing': return housingIcon;
      case 'recommendation': return recommendationIcon;
      default: return eventIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Layer Toggle Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-3 space-y-2 border border-cyan-200/30 dark:border-cyan-500/30">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Layers</p>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer" data-testid="layer-toggle-events">
            <input
              type="checkbox"
              checked={activeLayers.events}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, events: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Events</span>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer" data-testid="layer-toggle-housing">
            <input
              type="checkbox"
              checked={activeLayers.housing}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, housing: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Housing</span>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer" data-testid="layer-toggle-recommendations">
            <input
              type="checkbox"
              checked={activeLayers.recommendations}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, recommendations: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Places</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </label>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="absolute top-4 right-4 z-10">
        <CommunityMapFilters 
          filters={filters} 
          onFiltersChange={setFilters} 
          compact={true} 
        />
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredData.map((item: MapItem) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={getIcon(item.type)}
            eventHandlers={{
              click: () => setSelectedItem(item)
            }}
          >
            <Popup>
              <div className="p-2 max-w-sm">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                {item.address && (
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.address}
                  </p>
                )}
                {item.metadata && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {item.metadata.price && <p>Price: {item.metadata.price}</p>}
                    {item.metadata.date && <p>Date: {item.metadata.date}</p>}
                    {item.metadata.rating && <p>Rating: {item.metadata.rating}/5</p>}
                  </div>
                )}
                <Button size="sm" className="w-full mt-2">
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}