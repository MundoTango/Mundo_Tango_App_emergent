import React, { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next';;
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Search, X, Tag, Filter, Sparkles, Users, Globe, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EnhancedPostItem from './EnhancedPostItem';
import { withPerformance, useDebounce } from '@/lib/performance';

interface Post {
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
    friendshipStatus?: "accepted" | "pending" | "none" | "following";
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

interface EnhancedPostFeedProps {
  className?: string;
  posts?: Post[]; // ESA Framework: Accept posts from parent component
  currentUserId?: string; // ESA Framework Layer 4: Current user ID
  filters?: {
    filterType: 'all' | 'following' | 'nearby';
    tags: string[];
    visibility: 'all' | 'public' | 'friends' | 'private';
    location?: {lat: number;lng: number;radius: number;};
  };
  onEdit?: (post: any) => void; // ESA Layer 9: Edit handler with rich text editor
}

const EnhancedPostFeed = React.memo(({
  const { t } = useTranslation(); posts: propsPosts, currentUserId, filters, onEdit }: EnhancedPostFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter state
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'nearby'>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // ESA LIFE CEO 61x21 - Use passed posts or fetch memories with filters applied
  const { data: fetchedPosts, isLoading, error } = useQuery({
    queryKey: ['/api/posts/feed', filters?.filterType, filters?.tags, filters?.visibility, filters?.location],
    enabled: !propsPosts, // ESA Framework: Only fetch if posts not provided from parent
    queryFn: async () => {
      const params = new URLSearchParams();

      // Apply filter type
      if (filters?.filterType && filters.filterType !== 'all') {
        params.append('filter', filters.filterType);
      }

      // Apply tags
      if (filters?.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      // Apply visibility
      if (filters?.visibility && filters.visibility !== 'all') {
        params.append('visibility', filters.visibility);
      }

      // Apply location for nearby filter
      if (filters?.location) {
        params.append('lat', filters.location.lat.toString());
        params.append('lng', filters.location.lng.toString());
        params.append('radius', filters.location.radius.toString());
      }

      const response = await fetch(`/api/posts/feed?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch memories');
      }

      const result = await response.json();
      const memories = result.data || [];

      // ESA LIFE CEO 61x21 - Process ALL media fields from memories
      return memories.map((memory: any) => {
        // Processing memory media fields

        // CRITICAL FIX: Check mediaEmbeds FIRST (primary source)
        if (memory.mediaEmbeds && memory.mediaEmbeds.length > 0) {
          const firstMedia = memory.mediaEmbeds[0];
          // ESA Framework Layer 13: Type-safe media URL processing
          const isVideo = firstMedia && typeof firstMedia === 'string' && (
          firstMedia.toLowerCase().includes('.mp4') ||
          firstMedia.toLowerCase().includes('.mov') ||
          firstMedia.toLowerCase().includes('.webm') ||
          firstMedia.toLowerCase().includes('.avi') ||
          firstMedia.toLowerCase().includes('.m4v') ||
          firstMedia.toLowerCase().includes('.mkv'));


          // Set imageUrl or videoUrl based on file type
          if (isVideo) {
            memory.videoUrl = firstMedia;
          } else {
            memory.imageUrl = firstMedia;
          }
        }
        // Fallback to mediaUrls if no mediaEmbeds
        else if (memory.mediaUrls && memory.mediaUrls.length > 0) {
          const firstMedia = memory.mediaUrls[0];
          // ESA Framework Layer 13: Type-safe media URL processing
          const isVideo = firstMedia && typeof firstMedia === 'string' && (
          firstMedia.toLowerCase().includes('.mp4') ||
          firstMedia.toLowerCase().includes('.mov') ||
          firstMedia.toLowerCase().includes('.webm') ||
          firstMedia.toLowerCase().includes('.avi') ||
          firstMedia.toLowerCase().includes('.m4v') ||
          firstMedia.toLowerCase().includes('.mkv'));


          // Set imageUrl or videoUrl based on file type
          if (isVideo) {
            memory.videoUrl = firstMedia;
          } else {
            memory.imageUrl = firstMedia;
          }
        }

        // Media processing complete

        return memory;
      });
    }
  });

  // ESA Framework: Use passed posts from parent or fetched posts
  const posts = propsPosts || fetchedPosts || [];

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (postId: number) => apiRequest(`/api/posts/${postId}/like`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: () => {
      toast({
        title: t('states.error', 'Error'),
        description: "Failed to like post",
        variant: "destructive"
      });
    }
  });

  const handleLike = useCallback((postId: number) => {
    likeMutation.mutate(postId);
  }, [likeMutation]);

  const handleShare = useCallback((post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.name}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${post.content}\n\n- ${post.user.name} (@${post.user.username})`);
      toast({
        title: "Copied!",
        description: "Post content copied to clipboard"
      });
    }
  }, [toast]);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !filterTags.includes(tagInput.trim())) {
      setFilterTags([...filterTags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, filterTags]);

  const removeTag = useCallback((tag: string) => {
    setFilterTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const getFilterIcon = (filter: string) => {
    switch (filter) {
      case 'all':return <Globe className="h-4 w-4" />;
      case 'following':return <Users className="h-4 w-4" />;
      case 'nearby':return <MapPin className="h-4 w-4" />;
      default:return <Filter className="h-4 w-4" />;
    }
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'all':return 'All Posts';
      case 'following':return 'Following';
      case 'nearby':return 'Nearby';
      default:return filter;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) =>
        <div key={i} className="bg-[var(--color-surface)] dark:bg-gray-900/60 rounded-3xl p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/5"></div>
            </div>
          </div>
        )}
      </div>);

  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filter Section */}
      <section className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100/50 shadow-lg">
        {/* Filter Type Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-indigo-700">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filter Memories</span>
          </div>
          <div className="h-px bg-indigo-200 flex-1"></div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'following', 'nearby'].map((filter) =>
          <button
            key={filter}
            onClick={() => setFilterBy(filter as any)} aria-label="Button"
            className={`
                flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300
                ${filterBy === filter ?
            'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200/50 scale-105' :
            'bg-[var(--color-surface)] dark:bg-gray-900/70 text-indigo-700 hover:bg-[var(--color-surface)] dark:bg-gray-900/90 hover:scale-105 border border-indigo-200/50'}
              `
            } data-testid="button-element">

              {getFilterIcon(filter)}
              <span className="capitalize">{getFilterLabel(filter)}</span>
            </button>
          )}
        </div>

        {/* Enhanced Tag Filter */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-indigo-700">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Filter by Tags</span>
            </div>
          </div>

          {/* Tag Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)} aria-label="Input field"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag to filter memories..."
                className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] dark:bg-gray-900/80 border border-indigo-200/50 rounded-2xl text-[var(--color-text)] dark:text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all" data-testid="input-text" />

            </div>
            <button
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300" data-testid="button-px-6" aria-label="Button">

              Add
            </button>
          </div>

          {/* Active Tags */}
          {filterTags.length > 0 &&
          <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-indigo-700">Active filters:</span>
              {filterTags.map((tag) =>
            <span
              key={tag}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] dark:bg-gray-900/90 border border-indigo-200 rounded-full text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors">

                  #{tag}
                  <button
                onClick={() => removeTag(tag)} aria-label="Button"
                className="p-0.5 hover:bg-indigo-200 rounded-full transition-colors" data-testid="button-p-0-5">

                    <X className="h-3 w-3" />
                  </button>
                </span>
            )}
            </div>
          }
        </div>
      </section>

      {/* Enhanced Posts Feed */}
      <section className="space-y-8">

        {posts && posts.length > 0 ?
        <>
            {/* Feed Header with View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)] dark:text-white">
                    {filterBy === 'all' ? 'All Posts' :
                  filterBy === 'following' ? 'Following' :
                  'Nearby Memories'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {posts.length} {posts.length === 1 ? 'memory' : 'memories'} found
                  </p>
                </div>
              </div>

            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {posts.map((post: Post) =>
            <EnhancedPostItem
              key={post.id}
              post={post}
              onLike={handleLike}
              onShare={handleShare}
              onEdit={onEdit} // ESA Layer 9: Pass edit handler
            />
            )}
            </div>
          </> : (

        /* Enhanced Empty State */
        <div className="text-center py-16 px-8">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] dark:text-white mb-4">No memories found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {filterTags.length > 0 ?
              'Try removing some filters or create a new memory with these tags.' :
              'Be the first to share a tango memory! Your moments help build our community.'
              }
              </p>
              {filterTags.length > 0 &&
            <button
              onClick={() => setFilterTags([])} aria-label="Button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300" data-testid="button-inline-flex">

                  <X className="h-4 w-4" />
                  Clear filters
                </button>
            }
            </div>
          </div>)
        }
      </section>
    </div>);

});

// Add display name for React DevTools
EnhancedPostFeed.displayName = 'EnhancedPostFeed';

export default EnhancedPostFeed;