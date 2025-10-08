import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Users, Globe, Utensils, Coffee, ShoppingBag, Heart, Camera, Music, MessageSquare, Map as MapIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import RecommendationFilters from '@/components/recommendations/RecommendationFilters';
import RecommendationsMap from '@/components/recommendations/RecommendationsMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  type?: string;
  category?: 'restaurant' | 'bar' | 'cafe' | 'attraction' | 'shopping' | 'entertainment' | 'other';
  address?: string;
  city: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  postId?: number | null; // ESA Layer 24: Link to original post/memory
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
  mtRating?: number; // MT Community rating
  googleRating?: number; // Google Places rating
  googleReviewCount?: number; // Google review count
  mtReviewCount?: number; // MT review count
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
  cuisine?: string; // For restaurant ranking
  city?: string; // Journey R4: City filter
  categories?: string[]; // Journey R5: Multi-select categories
  type?: string; // Deprecated - use categories instead
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
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Fetch recommendations with comprehensive filters
  // Journey R4: City filter support
  const cityToUse = filters.city || city;
  
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['/api/recommendations', { city: cityToUse, groupSlug, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cityToUse) params.append('city', cityToUse);
      if (groupSlug) params.append('groupSlug', groupSlug);
      if (filters.connectionDegree !== 'anyone') params.append('connectionDegree', filters.connectionDegree);
      if (filters.minClosenessScore) params.append('minClosenessScore', filters.minClosenessScore.toString());
      if (filters.localStatus !== 'all') params.append('localStatus', filters.localStatus);
      if (filters.originCountry) params.append('originCountry', filters.originCountry);
      if (filters.cuisine) params.append('cuisine', filters.cuisine); // For intelligent ranking
      // Journey R5: Category multi-select support
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append('categories', cat));
      } else if (filters.type) {
        // Backward compatibility with old type field
        params.append('type', filters.type);
      }
      if (filters.priceLevel) params.append('priceLevel', filters.priceLevel);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      
      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return await response.json();
    },
    enabled: !!cityToUse || !!groupSlug
  });

  const recommendations = apiResponse?.data || [];

  // ESA Layer 24: Fetch linked post when modal is open
  const { data: linkedPost, isLoading: isPostLoading } = useQuery({
    queryKey: ['/api/posts', selectedRecommendation?.postId],
    queryFn: async () => {
      if (!selectedRecommendation?.postId) return null;
      const response = await fetch(`/api/posts/${selectedRecommendation.postId}`);
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedRecommendation?.postId
  });

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

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {recommendations?.length || 0} recommendation{recommendations?.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="flex items-center gap-2 glass-card glass-depth-1 p-1 rounded-lg">
          <button
            onClick={() = aria-label="Button"> setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-[var(--color-surface)]/50 dark:hover:bg-gray-700/50'
            }`}
            data-testid="button-view-list"
            title="List View"
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() = aria-label="Button"> setViewMode('map')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'map'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-[var(--color-surface)]/50 dark:hover:bg-gray-700/50'
            }`}
            data-testid="button-view-map"
            title="Map View"
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="h-[600px] rounded-xl overflow-hidden glass-card glass-depth-2">
          <RecommendationsMap
            recommendations={recommendations}
            cityLat={recommendations[0]?.lat || recommendations[0]?.latitude}
            cityLng={recommendations[0]?.lng || recommendations[0]?.longitude}
            onRecommendationClick={(rec) => setSelectedRecommendation(rec)}
            selectedRecommendation={selectedRecommendation}
          />
        </div>
      )}

      {/* List View - Recommendations Grid */}
      {viewMode === 'list' && (
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
                      <CategoryIcon className="h-5 w-5 text-[var(--color-primary-hover)] dark:text-turquoise-400" />
                      <h3 className="font-semibold text-lg text-[var(--color-text)] dark:text-white">{rec.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{rec.description}</p>
                  </div>
                  <div className="text-right space-y-1">
                    {/* Dual Rating System */}
                    {(rec.mtRating || rec.googleRating) && (
                      <div className="space-y-1">
                        {rec.mtRating && rec.mtRating > 0 && (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-xs text-gray-500 dark:text-gray-400">MT</span>
                            <Star className="h-3.5 w-3.5 text-[var(--color-primary-hover)] dark:text-turquoise-400 fill-current" />
                            <span className="text-sm font-medium text-[var(--color-text)] dark:text-white">{rec.mtRating.toFixed(1)}</span>
                            {rec.mtReviewCount && <span className="text-xs text-gray-500 dark:text-gray-400">({rec.mtReviewCount})</span>}
                          </div>
                        )}
                        {rec.googleRating && rec.googleRating > 0 && (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Google</span>
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-[var(--color-text)] dark:text-white">{rec.googleRating.toFixed(1)}</span>
                            {rec.googleReviewCount && <span className="text-xs text-gray-500 dark:text-gray-400">({rec.googleReviewCount})</span>}
                          </div>
                        )}
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
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-600 flex items-center justify-center text-white font-semibold text-sm">
                      {userInfo?.profileImage ? (
                        <img src={userInfo.profileImage} alt={userInfo?.name || 'User'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (userInfo?.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)] dark:text-white">{userInfo?.name || 'Community Member'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isLocal ? `Local ${rec.city} resident` : `Visitor${userCountry ? ` from ${userCountry}` : ''}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connection Badge */}
                  {rec.friendConnection && (
                    <div className="text-xs text-[var(--color-primary-hover)] dark:text-turquoise-400 font-medium flex items-center gap-1">
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
                      // ESA Layer 13: Switch to map view and center on this recommendation
                      setSelectedRecommendation(rec);
                      setViewMode('map');
                      // Scroll to map after a brief delay to allow render
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
                    data-testid={`button-map-${rec.id}`}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    View on Map
                  </Button>
                  {rec.mtReviewCount && rec.mtReviewCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedRecommendation(rec)}
                      data-testid={`button-reviews-${rec.id}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      See MT Reviews ({rec.mtReviewCount})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
      
      {/* Empty State */}
      {(!recommendations || recommendations.length === 0) && (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No recommendations yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {city ? `Be the first to recommend a place in ${city}!` : 'Select a city to see recommendations.'}
          </p>
        </div>
      )}

      {/* MT Reviews Modal */}
      <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-card glass-depth-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[var(--color-text)] dark:text-white">
              {selectedRecommendation?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecommendation && (
            <div className="space-y-4">
              {/* Photo */}
              {selectedRecommendation.photos && selectedRecommendation.photos[0] && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={selectedRecommendation.photos[0]} 
                    alt={selectedRecommendation.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Ratings */}
              <div className="flex items-center gap-4">
                {selectedRecommendation.mtRating && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-ocean-50)] dark:bg-turquoise-900/20 rounded-lg">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-gray-300">MT Community</span>
                    <Star className="h-5 w-5 text-[var(--color-primary-hover)] dark:text-turquoise-400 fill-current" />
                    <span className="text-lg font-bold text-[var(--color-text)] dark:text-white">{selectedRecommendation.mtRating.toFixed(1)}</span>
                    {selectedRecommendation.mtReviewCount && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">({selectedRecommendation.mtReviewCount} reviews)</span>
                    )}
                  </div>
                )}
                {selectedRecommendation.googleRating && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-gray-300">Google</span>
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-[var(--color-text)] dark:text-white">{selectedRecommendation.googleRating.toFixed(1)}</span>
                    {selectedRecommendation.googleReviewCount && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">({selectedRecommendation.googleReviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-[var(--color-text)] dark:text-white mb-2">Description</h4>
                <p className="text-[var(--color-text-secondary)] dark:text-gray-300">{selectedRecommendation.description}</p>
              </div>

              {/* Location & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[var(--color-text)] dark:text-white mb-2">Location</h4>
                  <div className="flex items-start gap-2 text-[var(--color-text-secondary)] dark:text-gray-300">
                    <MapPin className="h-5 w-5 text-[var(--color-primary-hover)] mt-0.5" />
                    <span>{selectedRecommendation.address}</span>
                  </div>
                </div>
                
                {selectedRecommendation.priceLevel && (
                  <div>
                    <h4 className="font-semibold text-[var(--color-text)] dark:text-white mb-2">Price Level</h4>
                    <p className="text-2xl text-[var(--color-text-secondary)] dark:text-gray-300">{getPriceLevelDisplay(selectedRecommendation.priceLevel)}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {selectedRecommendation.tags && selectedRecommendation.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[var(--color-text)] dark:text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecommendation.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-turquoise-100 dark:bg-turquoise-900/30 text-turquoise-700 dark:text-turquoise-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommender */}
              {selectedRecommendation.user && (
                <div className="pt-4 border-t border-[var(--color-border)] dark:border-gray-700">
                  <h4 className="font-semibold text-[var(--color-text)] dark:text-white mb-3">Recommended By</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-600 flex items-center justify-center text-white font-semibold">
                      {selectedRecommendation.user.profileImage ? (
                        <img 
                          src={selectedRecommendation.user.profileImage} 
                          alt={selectedRecommendation.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        selectedRecommendation.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)] dark:text-white">{selectedRecommendation.user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedRecommendation.user.city && selectedRecommendation.user.country 
                          ? `${selectedRecommendation.user.city}, ${selectedRecommendation.user.country}`
                          : selectedRecommendation.user.country || 'Community Member'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ESA Layer 24: Original Post/Memory Card */}
              {linkedPost && (
                <div className="pt-4 border-t border-[var(--color-border)] dark:border-gray-700">
                  <h4 className="font-semibold text-[var(--color-text)] dark:text-white mb-3">Original Recommendation Post</h4>
                  <div className="glass-card glass-depth-1 rounded-lg p-4 space-y-3">
                    {/* Post Author */}
                    {linkedPost.author && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {linkedPost.author.profileImage ? (
                            <img 
                              src={linkedPost.author.profileImage} 
                              alt={linkedPost.author.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            linkedPost.author.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[var(--color-text)] dark:text-white">{linkedPost.author.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(linkedPost.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <p className="text-[var(--color-text-secondary)] dark:text-gray-300 text-sm leading-relaxed">
                      {linkedPost.content || linkedPost.plainText}
                    </p>

                    {/* Post Image */}
                    {linkedPost.imageUrl && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={linkedPost.imageUrl} 
                          alt="Post image"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Post Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-[var(--color-border)] dark:border-gray-700">
                      {linkedPost.likes > 0 && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {linkedPost.likes}
                        </span>
                      )}
                      {linkedPost.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {linkedPost.comments}
                        </span>
                      )}
                      {linkedPost.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {linkedPost.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State for Post */}
              {isPostLoading && selectedRecommendation?.postId && (
                <div className="pt-4 border-t border-[var(--color-border)] dark:border-gray-700">
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-turquoise-500"></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-gradient-to-br from-turquoise-400 to-ocean-500 hover:from-turquoise-500 hover:to-ocean-600 text-white"
                  onClick={() => {
                    if (selectedRecommendation.lat && selectedRecommendation.lng) {
                      const placeName = encodeURIComponent(selectedRecommendation.title);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${placeName}+${selectedRecommendation.lat},${selectedRecommendation.lng}`, '_blank');
                    }
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}