/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK
 * Memories Page Implementation - According to Framework Specifications
 * MT Ocean Theme: gradient #5EEAD4→#155E75
 * Pierre Dubois Interface with Three-Column Layout
 * Build: 1758571000000
 * CACHE_BREAK: 1758571000000
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Users, 
  Calendar, 
  Globe2, 
  Building, 
  ChevronDown,
  Globe,
  Hash,
  Music,
  Heart,
  MapPin,
  Sparkles,
  MessageCircle,
  Share2,
  Image,
  Video,
  Smile,
  Mic,
  Camera,
  Send
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import toast from 'react-hot-toast';
import { useLocation } from 'wouter';

// ESA Framework: Pierre Dubois default user
const PIERRE_DUBOIS = {
  id: 1,
  name: 'Pierre Dubois',
  username: 'pierre_dancer',
  profileImage: null
};

// ESA Framework: Community Statistics Component
const CommunityStats = () => (
  <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-cyan-200/20 p-6">
    <h3 className="text-lg font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent mb-4">
      Community
    </h3>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Global Dancers</span>
        </div>
        <span className="text-xl font-bold text-gray-900">3.2K</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Calendar className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Active Events</span>
        </div>
        <span className="text-xl font-bold text-gray-900">945</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe2 className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Communities</span>
        </div>
        <span className="text-xl font-bold text-gray-900">6.8K</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Building className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Your City</span>
        </div>
        <span className="text-xl font-bold text-gray-900">184</span>
      </div>
    </div>

    <div className="mt-6 pt-6 border-t border-gray-200">
      <Button className="w-full bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white hover:opacity-90">
        <Music className="h-4 w-4 mr-2" />
        Mundo Tango
      </Button>
    </div>
  </div>
);

// ESA Framework: Upcoming Events Component
const UpcomingEvents = () => (
  <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-cyan-200/20 p-6">
    <h3 className="text-lg font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent mb-4">
      Upcoming Events
    </h3>
    <div className="text-gray-600 text-sm space-y-3">
      <p>No upcoming events found</p>
      <p>Check your city or join our community</p>
    </div>
  </div>
);

// ESA Framework: Memory Card Component
const MemoryCard = ({ memory }: { memory: any }) => (
  <Card className="bg-white/95 backdrop-blur-lg shadow-lg border border-cyan-200/20 hover:shadow-xl transition-all">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 border-2 border-[#5EEAD4]">
          <AvatarImage src={memory.user?.profileImage || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white">
            {memory.user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{memory.user?.name || 'Unknown'}</h4>
            <span className="text-gray-500 text-sm">@{memory.user?.username || 'unknown'}</span>
          </div>
          <p className="text-gray-700 mb-3">{memory.content}</p>
          {memory.imageUrl && (
            <img 
              src={memory.imageUrl} 
              alt="Memory" 
              className="rounded-lg w-full max-h-96 object-cover mb-3"
            />
          )}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button className="flex items-center gap-2 hover:text-[#5EEAD4] transition-colors">
              <Heart className="h-4 w-4" />
              <span>{memory.likesCount || 0}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#5EEAD4] transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>{memory.commentsCount || 0}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#5EEAD4] transition-colors">
              <Share2 className="h-4 w-4" />
              <span>{memory.sharesCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * ESA Framework: Main Memories Page Component
 * Implements the Pierre Dubois interface with three-column layout
 */
const ModernMemoriesPage = () => {
  console.log('🚀 ESA ModernMemoriesPage component loaded - Pierre Dubois interface');
  console.log('🎯 Current URL:', window.location.pathname);
  console.log('🔍 Component timestamp:', Date.now());
  
  try {
    const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [location] = useLocation();

  // ESA Framework: Fetch memories using React Query
  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data.posts || [];
    }
  });

  // ESA Framework: Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
    },
    onSuccess: () => {
      toast.success('Memory shared successfully!');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
      toast.error('Failed to share memory');
    }
  });

  const handlePostMemory = () => {
    if (!content.trim()) {
      toast.error('Please write something to share');
      return;
    }

    createMemoryMutation.mutate({
      content: content.trim(),
      hashtags: tags,
      isPublic: visibility === 'public',
      location: null,
      imageUrl: null,
      videoUrl: null
    });
  };

  // ESA Framework: Tag button component
  const TagButton = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-lg border transition-all ${
        active 
          ? 'bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white border-transparent shadow-md' 
          : 'bg-white/70 hover:bg-white border-gray-200 hover:border-[#5EEAD4]'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  const tagOptions = [
    { id: 'milonga', icon: Music, label: 'Milonga' },
    { id: 'practica', icon: Users, label: 'Práctica' },
    { id: 'performance', icon: Sparkles, label: 'Performance' },
    { id: 'workshop', icon: Calendar, label: 'Workshop' },
    { id: 'festival', icon: Globe2, label: 'Festival' },
    { id: 'travel', icon: MapPin, label: 'Travel' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'fashion', icon: Heart, label: 'Fashion' }
  ];

  const toggleTag = (tagId: string) => {
    setTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  console.log('🔍 Auth user:', user);
    console.log('🔍 About to render ModernMemoriesPage');

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4] via-[#3B94B8] to-[#155E75]">
      {/* ESA Framework: FORCE TEST - THIS IS THE CORRECT PIERRE DUBOIS PAGE */}
      <div className="bg-red-500 text-white text-center py-8 font-bold text-4xl z-50 relative border-8 border-yellow-400">
        ⚠️ CORRECT MEMORIES PAGE LOADED - PIERRE DUBOIS INTERFACE ⚠️
        <div className="text-xl mt-2">If you see this, ModernMemoriesPage.tsx is working!</div>
      </div>
      {/* ESA Framework: Header Section */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-cyan-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#5EEAD4] to-[#155E75] rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent">
                Memories (CORRECT PAGE)
              </h1>
              <p className="text-gray-600 mt-1">
                Share your tango moments, connect with dancers, and create lasting memories together
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ESA Framework: Three-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-cyan-200/20 sticky top-4">
              <CardContent className="p-6">
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-[#155E75] hover:bg-[#5EEAD4]/20">
                    <Heart className="h-4 w-4 mr-2" />
                    Memories
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                    <Users className="h-4 w-4 mr-2" />
                    Tango Community
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                    <Users className="h-4 w-4 mr-2" />
                    Friends
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                    <Users className="h-4 w-4 mr-2" />
                    Groups
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                    <MapPin className="h-4 w-4 mr-2" />
                    Role Invitations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Feed */}
          <div className="lg:col-span-7 space-y-6">
            {/* ESA Framework: Pierre Dubois Post Creator */}
            <Card className="bg-white/95 backdrop-blur-lg shadow-lg border border-cyan-200/20">
              <CardContent className="p-6">
                {/* Pierre Dubois User Header */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-[#5EEAD4]">
                    <AvatarImage src={PIERRE_DUBOIS.profileImage || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{PIERRE_DUBOIS.name}</h3>
                      <span className="text-gray-500 text-sm">@{PIERRE_DUBOIS.username}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Post visibility
                      </Badge>
                      <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                        <SelectTrigger className="w-[100px] h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Content Input */}
                <Textarea
                  placeholder="✨ Share your tango moment..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-lg placeholder:text-gray-400 px-0 bg-transparent"
                  data-testid="input-memory-content"
                />

                {/* Tag Selection */}
                <div className="mt-4 mb-4">
                  <p className="text-sm text-gray-500 mb-3">Add tags to your memory</p>
                  <div className="flex gap-2 flex-wrap">
                    {tagOptions.map(tag => (
                      <TagButton
                        key={tag.id}
                        label={tag.label}
                        icon={tag.icon}
                        active={tags.includes(tag.id)}
                        onClick={() => toggleTag(tag.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20"
                      data-testid="button-add-image"
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20"
                      data-testid="button-add-video"
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20"
                      data-testid="button-add-emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20"
                      data-testid="button-add-location"
                    >
                      <MapPin className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handlePostMemory}
                    disabled={!content.trim() || createMemoryMutation.isPending}
                    className="bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white hover:opacity-90"
                    data-testid="button-share-memory"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Share Memory
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Memory Cards Feed */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 text-white">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Loading memories...
                  </div>
                </div>
              ) : memories.length > 0 ? (
                memories.map((memory: any) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No memories yet. Be the first to share!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <UpcomingEvents />
            <CommunityStats />
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('❌ ModernMemoriesPage render error:', error);
    return (
      <div className="min-h-screen bg-red-100 p-8">
        <h1 className="text-red-800 text-2xl mb-4">ModernMemoriesPage Error</h1>
        <pre className="text-red-600">{error.toString()}</pre>
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400">
          <p>This is the correct ModernMemoriesPage.tsx component that should be rendering.</p>
        </div>
      </div>
    );
  }
};

export default ModernMemoriesPage;