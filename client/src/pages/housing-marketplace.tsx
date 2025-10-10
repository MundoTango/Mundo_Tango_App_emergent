import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useGSAP } from '@gsap/react';
import { AuroraVariants, FadeIn, ScaleIn } from '@/components/animations/FramerMotionWrappers';
import { GlassCard, GlassInput } from '@/components/glass/GlassComponents';
import { MagneticButton, RippleButton } from '@/components/interactions/MicroInteractions';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { 
  Home, 
  MapPin, 
  Calendar,
  Users,
  Bed,
  Bath,
  Wifi,
  Coffee,
  Car,
  Wind,
  Music,
  DollarSign,
  Euro,
  Search,
  Plus,
  Filter,
  Heart,
  Star,
  Clock,
  Check,
  Banknote,
  Video as VideoIcon
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Helper to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

interface HousingListing {
  id: number;
  title: string;
  description: string;
  city: string;
  state?: string;
  country: string;
  address?: string;
  pricePerNight: number;
  propertyType: string;
  roomType: string;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  amenities: string[];
  photos: Array<{ url: string; displayOrder: number }>;
  mediaOrder?: string[];
  thumbnailMedia?: string | null;
  host: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  rating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
}

export default function HousingMarketplace() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // New filter states
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(0);
  
  const { toast } = useToast();
  
  // Refs for GSAP animations
  const containerRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Filter options
  const roomTypes = ['Entire place', 'Private room', 'Shared room'];
  const amenitiesList = [
    'wifi', 'kitchen', 'washing_machine', 'air_conditioning', 
    'heating', 'parking', 'tango_practice_space', 'practice_floor',
    'sound_system', 'balcony', 'doorman', 'shared_kitchen'
  ];

  // Map UI type selection to API params
  const getTypeQueryParams = () => {
    if (selectedType === 'all') return {};
    // No API filtering by type - we'll filter on frontend
    // This allows flexibility since propertyType and roomType are different fields
    return {};
  };

  // Fetch listings from API
  const { data: listingsData, isLoading } = useQuery<{ data: HousingListing[] }>({
    queryKey: ['/api/host-homes', { 
      minPrice: priceRange.min, // Already in dollars
      maxPrice: priceRange.max,
      minGuests: guestCount,
      ...getTypeQueryParams()
    }]
  });

  const listings = listingsData?.data || [];

  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    kitchen: Coffee,
    air_conditioning: Wind,
    practice_floor: Music,
    parking: Car
  };

  const currencySymbols: Record<string, any> = {
    USD: DollarSign,
    EUR: Euro,
    ARS: Banknote
  };

  // Enhanced filter logic (frontend only - API handles basic filters)
  const filteredListings = listings.filter(listing => {
    const location = `${listing.city}, ${listing.state || ''} ${listing.country}`.trim();
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter (from top buttons: all/apartment/room/shared/house)
    const matchesType = selectedType === 'all' || 
      (selectedType === 'apartment' && listing.propertyType === 'apartment') ||
      (selectedType === 'house' && listing.propertyType === 'house') ||
      (selectedType === 'room' && listing.roomType === 'private_room') ||
      (selectedType === 'shared' && listing.roomType === 'shared_room');
    
    // Room type filter (map property type to room type categories)
    const matchesRoomType = selectedRoomTypes.length === 0 || selectedRoomTypes.some(roomType => {
      if (roomType === 'Entire place') return listing.roomType === 'entire_place';
      if (roomType === 'Private room') return listing.roomType === 'private_room';
      if (roomType === 'Shared room') return listing.roomType === 'shared_room';
      return false;
    });
    
    // Amenities filter
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => listing.amenities.includes(amenity));
    
    // Bedroom filter (already handled by API via minGuests and priceRange)
    const matchesBedrooms = bedroomCount === 0 || listing.bedroomCount >= bedroomCount;
    
    return matchesSearch && matchesType && matchesRoomType && matchesAmenities && matchesBedrooms;
  });

  // Handle filter toggles
  const toggleRoomType = (roomType: string) => {
    setSelectedRoomTypes(prev => 
      prev.includes(roomType) 
        ? prev.filter(t => t !== roomType)
        : [...prev, roomType]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setPriceRange({ min: 0, max: 200 });
    setSelectedRoomTypes([]);
    setSelectedAmenities([]);
    setGuestCount(1);
    setBedroomCount(0);
  };

  const activeFilterCount = 
    (selectedType !== 'all' ? 1 : 0) +
    selectedRoomTypes.length +
    selectedAmenities.length +
    (guestCount > 1 ? 1 : 0) +
    (bedroomCount > 0 ? 1 : 0);

  // GSAP scroll reveal animation for listing cards
  useGSAP(() => {
    const cards = cardsRef.current.filter(Boolean);
    if (cards.length > 0) {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  }, { dependencies: [filteredListings.length], scope: containerRef });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (listingId: number) => {
      // In a real app, this would call the API
      return { listingId };
    },
    onSuccess: () => {
      toast({
        title: t('housing.marketplace.favorites_updated_title', 'Updated favorites'),
        description: t('housing.marketplace.favorites_updated_desc', 'Your favorites list has been updated.')
      });
    }
  });

  const handleToggleFavorite = (listing: HousingListing) => {
    toggleFavoriteMutation.mutate(listing.id);
  };

  return (
    <DashboardLayout>
      <main role="main" aria-label={t('housing.aria.main', 'Housing marketplace main content')} className="max-w-7xl mx-auto px-4 py-6" data-testid="housing-listings">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-brand-gradient">{t('housing.marketplace.title', 'Tango Housing Marketplace')}</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{t('housing.marketplace.subtitle', 'Find the perfect place to stay during your tango journey')}</p>
              </div>
              <MagneticButton 
                strength={0.3}
                onClick={() => setShowCreateModal(true)}
                className="aurora-gradient text-white hover:shadow-aurora transition-all duration-300 px-4 py-2 rounded-md font-medium flex items-center gap-2"
                data-testid="button-list-space"
              >
                <Plus className="w-4 h-4" />
                {t('housing.marketplace.list_your_space', 'List Your Space')}
              </MagneticButton>
            </div>
          </div>

            {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            variants={AuroraVariants.staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={AuroraVariants.fadeInUp}>
              <GlassCard 
                role="region"
                aria-label={t('housing.aria.stat_listings', '{{count}} active listings', { count: listings.length })}
                depth={1} 
                className="p-4 border border-cyan-200/30 dark:border-cyan-500/30"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-8 h-8 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? '...' : listings.length}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('housing.marketplace.active_listings', 'Active Listings')}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div variants={AuroraVariants.fadeInUp}>
              <GlassCard 
                role="region"
                aria-label={t('housing.aria.stat_cities', '{{count}} cities available', { count: new Set(listings.map(l => l.city)).size })}
                depth={1} 
                className="p-4 border border-cyan-200/30 dark:border-cyan-500/30"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {isLoading ? '...' : new Set(listings.map(l => l.city)).size}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('housing.marketplace.cities', 'Cities')}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div variants={AuroraVariants.fadeInUp}>
              <GlassCard 
                role="region"
                aria-label={t('housing.aria.stat_rating', 'Average rating {{rating}}', { 
                  rating: listings.filter(l => l.rating).length > 0 
                    ? (listings.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) / listings.filter(l => l.rating).length).toFixed(1)
                    : 'N/A'
                })}
                depth={1} 
                className="p-4 border border-cyan-200/30 dark:border-cyan-500/30"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {isLoading ? '...' : listings.filter(l => l.rating).length > 0 
                        ? (listings.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) / listings.filter(l => l.rating).length).toFixed(1)
                        : 'N/A'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('housing.marketplace.average_rating', 'Average Rating')}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div variants={AuroraVariants.fadeInUp}>
              <GlassCard 
                role="region"
                aria-label={t('housing.aria.stat_matches', '{{count}} listings matching filters', { count: filteredListings.length })}
                depth={1} 
                className="p-4 border border-cyan-200/30 dark:border-cyan-500/30"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-8 h-8 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? '...' : filteredListings.length}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('housing.marketplace.matching_filters', 'Matching Filters')}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </FadeIn>

        {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <ScaleIn delay={0.2}>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" aria-hidden="true" />
                  <Input
                    type="text"
                    placeholder={t('housing.marketplace.search_placeholder', 'Search by location, title, or description...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label={t('housing.aria.search', 'Search housing listings')}
                    aria-describedby="search-help-text"
                    className="pl-10 w-full glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    data-testid="input-search"
                  />
                  <span id="search-help-text" className="sr-only">{t('housing.aria.search_help', 'Search by location, title, or description')}</span>
                </div>
                <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={t('housing.aria.filters', 'Listing filters')}>
                  {['all', 'apartment', 'room', 'shared', 'house'].map(type => (
                    <RippleButton 
                      key={type}
                      role="radio"
                      aria-checked={selectedType === type}
                      aria-label={t(`housing.aria.type_${type}`, `Filter by ${type}`)}
                      onClick={() => setSelectedType(type)}
                      className={selectedType === type 
                        ? 'aurora-gradient text-white border-0 px-3 py-1.5 rounded-md text-sm font-medium' 
                        : 'glass-card glass-depth-1 border-cyan-200/30 px-3 py-1.5 rounded-md text-sm font-medium border'}
                      data-testid={`button-type-${type}`}
                    >
                      {type === 'all' ? t('housing.marketplace.all_types', 'All Types') : type.charAt(0).toUpperCase() + type.slice(1)}
                    </RippleButton>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    aria-label={t('housing.aria.toggle_filters', 'Toggle filter panel')}
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                    className={showFilters ? 'glass-card glass-depth-2 border-cyan-300/50 dark:border-cyan-500/50' : 'glass-card glass-depth-1 border-cyan-200/30'}
                    data-testid="button-toggle-filters"
                  >
                    <Filter className="w-4 h-4 mr-1" aria-hidden="true" />
                    {t('housing.marketplace.filters', 'Filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </Button>
                  {activeFilterCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearFilters}
                      aria-label={t('housing.aria.clear_filters', 'Clear all filters')}
                      className="hover:glass-card hover:glass-depth-1"
                      data-testid="button-clear-filters"
                    >
                      {t('housing.marketplace.clear_all', 'Clear all')}
                    </Button>
                  )}
                </div>
              </div>
            </ScaleIn>

            {/* Expanded Filter Panel */}
            {showFilters && (
              <Card 
                id="filter-panel"
                role="region"
                aria-label={t('housing.aria.filters', 'Listing filters')}
                className="p-6 bg-gray-50" 
                data-testid="filter-panel"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Room Types */}
                  <div data-testid="filter-room-types">
                    <Label className="text-sm font-semibold mb-3 block">{t('housing.marketplace.room_type', 'Room Type')}</Label>
                    <div className="space-y-2">
                      {roomTypes.map(roomType => {
                        const roomTypeId = `room-${roomType.toLowerCase().replace(/\s+/g, '-')}`;
                        return (
                          <div key={roomType} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              role="checkbox"
                              id={roomTypeId}
                              checked={selectedRoomTypes.includes(roomType)}
                              onChange={() => toggleRoomType(roomType)}
                              aria-checked={selectedRoomTypes.includes(roomType)}
                              aria-label={t(`housing.aria.roomtype_${roomType.toLowerCase().replace(/\s+/g, '')}`, `Select ${roomType}`)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              data-testid={`checkbox-roomtype-${roomType.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <Label htmlFor={roomTypeId} className="font-normal cursor-pointer">
                              {roomType}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range Slider */}
                  <div data-testid="filter-price-range">
                    <Label className="text-sm font-semibold mb-3 block">
                      {t('housing.marketplace.price_range', 'Price Range')} (${priceRange.min} - ${priceRange.max} {t('housing.marketplace.per_night', 'per night')})
                    </Label>
                    <div className="space-y-4">
                      <Slider
                        min={0}
                        max={300}
                        step={5}
                        value={[priceRange.min, priceRange.max]}
                        onValueChange={(values) => setPriceRange({ min: values[0], max: values[1] })}
                        aria-label={t('housing.aria.price_range', 'Price range selector')}
                        aria-valuemin={0}
                        aria-valuemax={300}
                        aria-valuenow={priceRange.min}
                        aria-valuetext={t('housing.aria.price_value', '${{min}} to ${{max}} per night', { min: priceRange.min, max: priceRange.max })}
                        className="mt-2"
                        data-testid="slider-price-range"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>$0</span>
                        <span>$300+</span>
                      </div>
                    </div>
                  </div>

                  {/* Guests & Bedrooms */}
                  <div data-testid="filter-capacity">
                    <Label className="text-sm font-semibold mb-3 block">{t('housing.marketplace.capacity', 'Capacity')}</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">{t('housing.marketplace.guests', 'Guests')}</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            disabled={guestCount <= 1}
                            aria-label={t('housing.aria.decrease_guests', 'Decrease guest count')}
                            aria-controls="guest-count"
                            data-testid="button-guests-decrease"
                          >
                            -
                          </Button>
                          <span 
                            id="guest-count"
                            className="px-4 py-1 bg-white border rounded text-sm font-medium" 
                            aria-label={t('housing.aria.guest_count', 'Guest count: {{count}}', { count: guestCount })}
                            data-testid="text-guest-count"
                          >
                            {guestCount}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuestCount(guestCount + 1)}
                            aria-label={t('housing.aria.increase_guests', 'Increase guest count')}
                            aria-controls="guest-count"
                            data-testid="button-guests-increase"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">{t('housing.marketplace.bedrooms', 'Bedrooms')}</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBedroomCount(Math.max(0, bedroomCount - 1))}
                            disabled={bedroomCount <= 0}
                            aria-label={t('housing.aria.decrease_bedrooms', 'Decrease bedroom count')}
                            aria-controls="bedroom-count"
                            data-testid="button-bedrooms-decrease"
                          >
                            -
                          </Button>
                          <span 
                            id="bedroom-count"
                            className="px-4 py-1 bg-white border rounded text-sm font-medium" 
                            aria-label={t('housing.aria.bedroom_count', 'Bedroom count: {{count}}', { count: bedroomCount })}
                            data-testid="text-bedroom-count"
                          >
                            {bedroomCount === 0 ? t('housing.marketplace.any', 'Any') : bedroomCount}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBedroomCount(bedroomCount + 1)}
                            aria-label={t('housing.aria.increase_bedrooms', 'Increase bedroom count')}
                            aria-controls="bedroom-count"
                            data-testid="button-bedrooms-increase"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="md:col-span-2 lg:col-span-3" data-testid="filter-amenities">
                    <Label className="text-sm font-semibold mb-3 block">{t('housing.marketplace.amenities', 'Amenities')}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {amenitiesList.map(amenity => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            role="checkbox"
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            aria-checked={selectedAmenities.includes(amenity)}
                            aria-label={t('housing.aria.amenity', 'Select {{amenity}} amenity', { amenity: amenity.replace(/_/g, ' ') })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            data-testid={`checkbox-amenity-${amenity}`}
                          />
                          <Label htmlFor={`amenity-${amenity}`} className="font-normal cursor-pointer text-sm">
                            {amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div 
            role="region" 
            aria-label={t('housing.aria.results', 'Search results')}
            aria-live="polite"
            aria-busy={isLoading}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('housing.marketplace.available_listings', 'Available Listings')}
            </h2>
            <p className="text-gray-600" data-testid="text-results-count">
              {isLoading ? t('housing.marketplace.loading', 'Loading...') : t('housing.marketplace.showing_results', 'Showing {{count}} of {{total}} listings', { count: filteredListings.length, total: listings.length })}
              {!isLoading && activeFilterCount > 0 && ` ${t('housing.marketplace.with_filters', 'with {{count}} filter applied', { count: activeFilterCount })}`}
            </p>
          </div>

        {/* Listings Grid */}
        <div 
          ref={containerRef} 
          role="list"
          aria-label={t('housing.aria.results', 'Search results')}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card 
                key={i} 
                role="status"
                aria-label={t('housing.aria.loading', 'Loading listings')}
                aria-busy="true"
                className="overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </Card>
            ))
          ) : (
            filteredListings.map((listing, index) => {
              const location = `${listing.city}, ${listing.state ? listing.state + ', ' : ''}${listing.country}`;
              const priceUSD = listing.pricePerNight; // Already in dollars from API
              
              // Determine thumbnail: use thumbnailMedia if available, otherwise first from mediaOrder, otherwise first photo
              let thumbnailUrl: string | undefined;
              if (listing.thumbnailMedia) {
                thumbnailUrl = listing.thumbnailMedia;
              } else if (listing.mediaOrder && listing.mediaOrder.length > 0) {
                thumbnailUrl = listing.mediaOrder[0];
              } else {
                const primaryPhoto = listing.photos?.find(p => p.displayOrder === 0) || listing.photos?.[0];
                thumbnailUrl = primaryPhoto?.url;
              }
              const isThumbnailVideo = thumbnailUrl ? isVideoUrl(thumbnailUrl) : false;
              
              return (
                <div key={listing.id} ref={el => cardsRef.current[index] = el} role="listitem">
                  <GlassCard 
                    role="article"
                    aria-label={t('housing.aria.listing_card', '{{title}} in {{location}}', { title: listing.title, location })}
                    depth={2}
                    className="overflow-hidden hover:glass-depth-3 hover:border-cyan-300/50 dark:hover:border-cyan-500/50 transition-all duration-300 group" 
                    data-testid={`card-listing-${listing.id}`}
                  >
                  {/* Media Thumbnail */}
                  <div className="h-48 aurora-gradient relative overflow-hidden">
                    {thumbnailUrl && (
                      <>
                        {isThumbnailVideo ? (
                          <video 
                            src={thumbnailUrl} 
                            className="w-full h-full object-cover"
                            aria-label={`Video preview of ${listing.title} - ${listing.roomType.replace('_', ' ')} in ${listing.city}`}
                            data-testid={`video-thumbnail-${listing.id}`}
                          />
                        ) : (
                          <img 
                            src={thumbnailUrl} 
                            alt={`${listing.title} - ${listing.roomType.replace('_', ' ')} in ${listing.city}`}
                            className="w-full h-full object-cover"
                            data-testid={`img-thumbnail-${listing.id}`}
                          />
                        )}
                        {isThumbnailVideo && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                            <VideoIcon className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </>
                    )}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <MagneticButton 
                        strength={0.2}
                        onClick={() => handleToggleFavorite(listing)}
                        aria-label={listing.isFavorite 
                          ? t('housing.aria.unfavorite', 'Remove {{title}} from favorites', { title: listing.title })
                          : t('housing.aria.favorite', 'Add {{title}} to favorites', { title: listing.title })
                        }
                        aria-pressed={listing.isFavorite}
                        className="glass-card glass-depth-2 hover:glass-depth-3 p-2 rounded-md"
                        data-testid={`button-favorite-${listing.id}`}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${listing.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} aria-hidden="true" />
                      </MagneticButton>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="glass-card glass-depth-2 border-white/30 text-slate-900 dark:text-white">
                        {listing.roomType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" data-testid={`text-title-${listing.id}`}>
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-lg font-bold text-cyan-600 dark:text-cyan-400" data-testid={`text-price-${listing.id}`}>
                        <DollarSign className="w-4 h-4" />
                        {priceUSD}
                        <span className="text-sm font-normal text-slate-600 dark:text-slate-400">/{t('housing.marketplace.night', 'night')}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-3" data-testid={`text-location-${listing.id}`}>
                      <MapPin className="w-3 h-3" />
                      {location}
                    </p>

                    {/* Room Info */}
                    <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3" data-testid={`text-capacity-${listing.id}`}>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {listing.maxGuests} {t('housing.marketplace.guests_lowercase', 'guests')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {listing.bedroomCount} {t('housing.marketplace.bed', 'bed')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {listing.bathroomCount} {t('housing.marketplace.bath', 'bath')}
                      </div>
                    </div>

                    {/* Rating */}
                    {listing.rating && (
                      <div className="flex items-center gap-2 mb-3" data-testid={`rating-${listing.id}`}>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="font-medium text-slate-900 dark:text-white">{listing.rating.toFixed(1)}</span>
                          <span className="text-slate-500 dark:text-slate-400">({listing.reviewCount || 0} {t('housing.marketplace.reviews', 'reviews')})</span>
                        </div>
                      </div>
                    )}

                    {/* Host Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-700/50" data-testid={`host-info-${listing.id}`}>
                      <button
                        onClick={() => navigate(`/profile/${listing.host.username}`)}
                        aria-label={t('housing.aria.host_profile', "View {{name}}'s profile", { name: listing.host.name })}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        {listing.host.profileImage ? (
                          <img 
                            src={listing.host.profileImage} 
                            alt={`${listing.host.name}'s profile photo`}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/20"
                            data-testid={`img-host-profile-${listing.id}`}
                          />
                        ) : (
                          <div className="w-8 h-8 aurora-gradient rounded-full flex items-center justify-center text-white text-sm font-bold" aria-hidden="true">
                            {listing.host.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{listing.host.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">@{listing.host.username}</p>
                        </div>
                      </button>
                      <RippleButton
                        onClick={() => navigate(`/listing/${listing.id}`)}
                        aria-label={t('housing.aria.view_details', 'View details for {{title}}', { title: listing.title })}
                        className="aurora-gradient text-white hover:shadow-aurora transition-all px-3 py-1.5 rounded-md text-sm font-medium"
                        data-testid={`button-view-details-${listing.id}`}
                      >
                        {t('housing.marketplace.view_details', 'View Details')}
                      </RippleButton>
                    </div>
                  </div>
                  </GlassCard>
                </div>
              );
            })
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredListings.length === 0 && (
          <Card className="p-12 text-center">
            <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('housing.marketplace.no_listings', 'No listings found')}</h3>
            <p className="text-gray-600">{t('housing.marketplace.try_adjusting', 'Try adjusting your search or filters')}</p>
          </Card>
        )}

        {/* View Details Modal */}
        {selectedListing && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{selectedListing.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedListing(null)}
                    aria-label="Close details modal"
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700">{selectedListing.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{selectedListing.address || `${selectedListing.city}, ${selectedListing.country}`}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                      <div className="space-y-2">
                        {selectedListing.amenities.slice(0, 5).map(amenity => {
                          const Icon = amenityIcons[amenity] || Check;
                          return (
                            <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                              <Icon className="w-4 h-4" />
                              {amenity.replace(/_/g, ' ')}
                            </div>
                          );
                        })}
                        {selectedListing.amenities.length > 5 && (
                          <p className="text-xs text-gray-500">+{selectedListing.amenities.length - 5} more</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2">Capacity</h4>
                      <div className="space-y-2 text-sm text-indigo-800">
                        <p>{selectedListing.maxGuests} guests max</p>
                        <p>{selectedListing.bedroomCount} bedrooms</p>
                        <p>{selectedListing.bathroomCount} bathrooms</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      Contact Host
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Check Availability
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}