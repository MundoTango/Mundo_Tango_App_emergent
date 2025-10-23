/**
 * TRACK E: Conversation Search Modal
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #126 (UI)
 * 
 * Full-text search across all conversations
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  MessageSquare,
  Mic,
  Calendar,
  Filter,
  X,
  ArrowRight,
} from 'lucide-react';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import { formatDistanceToNow } from 'date-fns';

interface ConversationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: any) => void;
}

export function ConversationSearchModal({
  isOpen,
  onClose,
  onSelectResult,
}: ConversationSearchModalProps) {
  const {
    filters,
    results,
    isLoading,
    setQuery,
    clearFilters,
    hasResults,
  } = useConversationSearch(isOpen);

  const handleSelectResult = (result: any) => {
    onSelectResult?.(result);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[70vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Conversations
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search across all conversations..."
              value={filters.query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
              data-testid="input-search-conversations"
            />
            {filters.query && (
              <button
                onClick={clearFilters}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick stats */}
          {hasResults && !isLoading && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="px-6 py-2 border-b">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid="button-filter-date-range">
              <Calendar className="w-3 h-3 mr-1" />
              Date Range
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid="button-filter-model">
              Model
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid="button-filter-type">
              Type
            </Button>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Loading state */}
            {isLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filters.query.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Start typing to search...</p>
                <p className="text-sm mt-1">Search across all your conversations</p>
              </div>
            )}

            {/* No results */}
            {!isLoading && filters.query.length >= 3 && !hasResults && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No results found</p>
                <p className="text-sm mt-1">Try different keywords or filters</p>
              </div>
            )}

            {/* Results list */}
            {!isLoading && hasResults && (
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                    onClick={() => handleSelectResult(result)}
                    data-testid={`search-result-${result.id}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.type === 'voice' ? (
                          <Mic className="w-4 h-4 text-purple-500" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {result.projectName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {result.role}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Snippet */}
                    <div
                      className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.snippet || result.content }}
                    />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.model && (
                          <Badge variant="secondary" className="text-xs">
                            {result.model}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          Score: {Math.round(result.relevanceScore * 100)}%
                        </span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border rounded">⌘K</kbd>{' '}
              to search
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border rounded">ESC</kbd>{' '}
              to close
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
