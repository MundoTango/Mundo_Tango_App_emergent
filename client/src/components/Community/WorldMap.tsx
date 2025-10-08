import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Users, Calendar, Home, Star, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { initializeLeaflet } from '@/utils/leafletConfig';
import { GlassCard } from '@/components/glass/GlassComponents';


// Initialize Leaflet with local icons
initializeLeaflet();

interface CityGroup {
  id: number;
  name: string;
  slug?: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  memberCount?: number;
  eventCount?: number;
  hostCount?: number;
  recommendationCount?: number;
}

// Helper component to change map view and expose map instance
function MapController({ 
  center, 
  zoom, 
  onMapReady 
}: { 
  center: [number, number]; 
  zoom: number;
  onMapReady: (map: L.Map) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

const WorldMap = forwardRef((props, ref) => {
  const [selectedCity, setSelectedCity] = useState<CityGroup | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    centerOnCity: ({ lat, lng, city }: { lat: number; lng: number; city: string }) => {
      setMapCenter([lat, lng]);
      setMapZoom(10);
    }
  }));
  
  // Fetch city groups with statistics
  const { data: cityGroups = [], isLoading } = useQuery({
    queryKey: ['/api/community/city-groups', 'world-map-component'],
    queryFn: async () => {
      const response = await fetch('/api/community/city-groups', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch city groups');
        return [];
      }
      
      const result = await response.json();
      // Transform lat/lng to latitude/longitude for consistency
      const transformed = (result.data || []).map((group: any) => ({
        ...group,
        latitude: parseFloat(group.lat),
        longitude: parseFloat(group.lng)
      }));
      return transformed;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Create custom icon for city markers
  // Helper function to get pin color based on member count
  const getPinColor = (memberCount: number) => {
    if (memberCount >= 500) return '#FF1744'; // Red for 500+ people
    if (memberCount >= 200) return '#F50057'; // Pink for 200-500
    if (memberCount >= 100) return '#E91E63'; // Medium pink for 100-200
    if (memberCount >= 50) return '#9C27B0'; // Purple for 50-100
    return '#00ACC1'; // Cyan for <50
  };

  const createCityIcon = (group: CityGroup) => {
    const size = group.memberCount ? Math.min(30 + (group.memberCount / 10), 50) : 30;
    const color = getPinColor(group.memberCount || 0);
    
    return L.divIcon({
      className: 'custom-city-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size / 3}px;
        ">
          ${group.memberCount || 0}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        style={{ background: '#f0f9ff' }}
      >
        <MapController 
          center={mapCenter} 
          zoom={mapZoom} 
          onMapReady={(map) => { mapInstanceRef.current = map; }}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" data-testid="link-element">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map Legend - Positioned on top of the map */}
        <GlassCard depth={2} className="absolute top-4 left-4 z-[1000] rounded-lg shadow-lg p-4 border border-cyan-200/50"
          <h3 className="font-semibold text-sm mb-3 text-gray-800 dark:text-neutral-200">City Sizes</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF1744' }}></div>
              <span>500+ people</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F50057' }}></div>
              <span>200-500 people</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E91E63' }}></div>
              <span>100-200 people</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9C27B0' }}></div>
              <span>50-100 people</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ACC1' }}></div>
              <span>&lt;50 people</span>
            </div>
          </div>
        </div>
        
        {/* Render city group markers */}
        {!isLoading && cityGroups.length > 0 && cityGroups.map((group: CityGroup) => {
          return (
          <Marker
            key={group.id}
            position={[group.latitude, group.longitude]}
            icon={createCityIcon(group)}
            eventHandlers={{
              click: () => setSelectedCity(group)
            }}
          >
            <Popup>
              <div className="p-4 min-w-[280px]" 
                   style={{
                     background: 'rgba(255, 255, 255, 0.95)',
                     backdropFilter: 'blur(10px)',
                     borderRadius: '12px'
                   }}>
                {/* City Header */}
                <div className="mb-3 pb-2 border-b border-gray-200 dark:border-neutral-700">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-cyan-600" />
                    {group.city}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">{group.country}</p>
                </div>
                
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-cyan-50 to-transparent">
                    <Users className="h-4 w-4 text-cyan-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-neutral-600 dark:text-neutral-400">People</p>
                      <p className="font-semibold">{group.memberCount || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-transparent">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Events</p>
                      <p className="font-semibold">{group.eventCount || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-transparent">
                    <Home className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Housing Hosts</p>
                      <p className="font-semibold">{group.hostCount || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-transparent">
                    <Star className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Recommendations</p>
                      <p className="font-semibold">{group.recommendationCount || 0}</p>
                    </div>
                  </div>
                </div>
                
                {/* View Group Button */}
                <button 
                  onClick={()> window.location.href = `/groups/${group.slug || group.id}`}
                  className="mt-3 w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all text-sm font-medium"
                >
                  View {group.city} Group
                </button>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000] dark:bg-neutral-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-ocean-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Loading world map...</p>
          </div>
        </div>
      )}
    </div>
  );
});

WorldMap.displayName = 'WorldMap';

export default WorldMap;