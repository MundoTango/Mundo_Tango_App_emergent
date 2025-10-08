import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Home, Star, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { initializeLeaflet } from '@/utils/leafletConfig';
import CommunityMapFilters, { CommunityMapFilters as FilterType } from './CommunityMapFilters';
import { GlassCard } from '@/components/glass/GlassComponents';


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

  // ESA LIFE CEO 61x21 - MT Ocean Theme gradient icons matching filter icons
  // SVG icons from Lucide React for visual consistency
  const calendarSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
  const homeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
  const mapPinSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

  const eventIcon = L.divIcon({
    className: 'mt-ocean-event-marker',
    html: `<div style="background: linear-gradient(135deg, #9C27B0 0%, #E91E63 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">${calendarSvg}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const housingIcon = L.divIcon({
    className: 'mt-ocean-housing-marker',
    html: `<div style="background: linear-gradient(135deg, #38B2AC 0%, #06B6D4 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">${homeSvg}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const recommendationIcon = L.divIcon({
    className: 'mt-ocean-recommendation-marker',
    html: `<div style="background: linear-gradient(135deg, #F50057 0%, #FF1744 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">${mapPinSvg}</div>`,
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
    <div className="flex flex-col w-full space-y-4">
      {/* Filter Bar Above Map - ESA Layer 22 + Aurora Tide */}
      <GlassCard depth={2} className="dark:bg-slate-900/80 rounded-lg border border-cyan-200/30 dark:border-ocean-500/30 p-4 relative z-[1001]"
        <CommunityMapFilters 
          filters={filters} 
          onFiltersChange={setFilters} 
          compact={false} 
        />
      </div>

      {/* Map Container - ESA Layer 8 + 22 Unified Map */}
      <div className="relative rounded-lg overflow-hidden h-[650px] z-0">
        <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full rounded-lg"
        style={{ height: '650px', width: '100%' }}
      >
        <ChangeView center={center} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" data-testid="link-element">OpenStreetMap</a> contributors'
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
                <Button size="sm" className="w-full mt-2" data-testid="button-w-full">
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      </div>
    </div>
  );
}