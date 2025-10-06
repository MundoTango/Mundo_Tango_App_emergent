import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Loader, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocationBias } from '@/contexts/LocationBiasContext';

type LocationDetails = {
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
  types?: string[];
  rating?: number;
  priceLevel?: number;
  businessStatus?: string;
  city?: string;
  state?: string;
  country?: string;
};

type LocationStrategy = 'google' | 'osm' | 'none';

interface UnifiedLocationPickerProps {
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
  required?: boolean;
}

type InitState = 'idle' | 'loading' | 'ready' | 'error';

export default function UnifiedLocationPicker({
  value,
  onChange,
  placeholder = "Search for a place...",
  className = "",
  biasToLocation = { lat: -34.6037, lng: -58.3816 },
  searchTypes = [],
  showBusinessDetails = true,
  allowManualEntry = true,
  required = false
}: UnifiedLocationPickerProps) {
  const [initState, setInitState] = useState<InitState>('idle');
  const [strategy, setStrategy] = useState<LocationStrategy>('none');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { userLocation, locationCity, locationCountry } = useLocationBias();

  const validateCoordinates = (coords: any): boolean => {
    if (!coords) return false;
    const { lat, lng } = coords;
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    );
  };

  const loadGoogleMapsScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.maps?.places) {
        resolve();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error('No API key'));
        return;
      }

      const existing = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Script load failed')));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&region=AR`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Script load failed'));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    // ESA Layer 13: Force OSM mode due to Google Maps API key issues
    // Google Maps deprecated AutocompleteService (March 2025) and has InvalidKeyMapError
    if (import.meta.env.DEV) {
      console.log('🌍 UnifiedLocationPicker: Using OpenStreetMap Nominatim API (free, no API key required)');
    }
    setStrategy('osm');
    setInitState('ready');
  }, []);

  const searchGooglePlaces = useCallback(async (query: string) => {
    if (!autocompleteServiceRef.current || strategy !== 'google') return;

    setIsSearching(true);

    const request: any = {
      input: query,
      types: searchTypes.length > 0 ? searchTypes : ['establishment'],
    };

    const hasValidBias = validateCoordinates(biasToLocation);
    if (hasValidBias) {
      const google = (window as any).google;
      request.location = new google.maps.LatLng(biasToLocation.lat, biasToLocation.lng);
      request.radius = 50000;
      
      if (import.meta.env.DEV) {
        console.log('🗺️ Using location bias:', biasToLocation);
      }
    } else if (import.meta.env.DEV) {
      console.log('🌍 No valid bias - global search');
    }

    // ESA Layer 13: Timeout protection to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsSearching(false);
      console.error('❌ Google Places timeout after 8 seconds');
      toast({
        title: 'Search timeout',
        description: 'Location search is taking too long. Please try again.',
        variant: 'destructive',
      });
    }, 8000);

    try {
      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (predictions: any, status: any) => {
          clearTimeout(timeoutId);
          setIsSearching(false);
          
          const google = (window as any).google;
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            if (import.meta.env.DEV) {
              console.log('✅ Found', predictions.length, 'Google suggestions');
            }
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setSuggestions([]);
            setShowSuggestions(false);
          } else {
            console.error('❌ Google Places error:', status);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Google Places exception:', error);
      setIsSearching(false);
      setSuggestions([]);
    }
  }, [strategy, biasToLocation, searchTypes, toast]);

  const searchOSM = useCallback(async (query: string) => {
    if (strategy !== 'osm') return;

    setIsSearching(true);

    // ESA Layer 15: Smart location-biased search using user's current location
    try {
      // Use detected user location for bias, fall back to prop bias
      const effectiveBias = userLocation || biasToLocation;
      
      // Build API URL with location bias
      let apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`;
      
      // Add viewbox if we have a valid location (prioritizes nearby results)
      if (effectiveBias && validateCoordinates(effectiveBias)) {
        // Create ~50km radius viewbox around user location
        // 1 degree ≈ 111km, so 0.45° ≈ 50km
        const latOffset = 0.45;
        const lngOffset = 0.6; // Adjusted for latitude distortion
        
        const minLng = effectiveBias.lng - lngOffset;
        const maxLng = effectiveBias.lng + lngOffset;
        const minLat = effectiveBias.lat - latOffset;
        const maxLat = effectiveBias.lat + latOffset;
        
        // viewbox format: minLng,minLat,maxLng,maxLat
        apiUrl += `&viewbox=${minLng},${minLat},${maxLng},${maxLat}`;
        // bounded=0 means "prefer this area but show global results too"
        apiUrl += `&bounded=0`;
        
        if (import.meta.env.DEV) {
          const locationSource = userLocation ? 'detected' : 'prop';
          const cityInfo = locationCity ? ` (${locationCity}, ${locationCountry})` : '';
          console.log(`🗺️ Using ${locationSource} location bias${cityInfo}:`, effectiveBias);
        }
      } else if (import.meta.env.DEV) {
        console.log('🌍 No location bias - global search');
      }

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'MundoTangoApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`OSM API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const osmSuggestions = data.map((place: any) => ({
          description: place.display_name,
          isOSM: true,
          lat: place.lat,
          lon: place.lon,
          place_id: place.place_id,
          address: place.address
        }));

        setSuggestions(osmSuggestions);
        setShowSuggestions(true);

        if (import.meta.env.DEV) {
          console.log('✅ Found', osmSuggestions.length, 'OpenStreetMap suggestions');
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ OpenStreetMap search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, [strategy, userLocation, locationCity, locationCountry, biasToLocation, validateCoordinates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (strategy === 'google') {
      searchGooglePlaces(newValue);
    } else if (strategy === 'osm') {
      searchOSM(newValue);
    }
  };

  const selectGooglePlace = useCallback((prediction: any) => {
    if (!placesServiceRef.current) return;

    const request = {
      placeId: prediction.place_id,
      fields: ['name', 'formatted_address', 'geometry', 'rating', 'price_level', 'business_status', 'types']
    };

    placesServiceRef.current.getDetails(request, (place: any, status: any) => {
      const google = (window as any).google;
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const details: LocationDetails = {
          name: place.name || prediction.description,
          address: place.formatted_address || prediction.description,
          coordinates: place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : undefined,
          placeId: prediction.place_id,
          types: place.types,
          rating: place.rating,
          priceLevel: place.price_level,
          businessStatus: place.business_status
        };

        onChange(details.name, details.coordinates, details);
        setShowSuggestions(false);

        if (showBusinessDetails && details.rating) {
          toast({
            title: `📍 ${details.name}`,
            description: `⭐ ${details.rating} • ${details.address}`,
          });
        }
      }
    });
  }, [onChange, showBusinessDetails, toast]);

  const selectOSMPlace = useCallback((suggestion: any) => {
    const location = suggestion.description;
    const coords = suggestion.lat && suggestion.lon ? {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    } : undefined;

    const details: LocationDetails = {
      name: suggestion.address?.name || location.split(',')[0],
      address: location,
      coordinates: coords,
      city: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village,
      state: suggestion.address?.state,
      country: suggestion.address?.country
    };

    onChange(location, coords, details);
    setShowSuggestions(false);

    if (import.meta.env.DEV) {
      console.log('📍 Selected OSM location:', details);
    }
  }, [onChange]);

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.isOSM) {
      selectOSMPlace(suggestion);
    } else {
      selectGooglePlace(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLoading = initState === 'loading' || isSearching;

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={initState === 'loading' ? 'Loading...' : placeholder}
          disabled={initState === 'loading'}
          required={required}
          className={`pl-10 pr-10 py-3 w-full border border-gray-200 dark:border-gray-700 rounded-xl 
            bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-turquoise-500 
            disabled:bg-gray-50 disabled:cursor-wait
            transition-all duration-200 ${className}`}
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
        {!isLoading && value && allowManualEntry && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg 
            border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id || suggestion.description}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150
                  ${index === selectedIndex 
                    ? 'bg-gradient-to-r from-turquoise-500/20 to-ocean-blue-500/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                  ${index !== suggestions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-turquoise-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.structured_formatting?.main_text || suggestion.description}
                    </p>
                    {suggestion.structured_formatting?.secondary_text && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {suggestion.structured_formatting.secondary_text}
                      </p>
                    )}
                    {suggestion.isOSM && (
                      <p className="text-xs text-turquoise-600 dark:text-turquoise-400 mt-1">
                        OpenStreetMap
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
