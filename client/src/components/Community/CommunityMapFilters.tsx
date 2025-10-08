import { Filter, X, Calendar, Home, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { GlassCard } from '@/components/glass/GlassComponents';

export interface CommunityMapFilters {
  // Event filters
  eventType: string;
  startDate: Date | null;
  endDate: Date | null;
  hasSpace: boolean;
  
  // Housing filters
  roomType: string;
  minGuests: string;
  connectionLevel: string;
  
  // Recommendations filters
  cuisine: string;
  category: string;
  priceLevel: string;
}

interface CommunityMapFiltersProps {
  filters: CommunityMapFilters;
  onFiltersChange: (filters: CommunityMapFilters) => void;
  compact?: boolean;
}

const EVENT_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'milonga', label: 'Milonga' },
  { value: 'practica', label: 'Practica' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'festival', label: 'Festival' },
  { value: 'performance', label: 'Performance' },
];

const ROOM_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'entire_place', label: 'Entire Place' },
  { value: 'private_room', label: 'Private Room' },
  { value: 'shared_room', label: 'Shared Room' },
];

const MIN_GUESTS = [
  { value: 'all', label: 'Any Guests' },
  { value: '1', label: '1+ Guests' },
  { value: '2', label: '2+ Guests' },
  { value: '3', label: '3+ Guests' },
  { value: '4', label: '4+ Guests' },
  { value: '5', label: '5+ Guests' },
  { value: '6', label: '6+ Guests' },
  { value: '7', label: '7+ Guests' },
  { value: '8', label: '8+ Guests' },
];

const CONNECTION_LEVELS = [
  { value: 'all', label: 'All Hosts' },
  { value: '1st_degree', label: '1st Degree' },
  { value: '2nd_degree', label: '1-2nd Degree' },
  { value: '3rd_degree', label: '1-3rd Degree' },
];

const CUISINES = [
  { value: 'all', label: 'All Cuisines' },
  { value: 'italian', label: 'Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'french', label: 'French' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'thai', label: 'Thai' },
  { value: 'indian', label: 'Indian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'american', label: 'American' },
  { value: 'argentinian', label: 'Argentinian' },
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'venue', label: 'Venue' },
];

const PRICE_LEVELS = [
  { value: 'all', label: 'All Prices' },
  { value: '$', label: '$' },
  { value: '$$', label: '$$' },
  { value: '$$$', label: '$$$' },
  { value: '$$$$', label: '$$$$' },
];

export default function CommunityMapFilters({ 
  filters, 
  onFiltersChange, 
  compact = false 
}: CommunityMapFiltersProps) {
  const updateFilter = (key: keyof CommunityMapFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      eventType: 'all',
      startDate: null,
      endDate: null,
      hasSpace: false,
      roomType: 'all',
      minGuests: 'all',
      connectionLevel: 'all',
      cuisine: 'all',
      category: 'all',
      priceLevel: 'all',
    });
  };

  const activeFiltersCount = [
    filters.eventType !== 'all',
    filters.startDate !== null,
    filters.endDate !== null,
    filters.hasSpace,
    filters.roomType !== 'all',
    filters.minGuests !== 'all',
    filters.connectionLevel !== 'all',
    filters.cuisine !== 'all',
    filters.category !== 'all',
    filters.priceLevel !== 'all',
  ].filter(Boolean).length;

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-cyan-200/30 dark:border-ocean-500/30 hover:border-cyan-300/50 dark:hover:border-cyan-400/50 transition-all duration-200" 
           
          >
            <Filter className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
            <span className="text-slate-700 dark:text-slate-300">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-xs flex items-center justify-center font-medium shadow-lg">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 border-cyan-200/30 dark:border-ocean-500/30 !z-[1000]" align="end">
          <GlassCard depth={1} className="border-0">
            <FiltersContent 
              filters={filters} 
              updateFilter={updateFilter} 
              clearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </GlassCard>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <GlassCard depth={1} className="border-cyan-200/30 dark:border-ocean-500/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 dark:from-cyan-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
          <Filter className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          Community Filters
        </h3>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-colors"
           
          >
            <X className="h-4 w-4 mr-1" />
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>
      <FiltersContent 
        filters={filters} 
        updateFilter={updateFilter} 
        clearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </GlassCard>
  );
}

function FiltersContent({ 
  filters, 
  updateFilter, 
  clearFilters, 
  activeFiltersCount 
}: {
  filters: CommunityMapFilters;
  updateFilter: (key: keyof CommunityMapFilters, value: any) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Events Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-200/30 dark:border-ocean-500/30">
          <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Events</h4>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-type" className="text-xs text-slate-600 dark:text-slate-400">Event Type</Label>
          <Select 
            value={filters.eventType} 
            onValueChange={(value) => updateFilter('eventType', value)}
          >
            <SelectTrigger 
              id="event-type" 
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
             
            >
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} data-testid={`option-event-type-${type.value}`}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-600 dark:text-slate-400">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start text-left font-normal bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300"
                 
                >
                  <Calendar className="h-3 w-3 mr-2 text-cyan-600 dark:text-cyan-400" />
                  {filters.startDate ? format(filters.startDate, 'MMM dd') : 'Start'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={(date) => updateFilter('startDate', date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start text-left font-normal bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300"
                 
                >
                  <Calendar className="h-3 w-3 mr-2 text-cyan-600 dark:text-cyan-400" />
                  {filters.endDate ? format(filters.endDate, 'MMM dd') : 'End'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => updateFilter('endDate', date || null)}
                  initialFocus
                  disabled={(date) => {
                    if (!filters.startDate) return false;
                    return date < filters.startDate;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Label htmlFor="has-space" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            Only with available space
          </Label>
          <Switch
            id="has-space"
            checked={filters.hasSpace}
            onCheckedChange={(checked) => updateFilter('hasSpace', checked)}
           
          />
        </div>
      </div>

      {/* Housing Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-200/30 dark:border-ocean-500/30">
          <Home className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Housing</h4>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="room-type" className="text-xs text-slate-600 dark:text-slate-400">Room Type</Label>
          <Select 
            value={filters.roomType} 
            onValueChange={(value) => updateFilter('roomType', value)}
          >
            <SelectTrigger 
              id="room-type" 
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
             
            >
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

        <div className="space-y-2">
          <Label htmlFor="min-guests" className="text-xs text-slate-600 dark:text-slate-400">Minimum Guests</Label>
          <Select 
            value={filters.minGuests} 
            onValueChange={(value) => updateFilter('minGuests', value)}
          >
            <SelectTrigger 
              id="min-guests" 
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
             
            >
              <SelectValue placeholder="Select minimum guests" />
            </SelectTrigger>
            <SelectContent>
              {MIN_GUESTS.map((guest) => (
                <SelectItem key={guest.value} value={guest.value} data-testid={`option-min-guests-${guest.value}`}>
                  {guest.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="connection-level" className="text-xs text-slate-600 dark:text-slate-400">Connection Level</Label>
          <Select 
            value={filters.connectionLevel} 
            onValueChange={(value) => updateFilter('connectionLevel', value)}
          >
            <SelectTrigger 
              id="connection-level" 
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
             
            >
              <SelectValue placeholder="Select connection level" />
            </SelectTrigger>
            <SelectContent>
              {CONNECTION_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value} data-testid={`option-connection-level-${level.value}`}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recommendations Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-200/30 dark:border-ocean-500/30">
          <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Recommendations</h4>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cuisine" className="text-xs text-slate-600 dark:text-slate-400">Cuisine</Label>
          <Select 
            value={filters.cuisine} 
            onValueChange={(value) => updateFilter('cuisine', value)}
          >
            <SelectTrigger 
              id="cuisine" 
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
             
            >
              <SelectValue placeholder="Select cuisine" />
            </SelectTrigger>
            <SelectContent>
              {CUISINES.map((cuisine) => (
                <SelectItem key={cuisine.value} value={cuisine.value} data-testid={`option-cuisine-${cuisine.value}`}>
                  {cuisine.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-xs text-slate-600 dark:text-slate-400">Category</Label>
          <Select 
            value={filters.category} 
            onValueChange={(value) => updateFilter('category', value)}
          >
            <SelectTrigger 
              id="category" 
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
             
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} data-testid={`option-category-${cat.value}`}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-level" className="text-xs text-slate-600 dark:text-slate-400">Price Level</Label>
          <Select 
            value={filters.priceLevel} 
            onValueChange={(value) => updateFilter('priceLevel', value)}
          >
            <SelectTrigger 
              id="price-level" 
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
             
            >
              <SelectValue placeholder="Select price level" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_LEVELS.map((price) => (
                <SelectItem key={price.value} value={price.value} data-testid={`option-price-level-${price.value}`}>
                  {price.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
