import { useEffect, useState } from 'react';
import L from 'leaflet';
import { createCustomMarker, MARKER_ICONS, MAP_COLORS, DEFAULT_MAP_CENTER } from '@/utils/leafletConfig';
import UnifiedMapBase, { useMapMarkers } from '@/components/maps/UnifiedMapBase';
import UnifiedMapLegend from '@/components/maps/UnifiedMapLegend';

interface EventMapProps {
  events: any[];
  cityLat?: number;
  cityLng?: number;
  onEventClick?: (event: any) => void;
}

export default function EventMap({ events, cityLat, cityLng, onEventClick }: EventMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();

  // Update markers when events or map changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    clearMarkers();

    // Add markers for events with coordinates
    events.forEach(event => {
      if (event.latitude && event.longitude) {
        // Create custom event marker
        const customIcon = createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar);

        const marker = L.marker(
          [parseFloat(event.latitude as any), parseFloat(event.longitude as any)], 
          { icon: customIcon }
        ).addTo(map);

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-lg mb-2">${event.title}</h3>
            <div class="space-y-1 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${MARKER_ICONS.calendar}
                </svg>
                ${new Date(event.startDate).toLocaleDateString()}
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${MARKER_ICONS.mapPin}
                </svg>
                ${event.location}
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${MARKER_ICONS.users}
                </svg>
                ${event.attendeeCount || 0} attending
              </div>
            </div>
            ${onEventClick ? `
              <button class="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90 transition" data-testid="button-element">
                View Details
              </button>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onEventClick) {
          marker.on('popupopen', () => {
            const button = document.querySelector('.leaflet-popup-content button');
            if (button) {
              button.addEventListener('click', () => onEventClick(event));
            }
          });
        }

        addMarker(marker);
      }
    });

    // Fit bounds to show all markers
    if (events.filter(e => e.latitude && e.longitude).length > 0) {
      fitBoundsToMarkers(map);
    }
  }, [events, map, onEventClick]);

  const geocodedEventCount = events.filter(e => e.latitude && e.longitude).length;

  return (
    <UnifiedMapBase 
      center={cityLat && cityLng ? [cityLat, cityLng] : DEFAULT_MAP_CENTER}
      zoom={12}
      onMapReady={setMap}
    >
      <UnifiedMapLegend
        title="Event Locations"
        items={[
          {
            color: MAP_COLORS.event,
            label: 'Events',
            count: geocodedEventCount,
          },
        ]}
      />
    </UnifiedMapBase>
  );
}
