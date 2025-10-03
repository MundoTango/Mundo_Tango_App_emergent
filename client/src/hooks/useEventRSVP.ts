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
      // Cancel all related queries
      await queryClient.cancelQueries({ queryKey: ['/api/events/feed'] });
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/groups/') && key.includes('/events');
        }
      });
      
      // Save previous data for rollback
      const previousEvents = queryClient.getQueryData(['/api/events/feed']);
      const previousGroupEvents = new Map();
      
      // Helper function to update event RSVP
      const updateEvent = (event: any) => {
        if (event.id.toString() === eventId) {
          const oldStatus = event.userRsvpStatus;
          const oldAttendees = event.current_attendees || 0;
          
          let attendeeChange = 0;
          if (oldStatus === 'going' && status !== 'going') {
            attendeeChange = -1;
          } else if (oldStatus !== 'going' && status === 'going') {
            attendeeChange = 1;
          }
          
          return { 
            ...event, 
            userRsvpStatus: status, 
            current_attendees: Math.max(0, oldAttendees + attendeeChange)
          };
        }
        return event;
      };
      
      // Update events feed optimistically
      queryClient.setQueryData(['/api/events/feed'], (old: any) => {
        if (!old) return old;
        return old.map(updateEvent);
      });
      
      // Update all group event queries optimistically
      queryClient.getQueriesData({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/groups/') && key.includes('/events');
        }
      }).forEach(([queryKey, data]) => {
        if (data) {
          previousGroupEvents.set(queryKey, data);
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            return old.map(updateEvent);
          });
        }
      });
      
      return { previousEvents, previousGroupEvents };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['/api/events/feed'], context.previousEvents);
      }
      if (context?.previousGroupEvents) {
        context.previousGroupEvents.forEach((data: any, queryKey: any) => {
          queryClient.setQueryData(queryKey, data);
        });
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
