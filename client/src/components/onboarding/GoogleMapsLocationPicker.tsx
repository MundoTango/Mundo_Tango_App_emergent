import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import LocationInput from '../universal/LocationInput';

interface LocationData {
  country: string;
  state?: string;
  city?: string;
  countryId: number;
  stateId?: number;
  cityId?: number;
}

interface GoogleMapsLocationPickerProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  className?: string;
}

export default function GoogleMapsLocationPicker({ value, onChange, className }: GoogleMapsLocationPickerProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (value.city && value.state && value.country) {
      return `${value.city}, ${value.state}, ${value.country}`;
    } else if (value.state && value.country) {
      return `${value.state}, ${value.country}`;
    } else if (value.country) {
      return value.country;
    }
    return '';
  });

  const handleLocationChange = useCallback((location: string, coordinates?: { lat: number; lng: number }, details?: any) => {
    // Extract city, state, country from location string
    const parts = location.split(',').map(p => p.trim());
    const country = parts[parts.length - 1] || '';
    const state = parts.length > 2 ? parts[parts.length - 2] : undefined;
    const city = parts.length > 2 ? parts[0] : undefined;
    
    const newLocation: LocationData = {
      country,
      state,
      city,
      countryId: Math.abs(country.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)),
      stateId: state ? Math.abs(state.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)) : undefined,
      cityId: city ? Math.abs(city.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)) : undefined,
    };

    setDisplayValue(location);
    onChange(newLocation);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setDisplayValue('');
    onChange({
      country: '',
      countryId: 0
    });
  }, [onChange]);

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <Label htmlFor="location" className="font-medium">Location</Label>
          </div>
          
          <LocationInput
            value={displayValue}
            placeholder="Search for your location..."
            onChange={handleLocationChange}
            onClear={handleClear}
            className="w-full"
            required
          />

          {displayValue && (
            <div className="text-sm text-gray-600 mt-2">
              <p>Selected: <span className="font-medium">{displayValue}</span></p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}