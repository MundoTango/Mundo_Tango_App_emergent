// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - UpcomingEventsSidebar Component
// Event awareness widget for contextual community engagement

import { Calendar, MapPin, Users, Clock, Sparkles, Check, HelpCircle, X, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { safeFormatDate, safeFormatTime } from '@/utils/dateHelpers';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// VERSION INDICATOR - Updated: Sept 30, 2025 7:00 PM
const COMPONENT_VERSION = 'v2025-09-30-19:00:00';

interface Event {
  id: string;
  title: string;
  type: 'milonga' | 'workshop' | 'festival' | 'practica';
  date: string;
  time: string;
  location: string;
  city?: string;
  attendees: number;
  userRsvpStatus?: 'going' | 'interested' | 'maybe' | 'not_going' | null;
  isFeatured?: boolean;
}

interface UpcomingEventsSidebarProps {
  onEventClick?: (eventId: string) => void;
}

export default function UpcomingEventsSidebar({ 
  onEventClick 
}: UpcomingEventsSidebarProps) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Expanded sections state - reordered: RSVP'ed, Your City, Events You Follow, Cities You Follow
  const [expandedSections, setExpandedSections] = useState({
    rsvpedEvents: true,
    yourCity: true,
    eventsYouFollow: true,
    citiesYouFollow: true
  });
  
  // Log component version on mount to verify correct version is loaded
  useEffect(() => {
    console.log(`🔧 UpcomingEventsSidebar loaded - ${COMPONENT_VERSION}`);
  }, []);
  
  // Fetch real events from database via API
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['/api/events/feed'],
    queryFn: async () => {
      const response = await fetch('/api/events/feed?limit=20&visibility=public', {
        credentials: 'include'
      });
      const result = await response.json();
      console.log('📅 Events feed API response:', result);
      return result.data || [];
    }
  });
  
  // RSVP mutation with optimistic updates and toggle support
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'interested' | 'maybe' | 'not_going' | null }) => {
      console.log('🚀 Mutation function called:', { eventId, status });
      const result = await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        body: { status }
      });
      console.log('✅ Mutation result:', result);
      return result;
    },
    onMutate: async ({ eventId, status }) => {
      console.log('⚡ onMutate called:', { eventId, status });
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/events/feed'] });
      
      // Snapshot previous value
      const previousEvents = queryClient.getQueryData(['/api/events/feed']);
      console.log('📸 Previous events:', previousEvents);
      
      // Optimistically update (FIXED: use `old` directly, not `old?.data`)
      queryClient.setQueryData(['/api/events/feed'], (old: any) => {
        console.log('🔄 Updating cache, old data:', old);
        if (!old) return old;
        
        const updated = old.map((event: any) => {
          if (event.id.toString() === eventId) {
            const oldStatus = event.userRsvpStatus;
            const oldAttendees = event.current_attendees || 0;
            
            // Calculate attendee count change
            let attendeeChange = 0;
            if (oldStatus === 'going' && status !== 'going') {
              attendeeChange = -1; // Decrement if changing from going to something else
            } else if (oldStatus !== 'going' && status === 'going') {
              attendeeChange = 1; // Increment if changing to going from something else
            }
            
            const updatedEvent = { 
              ...event, 
              userRsvpStatus: status, 
              current_attendees: Math.max(0, oldAttendees + attendeeChange)
            };
            console.log('✨ Updated event:', updatedEvent);
            return updatedEvent;
          }
          return event;
        });
        console.log('📦 All updated events:', updated);
        return updated;
      });
      
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['/api/events/feed'], context.previousEvents);
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data, { eventId, status }) => {
      if (status === null) {
        toast({
          title: "RSVP Removed",
          description: "Your RSVP has been removed.",
        });
      } else {
        const statusText = 
          status === 'going' ? 'attending' : 
          status === 'interested' ? 'interested' : 
          status === 'maybe' ? 'maybe attending' : 
          'not attending';
        toast({
          title: "RSVP Updated",
          description: `You're now marked as ${statusText}`,
        });
      }
      // Invalidate both the feed and the specific event detail page
      queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
    }
  });
  
  // Transform API data to component format
  const allEvents = eventsData?.map((event: any) => ({
    id: event.id.toString(),
    title: event.title,
    type: event.event_type || 'milonga',
    date: event.startDate || event.start_date || event.date,
    time: safeFormatTime(event.startDate || event.start_date || event.date, '20:00'),
    location: event.location || event.city || 'Location TBA',
    city: event.city,
    attendees: event.current_attendees || event.rsvpCounts?.going || 0,
    userRsvpStatus: event.userRsvpStatus || null,
    isFeatured: event.is_featured || false
  })) || [];

  // Categorize events (NEW ORDER: RSVP'ed → Your City → Events You Follow → Cities You Follow)
  const rsvpedEvents = allEvents.filter((e: Event) => 
    e.userRsvpStatus && ['going', 'interested', 'maybe'].includes(e.userRsvpStatus)
  );
  
  const yourCityEvents = allEvents.filter((e: Event) => 
    !rsvpedEvents.includes(e) && e.city && e.city === 'Barcelona' // TODO: Get user's actual city
  ).slice(0, 3);
  
  const eventsYouFollowEvents = allEvents.filter((e: Event) => 
    !rsvpedEvents.includes(e) && !yourCityEvents.includes(e)
    // TODO: Filter by events from groups/organizers user follows
  ).slice(0, 3);
  
  const citiesYouFollowEvents = allEvents.filter((e: Event) => 
    !rsvpedEvents.includes(e) && 
    !yourCityEvents.includes(e) && 
    !eventsYouFollowEvents.includes(e) &&
    e.city && ['Buenos Aires', 'Paris', 'Milan'].includes(e.city) // TODO: Get user's followed cities
  ).slice(0, 3);

  const eventTypeColors = {
    milonga: { bg: 'bg-[rgba(94,234,212,0.24)]', text: 'text-[#0E7490]', border: 'border-[rgba(94,234,212,0.55)]' },
    workshop: { bg: 'bg-[rgba(43,178,232,0.24)]', text: 'text-[#0369A1]', border: 'border-[rgba(43,178,232,0.55)]' },
    festival: { bg: 'bg-[rgba(236,72,153,0.24)]', text: 'text-[#BE185D]', border: 'border-[rgba(236,72,153,0.55)]' },
    practica: { bg: 'bg-[rgba(16,185,129,0.24)]', text: 'text-[#047857]', border: 'border-[rgba(16,185,129,0.55)]' }
  };

  const handleRSVP = (eventId: string, status: 'going' | 'interested' | 'maybe' | 'not_going', currentStatus?: string | null) => {
    // Toggle behavior: if clicking the same status, send null to remove RSVP
    const newStatus = currentStatus === status ? null : status;
    console.log('🎯 RSVP clicked:', { eventId, status, currentStatus, newStatus });
    rsvpMutation.mutate({ eventId, status: newStatus as any });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderRSVPIcons = (event: Event) => (
    <div className="flex items-center gap-1 relative z-50">
      {/* Going - Check Mark */}
      <button
        onClick={(e) => {
          console.log('🔥 BUTTON CLICKED - Going button');
          e.preventDefault();
          e.stopPropagation();
          handleRSVP(event.id, 'going', event.userRsvpStatus);
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as attending"
        aria-label="Mark as attending"
        style={{
          background: event.userRsvpStatus === 'going' 
            ? 'linear-gradient(135deg, #5EEAD4 0%, #2CB5E8 100%)'
            : 'rgba(255,255,255,0.78)',
          borderColor: 'rgba(94,234,212,0.55)',
          color: event.userRsvpStatus === 'going' ? '#FFFFFF' : '#3BA0AF',
          position: 'relative',
          zIndex: 100
        }}
        className="p-1.5 rounded-lg transition-all duration-200 border hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid={`rsvp-attending-${event.id}`}
      >
        <Check className="w-4 h-4 pointer-events-none" />
      </button>

      {/* Interested - Star */}
      <button
        onClick={(e) => {
          console.log('🔥 BUTTON CLICKED - Interested button');
          e.preventDefault();
          e.stopPropagation();
          handleRSVP(event.id, 'interested', event.userRsvpStatus);
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as interested"
        aria-label="Mark as interested"
        style={{
          background: event.userRsvpStatus === 'interested' 
            ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
            : 'rgba(255,255,255,0.78)',
          borderColor: 'rgba(94,234,212,0.55)',
          color: event.userRsvpStatus === 'interested' ? '#FFFFFF' : '#3BA0AF',
          position: 'relative',
          zIndex: 100
        }}
        className="p-1.5 rounded-lg transition-all duration-200 border hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid={`rsvp-interested-${event.id}`}
      >
        <Star className="w-4 h-4 pointer-events-none" />
      </button>

      {/* Maybe - Question Mark */}
      <button
        onClick={(e) => {
          console.log('🔥 BUTTON CLICKED - Maybe button');
          e.preventDefault();
          e.stopPropagation();
          handleRSVP(event.id, 'maybe', event.userRsvpStatus);
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as maybe"
        aria-label="Mark as maybe"
        style={{
          background: event.userRsvpStatus === 'maybe' 
            ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
            : 'rgba(255,255,255,0.78)',
          borderColor: 'rgba(94,234,212,0.55)',
          color: event.userRsvpStatus === 'maybe' ? '#FFFFFF' : '#3BA0AF',
          position: 'relative',
          zIndex: 100
        }}
        className="p-1.5 rounded-lg transition-all duration-200 border hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid={`rsvp-maybe-${event.id}`}
      >
        <HelpCircle className="w-4 h-4 pointer-events-none" />
      </button>

      {/* Not Going - X */}
      <button
        onClick={(e) => {
          console.log('🔥 BUTTON CLICKED - Not going button');
          e.preventDefault();
          e.stopPropagation();
          handleRSVP(event.id, 'not_going');
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as not going"
        aria-label="Mark as not going"
        style={{
          background: event.userRsvpStatus === 'not_going' 
            ? 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)'
            : 'rgba(255,255,255,0.78)',
          borderColor: 'rgba(94,234,212,0.55)',
          color: event.userRsvpStatus === 'not_going' ? '#FFFFFF' : '#3BA0AF',
          position: 'relative',
          zIndex: 100
        }}
        className="p-1.5 rounded-lg transition-all duration-200 border hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid={`rsvp-not-going-${event.id}`}
      >
        <X className="w-4 h-4 pointer-events-none" />
      </button>
    </div>
  );

  const renderEventCard = (event: Event) => {
    const colors = eventTypeColors[event.type as keyof typeof eventTypeColors] || eventTypeColors.milonga;
    
    return (
      <div 
        key={event.id}
        className="w-full group"
        data-testid={`event-card-${event.id}`}
      >
        <div 
          style={{
            background: 'rgba(255,255,255,0.78)',
            borderColor: 'rgba(94,234,212,0.55)'
          }}
          className={cn(
            "p-3 rounded-xl border transition-all duration-300 backdrop-blur-sm",
            "hover:scale-[1.01] hover:shadow-lg"
          )}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(222,252,255,0.82)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.78)'}
        >
          {/* Event Header with RSVP outside navigation */}
          <div className="flex items-start justify-between mb-2 gap-2">
            <a
              href={`/events/${event.id}`}
              onClick={(e) => {
                e.preventDefault();
                setLocation(`/events/${event.id}`);
                onEventClick?.(event.id);
              }}
              className="flex-1 min-w-0 cursor-pointer text-left"
            >
              <h3 className="font-semibold text-sm transition-colors truncate text-[#0B3C49] group-hover:text-[#5EEAD4]">
                {event.title}
              </h3>
              <span className={cn(
                "inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                colors.bg, colors.text
              )}>
                {event.type}
              </span>
            </a>
            <div className="flex items-start gap-1 flex-shrink-0 relative z-50">
              {event.isFeatured && (
                <Sparkles className="w-4 h-4 text-[#5EEAD4] animate-pulse" />
              )}
              {renderRSVPIcons(event)}
            </div>
          </div>

          {/* Event Details - Clickable for navigation */}
          <a
            href={`/events/${event.id}`}
            onClick={(e) => {
              e.preventDefault();
              setLocation(`/events/${event.id}`);
              onEventClick?.(event.id);
            }}
            className="block cursor-pointer"
          >
            <div className="space-y-1 text-xs text-[#3BA0AF]">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {safeFormatDate(event.date, 'MMM dd', 'Date TBA')} at {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span>{event.attendees} attending</span>
                {event.userRsvpStatus === 'going' && (
                  <span 
                    style={{ background: 'rgba(94,234,212,0.24)', color: '#0E7490' }}
                    className="px-1.5 py-0.5 rounded text-xs"
                  >
                    You're going
                  </span>
                )}
                {event.userRsvpStatus === 'interested' && (
                  <span 
                    style={{ background: 'rgba(252,211,77,0.24)', color: '#D97706' }}
                    className="px-1.5 py-0.5 rounded text-xs"
                  >
                    Interested
                  </span>
                )}
                {event.userRsvpStatus === 'maybe' && (
                  <span 
                    style={{ background: 'rgba(167,139,250,0.24)', color: '#7C3AED' }}
                    className="px-1.5 py-0.5 rounded text-xs"
                  >
                    Maybe
                  </span>
                )}
              </div>
            </div>
          </a>
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    events: Event[],
    sectionKey: keyof typeof expandedSections,
    emptyMessage: string
  ) => {
    if (events.length === 0) return null;
    
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          style={{ background: 'rgba(209,250,250,0.65)' }}
          className="w-full flex items-center justify-between mb-2 px-2 py-1 rounded-lg transition-colors hover:bg-[rgba(94,234,212,0.28)] text-[#0B3C49]"
          aria-label={`Toggle ${title} section`}
        >
          <h3 className="text-sm font-semibold">{title}</h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#3BA0AF]">{events.length}</span>
            {expandedSections[sectionKey] ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>
        
        {expandedSections[sectionKey] && (
          <div className="space-y-2">
            {events.map(renderEventCard)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full space-y-4">
      {/* Events Section */}
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#5EEAD4]" />
            <h2 className="text-lg font-semibold text-[#0B3C49]">Upcoming Events</h2>
            <span className="ml-auto px-2 py-0.5 text-xs font-mono bg-purple-100 text-purple-700 rounded border border-purple-300">
              {COMPONENT_VERSION}
            </span>
          </div>
          {isLoading ? (
            <p className="text-sm text-[#146778]">
              Loading events...
            </p>
          ) : allEvents.length === 0 ? (
            <>
              <p className="text-sm text-[#146778]">
                No upcoming events found
              </p>
              <p className="text-xs mt-1 text-[#3BA0AF]">
                Check your city or join our community
              </p>
            </>
          ) : (
            <p className="text-sm text-[#146778]">
              {allEvents.length} upcoming events
            </p>
          )}
        </div>

        {/* Categorized Events - NEW ORDER */}
        {renderSection("RSVP'ed Events", rsvpedEvents, 'rsvpedEvents', "No events you've RSVP'd to")}
        {renderSection("In Your City", yourCityEvents, 'yourCity', "No events in your city")}
        {renderSection("Events You Follow", eventsYouFollowEvents, 'eventsYouFollow', "No events from organizers you follow")}
        {renderSection("Cities You Follow", citiesYouFollowEvents, 'citiesYouFollow', "No events in cities you follow")}

        {/* View All Link */}
        <div className="mt-6 pt-6 border-t border-[rgba(94,234,212,0.35)]">
          <button 
            onClick={() => setLocation('/events')}
            style={{
              background: 'linear-gradient(135deg, #5EEAD4 0%, #2CB5E8 100%)'
            }}
            className="w-full py-2.5 px-4 hover:opacity-90 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #4FDAD4 0%, #1F9BD6 100%)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #5EEAD4 0%, #2CB5E8 100%)'}
            aria-label="View all upcoming events"
            data-testid="button-view-all-events"
          >
            View All Events
          </button>
        </div>
      </div>
    </div>
  );
}
