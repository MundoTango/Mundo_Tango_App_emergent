import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  Tag,
  Hash,
  TrendingUp,
  Sparkles,
  Clock,
  Users,
  Filter } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useMemoryRealtimeEvents } from '@/hooks/useSocket';

interface TrendingTag {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentChange?: number;
}

interface EnhancedTagSystemProps {
  activeTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearAll?: () => void;
}

export default function EnhancedTagSystem({
  activeTags,
  onAddTag,
  onRemoveTag,
  onClearAll
}: EnhancedTagSystemProps) {
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'trending' | 'recent' | 'popular'>('trending');

  // Real-time updates for tag activity
  const liveUpdates = useMemoryRealtimeEvents();

  // Fetch trending tags
  const { data: trendingTags = [], isLoading: loadingTrending } = useQuery({
    queryKey: ['/api/tags/trending'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent tags
  const { data: recentTags = [] } = useQuery({
    queryKey: ['/api/tags/recent'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch popular tags
  const { data: popularTags = [] } = useQuery({
    queryKey: ['/api/tags/popular']
  });

  // Suggested tags based on input
  const suggestedTags = React.useMemo(() => {
    if (!tagInput) return [];

    const allTags = [...new Set([
    ...(trendingTags?.map((t: TrendingTag) => t.name) || []),
    ...(recentTags || []),
    ...(popularTags || [])]
    )];

    return allTags.
    filter((tag) =>
    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
    !activeTags.includes(tag)
    ).
    slice(0, 5);
  }, [tagInput, trendingTags, recentTags, popularTags, activeTags]);

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim();
    if (tagToAdd && !activeTags.includes(tagToAdd)) {
      onAddTag(tagToAdd);
      setTagInput('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Main Tag Filter Section */}
      <div className="glassmorphic rounded-3xl shadow-2xl border-2 border-cyan-500/20 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="mt-ocean-gradient p-3 rounded-2xl shadow-xl 
                          hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300">

              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mt-ocean-text">
                Filter by Tags
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Discover memories by topics and themes
              </p>
            </div>
          </div>
          
          {activeTags.length > 0 &&
          <div className="flex items-center gap-3">
              <div className="glassmorphic px-4 py-2 rounded-2xl">
                <span className="text-cyan-700 dark:text-cyan-300 font-bold text-sm">
                  {activeTags.length} active filter{activeTags.length > 1 ? 's' : ''}
                </span>
              </div>
              <button
              onClick={onClearAll}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors" data-testid="button-text-sm" aria-label="Button">

                Clear all
              </button>
            </div>
          }
        </div>

        {/* Tag Input with Suggestions */}
        <div className="relative mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 
                              group-focus-within:text-[var(--color-primary)] transition-colors duration-300" />

              <input
                type="text"
                value={tagInput}
                onChange={(e) = aria-label="Input field"> {
                  setTagInput(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(tagInput.length > 0)}
                placeholder="Search or add tags..."
                className="w-full pl-14 pr-6 py-5 glassmorphic
                         border-2 border-cyan-200/20 rounded-2xl focus:outline-none focus:ring-4 
                         focus:ring-cyan-200/50 focus:border-[var(--color-ocean-300)] text-[var(--color-text)] dark:text-white 
                         placeholder-gray-400 font-medium text-lg hover:border-[var(--color-ocean-300)]/50 
                         transition-all duration-300" data-testid="input-text" />





            </div>
            <button
              onClick={() = aria-label="Button"> handleAddTag()}
              disabled={!tagInput.trim() || activeTags.includes(tagInput.trim())}
              className="mt-ocean-gradient hover:opacity-90 
                       disabled:opacity-50 text-white px-8 py-5 rounded-2xl 
                       font-bold text-lg shadow-2xl hover:shadow-cyan-500/30 transform hover:-translate-y-1 
                       disabled:transform-none disabled:shadow-lg transition-all duration-300 
                       flex items-center space-x-3 group" data-testid="button-mt-ocean-gradient">





              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add Tag</span>
            </button>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestedTags.length > 0 &&
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 glassmorphic rounded-2xl shadow-2xl overflow-hidden">

                {suggestedTags.map((tag) =>
              <button
                key={tag}
                onClick={() = aria-label="Button"> handleAddTag(tag)}
                className="w-full px-5 py-3 text-left hover:bg-[var(--color-ocean-50)] dark:hover:bg-cyan-900/20 
                             transition-colors flex items-center justify-between group" data-testid="button-w-full">


                    <span className="text-[var(--color-text-secondary)] dark:text-gray-300">{tag}</span>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-primary)]" />
                  </button>
              )}
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* Active Tags */}
        {activeTags.length > 0 &&
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {activeTags.map((tag) =>
            <motion.div
              key={tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="glassmorphic border-2 border-cyan-200/30 
                           text-cyan-700 dark:text-cyan-300 px-5 py-3 rounded-2xl flex items-center space-x-3 
                           shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">



                  <Tag className="w-4 h-4" />
                  <span className="font-bold text-lg">{tag}</span>
                  <button
                onClick={() = aria-label="Button"> onRemoveTag(tag)}
                className="ml-2 p-2 rounded-xl text-[var(--color-primary)] hover:text-red-500 
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-110" data-testid="button-ml-2">


                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
            )}
            </div>
          </div>
        }
      </div>

      {/* Trending Tags Widget */}
      <div className="glassmorphic rounded-3xl shadow-2xl border-2 border-cyan-500/20 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] dark:text-white">
              Discover Tags
            </h3>
          </div>

          {/* Category Selector */}
          <div className="flex gap-2">
            {(['trending', 'recent', 'popular'] as const).map((category) =>
            <button
              key={category}
              onClick={() = aria-label="Button"> setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
              selectedCategory === category ?
              'mt-ocean-gradient text-white shadow-lg' :
              'glassmorphic text-gray-600 dark:text-gray-300 hover:bg-[var(--color-ocean-50)] dark:hover:bg-cyan-900/20'}`
              } data-testid="button-element">

                {category}
              </button>
            )}
          </div>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedCategory === 'trending' &&
          <>
              {loadingTrending ?
            <div className="col-span-full text-center py-8">
                  <div className="animate-pulse">Loading trending tags...</div>
                </div> :
            trendingTags.length > 0 ?
            trendingTags.slice(0, 8).map((tag: TrendingTag) =>
            <motion.button
              key={tag.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddTag(tag.name)}
              disabled={activeTags.includes(tag.name)}
              className={`p-3 rounded-xl transition-all ${
              activeTags.includes(tag.name) ?
              'bg-[var(--color-neutral-100)] dark:bg-gray-800 opacity-50 cursor-not-allowed' :
              'glassmorphic hover:border-[var(--color-ocean-300)] dark:hover:border-cyan-600 cursor-pointer'}`
              }>

                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[var(--color-text)] dark:text-white">
                        #{tag.name}
                      </span>
                      <span className={`text-lg ${getTrendColor(tag.trend)}`}>
                        {getTrendIcon(tag.trend)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {tag.count} posts
                      </span>
                      {tag.percentChange &&
                <span className={getTrendColor(tag.trend)}>
                          {tag.percentChange > 0 ? '+' : ''}{tag.percentChange}%
                        </span>
                }
                    </div>
                  </motion.button>
            ) :

            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No trending tags at the moment
                </div>
            }
            </>
          }

          {selectedCategory === 'recent' &&
          <>
              {recentTags.length > 0 ?
            recentTags.slice(0, 8).map((tag: string) =>
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddTag(tag)}
              disabled={activeTags.includes(tag)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
              activeTags.includes(tag) ?
              'bg-[var(--color-neutral-100)] dark:bg-gray-800 opacity-50 cursor-not-allowed' :
              'glassmorphic hover:border-[var(--color-ocean-300)] dark:hover:border-cyan-600 cursor-pointer'}`
              }>

                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-sm text-[var(--color-text)] dark:text-white">
                      #{tag}
                    </span>
                  </motion.button>
            ) :

            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent tags
                </div>
            }
            </>
          }

          {selectedCategory === 'popular' &&
          <>
              {popularTags.length > 0 ?
            popularTags.slice(0, 8).map((tag: string) =>
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddTag(tag)}
              disabled={activeTags.includes(tag)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
              activeTags.includes(tag) ?
              'bg-[var(--color-neutral-100)] dark:bg-gray-800 opacity-50 cursor-not-allowed' :
              'glassmorphic hover:border-[var(--color-ocean-300)] dark:hover:border-cyan-600 cursor-pointer'}`
              }>

                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-sm text-[var(--color-text)] dark:text-white">
                      #{tag}
                    </span>
                  </motion.button>
            ) :

            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No popular tags yet
                </div>
            }
            </>
          }
        </div>

        {/* Quick Suggestions */}
        <div className="mt-6 pt-6 border-t border-[var(--color-border)] dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Quick suggestions for Mundo Tango:
          </p>
          <div className="flex flex-wrap gap-2">
            {['milonga', 'performance', 'class', 'social', 'vals', 'practica', 'festival', 'workshop'].map((suggestion) =>
            <button
              key={suggestion}
              onClick={() = aria-label="Button"> handleAddTag(suggestion)}
              disabled={activeTags.includes(suggestion)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTags.includes(suggestion) ?
              'bg-[var(--color-neutral-100)] dark:bg-gray-800 text-gray-400 cursor-not-allowed' :
              'bg-[var(--color-ocean-50)] dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 cursor-pointer'}`
              } data-testid="button-element">

                {suggestion}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Indicator */}
      {liveUpdates.comments.length > 0 &&
      <div className="glassmorphic rounded-2xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Live tag activity • {liveUpdates.comments.length} new posts with tags
              </p>
            </div>
            <button className="text-xs text-[var(--color-primary-hover)] hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300" data-testid="button-text-xs" aria-label="Button">
              View all
            </button>
          </div>
        </div>
      }
    </div>);

}