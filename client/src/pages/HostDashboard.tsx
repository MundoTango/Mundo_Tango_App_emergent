import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Plus,
  MapPin,
  Users,
  Calendar,
  Settings,
  Eye,
  Edit,
  BarChart3,
  MessageCircle,
  Star
} from 'lucide-react';

// Aurora Tide Components
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, ScaleIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { PulseButton, MagneticButton } from '@/components/interactions/MicroInteractions';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface HostHome {
  id: number;
  title: string;
  city: string;
  state?: string;
  country: string;
  maxGuests: number;
  photos: Array<{ url: string; displayOrder: number }>;
  isActive: boolean;
  whoCanBook?: string;
  minimumClosenessScore?: number;
  createdAt: string;
}

export default function HostDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
  // Aurora Tide: GSAP Scroll Reveal for property cards
  const propertyCardsRef = useScrollReveal('.property-card', {
    opacity: 0,
    y: 30,
  }, {
    stagger: 0.15,
    start: 'top 85%',
    once: true,
    respectReducedMotion: true,
  });

  // Fetch user's host homes
  const { data: response, isLoading } = useQuery<{ success: boolean; data: HostHome[] }>({
    queryKey: [`/api/host-homes/user/${user?.id}`],
    enabled: !!user?.id
  });

  const properties = response?.data || [];
  const hasProperties = properties.length > 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // First-time host - no properties yet (Aurora Tide)
  if (!hasProperties) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <GlassCard depth={3} className="p-12 text-center border-cyan-200/30 dark:border-cyan-500/30">
              <ScaleIn delay={0.1}>
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="w-12 h-12 text-white" />
                </div>
              </ScaleIn>
              
              <FadeIn delay={0.2}>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {t('housing.host_dashboard.welcome_title', 'Welcome to Hosting!')}
                </h1>
                
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                  {t('housing.host_dashboard.welcome_description', 'Share your space with the tango community. Connect with dancers from around the world and offer them a home away from home during their travels.')}
                </p>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                <GlassCard depth={1} className="p-6 border-cyan-200/30 dark:border-cyan-500/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                    {t('housing.host_dashboard.connection_based_title', 'Connection-Based')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.connection_based_desc', 'Control who can book based on your friendship connections and closeness scores')}
                  </p>
                </GlassCard>

                <GlassCard depth={1} className="p-6 border-cyan-200/30 dark:border-cyan-500/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                    {t('housing.host_dashboard.community_trust_title', 'Community Trust')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.community_trust_desc', 'Host verified tango community members you\'re connected with')}
                  </p>
                </GlassCard>

                <GlassCard depth={1} className="p-6 border-cyan-200/30 dark:border-cyan-500/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                    {t('housing.host_dashboard.your_schedule_title', 'Your Schedule')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.your_schedule_desc', 'Manage availability and approve booking requests on your terms')}
                  </p>
                </GlassCard>
              </StaggerContainer>

              <ScaleIn delay={0.4}>
                <PulseButton
                  onClick={() => navigate('/host-onboarding')}
                  className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold px-6 py-3 text-lg"
                  pulseColor="rgba(6, 182, 212, 0.6)"
                  data-testid="button-create-first-listing"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t('housing.host_dashboard.create_first_listing', 'Create Your First Listing')}
                </PulseButton>
              </ScaleIn>
            </GlassCard>
          </FadeIn>
        </div>
      </DashboardLayout>
    );
  }

  // Existing host - show properties (Aurora Tide)
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header - Aurora Tide */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {t('housing.host_dashboard.my_properties', 'My Properties')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                {t('housing.host_dashboard.manage_listings', 'Manage your listings and booking requests')}
              </p>
            </div>
            <PulseButton
              onClick={() => navigate('/host-onboarding')}
              className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold"
              pulseColor="rgba(6, 182, 212, 0.6)"
              data-testid="button-add-property"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('housing.host_dashboard.add_new_property', 'Add New Property')}
            </PulseButton>
          </div>
        </FadeIn>

        {/* Quick Stats - Aurora Tide */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScaleIn delay={0.1}>
            <GlassCard depth={2} className="p-4 border-cyan-200/30 dark:border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{properties.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.active_listings', 'Active Listings')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScaleIn>

          <ScaleIn delay={0.2}>
            <GlassCard depth={2} className="p-4 border-cyan-200/30 dark:border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.pending_requests', 'Pending Requests')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScaleIn>

          <ScaleIn delay={0.3}>
            <GlassCard depth={2} className="p-4 border-cyan-200/30 dark:border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.total_guests', 'Total Guests')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScaleIn>

          <ScaleIn delay={0.4}>
            <GlassCard depth={2} className="p-4 border-cyan-200/30 dark:border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">-</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.avg_rating', 'Avg Rating')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScaleIn>
        </StaggerContainer>

        {/* Properties Grid - Aurora Tide + GSAP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={propertyCardsRef}>
          {properties.map((property, index) => (
            <ScaleIn key={property.id} delay={index * 0.1}>
              <GlassCard depth={2} className="property-card overflow-hidden border-cyan-200/30 dark:border-cyan-500/30 hover:glass-depth-3 transition-all">
                {/* Property Image */}
                <div className="relative h-48 bg-gradient-to-br from-cyan-500 to-teal-500">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[0].url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3">
                    <Badge className={property.isActive ? 'bg-green-500' : 'bg-gray-500'} data-testid={`badge-status-${property.id}`}>
                      {property.isActive ? t('housing.host_dashboard.status_active', 'Active') : t('housing.host_dashboard.status_inactive', 'Inactive')}
                    </Badge>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-slate-900 dark:text-white" data-testid={`text-property-${property.id}`}>
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>{property.city}, {property.country}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>{t('housing.host_dashboard.up_to_guests', 'Up to {{count}} guests', { count: property.maxGuests })}</span>
                  </div>

                  {/* Connection-based access */}
                  {property.whoCanBook && (
                    <div className="mb-4 p-2 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 rounded text-sm border border-cyan-200/30 dark:border-cyan-500/30">
                      <span className="font-medium text-cyan-900 dark:text-cyan-100">
                        {property.whoCanBook === 'friends_only' && t('housing.host_dashboard.friends_only', '🔒 Friends only')}
                        {property.whoCanBook === 'friends_of_friends' && t('housing.host_dashboard.friends_and_fof', '🤝 Friends & FOF')}
                        {property.whoCanBook === 'all_connected' && t('housing.host_dashboard.all_connected', '🌐 All connected')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <MagneticButton
                      strength={0.15}
                      onClick={() => navigate(`/listing/${property.id}`)}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 p-2 flex items-center justify-center"
                      data-testid={`button-view-${property.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </MagneticButton>
                    
                    <MagneticButton
                      strength={0.15}
                      onClick={() => navigate(`/host/edit/${property.id}`)}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 p-2 flex items-center justify-center"
                      data-testid={`button-edit-${property.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </MagneticButton>
                    
                    <MagneticButton
                      strength={0.15}
                      onClick={() => navigate(`/host-calendar?propertyId=${property.id}`)}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 p-2 flex items-center justify-center"
                      data-testid={`button-calendar-${property.id}`}
                    >
                      <Calendar className="w-4 h-4" />
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
            </ScaleIn>
          ))}
        </div>

        {/* Quick Actions - Aurora Tide */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScaleIn delay={0.1}>
            <GlassCard
              depth={2}
              className="p-6 cursor-pointer border-cyan-200/30 dark:border-cyan-500/30 hover:glass-depth-3 transition-all"
              onClick={() => navigate('/host-bookings')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    {t('housing.host_dashboard.manage_bookings', 'Manage Bookings')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.manage_bookings_desc', 'Review and respond to booking requests')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScaleIn>

          <ScaleIn delay={0.2}>
            <GlassCard
              depth={2}
              className="p-6 cursor-pointer border-cyan-200/30 dark:border-cyan-500/30 hover:glass-depth-3 transition-all"
              onClick={() => navigate('/host/analytics')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    {t('housing.host_dashboard.view_analytics', 'View Analytics')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.host_dashboard.view_analytics_desc', 'Track your hosting performance')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScaleIn>
        </StaggerContainer>
      </div>
    </DashboardLayout>
  );
}
