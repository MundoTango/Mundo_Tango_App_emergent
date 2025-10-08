import { Calendar, Filter, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

export interface EventFilters {
  eventType: string;
  startDate: Date | null;
  endDate: Date | null;
  hasSpace: boolean;
}

interface EventMapFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
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

export default function EventMapFilters({ 
  filters, 
  onFiltersChange, 
  compact = false 
}: EventMapFiltersProps) {
  const updateFilter = (key: keyof EventFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      eventType: 'all',
      startDate: null,
      endDate: null,
      hasSpace: false,
    });
  };

  const activeFiltersCount = [
    filters.eventType !== 'all',
    filters.startDate !== null,
    filters.endDate !== null,
    filters.hasSpace,
  ].filter(Boolean).length;

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative" data-testid="button-map-filters">
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
    <div className="bg-[var(--color-surface)] dark:bg-gray-800 rounded-lg border border-[var(--color-border)] dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Event Filters
        </h3>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            data-testid="button-clear-filters"
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
  filters: EventFilters;
  updateFilter: (key: keyof EventFilters, value: any) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
}) {
  return (
    <div className="space-y-4">
      {/* Event Type */}
      <div className="space-y-2">
        <Label htmlFor="event-type">Event Type</Label>
        <Select 
          value={filters.eventType} 
          onValueChange={(value) => updateFilter('eventType', value)}
        >
          <SelectTrigger id="event-type" data-testid="select-event-type">
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

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-left font-normal"
                data-testid="button-start-date"
              >
                <Calendar className="h-4 w-4 mr-2" />
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
                className="justify-start text-left font-normal"
                data-testid="button-end-date"
              >
                <Calendar className="h-4 w-4 mr-2" />
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

      {/* Has Space Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="has-space" className="flex items-center gap-2 cursor-pointer">
          <Users className="h-4 w-4" />
          Only show events with space
        </Label>
        <Switch
          id="has-space"
          checked={filters.hasSpace}
          onCheckedChange={(checked) => updateFilter('hasSpace', checked)}
          data-testid="switch-has-space"
        />
      </div>
    </div>
  );
}
