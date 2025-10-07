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
      // FIRST: Check what queries exist in cache BEFORE cancelling
      const allQueriesInCache = queryClient.getQueryCache().getAll();
      console.log('🔍 [RSVP] All queries in cache:', allQueriesInCache.map(q => ({ key: q.queryKey, state: q.state.status })));
      
      // Save all previous data for rollback BEFORE cancelling
      const previousData = new Map();
      queryClient.getQueriesData({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/events/feed' ||
            key[0] === '/api/events/upcoming' ||
            key[0] === '/api/user/events'
          );
        }
      }).forEach(([queryKey, data]) => {
        if (data) {
          previousData.set(JSON.stringify(queryKey), { queryKey, data });
        }
      });
      
      console.log('💾 [RSVP] Saved', previousData.size, 'queries before cancel');
      
      // THEN: Cancel all event-related queries (unified approach)
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          // Match all event queries: /api/events/feed (with or without groupId), /api/events/upcoming, /api/user/events/*
          return Array.isArray(key) && (
            key[0] === '/api/events/feed' ||
            key[0] === '/api/events/upcoming' ||
            key[0] === '/api/user/events'
          );
        }
      });
      
      // Helper function to update event RSVP
      const updateEvent = (event: any) => {
        if (event.id.toString() === eventId) {
          const oldStatus = event.userRsvpStatus;
          const oldAttendees = event.current_attendees || event.attendeesCount || 0;
          
          let attendeeChange = 0;
          if (oldStatus === 'going' && status !== 'going') {
            attendeeChange = -1;
          } else if (oldStatus !== 'going' && status === 'going') {
            attendeeChange = 1;
          }
          
          return { 
            ...event, 
            userRsvpStatus: status, 
            current_attendees: Math.max(0, oldAttendees + attendeeChange),
            attendeesCount: Math.max(0, oldAttendees + attendeeChange)
          };
        }
        return event;
      };
      
      // Apply optimistic updates to all event queries
      console.log('🔧 [RSVP] Updating', previousData.size, 'queries');
      previousData.forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) {
            console.log('⚠️ [RSVP] No data for query:', queryKey);
            return old;
          }
          
          // Handle different response formats
          const dataArray = old?.data || old;
          
          if (Array.isArray(dataArray)) {
            const updated = dataArray.map(updateEvent);
            const result = old?.data ? { ...old, data: updated } : updated;
            console.log('✅ [RSVP] Updated query:', queryKey, 'Updated event', eventId, 'to status:', status);
            return result;
          }
          
          console.log('⚠️ [RSVP] Data not array for query:', queryKey);
          return old;
        });
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback all optimistic updates on error
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive"
      });
    },
    onSuccess: (data, { eventId, status }) => {
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
      
      // ESA Layer 14: Invalidate all event-related queries with immediate refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/events/feed' ||
            key[0] === '/api/events/upcoming' ||
            key[0] === `/api/events/${eventId}` ||
            key[0] === '/api/user/events'
          );
        },
        refetchType: 'active' // Force immediate refetch of active queries
      });
    }
  });
}
