
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedEventCardProps {
  event: {
    id: number;
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location: string;
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
  };
  onRSVP?: (eventId: number, status: 'attending' | 'maybe' | 'not_attending') => void;
  onViewDetails?: (eventId: number) => void;
  userRsvpStatus?: string;
}

export const EnhancedEventCard: React.FC<EnhancedEventCardProps> = ({
  event,
  onRSVP,
  onViewDetails,
  userRsvpStatus
}) => {
  const formatEventDate = (startDate: Date, endDate?: Date) => {
    const start = format(startDate, 'MMM dd, yyyy • HH:mm');
    if (endDate && endDate.getTime() !== startDate.getTime()) {
      const end = format(endDate, 'HH:mm');
      return `${start} - ${end}`;
    }
    return start;
  };

  const getAttendanceText = () => {
    if (!event.rsvpCounts) return '0 attending';
    const { attending, maybe } = event.rsvpCounts;
    if (maybe > 0) {
      return `${attending} attending • ${maybe} maybe`;
    }
    return `${attending} attending`;
  };

  const handleCardClick = () => {
    onViewDetails?.(event.id);
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Event Type Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-turquoise-500/90 text-white border-0"
          >
            {event.tags?.[0] || 'Event'}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-turquoise-600 transition-colors">
              {event.title}
            </h3>
            
            {/* Organizer */}
            {event.organizer && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <User className="h-4 w-4" />
                <span>
                  {event.organizer.firstName} {event.organizer.lastName}
                </span>
              </div>
            )}
          </div>
          
          {/* RSVP Status Badge */}
          {userRsvpStatus && (
            <Badge 
              variant={userRsvpStatus === 'attending' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {userRsvpStatus === 'attending' ? 'Going' : 
               userRsvpStatus === 'maybe' ? 'Maybe' : 'Not Going'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Event Details */}
        <div className="space-y-2">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="h-4 w-4 text-turquoise-500 flex-shrink-0" />
            <span className="text-sm font-medium">
              {formatEventDate(event.startDate, event.endDate)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="h-4 w-4 text-turquoise-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium line-clamp-2">
              {event.location}
            </span>
          </div>

          {/* Attendance */}
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="h-4 w-4 text-turquoise-500 flex-shrink-0" />
            <span className="text-sm font-medium">
              {getAttendanceText()}
              {event.maxAttendees && ` • ${event.maxAttendees} max`}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(1).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200/50">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onViewDetails?.(event.id);
            }}
            className="flex-1 bg-white/50 hover:bg-white/80 border-white/30"
          >
            View Details
          </Button>
          
          {onRSVP && (
            <div className="flex gap-1">
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  onRSVP(event.id, 'attending');
                }}
                className={`bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 ${
                  userRsvpStatus === 'attending' ? 'ring-2 ring-turquoise-300' : ''
                }`}
              >
                Going
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  onRSVP(event.id, 'maybe');
                }}
                className={`bg-white/50 hover:bg-white/80 border-white/30 ${
                  userRsvpStatus === 'maybe' ? 'ring-2 ring-gray-300' : ''
                }`}
              >
                Maybe
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedEventCard;
