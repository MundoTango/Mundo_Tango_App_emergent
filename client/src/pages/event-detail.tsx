import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Share2, 
  Edit, 
  Trash2,
  Clock,
  DollarSign,
  Video,
  RefreshCw,
  BarChart3,
  Ticket,
  MessageSquare,
  Heart,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { safeFormatDate, safeFormatTime } from '@/utils/dateHelpers';
import { apiRequest } from '@/lib/queryClient';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from 'react-share';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import PostFeed from '@/components/moments/PostFeed';
import { useEventRSVP } from '@/hooks/useEventRSVP';
import { Helmet } from 'react-helmet';

interface EventDetail {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  location?: string;
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
  level?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  participants?: any[];
  userStatus?: 'going' | 'interested' | 'maybe' | null;
  analytics?: {
    views: number;
    shares: number;
    conversionRate: number;
  };
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [mentionFilter, setMentionFilter] = useState<'all' | 'participants' | 'guests'>('all');
  const [postFilter, setPostFilter] = useState<'all' | 'participants' | 'guests'>('all');
  const [activeTab, setActiveTab] = useState('attendees');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const filterParam = params.get('filter');
    
    if (tabParam === 'posts') {
      setActiveTab('posts');
    }
    
    if (filterParam && (filterParam === 'all' || filterParam === 'participants' || filterParam === 'guests')) {
      setPostFilter(filterParam);
    }
  }, []);

  // Fetch event details
  const { data: event, isLoading } = useQuery<EventDetail>({
    queryKey: [`/api/events/${id}`],
    enabled: !!id,
    select: (data: any) => data.data // Unwrap { success, data } response
  });

  // Fetch event discussion posts with mention filtering
  const { data: postsResponse, isLoading: postsLoading } = useQuery({
    queryKey: [`/api/posts/mentions/event/${id}`, mentionFilter],
    enabled: !!id,
    queryFn: async () => {
      const response = await fetch(`/api/posts/mentions/event/${id}?filter=${mentionFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  // Use shared RSVP hook (benefits from backend auth fix automatically)
  const rsvpMutation = useEventRSVP();

  // Purchase ticket mutation
  const purchaseTicketMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest(`/api/events/${id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: paymentData
      });
    },
    onSuccess: () => {
      toast({
        title: "Ticket purchased!",
        description: "Your ticket has been confirmed. Check your email for details.",
      });
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}`] });
    },
    onError: () => {
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePurchaseTicket = () => {
    if (event?.ticketUrl) {
      window.open(event.ticketUrl, '_blank');
    } else {
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentSubmit = () => {
    // Validate payment details
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.name) {
      toast({
        title: "Missing information",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }

    purchaseTicketMutation.mutate(paymentDetails);
  };

  const isEventOwner = user?.id === event?.userId;

  if (isLoading) {
    return (
    <>
      <Helmet>
        <title>Event Detail | Life CEO</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    
    </>
  );
  }

  if (!event) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Event not found</h2>
            <p className="text-gray-600 mb-4 dark:text-neutral-600 dark:text-neutral-400">This event may have been deleted or you don't have permission to view it.</p>
            <Button onClick={() => window.history.back()}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Event Header */}
      <Card className="mb-8 overflow-hidden">
        {event.imageUrl && (
          <div className="h-64 lg:h-96 relative overflow-hidden">
            <LazyLoadImage
              src={event.imageUrl}
              alt={event.title}
              effect="blur"
              className="absolute inset-0 w-full h-full object-cover"
              wrapperClassName="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Event Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {event.isVirtual && (
                <Badge className="bg-ocean-500/90 text-white">
                  <Video className="mr-1 h-3 w-3" />
                  Virtual Event
                </Badge>
              )}
              {event.isRecurring && (
                <Badge className="bg-turquoise-500/90 text-white">
                  <RefreshCw className="mr-1 h-3 w-3" />
                  {event.recurringPattern}
                </Badge>
              )}
              {event.eventType && (
                <Badge className="bg-white/90 text-gray-800 dark:bg-neutral-900">
                  {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                </Badge>
              )}
            </div>

            {/* Event Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 dark:bg-neutral-900"
                onClick={() => {
                  navigator.share({
                    title: event.title,
                    text: event.description,
                    url: window.location.href
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied!",
                      description: "Event link has been copied to clipboard.",
                    });
                  });
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              {isEventOwner && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 dark:bg-neutral-900"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/30"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this event?')) {
                        // Delete event
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Event Title */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {safeFormatDate(event.startDate, 'EEEE, MMMM d, yyyy', 'Date TBA')}
                </div>
                {event.location && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>About this event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-neutral-600 dark:text-neutral-300">{event.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                  <p className="font-medium">
                    {safeFormatDate(event.startDate, 'MMM d, yyyy', 'Date TBA')} • {safeFormatTime(event.startDate, '20:00')}
                  </p>
                  {event.endDate && (
                    <p className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                      to {safeFormatTime(event.endDate, 'Time TBA')}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Level</p>
                  <p className="font-medium">
                    {event.level ? 
                      event.level.replace('_', ' ').charAt(0).toUpperCase() + event.level.replace('_', ' ').slice(1) 
                      : 'All Levels'}
                  </p>
                </div>
              </div>

              {event.isVirtual && event.virtualUrl && (
                <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-sm font-medium text-cyan-900 mb-2">Virtual Event Access</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(event.virtualUrl, '_blank')}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join on {event.virtualPlatform}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Gallery */}
          {event.images && event.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Event Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGallery
                  items={event.images.map((image, index) => ({
                    original: image,
                    thumbnail: image,
                    description: `Event photo ${index + 1}`,
                    originalClass: 'rounded-lg',
                    thumbnailClass: 'rounded',
                  }))}
                  showPlayButton={false}
                  showFullscreenButton={true}
                  showNav={true}
                  showThumbnails={event.images.length > 1}
                  lazyLoad={true}
                  slideInterval={3000}
                  slideDuration={450}
                  additionalClass="glassmorphic-gallery"
                />
              </CardContent>
            </Card>
          )}

          {/* Event Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="attendees" className="flex-1" data-testid="tab-attendees">
                  <Users className="mr-2 h-4 w-4" />
                  Attendees ({event.currentAttendees || 0})
                </TabsTrigger>
                <TabsTrigger value="discussion" className="flex-1" data-testid="tab-discussion">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Discussion
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex-1" data-testid="tab-posts">
                  <FileText className="mr-2 h-4 w-4" />
                  Posts
                </TabsTrigger>
                {isEventOwner && (
                  <TabsTrigger value="analytics" className="flex-1" data-testid="tab-analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="attendees" className="p-6">
                <div className="space-y-4">
                  {event.participants && event.participants.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {event.participants.map((participant: any) => (
                        <div key={participant.id} className="flex flex-col items-center">
                          <Avatar className="h-16 w-16 mb-2">
                            <AvatarImage src={participant.user?.profileImage} />
                            <AvatarFallback>
                              {participant.user?.name?.[0] || participant.user?.username?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium text-center">
                            {participant.user?.name || participant.user?.username}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {participant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No attendees yet. Be the first to RSVP!
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="p-6">
                <div className="space-y-6">
                  {/* Mention Filter Tabs */}
                  <div className="flex items-center gap-2 border-b">
                    <button
                      onClick={() => setMentionFilter('all')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        mentionFilter === 'all' 
                          ? 'text-pink-600 border-b-2 border-pink-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      data-testid="filter-all-posts"
                    >
                      All Posts
                    </button>
                    <button
                      onClick={() => setMentionFilter('participants')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        mentionFilter === 'participants' 
                          ? 'text-pink-600 border-b-2 border-pink-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      data-testid="filter-participants"
                    >
                      Participants Only
                    </button>
                    <button
                      onClick={() => setMentionFilter('guests')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        mentionFilter === 'guests' 
                          ? 'text-pink-600 border-b-2 border-pink-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      data-testid="filter-guests"
                    >
                      Guests Only
                    </button>
                  </div>

                  {/* Posts List */}
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
                    </div>
                  ) : postsResponse?.success && postsResponse?.data?.length > 0 ? (
                    <div className="space-y-4">
                      {postsResponse.data.map((post: any) => (
                        <Card key={post.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.user?.profileImage} />
                              <AvatarFallback>
                                {post.user?.name?.[0] || post.user?.username?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold">{post.user?.name || post.user?.username}</p>
                                <span className="text-sm text-gray-500">
                                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-neutral-600 dark:text-neutral-300">{post.content}</p>
                              {post.imageUrl && (
                                <img 
                                  src={post.imageUrl} 
                                  alt="Post" 
                                  className="mt-3 rounded-lg max-w-full h-auto"
                                />
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-600 dark:text-gray-400 mb-3" />
                      <p className="text-gray-500">
                        No posts yet for this filter. Start the discussion!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="posts" className="p-6">
                <div className="space-y-6">
                  {/* Filter Buttons with ESA MT Ocean Theme */}
                  <div className="flex items-center gap-3 pb-4 border-b border-turquoise-200">
                    <Button
                      variant={postFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPostFilter('all')}
                      className={`transition-all ${
                        postFilter === 'all'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white shadow-lg'
                          : 'border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50'
                      }`}
                      data-testid="posts-filter-all"
                    >
                      All Posts
                    </Button>
                    <Button
                      variant={postFilter === 'participants' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPostFilter('participants')}
                      className={`transition-all ${
                        postFilter === 'participants'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white shadow-lg'
                          : 'border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50'
                      }`}
                      data-testid="posts-filter-participants"
                    >
                      Participants
                    </Button>
                    <Button
                      variant={postFilter === 'guests' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPostFilter('guests')}
                      className={`transition-all ${
                        postFilter === 'guests'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white shadow-lg'
                          : 'border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50'
                      }`}
                      data-testid="posts-filter-guests"
                    >
                      Guests
                    </Button>
                  </div>

                  {/* Unified PostFeed Component */}
                  <PostFeed 
                    context={{ 
                      type: 'event', 
                      eventId: parseInt(id || '0'), 
                      filter: postFilter 
                    }}
                  />
                </div>
              </TabsContent>

              {isEventOwner && (
                <TabsContent value="analytics" className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{event.analytics?.views || 0}</p>
                        <p className="text-sm text-gray-500">Page Views</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{event.analytics?.shares || 0}</p>
                        <p className="text-sm text-gray-500">Shares</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">
                          {event.analytics?.conversionRate || 0}%
                        </p>
                        <p className="text-sm text-gray-500">Conversion Rate</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <h4 className="font-medium">Attendee Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Going</span>
                        <span className="font-medium">{event.participants?.filter(p => p.status === 'going').length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Interested</span>
                        <span className="font-medium">{event.participants?.filter(p => p.status === 'interested').length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Maybe</span>
                        <span className="font-medium">{event.participants?.filter(p => p.status === 'maybe').length || 0}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket/RSVP Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {event.price ? 'Get Tickets' : 'RSVP'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.price ? (
                <>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {event.currency || 'USD'} {event.price}
                    </p>
                    <p className="text-sm text-gray-500">per ticket</p>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600"
                    onClick={handlePurchaseTicket}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    Purchase Ticket
                  </Button>
                  
                  {event.maxAttendees && (
                    <p className="text-sm text-gray-500 text-center">
                      {event.maxAttendees - (event.currentAttendees || 0)} tickets left
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant={event.userStatus === 'going' ? 'default' : 'outline'}
                    className={`w-full ${event.userStatus === 'going' ? 'bg-gradient-to-r from-[#14b8a6] to-[#06b6d4] hover:from-[#0d9488] hover:to-[#0891b2]' : ''}`}
                    onClick={() => rsvpMutation.mutate({ 
                      eventId: id!,
                      status: event.userStatus === 'going' ? null : 'going' 
                    })}
                    disabled={rsvpMutation.isPending}
                    data-testid="button-rsvp-going"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Going
                  </Button>
                  <Button
                    variant={event.userStatus === 'interested' ? 'default' : 'outline'}
                    className={`w-full ${event.userStatus === 'interested' ? 'bg-gradient-to-r from-[#14b8a6] to-[#06b6d4] hover:from-[#0d9488] hover:to-[#0891b2]' : ''}`}
                    onClick={() => rsvpMutation.mutate({ 
                      eventId: id!,
                      status: event.userStatus === 'interested' ? null : 'interested' 
                    })}
                    disabled={rsvpMutation.isPending}
                    data-testid="button-rsvp-interested"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Interested
                  </Button>
                  <Button
                    variant={event.userStatus === 'maybe' ? 'default' : 'outline'}
                    className={`w-full ${event.userStatus === 'maybe' ? 'bg-gradient-to-r from-[#14b8a6] to-[#06b6d4] hover:from-[#0d9488] hover:to-[#0891b2]' : ''}`}
                    onClick={() => rsvpMutation.mutate({ 
                      eventId: id!,
                      status: event.userStatus === 'maybe' ? null : 'maybe' 
                    })}
                    disabled={rsvpMutation.isPending}
                    data-testid="button-rsvp-maybe"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Maybe
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Share this event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                <FacebookShareButton
                  url={window.location.href}
                  title={event.title}
                  className="hover:opacity-80 transition-opacity"
                >
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                
                <TwitterShareButton
                  url={window.location.href}
                  title={event.title}
                  hashtags={['MundoTango', event.eventType || 'tango']}
                  className="hover:opacity-80 transition-opacity"
                >
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
                
                <WhatsappShareButton
                  url={window.location.href}
                  title={event.title}
                  separator=" - "
                  className="hover:opacity-80 transition-opacity"
                >
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
                
                <LinkedinShareButton
                  url={window.location.href}
                  title={event.title}
                  summary={event.description}
                  source="Mundo Tango"
                  className="hover:opacity-80 transition-opacity"
                >
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>
              </div>
              
              <div className="mt-4">
                <Input
                  value={window.location.href}
                  readOnly
                  className="text-sm"
                  onClick={(e) => {
                    e.currentTarget.select();
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied!",
                      description: "Event link has been copied to clipboard.",
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Hosted by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.user?.profileImage} />
                  <AvatarFallback>
                    {event.user?.name?.[0] || event.user?.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.user?.name}</p>
                  <p className="text-sm text-gray-500">@{event.user?.username}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setLocation(`/profile/${event.user?.username}`)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Capacity</span>
                <span className="font-medium">
                  {event.currentAttendees || 0} / {event.maxAttendees || '∞'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Type</span>
                <Badge variant="outline">
                  {event.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
              {event.isRecurring && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Frequency</span>
                  <span className="font-medium">{event.recurringPattern}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Enter your payment details to purchase tickets for {event.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cardholder Name</label>
              <Input
                placeholder="John Doe"
                value={paymentDetails.name}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Card Number</label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <Input
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">CVV</label>
                <Input
                  placeholder="123"
                  type="password"
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600"
                onClick={handlePaymentSubmit}
                disabled={purchaseTicketMutation.isPending}
              >
                {purchaseTicketMutation.isPending ? 'Processing...' : `Pay ${event.currency || 'USD'} ${event.price}`}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}