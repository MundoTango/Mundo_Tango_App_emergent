import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Link } from 'wouter';
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [respondingToBooking, setRespondingToBooking] = useState<number | null>(null);
  const [responseAction, setResponseAction] = useState<'approve' | 'reject' | null>(null);
  const [hostResponse, setHostResponse] = useState('');

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
        title: responseAction === 'approve' ? 'Booking approved!' : 'Booking rejected',
        description: `You have ${responseAction}d this booking request.`,
      });
      setRespondingToBooking(null);
      setResponseAction(null);
      setHostResponse('');
    },
    onError: (error: any) => {
      toast({
        title: 'Action failed',
        description: error.message || 'Could not update booking status.',
        variant: 'destructive',
      });
    },
  });

  const handleOpenResponseDialog = (bookingId: number, action: 'approve' | 'reject') => {
    setRespondingToBooking(bookingId);
    setResponseAction(action);
    if (action === 'approve') {
      setHostResponse('Thank you for your booking request! I look forward to hosting you.');
    } else {
      setHostResponse('Unfortunately, I cannot accommodate your booking at this time.');
    }
  };

  const handleSubmitResponse = () => {
    if (!respondingToBooking || !responseAction) return;

    if (!hostResponse.trim()) {
      toast({
        title: 'Message required',
        description: 'Please provide a response message to the guest.',
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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
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
      <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-host-booking-${booking.id}`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Property Image */}
            <div className="md:w-64 h-48 md:h-auto">
              <img
                src={propertyPhoto}
                alt={propertyTitle}
                className="w-full h-full object-cover"
                data-testid={`img-booking-property-${booking.id}`}
              />
            </div>

            {/* Booking Details */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/listing/${booking.hostHomeId}`}>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer" data-testid={`text-booking-property-${booking.id}`}>
                        {propertyTitle}
                      </h3>
                    </Link>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {booking.hostHome.city}, {booking.hostHome.country}
                  </p>
                </div>
              </div>

              {/* Guest Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  {booking.guest.profileImage ? (
                    <img src={booking.guest.profileImage} alt={booking.guest.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold">
                      {booking.guest.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900" data-testid={`text-guest-name-${booking.id}`}>
                      {booking.guest.name}
                    </p>
                    <p className="text-sm text-gray-600">Guest</p>
                  </div>
                </div>
              </div>

              {/* Booking Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div className="text-sm">
                    <p className="font-medium">Check-in: {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</p>
                    <p className="font-medium">Check-out: {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</p>
                    <p className="text-gray-500">{nights} night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div className="text-sm">
                    <p className="font-medium">{booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</p>
                    <p className="text-gray-500">Purpose: {booking.purpose}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900" data-testid={`text-booking-price-${booking.id}`}>
                    ${(booking.totalPrice / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Total earnings</p>
                </div>
              </div>

              {/* Guest Message */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Guest's message:</p>
                    <p className="text-sm text-gray-600" data-testid={`text-guest-message-${booking.id}`}>{booking.message}</p>
                  </div>
                </div>
              </div>

              {/* Host Response (if any) */}
              {booking.hostResponse && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-1">Your response:</p>
                      <p className="text-sm text-green-700" data-testid={`text-host-response-${booking.id}`}>{booking.hostResponse}</p>
                      {booking.respondedAt && (
                        <p className="text-xs text-green-600 mt-1">
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
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenResponseDialog(booking.id, 'reject')}
                      data-testid={`button-reject-${booking.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenResponseDialog(booking.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`button-approve-${booking.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/housing-marketplace">
            <Button variant="ghost" size="icon" data-testid="button-back-marketplace">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-host-bookings">
              Host Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage booking requests for your properties
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total bookings</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
              <Clock className="w-4 h-4" />
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2" data-testid="tab-approved">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2" data-testid="tab-rejected">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2" data-testid="tab-all">
              <Filter className="w-4 h-4" />
              All ({bookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Bookings */}
          <TabsContent value="pending" className="space-y-6">
            {pendingBookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">You're all caught up! New booking requests will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map(renderBookingCard)
            )}
          </TabsContent>

          {/* Approved Bookings */}
          <TabsContent value="approved" className="space-y-6">
            {approvedBookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No approved bookings</h3>
                  <p className="text-gray-600">Approved bookings will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              approvedBookings.map(renderBookingCard)
            )}
          </TabsContent>

          {/* Rejected Bookings */}
          <TabsContent value="rejected" className="space-y-6">
            {rejectedBookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No rejected bookings</h3>
                  <p className="text-gray-600">Rejected bookings will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              rejectedBookings.map(renderBookingCard)
            )}
          </TabsContent>

          {/* All Bookings */}
          <TabsContent value="all" className="space-y-6">
            {bookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">Booking requests for your properties will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map(renderBookingCard)
            )}
          </TabsContent>
        </Tabs>
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
        <DialogContent className="max-w-md" data-testid="dialog-respond-booking">
          <DialogHeader>
            <DialogTitle>
              {responseAction === 'approve' ? 'Approve Booking' : 'Reject Booking'}
            </DialogTitle>
            <DialogDescription>
              {responseAction === 'approve' 
                ? 'Send a welcome message to your guest to confirm the booking.'
                : 'Let the guest know why you cannot accommodate their request.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="host-response">Your message to the guest</Label>
              <Textarea
                id="host-response"
                value={hostResponse}
                onChange={(e) => setHostResponse(e.target.value)}
                rows={4}
                className="mt-2"
                placeholder={responseAction === 'approve' 
                  ? 'Welcome the guest and provide any additional details...'
                  : 'Explain why you cannot accept this booking...'}
                data-testid="textarea-host-response"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRespondingToBooking(null);
                setResponseAction(null);
                setHostResponse('');
              }}
              disabled={respondToBookingMutation.isPending}
              data-testid="button-cancel-response"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={respondToBookingMutation.isPending}
              className={responseAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              data-testid="button-submit-response"
            >
              {respondToBookingMutation.isPending ? 'Sending...' : `${responseAction === 'approve' ? 'Approve' : 'Reject'} & Send`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
