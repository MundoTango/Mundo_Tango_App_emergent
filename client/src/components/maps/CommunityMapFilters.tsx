import { Calendar, Filter, MapPin, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface CommunityFilters {
  search: string;
  memberRange: [number, number];
  eventRange: [number, number];
}

interface CommunityMapFiltersProps {
  filters: CommunityFilters;
  onFiltersChange: (filters: CommunityFilters) => void;
  compact?: boolean;
  maxMembers?: number;
  maxEvents?: number;
}

export default function CommunityMapFilters({ 
  filters, 
  onFiltersChange, 
  compact = false,
  maxMembers = 1000,
  maxEvents = 100
}: CommunityMapFiltersProps) {
  const updateFilter = <K extends keyof CommunityFilters>(key: K, value: CommunityFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      memberRange: [0, maxMembers],
      eventRange: [0, maxEvents],
    });
  };

  const activeFiltersCount = [
    filters.search !== '',
    filters.memberRange[0] > 0 || filters.memberRange[1] < maxMembers,
    filters.eventRange[0] > 0 || filters.eventRange[1] < maxEvents,
  ].filter(Boolean).length;

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative" data-testid="button-community-filters">
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
            maxMembers={maxMembers}
            maxEvents={maxEvents}
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
          Community Filters
        </h3>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            data-testid="button-clear-community-filters"
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
        maxMembers={maxMembers}
        maxEvents={maxEvents}
      />
    </div>
  );
}

function FiltersContent({ 
  filters, 
  updateFilter, 
  clearFilters, 
  activeFiltersCount,
  maxMembers,
  maxEvents
}: {
  filters: CommunityFilters;
  updateFilter: <K extends keyof CommunityFilters>(key: K, value: CommunityFilters[K]) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  maxMembers: number;
  maxEvents: number;
}) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="community-search" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Search Cities
        </Label>
        <Input
          id="community-search"
          type="text"
          placeholder="Search by city name..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          data-testid="input-community-search"
        />
      </div>

      {/* Member Count Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Member Count
          </Label>
          <span className="text-sm text-muted-foreground" data-testid="text-member-range">
            {filters.memberRange[0]} - {filters.memberRange[1]}
          </span>
        </div>
        <Slider
          min={0}
          max={maxMembers}
          step={10}
          value={filters.memberRange}
          onValueChange={(value) => updateFilter('memberRange', value as [number, number])}
          className="w-full"
          data-testid="slider-member-range"
        />
      </div>

      {/* Event Count Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Event Count
          </Label>
          <span className="text-sm text-muted-foreground" data-testid="text-event-range">
            {filters.eventRange[0]} - {filters.eventRange[1]}
          </span>
        </div>
        <Slider
          min={0}
          max={maxEvents}
          step={5}
          value={filters.eventRange}
          onValueChange={(value) => updateFilter('eventRange', value as [number, number])}
          className="w-full"
          data-testid="slider-event-range"
        />
      </div>
    </div>
  );
}
