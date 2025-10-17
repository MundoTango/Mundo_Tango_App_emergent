import { useState, useMemo } from 'react';
import { EventFilters } from '@/components/maps/EventMapFilters';

/**
 * Shared hook for managing map filter state
 * Provides filter state and a filtering function for any map entity type
 * 
 * Usage:
 * const { filters, setFilters, applyFilters } = useMapFilters<Event>();
 * const filteredEvents = applyFilters(events, (event, filters) => {
 *   // Custom filtering logic
 *   if (filters.eventType !== 'all' && event.type !== filters.eventType) return false;
 *   return true;
 * });
 */

export interface BaseMapFilters {
  search?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  [key: string]: any;
}

export function useMapFilters<T>(initialFilters?: Partial<BaseMapFilters>) {
  const [filters, setFilters] = useState<BaseMapFilters>({
    search: '',
    dateRange: {
      start: null,
      end: null,
    },
    ...initialFilters,
  });

  /**
   * Apply custom filtering logic to an array of items
   * @param items - Array of items to filter
   * @param filterFn - Custom function that returns true if item should be included
   */
  const applyFilters = (
    items: T[],
    filterFn: (item: T, filters: BaseMapFilters) => boolean
  ): T[] => {
    return items.filter((item) => filterFn(item, filters));
  };

  /**
   * Reset all filters to their default values
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      dateRange: {
        start: null,
        end: null,
      },
    });
  };

  /**
   * Count active filters (excludes default values)
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search && filters.search.length > 0) count++;
    if (filters.dateRange?.start) count++;
    if (filters.dateRange?.end) count++;
    
    // Count other custom filters
    Object.keys(filters).forEach(key => {
      if (key !== 'search' && key !== 'dateRange') {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '' && value !== 'all') {
          count++;
        }
      }
    });
    
    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    applyFilters,
    clearFilters,
    activeFilterCount,
  };
}

/**
 * Preset filter hook for events with common event filtering logic
 */
export function useEventMapFilters() {
  const [filters, setFilters] = useState<EventFilters>({
    eventType: 'all',
    startDate: null,
    endDate: null,
    hasSpace: false,
  });

  const applyFilters = (events: any[]) => {
    return events.filter(event => {
      // Event type filter
      if (filters.eventType !== 'all' && event.eventType !== filters.eventType) {
        return false;
      }
      
      // Start date filter
      if (filters.startDate && new Date(event.startDate) < filters.startDate) {
        return false;
      }
      
      // End date filter
      if (filters.endDate && new Date(event.startDate) > filters.endDate) {
        return false;
      }
      
      // Has space filter
      if (filters.hasSpace) {
        const currentAttendees = event.currentAttendees || event.attendeeCount || 0;
        const maxAttendees = event.maxAttendees || Infinity;
        if (currentAttendees >= maxAttendees) {
          return false;
        }
      }
      
      return true;
    });
  };

  return {
    filters,
    setFilters,
    applyFilters,
  };
}

/**
 * Preset filter hook for housing with common housing filtering logic
 */
export function useHousingMapFilters() {
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: Infinity },
    minGuests: 1,
    amenities: [] as string[],
  });

  const applyFilters = (homes: any[]) => {
    return homes.filter(home => {
      // Price filter
      if (home.pricePerNight < filters.priceRange.min || 
          home.pricePerNight > filters.priceRange.max) {
        return false;
      }
      
      // Guest count filter
      if (home.maxGuests < filters.minGuests) {
        return false;
      }
      
      // Amenities filter
      if (filters.amenities.length > 0) {
        const homeAmenities = home.amenities || [];
        const hasAllAmenities = filters.amenities.every(amenity => 
          homeAmenities.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }
      
      return true;
    });
  };

  return {
    filters,
    setFilters,
    applyFilters,
  };
}
