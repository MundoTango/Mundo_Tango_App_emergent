import { useEffect, useState } from 'react';
import L from 'leaflet';
import { createCustomMarker, MARKER_ICONS, MAP_COLORS, DEFAULT_MAP_CENTER } from '@/utils/leafletConfig';
import UnifiedMapBase, { useMapMarkers } from '@/components/maps/UnifiedMapBase';
import UnifiedMapLegend from '@/components/maps/UnifiedMapLegend';
import { Star } from 'lucide-react';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  type: string;
  address?: string;
  city: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
  mtRating?: number;
  googleRating?: number;
  googleReviewCount?: number;
  priceLevel?: string;
  cuisine?: string;
  tags?: string[];
  user?: {
    id: number;
    name: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    city?: string;
    country?: string;
  };
}

interface RecommendationsMapProps {
  recommendations: Recommendation[];
  cityLat?: number;
  cityLng?: number;
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

export default function RecommendationsMap({ 
  recommendations, 
  cityLat, 
  cityLng, 
  onRecommendationClick 
}: RecommendationsMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();

  // Update markers when recommendations or map changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    clearMarkers();

    // Add markers for recommendations with coordinates
    recommendations.forEach(rec => {
      if (rec.lat && rec.lng) {
        // Create custom recommendation marker with MT Ocean Theme pink gradient
        const customIcon = createCustomMarker(MAP_COLORS.recommendation, MARKER_ICONS.star);

        const marker = L.marker(
          [rec.lat, rec.lng], 
          { icon: customIcon }
        ).addTo(map);

        // Create popup content with Aurora Tide styling
        const popupContent = `
          <div class="p-3 min-w-[280px] max-w-[320px]">
            <div class="flex items-start gap-2 mb-2">
              <div class="flex-1">
                <h3 class="font-semibold text-lg mb-1 line-clamp-2">${rec.title}</h3>
                <div class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  ${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                </div>
              </div>
            </div>
            
            ${rec.address ? `
              <div class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${MARKER_ICONS.mapPin}
                </svg>
                <span class="line-clamp-2">${rec.address}</span>
              </div>
            ` : ''}

            <div class="flex items-center gap-3 mb-2">
              ${rec.mtRating ? `
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-turquoise-500 fill-current" viewBox="0 0 24 24">
                    ${MARKER_ICONS.star}
                  </svg>
                  <span class="text-sm font-medium">${rec.mtRating.toFixed(1)}</span>
                  <span class="text-xs text-gray-500">MT</span>
                </div>
              ` : ''}
              ${rec.googleRating ? `
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                    ${MARKER_ICONS.star}
                  </svg>
                  <span class="text-sm font-medium">${rec.googleRating.toFixed(1)}</span>
                  <span class="text-xs text-gray-500">(${rec.googleReviewCount || 0})</span>
                </div>
              ` : ''}
            </div>

            ${rec.priceLevel ? `
              <div class="text-sm mb-2">
                <span class="font-medium text-green-600 dark:text-green-400">${rec.priceLevel}</span>
              </div>
            ` : ''}

            ${rec.cuisine ? `
              <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span class="font-medium">Cuisine:</span> ${rec.cuisine}
              </div>
            ` : ''}

            ${rec.user ? `
              <div class="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 mb-2">
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Recommended by ${rec.user.firstName || rec.user.username}
                </div>
              </div>
            ` : ''}

            ${onRecommendationClick ? `
              <button 
                class="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                data-recommendation-id="${rec.id}"
              >
                View Full Details
              </button>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'custom-recommendation-popup'
        });

        if (onRecommendationClick) {
          marker.on('popupopen', () => {
            const button = document.querySelector(`[data-recommendation-id="${rec.id}"]`);
            if (button) {
              button.addEventListener('click', () => onRecommendationClick(rec));
            }
          });
        }

        addMarker(marker);
      }
    });

    // Fit bounds to show all markers
    if (recommendations.filter(r => r.lat && r.lng).length > 0) {
      fitBoundsToMarkers(map);
    }
  }, [recommendations, map, onRecommendationClick, clearMarkers, addMarker, fitBoundsToMarkers]);

  // Calculate category counts
  const geocodedRecs = recommendations.filter(r => r.lat && r.lng);
  const categoryCounts = geocodedRecs.reduce((acc, rec) => {
    acc[rec.type] = (acc[rec.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Create legend items based on categories present
  const legendItems = [
    { color: MAP_COLORS.recommendation, label: 'All Recommendations', count: geocodedRecs.length },
  ];

  // Add category-specific counts if we have multiple types
  const categoryLabels: Record<string, string> = {
    restaurant: '🍽️ Restaurants',
    cafe: '☕ Cafes',
    hotel: '🏨 Hotels',
    venue: '🎭 Venues',
  };

  Object.entries(categoryCounts).forEach(([type, count]) => {
    if (count > 0) {
      legendItems.push({
        color: MAP_COLORS.recommendation,
        label: categoryLabels[type] || type,
        count,
      });
    }
  });

  return (
    <div className="relative w-full h-full" data-testid="recommendations-map">
      <UnifiedMapBase 
        center={cityLat && cityLng ? [cityLat, cityLng] : DEFAULT_MAP_CENTER}
        zoom={13}
        onMapReady={setMap}
      >
        <UnifiedMapLegend
          title="Recommendations"
          items={legendItems}
          position="bottom-right"
        />
      </UnifiedMapBase>
    </div>
  );
}
