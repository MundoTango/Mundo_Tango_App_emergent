// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - UpcomingEventsSidebar Component
// Event awareness widget for contextual community engagement

import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTheme } from '@/lib/theme/theme-provider';
import { safeFormatDate, safeFormatTime } from '@/utils/dateHelpers';
import { useQuery } from '@tanstack/react-query';
import { useEventRSVP } from '@/hooks/useEventRSVP';
import { useLocation } from 'wouter';
import UnifiedEventCard from '@/components/events/UnifiedEventCard';


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
}

export default function UpcomingEventsSidebar({}: UpcomingEventsSidebarProps) {
  const { currentTheme } = useTheme();
  const [, setLocation] = useLocation();
  
  const [expandedSections, setExpandedSections] = useState({
    rsvpedEvents: true,
    yourCity: true,
    eventsYouFollow: true,
    citiesYouFollow: true
  });
  
  const rsvpMutation = useEventRSVP();
  
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['/api/events/feed'],
    queryFn: async () => {
      const response = await fetch('/api/events/feed?limit=20&visibility=public', {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 0,
    structuralSharing: false
  });

  // Debug: log when eventsData changes
  console.log('📊 [Sidebar] eventsData updated:', eventsData?.map((e: any) => ({ id: e.id, status: e.userRsvpStatus })));
  
  // Transform API data to component format with memoization
  const allEvents = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.map((event: any) => ({
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
    }));
  }, [eventsData]);

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
            {events.map((event) => (
              <UnifiedEventCard 
                key={event.id}
                event={event} 
                rsvpMutation={rsvpMutation} 
              />
            ))}
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
                No upcoming events
              </p>
              <p className="text-xs mt-1 text-[#3BA0AF]">
                Check your city page or join groups to see events
              </p>
            </>
          ) : (
            <p className="text-sm text-[#146778]">
              {allEvents.length} {allEvents.length === 1 ? 'event' : 'events'} coming up
            </p>
          )}
        </div>

        {/* Categorized Events - NEW ORDER */}
        {renderSection("Events You're Attending", rsvpedEvents, 'rsvpedEvents', "No RSVP'd events")}
        {renderSection("In Your City", yourCityEvents, 'yourCity', "No events in your city")}
        {renderSection("Events You Follow", eventsYouFollowEvents, 'eventsYouFollow', "No events from groups you follow")}
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
