/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK
 * Unified Post Feed Component - Consolidates all feed implementations
 * Layer 9: UI Framework Agent - Single responsibility, resilient architecture
 * Layer 2: API Structure Agent - Consistent data contracts
 */

import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, Search, X, Tag, Filter, Sparkles, Users, Globe, 
  MapPin, MessageCircle, Share2, MoreVertical 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EnhancedPostItem from './EnhancedPostItem';
import ShareModal from '@/components/modern/ShareModal';
import { useDebounce } from '@/lib/performance';

// ESA Framework: Unified Post interface with proper friendship data
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

interface FilterOptions {
  filterType?: 'all' | 'following' | 'nearby';
  tags?: string[];
  visibility?: 'all' | 'public' | 'friends' | 'private';
  location?: { lat: number; lng: number; radius: number };
}

// ESA Framework: Feed context for data source identification
type FeedContext = 
  | { type: 'feed' } // Main memories feed (/api/posts/feed)
  | { type: 'group'; groupId: number; filter?: 'all' | 'residents' | 'visitors' | 'members' | 'non-members' | 'friends' } // Group feed
  | { type: 'profile'; userId: number } // User profile feed
  | { type: 'event'; eventId: number }; // Event feed

interface PostFeedProps {
  // Legacy: Direct posts prop (for backward compatibility during migration)
  posts?: Post[];
  
  // New: Context-based data fetching (smart mode)
  context?: FeedContext;
  
  showFilters?: boolean;  // Show filter buttons (All/Following/Nearby)
  showSearch?: boolean;   // Show search bar
  filters?: FilterOptions;
  currentUserId?: string;
  onEdit?: (post: Post) => void;
  className?: string;
  
  // Legacy pagination props (removed when context is used)
  onLoadMore?: () => void;
  hasMore?: boolean;
}

/**
 * ESA LIFE CEO 61×21 - Post Feed Component
 * Layer 9: UI Framework - Single responsibility, configurable features
 * Supports both legacy controlled mode (posts prop) and new smart mode (context prop)
 */
const PostFeed = memo(({ 
  posts: propsPosts,
  context,
  showFilters = false,
  showSearch = false,
  filters: externalFilters,
  currentUserId,
  onEdit,
  className = '',
  onLoadMore,
  hasMore: externalHasMore = false
}: PostFeedProps) => {
  console.log('[Framework] PostFeed rendering:', { 
    mode: context ? 'smart' : 'controlled',
    context, 
    propsPosts: propsPosts?.length, 
    showFilters, 
    showSearch 
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Internal pagination state (used in smart mode)
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [internalHasMore, setInternalHasMore] = useState(true);

  // Internal filter state
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'nearby'>(
    externalFilters?.filterType || 'all'
  );
  const [filterTags, setFilterTags] = useState<string[]>(externalFilters?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Share modal state
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Merge external and internal filters
  const activeFilters = useMemo(() => ({
    filterType: externalFilters?.filterType || filterBy,
    tags: externalFilters?.tags || filterTags,
    visibility: externalFilters?.visibility || 'all',
    location: externalFilters?.location,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  }), [externalFilters, filterBy, filterTags, startDate, endDate]);

  // ESA Framework: Context-aware query key generation
  const getQueryKey = useCallback(() => {
    if (!context) {
      return ['/api/posts/feed', activeFilters, debouncedSearch];
    }
    
    switch (context.type) {
      case 'feed':
        return ['/api/posts/feed', page, activeFilters, debouncedSearch];
      case 'group':
        return ['/api/groups', context.groupId, 'posts', context.filter || 'all', page];
      case 'profile':
        return ['/api/users', context.userId, 'posts', page];
      case 'event':
        return ['/api/events', context.eventId, 'posts', page];
      default:
        return ['/api/posts/feed', page];
    }
  }, [context, page, activeFilters, debouncedSearch]);

  // ESA Framework: Context-aware API URL builder
  const buildFetchUrl = useCallback(() => {
    if (!context) {
      // Legacy: Original feed fetching
      const params = new URLSearchParams();
      if (activeFilters.filterType !== 'all') params.append('filter', activeFilters.filterType);
      if (activeFilters.tags.length > 0) params.append('tags', activeFilters.tags.join(','));
      if (activeFilters.visibility !== 'all') params.append('visibility', activeFilters.visibility);
      if (activeFilters.location) {
        params.append('lat', activeFilters.location.lat.toString());
        params.append('lng', activeFilters.location.lng.toString());
        params.append('radius', activeFilters.location.radius.toString());
      }
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
      if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
      return `/api/posts/feed?${params.toString()}`;
    }
    
    // Context-based URL building
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '20');
    
    switch (context.type) {
      case 'feed': {
        if (activeFilters.filterType !== 'all') params.append('filter', activeFilters.filterType);
        if (activeFilters.tags.length > 0) params.append('tags', activeFilters.tags.join(','));
        if (debouncedSearch) params.append('search', debouncedSearch);
        return `/api/posts/feed?${params.toString()}`;
      }
      case 'group': {
        if (context.filter && context.filter !== 'all') {
          return `/api/groups/${context.groupId}/posts/filter/${context.filter}?${params.toString()}`;
        }
        return `/api/groups/${context.groupId}/posts?${params.toString()}`;
      }
      case 'profile':
        return `/api/users/${context.userId}/posts?${params.toString()}`;
      case 'event':
        return `/api/events/${context.eventId}/posts?${params.toString()}`;
      default:
        return `/api/posts/feed?${params.toString()}`;
    }
  }, [context, page, activeFilters, debouncedSearch]);

  // ESA Framework: Fetch posts with resilient query
  const { data: fetchedResponse, isLoading, error, isFetching } = useQuery({
    queryKey: getQueryKey(),
    enabled: !propsPosts, // Fetch when no posts prop provided (smart mode)
    queryFn: async () => {
      const url = buildFetchUrl();
      console.log('[Framework] Fetching posts:', { url, context, page });

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('[Framework] Fetched posts:', {
        context: context?.type,
        count: data.data?.length || data.posts?.length || 0,
        page,
        hasSuccess: data.success
      });

      // Handle different response formats
      // Groups API returns: { success: true, data: [...] }
      // Feed API returns: { data: [...] } or { posts: [...] }
      const posts = data.data || data.posts || [];
      return { posts, hasMore: posts.length === 20 };
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // ESA Framework: Handle pagination for context mode
  useEffect(() => {
    if (!context || !fetchedResponse?.posts) return;
    
    if (page === 1) {
      setAllPosts(fetchedResponse.posts);
    } else {
      setAllPosts(prev => [...prev, ...fetchedResponse.posts]);
    }
    
    setInternalHasMore(fetchedResponse.hasMore);
    console.log('[Framework] Posts updated:', { page, count: fetchedResponse.posts.length, hasMore: fetchedResponse.hasMore });
  }, [fetchedResponse, page, context]);

  // Reset pagination when context changes
  useEffect(() => {
    if (context) {
      setPage(1);
      setAllPosts([]);
      setInternalHasMore(true);
    }
  }, [context?.type, context?.type === 'group' ? context.groupId : null, context?.type === 'group' ? context.filter : null]);

  // ESA Framework: Reset pagination when filters or search change
  useEffect(() => {
    if (context) {
      console.log('[Framework] Filters/search changed - resetting pagination');
      setPage(1);
      setAllPosts([]);
      setInternalHasMore(true);
    }
  }, [activeFilters.filterType, activeFilters.tags, activeFilters.visibility, activeFilters.startDate, activeFilters.endDate, debouncedSearch, context]);

  // ESA Framework: Use provided posts (controlled) or fetched posts (smart mode)
  const posts = useMemo(() => {
    if (propsPosts) {
      // Controlled mode: Use provided posts
      return propsPosts;
    }
    if (context) {
      // Smart mode: Use accumulated posts with pagination
      return allPosts;
    }
    // Legacy mode: Direct fetch result
    return fetchedResponse?.posts || [];
  }, [propsPosts, context, allPosts, fetchedResponse]);

  // Determine hasMore based on mode
  const hasMore = context ? internalHasMore : externalHasMore;

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (context) {
      // Smart mode: Increment internal page
      setPage(prev => prev + 1);
    } else if (onLoadMore) {
      // Controlled mode: Call parent handler
      onLoadMore();
    }
  }, [context, onLoadMore]);

  // ESA Framework: Context-aware query invalidation helper
  const invalidateContextQueries = useCallback(() => {
    if (!context) {
      // Legacy: Invalidate feed queries
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      return;
    }
    
    // Context-aware invalidation
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

  // Debug log posts data
  useEffect(() => {
    if (posts && posts.length > 0) {
      console.log('[ESA UnifiedFeed] Current posts with friendship status:', posts.slice(0, 3).map((p: Post) => ({
        postId: p.id,
        userName: p.user?.name,
        userId: p.user?.id,
        friendshipStatus: p.user?.friendshipStatus
      })));
    }
  }, [posts]);

  // Filter posts locally if search is active without filters
  const filteredPosts = useMemo(() => {
    if (!showFilters && debouncedSearch) {
      return posts.filter((post: Post) => 
        post.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.user?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    return posts;
  }, [posts, debouncedSearch, showFilters]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      return apiRequest(isLiked ? `/api/posts/${postId}/unlike` : `/api/posts/${postId}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      invalidateContextQueries(); // Context-aware invalidation
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const handleLike = useCallback((postId: number) => {
    const post = filteredPosts.find((p: Post) => p.id === postId);
    const isLiked = post?.isLiked || false;
    likeMutation.mutate({ postId, isLiked });
  }, [likeMutation, filteredPosts]);

  const handleShare = useCallback((post: Post) => {
    setShareModalPost(post);
    setIsShareModalOpen(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setShareModalPost(null);
  }, []);

  // Tag management
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !filterTags.includes(tagInput.trim())) {
      setFilterTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, filterTags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setFilterTags(prev => prev.filter(t => t !== tag));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 animate-pulse border border-gray-200/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-lg w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-lg w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-4/5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters Section - Shown when showFilters or showSearch is true */}
      {(showFilters || showSearch) && (
        <div className="relative group bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50 shadow-lg">
          {/* Search Bar */}
          {showSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          )}

          {/* Filter Toggle */}
          {showFilters && (
          <button
            onClick={() => setShowExpandedFilters(!showExpandedFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          )}

          {/* Expanded Filters */}
          {showFilters && showExpandedFilters && (
            <div className="mt-4 space-y-4">
              {/* Filter Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    filterBy === 'all'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="h-4 w-4 inline mr-2" />
                  All
                </button>
                <button
                  onClick={() => setFilterBy('following')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    filterBy === 'following'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Following
                </button>
                <button
                  onClick={() => setFilterBy('nearby')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    filterBy === 'nearby'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Nearby
                </button>
              </div>

              {/* Tag Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterTags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-teal-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..."
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Date Range</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* COMING SOON Overlay - Filters/Search Disabled */}
          <div className="absolute inset-0 bg-cyan-500/30 rounded-3xl cursor-not-allowed z-10 pointer-events-auto border border-cyan-500/50">
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              COMING SOON
            </span>
          </div>
        </div>
      )}

      {/* Posts Feed Header */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {activeFilters.filterType === 'following' ? 'Following' : 
                 activeFilters.filterType === 'nearby' ? 'Nearby' : 'All'} Posts
              </h2>
              <p className="text-gray-600">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                {activeFilters.tags.length > 0 && (
                  <span className="ml-2 text-teal-600">
                    • Filtered by {activeFilters.tags.length} {activeFilters.tags.length !== 1 ? 'tags' : 'tag'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.map((post: Post) => (
          <EnhancedPostItem
            key={post.id}
            post={post}
            currentUserId={user?.id?.toString()} // ESA Framework Layer 4: Pass authenticated user ID
            onLike={handleLike}
            onShare={handleShare}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Load More */}
      {onLoadMore && hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Load More
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 && !isLoading && (
        <div className="text-center py-16 px-8">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Memories Yet</h3>
            <p className="text-gray-600 leading-relaxed">
              {activeFilters.filterType === 'following' 
                ? "No posts from people you're following yet. Start following dancers to see their posts here!"
                : activeFilters.filterType === 'nearby'
                ? "No nearby posts found. Try expanding your search radius or check back later."
                : activeFilters.tags.length > 0
                ? `No posts found with the tags: ${activeFilters.tags.map(tag => `#${tag}`).join(', ')}`
                : debouncedSearch
                ? `No posts matching "${debouncedSearch}"`
                : "Share your first tango moment to start building beautiful memories!"
              }
            </p>
          </div>
        </div>
      )}

      {/* ShareModal */}
      {shareModalPost && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={handleCloseShareModal}
          post={shareModalPost}
        />
      )}
    </div>
  );
});

PostFeed.displayName = 'PostFeed';

// ESA Framework: Direct export without performance wrapper to fix lazy-loading issue
export default PostFeed;