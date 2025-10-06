import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationDetails {
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
  types?: string[];
  rating?: number;
  priceLevel?: number;
  businessStatus?: string;
}

interface LocationInputProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }, details?: LocationDetails) => void;
  placeholder?: string;
  className?: string;
  biasToLocation?: { lat: number; lng: number }; // For Buenos Aires bias
  searchTypes?: string[]; // Custom search types
  showBusinessDetails?: boolean; // Show ratings, price level etc
  allowManualEntry?: boolean; // Allow manual venue entry for places not in Google's index
  allowGoogleMapsUrl?: boolean; // Allow pasting Google Maps URLs
}

// Helper function to extract Place ID from Google Maps URL
function extractPlaceIdFromUrl(url: string): string | null {
  try {
    // Handle various Google Maps URL formats
    // Format 1: https://maps.app.goo.gl/... (short URL)
    // Format 2: https://www.google.com/maps/place/...
    // Format 3: Contains place ID in URL parameters
    
    // For now, we'll need to make an API call to resolve short URLs
    // or parse the place data from the URL
    
    // Check if it's a maps URL
    if (url.includes('maps.app.goo.gl') || url.includes('google.com/maps')) {
      // Extract any visible place ID patterns
      const placeIdMatch = url.match(/[A-Za-z0-9_-]{27,}/);;
      if (placeIdMatch) {
        return placeIdMatch[0];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting place ID:', error);
    return null;
  }
}

// Google Maps Places API Script Loader
const loadGoogleMapsScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&region=AR`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    
    document.head.appendChild(script);
  });
};

export default function GoogleMapsLocationInput({ 
  value, 
  onChange, 
  placeholder = "Search for venues, restaurants, milongas...",
  className = "",
  biasToLocation = { lat: -34.6037, lng: -58.3816 }, // Buenos Aires default
  searchTypes = [], // Will search all establishment types by default
  showBusinessDetails = true,
  allowManualEntry = true,
  allowGoogleMapsUrl = true
}: LocationInputProps) {
  // ESA Layer 13: Track initialization state to prevent premature searches
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const { toast } = useToast();

  // ESA Layer 13: Initialize Google Maps with state tracking
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🗺️ GoogleMapsLocationInput: Starting initialization...');
    }
    
    loadGoogleMapsScript()
      .then(() => {
        if (import.meta.env.DEV) {
          console.log('✅ Google Maps script loaded successfully');
        }
        
        // Create services
        autocompleteServiceRef.current = new (window as any).google.maps.places.AutocompleteService();
        const div = document.createElement('div');
        placesServiceRef.current = new google.maps.places.PlacesService(div);
        
        // Mark as initialized AFTER both services are created
        setIsInitialized(true);
        
        if (import.meta.env.DEV) {
          console.log('✅ AutocompleteService created:', !!autocompleteServiceRef.current);
          console.log('✅ PlacesService created:', !!placesServiceRef.current);
          console.log('🗺️ GoogleMapsLocationInput: Initialization complete, ready for searches');
        }
      })
      .catch(error => {
        console.error('❌ Google Maps initialization error:', error);
        setIsInitialized(false);
        toast({
          title: "Location search unavailable",
          description: "Google Maps failed to load. Please refresh the page.",
          variant: "destructive"
        });
      });
  }, [toast]);

  // Check if input is a Google Maps URL and fetch place details
  const handleGoogleMapsUrl = useCallback(async (url: string) => {
    if (!allowGoogleMapsUrl) return;
    
    // Check if it's a Google Maps URL
    if (url.includes('maps.app.goo.gl') || url.includes('google.com/maps')) {
      setIsLoading(true);
      
      try {
        // Try to extract place ID from URL
        // Note: For short URLs, we'd need server-side resolution
        // For now, we'll prompt user to enter manually if we can't extract
        
        toast({
          title: "Google Maps URL detected",
          description: "Searching for this place...",
        });
        
        // If we can't extract Place ID, show notification
        toast({
          title: "Place not found",
          description: "Please try searching for the venue name instead",
        });
      } catch (error) {
        console.error('Error processing Google Maps URL:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [allowGoogleMapsUrl, toast]);

  // ESA Layer 13: Search for places with initialization check
  const searchPlaces = useCallback(async (query: string) => {
    console.log('🔍 GoogleMapsLocationInput: searchPlaces called');
    console.log('🔍 Query:', query, 'Type:', typeof query, 'Length:', query?.length);
    console.log('🔍 isInitialized:', isInitialized);
    console.log('🔍 AutocompleteService exists:', !!autocompleteServiceRef.current);
    
    // Check if it's a Google Maps URL first
    if (query.includes('maps.app.goo.gl') || query.includes('google.com/maps')) {
      handleGoogleMapsUrl(query);
      return;
    }
    
    // Check query length
    if (!query || query.length < 3) {
      if (import.meta.env.DEV) {
        console.log('🔍 Query too short (<3 chars), clearing suggestions');
      }
      setSuggestions([]);
      return;
    }
    
    // ESA Layer 13: Wait for initialization before searching
    if (!isInitialized || !autocompleteServiceRef.current) {
      console.warn('⚠️ GoogleMaps not initialized yet, cannot search');
      if (import.meta.env.DEV) {
        console.log('⏳ Please wait for initialization to complete');
      }
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    const request: any = {
      input: query,
      // Search for all types of establishments if no specific types provided
      types: searchTypes.length > 0 ? searchTypes : ['establishment'],
      // Properly bias results to location using valid Google Maps parameters
      location: new (window as any).google.maps.LatLng(biasToLocation.lat, biasToLocation.lng),
      radius: 50000, // 50km radius
    };

    if (import.meta.env.DEV) {
      console.log('🔍 Making autocomplete request:', { query, types: request.types });
    }

    try {
      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (predictions: any, status: any) => {
          setIsLoading(false);
          
          if (import.meta.env.DEV) {
            console.log('🔍 Autocomplete response:', { status, predictionsCount: predictions?.length || 0 });
          }
          
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
            if (import.meta.env.DEV) {
              console.log('✅ Found', predictions.length, 'suggestions');
            }
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else if (status === (window as any).google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            if (import.meta.env.DEV) {
              console.log('📭 No results found for query:', query);
            }
            setSuggestions([]);
          } else {
            console.error('❌ Autocomplete error:', status);
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error('❌ Exception during autocomplete:', error);
      setIsLoading(false);
      setSuggestions([]);
    }
  }, [isInitialized, biasToLocation, searchTypes, handleGoogleMapsUrl]);

  // ESA Layer 13: Handle input change with logging
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('📝 LocationInput: User typed:', newValue, 'Length:', newValue.length);
    onChange(newValue);
    console.log('📝 About to call searchPlaces with:', newValue);
    searchPlaces(newValue);
  };

  // Select a place from suggestions
  const selectPlace = (prediction: any) => {
    if (!placesServiceRef.current) return;

    setIsLoading(true);
    
    // Get comprehensive place details
    const fields = showBusinessDetails 
      ? ['geometry', 'name', 'formatted_address', 'rating', 'price_level', 'types', 'business_status', 'user_ratings_total']
      : ['geometry', 'name', 'formatted_address', 'types'];
    
    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: fields
      },
      (place, status) => {
        setIsLoading(false);
        
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place && place.geometry?.location) {
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Build comprehensive location details
          const locationDetails: LocationDetails = {
            name: place.name || prediction.structured_formatting.main_text,
            address: place.formatted_address || prediction.structured_formatting.secondary_text || '',
            coordinates: coordinates,
            placeId: prediction.place_id,
            types: place.types || [],
            rating: (place as any).rating,
            priceLevel: (place as any).price_level,
            businessStatus: (place as any).business_status
          };
          
          // Use the business name as the primary location
          const displayName = place.name || prediction.structured_formatting.main_text;
          onChange(displayName, coordinates, locationDetails);
          
          setSuggestions([]);
          setShowSuggestions(false);
          
          // Show enhanced toast with business details
          let toastDescription = prediction.structured_formatting.secondary_text || '';
          if (showBusinessDetails && (place as any).rating) {
            toastDescription += `\n⭐ ${(place as any).rating}/5`;
            if ((place as any).user_ratings_total) {
              toastDescription += ` (${(place as any).user_ratings_total} reviews)`;
            }
          }
          
          toast({
            title: "Location selected! 📍",
            description: toastDescription,
          });
        }
      }
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectPlace(suggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={isInitialized ? placeholder : "Loading Google Maps..."}
          disabled={!isInitialized}
          className={`pl-10 pr-10 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-turquoise-500 ${
            !isInitialized ? 'bg-gray-50 cursor-wait' : ''
          } ${className}`}
        />
        {(isLoading || !isInitialized) && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>
      

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              onClick={() => selectPlace(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-gray-50' : ''
              } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                  {/* Show place types if available */}
                  {suggestion.types && suggestion.types.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {suggestion.types.slice(0, 3).map((type: string) => 
                        type.replace(/_/g, ' ')
                      ).join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}