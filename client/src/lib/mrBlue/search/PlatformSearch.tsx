import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Calendar, Users as GroupIcon, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * TRACK 4: Agent #76 Platform Search
 * Mr Blue UI Integration - Universal search across platform
 */

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'event' | 'group' | 'doc';
  title: string;
  description: string;
  url: string;
  relevance: number;
  metadata?: {
    author?: string;
    date?: string;
    location?: string;
    members?: number;
  };
}

export default function PlatformSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'user' | 'post' | 'event' | 'group' | 'doc'>('all');

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, filter })
        });
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, filter]);

  // Filter results by type
  const filteredResults = filter === 'all' 
    ? results 
    : results.filter(r => r.type === filter);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'post': return <FileText className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'group': return <GroupIcon className="w-4 h-4" />;
      case 'doc': return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return 'bg-blue-500';
      case 'post': return 'bg-purple-500';
      case 'event': return 'bg-green-500';
      case 'group': return 'bg-orange-500';
      case 'doc': return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, posts, events, groups, docs..."
          className="pl-10 pr-4"
          data-testid="input-platform-search"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="user">Users</TabsTrigger>
          <TabsTrigger value="post">Posts</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="group">Groups</TabsTrigger>
          <TabsTrigger value="doc">Docs</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-2 mt-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <Card 
                key={result.id}
                className="p-4 hover:bg-accent transition-colors cursor-pointer"
                onClick={() => window.location.href = result.url}
                data-testid={`search-result-${result.type}-${result.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getTypeColor(result.type)} flex items-center justify-center text-white`}>
                    {getIcon(result.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{result.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {Math.round(result.relevance * 100)}% match
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.description}
                    </p>

                    {result.metadata && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {result.metadata.author && (
                          <span>By {result.metadata.author}</span>
                        )}
                        {result.metadata.date && (
                          <span>{result.metadata.date}</span>
                        )}
                        {result.metadata.location && (
                          <span>📍 {result.metadata.location}</span>
                        )}
                        {result.metadata.members !== undefined && (
                          <span>👥 {result.metadata.members} members</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : query.length >= 2 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or filters</p>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Start typing to search...</p>
              <p className="text-sm mt-1">Search across users, posts, events, groups, and docs</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Search Tips */}
      {query.length === 0 && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-semibold mb-2">Search Tips:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Use quotes for exact phrases: "dance workshop"</li>
            <li>• Filter by type using tabs above</li>
            <li>• Search supports fuzzy matching (typo tolerance)</li>
            <li>• Results ranked by relevance</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
