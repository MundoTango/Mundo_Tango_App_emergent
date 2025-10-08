import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnifiedEventCard from '@/components/events/UnifiedEventCard';
import { useEventRSVP } from '@/hooks/useEventRSVP';

interface UserEventsListProps {
  userId: number;
  isOwnProfile: boolean;
}

export function UserEventsList({ userId, isOwnProfile }: UserEventsListProps) {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['/api/user/events', userId],
    enabled: !!userId,
  });

  const eventRsvpMutation = useEventRSVP();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glassmorphic-card">
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load events</h3>
          <p className="text-gray-600">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const upcomingEvents = events.filter((event: any) => new Date(event.startDate) >= new Date());
  const pastEvents = events.filter((event: any) => new Date(event.startDate) < new Date());

  return (
    <div className="space-y-6">
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          {upcomingEvents.map((event: any) => (
            <UnifiedEventCard
              key={event.id}
              event={{
                id: event.id.toString(),
                title: event.title,
                type: event.eventType || event.type || 'milonga',
                date: event.startDate,
                time: new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
                location: event.location || 'Location TBA',
                city: event.city,
                attendees: event.attendeesCount || 0,
                userRsvpStatus: event.userRsvpStatus || null,
                isFeatured: false
              }}
              rsvpMutation={eventRsvpMutation}
            />
          ))}
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Past Events</h3>
          {pastEvents.map((event: any) => (
            <Card key={event.id} className="glassmorphic-card opacity-75">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    {event.location && <span>{event.location}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {events.length === 0 && (
        <Card className="glassmorphic-card">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600">
              {isOwnProfile
                ? 'Start organizing or attending tango events to see them here.'
                : 'No events to display.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}