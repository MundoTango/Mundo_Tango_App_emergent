import { Clock, MapPin, Users, Sparkles, Check, HelpCircle, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeFormatDate, safeFormatTime } from '@/utils/dateHelpers';
import { Button } from '@/components/ui/button';
import { UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const eventTypeColors = {
    milonga: { bg: 'bg-ocean-500/20', text: 'text-ocean-700', border: 'border-ocean-500/50' },
    workshop: { bg: 'bg-ocean-400/20', text: 'text-ocean-700', border: 'border-ocean-400/50' },
    festival: { bg: 'bg-ocean-600/20', text: 'text-ocean-800', border: 'border-ocean-600/50' },
    practica: { bg: 'bg-ocean-300/20', text: 'text-ocean-700', border: 'border-ocean-300/50' }
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
        title={t('events.rsvp.markAsAttending')}
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'going' ? 'bg-gradient-to-r from-[#14b8a6] to-[#2DD4BF] hover:from-[#0d9488] hover:to-[#14B8A6]' : ''}`}
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
        title={t('events.rsvp.markAsInterested')}
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'interested' ? 'bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488]' : ''}`}
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
        title={t('events.rsvp.markAsMaybe')}
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'maybe' ? 'bg-gradient-to-r from-[#5EEAD4] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#14B8A6]' : ''}`}
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
        title={t('events.rsvp.markAsNotGoing')}
        className={`p-1.5 h-auto ${event.userRsvpStatus === 'not_going' ? 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:from-[#0F766E] hover:to-[#155E75]' : ''}`}
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
          borderColor: 'rgba(20, 184, 166, 0.55)'
        }}
        className={cn(
          "p-3 rounded-xl border transition-all duration-300 backdrop-blur-sm",
          "hover:scale-[1.01] hover:shadow-lg"
        )}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(240, 253, 250, 0.82)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.78)'}
      >
        <div className="flex items-start justify-between mb-2 gap-2">
          <a
            href={`/events/${event.id}`}
            className="flex-1 min-w-0 cursor-pointer text-left"
          >
            <h3 className="font-semibold text-sm transition-colors truncate text-ocean-900 group-hover:text-ocean-300">
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
              <Sparkles className="w-4 h-4 text-ocean-300 animate-pulse" />
            )}
            {renderRSVPIcons()}
          </div>
        </div>

        <a
          href={`/events/${event.id}`}
          className="block cursor-pointer"
        >
          <div className="space-y-1 text-xs text-ocean-600">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {safeFormatDate(event.date, 'MMM dd', t('events.dateTBA'))} at {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 flex-shrink-0" />
              <span>{t('events.attendeeCount', { count: event.attendees })}</span>
              {event.userRsvpStatus === 'going' && (
                <span 
                  style={{ background: 'rgba(94, 234, 212, 0.24)', color: '#0F766E' }}
                  className="px-1.5 py-0.5 rounded text-xs"
                >
                  {t('events.rsvp.youreGoing')}
                </span>
              )}
              {event.userRsvpStatus === 'interested' && (
                <span 
                  style={{ background: 'rgba(45, 212, 191, 0.24)', color: '#0D9488' }}
                  className="px-1.5 py-0.5 rounded text-xs"
                >
                  {t('events.rsvp.interested')}
                </span>
              )}
              {event.userRsvpStatus === 'maybe' && (
                <span 
                  style={{ background: 'rgba(153, 246, 228, 0.24)', color: '#14B8A6' }}
                  className="px-1.5 py-0.5 rounded text-xs"
                >
                  {t('events.rsvp.maybe')}
                </span>
              )}
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
