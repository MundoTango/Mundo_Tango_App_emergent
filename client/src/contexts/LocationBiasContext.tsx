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
  try {
    // ESA Layer 13: Use free ip-api.com service (no API key required)
    const response = await fetch('http://ip-api.com/json/?fields=status,country,city,lat,lon', {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`IP geolocation failed: ${response.status}`);
    }

    const data: IPGeolocationResponse = await response.json();

    if (data.status === 'success') {
      return {
        coordinates: { lat: data.lat, lng: data.lon },
        city: data.city,
        country: data.country
      };
    }

    return null;
  } catch (error) {
    console.warn('⚠️ IP geolocation failed:', error);
    return null;
  }
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
