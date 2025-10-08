import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initializeLeaflet } from '@/utils/leafletConfig';

// ESA LIFE CEO 61x21 - Initialize Leaflet with local icons (no CDN dependency)
initializeLeaflet();

interface MapCity {
  id: string | number;
  name: string;
  city?: string;
  country?: string;
  lat: number;
  lng: number;
  memberCount?: number | string;
  totalUsers?: number;
  eventCount?: number;
  slug?: string;
}

interface LeafletMapProps {
  cities: MapCity[];
  onCityClick?: (city: MapCity) => void;
  selectedCity?: MapCity | null;
}

// Component to handle map updates when selected city changes
function MapUpdater({ selectedCity }: { selectedCity?: MapCity | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedCity && selectedCity.lat && selectedCity.lng) {
      map.flyTo([selectedCity.lat, selectedCity.lng], 10, {
        duration: 1.5
      });
    }
  }, [selectedCity, map]);
  
  return null;
}

export default function LeafletMap({ cities, onCityClick, selectedCity }: LeafletMapProps) {
  // ESA LIFE CEO 61x21 - MT Ocean Theme gradient markers based on member count
  const getMarkerIcon = (memberCount: number) => {
    const size = Math.min(40, 20 + memberCount / 5);
    
    // MT Ocean Theme color gradient (turquoise to cyan to purple)
    const getGradientColor = (count: number) => {
      if (count >= 500) return 'linear-gradient(135deg, #FF1744 0%, #F50057 100%)'; // Red for 500+
      if (count >= 200) return 'linear-gradient(135deg, #F50057 0%, #E91E63 100%)'; // Pink for 200-500
      if (count >= 100) return 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)'; // Purple for 100-200
      if (count >= 50) return 'linear-gradient(135deg, #9C27B0 0%, #38B2AC 100%)'; // Purple to turquoise 50-100
      return 'linear-gradient(135deg, #38B2AC 0%, #06B6D4 100%)'; // Turquoise to cyan <50
    };
    
    return L.divIcon({
      className: 'mt-ocean-city-marker',
      html: `
        <div style="
          background: ${getGradientColor(memberCount)};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Filter cities with valid coordinates
  const validCities = cities.filter(city => 
    city.lat && city.lng && 
    !isNaN(city.lat) && !isNaN(city.lng) &&
    city.lat !== 0 && city.lng !== 0
  );
  
  // Debug Buenos Aires coordinates
  const buenosAires = cities.find(city => city.city === 'Buenos Aires');
  if (buenosAires) {
    console.log('Buenos Aires coordinates:', { lat: buenosAires.lat, lng: buenosAires.lng });
  }

  // If no valid cities, show Buenos Aires as default
  const defaultCenter: [number, number] = validCities.length > 0 
    ? [0, 0] // World view
    : [-34.6037, -58.3816]; // Buenos Aires

  return (
    <MapContainer
      center={defaultCenter}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg border border-gray-200 dark:border-neutral-700"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater selectedCity={selectedCity} />
      
      {validCities.map((city) => {
        const memberCount = typeof city.memberCount === 'string' 
          ? parseInt(city.memberCount) 
          : city.memberCount || city.totalUsers || 0;
        
        return (
          <Marker
            key={city.id}
            position={[city.lat, city.lng]}
            icon={getMarkerIcon(memberCount)}
            eventHandlers={{
              click: () => onCityClick?.(city),
            }}
          >
            <Popup>
              <div 
                className="text-center cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors dark:bg-neutral-800"
                onClick={() => {
                  onCityClick?.(city);
                  // Navigate to city group page using slug
                  const slug = city.slug || `tango-${(city.city || city.name).toLowerCase().replace(/\s+/g, '-')}-${(city.country || '').toLowerCase().replace(/\s+/g, '-')}`;
                  window.location.href = `/groups/${slug}`;
                }}
               role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); () => {
                  onCityClick?.(city);
                  // Navigate to city group page using slug
                  const slug = city.slug || `tango-${(city.city || city.name).toLowerCase().replace(/\s+/g, '-')(e); } }}>
                <h3 className="font-bold text-lg bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  {city.city || city.name}
                </h3>
                {city.country && <p className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">{city.country}</p>}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="font-semibold text-pink-600">{memberCount}</span>
                    <span className="text-gray-600 dark:text-neutral-600 dark:text-neutral-400">members</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="font-semibold text-blue-600">{city.eventCount || 0}</span>
                    <span className="text-gray-600 dark:text-neutral-600 dark:text-neutral-400">events</span>
                  </div>
                </div>
                <button className="mt-2 text-xs bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity">
                  View Group
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Add Buenos Aires as default if no cities */}
      {validCities.length === 0 && (
        <Marker
          position={[-34.6037, -58.3816]}
          icon={getMarkerIcon(1)}
        >
          <Popup>
            <div 
              className="text-center cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors dark:bg-neutral-800"
              onClick={() => {
                window.location.href = `/groups/buenos-aires`;
              }}
             role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); () => {
                window.location.href = `/groups/buenos-aires`;(e); } }}>
              <h3 className="font-bold text-lg bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Buenos Aires
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Argentina</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="font-semibold text-pink-600">1</span>
                  <span className="text-gray-600 dark:text-neutral-600 dark:text-neutral-400">member</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="font-semibold text-blue-600">0</span>
                  <span className="text-gray-600 dark:text-neutral-600 dark:text-neutral-400">events</span>
                </div>
              </div>
              <button className="mt-2 text-xs bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity">
                View Group
              </button>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}