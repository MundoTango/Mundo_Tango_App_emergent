/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK
 * Unified Post Feed Component - Consolidates all feed implementations
 * Layer 9: UI Framework Agent - Single responsibility, resilient architecture
 * Layer 2: API Structure Agent - Consistent data contracts
 */

import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next';;
import { useAuth } from '@/contexts/auth-context'; // ESA Framework Layer 4: Use canonical auth context
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, Search, X, Tag, Filter, Sparkles, Users, Globe, 
  MapPin, MessageCircle, Share2, MoreVertical, Home, Plane 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EnhancedPostItem from './EnhancedPostItem';
import ShareModal from '@/components/modern/ShareModal';
import { useDebounce } from '@/lib/performance';
import { GlassCard } from '@/components/glass/GlassComponents';


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
  filterType?: 'all' | 'residents' | 'visitors' | 'friends';
  tags?: string[];
  visibility?: 'all' | 'public' | 'friends' | 'private';
  location?: { lat: number; lng: number; radius: number };
}

// ESA Framework: Feed context for data source identification
type FeedContext = 
  | { type: 'feed' } // Main memories feed (/api/posts/feed)
  | { type: 'group'; groupId: number; filter?: 'all' | 'residents' | 'visitors' | 'members' | 'non-members' | 'friends' } // Group feed
  | { type: 'profile'; userId: number } // User profile feed
  | { type: 'event'; eventId: number; filter?: 'all' | 'participants' | 'guests' }; // Event feed

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
  const { t } = useTranslation(); 
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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ESA Layer 9: Track initial mount to prevent premature filter resets
  const isInitialMount = useRef(true);
  
  
  // Internal pagination state (used in smart mode)
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [internalHasMore, setInternalHasMore] = useState(true);

  // Internal filter state
  const [filterBy, setFilterBy] = useState<'all' | 'residents' | 'visitors' | 'friends'>(
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
        return ['/api/events', context.eventId, 'posts', context.filter || 'all', page];
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
      const url = `/api/posts/feed?${params.toString()}`;
      console.log('🔍 [PostFeed] Building URL (legacy mode):', url, 'Filter:', activeFilters.filterType);
      return url;
    }
    
    // Context-based URL building
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '20');
    
    let url = '';
    switch (context.type) {
      case 'feed': {
        if (activeFilters.filterType !== 'all') params.append('filter', activeFilters.filterType);
        if (activeFilters.tags.length > 0) params.append('tags', activeFilters.tags.join(','));
        if (debouncedSearch) params.append('search', debouncedSearch);
        url = `/api/posts/feed?${params.toString()}`;
        console.log('🔍 [PostFeed] Building URL (feed context):', url, 'Filter:', activeFilters.filterType);
        return url;
      }
      case 'group': {
        if (context.filter && context.filter !== 'all') {
          params.append('filter', context.filter);
        }
        url = `/api/groups/${context.groupId}/posts?${params.toString()}`;
        console.log('🔍 [PostFeed] Building URL (group context):', url);
        return url;
      }
      case 'profile':
        url = `/api/users/${context.userId}/posts?${params.toString()}`;
        console.log('🔍 [PostFeed] Building URL (profile context):', url);
        return url;
      case 'event': {
        if (context.filter && context.filter !== 'all') {
          params.append('filter', context.filter);
        }
        url = `/api/events/${context.eventId}/posts?${params.toString()}`;
        console.log('🔍 [PostFeed] Building URL (event context):', url);
        return url;
      }
      default:
        url = `/api/posts/feed?${params.toString()}`;
        console.log('🔍 [PostFeed] Building URL (default):', url);
        return url;
    }
  }, [context, page, activeFilters, debouncedSearch]);

  // ESA Framework: Fetch posts with resilient query
  const { data: fetchedResponse, isLoading, error, isFetching } = useQuery({
    queryKey: getQueryKey(),
    enabled: !propsPosts, // Fetch when no posts prop provided (smart mode)
    queryFn: async () => {
      try {
        const url = buildFetchUrl();
        console.log('🌐 [PostFeed] Fetching posts from:', url);
        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        console.log('📡 [PostFeed] Response status:', response.status, response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [PostFeed] Fetch failed:', response.status, response.statusText, errorText);
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [PostFeed] Received data:', { 
          postsCount: (data.data || data.posts || []).length,
          hasData: !!data.data,
          hasPosts: !!data.posts,
          dataKeys: Object.keys(data),
          rawData: data
        });
        
        // Handle different response formats
        // Groups API returns: { success: true, data: [...] }
        // Feed API returns: { posts: [...], hasMore, page, total }
        const posts = data.data || data.posts || [];
        console.log('📊 [PostFeed] Returning', posts.length, 'posts, hasMore:', posts.length === 20);
        return { posts, hasMore: posts.length === 20 };
      } catch (err) {
        console.error('💥 [PostFeed] Query function error:', err);
        throw err;
      }
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: false, // Disable retry to see errors faster
  });
  
  // Log query state
  useEffect(() => {
    console.log('🔄 [PostFeed] Query state:', { isLoading, isFetching, hasError: !!error, hasData: !!fetchedResponse });
    if (error) {
      console.error('🚨 [PostFeed] Query error:', error);
    }
  }, [isLoading, isFetching, error, fetchedResponse]);
  
  // ESA Framework: Handle pagination for context mode
  useEffect(() => {
    if (!context || !fetchedResponse?.posts) {
      console.log('⚠️ [PostFeed] Skipping allPosts update:', { hasContext: !!context, hasPosts: !!fetchedResponse?.posts });
      return;
    }
    
    console.log('📝 [PostFeed] Setting allPosts:', { 
      page, 
      newPostsCount: fetchedResponse.posts.length,
      firstPostId: fetchedResponse.posts[0]?.id,
      contextType: fetchedResponse.posts[0]?.contextType 
    });
    
    if (page === 1) {
      setAllPosts(fetchedResponse.posts);
    } else {
      setAllPosts(prev => [...prev, ...fetchedResponse.posts]);
    }
    
    setInternalHasMore(fetchedResponse.hasMore);
  }, [fetchedResponse, page]);

  // Reset pagination when context changes
  const contextKey = useMemo(() => {
    if (!context) return 'no-context';
    if (context.type === 'feed') return 'feed';
    if (context.type === 'group') return `group-${context.groupId}-${context.filter || 'all'}`;
    if (context.type === 'profile') return `profile-${context.userId}`;
    if (context.type === 'event') return `event-${context.eventId}-${context.filter || 'all'}`;
    return 'unknown';
  }, [context]);

  const prevContextKeyRef = useRef<string>(contextKey);

  useEffect(() => {
    if (!context || contextKey === prevContextKeyRef.current) {
      return;
    }
    
    console.log('🔄 [PostFeed] Context changed:', { old: prevContextKeyRef.current, new: contextKey });
    prevContextKeyRef.current = contextKey;
    
    setPage(1);
    setAllPosts([]);
    setInternalHasMore(true);
  }, [contextKey]);

  // ESA Framework: Reset pagination when filters or search change
  useEffect(() => {
    // ESA Layer 9: Skip on initial mount to prevent clearing posts before they're fetched
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    console.log('🔄 [PostFeed] Filter changed! New filter:', activeFilters.filterType, 'Tags:', activeFilters.tags, 'Search:', debouncedSearch);
    
    if (context) {
      setPage(1);
      // ESA 61×21 Pattern: Don't clear posts - let React Query refetch naturally
      // The query key depends on activeFilters, so it will auto-refetch
      // Posts stay visible during transition for smooth UX
      setInternalHasMore(true);
    }
  }, [activeFilters.filterType, activeFilters.tags.join(','), activeFilters.visibility, activeFilters.startDate, activeFilters.endDate, debouncedSearch]);

  // ESA Framework: Use provided posts (controlled) or fetched posts (smart mode)
  const posts = useMemo(() => {
    let result;
    if (propsPosts) {
      // Controlled mode: Use provided posts
      result = propsPosts;
    } else if (context) {
      // Smart mode: Use accumulated posts with pagination
      result = allPosts;
    } else {
      // Legacy mode: Direct fetch result
      result = fetchedResponse?.posts || [];
    }
    
    console.log('📋 [PostFeed] Posts memo updated:', { 
      mode: propsPosts ? 'controlled' : context ? 'smart' : 'legacy',
      count: result.length,
      firstPostId: result[0]?.id,
      filterType: activeFilters.filterType
    });
    
    return result;
  }, [propsPosts, context, allPosts, fetchedResponse, activeFilters.filterType]);

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
      const filtered = posts.filter((post: Post) => 
        post.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.user?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      console.log('[DEBUG] Filtered to', filtered.length, 'posts');
      return filtered;
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
        title: {t('states.error', 'Error')},
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
          <GlassCard depth={1} className="rounded-3xl p-8 animate-pulse border border-[var(--color-border)]/50">
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
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters Section - Shown when showFilters or showSearch is true */}
      {(showFilters || showSearch) && (
        <GlassCard depth={1} className="relative group rounded-3xl p-6 border border-[var(--color-border)]/50 shadow-lg">
          {/* Search Bar */}
          {showSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) = aria-label="Input field"> setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] dark:bg-gray-900/80 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() = aria-label="Button"> setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>
          )}

          {/* Filter Toggle */}
          {showFilters && (
          <button
            onClick={() = aria-label="Button"> setShowExpandedFilters(!showExpandedFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          )}

          {/* Expanded Filters */}
          {showFilters && showExpandedFilters && (
            <div className="mt-4 space-y-4">
              {/* Filter Type - DISABLED with Coming Soon overlay */}
              <div className="relative group">
                <div className="flex gap-2">
                  <button
                    onClick={() = aria-label="Button"> setFilterBy('all')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'all'
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-cyan-600 text-white'
                        : 'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] hover:bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Globe className="h-4 w-4 inline mr-2" />
                    All Posts
                  </button>
                  <button
                    onClick={() = aria-label="Button"> setFilterBy('residents')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'residents'
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-cyan-600 text-white'
                        : 'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] hover:bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Home className="h-4 w-4 inline mr-2" />
                    Residence
                  </button>
                  <button
                    onClick={() = aria-label="Button"> setFilterBy('visitors')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'visitors'
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-cyan-600 text-white'
                        : 'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] hover:bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Plane className="h-4 w-4 inline mr-2" />
                    Visitor
                  </button>
                  <button
                    onClick={() = aria-label="Button"> setFilterBy('friends')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'friends'
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-cyan-600 text-white'
                        : 'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] hover:bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Friends
                  </button>
                </div>
                
                {/* COMING SOON Overlay - Relationship Filters Disabled */}
                <div className="absolute inset-0 bg-[var(--color-primary)]/30 rounded-xl cursor-not-allowed z-10 pointer-events-auto border border-cyan-500/50">
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    COMING SOON
                  </span>
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">Filter by Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterTags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[var(--color-ocean-100)] text-[var(--color-primary-hover)] rounded-full text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() = aria-label="Button"> handleRemoveTag(tag)}
                        className="ml-1 hover:text-teal-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) = aria-label="Input field"> setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..."
                    className="px-3 py-1 bg-[var(--color-neutral-100)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">Date Range</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 block">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) = aria-label="Input field"> setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-surface)] dark:bg-gray-900 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-300 mb-1 block">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) = aria-label="Input field"> setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-surface)] dark:bg-gray-900 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() = aria-label="Button"> {
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
          <div className="absolute inset-0 bg-[var(--color-primary)]/30 rounded-3xl cursor-not-allowed z-10 pointer-events-auto border border-cyan-500/50">
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              COMING SOON
            </span>
          </div>
        </GlassCard>
      )}

      {/* Posts Feed Header */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-cyan-600 rounded-xl">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {activeFilters.filterType === 'residents' ? 'Residence' : 
                 activeFilters.filterType === 'visitors' ? 'Visitor' :
                 activeFilters.filterType === 'friends' ? 'Friends' : 'All'} Posts
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                {activeFilters.tags.length > 0 && (
                  <span className="ml-2 text-[var(--color-primary-hover)]">
                    • Filtered by {activeFilters.tags.length} {activeFilters.tags.length !== 1 ? 'tags' : 'tag'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="relative space-y-6">
        {/* Loading Overlay during filter transitions */}
        {isFetching && filteredPosts.length > 0 && (
          <GlassCard depth={1} className="absolute inset-0 z-10 flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-3 bg-[var(--color-surface)] dark:bg-gray-900 px-6 py-3 rounded-full shadow-lg">
              <div className="animate-spin h-5 w-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Updating feed...</span>
            </div>
          </GlassCard>
        )}

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
            className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
           aria-label="Button">
            Load More
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 && !isLoading && !isFetching && (
        <div className="text-center py-16 px-8">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-text)] dark:text-white mb-4">No Memories Yet</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {activeFilters.filterType === 'residents' 
                ? "No posts from residents in your city yet. Check back later!"
                : activeFilters.filterType === 'visitors'
                ? "No posts from visitors found. Check back when travelers visit your city!"
                : activeFilters.filterType === 'friends'
                ? "No posts from your friends yet. Connect with more dancers to see their posts here!"
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