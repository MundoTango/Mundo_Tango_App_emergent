/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK - Phase 3 Component Split
 * SmartPostFeed - Smart Container Component (Context-Based)
 * 
 * ARCHITECTURE: Smart/Container component pattern
 * - Uses data hooks (usePostFeed, usePostMutations)
 * - Context-aware data fetching
 * - Manages own state
 * - Renders ControlledPostFeed
 * 
 * USE WHEN: You want automatic data fetching based on context
 * 
 * @see docs/pages/esa-architecture/brittleness-refactoring.md
 * Rollback: git checkout 21917df387a4b3234bd03739c5fa6c81e454fcce
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/lib/performance';
import ControlledPostFeed from './ControlledPostFeed';
import { 
  usePostFeed, 
  usePostMutations, 
  Post, 
  FeedContext,
  FilterOptions
} from '@/data/posts';

interface SmartPostFeedProps {
  // Context config (includes all necessary IDs)
  context: FeedContext;
  
  // UI customization
  showFilters?: boolean;
  showSearch?: boolean;
  onEdit?: (post: Post) => void;
  className?: string;
  emptyMessage?: string;
}

/**
 * SmartPostFeed - Context-Aware Data Container
 * Fetches data automatically and passes to ControlledPostFeed
 */
export default function SmartPostFeed({
  context,
  showFilters = false,
  showSearch = false,
  onEdit,
  className = '',
  emptyMessage,
}: SmartPostFeedProps) {
  const { t } = useTranslation();
  
  // Data management state
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'residents' | 'visitors' | 'friends'>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build filter options
  const filters: FilterOptions = useMemo(() => ({
    filterType: filterBy,
    tags: filterTags,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [filterBy, filterTags, startDate, endDate]);

  // Data layer hooks - centralized data management
  const { 
    posts, 
    hasMore, 
    isLoading, 
    isFetching,
  } = usePostFeed({
    context,
    page,
    limit: 20,
    filters,
    searchQuery: debouncedSearch,
  });

  const { 
    likePost, 
    deletePost,
  } = usePostMutations(context);

  // Data handlers (bridge between data hooks and controlled component)
  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to page 1 on new search
  }, []);

  const handleFilter = useCallback((filterType: 'all' | 'residents' | 'visitors' | 'friends') => {
    setFilterBy(filterType);
    setPage(1);
  }, []);

  const handleTagAdd = useCallback((tag: string) => {
    if (!filterTags.includes(tag)) {
      setFilterTags(prev => [...prev, tag]);
      setPage(1);
    }
  }, [filterTags]);

  const handleTagRemove = useCallback((tag: string) => {
    setFilterTags(prev => prev.filter(t => t !== tag));
    setPage(1);
  }, []);

  const handleDelete = useCallback((postId: number) => {
    if (window.confirm(t('memories.feed.confirmDelete'))) {
      deletePost(postId);
    }
  }, [deletePost, t]);

  // Render controlled component with data
  return (
    <ControlledPostFeed
      posts={posts}
      isLoading={isLoading}
      isFetching={isFetching}
      hasMore={hasMore}
      onLike={likePost}
      onEdit={onEdit}
      onDelete={handleDelete}
      onLoadMore={handleLoadMore}
      onSearch={showSearch ? handleSearch : undefined}
      onFilter={showFilters ? handleFilter : undefined}
      onTagAdd={showFilters ? handleTagAdd : undefined}
      onTagRemove={showFilters ? handleTagRemove : undefined}
      showFilters={showFilters}
      showSearch={showSearch}
      className={className}
      emptyMessage={emptyMessage}
    />
  );
}
