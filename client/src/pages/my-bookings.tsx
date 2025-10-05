import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  const { toast } = useToast();
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

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
        title: 'Booking cancelled',
        description: 'Your booking request has been cancelled.',
      });
      setBookingToCancel(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation failed',
        description: error.message || 'Could not cancel the booking.',
        variant: 'destructive',
      });
      setBookingToCancel(null);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200" data-testid={`badge-status-pending`}><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid={`badge-status-approved`}><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" data-testid={`badge-status-rejected`}><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200" data-testid={`badge-status-cancelled`}><Ban className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" data-testid={`badge-status-completed`}><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-unknown`}>{status}</Badge>;
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <Skeleton className="w-48 h-32 rounded-lg" />
                      <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/housing-marketplace">
              <Button variant="ghost" size="icon" data-testid="button-back-to-marketplace">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-my-bookings">
                My Bookings
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your accommodation requests
              </p>
            </div>
          </div>

          {/* Empty State */}
          {bookings.length === 0 && (
            <Card className="text-center py-12" data-testid="card-empty-state">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start exploring accommodations and make your first booking request!
                    </p>
                    <Link href="/housing-marketplace">
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" data-testid="button-browse-listings">
                        Browse Listings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookings List */}
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
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-booking-${booking.id}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image */}
                      <div className="md:w-64 h-48 md:h-auto">
                        <img
                          src={propertyPhoto}
                          alt={propertyTitle}
                          className="w-full h-full object-cover"
                          data-testid={`img-property-${booking.id}`}
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/listing/${booking.hostHomeId}`}>
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer" data-testid={`text-property-title-${booking.id}`}>
                                  {propertyTitle}
                                </h3>
                              </Link>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-gray-600 flex items-center gap-1" data-testid={`text-property-location-${booking.id}`}>
                              <MapPin className="w-4 h-4" />
                              {propertyLocation}
                            </p>
                          </div>
                        </div>

                        {/* Booking Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div className="text-sm">
                              <p className="font-medium" data-testid={`text-check-in-${booking.id}`}>Check-in: {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</p>
                              <p className="font-medium" data-testid={`text-check-out-${booking.id}`}>Check-out: {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</p>
                              <p className="text-gray-500" data-testid={`text-nights-${booking.id}`}>{nights} night{nights > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users className="w-4 h-4 text-gray-500" />
                            <div className="text-sm">
                              <p className="font-medium" data-testid={`text-guests-${booking.id}`}>{booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</p>
                              <p className="text-gray-500">Purpose: {booking.purpose}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900" data-testid={`text-total-price-${booking.id}`}>
                              ${(booking.totalPrice / 100).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">Total price</p>
                          </div>
                        </div>

                        {/* Message to Host */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 mb-1">Your message:</p>
                              <p className="text-sm text-gray-600" data-testid={`text-guest-message-${booking.id}`}>{booking.message}</p>
                            </div>
                          </div>
                        </div>

                        {/* Host Response */}
                        {booking.hostResponse && (
                          <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-600 mt-1" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-1">Host response:</p>
                                <p className="text-sm text-blue-700" data-testid={`text-host-response-${booking.id}`}>{booking.hostResponse}</p>
                                {booking.respondedAt && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Responded on {format(new Date(booking.respondedAt), 'MMM dd, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <p className="text-xs text-gray-500">
                            Requested on {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                          </p>
                          {booking.status === 'pending' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setBookingToCancel(booking.id)}
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
          <AlertDialogContent data-testid="dialog-cancel-confirmation">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking request? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={cancelBookingMutation.isPending}
                data-testid="button-cancel-dialog-no"
              >
                No, keep it
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (bookingToCancel) {
                    cancelBookingMutation.mutate(bookingToCancel);
                  }
                }}
                disabled={cancelBookingMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-cancel-dialog-yes"
              >
                {cancelBookingMutation.isPending ? 'Cancelling...' : 'Yes, cancel'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
