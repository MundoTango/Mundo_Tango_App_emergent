import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../hooks/use-toast';
import { BookingCalendar } from '../components/BookingCalendar';
import { BookingRestrictionsCard } from '../components/housing/BookingRestrictionsCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface HostHome {
  id: number;
  title: string;
  city: string;
  country: string;
}

interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  guestCount: number;
}

interface BlockedDate {
  startDate: string;
  endDate: string;
  reason?: string;
}

interface AvailabilityData {
  homeId: number;
  blockedDates: BlockedDate[];
  bookings: Booking[];
}

export default function HostCalendar() {
  const { toast } = useToast();
  const [, params] = useRoute('/host-calendar/:id');
  const initialHomeId = params?.id ? parseInt(params.id) : undefined;
  const [selectedHomeId, setSelectedHomeId] = useState<number | undefined>(initialHomeId);

  // Fetch host's properties
  const { data: homesData, isLoading: isLoadingHomes } = useQuery<{ success: boolean; homes: HostHome[] }>({
    queryKey: ['/api/host-homes/my-properties'],
    queryFn: async () => {
      const response = await fetch('/api/host-homes/my-properties', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  // Fetch availability for selected home
  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery<{ success: boolean; data: AvailabilityData }>({
    queryKey: ['/api/host-homes', selectedHomeId, 'availability'],
    queryFn: async () => {
      if (!selectedHomeId) throw new Error('No home selected');
      const response = await fetch(`/api/host-homes/${selectedHomeId}/availability`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    },
    enabled: !!selectedHomeId,
  });

  // Update blocked dates mutation
  const updateBlockedDatesMutation = useMutation({
    mutationFn: async (blockedDates: BlockedDate[]): Promise<void> => {
      if (!selectedHomeId) throw new Error('No home selected');
      await apiRequest(`/api/host-homes/${selectedHomeId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ blockedDates }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/host-homes', selectedHomeId, 'availability'] });
      toast({
        title: 'Calendar updated',
        description: 'Your availability calendar has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update calendar. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const homes = homesData?.homes || [];
  const selectedHome = homes.find(h => h.id === selectedHomeId);

  // If initial home ID from params and homes loaded, ensure it's selected
  if (initialHomeId && !selectedHomeId && homes.length > 0 && homes.some(h => h.id === initialHomeId)) {
    setSelectedHomeId(initialHomeId);
  }

  // Auto-select first home if none selected and homes are loaded
  if (!selectedHomeId && homes.length > 0 && !isLoadingHomes) {
    setSelectedHomeId(homes[0].id);
  }

  if (isLoadingHomes) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (homes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/host-bookings">
              <Button variant="ghost" size="icon" data-testid="button-back-host-dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-host-calendar">
              Property Calendar
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Listed</h3>
            <p className="text-gray-600 mb-6">
              You need to create a property listing before you can manage your calendar.
            </p>
            <Link href="/host-onboarding">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Create Your First Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/host-bookings">
            <Button variant="ghost" size="icon" data-testid="button-back-host-dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-host-calendar">
              Property Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              Manage availability and blocked dates for your properties
            </p>
          </div>
        </div>

        {/* Property Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Property
          </label>
          <Select
            value={selectedHomeId?.toString()}
            onValueChange={(value) => setSelectedHomeId(parseInt(value))}
          >
            <SelectTrigger className="w-full max-w-md" data-testid="select-property">
              <SelectValue placeholder="Choose a property" />
            </SelectTrigger>
            <SelectContent>
              {homes.map((home) => (
                <SelectItem key={home.id} value={home.id.toString()} data-testid={`option-property-${home.id}`}>
                  {home.title} - {home.city}, {home.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Booking Restrictions - ESA Layer 9 */}
        {selectedHomeId && (
          <div className="mb-6">
            <BookingRestrictionsCard propertyId={selectedHomeId} />
          </div>
        )}

        {/* Calendar Component */}
        {selectedHomeId && (
          <div>
            {isLoadingAvailability ? (
              <div className="space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : availabilityData?.data ? (
              <BookingCalendar
                homeId={selectedHomeId}
                bookings={availabilityData.data.bookings}
                blockedDates={availabilityData.data.blockedDates}
                onUpdateBlockedDates={(blockedDates) => updateBlockedDatesMutation.mutateAsync(blockedDates)}
                isUpdating={updateBlockedDatesMutation.isPending}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">Unable to load calendar data</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
