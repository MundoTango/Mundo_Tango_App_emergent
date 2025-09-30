import { useState, useEffect } from 'react';
import GoogleMapsLocationInput from './GoogleMapsLocationInput';
import SimplifiedLocationInput from './SimplifiedLocationInput';

/**
 * 🗺️ Unified Location Input Component
 * 
 * Intelligently selects between Google Maps (primary) and Simplified (fallback) location inputs.
 * This wrapper provides a single interface for all location search needs across the platform.
 * 
 * Features:
 * - Automatic fallback: Uses Google Maps if API key available, SimplifiedLocationInput otherwise
 * - Unified interface: Single props interface compatible with both underlying components
 * - Normalized callbacks: Consistent onChange signature regardless of backend
 * - Pass-through styling: Full className and styling support
 * 
 * @example
 * ```tsx
 * <LocationInput
 *   value={location}
 *   onChange={(location, coords) => setLocation(location)}
 *   placeholder="Search for venues..."
 *   biasToLocation={{ lat: -34.6037, lng: -58.3816 }} // Buenos Aires
 * />
 * ```
 */

interface LocationDetails {
  name?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
  types?: string[];
  rating?: number;
  priceLevel?: number;
  businessStatus?: string;
}

interface LocationInputProps {
  value: string;
  onChange: (
    location: string, 
    coordinates?: { lat: number; lng: number }, 
    details?: LocationDetails
  ) => void;
  placeholder?: string;
  className?: string;
  biasToLocation?: { lat: number; lng: number };
  searchTypes?: string[];
  showBusinessDetails?: boolean;
  allowManualEntry?: boolean;
  allowGoogleMapsUrl?: boolean;
  required?: boolean;
  onClear?: () => void;
}

export default function LocationInput(props: LocationInputProps) {
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  const [googleMapsAvailable, setGoogleMapsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if Google Maps API key is configured
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const available = !!apiKey && apiKey.length > 0;
    setGoogleMapsAvailable(available);
    setUseGoogleMaps(available);
  }, []);

  // Show nothing while checking API availability
  if (googleMapsAvailable === null) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 ${props.className || ''}`}>
        <div className="h-4 w-4 border-2 border-turquoise-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading location search...</span>
      </div>
    );
  }

  // Use Google Maps if available and enabled
  if (useGoogleMaps && googleMapsAvailable) {
    return (
      <GoogleMapsLocationInput
        value={props.value}
        onChange={(location, coords, details) => {
          props.onChange(location, coords, details);
          // Handle onClear when location is cleared
          if (!location && props.onClear) {
            props.onClear();
          }
        }}
        placeholder={props.placeholder}
        className={props.className}
        biasToLocation={props.biasToLocation}
        searchTypes={props.searchTypes}
        showBusinessDetails={props.showBusinessDetails}
        allowManualEntry={props.allowManualEntry}
        allowGoogleMapsUrl={props.allowGoogleMapsUrl}
      />
    );
  }

  // Fallback to SimplifiedLocationInput
  return (
    <SimplifiedLocationInput
      value={props.value}
      placeholder={props.placeholder || 'Enter location (e.g., La Viruta, Buenos Aires)'}
      onLocationSelect={(location) => {
        // Normalize the callback interface
        if (typeof location === 'string') {
          props.onChange(location);
        } else {
          props.onChange(
            location.formattedAddress || location.address,
            location.latitude && location.longitude 
              ? { lat: location.latitude, lng: location.longitude }
              : undefined,
            {
              name: location.name,
              address: location.formattedAddress || location.address,
              coordinates: location.latitude && location.longitude 
                ? { lat: location.latitude, lng: location.longitude }
                : undefined
            }
          );
        }
      }}
      onClear={props.onClear}
      className={props.className}
      required={props.required}
    />
  );
}

/**
 * Export LocationDetails type for consumers
 */
export type { LocationDetails, LocationInputProps };
