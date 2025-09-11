import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  Plus,
  Clock,
  Star,
  Filter,
  Grid,
  List,
  Map as MapIcon,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/contexts/socket-context';
import EventCard from '@/components/events/EventCard';
import EventWaitlistManager from '@/components/events/EventWaitlistManager';
import EventCheckInManager from '@/components/events/EventCheckInManager';
import CreateEventDialog from '@/components/events/CreateEventDialog';
import EventsCalendar from '@/components/events/EventsCalendar';
import EventMap from '@/components/EventMap';
import { apiRequest } from '@/lib/queryClient';
import type { ApiResponse } from '../../../shared/apiTypes';

interface Event {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  maxAttendees?: number;
  currentAttendees?: number;
  eventType?: string;
  level?: string;
  price?: string;
  currency?: string;
  isPublic: boolean;
  userId: number;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  userStatus?: 'going' | 'interested' | 'maybe' | null;
  waitlistCount?: number;
  checkInCount?: number;
  isEventFull?: boolean;
  userWaitlistStatus?: {
    isOnWaitlist: boolean;
    position?: number;
  };
  userCheckedIn?: boolean;
  isEventActive?: boolean;
  createdAt: string;
}

export default function EventsComprehensivePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { socket, isConnected, joinEventRoom, joinCityRoom } = useSocket();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar' | 'map'>('grid');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    eventType: 'all',
    level: 'all',
    priceRange: 'all',
    city: '',
    hasWaitlist: false,
    allowCheckIn: false
  });

  // Fetch events with comprehensive data
  const { data: eventsData, isLoading, refetch } = useQuery<ApiResponse<Event[]>>({
    queryKey: ['/api/events/upcoming', {
      search: searchQuery,
      tab: activeTab,
      ...filters
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('q', searchQuery);
      if (activeTab !== 'upcoming') params.append('timeframe', activeTab);
      if (filters.eventType !== 'all') params.append('eventType', filters.eventType);
      if (filters.level !== 'all') params.append('level', filters.level);
      if (filters.priceRange !== 'all') params.append('priceRange', filters.priceRange);
      if (filters.city) params.append('city', filters.city);
      if (filters.hasWaitlist) params.append('hasWaitlist', 'true');
      if (filters.allowCheckIn) params.append('allowCheckIn', 'true');

      return apiRequest(`/api/events/upcoming?${params}`);
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: isConnected ? 60000 : false // Refetch every minute if connected
  });

  const events = eventsData?.data || [];

  // RSVP Mutation with real-time updates
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      return apiRequest(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    },
    onSuccess: (data, { eventId, status }) => {
      toast({
        title: data.data?.addedToWaitlist ? 'Added to Waitlist' : 'RSVP Updated',
        description: data.data?.addedToWaitlist 
          ? `You're #${data.data.position} on the waitlist`
          : `You're ${status} to this event`
      });
      
      // Emit socket event for real-time updates
      if (socket && user) {
        socket.emit('event:rsvp', {
          eventId,
          userId: user.id,
          username: user.name || user.username,
          status,
          profileImage: user.profileImage
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
    },
    onError: (error: any) => {
      toast({
        title: "RSVP Failed",
        description: error.message || 'Failed to update RSVP',
        variant: "destructive"
      });
    }
  });

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleEventRSVPUpdated = (event: CustomEvent) => {
      const data = event.detail;
      
      // Show toast for other users' RSVPs
      if (data.userId !== user?.id) {
        toast({
          title: "Event Updated",
          description: `${data.username} is ${data.status} to the event`,
        });
      }
      
      // Refresh events data
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
    };

    const handleNewEventInCity = (event: CustomEvent) => {
      const data = event.detail;
      toast({
        title: "New Event in Your Area",
        description: `${data.title} by ${data.username}`,
        action: (
          <Button 
            size="sm" 
            onClick={() => setLocation(`/events/${data.eventId}`)}
          >
            View
          </Button>
        )
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
    };

    const handleEventWaitlistUpdated = (event: CustomEvent) => {
      const data = event.detail;
      
      if (data.action === 'joined') {
        toast({
          title: "Waitlist Updated",
          description: `${data.username} joined the waitlist`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
    };

    const handleEventCheckInUpdated = (event: CustomEvent) => {
      const data = event.detail;
      
      toast({
        title: "Event Check-In",
        description: `${data.username} checked in${data.role ? ` as ${data.role}` : ''}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
    };

    // Add event listeners
    window.addEventListener('eventRSVPUpdated', handleEventRSVPUpdated);
    window.addEventListener('newEventInCity', handleNewEventInCity);
    window.addEventListener('eventWaitlistUpdated', handleEventWaitlistUpdated);
    window.addEventListener('eventCheckInUpdated', handleEventCheckInUpdated);

    return () => {
      window.removeEventListener('eventRSVPUpdated', handleEventRSVPUpdated);
      window.removeEventListener('newEventInCity', handleNewEventInCity);
      window.removeEventListener('eventWaitlistUpdated', handleEventWaitlistUpdated);
      window.removeEventListener('eventCheckInUpdated', handleEventCheckInUpdated);
    };
  }, [socket, isConnected, user?.id, toast, queryClient, setLocation]);

  // Auto-join relevant rooms
  useEffect(() => {
    if (socket && isConnected && user) {
      // Join city room if user has a city
      if (user.city) {
        joinCityRoom(user.city);
      }
      
      // Join event rooms for events user is attending
      events.forEach(event => {
        if (event.userStatus === 'going' || event.userCheckedIn) {
          joinEventRoom(event.id);
        }
      });
    }
  }, [socket, isConnected, user, events, joinCityRoom, joinEventRoom]);

  const handleRSVP = (eventId: number, status: string) => {
    rsvpMutation.mutate({ eventId, status });
  };

  const handleEventClick = (event: Event) => {
    setLocation(`/events/${event.id}`);
  };

  const handleShareEvent = (event: Event) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: eventUrl
      });
    } else {
      navigator.clipboard.writeText(eventUrl);
      toast({
        title: "Link Copied",
        description: "Event link copied to clipboard"
      });
    }
  };

  // Calculate statistics
  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.startDate) > new Date()).length,
    attending: events.filter(e => e.userStatus === 'going').length,
    thisWeek: events.filter(e => {
      const eventDate = new Date(e.startDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return eventDate <= weekFromNow && eventDate > new Date();
    }).length
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              Tango Events
            </h1>
            <p className="text-gray-600 mt-1">
              Discover milongas, workshops, and festivals worldwide
              {isConnected && (
                <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Live
                </Badge>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-turquoise-500 text-white' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-turquoise-500 text-white' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-turquoise-500 text-white' : ''}
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-turquoise-500 text-white' : ''}
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Create Event Button */}
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glassmorphic-card bg-gradient-to-r from-turquoise-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-turquoise-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-cyan-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.attending}</p>
                  <p className="text-sm text-gray-600">Attending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card bg-gradient-to-r from-purple-50 to-turquoise-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.thisWeek}</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="glassmorphic-card bg-gradient-to-r from-white/90 via-turquoise-50/30 to-cyan-50/30 border-turquoise-200/50">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-turquoise-500 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search events by name, location, or organizer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-turquoise-200 focus:border-turquoise-400"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="border-turquoise-200 hover:bg-turquoise-50"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 border border-turquoise-200/50">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="thisWeek">This Week</TabsTrigger>
            <TabsTrigger value="myEvents">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Events Display */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <div key={event.id} className="space-y-4">
                    <EventCard
                      event={event}
                      onRSVP={() => handleRSVP(event.id, 'going')}
                      onShare={() => handleShareEvent(event)}
                    />
                    
                    {/* Waitlist Manager */}
                    {(event.isEventFull || event.waitlistCount > 0) && (
                      <EventWaitlistManager
                        eventId={event.id}
                        isEventOwner={event.userId === user?.id}
                        isEventFull={event.isEventFull}
                        maxAttendees={event.maxAttendees}
                        currentAttendees={event.currentAttendees}
                        userWaitlistStatus={event.userWaitlistStatus}
                      />
                    )}
                    
                    {/* Check-In Manager */}
                    {event.isEventActive && (
                      <EventCheckInManager
                        eventId={event.id}
                        isEventOwner={event.userId === user?.id}
                        isEventActive={event.isEventActive}
                        userCheckedIn={event.userCheckedIn}
                        eventStarted={new Date(event.startDate) <= new Date()}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4">
                {events.map(event => (
                  <Card key={event.id} className="glassmorphic-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {event.imageUrl && (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.startDate).toLocaleDateString()}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.currentAttendees || 0} attending
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleEventClick(event)}
                          className="bg-turquoise-500 hover:bg-turquoise-600"
                        >
                          View Event
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'calendar' && (
              <Card className="glassmorphic-card">
                <CardContent className="p-6">
                  <EventsCalendar
                    events={events}
                    onEventClick={handleEventClick}
                    onDateClick={(date) => {
                      setShowCreateDialog(true);
                      // Could pre-fill date in create dialog
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {viewMode === 'map' && (
              <Card className="h-[600px] glassmorphic-card">
                <CardContent className="p-0 h-full">
                  <EventMap
                    events={events.filter(event => event.location)}
                    onEventClick={handleEventClick}
                  />
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {events.length === 0 && (
              <Card className="glassmorphic-card">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No events found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search terms or create a new event
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-turquoise-500 to-cyan-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Event Dialog */}
        {showCreateDialog && (
          <CreateEventDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onEventCreated={(event) => {
              toast({
                title: "Event Created",
                description: "Your event has been created successfully"
              });
              
              // Emit socket event
              if (socket && user) {
                socket.emit('event:created', {
                  eventId: event.id,
                  title: event.title,
                  userId: user.id,
                  username: user.name || user.username,
                  startDate: event.startDate,
                  location: event.location,
                  eventType: event.eventType,
                  isPublic: event.isPublic
                });
              }
              
              queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
              setLocation(`/events/${event.id}`);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}