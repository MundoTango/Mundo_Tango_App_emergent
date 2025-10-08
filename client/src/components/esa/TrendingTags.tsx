// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Trending Tags Component with Usage Counts
// Following ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md specifications

import { useState, useEffect } from 'react';
import { TrendingUp, Hash, Sparkles, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TrendingTag {
  id: string;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  isHot?: boolean;
}

interface TrendingTagsProps {
  tags: TrendingTag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagDeselect: (tagId: string) => void;
  theme?: string;
}

export default function TrendingTags({
  tags,
  selectedTags,
  onTagSelect,
  onTagDeselect,
  theme = 'light'
}: TrendingTagsProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(false);

  // Sort tags by count and hot status
  const sortedTags = [...tags].sort((a, b) => {
    if (a.isHot && !b.isHot) return -1;
    if (!a.isHot && b.isHot) return 1;
    return b.count - a.count;
  });

  const displayTags = expandedView ? sortedTags : sortedTags.slice(0, 10);

  return (
    <Card className={cn(
      "backdrop-blur-md bg-[var(--color-surface)]/80 dark:bg-gray-900/80",
      "border border-white/20 dark:border-gray-800/50",
      "p-4"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-[var(--color-ocean-400)] to-cyan-600 rounded-lg">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)] dark:text-white">
              Trending Tags
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Most popular in your community
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedView(!expandedView)}
          className="text-xs"
        >
          {expandedView ? 'Show less' : 'Show all'}
        </Button>
      </div>

      {/* Tags Grid */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayTags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag.id);
            const isHovered = hoveredTag === tag.id;

            return (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                layout
              >
                <motion.button
                  onClick={() => {
                    if (isSelected) {
                      onTagDeselect(tag.id);
                    } else {
                      onTagSelect(tag.id);
                    }
                  }}
                  onHoverStart={() => setHoveredTag(tag.id)}
                  onHoverEnd={() => setHoveredTag(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg",
                    "transition-all duration-200",
                    "border",
                    isSelected 
                      ? "bg-gradient-to-r from-[var(--color-ocean-400)]/20 to-cyan-600/20 border-teal-400/50" 
                      : "bg-[var(--color-surface)]/50 dark:bg-gray-800/50 border-[var(--color-border)] dark:border-gray-700",
                    "hover:shadow-md"
                  )}
                  data-testid={`tag-${tag.name.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Tag Icon */}
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full",
                      tag.isHot 
                        ? "bg-gradient-to-br from-orange-400 to-red-500" 
                        : "bg-gradient-to-br from-[var(--color-ocean-400)]/20 to-cyan-600/20"
                    )}>
                      {tag.isHot ? (
                        <Flame className="h-4 w-4 text-white" />
                      ) : (
                        <Hash className="h-4 w-4 text-[var(--color-primary-hover)] dark:text-teal-400" />
                      )}
                    </div>

                    {/* Tag Name and Stats */}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          isSelected 
                            ? "text-[var(--color-primary-hover)] dark:text-teal-300" 
                            : "text-[var(--color-text)] dark:text-white"
                        )}>
                          {tag.name}
                        </span>
                        {tag.isHot && (
                          <motion.span
                            animate={{ 
                              rotate: [0, 10, -10, 10, 0],
                              scale: [1, 1.1, 1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                          >
                            <Sparkles className="h-3 w-3 text-yellow-500" />
                          </motion.span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tag.count.toLocaleString()} {tag.count === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex items-center gap-2">
                    {tag.trend === 'up' && (
                      <div className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-medium">+12%</span>
                      </div>
                    )}
                    {tag.trend === 'down' && (
                      <div className="flex items-center gap-1 text-red-500">
                        <TrendingUp className="h-3 w-3 rotate-180" />
                        <span className="text-xs font-medium">-8%</span>
                      </div>
                    )}
                    {tag.trend === 'stable' && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                </motion.button>

                {/* Hover Card with Details */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 px-3 pb-1">
                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Last hour: {Math.floor(tag.count * 0.1)} posts</span>
                          <span>Today: {Math.floor(tag.count * 0.3)} posts</span>
                          <span>This week: {tag.count} posts</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{tags.length} total tags</span>
          <span>{tags.filter(t => t.isHot).length} trending now 🔥</span>
        </div>
      </div>
    </Card>
  );
}