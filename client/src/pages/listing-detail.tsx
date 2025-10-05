import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Star, 
  Share2, 
  Heart,
  Wifi,
  Coffee,
  Car,
  Wind,
  Music,
  Utensils,
  Dumbbell,
  Waves,
  Briefcase,
  PawPrint,
  Cigarette,
  Home,
  Bed,
  Bath,
  DollarSign,
  Calendar as CalendarIcon,
  X,
  Video as VideoIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Calendar } from '../components/ui/calendar';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { ConnectionInfoPanel } from '../components/housing/ConnectionInfoPanel';
import { ConnectionBadge } from '../components/housing/ConnectionBadge';
import { useAuth } from '../hooks/useAuth';
import { getConnectionLabel } from '../utils/friendshipHelpers';
import DashboardLayout from '../layouts/DashboardLayout';
import { RatingSummary } from '../components/reviews/RatingSummary';
import { ReviewList } from '../components/reviews/ReviewList';
import HouseRulesDisplay from '../components/housing/HouseRulesDisplay';
import { ConnectionInfoCard } from '../components/housing/ConnectionInfoCard';
import type { HostReview } from '@shared/schema';

// Aurora Tide Components
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, ScaleIn, SlideIn } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton, RippleButton, PulseButton } from '@/components/interactions/MicroInteractions';
import Confetti from 'react-confetti';

interface HostHome {
  id: number;
  hostId: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  photos: string[];
  amenities: string[];
  maxGuests: number;
  pricePerNight: number;
  availability: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Kitchen': Utensils,
  'Parking': Car,
  'Air Conditioning': Wind,
  'Music Equipment': Music,
  'Coffee Maker': Coffee,
  'Gym': Dumbbell,
  'Pool': Waves,
  'Workspace': Briefcase,
  'Pets Allowed': PawPrint,
  'Smoking Allowed': Cigarette,
  'Washer': Home,
};

// Helper to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export default function ListingDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Aurora Tide - GSAP Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guestCount, setGuestCount] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [hasReadRules, setHasReadRules] = useState(false);
  
  // Aurora Tide - Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch listing details
  const { data: listing, isLoading, error } = useQuery<{ data: HostHome }>({
    queryKey: [`/api/host-homes/${id}`],
    enabled: !!id,
  });

  // Fetch reviews for this listing
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery<{ data: HostReview[] }>({
    queryKey: [`/api/host-homes/${id}/reviews`],
    enabled: !!id,
  });

  // Fetch connection info for booking eligibility (ESA Layer 31)
  const { data: connectionData, isLoading: isLoadingConnection } = useQuery<{ 
    connectionDegree: number | null; 
    closenessScore: number; 
    mutualFriends: number; 
    sharedMemories: number; 
    isConnected: boolean; 
  }>({
    queryKey: user && listing?.data.hostId ? [`/api/users/${user.id}/connection-info/${listing.data.hostId}`] : ['connection-info-disabled'],
    enabled: !!user && !!listing?.data.hostId,
  });

  // Check booking eligibility
  const checkEligibilityMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/host-homes/${id}/check-booking-eligibility`, {
        method: 'POST',
      });
    },
  });

  // Booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      // Aurora Tide - Trigger confetti celebration (respects reduced-motion)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      toast({
        title: 'Booking request sent!',
        description: 'The host will review your request and respond soon.',
      });
      setShowBookingModal(false);
      // Reset form
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setGuestCount(1);
      setPurpose('');
      setMessage('');
      setHasReadRules(false);
      // Navigate to my bookings page
      setTimeout(() => navigate('/my-bookings'), 1500);
    },
    onError: (error: any) => {
      toast({
        title: 'Booking failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Calculate price based on dates
  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate || !listing?.data.pricePerNight) return 0;
    const nights = differenceInDays(checkOutDate, checkInDate);
    return nights * listing.data.pricePerNight;
  };

  const nights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;
  const totalPrice = calculateTotalPrice();
  const serviceFee = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + serviceFee;

  const handleRequestToBook = async () => {
    // Check eligibility first
    try {
      const result = await checkEligibilityMutation.mutateAsync();
      if (result.eligible) {
        setShowBookingModal(true);
      } else {
        toast({
          title: 'Cannot book this property',
          description: result.reason || 'You do not meet the booking requirements for this property.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error checking eligibility',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitBooking = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validation
    if (!checkInDate || !checkOutDate) {
      toast({
        title: 'Missing dates',
        description: 'Please select check-in and check-out dates.',
        variant: 'destructive',
      });
      return;
    }

    // Prevent past check-in dates
    const checkInDateOnly = new Date(checkInDate);
    checkInDateOnly.setHours(0, 0, 0, 0);
    if (checkInDateOnly < today) {
      toast({
        title: 'Invalid check-in date',
        description: 'Check-in date cannot be in the past.',
        variant: 'destructive',
      });
      return;
    }

    // Prevent check-out before or same as check-in
    if (checkOutDate <= checkInDate) {
      toast({
        title: 'Invalid dates',
        description: 'Check-out must be after check-in.',
        variant: 'destructive',
      });
      return;
    }

    if (nights <= 0) {
      toast({
        title: 'Invalid dates',
        description: 'Check-out must be after check-in.',
        variant: 'destructive',
      });
      return;
    }

    // Validate guest count doesn't exceed maximum
    if (guestCount > (listing?.data.maxGuests || 10)) {
      toast({
        title: 'Too many guests',
        description: `Maximum ${listing?.data.maxGuests || 10} guests allowed.`,
        variant: 'destructive',
      });
      return;
    }

    if (guestCount < 1) {
      toast({
        title: 'Invalid guest count',
        description: 'At least 1 guest is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!purpose) {
      toast({
        title: 'Purpose required',
        description: 'Please select the purpose of your stay.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please write a message to the host.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasReadRules) {
      toast({
        title: 'House rules',
        description: 'Please confirm you have read the house rules.',
        variant: 'destructive',
      });
      return;
    }

    // Submit booking
    createBookingMutation.mutate({
      hostHomeId: parseInt(id!),
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      guestCount,
      purpose,
      message,
      hasReadRules,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.data.title,
        text: `Check out this accommodation: ${listing?.data.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Share this listing with your friends.',
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorited 
        ? 'You can add it back anytime.'
        : 'Find it in your saved listings.',
    });
  };

  // Aurora Tide - GSAP Scroll Reveal Animations
  useGSAP(() => {
    if (!listing || isLoading) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Hero parallax effect
    if (heroRef.current) {
      gsap.fromTo(heroRef.current,
        { y: 0 },
        {
          y: -50,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }

    // Section scroll reveals
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(section,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            delay: index * 0.1,
          }
        );
      }
    });
  }, { scope: containerRef, dependencies: [listing, isLoading] });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-96 w-full mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing?.data) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
              <p className="text-gray-600 mb-4">
                The listing you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/housing-marketplace')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const home = listing.data;
  const priceFormatted = `$${home.pricePerNight}`;

  // Get ordered media (use mediaOrder if available, otherwise use photos)
  const orderedMedia = home.mediaOrder && home.mediaOrder.length > 0 ? home.mediaOrder : (home.photos || []);
  const currentMedia = orderedMedia[selectedImage] || orderedMedia[0];
  const isVideo = currentMedia ? isVideoUrl(currentMedia) : false;

  return (
    <DashboardLayout>
      {/* Aurora Tide - Confetti on successful booking */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          colors={['#06b6d4', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']}
        />
      )}
      
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800" data-testid="page-listing-detail">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button - Aurora Tide */}
        <FadeIn>
          <MagneticButton
            strength={0.2}
            onClick={() => navigate('/housing-marketplace')}
            className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 mb-4 px-4 py-2 rounded-md flex items-center gap-2"
            data-testid="button-back-to-marketplace"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </MagneticButton>
        </FadeIn>

        {/* Media Gallery - Aurora Tide Hero */}
        <div ref={heroRef} className="mb-6 relative" data-testid="section-photo-gallery">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            {/* Main Media Display */}
            <div className="md:col-span-3 h-96 md:h-[500px]">
              {orderedMedia && orderedMedia.length > 0 ? (
                isVideo ? (
                  <video
                    src={currentMedia}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                    data-testid="video-main-media"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={currentMedia}
                    alt={home.title}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
                    onClick={() => setSelectedImage(0)}
                    data-testid="img-main-photo"
                  />
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="h-24 w-24 text-white opacity-50" />
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 md:grid-cols-1 gap-2">
              {orderedMedia && orderedMedia.slice(1, 5).map((media, idx) => {
                const isThumbVideo = isVideoUrl(media);
                return (
                  <div
                    key={idx}
                    className={`relative w-full h-24 md:h-[120px] rounded-lg cursor-pointer transition overflow-hidden ${
                      selectedImage === idx + 1 ? 'ring-2 ring-indigo-500' : 'hover:opacity-75'
                    }`}
                    onClick={() => setSelectedImage(idx + 1)}
                    data-testid={`thumbnail-${idx + 1}`}
                  >
                    {isThumbVideo ? (
                      <>
                        <video
                          src={media}
                          className="w-full h-full object-cover"
                          data-testid={`video-thumbnail-${idx + 1}`}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <VideoIcon className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={media}
                        alt={`${home.title} ${idx + 2}`}
                        className="w-full h-full object-cover"
                        data-testid={`img-thumbnail-${idx + 1}`}
                      />
                    )}
                  </div>
                );
              })}
              {orderedMedia && orderedMedia.length > 5 && (
                <div
                  className="w-full h-24 md:h-[120px] bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
                  onClick={() => setSelectedImage(5)}
                  data-testid="button-more-media"
                >
                  <span className="text-sm font-semibold">+{orderedMedia.length - 5} more</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header - Aurora Tide */}
            <GlassCard depth={2} className="border border-cyan-200/30 dark:border-cyan-500/30" data-testid="section-property-header" ref={(el) => sectionsRef.current[0] = el}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-brand-gradient" data-testid="text-listing-title">
                      {home.title}
                    </h1>
                    <div className="flex items-center text-slate-600 dark:text-slate-400 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span data-testid="text-location">{home.city}, {home.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="glass-card glass-depth-1 border-cyan-200/30 text-cyan-700 dark:text-cyan-300">
                        <Users className="h-3 w-3 mr-1" />
                        Up to {home.maxGuests} guests
                      </Badge>
                      <Badge className="glass-card glass-depth-1 border-yellow-200/30">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        4.8 (12 reviews)
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <MagneticButton 
                      strength={0.2}
                      onClick={handleShare}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 p-2 rounded-md"
                      data-testid="button-share"
                    >
                      <Share2 className="h-4 w-4" />
                    </MagneticButton>
                    <MagneticButton 
                      strength={0.2}
                      onClick={handleFavorite}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 p-2 rounded-md"
                      data-testid="button-favorite"
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </MagneticButton>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-slate-700 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                  <div className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Entire place</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{home.maxGuests} guests</span>
                  </div>
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-2 text-gray-500" />
                    <span>2 bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-2 text-gray-500" />
                    <span>1 bathroom</span>
                  </div>
                </div>
              </CardContent>
            </GlassCard>

            {/* Description - Aurora Tide */}
            <GlassCard depth={2} className="border border-cyan-200/30 dark:border-cyan-500/30" data-testid="section-description" ref={(el) => sectionsRef.current[1] = el}>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">About this space</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line" data-testid="text-description">
                  {home.description}
                </p>
              </CardContent>
            </GlassCard>

            {/* Amenities - Aurora Tide */}
            <GlassCard depth={2} className="border border-cyan-200/30 dark:border-cyan-500/30" data-testid="section-amenities" ref={(el) => sectionsRef.current[2] = el}>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {home.amenities && home.amenities.length > 0 ? (
                    home.amenities.map((amenity, idx) => {
                      const Icon = amenityIcons[amenity] || Home;
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center text-slate-700 dark:text-slate-300"
                          data-testid={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Icon className="h-5 w-5 mr-3 text-cyan-600 dark:text-cyan-400" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No amenities listed</p>
                  )}
                </div>
              </CardContent>
            </GlassCard>

            {/* Connection Info */}
            {user && user.id !== home.hostId && connectionData && (
              <ConnectionInfoCard 
                connectionInfo={{
                  ...connectionData,
                  sharedEvents: 0
                }}
                hostName="Host" 
              />
            )}

            {/* House Rules - Dynamic from Database */}
            <HouseRulesDisplay 
              homeId={home.id} 
              variant="detailed"
              showTitle={true}
            />

            {/* Location */}
            {home.lat && home.lng && (
              <Card data-testid="section-location">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Location</h2>
                  <p className="text-gray-600 mb-4">{home.address}</p>
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-400" />
                    <span className="ml-2 text-gray-500">Map integration coming soon</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card data-testid="section-reviews">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Guest Reviews</h2>
                
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : reviewsData?.data && reviewsData.data.length > 0 ? (
                  <div className="space-y-8">
                    <RatingSummary reviews={reviewsData.data} />
                    <div className="border-t pt-6">
                      <ReviewList
                        reviews={reviewsData.data}
                        type="host"
                        emptyMessage="No reviews yet. Be the first to review!"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reviews yet. Be the first to stay and review!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card (Sticky) - Aurora Tide */}
          <div className="lg:sticky lg:top-6 h-fit">
            <ScaleIn delay={0.3}>
              <GlassCard depth={3} className="shadow-aurora border border-cyan-200/30 dark:border-cyan-500/30" data-testid="card-booking">
                <CardContent className="pt-6">
                  <div className="mb-6">
                    {/* TODO: PAYMENT PREP - Stripe integration 
                        Display pricing and payment info here */}
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                      <span className="mx-1">·</span>
                      <span>12 reviews</span>
                    </div>
                    <p className="text-sm text-cyan-700 dark:text-cyan-400 mt-2 font-medium">
                      Connection-based hosting • Free for community members
                    </p>
                  </div>

                  {/* Booking Form Placeholder */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass-card glass-depth-1 border border-cyan-200/30 dark:border-cyan-500/30 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CHECK-IN</label>
                        <div className="text-sm text-slate-700 dark:text-slate-300">Add date</div>
                      </div>
                      <div className="glass-card glass-depth-1 border border-cyan-200/30 dark:border-cyan-500/30 rounded-lg p-3">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CHECKOUT</label>
                        <div className="text-sm text-slate-700 dark:text-slate-300">Add date</div>
                      </div>
                    </div>
                    <div className="glass-card glass-depth-1 border border-cyan-200/30 dark:border-cyan-500/30 rounded-lg p-3">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">GUESTS</label>
                      <div className="text-sm text-slate-700 dark:text-slate-300">1 guest</div>
                    </div>
                  </div>

                  <PulseButton 
                    className="w-full aurora-gradient text-white font-semibold py-6 text-lg rounded-lg hover:shadow-aurora transition-all"
                    onClick={handleRequestToBook}
                    pulseColor="rgba(6, 182, 212, 0.6)"
                    data-testid="button-request-to-book"
                  >
                    Request to Stay
                  </PulseButton>

                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                    Subject to host approval based on your connection
                  </p>
                </CardContent>
              </GlassCard>
            </ScaleIn>

            {/* Host Card */}
            <Card className="mt-6" data-testid="card-host">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Meet your host</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    H
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Host Name</h4>
                    <p className="text-sm text-gray-600">Joined in 2023</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div>⭐ 4.9 Host rating</div>
                  <div>📝 12 Reviews</div>
                  <div>✓ Identity verified</div>
                  <div>⚡ Responds within an hour</div>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-contact-host">
                  Contact Host
                </Button>
              </CardContent>
            </Card>

            {/* Connection Info Panel - ESA Layer 9 */}
            {user && listing?.data?.hostId && user.id !== listing?.data?.hostId && (
              <div className="mt-6">
                <ConnectionInfoPanel
                  userId={user.id}
                  hostId={listing.data.hostId}
                  hostName="Host Name"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal - Aurora Tide */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card glass-depth-3 border-cyan-200/30 dark:border-cyan-500/30" data-testid="dialog-booking-request">
          <FadeIn>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-slate-900 dark:text-white">Request to Book</DialogTitle>
                {connectionData?.data && (
                  <ConnectionBadge connectionDegree={connectionData.data.connectionDegree} />
                )}
              </div>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Complete the form below to send a booking request to the host.
              </DialogDescription>
            </DialogHeader>
          </FadeIn>

          {/* Friendship Eligibility Status - Aurora Tide */}
          {connectionData?.data && (
            <ScaleIn delay={0.1}>
              <GlassCard depth={2} className="mb-4 p-4 border-cyan-200/40 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/30 dark:to-blue-950/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {connectionData.data.connectionDegree >= 1 ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl">ℹ️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    {connectionData.data.connectionDegree >= 1 ? (
                      <div>
                        <p className="font-semibold text-cyan-900 dark:text-cyan-100">
                          You're connected! {getConnectionLabel(connectionData.data.connectionDegree as -1 | 1 | 2 | 3)}
                        </p>
                        <p className="text-sm text-cyan-800 dark:text-cyan-300 mt-1">
                          Your friendship score: {connectionData.data.closenessScore}/100
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Not yet connected</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                          Build a connection with this host to unlock easier booking approval. Start by sending a message or attending tango events together!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </ScaleIn>
          )}

          <div className="space-y-6 py-4">
            {/* Dates Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Dates</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Check-in</Label>
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);
                      return checkDate < today;
                    }}
                    fromDate={new Date()}
                    className="border rounded-lg"
                    data-testid="calendar-check-in"
                  />
                  {checkInDate && (
                    <p className="text-sm text-center mt-2 font-medium" data-testid="text-check-in-date">
                      {format(checkInDate, 'PPP')}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Check-out</Label>
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    disabled={(date) => {
                      if (!checkInDate) return true;
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);
                      const checkIn = new Date(checkInDate);
                      checkIn.setHours(0, 0, 0, 0);
                      return checkDate <= checkIn;
                    }}
                    fromDate={checkInDate || new Date()}
                    className="border rounded-lg"
                    data-testid="calendar-check-out"
                  />
                  {checkOutDate && (
                    <p className="text-sm text-center mt-2 font-medium" data-testid="text-check-out-date">
                      {format(checkOutDate, 'PPP')}
                    </p>
                  )}
                </div>
              </div>
              {nights > 0 && (
                <p className="text-sm text-gray-600" data-testid="text-nights-count">
                  {nights} night{nights > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Guest Count - Aurora Tide */}
            <ScaleIn delay={0.2}>
              <div className="space-y-2">
                <Label htmlFor="guest-count" className="text-base font-semibold text-slate-900 dark:text-white">
                  Number of Guests
                </Label>
                <div className="flex items-center gap-4">
                  <MagneticButton
                    strength={0.15}
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                    className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-decrease-guests"
                  >
                    -
                  </MagneticButton>
                  <span className="text-lg font-medium w-12 text-center text-slate-900 dark:text-white" data-testid="text-guest-count">
                    {guestCount}
                  </span>
                  <MagneticButton
                    strength={0.15}
                    onClick={() => setGuestCount(Math.min(listing?.data.maxGuests || 10, guestCount + 1))}
                    disabled={guestCount >= (listing?.data.maxGuests || 10)}
                    className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-increase-guests"
                  >
                    +
                  </MagneticButton>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    (Max: {listing?.data.maxGuests || 10} guests)
                  </span>
                </div>
              </div>
            </ScaleIn>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-base font-semibold">
                Purpose of Stay
              </Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger id="purpose" data-testid="select-purpose">
                  <SelectValue placeholder="Select purpose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tango Classes">Tango Classes</SelectItem>
                  <SelectItem value="Tango Festival">Tango Festival</SelectItem>
                  <SelectItem value="Tango Practice">Tango Practice</SelectItem>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message to Host */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-semibold">
                Message to Host
              </Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and let the host know why you'd like to stay..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
                data-testid="textarea-message"
              />
              <p className="text-xs text-gray-500">
                Tip: Mention your tango experience and what brings you to the area!
              </p>
            </div>

            {/* House Rules Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="house-rules"
                checked={hasReadRules}
                onCheckedChange={(checked) => setHasReadRules(checked as boolean)}
                data-testid="checkbox-house-rules"
              />
              <label
                htmlFor="house-rules"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I have read and agree to the house rules (check-in after 2PM, checkout before 11AM, no parties/events, no smoking inside)
              </label>
            </div>

            {/* Price Breakdown - Aurora Tide */}
            {nights > 0 && (
              <ScaleIn delay={0.3}>
                <GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Price Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                        <span>${listing?.data.pricePerNight} × {nights} nights</span>
                        <span data-testid="text-subtotal">${totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                        <span>Service fee (10%)</span>
                        <span data-testid="text-service-fee">${serviceFee}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-cyan-200/30 dark:border-cyan-500/30 pt-2 mt-2 text-slate-900 dark:text-white">
                        <span>Total</span>
                        <span data-testid="text-grand-total">${grandTotal}</span>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              </ScaleIn>
            )}
          </div>

          {/* Modal Actions - Aurora Tide */}
          <div className="flex gap-3 pt-4 border-t border-cyan-200/30 dark:border-cyan-500/30">
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
              className="flex-1 glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30"
              data-testid="button-cancel-booking"
            >
              Cancel
            </Button>
            <PulseButton
              onClick={handleSubmitBooking}
              disabled={createBookingMutation.isPending}
              className="flex-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold disabled:opacity-50"
              pulseColor="rgba(6, 182, 212, 0.6)"
              data-testid="button-submit-booking"
            >
              {createBookingMutation.isPending ? 'Submitting...' : 'Send Request'}
            </PulseButton>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
