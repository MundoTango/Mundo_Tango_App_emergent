// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - UpcomingEventsSidebar Component
// Event awareness widget for contextual community engagement

import { Calendar, MapPin, Users, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { safeFormatDate, safeFormatTime } from '@/utils/dateHelpers';
import { useQuery } from '@tanstack/react-query';

interface Event {
  id: string;
  title: string;
  type: 'milonga' | 'workshop' | 'festival' | 'practica';
  date: string;
  time: string;
  location: string;
  attendees: number;
  isAttending?: boolean;
  isFeatured?: boolean;
}

interface UpcomingEventsSidebarProps {
  onEventClick?: (eventId: string) => void;
}

export default function UpcomingEventsSidebar({ 
  onEventClick 
}: UpcomingEventsSidebarProps) {
  const { theme } = useTheme();
  
  // Fetch real events from database via API
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['/api/events/feed'],
    queryFn: async () => {
      const response = await fetch('/api/events/feed?limit=5&visibility=public');
      const result = await response.json();
      return result.data || [];
    }
  });
  
  // Transform API data to component format
  const displayEvents = eventsData?.map((event: any) => ({
    id: event.id.toString(),
    title: event.title,
    type: event.event_type || 'milonga',
    date: event.startDate || event.start_date || event.date,
    time: safeFormatTime(event.startDate || event.start_date || event.date, '20:00'),
    location: event.location || event.city || 'Location TBA',
    attendees: event.current_attendees || event.rsvpCounts?.attending || 0,
    isAttending: false,
    isFeatured: event.is_featured || false
  })) || [];

  const eventTypeColors = {
    milonga: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    workshop: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    festival: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
    practica: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
  };

  return (
    <div className="h-full space-y-6">
      {/* Events Section */}
      <div className="">
        {/* Header */}
        <div className="mb-6">
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
        ) : displayEvents.length === 0 ? (
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
            {displayEvents.length} upcoming events
          </p>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {displayEvents.map((event: Event) => {
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
                "p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm",
                theme === 'light' 
                  ? "bg-white hover:bg-gray-50"
                  : "bg-slate-900/50 hover:bg-slate-800/50",
                colors.border,
                "hover:scale-[1.02] hover:shadow-lg"
              )}>
                {/* Event Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-semibold transition-colors",
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
                  {event.isFeatured && (
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  )}
                </div>

                {/* Event Details */}
                <div className={cn(
                  "space-y-1 text-xs",
                  theme === 'light' ? "text-gray-500" : "text-slate-400"
                )}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {safeFormatDate(event.date, 'MMM dd', 'Date TBA')} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    <span>{event.attendees} attending</span>
                    {event.isAttending && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                        You're going
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* View All Link */}
      <div className={cn(
        "mt-6 pt-6 border-t",
        theme === 'light' ? "border-gray-200" : "border-slate-800/50"
      )}>
        <button className={cn(
          "w-full py-2.5 px-4 bg-gradient-to-r from-[#5EEAD4]/10 to-[#155E75]/10 hover:from-[#5EEAD4]/20 hover:to-[#155E75]/20 font-medium rounded-lg transition-all duration-200 hover:scale-105",
          theme === 'light' ? "text-cyan-600" : "text-cyan-400"
        )}>
          View All Events
        </button>
      </div>
      </div>
    </div>
  );
}