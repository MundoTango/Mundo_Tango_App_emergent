import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Loader, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocationBias } from '@/contexts/LocationBiasContext';
import { GlassCard } from '@/components/glass/GlassComponents';


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
  const [suggestions, setSuggestions] = useState<any[] data-testid="link-element">([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<any data-testid="link-element">(null);
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
    // ESA Layer 13 + 15: Backend proxy with multi-provider strategy
    // LocationIQ (fast, 10k/day free) → Nominatim (free fallback) → Local DB
    if (import.meta.env.DEV) {
      console.log('🗺️ UnifiedLocationPicker: Using backend proxy (LocationIQ → Nominatim → Local DB)');
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
      
      // ESA Layer 15: Enhanced business search with multiple strategies
      const searchPromises: Promise<any[] data-testid="link-element">[] = [];
      
      // Strategy 1: Standard location search with business priority
      const standardUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      let standardUrlWithBias = standardUrl;
      
      if (effectiveBias && validateCoordinates(effectiveBias)) {
        const latOffset = 0.45;
        const lngOffset = 0.6;
        const minLng = effectiveBias.lng - lngOffset;
        const maxLng = effectiveBias.lng + lngOffset;
        const minLat = effectiveBias.lat - latOffset;
        const maxLat = effectiveBias.lat + latOffset;
        
        standardUrlWithBias += `&viewbox=${minLng},${minLat},${maxLng},${maxLat}&bounded=0`;
        
        if (import.meta.env.DEV) {
          const locationSource = userLocation ? 'detected' : 'prop';
          const cityInfo = locationCity ? ` (${locationCity}, ${locationCountry})` : '';
          console.log(`🗺️ Using ${locationSource} location bias${cityInfo}:`, effectiveBias);
        }
      }
      
      // ESA Layer 13: Use backend proxy to avoid CORS issues
      const proxyUrl = `/api/location/geocode?q=${encodeURIComponent(query)}&limit=8`;
      const proxyParams = new URLSearchParams();
      
      if (effectiveBias && validateCoordinates(effectiveBias)) {
        proxyParams.append('lat', effectiveBias.lat.toString());
        proxyParams.append('lng', effectiveBias.lng.toString());
      }
      
      searchPromises.push(
        fetch(`${proxyUrl}&${proxyParams.toString()}`)
          .then(r => r.json())
          .catch(err => {
            console.error('❌ Geocoding proxy error:', err);
            return [];
          })
      );

      const results = await Promise.allSettled(searchPromises);
      
      // Combine all successful results
      const allPlaces: any[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allPlaces.push(...result.value);
        }
      });

      // Remove duplicates based on place_id
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.place_id, place])).values()
      );

      if (uniquePlaces.length > 0) {
        const osmSuggestions = uniquePlaces.slice(0, 8).map((place: any) => ({
          description: place.description || place.display_name,
          isOSM: place.isOSM || false,
          isLocationIQ: place.isLocationIQ || false,
          isLocal: place.isLocal || false,
          lat: place.lat,
          lon: place.lon,
          place_id: place.place_id,
          address: place.address
        }));

        setSuggestions(osmSuggestions);
        setShowSuggestions(true);

        if (import.meta.env.DEV) {
          // Detect which provider was used
          const hasLocationIQ = osmSuggestions.some(s => s.isLocationIQ);
          const hasOSM = osmSuggestions.some(s => s.isOSM && !s.isLocationIQ);
          const hasLocal = osmSuggestions.some(s => s.isLocal);
          
          const providers = [];
          if (hasLocationIQ) providers.push('LocationIQ');
          if (hasOSM) providers.push('Nominatim');
          if (hasLocal) providers.push('Local');
          
          const providerStr = providers.length > 0 ? providers.join(' + ') : 'Unknown';
          console.log(`✅ Found ${osmSuggestions.length} suggestions via ${providerStr}`);
        }
      } else {
        // ESA Layer 28: Fallback to local database recommendations
        await searchLocalRecommendations(query);
      }
    } catch (error) {
      console.error('❌ OpenStreetMap search error:', error);
      // ESA Layer 28: Fallback to local database
      await searchLocalRecommendations(query);
    } finally {
      setIsSearching(false);
    }
  }, [strategy, userLocation, locationCity, locationCountry, biasToLocation, validateCoordinates, showBusinessDetails]);

  const searchLocalRecommendations = useCallback(async (query: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔍 Searching local recommendations database...');
      }
      
      const response = await fetch(`/api/recommendations?search=${encodeURIComponent(query)}&limit=5`);
      
      if (response.ok) {
        const recommendations = await response.json();
        
        if (recommendations && recommendations.length > 0) {
          const localSuggestions = recommendations.map((rec: any) => ({
            description: `${rec.title} - ${rec.location}`,
            isOSM: false,
            isLocal: true,
            lat: rec.latitude,
            lon: rec.longitude,
            place_id: `local-${rec.id}`,
            address: { name: rec.title },
            recommendation: rec
          }));
          
          setSuggestions(localSuggestions);
          setShowSuggestions(true);
          
          if (import.meta.env.DEV) {
            console.log('✅ Found', localSuggestions.length, 'local recommendations');
          }
          return;
        }
      }
      
      // If no local results either, show empty state
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error('❌ Local recommendations search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

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

  const selectLocalRecommendation = useCallback((suggestion: any) => {
    const rec = suggestion.recommendation;
    const coords = suggestion.lat && suggestion.lon ? {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    } : undefined;

    const details: LocationDetails = {
      name: rec.title,
      address: rec.location,
      coordinates: coords,
      city: rec.city,
      country: rec.country
    };

    onChange(rec.location, coords, details);
    setShowSuggestions(false);

    if (import.meta.env.DEV) {
      console.log('📍 Selected local recommendation:', details);
    }
  }, [onChange]);

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.isLocal) {
      selectLocalRecommendation(suggestion);
    } else if (suggestion.isOSM || suggestion.isLocationIQ) {
      // Both LocationIQ and Nominatim use the same data structure
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
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={()> value && suggestions.length > 0 && setShowSuggestions(true)}
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
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400 animate-spin" />
        )}
        {!isLoading && value && allowManualEntry && (
          <button
            type="button"
            onClick={()> {
              onChange('');
              setSuggestions([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <GlassCard depth={2} className="absolute z-popover w-full mt-2 dark:bg-gray-800/95 
            border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
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
               role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); () => handleSuggestionClick(suggestion)(e); } }}>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-turquoise-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.structured_formatting?.main_text || suggestion.description}
                    </p>
                    {suggestion.structured_formatting?.secondary_text && (
                      <p className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400 truncate mt-0.5">
                        {suggestion.structured_formatting.secondary_text}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {suggestion.isLocal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-700 dark:text-cyan-300 border border-ocean-500/30">
                          ⭐ Platform Recommendation
                        </span>
                      )}
                      {suggestion.isLocationIQ && (
                        <span className="text-xs text-turquoise-600 dark:text-turquoise-400 font-medium">
                          ⚡ LocationIQ
                        </span>
                      )}
                      {suggestion.isOSM && !suggestion.isLocationIQ && (
                        <span className="text-xs text-ocean-blue-600 dark:text-ocean-blue-400">
                          🌍 OpenStreetMap
                        </span>
                      )}
                    </div>
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
