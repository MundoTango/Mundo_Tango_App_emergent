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
  Send,
  UserPlus,
  Mail,
  Activity
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import toast from 'react-hot-toast';
import { useLocation, Link } from 'wouter';

// ESA Framework: Use authenticated user from context
// Admin user: admin@mundotango.life (Pierre Dubois)

// ESA Framework: Upcoming Events Component
const UpcomingEvents = () => (
  <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-cyan-200/20 p-6">
    <div className="flex items-center gap-2 mb-4">
      <Calendar className="h-5 w-5 text-[#155E75]" />
      <h3 className="text-lg font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent">
        Upcoming Events
      </h3>
    </div>
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
        body: postData
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

  // ESA Framework: Tag options
  const tagOptions = [
    { id: 'milonga', label: 'Milonga' },
    { id: 'practica', label: 'Práctica' },
    { id: 'performance', label: 'Performance' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'festival', label: 'Festival' },
    { id: 'travel', label: 'Travel' },
    { id: 'music', label: 'Music' },
    { id: 'fashion', label: 'Fashion' }
  ];

  const toggleTag = (tagId: string) => {
    setTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4] via-[#3B94B8] to-[#155E75]">
      {/* ESA Framework: Three-Column Layout */}
      <div className="flex h-screen overflow-hidden">
        
        {/* LEFT SIDEBAR - Pierre Dubois Profile, Navigation, Community Stats */}
        <div className="w-72 bg-white/95 backdrop-blur-lg shadow-xl border-r border-cyan-200/30 flex flex-col h-full overflow-y-auto">
          
          {/* Pierre Dubois Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 border-2 border-[#5EEAD4]">
                <AvatarImage src={user?.profileImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white text-lg font-semibold">
                  P
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Pierre Dubois</h3>
                <p className="text-gray-500 text-sm">@pierre_dancer</p>
                {user?.email === 'admin@mundotango.life' && (
                  <Badge className="mt-1 bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2">Post visibility</p>
              <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                <SelectTrigger className="w-full h-8">
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

          {/* Navigation Menu */}
          <div className="p-4 space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Community</h4>
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-[#155E75] bg-[#5EEAD4]/20">
                <Heart className="h-4 w-4 mr-3" />
                Memories
              </Button>
            </Link>
            <Link href="/tango-communities">
              <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                <Users className="h-4 w-4 mr-3" />
                Tango Community
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                <UserPlus className="h-4 w-4 mr-3" />
                Friends
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                <Mail className="h-4 w-4 mr-3" />
                Messages
              </Button>
            </Link>
            <Link href="/groups">
              <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                <Users className="h-4 w-4 mr-3" />
                Groups
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                <Calendar className="h-4 w-4 mr-3" />
                Events
              </Button>
            </Link>
            <Link href="/role-invitations">
              <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20">
                <Activity className="h-4 w-4 mr-3" />
                Role Invitations
              </Button>
            </Link>
          </div>

          {/* Community Statistics - Moved from right sidebar */}
          <div className="p-4 flex-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Global Statistics</h4>
            <div className="grid grid-cols-2 gap-2 px-3">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-600">Global Dancers</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">3.2K</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-gray-600">Active Events</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">945</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Communities</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">6.8K</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-600">Your City</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">184</p>
              </div>
            </div>
          </div>

          {/* Mundo Tango Button at Bottom */}
          <div className="p-4 border-t border-gray-200">
            <Button className="w-full bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white hover:opacity-90">
              <Music className="h-4 w-4 mr-2" />
              Mundo Tango
            </Button>
          </div>
        </div>

        {/* CENTER FEED - Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            
            {/* Memories Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#5EEAD4] to-[#155E75] rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent">
                  Memories
                </h1>
                <p className="text-gray-600 mt-1">
                  Share your tango moments, connect with dancers, and create lasting memories together
                </p>
              </div>
            </div>

            {/* Post Creator - Without duplicate Pierre Dubois profile */}
            <Card className="bg-white/95 backdrop-blur-lg shadow-lg border border-cyan-200/20">
              <CardContent className="p-6">
                {/* Simple Pierre indicator with name only */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 border-2 border-[#5EEAD4]">
                    <AvatarImage src={user?.profileImage || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Pierre Dubois</p>
                    <p className="text-xs text-gray-500">@pierre_dancer</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <span>Post visibility</span>
                      <span>•</span>
                      <span>{visibility === 'public' ? 'Public' : visibility === 'friends' ? 'Friends' : 'Private'}</span>
                    </div>
                  </div>
                </div>

                {/* Share a recommendation text */}
                <div className="mb-4">
                  <p className="text-gray-500 text-sm">Share a recommendation</p>
                  <p className="text-xs text-gray-400 mt-1">Help others discover amazing places</p>
                </div>
                
                {/* Content Input */}
                <Textarea
                  placeholder="✨ Share your tango moment..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] resize-none border-0 focus-visible:ring-0 text-base placeholder:text-gray-400 px-0 bg-transparent"
                  data-testid="input-memory-content"
                />

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-gray-500"
                      data-testid="button-add-location"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-xs">Add location or business (restaurants, bars, cafes...)</span>
                    </Button>
                  </div>
                  <Button 
                    onClick={handlePostMemory}
                    disabled={!content.trim() || createMemoryMutation.isPending}
                    className="bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white hover:opacity-90"
                    data-testid="button-share-memory"
                  >
                    Share Memory
                  </Button>
                </div>
                
                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-3">
                  <span className="text-xs text-gray-500 mr-2">Add tags to your memory</span>
                  <div className="flex items-center gap-2 flex-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-xs px-3 py-1"
                    >
                      😄 Milonga
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-xs px-3 py-1"
                    >
                      ❤️ Práctica
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-xs px-3 py-1"
                    >
                      🎭 Performance
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-xs px-3 py-1"
                    >
                      🎤 Workshop
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-xs px-3 py-1"
                    >
                      🎸 Festival
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-xs px-3 py-1"
                    >
                      ✈️ Travel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 text-xs px-3 py-1"
                    >
                      🎵 Music
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-[#5EEAD4]/20 p-1"
                    >
                      <span className="text-xs">👍 Fashion</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tag Selection Pills */}
            <div className="flex gap-2 flex-wrap">
              {tagOptions.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    tags.includes(tag.id)
                      ? 'bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white shadow-md'
                      : 'bg-white/70 hover:bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* No memories placeholder */}
            {!isLoading && memories.length === 0 && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No memories yet. Be the first to share!</p>
                </CardContent>
              </Card>
            )}

            {/* Memory Cards Feed */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-white">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Loading memories...
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {memories.map((memory: any) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR - Only Upcoming Events */}
        <div className="w-72 bg-white/95 backdrop-blur-lg shadow-xl border-l border-cyan-200/30 p-6 overflow-y-auto">
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
};

export default ModernMemoriesPage;