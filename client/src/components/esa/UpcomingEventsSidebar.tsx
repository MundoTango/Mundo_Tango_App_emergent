// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - UpcomingEventsSidebar Component
// Event awareness widget for contextual community engagement

import { Calendar, MapPin, Users, Clock, Sparkles, Check, HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { safeFormatDate, safeFormatTime } from '@/utils/dateHelpers';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Event {
  id: string;
  title: string;
  type: 'milonga' | 'workshop' | 'festival' | 'practica';
  date: string;
  time: string;
  location: string;
  city?: string;
  attendees: number;
  userRsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
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
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    yourEvents: true,
    citiesYouFollow: true,
    yourCity: true,
    otherEvents: true
  });
  
  // Fetch real events from database via API
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['/api/events/feed'],
    queryFn: async () => {
      const response = await fetch('/api/events/feed?limit=20&visibility=public');
      const result = await response.json();
      return result.data || [];
    }
  });
  
  // RSVP mutation with optimistic updates
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }) => {
      return await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onMutate: async ({ eventId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/events/feed'] });
      
      // Snapshot previous value
      const previousEvents = queryClient.getQueryData(['/api/events/feed']);
      
      // Optimistically update
      queryClient.setQueryData(['/api/events/feed'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((event: any) => 
            event.id.toString() === eventId 
              ? { ...event, userRsvpStatus: status, current_attendees: (event.current_attendees || 0) + (status === 'going' ? 1 : 0) }
              : event
          )
        };
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
    onSuccess: (data, { status }) => {
      const statusText = status === 'going' ? 'attending' : status === 'maybe' ? 'interested' : 'not attending';
      toast({
        title: "RSVP Updated",
        description: `You're now marked as ${statusText}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
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
    attendees: event.current_attendees || event.rsvpCounts?.attending || 0,
    userRsvpStatus: event.userRsvpStatus || null,
    isFeatured: event.is_featured || false
  })) || [];

  // Categorize events
  const yourEvents = allEvents.filter((e: Event) => e.userRsvpStatus === 'going');
  const citiesYouFollowEvents = allEvents.filter((e: Event) => 
    e.userRsvpStatus !== 'going' && e.city && ['Buenos Aires', 'Paris', 'Milan'].includes(e.city)
  ).slice(0, 3);
  const yourCityEvents = allEvents.filter((e: Event) => 
    e.userRsvpStatus !== 'going' && e.city && !['Buenos Aires', 'Paris', 'Milan'].includes(e.city)
  ).slice(0, 3);
  const otherEvents = allEvents.filter((e: Event) => 
    e.userRsvpStatus !== 'going' && 
    !citiesYouFollowEvents.includes(e) && 
    !yourCityEvents.includes(e)
  ).slice(0, 3);

  const eventTypeColors = {
    milonga: { bg: 'bg-[rgba(94,234,212,0.24)]', text: 'text-[#0E7490]', border: 'border-[rgba(94,234,212,0.55)]' },
    workshop: { bg: 'bg-[rgba(43,178,232,0.24)]', text: 'text-[#0369A1]', border: 'border-[rgba(43,178,232,0.55)]' },
    festival: { bg: 'bg-[rgba(236,72,153,0.24)]', text: 'text-[#BE185D]', border: 'border-[rgba(236,72,153,0.55)]' },
    practica: { bg: 'bg-[rgba(16,185,129,0.24)]', text: 'text-[#047857]', border: 'border-[rgba(16,185,129,0.55)]' }
  };

  const handleRSVP = (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    rsvpMutation.mutate({ eventId, status });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderRSVPIcons = (event: Event) => (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRSVP(event.id, 'going');
              }}
              style={{
                background: event.userRsvpStatus === 'going' 
                  ? 'linear-gradient(135deg, #5EEAD4 0%, #2CB5E8 100%)'
                  : 'rgba(255,255,255,0.78)',
                borderColor: 'rgba(94,234,212,0.55)',
                color: event.userRsvpStatus === 'going' ? '#FFFFFF' : '#3BA0AF'
              }}
              className="p-1.5 rounded-lg transition-all duration-200 border hover:scale-110"
              data-testid={`rsvp-attending-${event.id}`}
            >
              <Check className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark as attending</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRSVP(event.id, 'maybe');
              }}
              style={{
                background: event.userRsvpStatus === 'maybe' 
                  ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)'
                  : 'rgba(255,255,255,0.78)',
                borderColor: 'rgba(94,234,212,0.55)',
                color: event.userRsvpStatus === 'maybe' ? '#FFFFFF' : '#3BA0AF'
              }}
              className="p-1.5 rounded-lg transition-all duration-200 border hover:scale-110"
              data-testid={`rsvp-maybe-${event.id}`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark as maybe</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRSVP(event.id, 'not_going');
              }}
              style={{
                background: event.userRsvpStatus === 'not_going' 
                  ? 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)'
                  : 'rgba(255,255,255,0.78)',
                borderColor: 'rgba(94,234,212,0.55)',
                color: event.userRsvpStatus === 'not_going' ? '#FFFFFF' : '#3BA0AF'
              }}
              className="p-1.5 rounded-lg transition-all duration-200 border hover:scale-110"
              data-testid={`rsvp-not-going-${event.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark as not going</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );

  const renderEventCard = (event: Event) => {
    const colors = eventTypeColors[event.type as keyof typeof eventTypeColors] || eventTypeColors.milonga;
    
    return (
      <a
        key={event.id}
        href={`/events/${event.id}`}
        onClick={(e) => {
          e.preventDefault();
          setLocation(`/events/${event.id}`);
          onEventClick?.(event.id);
        }}
        className="w-full text-left group block cursor-pointer"
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
          {/* Event Header */}
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm transition-colors truncate text-[#0B3C49] group-hover:text-[#5EEAD4]">
                {event.title}
              </h3>
              <span className={cn(
                "inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                colors.bg, colors.text
              )}>
                {event.type}
              </span>
            </div>
            <div className="flex items-start gap-1 flex-shrink-0">
              {event.isFeatured && (
                <Sparkles className="w-4 h-4 text-[#5EEAD4] animate-pulse" />
              )}
              {renderRSVPIcons(event)}
            </div>
          </div>

          {/* Event Details */}
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
            </div>
          </div>
        </div>
      </a>
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

        {/* Categorized Events */}
        {renderSection("Your Events", yourEvents, 'yourEvents', "No upcoming events you're attending")}
        {renderSection("Cities You Follow", citiesYouFollowEvents, 'citiesYouFollow', "No events in cities you follow")}
        {renderSection("In Your City", yourCityEvents, 'yourCity', "No events in your city")}
        {renderSection("Other Events", otherEvents, 'otherEvents', "No other events found")}

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
            data-testid="button-view-all-events"
          >
            View All Events
          </button>
        </div>
      </div>
    </div>
  );
}
