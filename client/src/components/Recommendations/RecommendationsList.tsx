import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Users, Globe, Utensils, Coffee, ShoppingBag, Heart, Camera, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import RecommendationFilters from '@/components/recommendations/RecommendationFilters';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  type?: string;
  category?: 'restaurant' | 'bar' | 'cafe' | 'attraction' | 'shopping' | 'entertainment' | 'other';
  address: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    city?: string;
    country?: string;
  };
  recommendedBy?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    isLocal: boolean;
    nationality?: string;
  };
  friendConnection?: 'direct' | 'friend-of-friend' | 'community' | null;
  localRecommendations?: number;
  visitorRecommendations?: number;
  rating?: number;
  priceLevel?: string | 1 | 2 | 3 | 4;
  tags?: string[];
  photos?: string[];
}

interface RecommendationsListProps {
  groupSlug?: string;
  city?: string;
  showFilters?: boolean;
  friendFilter?: 'all' | 'direct' | 'friend-of-friend' | 'community';
  recommendationType?: 'all' | 'local' | 'visitor';
}

interface FilterState {
  connectionDegree: 'anyone' | '1st_degree' | '2nd_degree' | '3rd_degree' | 'custom_closeness';
  minClosenessScore?: number;
  localStatus: 'all' | 'local' | 'visitor';
  originCountry?: string;
  type?: string;
  priceLevel?: string;
  minRating?: number;
  tags?: string[];
}

export default function RecommendationsList({ 
  groupSlug, 
  city, 
  showFilters = true,
  friendFilter: propFriendFilter,
  recommendationType: propRecommendationType 
}: RecommendationsListProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    connectionDegree: 'anyone',
    localStatus: propRecommendationType === 'local' ? 'local' : propRecommendationType === 'visitor' ? 'visitor' : 'all'
  });

  // Fetch recommendations with comprehensive filters
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['/api/recommendations', { city, groupSlug, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (groupSlug) params.append('groupSlug', groupSlug);
      if (filters.connectionDegree !== 'anyone') params.append('connectionDegree', filters.connectionDegree);
      if (filters.minClosenessScore) params.append('minClosenessScore', filters.minClosenessScore.toString());
      if (filters.localStatus !== 'all') params.append('localStatus', filters.localStatus);
      if (filters.originCountry) params.append('originCountry', filters.originCountry);
      if (filters.type) params.append('type', filters.type);
      if (filters.priceLevel) params.append('priceLevel', filters.priceLevel);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      
      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return await response.json();
    },
    enabled: !!city || !!groupSlug
  });

  const recommendations = apiResponse?.data || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant':
        return Utensils;
      case 'bar':
      case 'cafe':
        return Coffee;
      case 'shopping':
        return ShoppingBag;
      case 'attraction':
        return Camera;
      case 'entertainment':
        return Music;
      default:
        return Star;
    }
  };

  const getPriceLevelDisplay = (level?: string | number) => {
    if (!level) return null;
    const numLevel = typeof level === 'string' ? parseInt(level) : level;
    return '$'.repeat(numLevel);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters - New Aurora Tide Design */}
      {showFilters && (
        <RecommendationFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations?.map((rec: Recommendation) => {
          const categoryToUse = rec.type || rec.category || 'other';
          const CategoryIcon = getCategoryIcon(categoryToUse);
          const userInfo = rec.user || rec.recommendedBy;
          const photos = rec.photos || [];
          const tags = rec.tags || [];
          const lat = rec.lat || rec.latitude;
          const lng = rec.lng || rec.longitude;
          
          // Determine if recommender is local (handle both user formats)
          const userCity = 'city' in (userInfo || {}) ? (userInfo as any).city : undefined;
          const userCountry = 'country' in (userInfo || {}) ? (userInfo as any).country : 'nationality' in (userInfo || {}) ? (userInfo as any).nationality : undefined;
          const isLocal = userCity?.toLowerCase() === rec.city?.toLowerCase();
          
          return (
            <div 
              key={rec.id} 
              className="glass-card glass-depth-1 rounded-xl overflow-hidden hover:glass-depth-3 transition-all border border-white/20"
              data-testid={`card-recommendation-${rec.id}`}
            >
              {/* Photo */}
              {photos[0] && (
                <div className="h-48 bg-gradient-to-br from-turquoise-100 to-ocean-100 dark:from-gray-800 dark:to-gray-900">
                  <img 
                    src={photos[0]} 
                    alt={rec.title}
                    className="w-full h-full object-cover"
                    data-testid={`img-recommendation-${rec.id}`}
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryIcon className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{rec.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{rec.description}</p>
                  </div>
                  <div className="text-right">
                    {rec.rating && rec.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{rec.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {rec.priceLevel && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{getPriceLevelDisplay(rec.priceLevel)}</span>
                    )}
                  </div>
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{rec.address}</span>
                </div>
                
                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-turquoise-100 dark:bg-turquoise-900/30 text-turquoise-700 dark:text-turquoise-300 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Recommender Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-600 flex items-center justify-center text-white font-semibold text-sm">
                      {userInfo?.profileImage ? (
                        <img src={userInfo.profileImage} alt={userInfo?.name || 'User'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (userInfo?.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{userInfo?.name || 'Community Member'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isLocal ? `Local ${rec.city} resident` : `Visitor${userCountry ? ` from ${userCountry}` : ''}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connection Badge */}
                  {rec.friendConnection && (
                    <div className="text-xs text-turquoise-600 dark:text-turquoise-400 font-medium flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {rec.friendConnection === 'direct' ? 'Friend' : 'FOF'}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      if (lat && lng) {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                      }
                    }}
                    data-testid={`button-map-${rec.id}`}
                  >
                    View on Map
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (lat && lng) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(rec.title)}`, '_blank');
                      }
                    }}
                    data-testid={`button-directions-${rec.id}`}
                  >
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {(!recommendations || recommendations.length === 0) && (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No recommendations yet</h3>
          <p className="text-gray-500">
            {city ? `Be the first to recommend a place in ${city}!` : 'Select a city to see recommendations.'}
          </p>
        </div>
      )}
    </div>
  );
}