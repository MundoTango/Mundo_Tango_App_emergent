
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, UserX, Clock, MessageSquare } from 'lucide-react';
import { createApiRequest } from '@/lib/apiClient';
import { useCsrfToken } from '@/contexts/CsrfContext';
import { useSocket } from '@/hooks/useSocket';
import { toast } from '@/hooks/use-toast';

interface EventRSVPSystemProps {
  eventId: number;
  currentUserRsvp?: {
    status: 'attending' | 'maybe' | 'not_attending';
    guestCount?: number;
    notes?: string;
  };
  onRsvpChange?: (newStatus: string) => void;
}

interface RsvpData {
  id: number;
  status: 'attending' | 'maybe' | 'not_attending';
  guestCount: number;
  notes?: string;
  createdAt: string;
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export const EventRSVPSystem: React.FC<EventRSVPSystemProps> = ({
  eventId,
  currentUserRsvp,
  onRsvpChange
}) => {
  const [rsvps, setRsvps] = useState<RsvpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestCount, setGuestCount] = useState(currentUserRsvp?.guestCount || 0);
  const [notes, setNotes] = useState(currentUserRsvp?.notes || '');
  const { csrfToken } = useCsrfToken();
  const api = createApiRequest(csrfToken);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchRsvps();
  }, [eventId]);

  useEffect(() => {
    if (socket && isConnected) {
      // Join event room for real-time updates
      socket.emit('join:event', eventId.toString());

      // Listen for RSVP changes
      socket.on('event:rsvp_updated', handleRsvpUpdate);

      return () => {
        socket.off('event:rsvp_updated', handleRsvpUpdate);
        socket.emit('leave:event', eventId.toString());
      };
    }
  }, [socket, isConnected, eventId]);

  const fetchRsvps = async () => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      if (response.success && response.data.rsvps) {
        setRsvps(response.data.rsvps);
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load RSVPs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpUpdate = (data: any) => {
    // Update RSVPs list in real-time
    fetchRsvps();
    
    // Show notification for other users' RSVPs
    if (data.userId !== getCurrentUserId()) {
      toast({
        title: 'RSVP Updated',
        description: `Someone ${data.status === 'attending' ? 'is going to' : 
                                  data.status === 'maybe' ? 'might attend' : 
                                  'won\'t attend'} this event`,
      });
    }
  };

  const getCurrentUserId = () => {
    // Get current user ID (you might want to get this from auth context)
    return null; // Placeholder
  };

  const handleRsvp = async (status: 'attending' | 'maybe' | 'not_attending') => {
    setSubmitting(true);
    
    try {
      const rsvpData = {
        status,
        guestCount: status === 'attending' ? guestCount : 0,
        notes: status === 'attending' ? notes : '',
      };

      const response = await api.post(`/api/events/${eventId}/rsvp`, rsvpData);
      
      if (response.success) {
        toast({
          title: 'RSVP Updated',
          description: `You are now ${status === 'attending' ? 'attending' : 
                                      status === 'maybe' ? 'maybe attending' : 
                                      'not attending'} this event`,
        });
        
        onRsvpChange?.(status);
        fetchRsvps();
      } else {
        throw new Error(response.error || 'Failed to update RSVP');
      }
    } catch (error) {
      console.error('RSVP error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update RSVP',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRsvpCounts = () => {
    const attending = rsvps.filter(r => r.status === 'attending').length;
    const maybe = rsvps.filter(r => r.status === 'maybe').length;
    const notAttending = rsvps.filter(r => r.status === 'not_attending').length;
    
    return { attending, maybe, notAttending };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'maybe':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'not_attending':
        return <UserX className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      attending: { variant: 'default', label: 'Going', className: 'bg-green-500' },
      maybe: { variant: 'secondary', label: 'Maybe', className: 'bg-yellow-500' },
      not_attending: { variant: 'outline', label: 'Not Going', className: 'bg-red-500 text-white' },
    } as const;

    const config = variants[status as keyof typeof variants];
    return config ? (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    ) : null;
  };

  const counts = getRsvpCounts();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* RSVP Actions */}
      <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-turquoise-500" />
            Your Response
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* RSVP Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleRsvp('attending')}
              disabled={submitting}
              className={`flex-1 ${currentUserRsvp?.status === 'attending' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 ring-2 ring-green-300' 
                : 'bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700'
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Going
            </Button>
            
            <Button
              onClick={() => handleRsvp('maybe')}
              disabled={submitting}
              variant={currentUserRsvp?.status === 'maybe' ? 'default' : 'outline'}
              className={`flex-1 ${currentUserRsvp?.status === 'maybe' 
                ? 'ring-2 ring-yellow-300' 
                : 'bg-white/50 border-white/30'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Maybe
            </Button>
            
            <Button
              onClick={() => handleRsvp('not_attending')}
              disabled={submitting}
              variant={currentUserRsvp?.status === 'not_attending' ? 'destructive' : 'outline'}
              className={`flex-1 ${currentUserRsvp?.status === 'not_attending' 
                ? 'ring-2 ring-red-300' 
                : 'bg-white/50 border-white/30'
              }`}
            >
              <UserX className="h-4 w-4 mr-2" />
              Can't Go
            </Button>
          </div>

          {/* Additional Options for Attending */}
          {currentUserRsvp?.status === 'attending' && (
            <div className="space-y-4 pt-4 border-t border-gray-200/50">
              <div>
                <Label htmlFor="guestCount">Guest Count (including yourself)</Label>
                <input
                  id="guestCount"
                  type="number"
                  min="1"
                  max="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                  className="bg-white/50 border-white/30"
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RSVP Summary */}
      <Card className="bg-gradient-to-br from-white/90 via-white/80 to-turquoise-50/30 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-turquoise-500" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{counts.attending}</div>
              <div className="text-sm text-gray-600">Going</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{counts.maybe}</div>
              <div className="text-sm text-gray-600">Maybe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{counts.notAttending}</div>
              <div className="text-sm text-gray-600">Can't Go</div>
            </div>
          </div>

          {/* Recent RSVPs */}
          {rsvps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Responses</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {rsvps.slice(0, 10).map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="flex items-center justify-between p-3 bg-white/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={rsvp.user.avatarUrl} />
                        <AvatarFallback>
                          {rsvp.user.firstName?.[0]}{rsvp.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium text-sm">
                          {rsvp.user.firstName} {rsvp.user.lastName}
                        </div>
                        {rsvp.notes && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {rsvp.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rsvp.guestCount > 1 && (
                        <span className="text-xs text-gray-500">
                          +{rsvp.guestCount - 1}
                        </span>
                      )}
                      {getStatusBadge(rsvp.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRSVPSystem;
