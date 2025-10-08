import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Link, useRoute } from 'wouter';
import DashboardLayout from '../layouts/DashboardLayout';
import { ArrowLeft, Home, Calendar as CalendarIcon } from 'lucide-react';
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
import { GlassCard } from '../components/glass/GlassComponents';
import { FadeIn, ScaleIn } from '../components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '../components/interactions/MicroInteractions';
import { useScrollReveal } from '../utils/gsapAnimations';

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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, params] = useRoute('/host-calendar/:id');
  const initialHomeId = params?.id ? parseInt(params.id) : undefined;
  const [selectedHomeId, setSelectedHomeId] = useState<number | undefined>(initialHomeId);
  
  // GSAP scroll animations for Aurora Tide
  useScrollReveal('.calendar-selector', { delay: 0.2 });
  useScrollReveal('.calendar-restrictions', { delay: 0.3 });
  useScrollReveal('.calendar-main', { delay: 0.4 });

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
        title: t('housing.host_calendar.toast_updated_title', 'Calendar updated'),
        description: t('housing.host_calendar.toast_updated_desc', 'Your availability calendar has been updated successfully.'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('housing.host_calendar.toast_error_title', 'Update failed'),
        description: error.message || t('housing.host_calendar.toast_error_desc', 'Could not update calendar. Please try again.'),
        variant: 'destructive',
      });
    },
  });

  const homes = homesData?.homes || [];
  const selectedHome = homes.find(h => h.id === selectedHomeId);

  // If initial home ID from params and homes loaded, ensure it's selected
  useEffect(() => {
    if (initialHomeId && !selectedHomeId && homes.length > 0 && homes.some(h => h.id === initialHomeId)) {
      setSelectedHomeId(initialHomeId);
    }
  }, [initialHomeId, selectedHomeId, homes]);

  // Auto-select first home if none selected and homes are loaded
  useEffect(() => {
    if (!selectedHomeId && homes.length > 0 && !isLoadingHomes) {
      setSelectedHomeId(homes[0].id);
    }
  }, [selectedHomeId, homes, isLoadingHomes]);

  if (isLoadingHomes) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
          <div className="max-w-5xl mx-auto px-4">
            <Skeleton className="h-10 w-64 mb-8 bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-full bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-96 w-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (homes.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
          <div className="max-w-5xl mx-auto px-4">
            <FadeIn>
              <GlassCard depth={2} className="mb-6 border-cyan-200/30 dark:border-cyan-500/30">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <Link href="/host-bookings">
                      <MagneticButton
                        strength={0.15}
                        className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 p-2"
                        data-testid="button-back-host-dashboard"
                      >
                        <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      </MagneticButton>
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-[var(--color-ocean-600)] bg-clip-text text-transparent" data-testid="heading-host-calendar">
                      {t('housing.host_calendar.title', 'Property Calendar')}
                    </h1>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            <ScaleIn delay={0.1}>
              <GlassCard depth={2} className="p-12 text-center border-cyan-200/30 dark:border-cyan-500/30">
                <Home className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {t('housing.host_calendar.no_properties_title', 'No Properties Listed')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {t('housing.host_calendar.no_properties_desc', 'You need to create a property listing before you can manage your calendar.')}
                </p>
                <Link href="/host-onboarding">
                  <PulseButton className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] via-teal-500 to-[var(--color-ocean-500)] text-white rounded-xl">
                    {t('housing.host_calendar.create_first_listing', 'Create Your First Listing')}
                  </PulseButton>
                </Link>
              </GlassCard>
            </ScaleIn>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <FadeIn>
            <GlassCard depth={2} className="mb-6 border-cyan-200/30 dark:border-cyan-500/30">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Link href="/host-bookings">
                    <MagneticButton
                      strength={0.15}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 p-2"
                      data-testid="button-back-host-dashboard"
                    >
                      <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </MagneticButton>
                  </Link>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-[var(--color-ocean-600)] bg-clip-text text-transparent" data-testid="heading-host-calendar">
                      {t('housing.host_calendar.title', 'Property Calendar')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {t('housing.host_calendar.subtitle', 'Manage availability and blocked dates for your properties')}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Property Selector */}
          <ScaleIn delay={0.05}>
            <GlassCard depth={2} className="calendar-selector mb-6 border-cyan-200/30 dark:border-cyan-500/30">
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[var(--color-primary)] dark:text-cyan-400" />
                  {t('housing.host_calendar.select_property', 'Select Property')}
                </label>
                <Select
                  value={selectedHomeId?.toString()}
                  onValueChange={(value) => setSelectedHomeId(parseInt(value))}
                >
                  <SelectTrigger 
                    className="w-full glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 bg-[var(--color-surface)]/50 dark:bg-slate-800/50" 
                    data-testid="select-property-calendar"
                  >
                    <SelectValue placeholder={t('housing.host_calendar.choose_property', 'Choose a property')} />
                  </SelectTrigger>
                  <SelectContent className="glass-card glass-depth-3 border-cyan-200/30 dark:border-cyan-500/30">
                    {homes.map((home) => (
                      <SelectItem 
                        key={home.id} 
                        value={home.id.toString()} 
                        data-testid={`option-property-${home.id}`}
                        className="focus:bg-gradient-to-r focus:from-cyan-100 focus:to-teal-100 dark:focus:from-cyan-900/50 dark:focus:to-teal-900/50"
                      >
                        {home.title} - {home.city}, {home.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>
          </ScaleIn>

          {/* Booking Restrictions - ESA Layer 9 */}
          {selectedHomeId && (
            <ScaleIn delay={0.1}>
              <div className="calendar-restrictions mb-6">
                <BookingRestrictionsCard propertyId={selectedHomeId} />
              </div>
            </ScaleIn>
          )}

          {/* Calendar Component */}
          {selectedHomeId && (
            <ScaleIn delay={0.15}>
              <div className="calendar-main">
                {isLoadingAvailability ? (
                  <div className="space-y-6">
                    <GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
                      <Skeleton className="h-96 w-full bg-slate-200 dark:bg-slate-800" />
                    </GlassCard>
                    <GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30">
                      <Skeleton className="h-48 w-full bg-slate-200 dark:bg-slate-800" />
                    </GlassCard>
                  </div>
                ) : availabilityData?.data ? (
                  <BookingCalendar
                    homeId={selectedHomeId}
                    bookings={availabilityData.data.bookings}
                    blockedDates={availabilityData.data.blockedDates}
                    onUpdateBlockedDates={(blockedDates) => updateBlockedDatesMutation.mutateAsync(blockedDates)}
                    isUpdating={updateBlockedDatesMutation.isPending}
                    data-testid={`calendar-property-${selectedHomeId}`}
                  />
                ) : (
                  <GlassCard depth={2} className="p-12 text-center border-cyan-200/30 dark:border-cyan-500/30">
                    <p className="text-slate-600 dark:text-slate-400" data-testid="text-calendar-error">
                      {t('housing.host_calendar.unable_to_load', 'Unable to load calendar data')}
                    </p>
                  </GlassCard>
                )}
              </div>
            </ScaleIn>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
