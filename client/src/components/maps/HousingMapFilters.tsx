import { Calendar, DollarSign, Filter, Home, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

export interface HousingFilters {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  priceRange: [number, number];
  roomType: string;
}

interface HousingMapFiltersProps {
  filters: HousingFilters;
  onFiltersChange: (filters: HousingFilters) => void;
  compact?: boolean;
}

const ROOM_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'private', label: 'Private Room' },
  { value: 'shared', label: 'Shared Room' },
  { value: 'entire', label: 'Entire Place' },
];

const MAX_PRICE = 500;

export default function HousingMapFilters({ 
  filters, 
  onFiltersChange, 
  compact = false 
}: HousingMapFiltersProps) {
  const updateFilter = <K extends keyof HousingFilters>(key: K, value: HousingFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      checkIn: null,
      checkOut: null,
      priceRange: [0, MAX_PRICE],
      roomType: 'all',
    });
  };

  const activeFiltersCount = [
    filters.location !== '',
    filters.checkIn !== null,
    filters.checkOut !== null,
    filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE,
    filters.roomType !== 'all',
  ].filter(Boolean).length;

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative" data-testid="button-housing-filters">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <FiltersContent 
            filters={filters} 
            updateFilter={updateFilter} 
            clearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Housing Filters
        </h3>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            data-testid="button-clear-housing-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>
      <FiltersContent 
        filters={filters} 
        updateFilter={updateFilter} 
        clearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}

function FiltersContent({ 
  filters, 
  updateFilter, 
  clearFilters, 
  activeFiltersCount 
}: {
  filters: HousingFilters;
  updateFilter: <K extends keyof HousingFilters>(key: K, value: HousingFilters[K]) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
}) {
  return (
    <div className="space-y-4">
      {/* Location Search */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Search by city, neighborhood..."
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          data-testid="input-housing-location"
        />
      </div>

      {/* Check-in / Check-out Dates */}
      <div className="space-y-2">
        <Label>Dates</Label>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-left font-normal"
                data-testid="button-check-in"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {filters.checkIn ? format(filters.checkIn, 'MMM dd') : 'Check-in'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={filters.checkIn || undefined}
                onSelect={(date) => updateFilter('checkIn', date || null)}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-left font-normal"
                data-testid="button-check-out"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {filters.checkOut ? format(filters.checkOut, 'MMM dd') : 'Check-out'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={filters.checkOut || undefined}
                onSelect={(date) => updateFilter('checkOut', date || null)}
                initialFocus
                disabled={(date) => {
                  if (date < new Date()) return true;
                  if (!filters.checkIn) return false;
                  return date <= filters.checkIn;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range (per night)
          </Label>
          <span className="text-sm text-muted-foreground" data-testid="text-price-range">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </span>
        </div>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={10}
          value={filters.priceRange}
          onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
          className="w-full"
          data-testid="slider-price-range"
        />
      </div>

      {/* Room Type */}
      <div className="space-y-2">
        <Label htmlFor="room-type" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Room Type
        </Label>
        <Select 
          value={filters.roomType} 
          onValueChange={(value) => updateFilter('roomType', value)}
        >
          <SelectTrigger id="room-type" data-testid="select-room-type">
            <SelectValue placeholder="Select room type" />
          </SelectTrigger>
          <SelectContent>
            {ROOM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} data-testid={`option-room-type-${type.value}`}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
