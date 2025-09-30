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
    milonga: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    workshop: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    festival: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
    practica: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
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
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                event.userRsvpStatus === 'going'
                  ? "bg-emerald-500/20 text-emerald-600"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-500"
              )}
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
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                event.userRsvpStatus === 'maybe'
                  ? "bg-yellow-500/20 text-yellow-600"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500"
              )}
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
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                event.userRsvpStatus === 'not_going'
                  ? "bg-red-500/20 text-red-600"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-red-500/10 hover:text-red-500"
              )}
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
        <div className={cn(
          "p-3 rounded-xl border transition-all duration-300 backdrop-blur-sm",
          theme === 'light' 
            ? "bg-white hover:bg-gray-50"
            : "bg-slate-900/50 hover:bg-slate-800/50",
          colors.border,
          "hover:scale-[1.01] hover:shadow-lg"
        )}>
          {/* Event Header */}
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-sm transition-colors truncate",
                theme === 'light' 
                  ? "text-gray-900 group-hover:text-purple-600"
                  : "text-white group-hover:text-purple-400"
              )}>
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
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              )}
              {renderRSVPIcons(event)}
            </div>
          </div>

          {/* Event Details */}
          <div className={cn(
            "space-y-1 text-xs",
            theme === 'light' ? "text-gray-500" : "text-slate-400"
          )}>
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
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
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
          className={cn(
            "w-full flex items-center justify-between mb-2 px-2 py-1 rounded-lg transition-colors",
            theme === 'light' 
              ? "hover:bg-gray-100 text-gray-700"
              : "hover:bg-slate-800/50 text-slate-300"
          )}
        >
          <h3 className="text-sm font-semibold">{title}</h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{events.length}</span>
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
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className={cn(
              "text-lg font-semibold",
              theme === 'light' ? "text-gray-900" : "text-white"
            )}>Upcoming Events</h2>
          </div>
          {isLoading ? (
            <p className={cn(
              "text-sm",
              theme === 'light' ? "text-gray-600" : "text-slate-400"
            )}>
              Loading events...
            </p>
          ) : allEvents.length === 0 ? (
            <>
              <p className={cn(
                "text-sm",
                theme === 'light' ? "text-gray-600" : "text-slate-400"
              )}>
                No upcoming events found
              </p>
              <p className={cn(
                "text-xs mt-1",
                theme === 'light' ? "text-gray-500" : "text-slate-500"
              )}>
                Check your city or join our community
              </p>
            </>
          ) : (
            <p className={cn(
              "text-sm",
              theme === 'light' ? "text-gray-600" : "text-slate-400"
            )}>
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
        <div className={cn(
          "mt-6 pt-6 border-t",
          theme === 'light' ? "border-gray-200" : "border-slate-800/50"
        )}>
          <button 
            onClick={() => setLocation('/events')}
            className={cn(
              "w-full py-2.5 px-4 bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10 hover:from-[#5EEAD4]/20 hover:to-[#155E75]/20 font-medium rounded-lg transition-all duration-200 hover:scale-105",
              theme === 'light' ? "text-cyan-600" : "text-cyan-400"
            )}
            data-testid="button-view-all-events"
          >
            View All Events
          </button>
        </div>
      </div>
    </div>
  );
}
