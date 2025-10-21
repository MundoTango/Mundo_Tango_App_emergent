/**
 * Search Tab - Platform-wide search with breadcrumb context
 * MB.MD Phase 3K - Oct 21, 2025
 */

import { useState } from 'react';
import { Search, History, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function SearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

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
    // TODO: Implement search API call with breadcrumb context
    console.log('[Search] Query:', query);
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
        <Button onClick={handleSearch} data-testid="button-search">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

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

      {/* Search Results (empty state) */}
      {query && results.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found for "{query}"</p>
          <p className="text-sm mt-2">Try different keywords or browse suggested searches</p>
        </div>
      )}
    </div>
  );
}
