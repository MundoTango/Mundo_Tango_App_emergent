
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { EnhancedEventCard } from '../components/events/EnhancedEventCard';
import { EventCreationWizard } from '../components/events/EventCreationWizard';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, Filter, Calendar, Grid } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  tags: string[];
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  rsvpCounts: {
    attending: number;
    maybe: number;
    total: number;
  };
}

const Events: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();

  // Fetch events
  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: ['events', 'feed', searchQuery, selectedTags],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '20'
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

      const response = await fetch(`/api/events/feed?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  const events: Event[] = eventsResponse?.data || [];

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add CSRF token when main Agent fixes it
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error('Failed to RSVP');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleEventCreated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    const handleRsvpChange = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    socket.on('event:created', handleEventCreated);
    socket.on('event:rsvp_change', handleRsvpChange);

    return () => {
      socket.off('event:created', handleEventCreated);
      socket.off('event:rsvp_change', handleRsvpChange);
    };
  }, [socket, queryClient]);

  const handleCreateEvent = async (eventData: any) => {
    await createEventMutation.mutateAsync(eventData);
    setIsCreateModalOpen(false);
  };

  const handleRsvp = async (eventId: string, status: string) => {
    await rsvpMutation.mutateAsync({ eventId, status });
  };

  const handleViewDetails = (eventId: string) => {
    // TODO: Navigate to event details page
    console.log('View event details:', eventId);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Get all available tags from events
  const availableTags = Array.from(
    new Set(events.flatMap(event => event.tags))
  ).slice(0, 10); // Show top 10 tags

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Events
              </h1>
              <p className="text-gray-600 mt-1">
                Discover and join amazing events in your community
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-white/50 rounded-lg p-1 border border-white/30">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="h-8"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>

              {user && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 backdrop-blur-sm border-white/30"
            />
          </div>

          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 self-center">Filter by tags:</span>
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-teal-600 text-white'
                      : 'bg-white/50 text-gray-700 hover:bg-teal-100'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Events Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/50 backdrop-blur-sm rounded-lg h-96 animate-pulse" />
              ))
            ) : events.length > 0 ? (
              events.map(event => (
                <EnhancedEventCard
                  key={event.id}
                  event={event}
                  onRsvp={handleRsvp}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedTags.length > 0 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to create an event!'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-white/30">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Calendar View</h3>
              <p className="text-gray-500">Calendar integration coming soon!</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <EventCreationWizard
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};

export default Events;
