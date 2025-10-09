/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK
 * Memories Page - Expert-Informed Implementation
 * 
 * IMPROVEMENTS APPLIED:
 * ✅ Code Splitting: React.lazy + Suspense for sidebar components
 * ✅ Zod Validation: useCreateMemory hook with schema validation
 * ✅ Real-time Updates: Socket.IO with auto-reconnect
 * ✅ WCAG 2.1: ARIA labels + keyboard navigation
 * ✅ Image Optimization: ResponsiveImage with WebP/AVIF
 * ✅ Smart/Presentational: Separation of concerns
 * 
 * Build: 1758571000000
 */

import { lazy, Suspense, useState } from 'react';
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
  Sparkles,
  MessageCircle,
  Share2,
  Image,
  Video,
  Smile,
  Mic,
  Camera,
  Send,
  Heart,
  MapPin,
  Hash,
  Music
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useCreateMemory } from '@/hooks/useCreateMemory';
import { useMemoriesFeed } from '@/hooks/useMemoriesFeed';
import { ResponsiveImage } from '@/components/ui/responsive-image';

// Code Splitting: Lazy load sidebar components (Vite best practices)
const CommunityStats = lazy(() => import('@/components/memories/CommunityStats').then(m => ({ default: m.CommunityStats })));
const UpcomingEvents = lazy(() => import('@/components/memories/UpcomingEvents').then(m => ({ default: m.UpcomingEvents })));

// Pierre Dubois default user
const PIERRE_DUBOIS = {
  id: 1,
  name: 'Pierre Dubois',
  username: 'pierre_dancer',
  profileImage: null
};

// Memory Card Component with ARIA labels
const MemoryCard = ({ memory }: { memory: any }) => (
  <Card 
    className="bg-white/95 backdrop-blur-lg shadow-lg border border-cyan-200/20 hover:shadow-xl transition-all"
    role="article"
    aria-label={`Memory from ${memory.user?.name || 'Unknown'}`}
  >
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
            <ResponsiveImage
              src={memory.imageUrl}
              alt={`Memory image from ${memory.user?.name}`}
              width={800}
              height={600}
              className="rounded-lg w-full max-h-96 object-cover mb-3"
            />
          )}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button 
              className="flex items-center gap-2 hover:text-[#5EEAD4] transition-colors"
              aria-label={`Like memory, ${memory.likesCount || 0} likes`}
              data-testid={`button-like-${memory.id}`}
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              <span>{memory.likesCount || 0}</span>
            </button>
            <button 
              className="flex items-center gap-2 hover:text-[#5EEAD4] transition-colors"
              aria-label={`Comment on memory, ${memory.commentsCount || 0} comments`}
              data-testid={`button-comment-${memory.id}`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>{memory.commentsCount || 0}</span>
            </button>
            <button 
              className="flex items-center gap-2 hover:text-[#5EEAD4] transition-colors"
              aria-label={`Share memory, ${memory.sharesCount || 0} shares`}
              data-testid={`button-share-${memory.id}`}
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span>{memory.sharesCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Main Memories Page Component
 * Implements expert patterns for performance, accessibility, and real-time updates
 */
const ModernMemoriesPage = () => {
  console.log('🚀 ESA ModernMemoriesPage - Expert Implementation');
  
  try {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
    const [tags, setTags] = useState<string[]>([]);
    const [location] = useLocation();

    // Use custom hooks (Smart/Presentational pattern)
    const { mutate: createMemory, isPending } = useCreateMemory();
    const { memories, isLoading, connectionStatus } = useMemoriesFeed();

    const handlePostMemory = () => {
      createMemory({
        content: content.trim(),
        hashtags: tags,
        isPublic: visibility === 'public',
        location: null,
      });
      setContent('');
      setTags([]);
    };

    // Tag button with keyboard navigation
    const TagButton = ({ icon: Icon, label, active, onClick }: any) => (
      <button
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={`p-2.5 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] focus-visible:ring-offset-2 ${
          active 
            ? 'bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white border-transparent shadow-md' 
            : 'bg-white/70 hover:bg-white border-gray-200 hover:border-[#5EEAD4]'
        }`}
        aria-label={`${active ? 'Remove' : 'Add'} ${label} tag`}
        aria-pressed={active}
        data-testid={`tag-${label.toLowerCase()}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
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

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4] via-[#3B94B8] to-[#155E75]">
      {/* Force test banner */}
      <div className="bg-red-500 text-white text-center py-8 font-bold text-4xl z-50 relative border-8 border-yellow-400">
        ⚠️ EXPERT-OPTIMIZED MEMORIES PAGE ⚠️
        {connectionStatus === 'connected' && <div className="text-xl mt-2">🟢 Real-time connected</div>}
        {connectionStatus === 'disconnected' && <div className="text-xl mt-2">🔴 Reconnecting...</div>}
      </div>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-cyan-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#5EEAD4] to-[#155E75] rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent">
                Memories (Expert Build)
              </h1>
              <p className="text-gray-600 mt-1">
                Share your tango moments, connect with dancers, and create lasting memories
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Three-Column Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar - Navigation */}
          <nav className="lg:col-span-2" aria-label="Main navigation">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-cyan-200/20 sticky top-4">
              <CardContent className="p-6">
                <div className="space-y-1" role="list">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[#155E75] hover:bg-[#5EEAD4]/20"
                    aria-current="page"
                    data-testid="nav-memories"
                  >
                    <Heart className="h-4 w-4 mr-2" aria-hidden="true" />
                    Memories
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20" data-testid="nav-community">
                    <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                    Tango Community
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20" data-testid="nav-friends">
                    <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                    Friends
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20" data-testid="nav-messages">
                    <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                    Messages
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20" data-testid="nav-groups">
                    <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                    Groups
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20" data-testid="nav-events">
                    <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                    Events
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-[#5EEAD4]/20" data-testid="nav-invitations">
                    <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                    Role Invitations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </nav>

          {/* Center - Main Feed */}
          <section className="lg:col-span-7 space-y-6" aria-label="Memory feed">
            {/* Post Creator */}
            <Card className="bg-white/95 backdrop-blur-lg shadow-lg border border-cyan-200/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-[#5EEAD4]">
                    <AvatarImage src={PIERRE_DUBOIS.profileImage || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#5EEAD4] to-[#155E75] text-white">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{PIERRE_DUBOIS.name}</p>
                    <p className="text-sm text-gray-600">@{PIERRE_DUBOIS.username}</p>
                  </div>
                </div>

                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your tango memory..."
                  className="min-h-[120px] resize-none border-gray-300 focus:border-[#5EEAD4] focus:ring-[#5EEAD4]"
                  aria-label="Write your memory content"
                  data-testid="input-memory-content"
                />

                {/* Tag Selection */}
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4" aria-hidden="true" />
                    Add Tags
                  </label>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Memory tags">
                    {tagOptions.map(tag => (
                      <TagButton
                        key={tag.id}
                        icon={tag.icon}
                        label={tag.label}
                        active={tags.includes(tag.id)}
                        onClick={() => toggleTag(tag.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-2 text-gray-600 hover:text-[#5EEAD4] hover:bg-[#5EEAD4]/10 rounded-lg transition-colors"
                      aria-label="Add image"
                      data-testid="button-add-image"
                    >
                      <Image className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-600 hover:text-[#5EEAD4] hover:bg-[#5EEAD4]/10 rounded-lg transition-colors"
                      aria-label="Add video"
                      data-testid="button-add-video"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-600 hover:text-[#5EEAD4] hover:bg-[#5EEAD4]/10 rounded-lg transition-colors"
                      aria-label="Add location"
                      data-testid="button-add-location"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>
                  <Button
                    onClick={handlePostMemory}
                    disabled={!content.trim() || isPending}
                    className="bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white hover:opacity-90 disabled:opacity-50"
                    aria-label={isPending ? 'Posting memory...' : 'Post memory'}
                    data-testid="button-post-memory"
                  >
                    <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                    {isPending ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Memory Feed */}
            <div className="space-y-6" role="feed" aria-label="Recent memories" aria-live="polite">
              {isLoading ? (
                <div className="text-center py-8" role="status">
                  <div className="inline-flex items-center gap-2 text-white">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" aria-hidden="true"></div>
                    <span>Loading memories...</span>
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
          </section>

          {/* Right Sidebar - Code Split Components */}
          <aside className="lg:col-span-3 space-y-6" aria-label="Sidebar">
            <Suspense fallback={
              <div className="bg-white/95 rounded-xl shadow-lg border border-cyan-200/20 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            }>
              <UpcomingEvents />
            </Suspense>
            <Suspense fallback={
              <div className="bg-white/95 rounded-xl shadow-lg border border-cyan-200/20 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            }>
              <CommunityStats />
            </Suspense>
          </aside>
        </div>
      </main>
    </div>
    );
  } catch (error) {
    console.error('❌ ModernMemoriesPage render error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return (
      <div className="min-h-screen bg-red-100 p-8">
        <h1 className="text-red-800 text-2xl mb-4">ModernMemoriesPage Error</h1>
        <pre className="text-red-600">{errorMessage}</pre>
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400">
          <p>Expert-optimized ModernMemoriesPage encountered an error.</p>
        </div>
      </div>
    );
  }
};

export default ModernMemoriesPage;
