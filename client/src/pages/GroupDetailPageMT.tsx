import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
  ArrowLeft, MapPin, Users, Globe, Lock, Calendar, MessageCircle, 
  Camera, Settings, UserPlus, Heart, Share2, MoreVertical, Flag,
  Image, Video, FileText, Link as LinkIcon, UserCheck, UserX,
  Star, Clock, Info, Home, Music, BookOpen, Trophy, Zap, Mail,
  Eye, ChevronRight, AlertCircle, Shield, Edit, MessageSquare, Plane,
  Send
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import EventMap from '@/components/EventMap';
import { Filter } from 'lucide-react';
import CommunityToolbar from '@/components/CommunityToolbar';
import HostHomesList from '@/components/Housing/HostHomesList';
import RecommendationsList from '@/components/Recommendations/RecommendationsList';
import { GuestOnboardingEntrance } from '@/components/GuestOnboarding/GuestOnboardingEntrance';
import { CityRbacService } from '@/services/cityRbacService';
import VisitorAlerts from '@/components/VisitorAlerts';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { Helmet } from 'react-helmet';
import io, { Socket } from 'socket.io-client';
import EnhancedPostComposer from '@/components/moments/EnhancedPostComposer';
import CleanMemoryCard from '@/components/moments/CleanMemoryCard';
import PostCreator from '@/components/universal/PostCreator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const [activeTab, setActiveTab] = useState('posts');
  
  // Socket.io connection reference (persisted across renders)
  const socketRef = React.useRef<Socket | null>(null);
  
  // Read URL query parameters for tab and filter on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const filterParam = params.get('filter');
    
    if (tabParam === 'posts') {
      setActiveTab('posts');
    }
    
    if (filterParam && ['all', 'residents', 'visitors', 'members', 'non-members', 'friends'].includes(filterParam)) {
      setMentionFilter(filterParam as any);
    }
  }, []);
  
  // Member data state
  const [memberData, setMemberData] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
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
  
  // Event data state
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Post data state
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [mentionFilter, setMentionFilter] = useState<'all' | 'residents' | 'visitors' | 'members' | 'non-members' | 'friends'>('all');
  const [createPostModal, setCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isPostCreatorExpanded, setIsPostCreatorExpanded] = useState(false);
  const [automatedCoverPhoto, setAutomatedCoverPhoto] = useState<string | null>(null);

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
  
  // Fetch group events when events tab is active
  React.useEffect(() => {
    if (activeTab === 'events' && slug) {
      setLoadingEvents(true);
      fetch(`/api/groups/${slug}/events`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setEvents(data.data || []);
          }
          setLoadingEvents(false);
        })
        .catch(() => setLoadingEvents(false));
    }
  }, [activeTab, slug]);
  
  // Reset page to 1 when mention filter changes
  React.useEffect(() => {
    if (mentionFilter !== 'all') {
      setPostsPage(1);
    }
  }, [mentionFilter]);
  
  // Fetch group posts when posts tab is active
  React.useEffect(() => {
    if (activeTab === 'posts' && slug) {
      fetchPosts();
    }
  }, [activeTab, slug, postsPage, mentionFilter]);
  
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      let response;
      
      // Use mention filtering API if filter is active (always page 1 for filtered results)
      if (mentionFilter !== 'all' && group?.id) {
        const entityType = group.type === 'city' ? 'city' : 'group';
        const filterParam = mentionFilter;
        response = await fetch(`/api/posts/mentions/${entityType}/${group.id}?filter=${filterParam}`);
        // Always replace posts for filtered queries (no pagination on filtered results yet)
        const data = await response.json();
        if (data.success) {
          setPosts(data.data || []);
          setHasMorePosts(false); // Disable pagination for filtered results
        }
      } else {
        // Use regular group posts API with pagination
        response = await fetch(`/api/groups/${slug}/posts?page=${postsPage}&limit=10`);
        const data = await response.json();
        if (data.success) {
          if (postsPage === 1) {
            setPosts(data.data || []);
          } else {
            setPosts(prev => [...prev, ...(data.data || [])]);
          }
          setHasMorePosts((data.data || []).length === 10);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };
  
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

  // Fetch group details with members
  const { data: response, isLoading, error } = useQuery({
    queryKey: [`/api/groups/${slug}`],
    enabled: !!slug,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      console.log('Fetching group with slug:', slug);
      const res = await fetch(`/api/groups/${slug}`, {
        credentials: 'include',
      });
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch group: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      return data;
    }
  });

  // Extract group data from API response - handle both patterns
  console.log('Group API response:', response);
  console.log('Slug being requested:', slug);
  console.log('Query error:', error);
  console.log('Is loading:', isLoading);
  
  // Check if the response has a success flag
  const groupData = response?.success === false ? null : (response?.data || response);
  const group = groupData?.id ? groupData : null;
  
  console.log('Extracted group:', group);
  
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

  // Auto-minimize PostCreator when switching tabs
  useEffect(() => {
    setIsPostCreatorExpanded(false);
  }, [activeTab]);

  // Auto-minimize PostCreator after 10 seconds of inactivity
  useEffect(() => {
    if (!isPostCreatorExpanded) return;

    const inactivityTimer = setTimeout(() => {
      setIsPostCreatorExpanded(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(inactivityTimer);
  }, [isPostCreatorExpanded]);

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
        // Refresh posts
        fetchPosts();
        
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
    // Filter to show only professional members (teachers, organizers, DJs, etc.)
    const professionalRoles = ['teacher', 'organizer', 'dj', 'performer', 'musician', 'photographer', 'videographer'];
    
    // Filter professional members
    const professionalMembers = memberData.filter(member => 
      member.tangoRoles?.some((role: string) => professionalRoles.includes(role))
    );
    
    return (
      <div className="space-y-6">
        {/* Member Search */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Professional Members</h3>
            <p className="text-sm text-gray-500">
              {professionalMembers.length} professionals • {memberData.length} total members
            </p>
          </div>
          {isAdmin && (
            <Button className="mt-action-button mt-action-button-primary">
              <UserPlus className="h-4 w-4" />
              Invite Members
            </Button>
          )}
        </div>

        {/* Professional Members Grid */}
        {loadingMembers ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
          </div>
        ) : professionalMembers.length > 0 ? (
          <div className="mt-members-grid">
            {professionalMembers.map((member: any) => (
              <div 
                key={member.user.id} 
                className="mt-member-card"
                onClick={() => setLocation(`/u/${member.user.username}`)}
              >
                <div className="mt-member-avatar">
                  {member.user.profileImage ? (
                    <img src={member.user.profileImage} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    member.user.name.charAt(0)
                  )}
                </div>
                <div className="mt-member-info">
                  <p className="mt-member-name">{member.user.name}</p>
                  {member.tangoRoles && member.tangoRoles.length > 0 && (
                    <RoleEmojiDisplay 
                      tangoRoles={member.tangoRoles} 
                      leaderLevel={member.user.leaderLevel}
                      followerLevel={member.user.followerLevel}
                      size="sm"
                      maxRoles={5}
                      className="mt-1"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                {member.role === 'admin' && (
                  <span className="mt-member-badge">Admin</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-empty-state">
            <Users className="mt-empty-icon" />
            <h3 className="mt-empty-title">No professional members yet</h3>
            <p className="mt-empty-description">
              Teachers, organizers, and other professionals will appear here when they join.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderEventsTab = () => {
    // Filter events based on current filters
    const filteredEvents = events.filter(event => {
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
              filteredEvents.map((event) => (
                <div key={event.id} className="mt-event-item" onClick={() => setLocation(`/events/${event.id}`)}>
                  <div className="mt-event-date">
                    <div className="mt-event-day">{new Date(event.startDate).getDate()}</div>
                    <div className="mt-event-month">{new Date(event.startDate).toLocaleDateString('en', { month: 'short' }).toUpperCase()}</div>
                  </div>
                  <div className="mt-event-details">
                    <h4 className="mt-event-title">{event.title}</h4>
                    <div className="mt-event-info">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendeeCount || 0} attending
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
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
      <div className="space-y-6">
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
                // Refresh posts after creation
                setPosts([]);
                setPostsPage(1);
                queryClient.invalidateQueries({ queryKey: ['/api/groups', slug, 'posts'] });
                setIsPostCreatorExpanded(false); // Collapse after posting
              }}
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
                        setPosts([]);
                        setMentionFilter('all'); 
                        setPostsPage(1); 
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
                        setPosts([]);
                        setMentionFilter('residents'); 
                        setPostsPage(1); 
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
                        setPosts([]);
                        setMentionFilter('visitors'); 
                        setPostsPage(1); 
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
                        setPosts([]);
                        setMentionFilter('friends'); 
                        setPostsPage(1); 
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
                        setPosts([]);
                        setMentionFilter('all'); 
                        setPostsPage(1); 
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
                        setPosts([]);
                        setMentionFilter('members'); 
                        setPostsPage(1); 
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
                        setPosts([]);
                        setMentionFilter('non-members'); 
                        setPostsPage(1); 
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
  
        {/* Posts Feed */}
        {loadingPosts && postsPage === 1 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-turquoise-500 mb-4"></div>
            <p className="text-gray-500 text-sm">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <CleanMemoryCard
                key={post.id}
                post={post}
                currentUser={user}
                onEdit={(post) => {
                  setEditingPost(post);
                  setCreatePostModal(true);
                }}
                onDelete={async (postId) => {
                  try {
                    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
                    setPosts(posts.filter(p => p.id !== postId));
                    toast({ title: "Post deleted successfully" });
                  } catch (error) {
                    toast({ title: "Failed to delete post", variant: "destructive" });
                  }
                }}
              />
            ))}
            
            {/* Load More */}
            {hasMorePosts && (
              <div className="text-center mt-6">
                <Button
                  onClick={() => setPostsPage(prev => prev + 1)}
                  disabled={loadingPosts}
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white hover:from-turquoise-600 hover:to-cyan-600 transition-all shadow-md"
                  data-testid="button-load-more-posts"
                >
                  {loadingPosts ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">
              {isMember ? 'Be the first to share something with the group!' : 'Join the group to see and create posts.'}
            </p>
          </div>
        )}
      </div>
  );

  const renderHousingTab = () => {
    return (
      <div className="space-y-6">
        {/* Host Onboarding for Super Admin */}
        {user?.roles?.includes('super_admin') && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Super Admin Actions</span>
            </div>
            <Button
              onClick={() => setLocation('/host-onboarding')}
              className="mt-action-button mt-action-button-primary"
            >
              <Home className="h-4 w-4" />
              Start Host Onboarding
            </Button>
          </div>
        )}
        
        <HostHomesList 
          groupSlug={group.slug}
          city={group.city}
          showFilters={false}
        />
      </div>
    );
  };

  const renderRecommendationsTab = () => {
    return (
      <div className="space-y-6">
        <RecommendationsList 
          groupSlug={group.slug}
          city={group.city}
          showFilters={false}
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
                      <Button
                        onClick={() => joinGroupMutation.mutate()}
                        disabled={joinGroupMutation.isPending}
                        className="mt-action-button mt-action-button-primary"
                      >
                        <UserPlus className="h-4 w-4" />
                        Join Group
                      </Button>
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
                      onClick={() => setActiveTab('posts')}
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
                      onClick={() => setActiveTab('events')}
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
                      onClick={() => setActiveTab('members')}
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
                      onClick={() => setActiveTab('community-hub')}
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
                          onClick={() => setActiveTab('housing')}
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
                          onClick={() => setActiveTab('recommendations')}
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
      
      {/* Post Composer Modal */}
      <Dialog open={createPostModal} onOpenChange={setCreatePostModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : 'Create Post'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedPostComposer
            onPostCreated={() => {
              setCreatePostModal(false);
              setEditingPost(null);
              // Refresh posts
              setPosts([]);
              setPostsPage(1);
            }}
            onClose={() => setCreatePostModal(false)}
            editMode={!!editingPost}
            existingPost={editingPost || undefined}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
    </>
  );
}