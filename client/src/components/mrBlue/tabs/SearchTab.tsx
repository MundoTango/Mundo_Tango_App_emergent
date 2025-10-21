/**
 * Search Tab - Platform-wide search with breadcrumb context
 * MB.MD Phase 3K - Oct 21, 2025
 * REAL API INTEGRATION
 */

import { useState } from 'react';
import { Search, History, TrendingUp, Clock, Calendar, Users as UsersIcon, Image as ImageIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SearchResult {
  type: 'event' | 'user' | 'group' | 'memory';
  id: number;
  title: string;
  description: string;
  location?: string;
  imageUrl?: string;
}

export default function SearchTab() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Search API call
  const { data: searchResults, isLoading, error } = useQuery<SearchResult[]>({
    queryKey: ['/api/search/unified', searchTerm],
    enabled: searchTerm.length >= 3,
  });

  const recentSearches = [
    'Milongas in Buenos Aires',
    'Tango events this weekend',
    'Advanced follower techniques',
  ];

  const suggestedSearches = [
    { query: 'Upcoming events near me', icon: TrendingUp },
    { query: 'Groups in my city', icon: TrendingUp },
    { query: 'Popular tango memories', icon: TrendingUp },
  ];

  const handleSearch = async () => {
    if (query.length < 3) {
      toast({
        title: 'Search query too short',
        description: 'Please enter at least 3 characters',
        variant: 'destructive',
      });
      return;
    }
    setSearchTerm(query);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'event':
        return Calendar;
      case 'user':
        return UsersIcon;
      case 'group':
        return MapPin;
      case 'memory':
        return ImageIcon;
      default:
        return Search;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Platform Search
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Search across events, groups, memories, and profiles
        </p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search Mundo Tango..."
          className="flex-1"
          data-testid="input-search-query"
        />
        <Button onClick={handleSearch} disabled={isLoading} data-testid="button-search">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </div>

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Found {searchResults.length} results
          </h4>
          <div className="space-y-3">
            {searchResults.map((result) => {
              const Icon = getResultIcon(result.type);
              return (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  data-testid={`result-${result.type}-${result.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900 dark:text-white truncate">
                          {result.title}
                        </h5>
                        <Badge variant="outline" className="capitalize text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {result.description}
                      </p>
                      {result.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Searches */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Recent Searches</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((search, i) => (
            <Badge
              key={i}
              variant="outline"
              className="cursor-pointer hover:bg-cyan-500/10"
              onClick={() => setQuery(search)}
              data-testid={`badge-recent-${i}`}
            >
              <History className="h-3 w-3 mr-1" />
              {search}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Suggested Searches */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Suggested Searches</h4>
        </div>
        <div className="space-y-2">
          {suggestedSearches.map((item, i) => (
            <Button
              key={i}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setQuery(item.query)}
              data-testid={`button-suggested-${i}`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.query}
            </Button>
          ))}
        </div>
      </Card>

      {/* Empty State */}
      {searchTerm && !isLoading && (!searchResults || searchResults.length === 0) && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found for "{searchTerm}"</p>
          <p className="text-sm mt-2">Try different keywords or browse suggested searches</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-red-200 dark:border-red-900/50">
          <p className="text-red-600 dark:text-red-400">
            Search temporarily unavailable. Please try again later.
          </p>
        </Card>
      )}
    </div>
  );
}
