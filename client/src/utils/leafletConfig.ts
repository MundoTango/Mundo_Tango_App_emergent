import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Centralized Leaflet configuration
 * Fixes default marker icon paths to use local assets instead of CDN
 * Call initializeLeaflet() once before using any Leaflet maps
 */
export function initializeLeaflet() {
  // Fix for default markers in React - delete the broken _getIconUrl method
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  // Configure default icon paths to use local files in public/leaflet/
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

/**
 * Default map configuration for OpenStreetMap tile layer
 */
export const DEFAULT_TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
};

/**
 * Default map center (Buenos Aires) and zoom level
 */
export const DEFAULT_MAP_CENTER: [number, number] = [-34.6037, -58.3816];
export const DEFAULT_MAP_ZOOM = 12;
export const DEFAULT_WORLD_ZOOM = 2;

/**
 * Create a custom div icon for markers
 * @param color - Tailwind color class (e.g., 'purple-600', 'turquoise-500')
 * @param iconSvgPath - SVG path data for the icon
 */
export function createCustomMarker(color: string, iconSvgPath: string) {
  const iconHtml = `
    <div class="relative">
      <div class="absolute -inset-1 bg-gradient-to-r from-${color} to-cyan-500 rounded-full blur opacity-75"></div>
      <div class="relative bg-[var(--color-surface)] dark:bg-gray-900 rounded-full p-2 shadow-lg">
        <svg class="w-6 h-6 text-${color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${iconSvgPath}
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}

/**
 * Common SVG paths for marker icons
 */
export const MARKER_ICONS = {
  calendar: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
  home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>',
  users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>',
  mapPin: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>',
  star: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>',
};

/**
 * Color schemes for different map types (MT Ocean Theme)
 */
export const MAP_COLORS = {
  event: 'purple-600',
  housing: 'turquoise-500',
  community: 'cyan-500',
  recommendation: 'pink-500',
};
