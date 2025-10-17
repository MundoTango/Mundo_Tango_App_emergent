import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface LocationBiasContextType {
  userLocation: LocationCoordinates | null;
  locationCity: string | null;
  locationCountry: string | null;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

const LocationBiasContext = createContext<LocationBiasContextType | undefined>(undefined);

interface IPGeolocationResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  query: string;
}

async function detectIPLocation(): Promise<{
  coordinates: LocationCoordinates;
  city: string;
  country: string;
} | null> {
  // ESA Layer 13: Try multiple free geolocation services with fallbacks
  
  // Service 1: ipapi.co (HTTPS, no key, 1000/day limit)
  try {
    if (import.meta.env.DEV) {
      console.log('📍 Attempting IP geolocation via ipapi.co...');
    }
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data: any = await response.json();

      if (data.latitude && data.longitude) {
        if (import.meta.env.DEV) {
          console.log('✅ IP geolocation successful:', {
            city: data.city,
            country: data.country_name,
            coordinates: { lat: data.latitude, lng: data.longitude }
          });
        }
        return {
          coordinates: { lat: data.latitude, lng: data.longitude },
          city: data.city || 'Unknown',
          country: data.country_name || 'Unknown'
        };
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ ipapi.co failed:', error);
    }
  }

  // Service 2: Fallback to freeipapi.com (no rate limit)
  try {
    if (import.meta.env.DEV) {
      console.log('📍 Trying fallback: freeipapi.com...');
    }
    
    const response = await fetch('https://freeipapi.com/api/json', {
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data: any = await response.json();

      if (data.latitude && data.longitude) {
        if (import.meta.env.DEV) {
          console.log('✅ Fallback geolocation successful:', {
            city: data.cityName,
            country: data.countryName,
            coordinates: { lat: data.latitude, lng: data.longitude }
          });
        }
        return {
          coordinates: { lat: data.latitude, lng: data.longitude },
          city: data.cityName || 'Unknown',
          country: data.countryName || 'Unknown'
        };
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ freeipapi.com failed:', error);
    }
  }

  if (import.meta.env.DEV) {
    console.warn('❌ All IP geolocation services failed - using default Buenos Aires location');
  }
  
  // ESA Layer 13: Graceful degradation - default to Buenos Aires (most common user location)
  return {
    coordinates: { lat: -34.6037, lng: -58.3816 },
    city: 'Buenos Aires',
    country: 'Argentina'
  };
}

async function detectBrowserLocation(): Promise<LocationCoordinates | null> {
  // ESA Layer 47: Browser GPS geolocation (optional, more accurate)
  if (!navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.log('📍 Browser geolocation denied or unavailable:', error.message);
        }
        resolve(null);
      },
      {
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
        enableHighAccuracy: false
      }
    );
  });
}

export function LocationBiasProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationCity, setLocationCity] = useState<string | null>(null);
  const [locationCountry, setLocationCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ESA Layer 8: Try browser GPS first (more accurate but requires permission)
      const browserLocation = await detectBrowserLocation();

      if (browserLocation) {
        setUserLocation(browserLocation);
        if (import.meta.env.DEV) {
          console.log('📍 Using browser GPS location:', browserLocation);
        }
        setIsLoading(false);
        return;
      }

      // Fallback to IP geolocation
      const ipLocation = await detectIPLocation();

      if (ipLocation) {
        setUserLocation(ipLocation.coordinates);
        setLocationCity(ipLocation.city);
        setLocationCountry(ipLocation.country);
        
        if (import.meta.env.DEV) {
          console.log('🌍 Using IP geolocation:', ipLocation);
        }
      } else {
        console.warn('⚠️ Location detection failed, using global search');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('❌ Location detection error:', message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ESA Layer 13: Auto-detect location on mount
    refreshLocation();
  }, []);

  const value: LocationBiasContextType = {
    userLocation,
    locationCity,
    locationCountry,
    isLoading,
    error,
    refreshLocation
  };

  return (
    <LocationBiasContext.Provider value={value}>
      {children}
    </LocationBiasContext.Provider>
  );
}

export function useLocationBias() {
  const context = useContext(LocationBiasContext);
  if (context === undefined) {
    throw new Error('useLocationBias must be used within a LocationBiasProvider');
  }
  return context;
}
