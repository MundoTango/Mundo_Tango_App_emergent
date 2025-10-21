/**
 * ESA Mr Blue AI Companion - COMPLETE REBUILD
 * mb.md specification implementation
 * 10 Tabs + Chat Interface + Backend Integration + WCAG 2.1 AA
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Maximize2, Minimize2, Menu, Plus, Send, Loader2,
  MessageSquare, Map, CreditCard, Search, Code, Palette, Wand2, 
  CheckCircle2, Brain, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { isSuperAdmin } from '@/utils/accessControl';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import VoiceControls from './VoiceControls';
import PersonalitySelector, { PersonalityMode } from './PersonalitySelector';
import ToursTab from './tabs/ToursTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import SiteBuilderTab from './tabs/SiteBuilderTab';
import VisualEditorTab from './tabs/VisualEditorTab';
import AvatarAITab from './tabs/AvatarAITab';
import QualityTab from './tabs/QualityTab';
import SearchTab from './tabs/SearchTab';
import LifeCEOTab from './tabs/LifeCEOTab';
import AdminTab from './tabs/AdminTab';

// ============ TYPES ============
interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  model?: string;
}

type ModelType = 'gpt-4o' | 'claude-3-sonnet' | 'gemini-pro';

// ============ MAIN COMPONENT ============
export function MrBlueComplete() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const { user } = useAuth();
  const isAdmin = user && isSuperAdmin(user);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300"
        data-testid="button-open-mrblue"
        aria-label="Open Mr Blue AI Assistant"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className={`p-0 gap-0 border-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950 ${
            isMaximized ? 'w-screen h-screen max-w-none' : 'w-[95vw] h-[85vh] max-w-6xl'
          }`}
          data-testid="dialog-mrblue"
          aria-describedby="mrblue-description"
        >
          <DialogTitle className="sr-only">Mr Blue AI Companion</DialogTitle>
          <DialogDescription id="mrblue-description" className="sr-only">
            Your intelligent AI assistant with 16 Life CEO agents, featuring chat, tours, subscriptions, search, site builder, visual editor, avatar AI, quality controls, and admin tools.
          </DialogDescription>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-200 dark:border-cyan-800/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Mr Blue AI Companion
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your intelligent assistant + 16 Life CEO agents
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8"
                data-testid="button-toggle-maximize"
                aria-label={isMaximized ? "Minimize window" : "Maximize window"}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                data-testid="button-close-mrblue"
                aria-label="Close Mr Blue"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation */}
              <TabsList className="w-full justify-start rounded-none border-b border-cyan-200 dark:border-cyan-800/50 bg-white/30 dark:bg-black/10 p-2 overflow-x-auto flex-shrink-0">
                <TabsTrigger value="chat" className="gap-2" data-testid="tab-chat">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="tours" className="gap-2" data-testid="tab-tours">
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline">Tours</span>
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="gap-2" data-testid="tab-subscriptions">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscriptions</span>
                </TabsTrigger>
                <TabsTrigger value="search" className="gap-2" data-testid="tab-search">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </TabsTrigger>
                <TabsTrigger value="site-builder" className="gap-2" data-testid="tab-sitebuilder">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Site Builder</span>
                </TabsTrigger>
                <TabsTrigger value="visual-editor" className="gap-2" data-testid="tab-visualeditor">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Visual Editor</span>
                </TabsTrigger>
                <TabsTrigger value="avatar-ai" className="gap-2" data-testid="tab-avatar">
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Avatar AI</span>
                </TabsTrigger>
                <TabsTrigger value="quality" className="gap-2" data-testid="tab-quality">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Quality</span>
                </TabsTrigger>
                <TabsTrigger value="life-ceo" className="gap-2" data-testid="tab-lifeceo">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Life CEO</span>
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="gap-2" data-testid="tab-admin">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab Content */}
              <TabsContent value="chat" className="flex-1 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                <ChatInterface />
              </TabsContent>
              <TabsContent value="tours" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <ToursTab />
              </TabsContent>
              <TabsContent value="subscriptions" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <SubscriptionsTab />
              </TabsContent>
              <TabsContent value="search" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <SearchTab />
              </TabsContent>
              <TabsContent value="site-builder" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <SiteBuilderTab />
              </TabsContent>
              <TabsContent value="visual-editor" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <VisualEditorTab />
              </TabsContent>
              <TabsContent value="avatar-ai" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <AvatarAITab />
              </TabsContent>
              <TabsContent value="quality" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <QualityTab />
              </TabsContent>
              <TabsContent value="life-ceo" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                <LifeCEOTab />
              </TabsContent>
              {isAdmin && (
                <TabsContent value="admin" className="flex-1 m-0 p-4 overflow-auto data-[state=active]:block">
                  <AdminTab />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ CHAT INTERFACE ============
function ChatInterface() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4o');
  const [personality, setPersonality] = useState<PersonalityMode>('friendly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/mrblue/conversations'],
    queryFn: async () => {
      const response = await fetch('/api/mrblue/conversations', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
  });

  // Load messages for active conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/mrblue/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await fetch(`/api/mrblue/conversations/${conversationId}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  // Create new conversation mutation
  const createConversation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/mrblue/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Conversation' }),
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/conversations'] });
      setConversationId(data.id);
      toast({ title: 'New conversation started' });
      
      // Send pending message if exists
      if (pendingMessage) {
        sendMessageToConversation(data.id, pendingMessage);
        setPendingMessage(null);
      }
    },
  });

  // Helper function to send message to specific conversation
  const sendMessageToConversation = async (convId: number, content: string) => {
    try {
      await apiRequest(`/api/mrblue/conversations/${convId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ 
          content, 
          model: selectedModel,
          personality 
        }),
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/mrblue/conversations', convId, 'messages'] 
      });
      setInput('');
    } catch (error) {
      toast({ 
        title: 'Failed to send message', 
        variant: 'destructive' 
      });
    }
  };

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error('No active conversation');
      return await apiRequest(`/api/mrblue/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ 
          content, 
          model: selectedModel,
          personality 
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/mrblue/conversations', conversationId, 'messages'] 
      });
      setInput('');
    },
    onError: () => {
      toast({ 
        title: 'Failed to send message', 
        variant: 'destructive' 
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select first conversation on load
  useEffect(() => {
    if (conversations && conversations.length > 0 && !conversationId) {
      setConversationId(conversations[0].id);
    }
  }, [conversations, conversationId]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (!conversationId) {
      // Store message to send after conversation creation
      setPendingMessage(input);
      createConversation.mutate();
    } else {
      sendMessage.mutate(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Conversations */}
      <div 
        className={`${
          isSidebarOpen ? 'w-60' : 'w-0'
        } md:w-60 flex-shrink-0 border-r border-cyan-200 dark:border-cyan-800/50 bg-white/30 dark:bg-black/10 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 space-y-4 h-full flex flex-col">
          {/* 3D Avatar Placeholder */}
          <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>

          {/* New Chat Button */}
          <Button
            onClick={() => createConversation.mutate()}
            className="w-full gap-2 min-h-[44px] bg-cyan-500 hover:bg-cyan-600"
            data-testid="button-new-chat"
            aria-label="Start new chat"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loadingConversations && (
              <div className="text-center text-sm text-gray-500">Loading...</div>
            )}
            {conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setConversationId(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors min-h-[44px] ${
                  conversationId === conv.id
                    ? 'bg-cyan-100 dark:bg-cyan-900/50 border-2 border-cyan-500'
                    : 'bg-white/50 dark:bg-black/20 hover:bg-cyan-50 dark:hover:bg-cyan-900/30'
                }`}
                data-testid={`button-conversation-${conv.id}`}
                aria-label={`Select conversation: ${conv.title}`}
              >
                <div className="font-medium text-sm truncate">{conv.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden p-2 border-b border-cyan-200 dark:border-cyan-800/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            data-testid="button-toggle-sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2 p-3 border-b border-cyan-200 dark:border-cyan-800/50 bg-white/20 dark:bg-black/10 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Model:</span>
          {(['gpt-4o', 'claude-3-sonnet', 'gemini-pro'] as ModelType[]).map((model) => (
            <Button
              key={model}
              variant={selectedModel === model ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedModel(model)}
              className={`h-11 ${
                selectedModel === model
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'border-cyan-300 dark:border-cyan-700'
              }`}
              data-testid={`button-model-${model}`}
              aria-label={`Select ${model} model`}
            >
              {model === 'gpt-4o' ? 'GPT-4o' : model === 'claude-3-sonnet' ? 'Claude' : 'Gemini'}
            </Button>
          ))}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!conversationId && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Welcome to Mr Blue</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start a new conversation to begin chatting with your AI assistant
                </p>
              </div>
            </div>
          )}

          {loadingMessages && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
          )}

          {messages?.map((message) => (
            <EnhancedMessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={new Date(message.createdAt).toLocaleTimeString()}
              metadata={{ agentMode: message.model }}
            />
          ))}

          {sendMessage.isPending && (
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Mr Blue is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-cyan-200 dark:border-cyan-800/50 bg-white/20 dark:bg-black/10 p-4 space-y-3">
          <div className="flex gap-3">
            <VoiceControls 
              onTranscript={setInput}
              lastMessage={messages?.[messages.length - 1]?.content}
            />
            <div className="flex-1">
              <PersonalitySelector value={personality} onChange={setPersonality} />
            </div>
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 min-h-[44px] max-h-32 resize-none bg-white dark:bg-black/30"
              data-testid="input-message"
              aria-label="Message input"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending || createConversation.isPending}
              className="min-w-[44px] h-11 bg-cyan-500 hover:bg-cyan-600"
              data-testid="button-send-message"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
