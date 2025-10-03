import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useEventRSVP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'interested' | 'maybe' | 'not_going' | null }) => {
      const result = await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        body: { status }
      });
      return result;
    },
    onMutate: async ({ eventId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/events/feed'] });
      
      const previousEvents = queryClient.getQueryData(['/api/events/feed']);
      
      queryClient.setQueryData(['/api/events/feed'], (old: any) => {
        if (!old) return old;
        
        const updated = old.map((event: any) => {
          if (event.id.toString() === eventId) {
            const oldStatus = event.userRsvpStatus;
            const oldAttendees = event.current_attendees || 0;
            
            let attendeeChange = 0;
            if (oldStatus === 'going' && status !== 'going') {
              attendeeChange = -1;
            } else if (oldStatus !== 'going' && status === 'going') {
              attendeeChange = 1;
            }
            
            const updatedEvent = { 
              ...event, 
              userRsvpStatus: status, 
              current_attendees: Math.max(0, oldAttendees + attendeeChange)
            };
            return updatedEvent;
          }
          return event;
        });
        return updated;
      });
      
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['/api/events/feed'], context.previousEvents);
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive"
      });
    },
    onSuccess: async (data, { eventId, status }) => {
      if (status === null) {
        toast({
          title: "RSVP Removed",
          description: "Your RSVP has been removed.",
        });
      } else {
        const statusText = 
          status === 'going' ? 'attending' : 
          status === 'interested' ? 'interested' : 
          status === 'maybe' ? 'maybe attending' : 
          'not attending';
        toast({
          title: "RSVP Updated",
          description: `You're now marked as ${statusText}`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/events/feed'] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/groups/') && key.includes('/events');
        }
      });
    }
  });
}
