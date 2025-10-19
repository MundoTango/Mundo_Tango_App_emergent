/**
 * Platform Search Tab - Agent #76
 * mb.md lines 547-563
 * 
 * Intelligent cross-platform search with Elasticsearch
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  User, 
  Calendar, 
  Users, 
  FileText,
  Loader2,
  ExternalLink
} from 'lucide-react';

export function PlatformSearchTab() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'users' | 'events' | 'groups' | 'posts'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['/api/search', { q: query, type: searchType }],
    enabled: query.length > 0,
  });

  const results = data?.results || [];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <h3 className="font-semibold text-lg mb-2">Platform Search</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Search across users, events, groups, posts, and documentation
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search anything on Mundo Tango..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            data-testid="input-platform-search"
          />
        </div>
      </div>

      {/* Search Type Tabs */}
      <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value={searchType} className="flex-1 overflow-y-auto p-4 mt-0">
          {isLoading && query && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-turquoise-500" />
            </div>
          )}

          {!query && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Start typing to search...</p>
              <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto text-left">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Search Users</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Find tango dancers by name, location, or skills
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Find Events</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Discover milongas, festivals, and workshops
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Join Groups</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Connect with local tango communities
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Browse Posts</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Read tips, stories, and discussions
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No results found for "{query}"</p>
              <Button variant="ghost" onClick={() => setQuery('')} className="mt-2">
                Clear search
              </Button>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((result: any, idx: number) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {result.type === 'user' && <User className="h-4 w-4 text-turquoise-600" />}
                        {result.type === 'event' && <Calendar className="h-4 w-4 text-cyan-600" />}
                        {result.type === 'group' && <Users className="h-4 w-4 text-blue-600" />}
                        {result.type === 'post' && <FileText className="h-4 w-4 text-purple-600" />}
                        <CardTitle className="text-sm">{result.title || result.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{result.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs mb-2">
                      {result.description || result.excerpt}
                    </CardDescription>
                    <Button size="sm" variant="outline" className="text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
