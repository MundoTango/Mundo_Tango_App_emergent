import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Plus, Users, Globe, Lock, Star, MapPin, UserPlus, Calendar, MessageCircle, Heart, Music, Code } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import CommunityCard from '@/components/Community/CommunityCard';
import EnhancedCityGroupCard from '@/components/Community/EnhancedCityGroupCard';
import GroupSearch from '@/components/groups/GroupSearch';
import RecommendedGroups from '@/components/groups/RecommendedGroups';

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // GSAP scroll reveal for community cards - Aurora Tide standards
  const gridRef = useScrollReveal(
    '.community-card-item',
    { opacity: 0, y: 30 },
    { 
      start: 'top 80%',
      stagger: 0.1,
      respectReducedMotion: true
    }
  );
  
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
  };
  
  const handleClearFilters = () => {
    setSearchResults(null);
  };

  // Fetch groups data with membership status
  const { data: groupsData, isLoading } = useQuery({
    queryKey: ['/api/groups'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await fetch('/api/groups', {
        credentials: 'include'
      });
      const data = await response.json();
      return data;
    }
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/user/join-group/${slug}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined Community!",
        description: "You have successfully joined this community.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    }
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/user/leave-group/${slug}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to leave group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Left Community",
        description: "You have left this community.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    }
  });

  // Get statistics based on groups data
  const stats = {
    totalCommunities: groupsData?.length || 6,
    joinedCommunities: groupsData?.filter((g: any) => g.isMember || g.membershipStatus === 'member').length || 2,
    totalEvents: 132, // This would come from a separate API
    cities: new Set(groupsData?.map((g: any) => g.city).filter(Boolean)).size || 4
  };

  // Get event counts per group (will be replaced with real API data)
  const getEventCount = (groupId: number) => {
    return 0;
  };

  // Filter groups based on active filter and search
  const filteredGroups = groupsData?.filter((group: any) => {
    const matchesSearch = searchQuery === '' || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case 'city':
        return group.type === 'city';
      case 'professional':
        return group.role_type && ['teacher', 'performer', 'organizer'].includes(group.role_type);
      case 'music':
        return group.role_type && ['musician', 'dj'].includes(group.role_type);
      case 'practice':
        return group.type === 'practice';
      case 'festivals':
        return group.type === 'festival';
      default:
        return true;
    }
  }) || [];
  
  const displayedGroups = searchResults !== null ? searchResults : filteredGroups;

  const filterButtons = [
    { key: 'all', label: 'All Communities', icon: Globe },
    { key: 'city', label: 'City Groups', icon: MapPin },
    { key: 'professional', label: 'Professional', icon: Users },
    { key: 'music', label: 'Music', icon: Music },
    { key: 'practice', label: 'Practice', icon: Code },
    { key: 'festivals', label: 'Festivals', icon: Calendar }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-groups">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-page-title">Tango Communities</h1>
          <p className="text-gray-600 mb-3">Connect with tango dancers around the world</p>
          <button
            onClick={() => setLocation('/community-world-map')}
            className="text-turquoise-600 hover:text-turquoise-700 font-medium text-sm"
            data-testid="button-view-world-map"
          >
            View Community World Map →
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glassmorphic-card rounded-xl p-6 text-center shadow-lg backdrop-blur-xl bg-white/70 border border-white/50" data-testid="card-stat-total-communities">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mx-auto mb-3">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalCommunities}</div>
            <div className="text-sm text-gray-600">Total Communities</div>
          </div>
          <div className="glassmorphic-card rounded-xl p-6 text-center shadow-lg backdrop-blur-xl bg-white/70 border border-white/50" data-testid="card-stat-joined-communities">
            <div className="flex items-center justify-center w-12 h-12 bg-pink-100 text-pink-600 rounded-full mx-auto mb-3">
              <Heart className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.joinedCommunities}</div>
            <div className="text-sm text-gray-600">Joined Communities</div>
          </div>
          <div className="glassmorphic-card rounded-xl p-6 text-center shadow-lg backdrop-blur-xl bg-white/70 border border-white/50" data-testid="card-stat-total-events">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mx-auto mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalEvents}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="glassmorphic-card rounded-xl p-6 text-center shadow-lg backdrop-blur-xl bg-white/70 border border-white/50" data-testid="card-stat-cities">
            <div className="flex items-center justify-center w-12 h-12 bg-turquoise-100 text-turquoise-600 rounded-full mx-auto mb-3">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.cities}</div>
            <div className="text-sm text-gray-600">Cities</div>
          </div>
        </div>

        {/* Advanced Search Component */}
        <div data-testid="component-group-search">
          <GroupSearch 
            onSearchResults={handleSearchResults}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeFilter === filter.key
                  ? 'bg-gradient-to-r from-[#8E142E] to-[#0D448A] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              data-testid={`button-filter-${filter.key}`}
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </button>
          ))}
        </div>

        {/* AI Recommendations */}
        <RecommendedGroups />

        {/* Communities Grid */}
        {isLoading ? (
          <div className="text-center py-12" data-testid="loading-communities">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading communities...</p>
          </div>
        ) : displayedGroups.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="list-communities">
            {displayedGroups.map((group: any) => {
              // Use EnhancedCityGroupCard for city groups
              if (group.type === 'city') {
                return (
                  <div key={group.id} className="community-card-item" data-testid={`card-community-${group.slug}`}>
                    <EnhancedCityGroupCard
                      group={{
                        id: group.id,
                        name: group.name,
                        slug: group.slug,
                        description: group.description,
                        imageUrl: group.image_url || group.imageUrl,
                        city: group.city,
                        country: group.country,
                        memberCount: group.member_count || group.memberCount || 0,
                        eventCount: getEventCount(group.id),
                        isJoined: group.membershipStatus === 'member',
                        type: group.type
                      }}
                      onJoin={() => joinGroupMutation.mutate(group.slug)}
                      onLeave={() => leaveGroupMutation.mutate(group.slug)}
                      testIdSuffix={group.slug}
                    />
                  </div>
                );
              }
              
              // Use regular CommunityCard for other groups
              return (
                <div key={group.id} className="community-card-item" data-testid={`card-community-${group.slug}`}>
                  <CommunityCard
                    community={{
                      id: group.id,
                      name: group.name,
                      description: group.description || 'Connect with fellow tango enthusiasts and share your passion.',
                      imageUrl: group.image_url,
                      location: group.city && group.country ? `${group.city}, ${group.country}` : (group.city || group.country || 'Global'),
                      memberCount: group.member_count || 0,
                      eventCount: getEventCount(group.id),
                      isJoined: group.membershipStatus === 'member'
                    }}
                    onJoin={() => joinGroupMutation.mutate(group.slug)}
                    onLeave={() => leaveGroupMutation.mutate(group.slug)}
                    onClick={() => setLocation(`/groups/${group.slug}`)}
                    testIdSuffix={group.slug}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="empty-state-no-communities">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your search or filters to find communities that match your interests.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

