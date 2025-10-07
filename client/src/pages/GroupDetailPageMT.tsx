import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
  ArrowLeft, MapPin, Users, Globe, Lock, Calendar, MessageCircle, 
  Camera, Settings, UserPlus, Heart, Share2, MoreVertical, Flag,
  Image, Video, FileText, Link as LinkIcon, UserCheck, UserX,
  Star, Clock, Info, Home, Music, BookOpen, Trophy, Zap, Mail,
  Eye, ChevronRight, AlertCircle, Shield, Edit, MessageSquare, Plane,
  Send, List, DollarSign, Search
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import EventMap from '@/components/EventMap';
import { Filter } from 'lucide-react';
import CommunityToolbar from '@/components/CommunityToolbar';
import HostHomesList from '@/components/Housing/HostHomesList';
import HousingMap from '@/components/maps/HousingMap';
import RecommendationsList from '@/components/Recommendations/RecommendationsList';
import { GuestOnboardingEntrance } from '@/components/GuestOnboarding/GuestOnboardingEntrance';
import { CityRbacService } from '@/services/cityRbacService';
import VisitorAlerts from '@/components/VisitorAlerts';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { Helmet } from 'react-helmet';
import io, { Socket } from 'socket.io-client';
import PostFeed from '@/components/moments/PostFeed';
import PostCreator from '@/components/universal/PostCreator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import UnifiedEventCard from '@/components/events/UnifiedEventCard';
import { useEventRSVP } from '@/hooks/useEventRSVP';
import { FadeIn, ScaleIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton, PulseButton } from '@/components/interactions/MicroInteractions';
import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { MembersList, RoleChangeModal } from '@/components/members';
import Confetti from 'react-confetti';
import '../styles/ttfiles.css';
import '../styles/mt-group.css';

interface GroupMember {
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  role: string;
  joinedAt: string;
}

interface GroupEvent {
  id: number;
  title: string;
  startDate: string;
  location: string;
  attendeeCount: number;
}

interface GroupPost {
  id: number;
  content: string;
  author: {
    name: string;
    username: string;
    profileImage?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export default function GroupDetailPageMT() {
  const { slug: rawSlug } = useParams();
  // Clean slug by decoding URL encoding and removing any query parameters
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : rawSlug;
  const slug = decodedSlug?.split('?')[0] || decodedSlug;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('posts');
  
  // Aurora Tide: Confetti state for join celebration (Layer 22)
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  // Track window size for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);
  
  // Aurora Tide: GSAP Scroll Reveal for housing statistics cards
  const housingCardsRef = useScrollReveal('.housing-stat-card', {
    opacity: 0,
    y: 30,
  }, {
    stagger: 0.1,
    start: 'top 85%',
    once: true,
    respectReducedMotion: true,
  });
  
  // Socket.io connection reference (persisted across renders)
  const socketRef = React.useRef<Socket | null>(null);
  
  // Helper function to update tab and URL simultaneously
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Update URL with tab parameter for proper back button navigation
    const params = new URLSearchParams(window.location.search);
    if (newTab === 'posts') {
      params.delete('tab'); // Default tab doesn't need param
    } else {
      params.set('tab', newTab);
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  };
  
  // Read URL query parameters for tab and filter on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const filterParam = params.get('filter');
    
    if (tabParam && ['posts', 'events', 'members', 'community-hub', 'housing', 'recommendations'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    
    if (filterParam && ['all', 'residents', 'visitors', 'members', 'non-members', 'friends'].includes(filterParam)) {
      setMentionFilter(filterParam as any);
    }
  }, []);
  
  // Member data state
  const [memberData, setMemberData] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Role change modal state (ESA Layer 22: Group Management)
  const [roleChangeModal, setRoleChangeModal] = useState<{
    open: boolean;
    userId?: number;
    username?: string;
    currentRole?: 'member' | 'moderator' | 'admin' | 'owner';
    targetRole?: 'member' | 'moderator' | 'admin';
  }>({ open: false });
  
  // Event filtering state
  const [eventFilters, setEventFilters] = useState({
    search: '',
    eventType: 'all',
    dateRange: { start: '', end: '' },
    location: '',
    priceRange: { min: 0, max: 1000 },
    hasSpace: false
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Housing view state
  const [housingView, setHousingView] = useState<'list' | 'map'>('list');
  
  // Event data fetched via React Query (no local state needed)
  const [showFilters, setShowFilters] = useState(false);
  
  // Post filtering state (used for context)
  const [mentionFilter, setMentionFilter] = useState<'all' | 'residents' | 'visitors' | 'members' | 'non-members' | 'friends'>('all');
  const [createPostModal, setCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isPostCreatorExpanded, setIsPostCreatorExpanded] = useState(false);

  // Handle post edit - opens modal with post data
  const handleEditPost = (post: any) => {
    console.log('[Groups Feed] Opening edit modal for post:', post.id);
    setEditingPost(post);
    setCreatePostModal(true);
  };

  const [automatedCoverPhoto, setAutomatedCoverPhoto] = useState<string | null>(null);

  const eventRsvpMutation = useEventRSVP();

  // Fetch member details with roles when members tab is active
  React.useEffect(() => {
    if (activeTab === 'members' && slug) {
      setLoadingMembers(true);
      fetch(`/api/groups/${slug}/members`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMemberData(data.data);
          }
          setLoadingMembers(false);
        })
        .catch(() => setLoadingMembers(false));
    }
  }, [activeTab, slug]);
  
  // Note: Post fetching now handled by PostFeed context-based approach
  
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return postDate.toLocaleDateString();
  };

  // Fetch group details using flexible endpoint (handles both IDs and slugs)
  const { data: response, isLoading, error } = useQuery<any>({
    queryKey: [`/api/groups/${slug}`],
    enabled: !!slug
  });

  // Extract group data from API response - handle both patterns
  const groupData: any = response?.success === false ? null : (response?.data || response);
  const group: any = groupData?.id ? groupData : null;
  
  // Fetch group events using unified /api/events/feed endpoint (same as Upcoming Events)
  // MUST come after group is defined to avoid ReferenceError
  const { data: eventsResponse, isLoading: loadingEvents } = useQuery<any>({
    queryKey: ['/api/events/feed', { groupId: group?.id }],
    enabled: activeTab === 'events' && !!group?.id
  });
  
  const events = eventsResponse?.data || [];
  
  // Fetch housing data for housing tab (city groups only)
  const { data: housingData, isLoading: loadingHousing } = useQuery<any>({
    queryKey: ['/api/host-homes', { city: group?.city, groupSlug: group?.slug }],
    enabled: activeTab === 'housing' && group?.type === 'city' && !!group?.city
  });
  
  const homes = housingData?.data || [];
  
  // Check if user is member/admin
  const isMember = group?.members?.some((m: GroupMember) => m.user.id === user?.id) || false;
  const isAdmin = group?.members?.some((m: GroupMember) => m.user.id === user?.id && m.role === 'admin') || false;
  const memberRole = group?.members?.find((m: GroupMember) => m.user.id === user?.id)?.role || 'member';

  // Fetch automated city cover photo
  useEffect(() => {
    if (group && group.type === 'city' && group.city && slug) {
      fetch(`/api/groups/${slug}/cover-photo`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setAutomatedCoverPhoto(data.url);
          } else {
            setAutomatedCoverPhoto(null);
          }
        })
        .catch(error => {
          console.error('Error fetching automated cover photo:', error);
          setAutomatedCoverPhoto(null);
        });
    } else {
      // Clear photo when not a city group
      setAutomatedCoverPhoto(null);
    }
  }, [group, slug]);

  // Note: Cache invalidation now handled by PostFeed

  // Auto-minimize PostCreator when switching tabs
  useEffect(() => {
    setIsPostCreatorExpanded(false);
  }, [activeTab]);

  // Track last activity timestamp for inactivity timer
  const lastActivityRef = React.useRef(Date.now());

  // Auto-minimize PostCreator after 10 seconds of inactivity
  useEffect(() => {
    if (!isPostCreatorExpanded) return;

    // Reset last activity when PostCreator expands
    lastActivityRef.current = Date.now();

    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= 10000) {
        setIsPostCreatorExpanded(false);
      }
    };

    // Check every second for inactivity
    const inactivityCheckInterval = setInterval(checkInactivity, 1000);

    return () => clearInterval(inactivityCheckInterval);
  }, [isPostCreatorExpanded]);

  // Callback to reset inactivity timer when user interacts with PostCreator
  const handlePostCreatorActivity = React.useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Socket.io real-time integration (Layer 11 + Layer 22)
  useEffect(() => {
    if (!group?.id) return;

    // Initialize socket connection and store in ref
    socketRef.current = io({
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Join group room for real-time updates
    socket.emit('join:group', group.id.toString());
    console.log(`🔌 Joined group room: ${group.id}`);

    // Listen for member join events
    socket.on('group:member_joined', (data: any) => {
      console.log('👥 Member joined:', data);
      if (data.groupId === group.id) {
        // Refresh group data to update member count
        queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
        
        toast({
          title: 'New Member',
          description: `${data.username} joined the group`,
        });
      }
    });

    // Listen for member leave events
    socket.on('group:member_left', (data: any) => {
      console.log('👋 Member left:', data);
      if (data.groupId === group.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      }
    });

    // Listen for new posts in group
    socket.on('group:new_post', (data: any) => {
      console.log('📝 New post in group:', data);
      if (data.groupId === group.id && activeTab === 'posts') {
        // Note: PostFeed handles its own refreshing via context
        toast({
          title: 'New Post',
          description: `${data.username} posted in the group`,
        });
      }
    });

    // Listen for group details updates
    socket.on('group:details_updated', (data: any) => {
      console.log('✏️ Group details updated:', data);
      if (data.groupId === group.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave:group', group.id.toString());
      socket.disconnect();
      socketRef.current = null;
      console.log(`🔌 Left group room: ${group.id}`);
    };
  }, [group?.id, slug, activeTab]);

  // Guest profile check
  const { data: guestProfile } = useQuery({
    queryKey: ['/api/guest-profiles', user?.id],
    enabled: !!user?.id && activeTab === 'community-hub',
  });

  // User memberships and following
  const { data: userMemberships = [] } = useQuery({
    queryKey: ['/api/user/memberships', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/user/memberships`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    }
  });

  const { data: userFollowing = [] } = useQuery({
    queryKey: ['/api/user/following', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/user/following`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    }
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/join-group/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Welcome to the group!',
        description: `You are now a member of ${group?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      
      // Aurora Tide: Trigger confetti celebration (Layer 22)
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // 5 seconds of confetti
      
      // Emit Socket.io event for real-time updates
      if (socketRef.current && group?.id && user) {
        socketRef.current.emit('group:memberJoined', {
          groupId: group.id,
          userId: user.id,
          username: user.username || user.name,
          memberCount: (group.memberCount || 0) + 1
        });
        console.log('✅ Emitted group:memberJoined event');
      }
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/leave-group/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to leave group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Left group',
        description: `You have left ${group?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      
      // Emit Socket.io event for real-time updates
      if (socketRef.current && group?.id && user) {
        socketRef.current.emit('group:memberLeft', {
          groupId: group.id,
          userId: user.id,
          username: user.username || user.name,
          memberCount: Math.max((group.memberCount || 1) - 1, 0)
        });
        console.log('✅ Emitted group:memberLeft event');
      }
    },
  });

  // Follow city mutation
  const followCityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/follow-city/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to follow city');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `You are now following ${group?.city || group?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/following', user?.id] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to follow city',
        variant: 'destructive',
      });
    },
  });

  // Role change mutation (ESA Layer 22: Group Management)
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: number; newRole: 'member' | 'moderator' | 'admin' }) => {
      const response = await apiRequest(`/api/groups/${group?.id}/members/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('members.roleChange.success', 'Role Updated'),
        description: t('members.roleChange.successDescription', 'Member role has been successfully updated'),
      });
      // Refresh member data
      if (activeTab === 'members' && slug) {
        fetch(`/api/groups/${slug}/members`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setMemberData(data.data);
            }
          });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('members.roleChange.error', 'Failed to update member role'),
        variant: 'destructive',
      });
    },
  });

  // Remove member mutation (ESA Layer 22: Group Management)
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(`/api/groups/${group?.id}/members/${userId}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('members.remove.success', 'Member Removed'),
        description: t('members.remove.successDescription', 'Member has been removed from the group'),
      });
      // Refresh member data
      if (activeTab === 'members' && slug) {
        fetch(`/api/groups/${slug}/members`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setMemberData(data.data);
            }
          });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('members.remove.error', 'Failed to remove member'),
        variant: 'destructive',
      });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-turquoise-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading group details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Group not found</h2>
            <p className="text-gray-600 mb-6">This group may have been removed or you don't have access.</p>
            <Button 
              onClick={() => setLocation('/groups')}
              className="mt-action-button mt-action-button-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderAboutTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <Info className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">About this group</h3>
          </div>
          <div className="mt-info-card-content">
            <p>{group.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Group Rules */}
        {group.rules && (
          <div className="mt-info-card">
            <div className="mt-info-card-header">
              <Shield className="mt-info-card-icon" />
              <h3 className="mt-info-card-title">Group Rules</h3>
            </div>
            <div className="mt-info-card-content">
              <p className="whitespace-pre-wrap">{group.rules}</p>
            </div>
          </div>
        )}

        {/* Group Activities */}
        {group.activities && group.activities.length > 0 && (
          <div className="mt-info-card">
            <div className="mt-info-card-header">
              <Zap className="mt-info-card-icon" />
              <h3 className="mt-info-card-title">What we do</h3>
            </div>
            <div className="mt-info-card-content space-y-3">
              {group.activities.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  {activity.icon === 'music' && <Music className="h-5 w-5 text-turquoise-500 mt-0.5" />}
                  {activity.icon === 'book' && <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />}
                  {activity.icon === 'trophy' && <Trophy className="h-5 w-5 text-cyan-500 mt-0.5" />}
                  {!activity.icon && <Zap className="h-5 w-5 text-cyan-500 mt-0.5" />}
                  <div>
                    <h4 className="font-semibold">{activity.title}</h4>
                    <p className="text-sm">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Group Tags/Interests */}
        {group.tags && group.tags.length > 0 && (
          <div className="mt-info-card">
            <div className="mt-info-card-header">
              <Heart className="mt-info-card-icon" />
              <h3 className="mt-info-card-title">Our Interests</h3>
            </div>
            <div className="mt-info-card-content">
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-turquoise-100 to-cyan-100 text-sm rounded-full text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <Star className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">Group Stats</h3>
          </div>
          <div className="mt-info-card-content space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Members</span>
              <span className="font-semibold">{group.memberCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created</span>
              <span className="font-semibold">
                {new Date(group.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold capitalize">{group.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Privacy</span>
              <span className="font-semibold capitalize">{group.privacy || 'public'}</span>
            </div>
          </div>
        </div>

        {/* Group Admins */}
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <Shield className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">Group Admins</h3>
          </div>
          <div className="mt-info-card-content space-y-3">
            {group.members?.filter((m: GroupMember) => m.role === 'admin').map((admin: GroupMember) => (
              <div key={admin.user.id} className="flex items-center gap-3">
                <div className="mt-member-avatar text-sm">
                  {admin.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{admin.user.name}</p>
                  <p className="text-xs text-gray-500">@{admin.user.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => {
    // Transform member data to match MembersList component interface
    const transformedMembers = memberData.map((member: any) => ({
      id: member.id || member.user?.id,
      userId: member.user?.id || member.userId,
      username: member.user?.username || member.username,
      fullName: member.user?.name || member.user?.fullName,
      profilePicture: member.user?.profileImage || member.user?.profilePicture,
      role: member.role || 'member',
      status: member.status || 'active',
      joinedAt: member.joinedAt ? new Date(member.joinedAt) : new Date(),
    }));

    // Handle role change from dropdown
    const handleRoleChange = (userId: number) => {
      const member = memberData.find((m: any) => m.user?.id === userId || m.userId === userId);
      if (!member) return;

      setRoleChangeModal({
        open: true,
        userId,
        username: member.user?.username || member.username,
        currentRole: member.role || 'member',
        targetRole: 'member', // Will be set in dropdown
      });
    };

    // Handle member removal
    const handleRemoveMember = (userId: number) => {
      if (confirm(t('members.remove.confirm', 'Are you sure you want to remove this member?'))) {
        removeMemberMutation.mutate(userId);
      }
    };

    return (
      <div className="space-y-6">
        {/* New Aurora Tide MembersList Component */}
        <MembersList
          members={transformedMembers}
          currentUserId={user?.id}
          currentUserRole={memberRole}
          isLoading={loadingMembers}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
        />

        {/* Role Change Modal */}
        <RoleChangeModal
          open={roleChangeModal.open}
          onOpenChange={(open) => setRoleChangeModal({ ...roleChangeModal, open })}
          memberUsername={roleChangeModal.username || ''}
          currentRole={roleChangeModal.currentRole || 'member'}
          targetRole={roleChangeModal.targetRole || 'member'}
          onConfirm={() => {
            if (roleChangeModal.userId && roleChangeModal.targetRole) {
              changeRoleMutation.mutate({
                userId: roleChangeModal.userId,
                newRole: roleChangeModal.targetRole,
              });
            }
          }}
          isLoading={changeRoleMutation.isPending}
        />
      </div>
    );
  };

  const renderEventsTab = () => {
    // Filter events based on current filters
    const filteredEvents = events.filter((event: any) => {
      if (eventFilters.search && !event.title.toLowerCase().includes(eventFilters.search.toLowerCase())) {
        return false;
      }
      if (eventFilters.eventType !== 'all' && event.eventType !== eventFilters.eventType) {
        return false;
      }
      if (eventFilters.dateRange.start && new Date(event.startDate) < new Date(eventFilters.dateRange.start)) {
        return false;
      }
      if (eventFilters.dateRange.end && new Date(event.startDate) > new Date(eventFilters.dateRange.end)) {
        return false;
      }
      if (eventFilters.location && !event.location.toLowerCase().includes(eventFilters.location.toLowerCase())) {
        return false;
      }
      if (eventFilters.hasSpace && event.attendeeCount >= event.maxAttendees) {
        return false;
      }
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Events Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Group Events</h3>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Calendar className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="h-4 w-4" />
                Map
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-pink-50' : ''}
            >
              <Filter className="h-4 w-4" />
              Filters {filteredEvents.length !== events.length && `(${filteredEvents.length})`}
            </Button>
            {isMember && (
              <Button className="mt-action-button mt-action-button-primary">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventFilters.search}
                  onChange={(e) => setEventFilters({...eventFilters, search: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              {/* Event Type */}
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  value={eventFilters.eventType}
                  onChange={(e) => setEventFilters({...eventFilters, eventType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Types</option>
                  <option value="milonga">Milonga</option>
                  <option value="practica">Práctica</option>
                  <option value="workshop">Workshop</option>
                  <option value="festival">Festival</option>
                  <option value="concert">Concert</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <input
                  type="text"
                  placeholder="Search location..."
                  value={eventFilters.location}
                  onChange={(e) => setEventFilters({...eventFilters, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                <input
                  type="date"
                  value={eventFilters.dateRange.start}
                  onChange={(e) => setEventFilters({...eventFilters, dateRange: {...eventFilters.dateRange, start: e.target.value}})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <input
                  type="date"
                  value={eventFilters.dateRange.end}
                  onChange={(e) => setEventFilters({...eventFilters, dateRange: {...eventFilters.dateRange, end: e.target.value}})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Has Space */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventFilters.hasSpace}
                    onChange={(e) => setEventFilters({...eventFilters, hasSpace: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Only show events with space</span>
                </label>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEventFilters({
                search: '',
                eventType: 'all',
                dateRange: { start: '', end: '' },
                location: '',
                priceRange: { min: 0, max: 1000 },
                hasSpace: false
              })}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* View Mode Content */}
        {viewMode === 'list' ? (
          <div className="mt-events-list">
            {loadingEvents ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
              </div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event: any) => (
                <UnifiedEventCard
                  key={event.id}
                  event={{
                    id: event.id.toString(),
                    title: event.title,
                    type: event.eventType || event.type || 'milonga',
                    date: event.startDate,
                    time: new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
                    location: event.location || 'Location TBA',
                    city: event.city,
                    attendees: event.attendeeCount || event.currentAttendees || 0,
                    userRsvpStatus: event.userRsvpStatus || event.userStatus || null,
                    isFeatured: event.isFeatured || false
                  }}
                  rsvpMutation={eventRsvpMutation}
                />
              ))
            ) : (
              <div className="mt-empty-state">
                <Calendar className="mt-empty-icon" />
                <h3 className="mt-empty-title">No events found</h3>
                <p className="mt-empty-description">
                  {events.length > 0 ? 'Try adjusting your filters' : 'Be the first to organize an event for this group!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[600px] relative">
            <EventMap 
              events={filteredEvents}
              cityLat={group?.latitude}
              cityLng={group?.longitude}
              onEventClick={(event) => setLocation(`/events/${event.id}`)}
            />
          </div>
        )}
      </div>
    );
  };

  const renderPostsTab = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Posts Feed - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
        {/* Post Creator - Collapsed/Expanded State */}
        {!isPostCreatorExpanded ? (
          /* Collapsed: Floating send button */
          <button
            onClick={() => setIsPostCreatorExpanded(true)}
            className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-turquoise-400 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 mx-auto block animate-pulse"
            data-testid="button-expand-post-creator"
          >
            <Send className="h-6 w-6 text-white mx-auto transition-transform group-hover:rotate-45 group-active:rotate-[360deg] duration-500" />
          </button>
        ) : (
          /* Expanded: Full PostCreator with animation */
          <div className="animate-in slide-in-from-bottom-8 duration-500 fade-in">
            <PostCreator
              context={{
                type: 'group',
                id: group?.id?.toString(),
                name: group?.type === 'city' ? group.city : group.name
              }}
              user={user ? {
                id: user.id,
                name: user.name || '',
                username: user.username || '',
                profileImage: user.profileImage
              } : undefined}
              onPostCreated={() => {
                // Note: PostFeed handles its own cache invalidation
                queryClient.invalidateQueries({ queryKey: ['/api/groups', slug, 'posts'] });
                setIsPostCreatorExpanded(false); // Collapse after posting
              }}
              onActivity={handlePostCreatorActivity}
            />
            <button
              onClick={() => setIsPostCreatorExpanded(false)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              data-testid="button-collapse-post-creator"
            >
              ✕ Collapse
            </button>
          </div>
        )}

        {/* Filter Buttons - Icon Design with Instant Tooltips */}
        <TooltipProvider>
          <div className="flex items-center gap-2 pb-4 border-b border-turquoise-200">
            {group?.type === 'city' ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { 
                        setMentionFilter('all'); 
                      }}
                      className={`px-4 py-2 rounded-full transition-all hover:scale-110 ${
                        mentionFilter === 'all'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg text-white'
                          : 'bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                      data-testid="filter-all-posts"
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>All Posts</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { 
                        setMentionFilter('residents'); 
                      }}
                      className={`px-4 py-2 rounded-full transition-all hover:scale-110 ${
                        mentionFilter === 'residents'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg text-white'
                          : 'bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                      data-testid="filter-residents"
                    >
                      <Home className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Residents</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { 
                        setMentionFilter('visitors'); 
                      }}
                      className={`px-4 py-2 rounded-full transition-all hover:scale-110 ${
                        mentionFilter === 'visitors'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg text-white'
                          : 'bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                      data-testid="filter-visitors"
                    >
                      <Plane className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Visitors</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { 
                        setMentionFilter('friends'); 
                      }}
                      className={`px-4 py-2 rounded-full transition-all hover:scale-110 ${
                        mentionFilter === 'friends'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg text-white'
                          : 'bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                      data-testid="filter-friends"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Friends in City</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { 
                        setMentionFilter('all'); 
                      }}
                      className={`px-4 py-2 rounded-full transition-all hover:scale-110 ${
                        mentionFilter === 'all'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg text-white'
                          : 'bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                      data-testid="filter-all-posts"
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>All Posts</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { 
                        setMentionFilter('members'); 
                      }}
                      className={`px-4 py-2 rounded-full transition-all hover:scale-110 ${
                        mentionFilter === 'members'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg text-white'
                          : 'bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                      data-testid="filter-members"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Members</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { 
                        setMentionFilter('non-members'); 
                      }}
                      className={`px-4 py-2 rounded-full transition-all hover:scale-110 ${
                        mentionFilter === 'non-members'
                          ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg text-white'
                          : 'bg-gray-100 opacity-60 hover:opacity-100'
                      }`}
                      data-testid="filter-non-members"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Non-members</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
  
        {/* Posts Feed - Context-based smart mode */}
        {group?.id ? (
          <PostFeed 
            context={{
              type: 'group',
              groupId: group.id,
              filter: mentionFilter
            }}
            currentUserId={user?.id?.toString()}
            onEdit={handleEditPost}
          />
        ) : (
          <div className="flex justify-center py-8">
            <div className="text-sm text-gray-500">Loading group data...</div>
          </div>
        )}
          </div>
          
          {/* Sidebar - 1/3 width on large screens (placeholder for future use) */}
          <div className="lg:col-span-1">
            {/* Future: Add sidebar content here (events, members, etc.) */}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHousingTab = () => {
    // Calculate housing statistics
    const totalHomes = homes.length;
    const availableHomes = homes.filter((h: any) => h.isActive).length;
    const priceRange = homes.length > 0 ? {
      min: Math.min(...homes.map((h: any) => h.pricePerNight || 0)),
      max: Math.max(...homes.map((h: any) => h.pricePerNight || 0))
    } : { min: 0, max: 0 };
    const avgPrice = homes.length > 0 
      ? Math.round(homes.reduce((sum: number, h: any) => sum + (h.pricePerNight || 0), 0) / homes.length)
      : 0;

    // Get user context for CTAs
    const userContext = CityRbacService.getUserCityContext(
      user,
      group?.city || '',
      [] as any[],
      [] as any[],
      group?.id
    );

    return (
      <div className="space-y-6" ref={housingCardsRef}>
        {/* Quick Actions Bar - Aurora Tide */}
        <FadeIn>
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('housing.city_housing_tab.title', { defaultValue: 'Housing in {{city}}', city: group?.city })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {userContext.isLocal && (
                <PulseButton
                  onClick={() => setLocation('/host-onboarding')}
                  className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold"
                  pulseColor="rgba(6, 182, 212, 0.6)"
                  data-testid="button-become-host"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {t('housing.city_housing_tab.become_host', 'Become a Host')}
                </PulseButton>
              )}
              <MagneticButton
                onClick={() => setLocation('/guest-onboarding')}
                strength={0.15}
                className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 px-4 py-2 text-slate-700 dark:text-slate-300"
                data-testid="button-search-preferences"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('housing.city_housing_tab.search_preferences', 'Search Preferences')}
              </MagneticButton>
              <MagneticButton
                onClick={() => setLocation('/housing-marketplace')}
                strength={0.15}
                className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 px-4 py-2 text-slate-700 dark:text-slate-300"
                data-testid="button-view-marketplace"
              >
                <Search className="h-4 w-4 mr-2" />
                {t('housing.city_housing_tab.all_homes', 'All homes')}
              </MagneticButton>
            </div>
          </div>
        </FadeIn>

        {/* Super Admin Quick Action */}
        {user?.roles?.includes('super_admin') && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-900 dark:text-purple-300">
                {t('housing.city_housing_tab.super_admin_actions', 'Super Admin Actions')}
              </span>
            </div>
            <Button
              onClick={() => setLocation('/host-onboarding')}
              className="mt-action-button mt-action-button-primary"
              data-testid="button-admin-host-onboarding"
            >
              <Home className="h-4 w-4 mr-2" />
              {t('housing.city_housing_tab.start_host_onboarding', 'Start Host Onboarding')}
            </Button>
          </div>
        )}

        {/* Housing Statistics Card - Aurora Tide */}
        {totalHomes > 0 && (
          <ScaleIn delay={0.1}>
            <GlassCard 
              depth={2}
              className="p-6 border-cyan-200/30 dark:border-cyan-500/30"
              data-testid="housing-statistics-card"
            >
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center housing-stat-card" data-testid="stat-total-homes">
                  <Home className="h-8 w-8 mx-auto mb-2 text-cyan-600 dark:text-cyan-400" />
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalHomes}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.city_housing_tab.total_homes', 'Total Homes')}
                  </div>
                </div>
                <div className="text-center housing-stat-card" data-testid="stat-avg-price">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">${avgPrice}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.city_housing_tab.avg_night', 'Avg/Night')}
                  </div>
                </div>
                <div className="text-center housing-stat-card" data-testid="stat-price-range">
                  <Star className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    ${priceRange.min}-${priceRange.max}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.city_housing_tab.price_range', 'Price Range')}
                  </div>
                </div>
                <div className="text-center housing-stat-card" data-testid="stat-available">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{availableHomes}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t('housing.city_housing_tab.available', 'Available')}
                  </div>
                </div>
              </StaggerContainer>
            </GlassCard>
          </ScaleIn>
        )}

        {/* Map/List View Toggle */}
        <Tabs value={housingView} onValueChange={(v: any) => setHousingView(v)} data-testid="housing-view-tabs">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger 
              value="list" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
              data-testid="housing-view-list"
            >
              <List className="h-4 w-4 mr-2" />
              {t('housing.city_housing_tab.list_view', 'List View')}
            </TabsTrigger>
            <TabsTrigger 
              value="map"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
              data-testid="housing-view-map"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {t('housing.city_housing_tab.map_view', 'Map View')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6" data-testid="housing-list-content">
            {loadingHousing ? (
              <div className="flex justify-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  {t('housing.city_housing_tab.loading_listings', 'Loading housing listings...')}
                </div>
              </div>
            ) : totalHomes === 0 ? (
              // Enhanced Empty State - Aurora Tide
              <ScaleIn delay={0.2}>
                <GlassCard
                  depth={2}
                  className="text-center py-16 px-6 border-2 border-dashed border-cyan-300 dark:border-cyan-600"
                  data-testid="housing-empty-state"
                >
                  <ScaleIn delay={0.3}>
                    <Home className="h-16 w-16 mx-auto mb-4 text-cyan-500 dark:text-cyan-400" />
                  </ScaleIn>
                  <FadeIn delay={0.4}>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {t('housing.city_housing_tab.no_listings', 'No housing listings yet')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      {userContext.isLocal 
                        ? t('housing.city_housing_tab.empty_local_message', 'Be the first to offer tango-friendly accommodation in your city! Share your space with dancers from around the world.')
                        : t('housing.city_housing_tab.empty_visitor_message', { defaultValue: 'No housing listings are currently available in {{city}}. Check back soon or explore other cities.', city: group?.city })
                      }
                    </p>
                  </FadeIn>
                  <ScaleIn delay={0.5}>
                    {userContext.isLocal && (
                      <PulseButton
                        onClick={() => setLocation('/host-onboarding')}
                        className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-semibold px-6 py-3"
                        pulseColor="rgba(6, 182, 212, 0.6)"
                        data-testid="button-empty-state-host"
                      >
                        <Home className="h-5 w-5 mr-2" />
                        {t('housing.city_housing_tab.list_property', 'List Your Property')}
                      </PulseButton>
                    )}
                    {!userContext.isLocal && (
                      <MagneticButton
                        onClick={() => setLocation('/housing-marketplace')}
                        strength={0.2}
                        className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 px-6 py-3 text-slate-700 dark:text-slate-300"
                        data-testid="button-empty-state-marketplace"
                      >
                        <Search className="h-5 w-5 mr-2" />
                        {t('housing.city_housing_tab.explore_cities', 'Explore All Cities')}
                      </MagneticButton>
                    )}
                  </ScaleIn>
                </GlassCard>
              </ScaleIn>
            ) : (
              <HostHomesList 
                groupSlug={group?.slug}
                city={group?.city}
                showFilters={false}
              />
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-6" data-testid="housing-map-content">
            {loadingHousing ? (
              <div className="flex justify-center py-12">
                <div className="text-slate-500 dark:text-slate-400">
                  {t('housing.city_housing_tab.loading_map', 'Loading map...')}
                </div>
              </div>
            ) : totalHomes === 0 ? (
              // Empty state for map view - Aurora Tide
              <ScaleIn delay={0.2}>
                <GlassCard
                  depth={2}
                  className="text-center py-16 px-6 border-2 border-dashed border-cyan-300 dark:border-cyan-600"
                >
                  <ScaleIn delay={0.3}>
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-cyan-500 dark:text-cyan-400" />
                  </ScaleIn>
                  <FadeIn delay={0.4}>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {t('housing.city_housing_tab.no_locations', 'No locations to display')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('housing.city_housing_tab.map_empty_message', 'Listings will appear on the map once hosts add their properties.')}
                    </p>
                  </FadeIn>
                </GlassCard>
              </ScaleIn>
            ) : (
              <ScaleIn delay={0.2}>
                <GlassCard depth={2} className="h-[600px] overflow-hidden border-cyan-200/30 dark:border-cyan-500/30">
                  <HousingMap 
                    homes={homes}
                    cityLat={group?.latitude}
                    cityLng={group?.longitude}
                    onHomeClick={(home) => {
                      // TODO: Navigate to housing detail page when available
                      console.log('Housing clicked:', home.id);
                    }}
                  />
                </GlassCard>
              </ScaleIn>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderRecommendationsTab = () => {
    return (
      <div className="space-y-6">
        <RecommendationsList 
          groupSlug={group.slug}
          city={group.city}
          showFilters={true}
        />
      </div>
    );
  };

  const renderCommunityHub = () => {
    // Get coordinates for the city
    const cityCenter = group.city ? getCoordinatesForCity(group.city) : [-34.6037, -58.3816];
    
    // Get user's city context using RBAC
    const userContext = CityRbacService.getUserCityContext(
      user,
      group.city || '',
      userMemberships,
      userFollowing,
      group.id
    );

    const statusText = CityRbacService.getStatusDisplayText(userContext, group.city || group.name);

    return (
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 border ${
          userContext.isLocal 
            ? 'bg-gradient-to-r from-green-50 to-turquoise-50 border-green-200' 
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{statusText.title}</h3>
              <p className="text-gray-700">{statusText.description}</p>
            </div>
            {statusText.action && (
              <Button
                onClick={() => {
                  if (statusText.action === 'Join Community') {
                    joinGroupMutation.mutate();
                  } else if (statusText.action === 'Follow City') {
                    followCityMutation.mutate();
                  } else if (statusText.action === 'Complete Guest Profile') {
                    setLocation('/guest-onboarding');
                  } else if (statusText.action === 'Consider becoming a host') {
                    setLocation('/host-onboarding');
                  }
                }}
                className="mt-action-button mt-action-button-primary"
              >
                {statusText.action}
              </Button>
            )}
          </div>
        </div>

        {/* Show guest onboarding for visitors without profile */}
        {userContext.isVisitor && !userContext.hasGuestProfile && (
          <GuestOnboardingEntrance />
        )}

        {/* Show host onboarding option for locals without host profile */}
        {userContext.isLocal && !userContext.hasHostProfile && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Home className="h-8 w-8 text-purple-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Become a Host</h3>
                <p className="text-gray-700 mb-4">
                  Share your home with visiting dancers and earn extra income while building connections.
                </p>
                <Button
                  onClick={() => setLocation('/host-onboarding')}
                  className="mt-action-button mt-action-button-secondary"
                >
                  Start Host Onboarding
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Show community features for qualified users */}
        {(userContext.isLocal || userContext.hasGuestProfile) && (
          <>
            <CommunityToolbar 
              city={group.city} 
              groupSlug={group.slug}
              userContext={userContext}
            />
            
            {/* Context-specific messaging */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-gray-600" />
                <p className="text-gray-700">
                  {userContext.isLocal ? (
                    <>
                      As a local, you can see visitors coming to town and offer to guide them. 
                      Check the map for upcoming visitors!
                    </>
                  ) : (
                    <>
                      Browse available host homes, local recommendations, and events in {group.city}. 
                      Your guest profile allows you to request stays!
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Visitor alerts for locals */}
            {userContext.privileges.canSeeVisitors && (
              <VisitorAlerts cityId={group.id} />
            )}
          </>
        )}
      </div>
    );
  };

  // Get coordinates for the city if available
  const getCoordinatesForCity = (city: string) => {
    const cityCoordinates: { [key: string]: [number, number] } = {
      'Buenos Aires': [-34.6037, -58.3816],
      'Buenos Aires, Argentina': [-34.6037, -58.3816],
      'Paris': [48.8566, 2.3522],
      'New York': [40.7128, -74.0060],
      'London': [51.5074, -0.1278],
      'Berlin': [52.5200, 13.4050],
      'Barcelona': [41.3851, 2.1734],
      'Rome': [41.9028, 12.4964],
      'Tokyo': [35.6762, 139.6503],
      'Sydney': [-33.8688, 151.2093],
      'Mexico City': [19.4326, -99.1332],
      'Kolašin': [42.8358, 19.4949],
      'Kolašin, Montenegro': [42.8358, 19.4949],
    };
    
    // Try exact match first
    if (cityCoordinates[city]) {
      return cityCoordinates[city];
    }
    
    // Try city name without country
    const cityNameOnly = city.split(',')[0].trim();
    if (cityCoordinates[cityNameOnly]) {
      return cityCoordinates[cityNameOnly];
    }
    
    return [-34.6037, -58.3816]; // Default to Buenos Aires
  };

  // ESA LIFE CEO 56x21 - Removed duplicate renderMapTab function
  // The CommunityToolbar in renderCommunityHub already provides map functionality

  // SEO meta tags (Layer 55: SEO Optimization)
  const groupType = group.type === 'city' ? 'City Community' : 'Professional Group';
  const pageTitle = `${group.name} ${groupType} | Mundo Tango`;
  const pageDescription = group.description || `Join ${group.name} - ${groupType} on Mundo Tango. Connect with ${group.memberCount || 0} tango enthusiasts${group.city ? ` in ${group.city}` : ''}.`;
  const pageImage = group.coverImage || group.image_url || group.imageUrl || 'https://mundotango.com/default-group-cover.jpg';
  const pageUrl = `https://mundotango.com/community/groups/${slug}`;

  return (
    <>
      {/* Aurora Tide: Confetti celebration on join (Layer 22) */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#06B6D4', '#0D448A', '#8E142E', '#14B8A6', '#F472B6']}
        />
      )}
      
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:site_name" content="Mundo Tango" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={pageImage} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Mundo Tango" />
        {group.city && <meta name="geo.placename" content={group.city} />}
        {group.country && <meta name="geo.region" content={group.country} />}
      </Helmet>
      
      <DashboardLayout>
        {/* MT Group Header - Full width */}
        <div className="mt-group-header">
          {(() => {
            // Priority: group image > automated city photo > fallback
            const imageUrl = group.image_url || group.coverImage || group.imageUrl;
            const displayImage = imageUrl || automatedCoverPhoto || null;
            
            return displayImage ? (
              <img 
                src={displayImage} 
                alt={`${group.city || group.name} cityscape`}
                className="mt-group-cover"
              />
            ) : null;
          })()}
          
          {/* Constrain only header content, not cover image */}
          <div className="max-w-7xl mx-auto">
            <div className="mt-group-header-content">
            <div className="flex items-end justify-between">
              <div>
                {/* Group Avatar - Hide for city groups */}
                {group.type !== 'city' && (
                  <div className="mt-group-avatar mb-4">
                    {group.imageUrl ? (
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                        {group.emoji || group.name.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Group Info */}
                <h1 className="mt-group-title">
                  {group.type === 'city' ? group.city : group.name}
                </h1>
                <p className="mt-group-subtitle">
                  {group.type === 'city' 
                    ? `Welcome to ${group.city}` 
                    : (group.tagline || `Welcome to ${group.name}`)
                  }
                </p>
                
                {/* Group Stats */}
                <div className="mt-group-stats">
                  {/* For city groups: show icon-based stats with tooltips */}
                  {group.type === 'city' ? (
                    <>
                      <div className="mt-group-stat" title="members">
                        <Users className="h-5 w-5" />
                        <span className="ml-1">{group.memberCount || 0}</span>
                      </div>
                      <div className="mt-group-stat" title="events">
                        <Calendar className="h-5 w-5" />
                        <span className="ml-1">{group.eventCount || 0}</span>
                      </div>
                      <div className="mt-group-stat" title="hosts">
                        <Home className="h-5 w-5" />
                        <span className="ml-1">{group.hostCount || 0}</span>
                      </div>
                      <div className="mt-group-stat" title="recommendations">
                        <Star className="h-5 w-5" />
                        <span className="ml-1">{group.recommendationCount || 0}</span>
                      </div>
                    </>
                  ) : (
                    /* For professional groups: show traditional stats */
                    <>
                      <div className="mt-group-stat">
                        {group.visibility === 'public' || !group.isPrivate ? (
                          <Globe className="mt-group-stat-icon" />
                        ) : (
                          <Lock className="mt-group-stat-icon" />
                        )}
                        <span>{group.visibility === 'public' || !group.isPrivate ? 'Public' : 'Private'} Group</span>
                      </div>
                      <div className="mt-group-stat">
                        <Users className="mt-group-stat-icon" />
                        <span>{group.memberCount || 0} members</span>
                      </div>
                      {group.city && (
                        <div className="mt-group-stat">
                          <MapPin className="mt-group-stat-icon" />
                          <span>{group.city}{group.country ? `, ${group.country}` : ''}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {group.type === 'city' ? (
                  /* City group button logic: residents auto-join, visitors can follow */
                  <>
                    {isMember ? (
                      <>
                        {isAdmin && (
                          <Button
                            onClick={() => setLocation(`/groups/${slug}/edit`)}
                            className="mt-action-button mt-action-button-secondary"
                          >
                            <Settings className="h-4 w-4" />
                            Manage
                          </Button>
                        )}
                        <Button
                          onClick={() => leaveGroupMutation.mutate()}
                          disabled={leaveGroupMutation.isPending}
                          className="mt-action-button mt-action-button-danger"
                        >
                          <UserX className="h-4 w-4" />
                          Leave Community
                        </Button>
                      </>
                    ) : (
                      /* Non-members can follow the city */
                      <Button
                        onClick={() => followCityMutation.mutate()}
                        disabled={followCityMutation.isPending}
                        className="mt-action-button mt-action-button-primary"
                      >
                        <Heart className="h-4 w-4" />
                        Follow City
                      </Button>
                    )}
                  </>
                ) : (
                  /* Professional group button logic: standard join/leave */
                  <>
                    {isMember ? (
                      <>
                        {isAdmin && (
                          <Button
                            onClick={() => setLocation(`/groups/${slug}/edit`)}
                            className="mt-action-button mt-action-button-secondary"
                          >
                            <Settings className="h-4 w-4" />
                            Manage
                          </Button>
                        )}
                        <Button
                          onClick={() => leaveGroupMutation.mutate()}
                          disabled={leaveGroupMutation.isPending}
                          className="mt-action-button mt-action-button-danger"
                        >
                          <UserX className="h-4 w-4" />
                          Leave Group
                        </Button>
                      </>
                    ) : (
                      <MagneticButton
                        strength={0.3}
                        onClick={() => joinGroupMutation.mutate()}
                        disabled={joinGroupMutation.isPending}
                        className="mt-action-button mt-action-button-primary"
                        data-testid="button-join-group"
                      >
                        <UserPlus className="h-4 w-4" />
                        {t('groups.joinGroup', 'Join Group')}
                      </MagneticButton>
                    )}
                  </>
                )}
                
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div> {/* Close flex items-end justify-between */}
            </div> {/* Close mt-group-header-content */}
          </div> {/* Close max-w-7xl mx-auto */}
        </div> {/* Close mt-group-header */}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Tabs - Icon Design with Instant Tooltips */}
          <div className="border-b border-gray-200 mb-6">
            <TooltipProvider>
              <nav className="flex gap-6" aria-label="Tabs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleTabChange('posts')}
                      className={`
                        flex items-center justify-center py-4 px-2 border-b-2 font-medium transition-all hover:scale-110
                        ${activeTab === 'posts' 
                          ? 'border-pink-500 text-pink-600' 
                          : 'border-transparent opacity-50 hover:opacity-100'
                        }
                      `}
                      data-testid="tab-posts"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Posts</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleTabChange('events')}
                      className={`
                        flex items-center justify-center py-4 px-2 border-b-2 font-medium transition-all hover:scale-110
                        ${activeTab === 'events' 
                          ? 'border-pink-500 text-pink-600' 
                          : 'border-transparent opacity-50 hover:opacity-100'
                        }
                      `}
                      data-testid="tab-events"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Events</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleTabChange('members')}
                      className={`
                        flex items-center justify-center py-4 px-2 border-b-2 font-medium transition-all hover:scale-110
                        ${activeTab === 'members' 
                          ? 'border-pink-500 text-pink-600' 
                          : 'border-transparent opacity-50 hover:opacity-100'
                        }
                      `}
                      data-testid="tab-members"
                    >
                      <Users className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Members</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleTabChange('community-hub')}
                      className={`
                        flex items-center justify-center py-4 px-2 border-b-2 font-medium transition-all hover:scale-110
                        ${activeTab === 'community-hub' 
                          ? 'border-pink-500 text-pink-600' 
                          : 'border-transparent opacity-50 hover:opacity-100'
                        }
                      `}
                      data-testid="tab-community-hub"
                    >
                      <Globe className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Community Hub</TooltipContent>
                </Tooltip>

                {group.type === 'city' && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleTabChange('housing')}
                          className={`
                            flex items-center justify-center py-4 px-2 border-b-2 font-medium transition-all hover:scale-110
                            ${activeTab === 'housing' 
                              ? 'border-pink-500 text-pink-600' 
                              : 'border-transparent opacity-50 hover:opacity-100'
                            }
                          `}
                          data-testid="tab-housing"
                        >
                          <Home className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Housing</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleTabChange('recommendations')}
                          className={`
                            flex items-center justify-center py-4 px-2 border-b-2 font-medium transition-all hover:scale-110
                            ${activeTab === 'recommendations' 
                              ? 'border-pink-500 text-pink-600' 
                              : 'border-transparent opacity-50 hover:opacity-100'
                            }
                          `}
                          data-testid="tab-recommendations"
                        >
                          <Star className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Recommendations</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </nav>
            </TooltipProvider>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'events' && renderEventsTab()}
            {activeTab === 'posts' && renderPostsTab()}
            {activeTab === 'community-hub' && renderCommunityHub()}
            {activeTab === 'housing' && group.type === 'city' && renderHousingTab()}
            {activeTab === 'recommendations' && group.type === 'city' && renderRecommendationsTab()}
          </div>
        </div> {/* Close max-w-7xl mx-auto px-4 py-6 */}
      
      {/* Post Edit Modal - Unified with Memories Feed */}
      {createPostModal && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8">
            <button
              onClick={() => {
                setCreatePostModal(false);
                setEditingPost(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              data-testid="button-close-edit-modal"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              ✏️ Edit Your Post
            </h2>
            
            {/* PostCreator with edit mode - matches Memories feed */}
            <PostCreator
              editMode={true}
              existingPost={{
                id: editingPost.id,
                content: editingPost.content,
                location: editingPost.location,
                visibility: editingPost.visibility,
                media: editingPost.mediaEmbeds?.map((url: string) => ({ url, type: 'image' })) || 
                       (editingPost.imageUrl ? [{ url: editingPost.imageUrl, type: 'image' }] : []),
                hashtags: editingPost.hashtags
              }}
              onEditComplete={() => {
                console.log('[Groups Feed] Post edited successfully');
                toast({
                  title: "Post Updated",
                  description: "Your changes have been saved"
                });
                queryClient.invalidateQueries({ queryKey: ['/api/groups', slug, 'posts'] });
                setCreatePostModal(false);
                setEditingPost(null);
              }}
              context={{ 
                type: 'group', 
                id: group?.id?.toString(),
                name: group?.type === 'city' ? group.city : group.name
              }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
    </>
  );
}