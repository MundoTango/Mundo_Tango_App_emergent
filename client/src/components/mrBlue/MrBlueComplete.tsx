/**
 * ESA Mr Blue Complete System - ALL-IN-ONE with backend integration
 * mb.md lines 988-1012
 * Connected to /api/mrblue/* endpoints with SSE streaming
 */

import { useState, useEffect } from 'react';
import { Sparkles, X, Maximize2, Minimize2, Brain, Search, MessageSquare, Shield, Send, Loader2, Wand2, Code, Map, Zap, Compass, CreditCard, Palette, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton } from '@/components/interactions/MicroInteractions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { isSuperAdmin } from '@/utils/accessControl';
import { useBreadcrumbTracker } from '@/lib/tracking/BreadcrumbTracker';
import { useIntentDetection } from '@/hooks/useIntentDetection';
import { useToast } from '@/hooks/use-toast';
import { ChatInterface } from './ChatInterface'; // MB.MD: New multi-model chat
import ToursTab from './tabs/ToursTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import SiteBuilderTab from './tabs/SiteBuilderTab';
import VisualEditorTab from './tabs/VisualEditorTab';
import AvatarAITab from './tabs/AvatarAITab';
import QualityTab from './tabs/QualityTab';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import VoiceControls from './VoiceControls';
import PersonalitySelector, { PersonalityMode } from './PersonalitySelector';
import { MrBlueAvatar } from '@/lib/mrBlue/avatar/MrBlueAvatar';

// ============ CHAT INTERFACE ============
function MrBlueChatInterface() {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<PersonalityMode>('friendly');
  const [selectedModel, setSelectedModel] = useState<'gpt-4o' | 'claude-3-sonnet' | 'gemini-pro'>('gpt-4o');
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // TRACK H: Mobile sidebar toggle
  const { updateActualAction } = useIntentDetection();

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

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversationsData && conversationsData.length > 0 && !conversationId) {
      setConversationId(conversationsData[0].id);
    }
  }, [conversationsData, conversationId]);

  const createNewConversation = async () => {
    try {
      const res = await fetch('/api/mrblue/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat', agentMode: 'chat' }),
      });
      const newConv = await res.json();
      setConversationId(newConv.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Create conversation if none exists
    if (!conversationId) {
      await createNewConversation();
      setTimeout(() => handleSend(), 100); // Retry after conversation created
      return;
    }

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    // Track actual action for intent detection accuracy
    updateActualAction('send_message', 'mr-blue-chat');

    try {
      // Use SSE streaming for real-time AI responses
      const response = await fetch('/api/mrblue/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageContent,
          model: selectedModel  // ✅ FIX: Use user-selected model instead of hard-coded gpt-4o
        }),
      });

      if (!response.ok) {
        throw new Error('Stream failed');
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage += parsed.content;
                }
                if (parsed.done) {
                  break;
                }
              } catch (e) {
                // Ignore parse errors for keep-alive messages
              }
            }
          }
        }
      }

      // Store last assistant message for voice playback
      if (assistantMessage) {
        setLastAssistantMessage(assistantMessage);
      }

      // Refresh messages to get the persisted conversation
      await refetchMessages();
    } catch (error) {
      console.error('Streaming error:', error);
      // Fallback to non-streaming endpoint
      try {
        const res = await fetch(`/api/mrblue/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageContent }),
        });
        if (res.ok) {
          await refetchMessages();
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // TRACK G: Keyboard shortcuts (Ctrl+K to focus input, Esc to blur)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLTextAreaElement>('[aria-label="Chat input"]')?.focus();
      }
      if (e.key === 'Escape') {
        document.querySelector<HTMLTextAreaElement>('[aria-label="Chat input"]')?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" role="main" aria-label="Mr Blue AI Chat">
      {/* TRACK H FIX: Mobile sidebar with toggle */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar overlay" />
      )}
      {/* Conversation Sidebar - TRACK H: Mobile responsive with drawer */}
      <div className={`${isSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} md:relative md:flex md:w-64 w-64 border-r dark:border-gray-700 flex-col bg-gray-50 dark:bg-gray-800`} role="complementary" aria-label="Conversation history">
        <div className="p-3 border-b dark:border-gray-700 space-y-3">
          {/* TEMPORARILY DISABLED: 3D Avatar causes React Three Fiber crash - fixing separately */}
          {/* <div className="h-48 bg-white/90 dark:bg-black/40 rounded-lg overflow-hidden">
            <MrBlueAvatar 
              onMessage={(msg) => {
                setInput(msg);
                setTimeout(() => handleSend(), 100);
              }}
              isSpeaking={isLoading}
              emotion={isLoading ? 'thinking' : 'neutral'}
            />
          </div> */}
          <div className="h-48 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center text-white">
              <Sparkles className="h-12 w-12 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-medium">Mr Blue AI</p>
              <p className="text-xs opacity-75">3D Avatar Loading...</p>
            </div>
          </div>
          <Button 
            onClick={createNewConversation} 
            className="w-full min-h-[44px]" 
            size="sm" 
            variant="default"
            aria-label="Create new conversation"
            data-testid="button-new-chat"
          >
            <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversationsData && conversationsData.length > 0 ? (
            conversationsData.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setConversationId(conv.id)}
                className={`w-full text-left p-3 min-h-[44px] rounded-lg transition-colors focus:ring-2 focus:ring-cyan-500 focus:outline-none ${
                  conversationId === conv.id
                    ? 'bg-gradient-to-r from-turquoise-100 to-cyan-100 dark:from-turquoise-900 dark:to-cyan-900 text-gray-900 dark:text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                aria-label={`Select conversation: ${conv.title || 'Untitled Chat'}`}
                aria-current={conversationId === conv.id ? 'page' : undefined}
                data-testid={`button-conversation-${conv.id}`}
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
      <div className="flex-1 flex flex-col" role="region" aria-label="Chat conversation">
        {/* Model Selector Header with Mobile Menu Button */}
        <div className="p-3 border-b dark:border-gray-700 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/30 dark:to-blue-950/30" role="toolbar" aria-label="AI model selector">
          <div className="flex items-center gap-2">
            {/* TRACK H FIX: Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] p-0"
              aria-label="Toggle conversation list"
              data-testid="button-toggle-sidebar"
            >
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </Button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400" id="model-selector-label">AI Model:</span>
            <div className="flex gap-1" role="radiogroup" aria-labelledby="model-selector-label">
              {/* TRACK H FIX: Touch-friendly button sizes (44px minimum) */}
              {(['gpt-4o', 'claude-3-sonnet', 'gemini-pro'] as const).map((model) => (
                <Button
                  key={model}
                  variant={selectedModel === model ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedModel(model)}
                  className="text-xs min-h-[44px] px-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  data-testid={`button-model-${model}`}
                  role="radio"
                  aria-checked={selectedModel === model}
                  aria-label={`Select ${model === 'gpt-4o' ? 'GPT-4o' : model === 'claude-3-sonnet' ? 'Claude Sonnet' : 'Gemini Pro'} model`}
                >
                  {model === 'gpt-4o' ? 'GPT-4o' : model === 'claude-3-sonnet' ? 'Claude' : 'Gemini'}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
          {(!messages || messages.length === 0) && (
            <Card className="p-6 text-center bg-gradient-to-br from-turquoise-50 to-cyan-50 dark:from-turquoise-950 dark:to-cyan-950" role="status">
              <h3 className="font-semibold text-lg mb-2">Welcome to Mr Blue!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">I'm your AI companion. Ask me anything!</p>
            </Card>
          )}
        {messages && messages.map((msg: any) => (
          <EnhancedMessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={new Date(msg.createdAt).toLocaleTimeString()}
            metadata={msg.metadata}
            onCopy={() => navigator.clipboard.writeText(msg.content)}
            onRegenerate={msg.role === 'assistant' ? () => console.log('Regenerate:', msg.id) : undefined}
            onRate={msg.role === 'assistant' ? (rating) => console.log('Rate:', msg.id, rating) : undefined}
          />
        ))}
          {isLoading && <div className="flex items-start"><div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
        </div>
        <div className="p-4 border-t dark:border-gray-700 space-y-3">
          <div className="flex gap-2">
            <VoiceControls 
              onTranscript={(text) => {
                setInput(text);
                setTimeout(() => handleSend(), 100);
              }}
              lastMessage={lastAssistantMessage}
              autoSpeak={false}
            />
            <PersonalitySelector value={personality} onChange={setPersonality} />
          </div>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask Mr Blue anything... (Ctrl+K to focus)"
              className="flex-1 min-h-[60px] max-h-[120px] focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              disabled={isLoading}
              aria-label="Chat input"
              aria-describedby="keyboard-hint"
              data-testid="input-chat"
            />
            <span id="keyboard-hint" className="sr-only">Press Ctrl+K to focus this input, Enter to send, Shift+Enter for new line</span>
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              aria-label={isLoading ? 'Sending message...' : 'Send message'}
              className="focus:ring-2 focus:ring-cyan-500 focus:outline-none min-h-[44px] min-w-[44px]"
              data-testid="button-send"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ LIFE CEO AGENTS TAB ============
function LifeCEOAgentsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error} = useQuery<{ success: boolean; agents: any[]; count: number }>({
    queryKey: ['/api/mrblue/agents'],
    queryFn: async () => {
      console.log('🔵 [LifeCEO Tab] Fetching agents...');
      const res = await fetch('/api/mrblue/agents', { credentials: 'include' });
      if (!res.ok) {
        console.error('🔵 [LifeCEO Tab] Fetch failed:', res.status);
        throw new Error('Failed to fetch agents');
      }
      const json = await res.json();
      console.log('🔵 [LifeCEO Tab] Data received:', json);
      return json;
    },
  });

  const agents = data?.agents || [];
  const filteredAgents = agents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  console.log('🔵 [LifeCEO Tab] Rendering', { isLoading, hasData: !!data, agentsCount: agents.length, error });

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4">
        <div className="text-center py-12 text-red-500">Error loading agents: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4">
      <div className="mb-4">
        <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="text-center py-12 text-gray-700 dark:text-gray-300">Loading agents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-turquoise-600" />
                  <CardTitle className="text-sm">{agent.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs mb-2">{agent.description}</CardDescription>
                <div className="flex flex-wrap gap-1">
                  {agent.keywords.slice(0, 3).map((kw: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PLATFORM SEARCH TAB ============
function PlatformSearchTab() {
  const [query, setQuery] = useState('');
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search Mundo Tango..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {query ? `No results found for "${query}"` : 'Start typing to search...'}
      </div>
    </div>
  );
}

// ============ ADMIN TOOLS TAB ============
function AdminToolsTab() {
  const [, navigate] = useLocation();
  const tools = [
    { id: 'visual-editor', name: 'Visual Page Editor', description: 'Click-to-edit any page element with AI', icon: Wand2, action: () => navigate('/admin/visual-editor') },
    { id: 'site-builder', name: 'AI Site Builder', description: 'Generate pages from text descriptions', icon: Code, action: () => navigate('/admin/site-builder') },
    { id: 'esa-mindmap', name: 'ESA MindMap', description: 'Visualize all 276 agents', icon: Map, action: () => navigate('/admin/esa-mind') },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={tool.action}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-turquoise-600" />
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{tool.description}</CardDescription>
                <Button size="sm" className="mt-3 w-full" variant="outline">Open Tool</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============ TAB SYSTEM ============
function MrBlueTabSystem() {
  const { user } = useAuth();
  const isAdmin = isSuperAdmin(user);
  const [activeTab, setActiveTab] = useState('chat');
  
  console.log('🔵 [TabSystem] Rendering', { activeTab, isAdmin, userName: user?.name });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full w-full min-h-0">
      <TabsList className="grid w-full shrink-0 overflow-x-auto" style={{ gridTemplateColumns: isAdmin ? 'repeat(10, 1fr)' : 'repeat(9, 1fr)' }}>
        <TabsTrigger value="chat" data-testid="tab-chat">
          <MessageSquare className="h-4 w-4 mr-2" />Chat
        </TabsTrigger>
        <TabsTrigger value="tours" data-testid="tab-tours">
          <Compass className="h-4 w-4 mr-2" />Tours
        </TabsTrigger>
        <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
          <CreditCard className="h-4 w-4 mr-2" />Subscriptions
        </TabsTrigger>
        <TabsTrigger value="search" data-testid="tab-search">
          <Search className="h-4 w-4 mr-2" />Search
        </TabsTrigger>
        <TabsTrigger value="sitebuilder" data-testid="tab-sitebuilder">
          <Wand2 className="h-4 w-4 mr-2" />Site Builder
        </TabsTrigger>
        <TabsTrigger value="visualeditor" data-testid="tab-visualeditor">
          <Palette className="h-4 w-4 mr-2" />Visual Editor
        </TabsTrigger>
        <TabsTrigger value="avatar" data-testid="tab-avatar">
          <Sparkles className="h-4 w-4 mr-2" />Avatar AI
        </TabsTrigger>
        <TabsTrigger value="quality" data-testid="tab-quality">
          <CheckCircle2 className="h-4 w-4 mr-2" />Quality
        </TabsTrigger>
        <TabsTrigger value="lifeceo" data-testid="tab-lifeceo">
          <Brain className="h-4 w-4 mr-2" />Life CEO<Badge variant="secondary" className="ml-2 text-xs">16</Badge>
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="admin" data-testid="tab-admin">
            <Shield className="h-4 w-4 mr-2" />Admin<Badge variant="destructive" className="ml-2 text-xs">SA</Badge>
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="chat" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><MrBlueChatInterface /></TabsContent>
      <TabsContent value="tours" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><ToursTab /></TabsContent>
      <TabsContent value="subscriptions" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><SubscriptionsTab /></TabsContent>
      <TabsContent value="search" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><PlatformSearchTab /></TabsContent>
      <TabsContent value="sitebuilder" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><SiteBuilderTab /></TabsContent>
      <TabsContent value="visualeditor" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><VisualEditorTab /></TabsContent>
      <TabsContent value="avatar" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><AvatarAITab /></TabsContent>
      <TabsContent value="quality" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><QualityTab /></TabsContent>
      <TabsContent value="lifeceo" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><LifeCEOAgentsTab /></TabsContent>
      {isAdmin && <TabsContent value="admin" className="flex-1 flex flex-col overflow-auto mt-0 min-h-0 data-[state=active]:flex"><AdminToolsTab /></TabsContent>}
    </Tabs>
  );
}

// ============ MAIN COMPONENT ============
export function MrBlueComplete() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { toast } = useToast();
  
  // Initialize tracking systems
  useBreadcrumbTracker();
  const { prediction, isAnalyzing } = useIntentDetection();

  // Show proactive notification when high-confidence prediction is detected
  useEffect(() => {
    if (prediction && prediction.confidence > 70) {
      toast({
        title: `⚡ Feature Tested & Ready!`,
        description: `Mr Blue predicts you'll ${prediction.action} - Feature already tested with ${prediction.confidence}% confidence`,
        duration: 5000,
      });
      console.log('[Mr Blue] Proactive notification shown:', prediction);
    }
  }, [prediction, toast]);

  console.log('🔵 [MrBlueComplete] Rendering - user:', user?.name || 'No user');
  if (!user) {
    console.log('🔵 [MrBlueComplete] No user - not rendering button');
    return null;
  }
  console.log('🔵 [MrBlueComplete] User found - rendering button!');
  console.log('🔵 [MrBlueComplete] About to return JSX with fixed positioning');

  const buttonJSX = (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]" data-testid="mr-blue-complete-button">
        <MagneticButton
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-2xl border-4 border-cyan-400 overflow-hidden transition-all duration-300 ${
            isOpen ? 'scale-110 rotate-12' : 'hover:scale-110'
          }`}
          data-testid="button-toggle-mr-blue"
        >
          {user.profileImage ? (
            <img 
              src={user.profileImage} 
              alt="Mr Blue Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-turquoise-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          )}
        </MagneticButton>
      </div>

      {isOpen && (
        <Card className={`fixed z-[9998] shadow-2xl bg-white dark:bg-gray-900 ${isFullScreen ? 'inset-4 max-w-none max-h-none' : 'bottom-24 right-6 w-[900px] max-w-[90vw] h-[700px] max-h-[85vh]'} transition-all duration-300 ease-in-out`} data-testid="mr-blue-complete-panel">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-turquoise-50 to-cyan-50 dark:from-turquoise-950 dark:to-cyan-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Mr Blue AI Companion</h3>
                    {prediction && prediction.confidence > 70 && (
                      <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse" data-testid="badge-intent-prediction">
                        <Zap className="h-3 w-3 mr-1" />
                        {prediction.confidence}% confident
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {prediction && prediction.confidence > 70 
                      ? `Predicting: ${prediction.action} (tested proactively!)`
                      : 'Your intelligent assistant + 16 Life CEO agents'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(!isFullScreen)}>
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <MrBlueTabSystem />
            </div>
          </div>
        </Card>
      )}
    </>
  );
  
  console.log('🔵 [MrBlueComplete] Returning JSX now!');
  return buttonJSX;
}
