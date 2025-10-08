import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Link } from 'wouter';
import DashboardLayout from '../layouts/DashboardLayout';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Filter
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { GlassCard } from '../components/glass/GlassComponents';
import { FadeIn, ScaleIn, StaggerContainer } from '../components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '../components/interactions/MicroInteractions';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { GuestReviewForm } from '../components/reviews/GuestReviewForm';
import { Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Helmet } from 'react-helmet';

interface BookingWithDetails {
  id: number;
  guestId: number;
  hostHomeId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  purpose: string;
  message: string;
  hasReadRules: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  hostResponse: string | null;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  hostHome: {
    id: number;
    title: string;
    address: string;
    city: string;
    country: string;
    photos: string[];
    pricePerNight: number;
  };
  guest: {
    id: number;
    name: string;
    profileImage: string | null;
  };
}

export default function HostBookings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [respondingToBooking, setRespondingToBooking] = useState<number | null>(null);
  const [responseAction, setResponseAction] = useState<'approve' | 'reject' | null>(null);
  const [hostResponse, setHostResponse] = useState('');
  const [bookingToReview, setBookingToReview] = useState<BookingWithDetails | null>(null);

  const cardsRef = useScrollReveal('.booking-card', {
    opacity: 0,
    y: 30,
  }, {
    stagger: 0.1,
    start: 'top 85%',
    once: true,
    respectReducedMotion: true,
  });

  const { data: bookingsData, isLoading } = useQuery<{ success: boolean; bookings: BookingWithDetails[] }>({
    queryKey: ['/api/bookings', { role: 'host' }],
    queryFn: async () => {
      const response = await fetch('/api/bookings?role=host', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
  });

  const respondToBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status, message }: { bookingId: number; status: 'approve' | 'reject'; message: string }) => {
      return await apiRequest(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status === 'approve' ? 'approved' : 'rejected', hostResponse: message }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: responseAction === 'approve' 
          ? t('housing.host_bookings.toast_approved_title', 'Booking approved!') 
          : t('housing.host_bookings.toast_rejected_title', 'Booking rejected'),
        description: responseAction === 'approve'
          ? t('housing.host_bookings.toast_approved_desc', 'You have approved this booking request.')
          : t('housing.host_bookings.toast_rejected_desc', 'You have rejected this booking request.'),
      });
      setRespondingToBooking(null);
      setResponseAction(null);
      setHostResponse('');
    },
    onError: (error: any) => {
      toast({
        title: t('housing.host_bookings.toast_error_title', 'Action failed'),
        description: error.message || t('housing.host_bookings.toast_error_desc', 'Could not update booking status.'),
        variant: 'destructive',
      });
    },
  });

  const handleOpenResponseDialog = (bookingId: number, action: 'approve' | 'reject') => {
    setRespondingToBooking(bookingId);
    setResponseAction(action);
    if (action === 'approve') {
      setHostResponse(t('housing.host_bookings.default_approve_message', 'Thank you for your booking request! I look forward to hosting you.'));
    } else {
      setHostResponse(t('housing.host_bookings.default_reject_message', 'Unfortunately, I cannot accommodate your booking at this time.'));
    }
  };

  const handleSubmitResponse = () => {
    if (!respondingToBooking || !responseAction) return;

    if (!hostResponse.trim()) {
      toast({
        title: t('housing.host_bookings.message_required', 'Message required'),
        description: t('housing.host_bookings.message_required_desc', 'Please provide a response message to the guest.'),
        variant: 'destructive',
      });
      return;
    }

    respondToBookingMutation.mutate({
      bookingId: respondingToBooking,
      status: responseAction,
      message: hostResponse,
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
    <>
      <Helmet>
        <title>Host Bookings | Life CEO</title>
      </Helmet>
      
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 border border-yellow-200/50 dark:border-yellow-500/30">
            <Clock className="w-3 h-3 text-yellow-700 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{t('housing.host_bookings.status_pending', 'Pending')}</span>
          </div>
        
    </>
  );
      case 'approved':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 border border-cyan-200/50 dark:border-ocean-500/30">
            <CheckCircle className="w-3 h-3 text-cyan-700 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{t('housing.host_bookings.status_approved', 'Approved')}</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 border border-red-200/50 dark:border-red-500/30">
            <XCircle className="w-3 h-3 text-red-700 dark:text-red-400" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">{t('housing.host_bookings.status_rejected', 'Rejected')}</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 border border-slate-200/50 dark:border-slate-600/30">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('housing.host_bookings.status_cancelled', 'Cancelled')}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200/50 dark:border-blue-500/30">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('housing.host_bookings.status_completed', 'Completed')}</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 border border-slate-200/50 dark:border-slate-600/30">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status}</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <Skeleton className="h-10 w-64 mb-8 bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i} depth={2}>
                  <div className="p-6">
                    <div className="flex gap-6">
                      <Skeleton className="w-48 h-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
                      <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const bookings = bookingsData?.bookings || [];
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');

  const renderBookingCard = (booking: BookingWithDetails) => {
    if (!booking.hostHome) return null;

    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const propertyPhoto = booking.hostHome.photos?.[0] || '/placeholder-home.jpg';
    const propertyTitle = booking.hostHome.title || 'Untitled Property';

    return (
      <ScaleIn key={booking.id} delay={0.05}>
        <GlassCard 
          depth={2} 
          className="overflow-hidden border-cyan-200/30 dark:border-ocean-500/30 hover:border-cyan-300/50 dark:hover:border-cyan-400/50 transition-all duration-300" 
          data-testid={`card-host-booking-${booking.id}`}
        >
          <div className="flex flex-col md:flex-row">
            {/* Property Image */}
            <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
              <img
                src={propertyPhoto}
                alt={propertyTitle}
                className="w-full h-full object-cover"
                data-testid={`img-booking-property-${booking.id}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Booking Details */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Link href={`/listing/${booking.hostHomeId}`}>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent hover:from-cyan-700 hover:to-teal-700 dark:hover:from-cyan-300 dark:hover:to-teal-300 cursor-pointer transition-all" data-testid={`text-booking-property-${booking.id}`}>
                        {propertyTitle}
                      </h3>
                    </Link>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {booking.hostHome.city}, {booking.hostHome.country}
                  </p>
                </div>
              </div>

              {/* Guest Info */}
              <GlassCard depth={1} className="p-4 mb-4 border-cyan-200/20 dark:border-ocean-500/20 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/30 dark:to-teal-950/30">
                <div className="flex items-center gap-3">
                  {booking.guest.profileImage ? (
                    <img src={booking.guest.profileImage} alt={booking.guest.name} className="w-10 h-10 rounded-full ring-2 ring-cyan-200 dark:ring-cyan-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {booking.guest.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white" data-testid={`text-guest-name-${booking.id}`}>
                      {booking.guest.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('housing.host_bookings.guest_label', 'Guest')}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Booking Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-ocean-500 dark:text-cyan-400" />
                  <div className="text-sm">
                    <p className="font-medium">{t('housing.host_bookings.check_in', 'Check-in')}: {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</p>
                    <p className="font-medium">{t('housing.host_bookings.check_out', 'Check-out')}: {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {t('housing.host_bookings.nights', { 
                        defaultValue: '{{count}} night',
                        defaultValue_plural: '{{count}} nights', 
                        count: nights 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Users className="w-4 h-4 text-ocean-500 dark:text-cyan-400" />
                  <div className="text-sm">
                    <p className="font-medium">
                      {t('housing.host_bookings.guests', {
                        defaultValue: '{{count}} guest',
                        defaultValue_plural: '{{count}} guests',
                        count: booking.guestCount
                      })}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{t('housing.host_bookings.purpose', 'Purpose')}: {booking.purpose}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent" data-testid={`text-booking-price-${booking.id}`}>
                    ${(booking.totalPrice / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('housing.host_bookings.total_earnings', 'Total earnings')}</p>
                </div>
              </div>

              {/* Guest Message */}
              <GlassCard depth={1} className="p-4 mb-4 border-slate-200/20 dark:border-slate-700/20">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('housing.host_bookings.guest_message', "Guest's message")}:</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400" data-testid={`text-guest-message-${booking.id}`}>{booking.message}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Host Response (if any) */}
              {booking.hostResponse && (
                <GlassCard depth={1} className="p-4 mb-4 border-cyan-200/30 dark:border-ocean-500/30 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/30 dark:to-teal-950/30">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cyan-900 dark:text-cyan-200 mb-1">{t('housing.host_bookings.your_response', 'Your response')}:</p>
                      <p className="text-sm text-cyan-700 dark:text-cyan-300" data-testid={`text-host-response-${booking.id}`}>{booking.hostResponse}</p>
                      {booking.respondedAt && (
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                          {t('housing.host_bookings.responded_on', { defaultValue: 'Responded on {{date}}', date: format(new Date(booking.respondedAt), 'MMM dd, yyyy') })}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-cyan-200/20 dark:border-cyan-800/20">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('housing.host_bookings.requested_on', { defaultValue: 'Requested on {{date}}', date: format(new Date(booking.createdAt), 'MMM dd, yyyy') })}
                </p>
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <MagneticButton
                        onClick={() => handleOpenResponseDialog(booking.id, 'reject')}
                        strength={0.2}
                        className="glass-card glass-depth-1 border-red-200/30 dark:border-red-500/30 px-4 py-2 text-red-700 dark:text-red-300 flex items-center gap-2"
                        data-testid={`button-reject-${booking.id}`}
                      >
                        <XCircle className="w-4 h-4" />
                        {t('housing.host_bookings.reject', 'Reject')}
                      </MagneticButton>
                      <PulseButton
                        onClick={() => handleOpenResponseDialog(booking.id, 'approve')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white flex items-center gap-2 rounded-xl"
                        data-testid={`button-approve-${booking.id}`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('housing.host_bookings.approve', 'Approve')}
                      </PulseButton>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <PulseButton
                      onClick={() => setBookingToReview(booking)}
                      pulseColor="rgba(6, 182, 212, 0.6)"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl flex items-center gap-2"
                      data-testid={`button-review-guest-${booking.id}`}
                    >
                      <Star className="w-4 h-4" />
                      {t('housing.host_bookings.review_guest', 'Review Guest')}
                    </PulseButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </ScaleIn>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <FadeIn>
            <GlassCard depth={2} className="mb-6 border-cyan-200/30 dark:border-ocean-500/30">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Link href="/housing-marketplace">
                    <MagneticButton
                      strength={0.15}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-ocean-500/30 p-2"
                     
                    >
                      <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </MagneticButton>
                  </Link>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                      {t('housing.host_bookings.title', 'Host Dashboard')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {t('housing.host_bookings.subtitle', 'Manage booking requests for your properties')}
                    </p>
                  </div>
                  <GlassCard depth={1} className="p-4 text-center border-cyan-200/20 dark:border-ocean-500/20">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('housing.host_bookings.total_bookings', 'Total bookings')}</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">{bookings.length}</p>
                  </GlassCard>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Tabbed Interface */}
          <ScaleIn delay={0.1}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="glass-card glass-depth-2 border-cyan-200/30 dark:border-ocean-500/30 p-2 rounded-2xl">
                <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
                  <TabsTrigger 
                    value="pending" 
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white" 
                   
                  >
                    <Clock className="w-4 h-4" />
                    {t('housing.host_bookings.tab_pending', 'Pending')} ({pendingBookings.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approved" 
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white" 
                   
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('housing.host_bookings.tab_approved', 'Approved')} ({approvedBookings.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white" 
                   
                  >
                    <XCircle className="w-4 h-4" />
                    {t('housing.host_bookings.tab_rejected', 'Rejected')} ({rejectedBookings.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="all" 
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white" 
                   
                  >
                    <Filter className="w-4 h-4" />
                    {t('housing.host_bookings.tab_all', 'All')} ({bookings.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Pending Bookings */}
              <TabsContent value="pending" className="space-y-6">
                {pendingBookings.length === 0 ? (
                  <ScaleIn delay={0.2}>
                    <GlassCard depth={2} className="text-center py-12 border-cyan-200/30 dark:border-ocean-500/30">
                      <Clock className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('housing.host_bookings.no_pending_title', 'No pending requests')}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{t('housing.host_bookings.no_pending_desc', "You're all caught up! New booking requests will appear here.")}</p>
                    </GlassCard>
                  </ScaleIn>
                ) : (
                  <div ref={cardsRef}>
                    <StaggerContainer staggerDelay={0.08} className="booking-card-container">
                      {pendingBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                          {renderBookingCard(booking)}
                        </div>
                      ))}
                    </StaggerContainer>
                  </div>
                )}
              </TabsContent>

              {/* Approved Bookings */}
              <TabsContent value="approved" className="space-y-6">
                {approvedBookings.length === 0 ? (
                  <ScaleIn delay={0.2}>
                    <GlassCard depth={2} className="text-center py-12 border-cyan-200/30 dark:border-ocean-500/30">
                      <CheckCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('housing.host_bookings.no_approved_title', 'No approved bookings')}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{t('housing.host_bookings.no_approved_desc', 'Approved bookings will appear here.')}</p>
                    </GlassCard>
                  </ScaleIn>
                ) : (
                  <StaggerContainer staggerDelay={0.08}>
                    {approvedBookings.map(renderBookingCard)}
                  </StaggerContainer>
                )}
              </TabsContent>

              {/* Rejected Bookings */}
              <TabsContent value="rejected" className="space-y-6">
                {rejectedBookings.length === 0 ? (
                  <ScaleIn delay={0.2}>
                    <GlassCard depth={2} className="text-center py-12 border-cyan-200/30 dark:border-ocean-500/30">
                      <XCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('housing.host_bookings.no_rejected_title', 'No rejected bookings')}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{t('housing.host_bookings.no_rejected_desc', 'Rejected bookings will appear here.')}</p>
                    </GlassCard>
                  </ScaleIn>
                ) : (
                  <StaggerContainer staggerDelay={0.08}>
                    {rejectedBookings.map(renderBookingCard)}
                  </StaggerContainer>
                )}
              </TabsContent>

              {/* All Bookings */}
              <TabsContent value="all" className="space-y-6">
                {bookings.length === 0 ? (
                  <ScaleIn delay={0.2}>
                    <GlassCard depth={2} className="text-center py-12 border-cyan-200/30 dark:border-ocean-500/30">
                      <Home className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('housing.host_bookings.no_bookings_title', 'No bookings yet')}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{t('housing.host_bookings.no_bookings_desc', 'Booking requests for your properties will appear here.')}</p>
                    </GlassCard>
                  </ScaleIn>
                ) : (
                  <StaggerContainer staggerDelay={0.08}>
                    {bookings.map(renderBookingCard)}
                  </StaggerContainer>
                )}
              </TabsContent>
            </Tabs>
          </ScaleIn>
        </div>

        {/* Response Dialog */}
        <Dialog 
          open={respondingToBooking !== null} 
          onOpenChange={(open) => {
            if (!open && !respondToBookingMutation.isPending) {
              setRespondingToBooking(null);
              setResponseAction(null);
              setHostResponse('');
            }
          }}
        >
          <DialogContent className="max-w-md glass-card glass-depth-3 border-cyan-200/30 dark:border-ocean-500/30">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                {responseAction === 'approve' 
                  ? t('housing.host_bookings.dialog_approve_title', 'Approve Booking')
                  : t('housing.host_bookings.dialog_reject_title', 'Reject Booking')}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {responseAction === 'approve' 
                  ? t('housing.host_bookings.dialog_approve_desc', 'Send a welcome message to your guest to confirm the booking.')
                  : t('housing.host_bookings.dialog_reject_desc', 'Let the guest know why you cannot accommodate their request.')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="host-response" className="text-slate-700 dark:text-slate-300">
                  {t('housing.host_bookings.message_label', 'Your message to the guest')}
                </Label>
                <Textarea
                  id="host-response"
                  value={hostResponse}
                  onChange={(e) => setHostResponse(e.target.value)}
                  rows={4}
                  className="mt-2 bg-white/50 dark:bg-slate-800/50 border-cyan-200 dark:border-cyan-800"
                  placeholder={responseAction === 'approve' 
                    ? t('housing.host_bookings.message_placeholder_approve', 'Welcome the guest and provide any additional details...')
                    : t('housing.host_bookings.message_placeholder_reject', 'Explain why you cannot accept this booking...')}
                 
                />
              </div>
            </div>

            <DialogFooter>
              <MagneticButton
                onClick={() => {
                  setRespondingToBooking(null);
                  setResponseAction(null);
                  setHostResponse('');
                }}
                disabled={respondToBookingMutation.isPending}
                strength={0.15}
                className="glass-card glass-depth-1 border-slate-200/30 dark:border-slate-600/30 px-4 py-2 text-slate-700 dark:text-slate-300"
               
              >
                {t('housing.host_bookings.cancel', 'Cancel')}
              </MagneticButton>
              <PulseButton
                onClick={handleSubmitResponse}
                disabled={respondToBookingMutation.isPending}
                className={`px-4 py-2 text-white rounded-xl ${responseAction === 'approve' ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
               
              >
                {respondToBookingMutation.isPending 
                  ? t('housing.host_bookings.sending', 'Sending...') 
                  : `${responseAction === 'approve' 
                      ? t('housing.host_bookings.approve_send', 'Approve') 
                      : t('housing.host_bookings.reject_send', 'Reject')} & ${t('housing.host_bookings.send', 'Send')}`}
              </PulseButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={bookingToReview !== null} onOpenChange={(open) => !open && setBookingToReview(null)}>
          <DialogContent className="max-w-2xl glass-card glass-depth-3 border-cyan-200/30 dark:border-ocean-500/30">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                {t('housing.host_bookings.review_dialog_title', 'Review Your Guest')}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {t('housing.host_bookings.review_dialog_desc', 'Share your experience hosting this guest and help other hosts make informed decisions.')}
              </DialogDescription>
            </DialogHeader>
            {bookingToReview && (
              <div className="mt-4">
                <div className="mb-4 p-4 glass-card glass-depth-1 border-cyan-200/30 dark:border-ocean-500/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {bookingToReview.guest.profileImage ? (
                      <img
                        src={bookingToReview.guest.profileImage}
                        alt={bookingToReview.guest.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                        {bookingToReview.guest.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {bookingToReview.guest.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {bookingToReview.hostHome.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {format(new Date(bookingToReview.checkInDate), 'MMM dd')} - {format(new Date(bookingToReview.checkOutDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <GuestReviewForm
                  bookingId={bookingToReview.id}
                  guestId={bookingToReview.guestId}
                  reviewerId={user?.id || 0}
                  onSuccess={() => setBookingToReview(null)}
                  onCancel={() => setBookingToReview(null)}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
