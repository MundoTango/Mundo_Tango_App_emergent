/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK - Phase 2 Data Layer
 * PostFeed V2 - Clean Architecture using Centralized Data Hooks
 * 
 * REPLACES: PostFeed.tsx (882 lines → ~200 lines)
 * USES: client/src/data/posts.ts for all data operations
 * 
 * Key Improvements:
 * - ✅ Single responsibility (UI only, no data fetching logic)
 * - ✅ Single transformation pipeline (5 layers → 1 layer)
 * - ✅ Centralized React Query logic
 * - ✅ No stale closures or dual-mode complexity
 * 
 * @see docs/pages/esa-architecture/brittleness-refactoring.md
 * Rollback: git checkout 9d28e7b198cd013fec20bd7be72d0311ea56d1a1
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Tag, Filter, Globe, Home, Plane, Users } from 'lucide-react';
import { useDebounce } from '@/lib/performance';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import EnhancedPostItem from './EnhancedPostItem';
import ShareModal from '@/components/modern/ShareModal';
import { 
  usePostFeed, 
  usePostMutations, 
  Post, 
  FeedContext,
  FilterOptions
} from '@/data/posts';

interface PostFeedV2Props {
  context: FeedContext;
  showFilters?: boolean;
  showSearch?: boolean;
  onEdit?: (post: Post) => void;
  className?: string;
}

/**
 * PostFeed V2 Component
 * Clean, single-responsibility architecture with centralized data layer
 */
export default function PostFeedV2({ 
  context,
  showFilters = false,
  showSearch = false,
  onEdit,
  className = '',
}: PostFeedV2Props) {
  const { t } = useTranslation();
  
  // Local UI state (no data management!)
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'residents' | 'visitors' | 'friends'>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Scroll reveal animation
  useScrollReveal('.post-item', {
    opacity: 0,
    y: 20,
  });

  // Build filter options
  const filters: FilterOptions = useMemo(() => ({
    filterType: filterBy,
    tags: filterTags,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [filterBy, filterTags, startDate, endDate]);

  // Data layer hooks - ALL data logic centralized
  const { 
    posts, 
    hasMore, 
    isLoading, 
    isFetching,
    refetch 
  } = usePostFeed({
    context,
    page,
    limit: 20,
    filters,
    searchQuery: debouncedSearch,
  });

  const { 
    likePost, 
    addComment, 
    deletePost,
    isLiking,
    isCommenting,
    isDeleting
  } = usePostMutations(context);

  // UI handlers
  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !filterTags.includes(tagInput.trim())) {
      setFilterTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
      setPage(1); // Reset to page 1 when filters change
    }
  }, [tagInput, filterTags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setFilterTags(prev => prev.filter(t => t !== tag));
    setPage(1);
  }, []);

  const handleShare = useCallback((post: Post) => {
    setSharePost(post);
    setShareModalOpen(true);
  }, []);

  const handleLike = useCallback((postId: number) => {
    likePost(postId);
  }, [likePost]);

  const handleDelete = useCallback((postId: number) => {
    if (window.confirm(t('memories.feed.confirmDelete'))) {
      deletePost(postId);
    }
  }, [deletePost, t]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Search & Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 rounded-3xl p-6 relative group">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('memories.feed.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Filter Toggle */}
          {showFilters && (
            <button
              onClick={() => setShowExpandedFilters(!showExpandedFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Filter className="h-4 w-4" />
              <span>{t('memories.feed.filters')}</span>
            </button>
          )}

          {/* Expanded Filters */}
          {showFilters && showExpandedFilters && (
            <div className="mt-4 space-y-4">
              {/* Filter Type Buttons */}
              <div className="relative group">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setFilterBy('all');
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'all'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Globe className="h-4 w-4 inline mr-2" />
                    {t('memories.feed.allPosts')}
                  </button>
                  <button
                    onClick={() => {
                      setFilterBy('residents');
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'residents'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Home className="h-4 w-4 inline mr-2" />
                    {t('memories.feed.residence')}
                  </button>
                  <button
                    onClick={() => {
                      setFilterBy('visitors');
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'visitors'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Plane className="h-4 w-4 inline mr-2" />
                    {t('memories.feed.visitor')}
                  </button>
                  <button
                    onClick={() => {
                      setFilterBy('friends');
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filterBy === 'friends'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    {t('memories.feed.friends')}
                  </button>
                </div>

                {/* COMING SOON Overlay */}
                <div className="absolute inset-0 bg-cyan-500/30 rounded-xl cursor-not-allowed z-10 pointer-events-auto border border-cyan-500/50">
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {t('memories.feed.comingSoon')}
                  </span>
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('memories.feed.filterByTags')}
                  </span>
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
                    placeholder={t('memories.feed.addTag')}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setPage(1);
                    }}
                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                  >
                    {t('memories.feed.clearDates')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* COMING SOON Overlay for entire filter section */}
          <div className="absolute inset-0 bg-cyan-500/30 rounded-3xl cursor-not-allowed z-10 pointer-events-auto border border-cyan-500/50">
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {t('memories.feed.comingSoon')}
            </span>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {isLoading && posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            <p className="mt-4 text-gray-500">{t('memories.feed.loading')}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500">{t('memories.feed.noPosts')}</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className="post-item">
                <EnhancedPostItem
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onShare={() => handleShare(post)}
                  onEdit={onEdit ? () => onEdit(post) : undefined}
                  onDelete={() => handleDelete(post.id)}
                />
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isFetching ? t('memories.feed.loading') : t('memories.feed.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {sharePost && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSharePost(null);
          }}
          post={sharePost}
        />
      )}
    </div>
  );
}
