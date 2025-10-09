/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK - Phase 3 Component Split
 * ControlledPostFeed - Fully Controlled Component (Props-Based)
 * 
 * ARCHITECTURE: Controlled component pattern (React best practice)
 * - Receives ALL data via props
 * - No internal data fetching
 * - Parent controls all state
 * - Pure presentation logic
 * 
 * USE WHEN: You already have posts data and want full control
 * 
 * @see docs/pages/esa-architecture/brittleness-refactoring.md
 * Rollback: git checkout 21917df387a4b3234bd03739c5fa6c81e454fcce
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Tag, Filter, Loader2 } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import EnhancedPostItem from './EnhancedPostItem';
import ShareModal from '@/components/modern/ShareModal';
import { Post } from '@/data/posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ControlledPostFeedProps {
  // Data props (controlled by parent)
  posts: Post[];
  isLoading?: boolean;
  isFetching?: boolean;
  hasMore?: boolean;
  
  // Action handlers (controlled by parent)
  onLike: (postId: number) => void;
  onShare?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete: (postId: number) => void;
  onLoadMore?: () => void;
  
  // Optional filter/search handlers
  onSearch?: (query: string) => void;
  onFilter?: (filterType: 'all' | 'residents' | 'visitors' | 'friends') => void;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  
  // UI customization
  showFilters?: boolean;
  showSearch?: boolean;
  className?: string;
  emptyMessage?: string;
}

/**
 * ControlledPostFeed - Pure Presentation Component
 * Parent component manages ALL state and data
 */
export default function ControlledPostFeed({
  posts,
  isLoading = false,
  isFetching = false,
  hasMore = false,
  onLike,
  onShare,
  onEdit,
  onDelete,
  onLoadMore,
  onSearch,
  onFilter,
  onTagAdd,
  onTagRemove,
  showFilters = false,
  showSearch = false,
  className = '',
  emptyMessage,
}: ControlledPostFeedProps) {
  const { t } = useTranslation();
  
  // Local UI-only state (no data!)
  const [searchInput, setSearchInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  
  // Scroll reveal animation
  useScrollReveal('.post-item', {
    opacity: 0,
    y: 20,
  });

  // UI handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      onTagAdd?.(tagInput.trim());
      setTagInput('');
    }
  }, [tagInput, onTagAdd]);

  const handleShare = useCallback((post: Post) => {
    if (onShare) {
      onShare(post);
    } else {
      // Built-in share modal fallback
      setSharePost(post);
      setShareModalOpen(true);
    }
  }, [onShare]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Search */}
      {showSearch && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('memories.feed.searchPlaceholder')}
              className="pl-10"
              data-testid="input-search-posts"
            />
          </div>
          {showFilters && (
            <Button
              variant="outline"
              size="icon"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}

      {/* Tag Input (if handler provided) */}
      {onTagAdd && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder={t('memories.feed.addTag')}
              className="pl-10"
              data-testid="input-add-tag"
            />
          </div>
          <Button
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            data-testid="button-add-tag"
          >
            {t('common.add')}
          </Button>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-gray-500">
              {emptyMessage || t('memories.feed.noPosts')}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className="post-item">
                <EnhancedPostItem
                  post={post}
                  onLike={() => onLike(post.id)}
                  onShare={() => handleShare(post)}
                  onEdit={onEdit ? () => onEdit(post) : undefined}
                  onDelete={() => onDelete(post.id)}
                />
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && onLoadMore && (
              <div className="text-center py-6">
                <Button
                  onClick={onLoadMore}
                  disabled={isFetching}
                  variant="outline"
                  data-testid="button-load-more"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('memories.feed.loadMore')
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Built-in Share Modal (fallback) */}
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
