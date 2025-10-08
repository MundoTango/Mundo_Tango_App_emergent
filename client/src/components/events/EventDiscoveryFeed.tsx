
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';
import UnifiedEventCard from './UnifiedEventCard';
import { useEventRSVP } from '@/hooks/useEventRSVP';
import { createApiRequest } from '@/lib/apiClient';
import { useCsrfToken } from '@/contexts/CsrfContext';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/use-toast';

interface EventFilters {
  search: string;
  location: string;
  tags: string[];
  startDate: string;
  endDate: string;
  visibility: string;
}

interface EventData {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  city?: string;
  eventType?: 'milonga' | 'workshop' | 'festival' | 'practica';
  organizerId: number;
  maxAttendees?: number;
  imageUrl?: string;
  tags?: string[];
  visibility: string;
  organizer?: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  rsvpCounts?: {
    attending: number;
    maybe: number;
    total: number;
  };
}

export const EventDiscoveryFeed: React.FC = () => {
  const [, setLocation] = useLocation();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [userRsvps, setUserRsvps] = useState<Record<number, string>>({});

  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    location: '',
    tags: [],
    startDate: '',
    endDate: '',
    visibility: 'public'
  });

  const { csrfToken } = useCsrfToken();
  const api = createApiRequest(csrfToken);
  const debouncedSearch = useDebounce(filters.search, 300);
  const eventRsvpMutation = useEventRSVP();

  useEffect(() => {
    fetchEvents(true);
  }, [debouncedSearch, filters.location, filters.tags, filters.startDate, filters.endDate, filters.visibility]);

  const fetchEvents = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: reset ? '1' : page.toString(),
        limit: '12',
        visibility: filters.visibility
      });

      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.location) params.set('location', filters.location);
      if (filters.tags.length) params.set('tags', filters.tags.join(','));
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await api.get(`/api/events/feed?${params.toString()}`);

      if (response.success && response.data) {
        const newEvents = response.data.map((event: any) => ({
          ...event,
          startDate: event.startDate,
          endDate: event.endDate
        }));

        if (reset) {
          setEvents(newEvents);
        } else {
          setEvents((prev) => [...prev, ...newEvents]);
        }

        setHasMore(newEvents.length === 12);
        if (!reset) {
          setPage((prev) => prev + 1);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };


  const updateFilter = (key: keyof EventFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter((t) => t !== tag));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      tags: [],
      startDate: '',
      endDate: '',
      visibility: 'public'
    });
  };

  const popularTags = ['milonga', 'practica', 'class', 'workshop', 'social', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            Discover Events
          </h1>
          <p className="text-gray-600 mt-1">Find amazing tango events near you</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white/50 border-white/30" data-testid="button-bg-white-50">

          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 bg-white/50 border-white/30" data-testid="input-pl-10" />

          </div>

          {/* Expandable Filters */}
          {showFilters &&
          <div className="space-y-4 border-t border-gray-200/50 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Location
                  </label>
                  <Input
                  placeholder="City or venue..."
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="bg-white/50 border-white/30" data-testid="input-bg-white-50" />

                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Start Date
                  </label>
                  <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                  className="bg-white/50 border-white/30" data-testid="input-date" />

                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    End Date
                  </label>
                  <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                  className="bg-white/50 border-white/30" data-testid="input-date" />

                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Event Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) =>
                <Button
                  key={tag}
                  variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                  className={filters.tags.includes(tag) ?
                  'bg-gradient-to-r from-turquoise-500 to-cyan-600' :
                  'bg-white/50 border-white/30'
                  } data-testid="button-element">

                      {tag}
                    </Button>
                )}
                </div>
              </div>

              {/* Active Filters */}
              {(filters.tags.length > 0 || filters.location || filters.startDate || filters.endDate) &&
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                  <span className="text-sm font-medium text-gray-600">Active filters:</span>
                  {filters.tags.map((tag) =>
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
              )}
                  {filters.location &&
              <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('location', '')}>
                      📍 {filters.location} ×
                    </Badge>
              }
                  <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-element">
                    Clear all
                  </Button>
                </div>
            }
            </div>
          }
        </CardContent>
      </Card>

      {/* Events Grid */}
      {loading ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) =>
        <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
        )}
        </div> :
      events.length === 0 ?
      <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Events Found</h3>
            <p className="text-gray-500 text-center mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters} variant="outline" data-testid="button-element">
              Clear Filters
            </Button>
          </CardContent>
        </Card> :

      <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) =>
          <UnifiedEventCard
            key={event.id}
            event={{
              id: event.id.toString(),
              title: event.title,
              type: event.eventType || 'milonga',
              date: event.startDate,
              time: new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
              location: event.location || 'Location TBA',
              city: event.city,
              attendees: event.rsvpCounts?.attending || 0,
              userRsvpStatus: userRsvps[event.id] || null,
              isFeatured: false
            }}
            rsvpMutation={eventRsvpMutation} />

          )}
          </div>

          {/* Load More */}
          {hasMore &&
        <div className="flex justify-center">
              <Button
            onClick={() => fetchEvents(false)}
            disabled={loadingMore}
            variant="outline"
            className="bg-white/50 border-white/30" data-testid="button-bg-white-50">

                {loadingMore ? 'Loading...' : 'Load More Events'}
              </Button>
            </div>
        }
        </>
      }
    </div>);

};

export default EventDiscoveryFeed;