import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * ESA Layer 7 & 14: Standardized Comment Mutations Hook
 * 
 * Follows the proven RSVP pattern for instant UI updates:
 * - Optimistic insert/update/delete with setQueryData
 * - Rollback on error with saved previousData
 * - Cache invalidation with refetchType: 'all' on success
 * 
 * Supports:
 * - Create comment (instant appearance in feed)
 * - Edit comment (instant update)
 * - Delete comment (instant removal)
 * 
 * Updates all surfaces instantly:
 * - Post comments list (/api/posts/{postId}/comments)
 * - Post feed with comment counts (/api/posts/feed)
 * - Profile posts (/api/posts/user/{userId})
 * 
 * @example
 * // Create comment
 * const { mutate: addComment } = useCommentMutation('create');
 * addComment({ postId: 123, content: 'Great post!' });
 * 
 * // Delete comment
 * const { mutate: deleteComment } = useCommentMutation('delete');
 * deleteComment({ commentId: 456, postId: 123 });
 */

/**
 * Helper: Check if queryKey contains a specific postId
 * Segment-aware matcher that respects number equality and object fields
 * Prevents false matches (e.g., postId 12 won't match postId 112)
 */
function queryKeyContainsPostId(queryKey: any[], postId: number): boolean {
  for (const segment of queryKey) {
    // Check if segment is the postId directly (number equality)
    if (segment === postId || segment === String(postId)) {
      return true;
    }
    
    // Check if segment is a string containing the postId (e.g., '/api/posts/123/comments')
    if (typeof segment === 'string') {
      // Use word boundaries to prevent substring matches (12 vs 112)
      const regex = new RegExp(`\\b${postId}\\b`);
      if (regex.test(segment)) {
        return true;
      }
    }
    
    // Check if segment is an object with postId field
    if (typeof segment === 'object' && segment !== null) {
      if (segment.postId === postId || segment.postId === String(postId)) {
        return true;
      }
    }
  }
  
  return false;
}

interface CreateCommentParams {
  postId: number;
  content: string;
  mentions?: string[];
}

interface EditCommentParams {
  commentId: number;
  postId: number;
  content: string;
}

interface DeleteCommentParams {
  commentId: number;
  postId: number;
}

type CommentMutationType = 'create' | 'edit' | 'delete';

export function useCommentMutation(type: CommentMutationType) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateCommentParams | EditCommentParams | DeleteCommentParams) => {
      switch (type) {
        case 'create': {
          const { postId, content, mentions } = params as CreateCommentParams;
          return apiRequest(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: { content, mentions }
          });
        }
        case 'edit': {
          const { commentId, content } = params as EditCommentParams;
          return apiRequest(`/api/comments/${commentId}`, {
            method: 'PATCH',
            body: { content }
          });
        }
        case 'delete': {
          const { commentId } = params as DeleteCommentParams;
          return apiRequest(`/api/comments/${commentId}`, {
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
          // Match ALL post and comment queries across platform
          return Array.isArray(key) && (
            key[0] === '/api/posts/feed' ||
            key[0] === '/api/posts' ||
            key[0] === '/api/feed' ||
            key[0] === '/api/timeline' ||
            key[0] === '/api/memories' ||
            String(key[0]).startsWith('/api/posts/') ||
            String(key[0]).includes('/posts') ||
            String(key[0]).includes('/comments')
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
            key[0] === '/api/posts/feed' ||
            key[0] === '/api/posts' ||
            key[0] === '/api/feed' ||
            key[0] === '/api/timeline' ||
            key[0] === '/api/memories' ||
            String(key[0]).startsWith('/api/posts/') ||
            String(key[0]).includes('/posts') ||
            String(key[0]).includes('/comments')
          );
        }
      });
      
      // Apply optimistic updates based on mutation type
      if (type === 'create') {
        const { postId, content } = params as CreateCommentParams;
        const tempComment = {
          id: Date.now(), // Temporary ID
          content,
          userId: -1, // Will be set by server
          user: {
            id: -1,
            name: 'You',
            profileImage: undefined
          },
          createdAt: new Date().toISOString(),
          mentions: (params as CreateCommentParams).mentions || []
        };
        
        // Add comment to ALL comment list queries for this post (handle pagination/filter variants)
        previousData.forEach(({ queryKey }) => {
          // Use segment-aware matcher to prevent false matches (e.g., postId 12 vs 112)
          const keyString = JSON.stringify(queryKey);
          const hasComments = keyString.includes('/comments');
          const hasPostId = queryKeyContainsPostId(queryKey, postId);
          
          if (hasComments && hasPostId) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return [tempComment];
              const comments = old?.data || old || [];
              
              if (Array.isArray(comments)) {
                const updated = [...comments, tempComment];
                // Preserve response envelope if it exists
                return old?.data ? { ...old, data: updated } : updated;
              }
              
              return old?.data ? { ...old, data: [tempComment] } : [tempComment];
            });
          }
        });
        
        // Increment comment count in ALL post surfaces (timeline, memories, feeds, etc.)
        previousData.forEach(({ queryKey }) => {
          const key = String(queryKey[0]);
          // Apply ONLY to post collection queries (exclude comment queries)
          const isPostQuery = (
            key === '/api/posts/feed' || key === '/api/posts' || 
            key === '/api/feed' || key === '/api/timeline' || key === '/api/memories' ||
            (key.startsWith('/api/posts/') && !key.includes('/comments')) ||
            (key.includes('/posts') && !key.includes('/comments'))
          );
          
          if (isPostQuery) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;
              const dataArray = old?.data || old;
              
              if (Array.isArray(dataArray)) {
                const updated = dataArray.map((post: any) => 
                  post.id === postId 
                    ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
                    : post
                );
                return old?.data ? { ...old, data: updated } : updated;
              }
              return old;
            });
          }
        });
      }
      
      if (type === 'delete') {
        const { commentId, postId } = params as DeleteCommentParams;
        
        // Remove comment from ALL comment list queries for this post (handle pagination/filter variants)
        previousData.forEach(({ queryKey }) => {
          // Use segment-aware matcher to prevent false matches (e.g., postId 12 vs 112)
          const keyString = JSON.stringify(queryKey);
          const hasComments = keyString.includes('/comments');
          const hasPostId = queryKeyContainsPostId(queryKey, postId);
          
          if (hasComments && hasPostId) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;
              const comments = old?.data || old || [];
              
              if (Array.isArray(comments)) {
                const updated = comments.filter((c: any) => c.id !== commentId);
                // Preserve response envelope if it exists
                return old?.data ? { ...old, data: updated } : updated;
              }
              
              return old;
            });
          }
        });
        
        // Decrement comment count in ALL post surfaces (timeline, memories, feeds, etc.)
        previousData.forEach(({ queryKey }) => {
          const key = String(queryKey[0]);
          // Apply ONLY to post collection queries (exclude comment queries)
          const isPostQuery = (
            key === '/api/posts/feed' || key === '/api/posts' || 
            key === '/api/feed' || key === '/api/timeline' || key === '/api/memories' ||
            (key.startsWith('/api/posts/') && !key.includes('/comments')) ||
            (key.includes('/posts') && !key.includes('/comments'))
          );
          
          if (isPostQuery) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;
              const dataArray = old?.data || old;
              
              if (Array.isArray(dataArray)) {
                const updated = dataArray.map((post: any) => 
                  post.id === postId 
                    ? { ...post, commentsCount: Math.max(0, (post.commentsCount || 0) - 1) }
                    : post
                );
                return old?.data ? { ...old, data: updated } : updated;
              }
              return old;
            });
          }
        });
      }
      
      if (type === 'edit') {
        const { commentId, postId, content } = params as EditCommentParams;
        
        // Update comment content in ALL comment list queries for this post (handle pagination/filter variants)
        previousData.forEach(({ queryKey }) => {
          // Use segment-aware matcher to prevent false matches (e.g., postId 12 vs 112)
          const keyString = JSON.stringify(queryKey);
          const hasComments = keyString.includes('/comments');
          const hasPostId = queryKeyContainsPostId(queryKey, postId);
          
          if (hasComments && hasPostId) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;
              const comments = old?.data || old || [];
              
              if (Array.isArray(comments)) {
                const updated = comments.map((c: any) => 
                  c.id === commentId ? { ...c, content } : c
                );
                // Preserve response envelope if it exists
                return old?.data ? { ...old, data: updated } : updated;
              }
              
              return old;
            });
          }
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
        create: "Failed to post comment",
        edit: "Failed to update comment",
        delete: "Failed to delete comment"
      };
      
      toast({
        title: "Error",
        description: errorMessages[type],
        variant: "destructive"
      });
    },
    
    onSuccess: (data, params) => {
      // Invalidate all comment and post queries
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
            String(key[0]).includes('/posts') ||
            String(key[0]).includes('/comments')
          );
        },
        refetchType: 'all'
      });
      
      const successMessages = {
        create: "Comment posted",
        edit: "Comment updated",
        delete: "Comment deleted"
      };
      
      toast({
        title: "Success",
        description: successMessages[type],
      });
    }
  });
}
