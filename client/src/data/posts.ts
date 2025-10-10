/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK - Phase 2 Data Layer
 * Centralized Post Data Hooks - Single Source of Truth
 * 
 * PURPOSE: Eliminate scattered React Query logic and 5-layer transformations
 * REPLACES: 13 files with independent useQuery calls
 * 
 * Architecture:
 * - Layer 2 (API): Consistent endpoints and data contracts
 * - Layer 7 (State): Centralized state management via hooks
 * - Layer 8 (Client): Single transformation pipeline
 * 
 * @see docs/pages/esa-architecture/brittleness-refactoring.md
 * Rollback: git checkout 9d28e7b198cd013fec20bd7be72d0311ea56d1a1
 */

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

// ============================================================================
// TYPE DEFINITIONS - Unified across platform
// ============================================================================

export interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    tangoRoles?: string[];
    leaderLevel?: number;
    followerLevel?: number;
    city?: string;
    state?: string;
    country?: string;
    friendshipStatus?: 'accepted' | 'pending' | 'none' | 'following';
    connectionType?: string;
  };
  likes?: number;
  comments?: Array<{
    id: number;
    content: string;
    userId: number;
    user: {
      id: number;
      name: string;
      profileImage?: string;
    };
    createdAt: string;
    mentions?: string[];
  }>;
  commentsCount?: number;
  isLiked?: boolean;
  hashtags?: string[];
  location?: string;
  hasConsent?: boolean;
  mentions?: Array<{
    type: 'user' | 'event' | 'group';
    id: string;
    display: string;
  }>;
  emotionTags?: string[];
  reactions?: Record<string, number>;
  userReaction?: string;
  commentCount?: number;
  shareCount?: number;
}

export interface FilterOptions {
  filterType?: 'all' | 'residents' | 'visitors' | 'friends';
  tags?: string[];
  visibility?: 'all' | 'public' | 'friends' | 'private';
  location?: { lat: number; lng: number; radius: number };
  startDate?: string;
  endDate?: string;
}

export type FeedContext = 
  | { type: 'feed' }
  | { type: 'group'; groupId: number; filter?: 'all' | 'residents' | 'visitors' | 'members' | 'non-members' | 'friends' }
  | { type: 'profile'; userId: number }
  | { type: 'event'; eventId: number; filter?: 'all' | 'participants' | 'guests' };

interface PostFeedResponse {
  posts: Post[];
  hasMore: boolean;
  total?: number;
}

// ============================================================================
// QUERY KEY BUILDER - Consistent cache segmentation
// ============================================================================

/**
 * Build query key for React Query cache
 * CRITICAL: Use array segments for proper invalidation hierarchy
 * 
 * Examples:
 * - ['/api/posts/feed', 1, 'all'] ← Feed context, page 1, filter 'all'
 * - ['/api/groups', 5, 'posts', 2] ← Group 5 posts, page 2
 */
function buildQueryKey(
  context: FeedContext,
  page: number,
  filters?: FilterOptions,
  searchQuery?: string
): QueryKey {
  const baseKey: any[] = [];

  switch (context.type) {
    case 'feed':
      baseKey.push('/api/posts/feed', page);
      break;
    case 'group':
      baseKey.push('/api/groups', context.groupId, 'posts', page);
      if (context.filter) baseKey.push(context.filter);
      break;
    case 'profile':
      baseKey.push('/api/users', context.userId, 'posts', page);
      break;
    case 'event':
      baseKey.push('/api/events', context.eventId, 'posts', page);
      if (context.filter) baseKey.push(context.filter);
      break;
  }

  // Append filters for cache differentiation
  if (filters?.filterType && filters.filterType !== 'all') {
    baseKey.push(filters.filterType);
  }
  if (filters?.tags && filters.tags.length > 0) {
    baseKey.push('tags', filters.tags.join(','));
  }
  if (searchQuery) {
    baseKey.push('search', searchQuery);
  }

  return baseKey;
}

// ============================================================================
// URL BUILDER - Context-aware API endpoints
// ============================================================================

function buildFetchUrl(
  context: FeedContext,
  page: number,
  limit: number,
  filters?: FilterOptions,
  searchQuery?: string
): string {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Add filter params
  if (filters?.filterType) params.set('filter', filters.filterType);
  if (filters?.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }
  if (filters?.visibility) params.set('visibility', filters.visibility);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (searchQuery) params.set('search', searchQuery);

  let baseUrl = '';
  switch (context.type) {
    case 'feed':
      baseUrl = '/api/posts/feed';
      break;
    case 'group':
      baseUrl = `/api/groups/${context.groupId}/posts`;
      if (context.filter) params.set('filter', context.filter);
      break;
    case 'profile':
      baseUrl = `/api/users/${context.userId}/posts`;
      break;
    case 'event':
      baseUrl = `/api/events/${context.eventId}/posts`;
      if (context.filter) params.set('filter', context.filter);
      break;
  }

  return `${baseUrl}?${params.toString()}`;
}

// ============================================================================
// usePostFeed Hook - SINGLE TRANSFORMATION PIPELINE
// ============================================================================

interface UsePostFeedOptions {
  context: FeedContext;
  page?: number;
  limit?: number;
  filters?: FilterOptions;
  searchQuery?: string;
  enabled?: boolean;
}

export function usePostFeed({
  context,
  page = 1,
  limit = 20,
  filters,
  searchQuery,
  enabled = true,
}: UsePostFeedOptions) {
  // ESA FIX: Build query key compatible with default queryFn
  const queryKey = useMemo(
    () => {
      const baseUrl = context.type === 'feed' ? '/api/posts/feed' : 
                      context.type === 'group' ? `/api/groups/${context.groupId}/posts` :
                      context.type === 'profile' ? `/api/users/${context.userId}/posts` :
                      `/api/events/${context.eventId}/posts`;
      
      const params: any = {
        page,
        limit,
        filter: filters?.filterType || 'all',
      };
      
      if (filters?.tags?.length) params.tags = filters.tags.join(',');
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (searchQuery) params.search = searchQuery;
      
      return [baseUrl, params];
    },
    [context, page, limit, filters, searchQuery]
  );

  const query = useQuery<any>({
    queryKey,
    enabled,
    staleTime: 0, // Always fetch fresh data
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 min
    refetchOnMount: true, // ESA DEBUG: Force refetch on mount
    refetchOnWindowFocus: false,
    // Use default queryFn from queryClient - it handles the [url, params] format
  });

  // ESA DEBUG: Log query state changes
  console.log('🔍 [usePostFeed] Query state:', {
    context,
    queryKey,
    enabled,
    status: query.status,
    fetchStatus: query.fetchStatus,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    postsCount: query.data?.posts?.length ?? 0,
    rawData: query.data,
    error: query.error
  });

  return {
    posts: query.data?.posts ?? [],
    hasMore: query.data?.hasMore ?? false,
    total: query.data?.total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// usePostMutations Hook - Optimistic Updates
// ============================================================================

export function usePostMutations(context?: FeedContext) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Context-aware invalidation
  const invalidatePostQueries = useCallback(() => {
    if (!context) {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      return;
    }

    switch (context.type) {
      case 'feed':
        queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
        break;
      case 'group':
        queryClient.invalidateQueries({ queryKey: ['/api/groups', context.groupId, 'posts'] });
        break;
      case 'profile':
        queryClient.invalidateQueries({ queryKey: ['/api/users', context.userId, 'posts'] });
        break;
      case 'event':
        queryClient.invalidateQueries({ queryKey: ['/api/events', context.eventId, 'posts'] });
        break;
    }
  }, [context, queryClient]);

  // Like mutation with optimistic update
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      invalidatePostQueries();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content, mentions }: { 
      postId: number; 
      content: string; 
      mentions?: string[] 
    }) => {
      return apiRequest(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, mentions }),
      });
    },
    onSuccess: () => {
      invalidatePostQueries();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      invalidatePostQueries();
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  return {
    likePost: likeMutation.mutate,
    addComment: commentMutation.mutate,
    deletePost: deleteMutation.mutate,
    isLiking: likeMutation.isPending,
    isCommenting: commentMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
