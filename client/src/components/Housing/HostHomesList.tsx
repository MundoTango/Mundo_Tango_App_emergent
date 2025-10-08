import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Home, MapPin, Users, Star, Filter, DollarSign, Bed, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ConnectionBadge } from '@/components/housing/ConnectionBadge';
import { GlassCard } from '../glass/GlassComponents';
import { FadeIn, ScaleIn, StaggerContainer } from '../animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '../interactions/MicroInteractions';

interface HostHome {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  city: string;
  state: string;
  country: string;
  pricePerNight: number;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  amenities: string[];
  photos: Array<{ url: string; displayOrder: number }>;
  host: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  distanceFromUser?: number;
  connectionDegree?: number;
  closenessScore?: number;
  rating?: number;
  reviewCount?: number;
}

interface HostHomesListProps {
  groupSlug?: string;
  city?: string;
  showFilters?: boolean;
  friendFilter?: string;
}

export default function HostHomesList({ groupSlug, city, showFilters = true, friendFilter: propFriendFilter }: HostHomesListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 500 },
    roomType: 'all',
    maxGuests: 1,
    friendFilter: propFriendFilter || 'all'
  });

  // Sync with prop changes
  useEffect(() => {
    if (propFriendFilter) {
      setFilters(prev => ({ ...prev, friendFilter: propFriendFilter }));
    }
  }, [propFriendFilter]);

  // Fetch host homes
  const { data: homes, isLoading } = useQuery({
    queryKey: ['/api/host-homes', { city, groupSlug, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (groupSlug) params.append('groupSlug', groupSlug);
      params.append('minPrice', filters.priceRange.min.toString());
      params.append('maxPrice', filters.priceRange.max.toString());
      if (filters.roomType !== 'all') params.append('roomType', filters.roomType);
      params.append('minGuests', filters.maxGuests.toString());
      if (filters.friendFilter !== 'all') params.append('friendFilter', filters.friendFilter);
      
      const response = await fetch(`/api/host-homes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch homes');
      const data = await response.json();
      return data.data as HostHome[];
    },
    enabled: !!city || !!groupSlug
  });

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'entire_place':
        return t('housing.homes_list.entire_place', 'Entire place');
      case 'private_room':
        return t('housing.homes_list.private_room', 'Private room');
      case 'shared_room':
        return t('housing.homes_list.shared_room', 'Shared room');
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-cyan-500 dark:border-t-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <FadeIn>
          <GlassCard depth={2} className="p-4 border-cyan-200/30 dark:border-cyan-500/30" data-testid="filters-card">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-[var(--color-primary-hover)] dark:text-cyan-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t('housing.homes_list.filter_housing', 'Filter Housing')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Room Type */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  {t('housing.homes_list.room_type', 'Room type')}
                </label>
                <select
                  value={filters.roomType}
                  onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                  className="w-full px-3 py-2 glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 rounded-lg text-slate-900 dark:text-white"
                  data-testid="select-room-type"
                >
                  <option value="all">{t('housing.homes_list.all_types', 'All types')}</option>
                  <option value="entire_place">{t('housing.homes_list.entire_place', 'Entire place')}</option>
                  <option value="private_room">{t('housing.homes_list.private_room', 'Private room')}</option>
                  <option value="shared_room">{t('housing.homes_list.shared_room', 'Shared room')}</option>
                </select>
              </div>

              {/* Guests */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  {t('housing.homes_list.guests', 'Guests')}
                </label>
                <select
                  value={filters.maxGuests}
                  onChange={(e) => setFilters({...filters, maxGuests: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 rounded-lg text-slate-900 dark:text-white"
                  data-testid="select-max-guests"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {t('housing.homes_list.guests_count', { defaultValue: '{{count}}+ guests', count: num })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Connection Filter */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  {t('housing.homes_list.connection', 'Connection')}
                </label>
                <select
                  value={filters.friendFilter}
                  onChange={(e) => setFilters({...filters, friendFilter: e.target.value})}
                  className="w-full px-3 py-2 glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 rounded-lg text-slate-900 dark:text-white"
                  data-testid="select-friend-filter"
                >
                  <option value="all">{t('housing.homes_list.all_hosts', 'All hosts')}</option>
                  <option value="1st_degree">{t('housing.homes_list.direct_friends', 'Direct friends (1st)')}</option>
                  <option value="2nd_degree">{t('housing.homes_list.friends_fof', 'Friends & FOF (1-2nd)')}</option>
                  <option value="3rd_degree">{t('housing.homes_list.extended_network', 'Extended network (1-3rd)')}</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </FadeIn>
      )}

      {/* Homes List */}
      <StaggerContainer staggerDelay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homes?.map((home) => (
            <ScaleIn key={home.id} delay={0.05}>
              <GlassCard 
                depth={2} 
                className="overflow-hidden border-cyan-200/30 dark:border-cyan-500/30 hover:border-[var(--color-ocean-300)]/50 dark:hover:border-cyan-400/50 transition-all duration-300" 
                data-testid={`home-card-${home.id}`}
              >
                {/* Main Photo */}
                <div className="relative h-48 bg-slate-200 dark:bg-slate-800">
                  {home.photos[0] ? (
                    <img 
                      src={home.photos[0].url} 
                      alt={home.title}
                      className="w-full h-full object-cover"
                      data-testid={`home-image-${home.id}`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="h-12 w-12 text-slate-400 dark:text-slate-600" />
                    </div>
                  )}
                  
                  {/* Connection Badge */}
                  {home.connectionDegree !== undefined && home.connectionDegree > 0 && (
                    <div className="absolute top-2 left-2">
                      <ConnectionBadge 
                        connectionDegree={home.connectionDegree}
                        closenessScore={home.closenessScore}
                        compact={true}
                      />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 text-slate-900 dark:text-white" data-testid={`home-title-${home.id}`}>
                        {home.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getRoomTypeLabel(home.roomType)} • {home.maxGuests} {t('housing.homes_list.guests', 'guests')}
                      </p>
                    </div>
                    {home.rating && (
                      <div className="flex items-center gap-1 glass-card glass-depth-1 px-2 py-1 rounded-lg border-cyan-200/30 dark:border-cyan-500/30">
                        <Star className="h-4 w-4 text-[var(--color-primary)] dark:text-cyan-400 fill-current" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{home.rating.toFixed(1)}</span>
                        {home.reviewCount !== undefined && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">({home.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <MapPin className="h-4 w-4 text-[var(--color-primary)] dark:text-cyan-400" />
                    <span>{home.city}, {home.state}</span>
                  </div>
                  
                  {/* Host Info */}
                  <div className="flex items-center gap-3 pt-3 border-t border-cyan-200/20 dark:border-cyan-800/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-ocean-400)] to-teal-600 dark:from-[var(--color-primary)] dark:to-teal-700 flex items-center justify-center text-white font-semibold text-sm">
                      {home.host.profileImage ? (
                        <img src={home.host.profileImage} alt={home.host.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        home.host.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{home.host.name}</p>
                      {home.host.id === user?.id && (
                        <span className="text-xs text-[var(--color-primary-hover)] dark:text-cyan-400 font-medium">
                          {t('housing.homes_list.your_listing', 'Your listing')}
                        </span>
                      )}
                    </div>
                    {home.host.id !== user?.id && (
                      <div className="flex gap-2">
                        <PulseButton 
                          onClick={() => setLocation(`/guest-onboarding?hostHomeId=${home.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-teal-500 text-white rounded-xl text-sm"
                          data-testid={`button-request-stay-${home.id}`}
                        >
                          {t('housing.homes_list.request_stay', 'Request Stay')}
                        </PulseButton>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </ScaleIn>
          ))}
        </div>
      </StaggerContainer>
      
      {/* Empty State */}
      {(!homes || homes.length === 0) && (
        <ScaleIn delay={0.2}>
          <GlassCard depth={2} className="text-center py-12 border-cyan-200/30 dark:border-cyan-500/30" data-testid="empty-state">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 glass-card glass-depth-1 rounded-full flex items-center justify-center border-cyan-200/30 dark:border-cyan-500/30">
                <Home className="h-8 w-8 text-[var(--color-primary)] dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {t('housing.homes_list.no_housing', 'No housing available')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {city 
                    ? t('housing.homes_list.no_hosts_in_city', { defaultValue: 'No hosts have listed properties in {{city}} yet.', city }) 
                    : t('housing.homes_list.select_city', 'Select a city to see available housing.')}
                </p>
              </div>
            </div>
          </GlassCard>
        </ScaleIn>
      )}
    </div>
  );
}
