import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useHotkeys } from 'react-hotkeys-hook';
import InfiniteScroll from 'react-infinite-scroll-component';
import { animated, useSpring } from 'react-spring';
// ESA Fix: Temporarily disabled fullcalendar imports to fix build
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Countdown from 'react-countdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { Tooltip } from 'react-tooltip';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LazyLoad from 'react-lazyload';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Plus,
  Grid,
  List,
  Map,
  Download,
  Upload,
  Filter,
  Clock,
  Star,
  Video,
  Ticket,
  Share2,
  Copy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Timer,
  TrendingUp,
  Globe,
  Music,
  DollarSign,
  QrCode,
  RefreshCw,
  CheckCircle,
  Info,
  X
} from 'lucide-react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import UnifiedEventCard from '@/components/events/UnifiedEventCard';
import { useEventRSVP } from '@/hooks/useEventRSVP';

// Lazy load the map component for better performance
const LeafletMap = lazy(() => import('@/components/LeafletMap'));

interface Event {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  photos?: string[];
  location?: string;
  coordinates?: { lat: number; lng: number };
  startDate: string;
  endDate?: string;
  userId: number;
  isPublic: boolean;
  maxAttendees?: number;
  currentAttendees?: number;
  price?: string;
  currency?: string;
  ticketUrl?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  isVirtual?: boolean;
  virtualPlatform?: string;
  virtualUrl?: string;
  eventType?: string;
  category?: string;
  level?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  participants?: any[];
  userStatus?: 'going' | 'interested' | 'maybe' | null;
  tags?: string[];
  languages?: string[];
}

interface EventApiResponse {
  success: boolean;
  data: Event[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

const localizer = momentLocalizer(moment);

const categoryColors: Record<string, string> = {
  milonga: '#38b2ac',
  class: '#3182ce',
  workshop: '#8b5cf6',
  festival: '#ec4899',
  performance: '#f59e0b',
  practice: '#10b981',
  social: '#06b6d4'
};

const viewOptions = [
  { value: 'list', label: 'List View', icon: List },
  { value: 'grid', label: 'Grid View', icon: Grid },
  { value: 'calendar', label: 'Calendar View', icon: CalendarDays },
  { value: 'map', label: 'Map View', icon: Map }
];

export default function EnhancedEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar' | 'map'>('list');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState(50); // km
  
  const { toast } = useToast();
  const eventRsvpMutation = useEventRSVP();

  // Animations
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 }
  });

  // Keyboard shortcuts
  useHotkeys('cmd+n, ctrl+n', (e) => {
    e.preventDefault();
    setShowCreateDialog(true);
  });

  useHotkeys('cmd+e, ctrl+e', (e) => {
    e.preventDefault();
    exportEventsToCSV();
  });

  useHotkeys('cmd+/, ctrl+/', (e) => {
    e.preventDefault();
    document.getElementById('event-search')?.focus();
  });

  // Fetch events with ESA Layer 14 cache configuration
  const { data: eventsData, isLoading: eventsLoading, refetch } = useQuery<EventApiResponse>({
    queryKey: ['/api/events/feed', {
      search: searchQuery,
      category: categoryFilter,
      level: levelFilter,
      price: priceFilter,
      virtual: showVirtualOnly,
      dateStart: dateRange.start?.toISOString(),
      dateEnd: dateRange.end?.toISOString(),
      tab: activeTab
    }],
    enabled: true,
    staleTime: 0,
    structuralSharing: false
  });

  const events = eventsData?.data || [];

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to RSVP');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "RSVP updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  });

  // Export to CSV
  const exportEventsToCSV = () => {
    const csvConfig = mkConfig({
      fieldSeparator: ',',
      quoteStrings: true,
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Mundo Tango Events',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      columnHeaders: [
        { key: 'title', displayLabel: 'Title' },
        { key: 'date', displayLabel: 'Date' },
        { key: 'location', displayLabel: 'Location' },
        { key: 'category', displayLabel: 'Category' },
        { key: 'price', displayLabel: 'Price' },
        { key: 'attendees', displayLabel: 'Attendees' }
      ]
    });

    const csvData = events.map(event => ({
      title: event.title,
      date: moment(event.startDate).format('YYYY-MM-DD HH:mm'),
      location: event.location || 'TBD',
      category: event.category || event.eventType || 'Event',
      price: event.price ? `${event.currency || '$'}${event.price}` : 'Free',
      attendees: `${event.currentAttendees || 0}/${event.maxAttendees || '∞'}`
    }));

    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
    
    toast({
      title: "Exported!",
      description: `Successfully exported ${events.length} events`,
    });
  };

  // Calendar events formatting
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id.toString(), // Convert to string for FullCalendar
      title: event.title,
      start: new Date(event.startDate),
      end: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      extendedProps: {
        resource: event
      },
      backgroundColor: categoryColors[event.category || 'social'],
      borderColor: categoryColors[event.category || 'social']
    }));
  }, [events]);

  // Countdown renderer
  const countdownRenderer = ({ days, hours, minutes, completed }: any) => {
    if (completed) {
      return <span className="text-green-600 font-medium">Happening now!</span>;
    } else {
      return (
        <span className="text-turquoise-600 font-medium">
          {days}d {hours}h {minutes}m
        </span>
      );
    }
  };

  if (eventsLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Skeleton height={60} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height={300} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <animated.div style={fadeIn} className="max-w-7xl mx-auto p-6" data-testid="link-max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              Events
            </h1>
            <p className="text-gray-600 mt-1 dark:text-neutral-400">Discover and join tango events worldwide</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportEventsToCSV}
              variant="outline"
              className="border-turquoise-200 hover:bg-turquoise-50"
             data-testid="button-border-turquoise-200">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() = data-testid="button-element"> setShowCreateDialog(true)}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-turquoise-600" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total Events</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold">
                  {events.filter(e => moment(e.startDate).isAfter()).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Upcoming</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.userStatus === 'going').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Attending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-turquoise-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {events.filter(e => moment(e.startDate).isSame(moment(), 'week')).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">This Week</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters with MT ocean theme */}
        <Card className="mb-6 p-4 glassmorphic-card bg-gradient-to-r from-white/90 via-turquoise-50/30 to-cyan-50/30 border-turquoise-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-turquoise-500 w-5 h-5" />
                <Input
                  id="event-search"
                  type="text"
                  placeholder="Search events... (Cmd+/)"
                  value={searchQuery}
                  onChange={(e) = data-testid="input-element"> setSearchQuery(e.target.value)}
                  className="pl-10 glassmorphic-input border-turquoise-200 focus:border-turquoise-400 focus:ring-turquoise-400/20"
                />
              </div>
              <div className="flex gap-2">
                {viewOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={viewMode === option.value ? 'default' : 'outline'}
                    size="icon"
                    onClick={() = data-testid="button-element"> setViewMode(option.value as any)}
                    data-tooltip-id="view-tooltip"
                    data-tooltip-content={option.label}
                    className={viewMode === option.value 
                      ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white hover:from-turquoise-500 hover:to-cyan-600' 
                      : 'border-turquoise-200 hover:bg-turquoise-50'
                    }
                  >
                    <option.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter} data-testid="select-element">
                <SelectTrigger className="w-40 border-turquoise-200 focus:border-turquoise-400" data-testid="select-w-40">
                  <SelectValue placeholder="Category" / data-testid="select-element">
                </SelectTrigger>
                <SelectContent data-testid="select-element">
                  <SelectItem value="all" data-testid="select-element">All Categories</SelectItem>
                  <SelectItem value="milonga" data-testid="select-element">Milonga</SelectItem>
                  <SelectItem value="class" data-testid="select-element">Class</SelectItem>
                  <SelectItem value="workshop" data-testid="select-element">Workshop</SelectItem>
                  <SelectItem value="festival" data-testid="select-element">Festival</SelectItem>
                  <SelectItem value="performance" data-testid="select-element">Performance</SelectItem>
                  <SelectItem value="practice" data-testid="select-element">Practice</SelectItem>
                  <SelectItem value="social" data-testid="select-element">Social</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter} data-testid="select-element">
                <SelectTrigger className="w-40 border-turquoise-200 focus:border-turquoise-400" data-testid="select-w-40">
                  <SelectValue placeholder="Level" / data-testid="select-element">
                </SelectTrigger>
                <SelectContent data-testid="select-element">
                  <SelectItem value="all" data-testid="select-element">All Levels</SelectItem>
                  <SelectItem value="beginner" data-testid="select-element">Beginner</SelectItem>
                  <SelectItem value="intermediate" data-testid="select-element">Intermediate</SelectItem>
                  <SelectItem value="advanced" data-testid="select-element">Advanced</SelectItem>
                  <SelectItem value="all_levels" data-testid="select-element">Mixed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter} data-testid="select-element">
                <SelectTrigger className="w-40 border-turquoise-200 focus:border-turquoise-400" data-testid="select-w-40">
                  <SelectValue placeholder="Price" / data-testid="select-element">
                </SelectTrigger>
                <SelectContent data-testid="select-element">
                  <SelectItem value="all" data-testid="select-element">Any Price</SelectItem>
                  <SelectItem value="free" data-testid="select-element">Free</SelectItem>
                  <SelectItem value="paid" data-testid="select-element">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showVirtualOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() = data-testid="button-element"> setShowVirtualOnly(!showVirtualOnly)}
                className={showVirtualOnly 
                  ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white hover:from-turquoise-500 hover:to-cyan-600' 
                  : 'border-turquoise-200 hover:bg-turquoise-50'
                }
              >
                <Video className="w-4 h-4 mr-1" />
                Virtual Only
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() = data-testid="button-element"> refetch()}
                className="border-turquoise-200 hover:bg-turquoise-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Event Tabs with MT styling */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 border border-turquoise-200/50">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="today" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              Today
            </TabsTrigger>
            <TabsTrigger value="thisWeek" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              This Week
            </TabsTrigger>
            <TabsTrigger value="myEvents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              My Events
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Events Display */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            <InfiniteScroll
              dataLength={events.length}
              next={() => {}}
              hasMore={false}
              loader={<Skeleton height={100} count={3} />}
              endMessage={
                <p className="text-center text-gray-500 mt-8">
                  You've seen all events! 🎉
                </p>
              }
            >
              {events.map(event => (
                <UnifiedEventCard
                  key={event.id}
                  event={{
                    id: event.id.toString(),
                    title: event.title,
                    type: event.eventType || event.category || 'milonga',
                    date: event.startDate,
                    time: new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
                    location: event.location || 'Location TBA',
                    city: event.user?.city,
                    attendees: event.currentAttendees || 0,
                    userRsvpStatus: event.userStatus || null,
                    isFeatured: false
                  }}
                  rsvpMutation={eventRsvpMutation}
                />
              ))}
            </InfiniteScroll>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <UnifiedEventCard
                key={event.id}
                event={{
                  id: event.id.toString(),
                  title: event.title,
                  type: event.eventType || event.category || 'milonga',
                  date: event.startDate,
                  time: new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
                  location: event.location || 'Location TBA',
                  city: event.user?.city,
                  attendees: event.currentAttendees || 0,
                  userRsvpStatus: event.userStatus || null,
                  isFeatured: false
                }}
                rsvpMutation={eventRsvpMutation}
              />
            ))}
          </div>
        )}

        {viewMode === 'calendar' && (
          <Card className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={calendarView === 'month' ? 'default' : 'outline'}
                  onClick={() = data-testid="button-element"> setCalendarView('month')}
                >
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={calendarView === 'week' ? 'default' : 'outline'}
                  onClick={() = data-testid="button-element"> setCalendarView('week')}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={calendarView === 'day' ? 'default' : 'outline'}
                  onClick={() = data-testid="button-element"> setCalendarView('day')}
                >
                  Day
                </Button>
              </div>
            </div>
            <div className="h-[600px]">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents.map(event => ({
                  ...event,
                  resource: event
                }))}
                view={calendarView}
                onView={setCalendarView}
                onSelectEvent={(event: any) => {
                  setSelectedEvent(event.resource);
                }}
                views={['month', 'week', 'day']}
                step={30}
                showMultiDayTimes
                style={{ height: '100%' }}
                components={{
                  event: ({ event }: any) => (
                    <div className="p-1 text-xs">
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="text-gray-600 dark:text-neutral-400">{moment(event.start).format('h:mm A')}</div>
                    </div>
                  )
                }}
              />
            </div>
          </Card>
        )}

        {viewMode === 'map' && (
          <Card className="p-6 glassmorphic-card bg-gradient-to-br from-white/90 via-turquoise-50/20 to-cyan-50/20">
            <div className="h-[600px] rounded-lg overflow-hidden border border-turquoise-200/50">
              <Suspense fallback={
                <div className="h-full bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-neutral-400">Loading map...</p>
                  </div>
                </div>
              }>
                <LeafletMap
                  markers={events.filter(event => event.coordinates).map(event => ({
                    id: event.id,
                    position: [event.coordinates!.lat, event.coordinates!.lng],
                    popupContent: `
                      <div class="p-2">
                        <h3 class="font-bold text-sm">${event.title}</h3>
                        <p class="text-xs text-gray-600 mt-1">${moment(event.startDate).format('MMM D, h:mm A')}</p>
                        ${event.location ? `<p class="text-xs text-gray-500">${event.location}</p>` : ''}
                        <div class="mt-2">
                          <span class="inline-block px-2 py-1 text-xs rounded-full" style="background-color: ${categoryColors[event.category || 'social']}20; color: ${categoryColors[event.category || 'social']}">
                            ${event.category || 'Event'}
                          </span>
                        </div>
                      </div>
                    `,
                    icon: 'calendar'
                  }))}
                  centerLat={-34.6037}
                  centerLng={-58.3816}
                  zoom={3}
                  height="600px"
                />
              </Suspense>
            </div>
          </Card>
        )}

        {/* Keyboard Shortcuts */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            <kbd className="px-2 py-1 bg-gray-100 rounded dark:bg-neutral-800">Cmd+N</kbd> Create Event • 
            <kbd className="px-2 py-1 bg-gray-100 rounded ml-2 dark:bg-neutral-800">Cmd+E</kbd> Export • 
            <kbd className="px-2 py-1 bg-gray-100 rounded ml-2 dark:bg-neutral-800">Cmd+/</kbd> Search
          </p>
        </div>

        {/* Tooltips */}
        <Tooltip id="view-tooltip" />
      </animated.div>
    </DashboardLayout>
  );
}