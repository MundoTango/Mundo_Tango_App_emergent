import { useEffect, useState } from 'react';
import L from 'leaflet';
import { createCustomMarker, MARKER_ICONS, MAP_COLORS, DEFAULT_MAP_CENTER } from '@/utils/leafletConfig';
import UnifiedMapBase, { useMapMarkers } from '@/components/maps/UnifiedMapBase';
import UnifiedMapLegend from '@/components/maps/UnifiedMapLegend';

interface HostHome {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  lat: number | null;
  lng: number | null;
  pricePerNight: number;
  maxGuests: number;
  amenities?: string[];
  photos?: string[];
  host?: {
    id: number;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

interface HousingMapProps {
  homes: HostHome[];
  cityLat?: number;
  cityLng?: number;
  onHomeClick?: (home: HostHome) => void;
}

export default function HousingMap({ homes, cityLat, cityLng, onHomeClick }: HousingMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();

  // Update markers when homes or map changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    clearMarkers();

    // Add markers for homes with coordinates
    homes.forEach(home => {
      if (home.lat && home.lng) {
        // Create custom housing marker
        const customIcon = createCustomMarker(MAP_COLORS.housing, MARKER_ICONS.home);

        const marker = L.marker(
          [home.lat, home.lng], 
          { icon: customIcon }
        ).addTo(map);

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[250px]">
            <h3 class="font-semibold text-lg mb-2">${home.title}</h3>
            <div class="space-y-1 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${MARKER_ICONS.mapPin}
                </svg>
                ${home.address}
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${MARKER_ICONS.users}
                </svg>
                Up to ${home.maxGuests} guests
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                $${home.pricePerNight}/night
              </div>
              ${home.host ? `
                <div class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                  <div class="text-xs text-gray-500">
                    Host: ${home.host.firstName || ''} ${home.host.lastName || ''}
                  </div>
                </div>
              ` : ''}
            </div>
            ${onHomeClick ? `
              <button class="mt-3 w-full bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90 transition" data-testid="button-element">
                View Details
              </button>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onHomeClick) {
          marker.on('popupopen', () => {
            const button = document.querySelector('.leaflet-popup-content button');
            if (button) {
              button.addEventListener('click', () => onHomeClick(home));
            }
          });
        }

        addMarker(marker);
      }
    });

    // Fit bounds to show all markers
    if (homes.filter(h => h.lat && h.lng).length > 0) {
      fitBoundsToMarkers(map);
    }
  }, [homes, map, onHomeClick]);

  const geocodedHomeCount = homes.filter(h => h.lat && h.lng).length;

  return (
    <UnifiedMapBase 
      center={cityLat && cityLng ? [cityLat, cityLng] : DEFAULT_MAP_CENTER}
      zoom={12}
      onMapReady={setMap}
    >
      <UnifiedMapLegend
        title="Housing Locations"
        items={[
          {
            color: MAP_COLORS.housing,
            label: 'Homes Available',
            count: geocodedHomeCount,
          },
        ]}
      />
    </UnifiedMapBase>
  );
}
