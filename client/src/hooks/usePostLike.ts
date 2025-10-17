import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * ESA Layer 7 & 14: Standardized Post Like/Unlike Hook
 * 
 * Follows the proven RSVP pattern for instant UI updates:
 * - Optimistic updates with setQueryData in onMutate
 * - Rollback on error with saved previousData
 * - Cache invalidation with refetchType: 'all' on success
 * - Single shared queryClient from lib/queryClient.ts
 * 
 * Updates all surfaces instantly:
 * - Main feed (/api/posts/feed)
 * - Profile posts (/api/posts/user/{userId})
 * - Group posts (/api/posts/group/{groupId})
 * - Event posts (/api/posts/event/{eventId})
 * 
 * @example
 * const { mutate: toggleLike, isPending } = usePostLike();
 * 
 * <button 
 *   onClick={() => toggleLike({ postId: post.id, isLiked: post.isLiked })}
 *   disabled={isPending}
 * >
 *   {post.isLiked ? <HeartFilled /> : <Heart />}
 * </button>
 */
export function usePostLike() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      const endpoint = isLiked ? `/api/post/unlike/${postId}` : `/api/post/like/${postId}`;
      const method = isLiked ? 'DELETE' : 'POST';
      
      const result = await apiRequest(endpoint, { method });
      return result;
    },
    
    onMutate: async ({ postId, isLiked }) => {
      // Save all previous data for rollback BEFORE cancelling queries
      const previousData = new Map();
      
      queryClient.getQueriesData({ 
        predicate: (query) => {
          const key = query.queryKey;
          // Match ALL post-related queries across platform
          return Array.isArray(key) && (
            key[0] === '/api/posts/feed' ||
            key[0] === '/api/posts' ||
            key[0] === '/api/feed' ||
            key[0] === '/api/timeline' ||
            key[0] === '/api/memories' ||
            String(key[0]).startsWith('/api/posts/') ||  // Individual post queries
            String(key[0]).includes('/posts')           // Nested post endpoints
          );
        }
      }).forEach(([queryKey, data]) => {
        if (data) {
          previousData.set(JSON.stringify(queryKey), { queryKey, data });
        }
      });
      
      // Cancel all post-related queries (unified approach)
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/posts/feed' ||
            key[0] === '/api/posts' ||
            key[0] === '/api/feed' ||
            key[0] === '/api/timeline' ||
            key[0] === '/api/memories' ||
            String(key[0]).startsWith('/api/posts/') ||
            String(key[0]).includes('/posts')
          );
        }
      });
      
      // Helper function to update post likes
      const updatePostLikes = (post: any) => {
        if (post.id?.toString() === postId.toString()) {
          const likeChange = isLiked ? -1 : 1; // Unlike: -1, Like: +1
          
          return { 
            ...post, 
            isLiked: !isLiked,
            likes: Math.max(0, (post.likes || 0) + likeChange)
          };
        }
        return post;
      };
      
      // Apply optimistic updates to all post queries
      previousData.forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          
          // Handle different response formats (preserve envelope structure)
          const dataArray = old?.data || old;
          
          if (Array.isArray(dataArray)) {
            const updated = dataArray.map(updatePostLikes);
            // Preserve response envelope if it exists
            return old?.data ? { ...old, data: updated } : updated;
          }
          
          // Handle single post object (detail views)
          if (dataArray?.id) {
            const updated = updatePostLikes(dataArray);
            // Preserve response envelope if it exists
            return old?.data ? { ...old, data: updated } : updated;
          }
          
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
        description: "Failed to update like",
        variant: "destructive"
      });
    },
    
    onSuccess: (data, { isLiked }) => {
      // ESA Layer 14: Invalidate all post-related queries with immediate refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key[0] === '/api/posts/feed' ||
            key[0] === '/api/posts' ||
            key[0] === '/api/feed' ||
            key[0] === '/api/timeline' ||
            key[0] === '/api/memories' ||
            String(key[0]).startsWith('/api/posts/') ||
            String(key[0]).includes('/posts')
          );
        },
        refetchType: 'all'
      });
      
      // Optional: Show success toast (can be disabled for less noisy UX)
      // toast({
      //   title: isLiked ? "Like removed" : "Post liked",
      //   description: isLiked ? "You unliked this post" : "You liked this post",
      // });
    }
  });
}
