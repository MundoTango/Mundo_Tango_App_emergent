// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 24: Social Features Agent - Favorites Management
// Central hub for all user-liked content across the platform

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart, Calendar, Users, MessageCircle, X, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import DashboardLayout from '@/components/esa/DashboardLayout';

interface FavoriteItem {
  id: number;
  userId: number;
  itemType: 'post' | 'event' | 'user' | 'group' | 'memory';
  itemId: number;
  title?: string;
  description?: string;
  imageUrl?: string;
  metadata?: any;
  createdAt: string;
}

export default function Favorites() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch favorites from real API
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['/api/favorites', activeTab],
    queryFn: async () => {
      // Map plural tab values to singular API itemType values
      const typeMap: { [key: string]: string } = {
        'posts': 'post',
        'events': 'event', 
        'people': 'user',
        'groups': 'group',
        'memories': 'memory'
      };
      
      const apiType = typeMap[activeTab];
      const typeParam = activeTab === 'all' ? '' : `?type=${apiType}`;
      const response = await fetch(`/api/favorites${typeParam}`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || [];
    }
  });

  // Remove from favorites mutation
  const removeFavorite = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: number; itemType: string }) => {
      return apiRequest(`/api/favorites/${itemId}?type=${itemType}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites"
      });
    }
  });

  // Bulk remove mutation
  const bulkRemove = useMutation({
    mutationFn: async (items: Array<{ itemId: number; itemType: string }>) => {
      return apiRequest('/api/favorites/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { action: 'remove', items }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      setSelectedItems([]);
      toast({
        title: "Bulk removal successful",
        description: `${selectedItems.length} items removed from favorites`
      });
    }
  });

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getItemLink = (item: FavoriteItem) => {
    switch(item.itemType) {
      case 'event': return `/events/${item.itemId}`;
      case 'user': return `/profile/${item.itemId}`;
      case 'group': return `/groups/${item.itemId}`;
      case 'memory': return `/memories/${item.itemId}`;
      case 'post': return `/posts/${item.itemId}`;
      default: return '#';
    }
  };

  const renderFavoriteCard = (item: FavoriteItem) => {
    const isSelected = selectedItems.includes(item.id.toString());
    
    return (
      <Card 
        key={`${item.itemType}-${item.itemId}`}
        className={cn(
          "relative group transition-all hover:shadow-lg cursor-pointer",
          theme === 'dark' ? "bg-slate-900/50 border-slate-700" : "bg-white border-gray-200",
          isSelected && "ring-2 ring-purple-500"
        )}
        onClick={() => toggleItemSelection(item.id.toString())}
        data-testid={`favorite-card-${item.id}`}
      >
        {/* Selection checkbox */}
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              toggleItemSelection(item.id.toString());
            }}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            removeFavorite.mutate({ itemId: item.itemId, itemType: item.itemType });
          }}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Card content */}
        {item.imageUrl && (
          <div className="h-48 overflow-hidden rounded-t-lg">
            <img 
              src={item.imageUrl} 
              alt={item.title || ''} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">
                {item.title || `Untitled ${item.itemType}`}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={cn(
                  "mt-1",
                  item.itemType === 'post' && "border-blue-500 text-blue-500",
                  item.itemType === 'event' && "border-purple-500 text-purple-500",
                  item.itemType === 'user' && "border-green-500 text-green-500",
                  item.itemType === 'group' && "border-orange-500 text-orange-500",
                  item.itemType === 'memory' && "border-pink-500 text-pink-500"
                )}
              >
                {item.itemType}
              </Badge>
            </div>
            <Heart className="h-5 w-5 text-red-500 fill-red-500 animate-pulse" />
          </div>
        </CardHeader>
        
        <CardContent>
          {item.description && (
            <p className={cn(
              "text-sm line-clamp-2 mb-3",
              theme === 'dark' ? "text-slate-300" : "text-gray-600"
            )}>
              {item.description}
            </p>
          )}
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs">
            {item.metadata?.location && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {item.metadata.location}
              </span>
            )}
            {item.metadata?.attendees && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {item.metadata.attendees} attending
              </span>
            )}
            {item.metadata?.members && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {item.metadata.members} members
              </span>
            )}
          </div>
          
          <p className={cn(
            "text-xs mt-2",
            theme === 'dark' ? "text-slate-500" : "text-gray-400"
          )}>
            Saved {format(new Date(item.createdAt), 'MMM dd, yyyy')}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={cn(
            "text-3xl font-bold mb-2",
            "bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent"
          )}>
            My Favorites
          </h1>
          <p className={cn(
            "text-lg",
            theme === 'dark' ? "text-slate-400" : "text-gray-600"
          )}>
            All your liked content in one place
          </p>
        </div>

        {/* Actions Bar */}
        {selectedItems.length > 0 && (
          <div className={cn(
            "mb-6 p-4 rounded-lg flex items-center justify-between",
            theme === 'dark' ? "bg-slate-800" : "bg-gray-100"
          )}>
            <span className="text-sm font-medium">
              {selectedItems.length} items selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems([])}
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const items = favorites?.filter(f => selectedItems.includes(f.id.toString()))
                    .map(f => ({ itemId: f.itemId, itemType: f.itemType })) || [];
                  bulkRemove.mutate(items);
                }}
              >
                Remove Selected
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className={cn(
            "grid w-full max-w-md grid-cols-6",
            theme === 'dark' ? "bg-slate-800" : "bg-gray-100"
          )}>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
            <TabsTrigger value="people" data-testid="tab-people">People</TabsTrigger>
            <TabsTrigger value="groups" data-testid="tab-groups">Groups</TabsTrigger>
            <TabsTrigger value="memories" data-testid="tab-memories">Memories</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse">
                <CardContent className="h-full bg-gray-200 dark:bg-slate-700" />
              </Card>
            ))}
          </div>
        ) : favorites?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(renderFavoriteCard)}
          </div>
        ) : (
          <Card className={cn(
            "p-12 text-center",
            theme === 'dark' ? "bg-slate-900/50" : "bg-white"
          )}>
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className={cn(
              "text-sm mb-6",
              theme === 'dark' ? "text-slate-400" : "text-gray-600"
            )}>
              Start exploring and heart content you love!
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-[#5EEAD4] to-[#155E75] hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Discover Content
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}