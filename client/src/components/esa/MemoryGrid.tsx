// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Memory Grid Component with Infinite Scroll and Lazy Loading
// Following ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md specifications

import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, MapPin, Calendar, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassComponents';


interface Memory {
  id: string;
  content: string;
  media?: string[];
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  createdAt: string;
  location?: string;
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
}

interface MemoryGridProps {
  memories: Memory[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  onReaction: (memoryId: string, type: string) => void;
  onComment: (memoryId: string) => void;
  onShare: (memoryId: string) => void;
  theme?: string;
}

export default function MemoryGrid({
  memories,
  onLoadMore,
  hasMore,
  loading,
  onReaction,
  onComment,
  onShare,
  theme = 'light'
}: MemoryGridProps) {
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll implementation
  useEffect(() => {
    if (!hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  // Lazy load images
  const handleImageLoad = useCallback((memoryId: string) => {
    setImageLoadStates(prev => ({ ...prev, [memoryId]: true }));
  }, []);

  return (
    <div className="w-full">
      {/* Masonry Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        <AnimatePresence>
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="break-inside-avoid"
            >
              <Card 
                className={cn(
                  "overflow-hidden group hover:shadow-xl transition-all duration-300",
                  "backdrop-blur-md bg-white/80 dark:bg-gray-900/80",
                  "border border-white/20 dark:border-gray-800/50"
                )}
              >
                {/* Media Section with Lazy Loading */}
                {memory.media && memory.media.length > 0 && (
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {!imageLoadStates[memory.id] && (
                      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-teal-400/20 to-cyan-600/20" />
                    )}
                    <img
                      src={memory.media[0]}
                      alt="Memory"
                      className={cn(
                        "w-full h-full object-cover transition-all duration-500",
                        "group-hover:scale-110",
                        imageLoadStates[memory.id] ? "opacity-100" : "opacity-0"
                      )}
                      loading="lazy"
                      onLoad={() => handleImageLoad(memory.id)}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Media count indicator */}
                    {memory.media.length > 1 && (
                      <GlassCard depth={1} className="absolute top-2 right-2 text-white px-2 py-1 rounded-full text-xs"
                        +{memory.media.length - 1}
                      </div>
                    )}
                  </div>
                )}

                {/* Content Section */}
                <div className="p-4">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8 ring-2 ring-teal-400/20" data-testid="link-h-8">
                      <AvatarImage src={memory.author.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-600 text-white" data-testid="link-bg-gradient-to-br">
                        {memory.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {memory.author.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
                        @{memory.author.username}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
                      {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Memory Content */}
                  <p className="text-gray-800 dark:text-gray-200 text-sm mb-3 line-clamp-3">
                    {memory.content}
                  </p>

                  {/* Location & Tags */}
                  {(memory.location || memory.tags) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {memory.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {memory.location}
                        </span>
                      )}
                      {memory.tags?.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gradient-to-r from-teal-400/10 to-cyan-600/10 text-teal-700 dark:text-teal-300 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={()> onReaction(memory.id, 'like')}
                      className={cn(
                        "gap-1.5 hover:bg-red-50 dark:hover:bg-red-900/20",
                        memory.isLiked && "text-red-500"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", memory.isLiked && "fill-current")} />
                      <span className="text-xs">{memory.likesCount}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={()> onComment(memory.id)}
                      className="gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{memory.commentsCount}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={()> onShare(memory.id)}
                      className="gap-1.5 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">{memory.sharesCount}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading more memories...</span>
            </div>
          )}
        </div>
      )}

      {/* No more memories message */}
      {!hasMore && memories.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-600 dark:text-gray-400">
          <p>You've reached the end of memories</p>
          <p className="text-sm mt-1">Create new memories to share!</p>
        </div>
      )}
    </div>
  );
}