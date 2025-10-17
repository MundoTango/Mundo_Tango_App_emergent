import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * ESA Layer 7 & 14: Standardized Friend Request Mutations Hook
 * 
 * Follows the proven RSVP pattern for instant UI updates:
 * - Optimistic updates with setQueryData in onMutate
 * - Rollback on error with saved previousData
 * - Cache invalidation with refetchType: 'all' on success
 * 
 * Supports:
 * - Send friend request
 * - Accept friend request
 * - Reject/decline friend request
 * - Cancel sent request
 * - Unfriend
 * 
 * Updates all surfaces instantly:
 * - Friend lists (/api/friends/list)
 * - Friend requests (/api/friends/requests)
 * - Profile pages
 * - Notifications
 * - Sidebar friend count
 * 
 * @example
 * // Send friend request
 * const { mutate: sendRequest } = useFriendRequest('send');
 * sendRequest({ friendId: 123, note: 'Hi!' });
 * 
 * // Accept request
 * const { mutate: acceptRequest } = useFriendRequest('accept');
 * acceptRequest({ requestId: '456' });
 */

interface SendRequestParams {
  friendId: number;
  note?: string;
}

interface AcceptRequestParams {
  requestId: string;
  friendId?: number;
}

interface RejectRequestParams {
  requestId: string;
}

interface UnfriendParams {
  friendId: number;
}

type FriendRequestAction = 'send' | 'accept' | 'reject' | 'cancel' | 'unfriend';

export function useFriendRequest(action: FriendRequestAction) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SendRequestParams | AcceptRequestParams | RejectRequestParams | UnfriendParams) => {
      switch (action) {
        case 'send': {
          const { friendId, note } = params as SendRequestParams;
          return apiRequest('/api/friends/request', {
            method: 'POST',
            body: { friendId, note }
          });
        }
        case 'accept': {
          const { requestId } = params as AcceptRequestParams;
          return apiRequest(`/api/friends/accept/${requestId}`, {
            method: 'POST'
          });
        }
        case 'reject': {
          const { requestId } = params as RejectRequestParams;
          return apiRequest(`/api/friends/reject/${requestId}`, {
            method: 'POST'
          });
        }
        case 'cancel': {
          const { requestId } = params as RejectRequestParams;
          return apiRequest(`/api/friends/cancel/${requestId}`, {
            method: 'DELETE'
          });
        }
        case 'unfriend': {
          const { friendId } = params as UnfriendParams;
          return apiRequest(`/api/friends/${friendId}`, {
            method: 'DELETE'
          });
        }
      }
    },
    
    onMutate: async (params) => {
      // Save all previous data for rollback
      const previousData = new Map();
      
      queryClient.getQueriesData({ 
        predicate: (query) => {
          const key = query.queryKey;
          // Match ALL friend-related queries
          return Array.isArray(key) && (
            key[0] === '/api/friends/list' ||
            key[0] === '/api/friends/requests' ||
            key[0] === '/api/friends/suggestions' ||
            key[0] === '/api/notifications' ||
            String(key[0]).startsWith('/api/friends/')
          );
        }
      }).forEach(([queryKey, data]) => {
        if (data) {
          previousData.set(JSON.stringify(queryKey), { queryKey, data });
        }
      });
      
      // Cancel queries
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/friends/list' ||
            key[0] === '/api/friends/requests' ||
            key[0] === '/api/friends/suggestions' ||
            key[0] === '/api/notifications' ||
            String(key[0]).startsWith('/api/friends/')
          );
        }
      });
      
      // Apply optimistic updates based on action
      if (action === 'send') {
        const { friendId } = params as SendRequestParams;
        
        // Remove from suggestions
        queryClient.setQueryData(['/api/friends/suggestions'], (old: any) => {
          if (!old) return old;
          const suggestions = old?.data || old || [];
          
          if (Array.isArray(suggestions)) {
            const updated = suggestions.filter((user: any) => user.id !== friendId);
            return old?.data ? { ...old, data: updated } : updated;
          }
          
          return old;
        });
      }
      
      if (action === 'accept') {
        const { requestId, friendId } = params as AcceptRequestParams;
        
        // Remove from pending requests
        queryClient.setQueryData(['/api/friends/requests'], (old: any) => {
          if (!old) return old;
          const requests = old?.data || old || [];
          
          if (Array.isArray(requests)) {
            const updated = requests.filter((req: any) => req.id !== requestId);
            return old?.data ? { ...old, data: updated } : updated;
          }
          
          return old;
        });
        
        // Increment friend count (if we have friend data, add to list)
        if (friendId) {
          queryClient.setQueryData(['/api/friends/list'], (old: any) => {
            if (!old) return old;
            const friends = old?.data || old || [];
            
            // Friend data will be added by server response
            return old;
          });
        }
      }
      
      if (action === 'reject' || action === 'cancel') {
        const { requestId } = params as RejectRequestParams;
        
        // Remove from pending requests
        queryClient.setQueryData(['/api/friends/requests'], (old: any) => {
          if (!old) return old;
          const requests = old?.data || old || [];
          
          if (Array.isArray(requests)) {
            const updated = requests.filter((req: any) => req.id !== requestId);
            return old?.data ? { ...old, data: updated } : updated;
          }
          
          return old;
        });
      }
      
      if (action === 'unfriend') {
        const { friendId } = params as UnfriendParams;
        
        // Remove from friend list
        queryClient.setQueryData(['/api/friends/list'], (old: any) => {
          if (!old) return old;
          const friends = old?.data || old || [];
          
          if (Array.isArray(friends)) {
            const updated = friends.filter((friend: any) => friend.id !== friendId);
            return old?.data ? { ...old, data: updated } : updated;
          }
          
          return old;
        });
      }
      
      return { previousData };
    },
    
    onError: (err, variables, context) => {
      // Rollback all optimistic updates on error
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      const errorMessages = {
        send: "Failed to send friend request",
        accept: "Failed to accept friend request",
        reject: "Failed to reject friend request",
        cancel: "Failed to cancel friend request",
        unfriend: "Failed to unfriend user"
      };
      
      toast({
        title: "Error",
        description: errorMessages[action],
        variant: "destructive"
      });
    },
    
    onSuccess: (data, params) => {
      // Invalidate all friend-related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/friends/list' ||
            key[0] === '/api/friends/requests' ||
            key[0] === '/api/friends/suggestions' ||
            key[0] === '/api/notifications' ||
            String(key[0]).startsWith('/api/friends/')
          );
        },
        refetchType: 'all'
      });
      
      const successMessages = {
        send: "Friend request sent",
        accept: "Friend request accepted",
        reject: "Friend request rejected",
        cancel: "Friend request cancelled",
        unfriend: "Unfriended successfully"
      };
      
      toast({
        title: "Success",
        description: successMessages[action],
      });
    }
  });
}
