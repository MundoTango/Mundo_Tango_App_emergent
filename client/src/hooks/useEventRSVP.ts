import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useEventRSVP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'interested' | 'maybe' | 'not_going' | null }) => {
      console.log('🚀 [RSVP Mutation] Starting mutation:', { eventId, status });
      const result = await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        body: { status }
      });
      console.log('✅ [RSVP Mutation] Mutation successful:', result);
      return result;
    },
    onMutate: async ({ eventId, status }) => {
      console.log('🔄 [RSVP Mutation] onMutate called:', { eventId, status });
      // Cancel all event-related queries (unified approach)
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
      
      // Save all previous data for rollback
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
      console.log(`📊 [RSVP Mutation] Found ${previousData.size} queries to update`);
      previousData.forEach(({ queryKey }) => {
        console.log('🔧 [RSVP Mutation] Updating query:', queryKey);
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) {
            console.log('⚠️ [RSVP Mutation] No old data for query:', queryKey);
            return old;
          }
          
          // Handle different response formats
          const dataArray = old?.data || old;
          console.log('📦 [RSVP Mutation] Data structure:', { hasDataProp: !!old?.data, isArray: Array.isArray(dataArray), length: dataArray?.length });
          
          if (Array.isArray(dataArray)) {
            const updated = dataArray.map(updateEvent);
            const result = old?.data ? { ...old, data: updated } : updated;
            console.log('✨ [RSVP Mutation] Updated data for query:', queryKey);
            return result;
          }
          
          console.log('⚠️ [RSVP Mutation] Data is not an array:', typeof dataArray);
          return old;
        });
      });
      
      console.log('✅ [RSVP Mutation] Optimistic update complete');
      return { previousData };
    },
    onError: (err, variables, context) => {
      console.error('❌ [RSVP Mutation] Error occurred:', err);
      // Rollback all optimistic updates on error
      if (context?.previousData) {
        console.log('🔙 [RSVP Mutation] Rolling back optimistic updates');
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
    onSuccess: async (data, { eventId, status }) => {
      console.log('🎉 [RSVP Mutation] onSuccess called:', { eventId, status, data });
      
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
      console.log('🔄 [RSVP Mutation] Invalidating queries...');
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
