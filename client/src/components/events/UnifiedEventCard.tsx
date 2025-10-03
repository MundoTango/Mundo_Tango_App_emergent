import { Clock, MapPin, Users, Sparkles, Check, HelpCircle, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeFormatDate, safeFormatTime } from '@/utils/dateHelpers';
import { Button } from '@/components/ui/button';
import { UseMutationResult } from '@tanstack/react-query';

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

interface UnifiedEventCardProps {
  event: Event;
  rsvpMutation: UseMutationResult<any, Error, { eventId: string; status: 'going' | 'interested' | 'maybe' | 'not_going' | null }, unknown>;
}

export default function UnifiedEventCard({ event, rsvpMutation }: UnifiedEventCardProps) {
  const eventTypeColors = {
    milonga: { bg: 'bg-[rgba(94,234,212,0.24)]', text: 'text-[#0E7490]', border: 'border-[rgba(94,234,212,0.55)]' },
    workshop: { bg: 'bg-[rgba(43,178,232,0.24)]', text: 'text-[#0369A1]', border: 'border-[rgba(43,178,232,0.55)]' },
    festival: { bg: 'bg-[rgba(236,72,153,0.24)]', text: 'text-[#BE185D]', border: 'border-[rgba(236,72,153,0.55)]' },
    practica: { bg: 'bg-[rgba(16,185,129,0.24)]', text: 'text-[#047857]', border: 'border-[rgba(16,185,129,0.55)]' }
  };

  const colors = eventTypeColors[event.type as keyof typeof eventTypeColors] || eventTypeColors.milonga;

  const renderRSVPIcons = () => (
    <div className="flex items-center gap-1 relative z-50">
      <Button
        size="sm"
        variant={event.userRsvpStatus === 'going' ? 'default' : 'outline'}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('🔵 [Sidebar RSVP] Going button clicked', { eventId: event.id, currentStatus: event.userRsvpStatus });
          const newStatus = event.userRsvpStatus === 'going' ? null : 'going';
          console.log('🔵 [Sidebar RSVP] Calling mutate with:', { eventId: event.id, status: newStatus });
          rsvpMutation.mutate({ 
            eventId: event.id,
            status: newStatus
          });
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as attending"
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'going' ? 'bg-gradient-to-r from-[#14b8a6] to-[#06b6d4] hover:from-[#0d9488] hover:to-[#0891b2]' : ''}`}
        data-testid={`rsvp-attending-${event.id}`}
      >
        <Check className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={event.userRsvpStatus === 'interested' ? 'default' : 'outline'}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('⭐ [Sidebar RSVP] Interested button clicked', { eventId: event.id, currentStatus: event.userRsvpStatus });
          const newStatus = event.userRsvpStatus === 'interested' ? null : 'interested';
          rsvpMutation.mutate({ 
            eventId: event.id,
            status: newStatus
          });
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as interested"
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'interested' ? 'bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D97706]' : ''}`}
        data-testid={`rsvp-interested-${event.id}`}
      >
        <Star className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={event.userRsvpStatus === 'maybe' ? 'default' : 'outline'}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          rsvpMutation.mutate({ 
            eventId: event.id,
            status: event.userRsvpStatus === 'maybe' ? null : 'maybe' 
          });
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as maybe"
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'maybe' ? 'bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#7C3AED]' : ''}`}
        data-testid={`rsvp-maybe-${event.id}`}
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={event.userRsvpStatus === 'not_going' ? 'default' : 'outline'}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          rsvpMutation.mutate({ 
            eventId: event.id,
            status: event.userRsvpStatus === 'not_going' ? null : 'not_going' 
          });
        }}
        disabled={rsvpMutation.isPending}
        title="Mark as not going"
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'not_going' ? 'bg-gradient-to-r from-[#F87171] to-[#EF4444] hover:from-[#EF4444] hover:to-[#DC2626]' : ''}`}
        data-testid={`rsvp-not-going-${event.id}`}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );

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
        <div className="flex items-start justify-between mb-2 gap-2">
          <a
            href={`/events/${event.id}`}
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
            {renderRSVPIcons()}
          </div>
        </div>

        <a
          href={`/events/${event.id}`}
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
                  You're Going
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
}
