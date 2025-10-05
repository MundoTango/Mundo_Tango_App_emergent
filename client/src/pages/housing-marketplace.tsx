import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  Banknote
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

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

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (listingId: number) => {
      // In a real app, this would call the API
      return { listingId };
    },
    onSuccess: () => {
      toast({
        title: 'Updated favorites',
        description: 'Your favorites list has been updated.'
      });
    }
  });

  const handleToggleFavorite = (listing: HousingListing) => {
    toggleFavoriteMutation.mutate(listing.id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tango Housing Marketplace</h1>
              <p className="text-gray-600 mt-2">Find the perfect place to stay during your tango journey</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              List Your Space
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <Home className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : listings.length}</p>
                  <p className="text-sm text-gray-600">Active Listings</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : new Set(listings.map(l => l.city)).size}
                  </p>
                  <p className="text-sm text-gray-600">Cities</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-rose-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : listings.filter(l => l.rating).length > 0 
                      ? (listings.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) / listings.filter(l => l.rating).length).toFixed(1)
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-violet-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : filteredListings.length}</p>
                  <p className="text-sm text-gray-600">Matching Filters</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by location, title, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'apartment', 'room', 'shared', 'house'].map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className={selectedType === type 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0' 
                      : ''}
                    data-testid={`button-type-${type}`}
                  >
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-indigo-50 border-indigo-300' : ''}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
                {activeFilterCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    data-testid="button-clear-filters"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Filter Panel */}
            {showFilters && (
              <Card className="p-6 bg-gray-50" data-testid="filter-panel">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Room Types */}
                  <div data-testid="filter-room-types">
                    <Label className="text-sm font-semibold mb-3 block">Room Type</Label>
                    <div className="space-y-2">
                      {roomTypes.map(roomType => {
                        const roomTypeId = `room-${roomType.toLowerCase().replace(/\s+/g, '-')}`;
                        return (
                          <div key={roomType} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={roomTypeId}
                              checked={selectedRoomTypes.includes(roomType)}
                              onChange={() => toggleRoomType(roomType)}
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
                      Price Range (${priceRange.min} - ${priceRange.max} per night)
                    </Label>
                    <div className="space-y-4">
                      <Slider
                        min={0}
                        max={300}
                        step={5}
                        value={[priceRange.min, priceRange.max]}
                        onValueChange={(values) => setPriceRange({ min: values[0], max: values[1] })}
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
                    <Label className="text-sm font-semibold mb-3 block">Capacity</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Guests</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            disabled={guestCount <= 1}
                            data-testid="button-guests-decrease"
                          >
                            -
                          </Button>
                          <span className="px-4 py-1 bg-white border rounded text-sm font-medium" data-testid="text-guest-count">
                            {guestCount}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuestCount(guestCount + 1)}
                            data-testid="button-guests-increase"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Bedrooms</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBedroomCount(Math.max(0, bedroomCount - 1))}
                            disabled={bedroomCount <= 0}
                            data-testid="button-bedrooms-decrease"
                          >
                            -
                          </Button>
                          <span className="px-4 py-1 bg-white border rounded text-sm font-medium" data-testid="text-bedroom-count">
                            {bedroomCount === 0 ? 'Any' : bedroomCount}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBedroomCount(bedroomCount + 1)}
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
                    <Label className="text-sm font-semibold mb-3 block">Amenities</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {amenitiesList.map(amenity => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
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

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600" data-testid="text-results-count">
              {isLoading ? 'Loading...' : `Showing ${filteredListings.length} of ${listings.length} listings`}
              {!isLoading && activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </Card>
            ))
          ) : (
            filteredListings.map(listing => {
              const location = `${listing.city}, ${listing.state ? listing.state + ', ' : ''}${listing.country}`;
              const priceUSD = listing.pricePerNight; // Already in dollars from API
              const primaryPhoto = listing.photos?.find(p => p.displayOrder === 0) || listing.photos?.[0];
              
              return (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-listing-${listing.id}`}>
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 relative">
                    {primaryPhoto && (
                      <img 
                        src={primaryPhoto.url} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/90 hover:bg-white"
                        onClick={() => handleToggleFavorite(listing)}
                        data-testid={`button-favorite-${listing.id}`}
                      >
                        <Heart className={`w-4 h-4 ${listing.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-white/90 text-gray-900">
                        {listing.roomType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2" data-testid={`text-title-${listing.id}`}>
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-lg font-bold text-gray-900" data-testid={`text-price-${listing.id}`}>
                        <DollarSign className="w-4 h-4" />
                        {priceUSD}
                        <span className="text-sm font-normal text-gray-600">/night</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-3" data-testid={`text-location-${listing.id}`}>
                      <MapPin className="w-3 h-3" />
                      {location}
                    </p>

                    {/* Room Info */}
                    <div className="flex gap-4 text-sm text-gray-600 mb-3" data-testid={`text-capacity-${listing.id}`}>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {listing.maxGuests} guests
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {listing.bedroomCount} bed
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {listing.bathroomCount} bath
                      </div>
                    </div>

                    {/* Rating */}
                    {listing.rating && (
                      <div className="flex items-center gap-2 mb-3" data-testid={`rating-${listing.id}`}>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{listing.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({listing.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                    )}

                    {/* Host Info */}
                    <div className="flex items-center justify-between pt-3 border-t" data-testid={`host-info-${listing.id}`}>
                      <div className="flex items-center gap-2">
                        {listing.host.profileImage ? (
                          <img 
                            src={listing.host.profileImage} 
                            alt={listing.host.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {listing.host.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{listing.host.name}</p>
                          <p className="text-xs text-gray-500">@{listing.host.username}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                        data-testid={`button-view-details-${listing.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredListings.length === 0 && (
          <Card className="p-12 text-center">
            <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </Card>
        )}

        {/* View Details Modal */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedListing.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedListing(null)}
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
      </div>
    </DashboardLayout>
  );
}