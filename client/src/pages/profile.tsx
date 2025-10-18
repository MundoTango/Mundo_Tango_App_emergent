import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/layouts/DashboardLayout';
import EnhancedProfileHeader from '@/components/profile/EnhancedProfileHeader';
import StoryHighlights from '@/components/profile/StoryHighlights';
import ProfileHead from '@/components/profile/ProfileHead';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { GuestProfileDisplay } from '@/components/GuestProfile/GuestProfileDisplay';
import { Camera, Video, Users, Calendar, Star, UserCheck, Globe, PenLine, UserCircle, Sparkles, MapPin, Eye, GraduationCap, Music, Heart, MoreHorizontal, Plus, Edit2, Flame, Share2, MessageCircle, UserPlus } from 'lucide-react';
import { ProfileMemoryPostModal } from '@/components/profile/ProfileMemoryPostModal';
import { ProfileAboutSection } from '@/components/profile/ProfileAboutSection';
import { ProfileEngagementFeatures } from '@/components/profile/ProfileEngagementFeaturesSimplified';
import EditProfileModal from '@/components/profile/EditProfileModal';
import PostCreator from '@/components/universal/PostCreator';

// ESA Performance: Import optimized lazy-loaded components
import {
  LazyUserPhotosGallery,
  LazyUserVideosGallery,
  LazyUserFriendsList,
  LazyUserEventsList,
  LazyTravelDetailsComponent,
  LazyGuestProfileDisplay,
  GalleryFallback,
  ListFallback
} from '@/components/profile/OptimizedProfileComponents';
import PostFeed from '@/components/moments/PostFeed';

// Phase 5: Production Hardening imports
import ProfileErrorBoundary from '@/components/profile/ProfileErrorBoundary';
import { withRetry, withTimeout } from '@/utils/retryLogic';
import { measureComponentRender, measureApiCall } from '@/utils/performanceMonitor';
import { 
  ProfileHeaderFallback, 
  PostsFallback, 
  TravelDetailsFallback,
  EventsFallback,
  PhotosFallback,
  VideosFallback,
  FriendsFallback,
  ExperienceFallback,
  GuestProfileFallback,
  OfflineIndicator,
  NetworkErrorRetry
} from '@/components/profile/ProfileFallbacks';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation(); // Mundo Tango ESA LIFE CEO - Navigation fix
  // Mundo Tango ESA LIFE CEO - Get tab from URL parameter
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'memories';
    }
    return 'memories';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [showMemoryPostModal, setShowMemoryPostModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Track component performance and handle URL parameter changes
  useEffect(() => {
    const stopMeasure = measureComponentRender('Profile');
    
    // Mundo Tango ESA LIFE CEO - Update tab when URL changes
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      stopMeasure();
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Check online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch user stats with retry logic
  const { data: statsData, error: statsError } = useQuery({
    queryKey: ['/api/user/stats', user?.id],
    queryFn: async () => {
      const tracker = measureApiCall('/api/user/stats');
      try {
        const response = await withRetry(
          () => withTimeout(
            () => fetch(`/api/user/stats`, { credentials: 'include' }),
            5000
          )
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        tracker.complete(response.status);
        return result.data || {};
      } catch (error) {
        tracker.error(error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: false
  });

  // Fetch guest profile with retry logic
  const { data: guestProfile, isLoading: guestProfileLoading, error: guestProfileError } = useQuery({
    queryKey: ['/api/guest-profiles', user?.id],
    queryFn: async () => {
      const tracker = measureApiCall('/api/guest-profiles');
      try {
        const response = await withRetry(
          () => withTimeout(
            () => fetch(`/api/guest-profiles`, { credentials: 'include' }),
            5000
          )
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        tracker.complete(response.status);
        return result.data;
      } catch (error) {
        tracker.error(error);
        throw error;
      }
    },
    enabled: !!user?.id && activeTab === 'guest-profile',
    retry: false
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const handleAddTravelDetails = () => {
    toast({
      title: t('profile.toast.travel_details_title', 'Travel Details'),
      description: t('profile.toast.travel_details_desc', 'Travel details functionality coming soon.'),
    });
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div 
          className="flex items-center justify-center h-64" 
          data-testid="loading-profile"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-gray-500">{t('profile.loading', 'Loading profile...')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProfileErrorBoundary>
      <DashboardLayout>
        {/* Offline Indicator */}
        {!isOnline && <OfflineIndicator />}
        
        <main 
          role="main" 
          aria-label={t('profile.aria.main', 'User profile page')}
          className="max-w-6xl mx-auto" 
          data-testid="profile-container"
        >
          {/* Enhanced Profile Header - Always Display */}
          <EnhancedProfileHeader
            user={user}
            stats={statsData || {}}
            isOwnProfile={true}
            onEditProfile={handleEditProfile}
          />

        {/* Story Highlights - REMOVED per user request */}

        {/* Profile Content Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList 
              className="w-full justify-start border-b rounded-none h-auto p-0"
              role="tablist"
              aria-label={t('profile.aria.sections', 'Profile sections')}
            >
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-about"
                role="tab"
                aria-selected={activeTab === 'about'}
                aria-controls="about-panel"
                id="about-tab"
              >
                <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.about', 'About')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-posts"
                role="tab"
                aria-selected={activeTab === 'posts'}
                aria-controls="posts-panel"
                id="posts-tab"
              >
                <span className="font-medium">{t('profile.tab.memories', 'Memories')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-events"
                role="tab"
                aria-selected={activeTab === 'events'}
                aria-controls="events-panel"
                id="events-tab"
              >
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.events', 'Events')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="travel" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-travel"
                role="tab"
                aria-selected={activeTab === 'travel'}
                aria-controls="travel-panel"
                id="travel-tab"
              >
                <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.travel', 'Travel')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-photos"
                role="tab"
                aria-selected={activeTab === 'photos'}
                aria-controls="photos-panel"
                id="photos-tab"
              >
                <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.photos', 'Photos')}</span>
              </TabsTrigger>

              <TabsTrigger 
                value="friends" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-friends"
                role="tab"
                aria-selected={activeTab === 'friends'}
                aria-controls="friends-panel"
                id="friends-tab"
              >
                <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.friends', 'Friends')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="experience" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-experience"
                role="tab"
                aria-selected={activeTab === 'experience'}
                aria-controls="experience-panel"
                id="experience-tab"
              >
                <Star className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.experience', 'Experience')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="guest-profile" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-guest-profile"
                role="tab"
                aria-selected={activeTab === 'guest-profile'}
                aria-controls="guest-profile-panel"
                id="guest-profile-tab"
              >
                <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.guest_profile', 'Guest Profile')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="engagement" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
                data-testid="tab-engagement"
                role="tab"
                aria-selected={activeTab === 'engagement'}
                aria-controls="engagement-panel"
                id="engagement-tab"
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('profile.tab.engagement', 'Engagement')}</span>
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent 
                value="about" 
                className="space-y-4"
                role="tabpanel"
                id="about-panel"
                aria-labelledby="about-tab"
                hidden={activeTab !== 'about'}
              >
                {/* About Section with Guest Profile Tab */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <ProfileAboutSection 
                      user={user} 
                      isOwnProfile={true}
                      currentUserId={user?.id}
                      isFriend={false}
                    />
                  </div>
                  
                  {/* Guest Profile in Side Panel */}
                  <div className="lg:col-span-1">
                    <Card className="glassmorphic-card" data-testid="card-guest-profile-preview">
                      <CardContent className="p-4">
                        <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-4">
                          {t('profile.section.guest_profile', 'Guest Profile')}
                        </h3>
                        {guestProfileError ? (
                          <div className="text-center p-4" data-testid="error-guest-profile">
                            <p className="text-sm text-red-600">{t('profile.error.guest_profile_loading', 'Error loading guest profile')}</p>
                          </div>
                        ) : guestProfileLoading ? (
                          <div 
                            className="animate-pulse space-y-2" 
                            data-testid="loading-guest-profile"
                            role="status"
                            aria-live="polite"
                            aria-busy="true"
                          >
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ) : guestProfile ? (
                          <div className="space-y-3" data-testid="guest-profile-verified">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">{t('profile.status.verified_guest', 'Verified Guest')}</span>
                            </div>
                            <p className="text-xs text-gray-600">{t('profile.guest.ready_to_request', 'Ready to request stays with hosts')}</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full text-xs border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                              data-testid="button-view-guest-profile"
                              aria-label={t('profile.aria.view_guest_profile', 'View full guest profile details')}
                            >
                              {t('profile.button.view_full_profile', 'View Full Profile')}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-3" data-testid="empty-state-guest-profile">
                            <UserCheck className="w-8 h-8 text-gray-300 mx-auto" />
                            <p className="text-xs text-gray-600">{t('profile.guest.create_description', 'Create your guest profile to be housed by Hosts in the global tango community')}</p>
                            <Button 
                              size="sm"
                              onClick={() => setLocation('/guest-onboarding')}
                              className="w-full text-xs bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                              data-testid="button-create-guest-profile"
                              aria-label={t('profile.aria.create_guest_profile', 'Create guest profile to stay with hosts')}
                            >
                              {t('profile.button.create_profile', 'Create Profile')}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent 
                value="posts" 
                className="space-y-4"
                role="tabpanel"
                id="posts-panel"
                aria-labelledby="posts-tab"
                hidden={activeTab !== 'posts'}
              >
                {/* New Layout: Side Panel + Main Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Side Panel - About/Travel/Friends */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* About Section */}
                    <Card className="glassmorphic-card" data-testid="card-about-preview">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">{t('profile.section.about', 'About')}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab('about')}
                            className="text-xs text-turquoise-600 hover:text-turquoise-700"
                            data-testid="button-edit-about"
                            aria-label={t('profile.aria.edit_about', 'Edit about section')}
                            aria-controls="about-panel"
                          >
                            {t('profile.button.edit', 'Edit')}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {(user as any)?.bio || t('profile.empty.share_story', 'Share your tango story...')}
                        </p>
                        {(user as any)?.tangoRoles && (user as any).tangoRoles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(typeof (user as any).tangoRoles === 'string' ? JSON.parse((user as any).tangoRoles) : (user as any).tangoRoles).slice(0, 2).map((role: string) => (
                              <Badge key={role} variant="secondary" className="text-xs bg-turquoise-100 text-turquoise-700">
                                {role.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Travel Section */}
                    <Card className="glassmorphic-card" data-testid="card-travel-preview">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">{t('profile.section.travel', 'Travel')}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab('travel')}
                            className="text-xs text-turquoise-600 hover:text-turquoise-700"
                            data-testid="button-view-travel"
                          >
                            {t('profile.button.view', 'View')}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-turquoise-500" />
                            <span className="text-sm text-gray-600">
                              {(user as any)?.city ? `${(user as any).city}${(user as any).country ? `, ${(user as any).country}` : ''}` : t('profile.empty.add_location', 'Add location')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-cyan-500" />
                            <span className="text-sm text-gray-600">
                              {(user as any)?.languages ? t('profile.stat.languages_count', '{{count}} languages', { count: (user as any).languages.length }) : t('profile.empty.add_languages', 'Add languages')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Friends Section */}
                    <Card className="glassmorphic-card" data-testid="card-friends-preview">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">{t('profile.section.friends', 'Friends')}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab('friends')}
                            className="text-xs text-turquoise-600 hover:text-turquoise-700"
                            data-testid="button-view-friends"
                          >
                            {t('profile.button.view_all', 'View All')}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {statsData?.friendsCount ? t('profile.stat.friends_count', '{{count}} friends', { count: statsData.friendsCount }) : t('profile.empty.no_friends', 'No friends yet')}
                          </p>
                          {/* Friend Avatars Preview */}
                          <div className="flex -space-x-2">
                            {[1,2,3].map((i) => (
                              <div key={i} className="w-6 h-6 bg-gradient-to-br from-turquoise-100 to-cyan-100 rounded-full border-2 border-white flex items-center justify-center">
                                <Users className="w-3 h-3 text-turquoise-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Feed Area */}
                  <div className="lg:col-span-3 space-y-4">
                    {/* Beautiful Post Creator - Same as Main Memories Feed */}
                    <PostCreator 
                      context={{ type: 'memory' }}
                      user={user || undefined}
                      onPostCreated={() => {
                        setRefreshKey(prev => prev + 1);
                        queryClient.invalidateQueries({ queryKey: ['/api/user/posts'] });
                      }}
                    />
                    
                    {/* Unified PostFeed - Integrated with platform architecture */}
                    {user?.id ? (
                      <PostFeed 
                        key={refreshKey}
                        context={{ 
                          type: 'profile', 
                          userId: user.id 
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent 
                value="events" 
                className="space-y-4"
                role="tabpanel"
                id="events-panel"
                aria-labelledby="events-tab"
                hidden={activeTab !== 'events'}
              >
                {/* Enhanced Events Section */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        {t('profile.events.title', 'Tango Events')}
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                        data-testid="button-create-event"
                        aria-label={t('profile.aria.create_event', 'Create a new tango event')}
                      >
                        <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                        {t('profile.button.create_event', 'Create Event')}
                      </Button>
                    </div>
                    
                    {/* Event Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-gradient-to-br from-turquoise-50 to-cyan-50 border-turquoise-200" data-testid="stat-upcoming-events">
                        <CardContent className="p-4 text-center">
                          <Calendar className="w-8 h-8 mx-auto text-turquoise-600 mb-2" />
                          <h4 className="font-semibold text-turquoise-800">{t('profile.events.upcoming', 'Upcoming Events')}</h4>
                          <p className="text-turquoise-600 text-sm">{t('profile.stat.events_count', '{{count}} events', { count: statsData?.eventsCount || 0 })}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200" data-testid="stat-hosting-events">
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 mx-auto text-cyan-600 mb-2" />
                          <h4 className="font-semibold text-cyan-800">{t('profile.events.hosting', 'Hosting')}</h4>
                          <p className="text-cyan-600 text-sm">{t('profile.stat.events_count', '{{count}} events', { count: statsData?.hostingCount || 0 })}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-turquoise-50 border-blue-200" data-testid="stat-attended-events">
                        <CardContent className="p-4 text-center">
                          <Star className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                          <h4 className="font-semibold text-blue-800">{t('profile.events.attended', 'Attended')}</h4>
                          <p className="text-blue-600 text-sm">{t('profile.stat.events_count', '{{count}} events', { count: statsData?.attendedCount || 0 })}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Event List Placeholder */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">{t('profile.events.recent', 'Recent Events')}</h4>
                      <div 
                        className="text-center p-8 bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-lg border-2 border-dashed border-turquoise-200" 
                        data-testid="empty-state-no-events"
                        role="status"
                        aria-live="polite"
                      >
                        <Calendar className="w-12 h-12 mx-auto text-turquoise-400 mb-4" aria-hidden="true" />
                        <h5 className="text-lg font-medium text-turquoise-700 mb-2">{t('profile.empty.no_events', 'No events yet')}</h5>
                        <p className="text-turquoise-600 text-sm mb-4">
                          {t('profile.empty.events_desc', 'Start attending milongas, workshops, and festivals to see them here.')}
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                          onClick={() => setActiveTab('about')}
                          data-testid="button-explore-events"
                          aria-label={t('profile.aria.explore_events', 'Explore events to add to your profile')}
                        >
                          {t('profile.button.explore_events', 'Explore Events')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent 
                value="travel" 
                className="space-y-4"
                role="tabpanel"
                id="travel-panel"
                aria-labelledby="travel-tab"
                hidden={activeTab !== 'travel'}
              >
                <Suspense fallback={<TravelDetailsFallback />}>
                  <LazyTravelDetailsComponent 
                    userId={user?.id || 0} 
                    isOwnProfile={true} 
                  />
                </Suspense>
              </TabsContent>

              <TabsContent 
                value="photos" 
                className="space-y-4"
                role="tabpanel"
                id="photos-panel"
                aria-labelledby="photos-tab"
                hidden={activeTab !== 'photos'}
              >
                {/* Combined Media Tab with Filters */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        {t('profile.media.gallery_title', 'Media Gallery')}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50" 
                          data-testid="button-upload-photo"
                          aria-label={t('profile.aria.upload_photo', 'Upload profile photo')}
                        >
                          <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
                          {t('profile.button.upload_photo', 'Upload Photo')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-cyan-200 text-cyan-700 hover:bg-cyan-50" 
                          data-testid="button-upload-video"
                          aria-label={t('profile.aria.upload_video', 'Upload profile video')}
                        >
                          <Video className="w-4 h-4 mr-2" aria-hidden="true" />
                          {t('profile.button.upload_video', 'Upload Video')}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Media Filter Tabs */}
                    <div className="flex items-center gap-2 mb-6">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white"
                      >
                        {t('profile.media.all_media', 'All Media')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        {t('profile.media.photos_only', '📸 Photos Only')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                      >
                        {t('profile.media.videos_only', '🎥 Videos Only')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        {t('profile.media.dance_videos', '🎵 Dance Videos')}
                      </Button>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Sample Media Items */}
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="relative group aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-turquoise-100 to-cyan-100 hover:shadow-lg transition-all cursor-pointer">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {item % 3 === 0 ? (
                              <Video className="w-8 h-8 text-turquoise-600" />
                            ) : (
                              <Camera className="w-8 h-8 text-cyan-600" />
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-white dark:bg-gray-900/80 text-gray-700"
                            >
                              {item % 3 === 0 ? t('profile.media.video', 'Video') : t('profile.media.photo', 'Photo')}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 bg-white dark:bg-gray-900/80 hover:bg-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Empty State */}
                    <div className="text-center p-8 bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-lg border-2 border-dashed border-turquoise-200 mt-6" data-testid="empty-state-no-media">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Camera className="w-8 h-8 text-turquoise-400" />
                        <Video className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h5 className="text-lg font-medium text-turquoise-700 mb-2">{t('profile.media.share_journey', 'Share Your Tango Journey')}</h5>
                      <p className="text-turquoise-600 text-sm mb-4">
                        {t('profile.media.upload_desc', 'Upload photos and videos of your tango experiences, performances, and memories.')}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                          data-testid="button-upload-photos-empty"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {t('profile.button.upload_photos', 'Upload Photos')}
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                          data-testid="button-upload-videos-empty"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          {t('profile.button.upload_videos', 'Upload Videos')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent 
                value="videos" 
                className="space-y-4"
                role="tabpanel"
                id="videos-panel"
                aria-labelledby="videos-tab"
                hidden={activeTab !== 'videos'}
              >
                {/* Redirect to Photos tab with video filter */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-12 text-center">
                    <Video className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t('profile.videos.redirect_title', 'Videos are now in Media Gallery')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('profile.videos.redirect_desc', 'We\'ve combined photos and videos into one place with smart filtering.')}
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                      onClick={() => setActiveTab('photos')}
                    >
                      {t('profile.button.view_media_gallery', 'View Media Gallery')}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent 
                value="friends" 
                className="space-y-4"
                role="tabpanel"
                id="friends-panel"
                aria-labelledby="friends-tab"
                hidden={activeTab !== 'friends'}
              >
                <Suspense fallback={<FriendsFallback />}>
                  <LazyUserFriendsList userId={user?.id || 0} isOwnProfile={true} />
                </Suspense>
              </TabsContent>

              <TabsContent 
                value="experience" 
                className="space-y-4"
                role="tabpanel"
                id="experience-panel"
                aria-labelledby="experience-tab"
                hidden={activeTab !== 'experience'}
              >
                {/* Tango Resume - Event-Tied Experience */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        {t('profile.experience.title', '🌟 Tango Resume')}
                      </h3>
                      <Badge variant="outline" className="border-turquoise-200 text-turquoise-700">
                        {t('profile.experience.event_based', 'Event-Based Experience')}
                      </Badge>
                    </div>
                    
                    {/* Resume Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <Card className="bg-gradient-to-br from-turquoise-50 to-cyan-50 border-turquoise-200" data-testid="stat-events-attended">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-turquoise-600">{statsData?.eventsAttended || 0}</div>
                          <div className="text-sm text-turquoise-700">{t('profile.experience.events_attended', 'Events Attended')}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200" data-testid="stat-roles-accepted">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-cyan-600">{statsData?.rolesAccepted || 0}</div>
                          <div className="text-sm text-cyan-700">{t('profile.experience.roles_accepted', 'Roles Accepted')}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-turquoise-50 border-blue-200" data-testid="stat-years-dancing">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{(user as any)?.yearsOfDancing || 0}</div>
                          <div className="text-sm text-blue-700">{t('profile.experience.years_dancing', 'Years Dancing')}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200" data-testid="stat-avg-rating">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">★ 4.8</div>
                          <div className="text-sm text-purple-700">{t('profile.experience.avg_rating', 'Avg Rating')}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Professional Experience by Category */}
                    <div className="space-y-6">
                      <h4 className="font-semibold text-gray-800 text-lg">{t('profile.experience.professional_title', 'Professional Experience')}</h4>
                      
                      {/* Teacher Experience */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-turquoise-600" />
                          <h5 className="font-semibold text-turquoise-700">{t('profile.experience.teaching', 'Teaching Experience')}</h5>
                        </div>
                        <div className="border-l-4 border-turquoise-400 pl-6 py-4 bg-gradient-to-r from-turquoise-50/30 to-transparent">
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-semibold text-gray-900 dark:text-white">Intermediate Tango Instructor</h6>
                              <p className="text-turquoise-600 font-medium">Buenos Aires Tango Festival 2024</p>
                              <p className="text-gray-600 text-sm">Taught advanced technique to 50+ international students</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>📅 Started: 2020</span>
                                <span>⭐ Years dancing: 8</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-turquoise-600 border-turquoise-200">
                              + Add Entry
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Organizer Experience */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-cyan-600" />
                          <h5 className="font-semibold text-cyan-700">{t('profile.experience.event_organization', 'Event Organization')}</h5>
                        </div>
                        <div className="border-l-4 border-cyan-400 pl-6 py-4 bg-gradient-to-r from-cyan-50/30 to-transparent">
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-semibold text-gray-900 dark:text-white">Milonga Organizer</h6>
                              <p className="text-cyan-600 font-medium">Monthly Practica Series</p>
                              <p className="text-gray-600 text-sm">Coordinated weekly events for 100+ dancers</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>📅 Started: 2022</span>
                                <span>⭐ Years dancing: 8</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-cyan-600 border-cyan-200">
                              + Add Entry
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* DJ Experience */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Music className="w-5 h-5 text-purple-600" />
                          <h5 className="font-semibold text-purple-700">{t('profile.experience.dj_experience', 'DJ Experience')}</h5>
                        </div>
                        <div className="border-l-4 border-purple-400 pl-6 py-4 bg-gradient-to-r from-purple-50/30 to-transparent">
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-semibold text-gray-900 dark:text-white">Resident DJ</h6>
                              <p className="text-purple-600 font-medium">La Milonguita Weekly</p>
                              <p className="text-gray-600 text-sm">Curated traditional tandas for intimate milonga setting</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>📅 Started: 2021</span>
                                <span>⭐ Years dancing: 8</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
                              + Add Entry
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-cyan-400 pl-6 py-4 bg-gradient-to-r from-cyan-50/30 to-transparent">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">DJ & Music Curator</h5>
                            <p className="text-cyan-600 font-medium">Milonga Luna - Weekly Series</p>
                            <p className="text-gray-600 text-sm">Curated and performed music for weekly milonga events</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>📅 Jan-Dec 2024</span>
                              <span>📍 Local Community</span>
                              <span>⭐ 4.7/5 dancer feedback</span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">{t('profile.experience.ongoing', 'Ongoing')}</Badge>
                        </div>
                      </div>

                      {/* Empty State */}
                      <div className="text-center p-8 bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-lg border-2 border-dashed border-turquoise-200" data-testid="empty-state-no-experience">
                        <Star className="w-12 h-12 mx-auto text-turquoise-400 mb-4" />
                        <h5 className="text-lg font-medium text-turquoise-700 mb-2">{t('profile.empty.build_resume', 'Build Your Tango Resume')}</h5>
                        <p className="text-turquoise-600 text-sm mb-4">
                          {t('profile.empty.resume_desc', 'When event organizers select you for roles and you accept, they\'ll automatically appear here as professional experience.')}
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                          onClick={() => setActiveTab('events')}
                          data-testid="button-browse-events"
                        >
                          {t('profile.button.browse_events', 'Browse Events')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent 
                value="guest-profile" 
                className="space-y-4"
                role="tabpanel"
                id="guest-profile-panel"
                aria-labelledby="guest-profile-tab"
                hidden={activeTab !== 'guest-profile'}
              >
                {guestProfileError ? (
                  <NetworkErrorRetry onRetry={() => queryClient.invalidateQueries({ queryKey: ['/api/guest-profiles'] })} />
                ) : guestProfileLoading ? (
                  <Card className="glassmorphic-card" data-testid="loading-guest-profile-full">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ) : guestProfile ? (
                  <GuestProfileDisplay 
                    profile={guestProfile} 
                    isOwnProfile={true}
                  />
                ) : (
                  <Card className="glassmorphic-card" data-testid="empty-state-no-guest-profile">
                    <CardContent className="p-12 text-center">
                      <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('profile.guest.no_profile_title', 'No Guest Profile')}</h3>
                      <p className="text-gray-600 mb-4">
                        {t('profile.guest.no_profile_desc', 'Create your guest profile to start browsing and requesting stays with hosts.')}
                      </p>
                      <a href="/guest-onboarding" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700" data-testid="button-create-guest-profile-full">
                        {t('profile.button.create_guest_profile', 'Create Guest Profile')}
                      </a>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* NEW: Engagement Features Tab */}
              <TabsContent 
                value="engagement" 
                className="space-y-4"
                role="tabpanel"
                id="engagement-panel"
                aria-labelledby="engagement-tab"
                hidden={activeTab !== 'engagement'}
              >
                <ProfileEngagementFeatures user={user} statsData={statsData} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      
      {/* Memory Post Modal */}
      <ProfileMemoryPostModal
        isOpen={showMemoryPostModal}
        onClose={() => setShowMemoryPostModal(false)}
        onMemoryCreated={() => {
          setShowMemoryPostModal(false);
          queryClient.invalidateQueries({ queryKey: ['/api/user/posts'] });
          toast({
            title: t('profile.toast.memory_posted_title', 'Memory Posted!'),
            description: t('profile.toast.memory_posted_desc', 'Your memory has been shared successfully.'),
          });
        }}
      />
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        user={user}
      />
    </DashboardLayout>
    </ProfileErrorBoundary>
  );
}