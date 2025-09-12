
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
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
  };
  userRsvpStatus?: 'attending' | 'maybe' | 'not_attending' | null;
  onRsvp: (eventId: string, status: 'attending' | 'maybe' | 'not_attending') => void;
  onViewDetails: (eventId: string) => void;
}

export const EnhancedEventCard: React.FC<EventCardProps> = ({
  event,
  userRsvpStatus,
  onRsvp,
  onViewDetails
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'p');
  };

  const getRsvpButtonText = () => {
    switch (userRsvpStatus) {
      case 'attending': return 'Going';
      case 'maybe': return 'Maybe';
      case 'not_attending': return 'Not Going';
      default: return 'RSVP';
    }
  };

  const getRsvpButtonVariant = () => {
    switch (userRsvpStatus) {
      case 'attending': return 'default';
      case 'maybe': return 'secondary';
      case 'not_attending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-300/5 to-blue-600/10 opacity-50" />
      
      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
              {event.title}
            </CardTitle>
            
            {/* Date and Time */}
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {formatDate(event.startDate)} at {formatTime(event.startDate)}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{event.location}</span>
            </div>
          </div>

          {/* Organizer Avatar */}
          <Avatar className="ring-2 ring-white/20">
            <AvatarImage src={event.organizer.avatarUrl} />
            <AvatarFallback className="bg-teal-100 text-teal-700">
              {event.organizer.firstName[0]}{event.organizer.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Description */}
        {event.description && (
          <p className="text-gray-700 text-sm line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-teal-100/50 text-teal-700 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* RSVP Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{event.rsvpCounts.attending} going</span>
          </div>
          {event.rsvpCounts.maybe > 0 && (
            <span>{event.rsvpCounts.maybe} maybe</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onViewDetails(event.id)}
            variant="outline"
            className="flex-1 bg-white/50 hover:bg-white/70 border-teal-200 text-teal-700 hover:text-teal-800"
          >
            View Details
          </Button>
          
          <div className="relative">
            <Button
              onClick={() => {
                const nextStatus = userRsvpStatus === 'attending' 
                  ? 'not_attending' 
                  : 'attending';
                onRsvp(event.id, nextStatus);
              }}
              variant={getRsvpButtonVariant() as any}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {getRsvpButtonText()}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
