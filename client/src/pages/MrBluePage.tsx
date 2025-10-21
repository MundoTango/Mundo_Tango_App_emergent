/**
 * Mr Blue Dedicated Page - Full-screen AI companion
 * Provides direct access to Mr Blue system without floating button
 * MB.MD QA Protocol: T1-MRBLUE-PAGE
 */

import { useState, lazy, Suspense } from 'react';
import { Sparkles, MessageSquare, Search, Maximize2, Minimize2, MapPin, CreditCard, Wand2, Edit3, CheckCircle, GraduationCap, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mr Blue 7 Specialist Components (ESA #74-80) - LAZY LOADED FOR PERFORMANCE
import { useInteractiveTour, startTour } from '@/lib/mrBlue/tours/InteractiveTour';
import { SubscriptionManager } from '@/lib/mrBlue/subscriptions/SubscriptionManager';
const AISiteBuilderEnhanced = lazy(() => import('@/lib/mrBlue/siteBuilder/AISiteBuilderEnhanced'));
const VisualPageEditor = lazy(() => import('@/lib/mrBlue/visualEditor/VisualPageEditor').then(m => ({ default: m.VisualPageEditor })));
const QualityValidator = lazy(() => import('@/lib/mrBlue/qualityValidator/QualityValidator'));
const LearningCoordinator = lazy(() => import('@/lib/mrBlue/learningCoordinator/LearningCoordinator'));

// MB.MD TRACK 1-3: New Components (Oct 21, 2025) - LAZY LOADED
const LumaAvatarGenerator = lazy(() => import('@/components/mrBlue/LumaAvatarGenerator'));
const LifeCEOAgentsGrid = lazy(() => import('@/components/mrBlue/LifeCEOAgentsGrid'));

// MB.MD MEGA-WAVE 12-16: Enhanced UI Components (Oct 21, 2025) - KEEP LOADED (lightweight)
import VoiceControls from '@/components/mrBlue/VoiceControls';
import PersonalitySelector, { PersonalityMode } from '@/components/mrBlue/PersonalitySelector';
import AgentOrchestrationPanel from '@/components/mrBlue/AgentOrchestrationPanel';
import EnhancedMessageBubble from '@/components/mrBlue/EnhancedMessageBubble';
import { StreamingIndicator, TypewriterText } from '@/components/mrBlue/StreamingIndicator';
import AudioWaveVisualization from '@/components/mrBlue/AudioWaveVisualization';
import BreadcrumbTrail, { BreadcrumbStep } from '@/components/mrBlue/BreadcrumbTrail';

// Loading Component for Suspense
const TabLoadingFallback = ({ tabName }: { tabName: string }) => (
  <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading {tabName}...</p>
    </div>
  </div>
);

// ============ CHAT INTERFACE ============
function MrBlueChatInterface() {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<PersonalityMode>('friendly');
  const [isRecording, setIsRecording] = useState(false);
  const [breadcrumbSteps, setBreadcrumbSteps] = useState<BreadcrumbStep[]>([
    { id: 'start', label: 'New Chat', status: 'completed', timestamp: new Date().toLocaleTimeString() }
  ]);

  // Load conversations
  const { data: conversationsData } = useQuery<any[]>({
    queryKey: ['/api/mrblue/conversations'],
    queryFn: async () => {
      const res = await fetch('/api/mrblue/conversations', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
  });

  // Load messages for current conversation
  const { data: messages, refetch: refetchMessages } = useQuery<any[]>({
    queryKey: ['/api/mrblue/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await fetch(`/api/mrblue/conversations/${conversationId}/messages`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
  });

  const createNewConversation = async () => {
    try {
      const res = await fetch('/api/mrblue/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat', agentMode: 'chat' }),
        credentials: 'include',
      });
      const newConv = await res.json();
      setConversationId(newConv.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!conversationId) {
      await createNewConversation();
      setTimeout(() => handleSend(), 100);
      return;
    }

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Update breadcrumb trail (functional update to avoid stale state)
    setBreadcrumbSteps(prev => [
      ...prev,
      { id: `msg-${Date.now()}`, label: 'Processing...', status: 'current' }
    ]);

    try {
      const response = await fetch('/api/mrblue/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageContent,
          model: 'gpt-4o',
          personality: personality // MB.MD TRACK 3A: Wire personality to chat request
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Stream failed');

      await refetchMessages();
      
      // Update breadcrumb: mark as completed
      setBreadcrumbSteps(prev => 
        prev.map((step, idx) => 
          idx === prev.length - 1 
            ? { ...step, status: 'completed', label: 'Response received', timestamp: new Date().toLocaleTimeString() }
            : step
        )
      );
    } catch (error) {
      console.error('Streaming error:', error);
      // Mark breadcrumb as error
      setBreadcrumbSteps(prev => 
        prev.map((step, idx) => 
          idx === prev.length - 1 
            ? { ...step, status: 'completed', label: 'Error occurred' }
            : step
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Conversation Sidebar */}
      <div className="w-64 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800">
        <div className="p-3 border-b dark:border-gray-700">
          <Button onClick={createNewConversation} className="w-full" size="sm" variant="default" data-testid="button-new-chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversationsData && conversationsData.length > 0 ? (
            conversationsData.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setConversationId(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  conversationId === conv.id
                    ? 'bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 text-gray-900 dark:text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                data-testid={`conversation-${conv.id}`}
              >
                <div className="font-medium text-sm truncate">{conv.title || 'Untitled Chat'}</div>
                <div className="text-xs opacity-70 mt-1">{new Date(conv.updatedAt).toLocaleDateString()}</div>
              </button>
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb Trail */}
        {conversationId && messages && messages.length > 0 && (
          <div className="p-3 border-b dark:border-gray-700">
            <BreadcrumbTrail steps={breadcrumbSteps} onStepClick={(id) => console.log('Navigate to:', id)} />
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(!messages || messages.length === 0) && (
            <Card className="p-6 text-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200 dark:border-cyan-800">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Welcome to Mr Blue!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">I'm your AI companion. Ask me anything!</p>
            </Card>
          )}
          {messages && messages.map((msg: any, idx: number) => {
            const isLastAssistantMessage = msg.role === 'assistant' && idx === messages.length - 1;
            const shouldTypewrite = isLastAssistantMessage && isLoading;
            
            return (
              <EnhancedMessageBubble
                key={msg.id}
                role={msg.role}
                content={
                  shouldTypewrite ? (
                    <TypewriterText text={msg.content} speed={20} />
                  ) : (
                    msg.content
                  )
                }
                timestamp={new Date(msg.createdAt).toLocaleTimeString()}
                metadata={msg.metadata}
                onCopy={() => console.log('Message copied')}
                onRegenerate={msg.role === 'assistant' ? async () => {
                  await refetchMessages();
                } : undefined}
                onRate={(rating) => console.log('Message rated:', rating)}
              />
            );
          })}
          {isLoading && (
            <StreamingIndicator variant="dots" text="Mr Blue is thinking..." />
          )}
        </div>
        <div className="p-4 border-t dark:border-gray-700 space-y-3">
          {/* MB.MD TRACK 3B: Agent Orchestration Panel */}
          <AgentOrchestrationPanel />
          
          {/* MB.MD TRACK 3A: Personality Selector */}
          <PersonalitySelector value={personality} onChange={setPersonality} />
          
          {/* Audio Visualization for Voice Input */}
          <AudioWaveVisualization isActive={isRecording} type="input" />
          
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask Mr Blue anything..."
              className="flex-1 min-h-[60px] max-h-[120px]"
              disabled={isLoading}
              data-testid="input-message"
            />
            <div className="flex flex-col gap-2">
              {/* MB.MD TRACK 2: Voice Controls */}
              <VoiceControls 
                onTranscript={(text) => {
                  setInput(prev => prev + ' ' + text);
                }}
                onRecordingChange={setIsRecording}
                lastMessage={messages && messages.length > 0 ? messages[messages.length - 1]?.content : ''}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} data-testid="button-send">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TOURS TAB ============
function ToursTab() {
  const { toast } = useToast();
  
  const handleStartTour = (type: 'welcome' | 'host' | 'teacher' | 'traveler' | 'local') => {
    startTour(type);
    toast({ title: "Tour Started!", description: `Starting ${type} tour...` });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Interactive Tours</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Guided tours for all user roles</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {['welcome', 'host', 'teacher', 'traveler', 'local'].map(type => (
            <Card key={type} className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200 dark:border-cyan-800">
              <h3 className="font-semibold mb-2 capitalize text-gray-900 dark:text-white">{type} Tour</h3>
              <Button onClick={() => handleStartTour(type as any)} data-testid={`button-tour-${type}`}>
                Start Tour
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ SUBSCRIPTIONS TAB ============
function SubscriptionsTab() {
  const handleUpgrade = (tier: string) => {
    console.log('Upgrading to:', tier);
  };
  
  return (
    <div className="flex-1 overflow-auto">
      <SubscriptionManager currentTier="free" onUpgrade={handleUpgrade} />
    </div>
  );
}

// ============ VISUAL EDITOR TAB WRAPPER ============
function VisualEditorTab() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex-1 overflow-hidden">
      <VisualPageEditor enabled={enabled} onToggle={setEnabled} />
    </div>
  );
}

// ============ AVATAR GENERATION TAB ============
function AvatarTab() {
  const { toast } = useToast();
  
  const handleAvatarReady = (glbUrl: string) => {
    toast({
      title: 'Avatar Ready!',
      description: `Scott's 3D avatar has been generated: ${glbUrl}`,
    });
  };
  
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">3D Avatar Generation</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Professional AI-powered avatar creation with Luma Labs</p>
        
        <LumaAvatarGenerator onAvatarReady={handleAvatarReady} />
      </div>
    </div>
  );
}

// ============ QUALITY & LEARNING TAB ============
function QualityLearningTab() {
  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="quality" className="h-full flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="quality" data-testid="subtab-quality">
            <CheckCircle className="h-4 w-4 mr-2" />Quality Validator
          </TabsTrigger>
          <TabsTrigger value="learning" data-testid="subtab-learning">
            <GraduationCap className="h-4 w-4 mr-2" />Learning Coordinator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="quality" className="flex-1 overflow-auto mt-0">
          <QualityValidator />
        </TabsContent>
        <TabsContent value="learning" className="flex-1 overflow-auto mt-0">
          <LearningCoordinator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ LIFE CEO AGENTS TAB ============
function LifeCEOTab() {
  const { toast } = useToast();
  
  const handleAgentClick = (agent: any) => {
    toast({
      title: `${agent.name} Selected`,
      description: `Launching ${agent.name}...`,
    });
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <LifeCEOAgentsGrid onAgentClick={handleAgentClick} />
      </div>
    </div>
  );
}

// ============ PLATFORM SEARCH TAB ============
function PlatformSearchTab() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Platform Search</h2>
          <p className="text-gray-600 dark:text-gray-400">Search across posts, events, groups, and users</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            type="search"
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            data-testid="input-platform-search"
          />
          <Button data-testid="button-search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <Card className="p-8 text-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200 dark:border-cyan-800">
          <Search className="h-12 w-12 mx-auto mb-4 text-cyan-500" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Enter a search query</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Try searching for posts, events, groups, or people</p>
        </Card>
      </div>
    </div>
  );
}


// ============ MAIN PAGE COMPONENT ============
export default function MrBluePage() {
  const { user } = useAuth();
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 max-w-md text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-cyan-500" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Please Log In</h2>
          <p className="text-gray-600 dark:text-gray-400">You need to be logged in to access Mr Blue</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900 dark:text-white">Mr Blue AI Companion</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your intelligent assistant + 16 Life CEO agents</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(!isFullScreen)} data-testid="button-toggle-fullscreen">
          {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>

      {/* Tab System */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
          <TabsList className="w-full justify-start px-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <TabsTrigger value="chat" data-testid="tab-chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <MessageSquare className="h-4 w-4 mr-2" />Chat
            </TabsTrigger>
            <TabsTrigger value="tours" data-testid="tab-tours" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <MapPin className="h-4 w-4 mr-2" />Tours
            </TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <CreditCard className="h-4 w-4 mr-2" />Subscriptions
            </TabsTrigger>
            <TabsTrigger value="search" data-testid="tab-search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <Search className="h-4 w-4 mr-2" />Search
            </TabsTrigger>
            <TabsTrigger value="sitebuilder" data-testid="tab-sitebuilder" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <Wand2 className="h-4 w-4 mr-2" />Site Builder
            </TabsTrigger>
            <TabsTrigger value="visualeditor" data-testid="tab-visualeditor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <Edit3 className="h-4 w-4 mr-2" />Visual Editor
            </TabsTrigger>
            <TabsTrigger value="avatar" data-testid="tab-avatar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <Sparkles className="h-4 w-4 mr-2" />Avatar AI
            </TabsTrigger>
            <TabsTrigger value="quality" data-testid="tab-quality" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <CheckCircle className="h-4 w-4 mr-2" />Quality & Learning
            </TabsTrigger>
            <TabsTrigger value="lifeceo" data-testid="tab-lifeceo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-cyan-900 dark:data-[state=active]:to-blue-900">
              <Brain className="h-4 w-4 mr-2" />Life CEO Agents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <MrBlueChatInterface />
          </TabsContent>
          <TabsContent value="tours" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <ToursTab />
          </TabsContent>
          <TabsContent value="subscriptions" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <SubscriptionsTab />
          </TabsContent>
          <TabsContent value="search" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <PlatformSearchTab />
          </TabsContent>
          <TabsContent value="sitebuilder" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <Suspense fallback={<TabLoadingFallback tabName="Site Builder" />}>
              <AISiteBuilderEnhanced />
            </Suspense>
          </TabsContent>
          <TabsContent value="visualeditor" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <Suspense fallback={<TabLoadingFallback tabName="Visual Editor" />}>
              <VisualEditorTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="avatar" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <Suspense fallback={<TabLoadingFallback tabName="Avatar Generator" />}>
              <AvatarTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="quality" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <Suspense fallback={<TabLoadingFallback tabName="Quality & Learning" />}>
              <QualityLearningTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="lifeceo" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex">
            <Suspense fallback={<TabLoadingFallback tabName="Life CEO Agents" />}>
              <LifeCEOTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
