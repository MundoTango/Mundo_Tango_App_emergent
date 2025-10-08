import { useEffect, useState } from 'react';
import L from 'leaflet';
import { createCustomMarker, MARKER_ICONS, MAP_COLORS, DEFAULT_MAP_CENTER } from '@/utils/leafletConfig';
import UnifiedMapBase, { useMapMarkers } from '@/components/maps/UnifiedMapBase';
import UnifiedMapLegend from '@/components/maps/UnifiedMapLegend';
import { Calendar, Home, Star } from 'lucide-react';

interface TripMapLayers {
  events: boolean;
  housing: boolean;
  recommendations: boolean;
}

interface Event {
  id: number;
  title: string;
  startDate: string;
  location: string;
  latitude?: number | string;
  longitude?: number | string;
  attendeeCount?: number;
}

interface Housing {
  id: number;
  title: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  lat: number | null;
  lng: number | null;
}

interface Recommendation {
  id: number;
  title: string;
  type: string;
  address?: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
}

interface UnifiedTripMapProps {
  events?: Event[];
  housing?: Housing[];
  recommendations?: Recommendation[];
  layers: TripMapLayers;
  cityLat?: number;
  cityLng?: number;
  onAddToItinerary?: (item: { id: number; type: 'event' | 'housing' | 'recommendation' }) => void;
}

export default function UnifiedTripMap({
  events = [],
  housing = [],
  recommendations = [],
  layers,
  cityLat,
  cityLng,
  onAddToItinerary
}: UnifiedTripMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();

  useEffect(() => {
    if (!map) return;
    clearMarkers();

    // EVENTS: Use existing calendar icon (like EventMap.tsx)
    if (layers.events) {
      events.forEach(event => {
        if (event.latitude && event.longitude) {
          const lat = typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude;
          const lng = typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude;
          
          const icon = createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar);
          const marker = L.marker([lat, lng], { icon }).addTo(map);

          const popupContent = `
            <div class="p-3 min-w-[280px]">
              <h3 class="font-semibold text-lg mb-2">${event.title}</h3>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${MARKER_ICONS.calendar}
                  </svg>
                  ${new Date(event.startDate).toLocaleDateString()}
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${MARKER_ICONS.mapPin}
                  </svg>
                  ${event.location}
                </div>
              </div>
              <div class="flex gap-2">
                <button data-action="view-details" data-id="${event.id}" data-type="event"
                  class="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-ocean-500)] text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90 transition" aria-label="Button">
                  View Details
                </button>
                ${onAddToItinerary ? `
                  <button data-action="add-itinerary" data-id="${event.id}" data-type="event"
                    class="flex-1 bg-[var(--color-surface)] dark:bg-gray-800 border border-cyan-500 text-[var(--color-primary-hover)] dark:text-cyan-400 px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--color-ocean-50)] dark:hover:bg-cyan-900/20 transition" aria-label="Button">
                    Add to Trip
                  </button>
                ` : ''}
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          addMarker(marker);
        }
      });
    }

    // HOUSING: Use existing home icon (like HousingMap.tsx)
    if (layers.housing) {
      housing.forEach(home => {
        if (home.lat && home.lng) {
          const icon = createCustomMarker(MAP_COLORS.housing, MARKER_ICONS.home);
          const marker = L.marker([home.lat, home.lng], { icon }).addTo(map);

          const popupContent = `
            <div class="p-3 min-w-[280px]">
              <h3 class="font-semibold text-lg mb-2">${home.title}</h3>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
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
              </div>
              <div class="flex gap-2">
                <button data-action="view-details" data-id="${home.id}" data-type="housing"
                  class="flex-1 bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90 transition" aria-label="Button">
                  View Details
                </button>
                ${onAddToItinerary ? `
                  <button data-action="add-itinerary" data-id="${home.id}" data-type="housing"
                    class="flex-1 bg-[var(--color-surface)] dark:bg-gray-800 border border-turquoise-500 text-[var(--color-primary-hover)] dark:text-turquoise-400 px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--color-ocean-50)] dark:hover:bg-turquoise-900/20 transition" aria-label="Button">
                    Add to Trip
                  </button>
                ` : ''}
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          addMarker(marker);
        }
      });
    }

    // RECOMMENDATIONS: Use existing star icon (like RecommendationsMap.tsx)
    if (layers.recommendations) {
      recommendations.forEach(rec => {
        if (rec.lat && rec.lng) {
          const icon = createCustomMarker(MAP_COLORS.recommendation, MARKER_ICONS.star);
          const marker = L.marker([rec.lat, rec.lng], { icon }).addTo(map);

          const popupContent = `
            <div class="p-3 min-w-[280px]">
              <h3 class="font-semibold text-lg mb-2">${rec.title}</h3>
              <div class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white mb-2">
                ${rec.type}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">${rec.address || rec.city}</div>
              <div class="flex gap-2">
                <button data-action="view-details" data-id="${rec.id}" data-type="recommendation"
                  class="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90 transition" aria-label="Button">
                  View Details
                </button>
                ${onAddToItinerary ? `
                  <button data-action="add-itinerary" data-id="${rec.id}" data-type="recommendation"
                    class="flex-1 bg-[var(--color-surface)] dark:bg-gray-800 border border-pink-500 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded-lg text-sm hover:bg-pink-50 dark:hover:bg-pink-900/20 transition" aria-label="Button">
                    Add to Trip
                  </button>
                ` : ''}
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          addMarker(marker);
        }
      });
    }

    // Handle button clicks via event delegation
    map.on('popupopen', () => {
      document.querySelectorAll('[data-action="view-details"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const id = target.dataset.id;
          const type = target.dataset.type;
          // Navigate to detail page
          window.location.href = `/${type}s/${id}`;
        });
      });

      if (onAddToItinerary) {
        document.querySelectorAll('[data-action="add-itinerary"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const id = parseInt(target.dataset.id!);
            const type = target.dataset.type as 'event' | 'housing' | 'recommendation';
            onAddToItinerary({ id, type });
            // Close popup after adding
            map.closePopup();
          });
        });
      }
    });

    // Fit bounds to show all markers
    const allMarkers = [
      ...events.filter(e => e.latitude && e.longitude),
      ...housing.filter(h => h.lat && h.lng),
      ...recommendations.filter(r => r.lat && r.lng)
    ];

    if (allMarkers.length > 0) {
      fitBoundsToMarkers(map);
    }
  }, [map, events, housing, recommendations, layers, onAddToItinerary]);

  const legendItems = [];
  if (layers.events) {
    legendItems.push({
      icon: Calendar,
      label: 'Events',
      color: MAP_COLORS.event,
      count: events.filter(e => e.latitude && e.longitude).length
    });
  }
  if (layers.housing) {
    legendItems.push({
      icon: Home,
      label: 'Housing',
      color: MAP_COLORS.housing,
      count: housing.filter(h => h.lat && h.lng).length
    });
  }
  if (layers.recommendations) {
    legendItems.push({
      icon: Star,
      label: 'Recommendations',
      color: MAP_COLORS.recommendation,
      count: recommendations.filter(r => r.lat && r.lng).length
    });
  }

  return (
    <UnifiedMapBase
      center={cityLat && cityLng ? [cityLat, cityLng] : DEFAULT_MAP_CENTER}
      zoom={13}
      onMapReady={setMap}
    >
      <UnifiedMapLegend
        title="Trip Planning Map"
        items={legendItems}
      />
    </UnifiedMapBase>
  );
}
