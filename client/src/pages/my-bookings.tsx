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
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Ban
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { GlassCard } from '../components/glass/GlassComponents';
import { FadeIn, ScaleIn, StaggerContainer } from '../components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '../components/interactions/MicroInteractions';
import { HostReviewForm } from '../components/reviews/HostReviewForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Star } from 'lucide-react';
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
  host: {
    id: number;
    name: string;
    profileImage: string | null;
  };
}

export default function MyBookings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
  const [bookingToReview, setBookingToReview] = useState<BookingWithDetails | null>(null);

  const { data: bookingsData, isLoading, error } = useQuery<{ success: boolean; bookings: BookingWithDetails[] }>({
    queryKey: ['/api/bookings'],
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return await apiRequest(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: t('housing.my_bookings.toast_cancelled_title', 'Booking cancelled'),
        description: t('housing.my_bookings.toast_cancelled_desc', 'Your booking request has been cancelled.'),
      });
      setBookingToCancel(null);
    },
    onError: (error: any) => {
      toast({
        title: t('housing.my_bookings.toast_error_title', 'Cancellation failed'),
        description: error.message || t('housing.my_bookings.toast_error_desc', 'Could not cancel the booking.'),
        variant: 'destructive',
      });
      setBookingToCancel(null);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
    <>
      <Helmet>
        <title>My Bookings | Life CEO</title>
      </Helmet>
      
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 border border-yellow-200/50 dark:border-yellow-500/30" data-testid={`badge-status-pending`}>
            <Clock className="w-3 h-3 text-yellow-700 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{t('housing.my_bookings.status_pending', 'Pending')}</span>
          </div>
        
    </>
  );
      case 'approved':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 border border-cyan-200/50 dark:border-ocean-500/30" data-testid={`badge-status-approved`}>
            <CheckCircle className="w-3 h-3 text-cyan-700 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{t('housing.my_bookings.status_approved', 'Approved')}</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 border border-red-200/50 dark:border-red-500/30" data-testid={`badge-status-rejected`}>
            <XCircle className="w-3 h-3 text-red-700 dark:text-red-400" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">{t('housing.my_bookings.status_rejected', 'Rejected')}</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 border border-slate-200/50 dark:border-slate-600/30" data-testid={`badge-status-cancelled`}>
            <Ban className="w-3 h-3 text-slate-700 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('housing.my_bookings.status_cancelled', 'Cancelled')}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200/50 dark:border-blue-500/30" data-testid={`badge-status-completed`}>
            <CheckCircle className="w-3 h-3 text-blue-700 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('housing.my_bookings.status_completed', 'Completed')}</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/40 border border-slate-200/50 dark:border-slate-600/30" data-testid={`badge-status-unknown`}>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status}</span>
          </div>
        );
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights;
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
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                      {t('housing.my_bookings.title', 'My Bookings')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {t('housing.my_bookings.subtitle', 'View and manage your accommodation requests')}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Empty State */}
          {bookings.length === 0 && (
            <ScaleIn delay={0.1}>
              <GlassCard depth={2} className="text-center py-12 border-cyan-200/30 dark:border-ocean-500/30">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 glass-card glass-depth-1 rounded-full flex items-center justify-center border-cyan-200/30 dark:border-ocean-500/30">
                    <Calendar className="w-8 h-8 text-ocean-500 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {t('housing.my_bookings.no_bookings_title', 'No bookings yet')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {t('housing.my_bookings.no_bookings_desc', 'Start exploring accommodations and make your first booking request!')}
                    </p>
                    <Link href="/housing-marketplace">
                      <PulseButton className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white rounded-xl">
                        {t('housing.my_bookings.browse_listings', 'Browse Listings')}
                      </PulseButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </ScaleIn>
          )}

          {/* Bookings List */}
          <StaggerContainer staggerDelay={0.08}>
            <div className="space-y-6">
              {bookings.map((booking) => {
                const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
                
                // Defensive guards for nested properties
                if (!booking.hostHome) {
                  console.warn(`Booking ${booking.id} missing hostHome data`);
                  return null;
                }

                const propertyPhoto = booking.hostHome.photos?.[0] || '/placeholder-home.jpg';
                const propertyTitle = booking.hostHome.title || 'Untitled Property';
                const propertyLocation = `${booking.hostHome.city || 'Unknown'}, ${booking.hostHome.country || 'Unknown'}`;
                
                return (
                  <ScaleIn key={booking.id} delay={0.05}>
                    <GlassCard 
                      depth={2} 
                      className="overflow-hidden border-cyan-200/30 dark:border-ocean-500/30 hover:border-cyan-300/50 dark:hover:border-cyan-400/50 transition-all duration-300" 
                      data-testid={`card-booking-${booking.id}`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Property Image */}
                        <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                          <img
                            src={propertyPhoto}
                            alt={propertyTitle}
                            className="w-full h-full object-cover"
                            data-testid={`img-property-${booking.id}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <Link href={`/listing/${booking.hostHomeId}`}>
                                  <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent hover:from-cyan-700 hover:to-teal-700 dark:hover:from-cyan-300 dark:hover:to-teal-300 cursor-pointer transition-all" data-testid={`text-property-title-${booking.id}`}>
                                    {propertyTitle}
                                  </h3>
                                </Link>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1" data-testid={`text-property-location-${booking.id}`}>
                                <MapPin className="w-4 h-4" />
                                {propertyLocation}
                              </p>
                            </div>
                          </div>

                          {/* Booking Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Calendar className="w-4 h-4 text-ocean-500 dark:text-cyan-400" />
                              <div className="text-sm">
                                <p className="font-medium" data-testid={`text-check-in-${booking.id}`}>{t('housing.my_bookings.check_in', 'Check-in')}: {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</p>
                                <p className="font-medium" data-testid={`text-check-out-${booking.id}`}>{t('housing.my_bookings.check_out', 'Check-out')}: {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</p>
                                <p className="text-slate-500 dark:text-slate-400" data-testid={`text-nights-${booking.id}`}>
                                  {t('housing.my_bookings.nights', { 
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
                                <p className="font-medium" data-testid={`text-guests-${booking.id}`}>
                                  {t('housing.my_bookings.guests', {
                                    defaultValue: '{{count}} guest',
                                    defaultValue_plural: '{{count}} guests',
                                    count: booking.guestCount
                                  })}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400">{t('housing.my_bookings.purpose', 'Purpose')}: {booking.purpose}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent" data-testid={`text-total-price-${booking.id}`}>
                                ${(booking.totalPrice / 100).toFixed(2)}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{t('housing.my_bookings.total_price', 'Total price')}</p>
                            </div>
                          </div>

                          {/* Message to Host */}
                          <GlassCard depth={1} className="p-4 mb-4 border-slate-200/20 dark:border-slate-700/20">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-1" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('housing.my_bookings.your_message', 'Your message')}:</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400" data-testid={`text-guest-message-${booking.id}`}>{booking.message}</p>
                              </div>
                            </div>
                          </GlassCard>

                          {/* Host Response */}
                          {booking.hostResponse && (
                            <GlassCard depth={1} className="p-4 mb-4 border-cyan-200/30 dark:border-ocean-500/30 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/30 dark:to-teal-950/30">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-1" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-cyan-900 dark:text-cyan-200 mb-1">{t('housing.my_bookings.host_response', 'Host response')}:</p>
                                  <p className="text-sm text-cyan-700 dark:text-cyan-300" data-testid={`text-host-response-${booking.id}`}>{booking.hostResponse}</p>
                                  {booking.respondedAt && (
                                    <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                                      {t('housing.my_bookings.responded_on', { defaultValue: 'Responded on {{date}}', date: format(new Date(booking.respondedAt), 'MMM dd, yyyy') })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </GlassCard>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-cyan-200/20 dark:border-cyan-800/20">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('housing.my_bookings.requested_on', { defaultValue: 'Requested on {{date}}', date: format(new Date(booking.createdAt), 'MMM dd, yyyy') })}
                            </p>
                            <div className="flex gap-2">
                              {booking.status === 'pending' && (
                                <MagneticButton
                                  onClick={() => setBookingToCancel(booking.id)}
                                  strength={0.2}
                                  className="glass-card glass-depth-1 border-red-200/30 dark:border-red-500/30 px-4 py-2 text-red-700 dark:text-red-300 flex items-center gap-2"
                                  data-testid={`button-cancel-${booking.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {t('housing.my_bookings.cancel_request', 'Cancel Request')}
                                </MagneticButton>
                              )}
                              {booking.status === 'completed' && (
                                <PulseButton
                                  onClick={() => setBookingToReview(booking)}
                                  pulseColor="rgba(6, 182, 212, 0.6)"
                                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl flex items-center gap-2"
                                  data-testid={`button-write-review-${booking.id}`}
                                >
                                  <Star className="w-4 h-4" />
                                  {t('housing.my_bookings.write_review', 'Write a Review')}
                                </PulseButton>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </ScaleIn>
                );
              })}
            </div>
          </StaggerContainer>
        </div>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog 
          open={bookingToCancel !== null} 
          onOpenChange={(open) => {
            if (!open && !cancelBookingMutation.isPending) {
              setBookingToCancel(null);
            }
          }}
        >
          <AlertDialogContent className="glass-card glass-depth-3 border-cyan-200/30 dark:border-ocean-500/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900 dark:text-white">
                {t('housing.my_bookings.dialog_cancel_title', 'Cancel Booking Request')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                {t('housing.my_bookings.dialog_cancel_desc', 'Are you sure you want to cancel this booking request? This action cannot be undone.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <MagneticButton
                onClick={() => setBookingToCancel(null)}
                disabled={cancelBookingMutation.isPending}
                strength={0.15}
                className="glass-card glass-depth-1 border-slate-200/30 dark:border-slate-600/30 px-4 py-2 text-slate-700 dark:text-slate-300"
               
              >
                {t('housing.my_bookings.keep_it', 'No, keep it')}
              </MagneticButton>
              <PulseButton
                onClick={(e) => {
                  e.preventDefault();
                  if (bookingToCancel) {
                    cancelBookingMutation.mutate(bookingToCancel);
                  }
                }}
                disabled={cancelBookingMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl"
               
              >
                {cancelBookingMutation.isPending ? t('housing.my_bookings.cancelling', 'Cancelling...') : t('housing.my_bookings.yes_cancel', 'Yes, cancel')}
              </PulseButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Review Dialog */}
        <Dialog open={bookingToReview !== null} onOpenChange={(open) => !open && setBookingToReview(null)}>
          <DialogContent className="max-w-2xl glass-card glass-depth-3 border-cyan-200/30 dark:border-ocean-500/30">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                {t('housing.my_bookings.review_dialog_title', 'Write a Review')}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {t('housing.my_bookings.review_dialog_desc', 'Share your experience with this property and help other guests make informed decisions.')}
              </DialogDescription>
            </DialogHeader>
            {bookingToReview && (
              <div className="mt-4">
                <div className="mb-4 p-4 glass-card glass-depth-1 border-cyan-200/30 dark:border-ocean-500/30 rounded-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {bookingToReview.hostHome.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {bookingToReview.hostHome.city}, {bookingToReview.hostHome.country}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    {format(new Date(bookingToReview.checkInDate), 'MMM dd')} - {format(new Date(bookingToReview.checkOutDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <HostReviewForm
                  bookingId={bookingToReview.id}
                  homeId={bookingToReview.hostHomeId}
                  hostId={bookingToReview.host.id}
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
