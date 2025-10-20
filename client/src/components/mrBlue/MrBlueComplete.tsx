/**
 * ESA Mr Blue Complete System - ALL-IN-ONE with backend integration
 * mb.md lines 988-1012
 * Connected to /api/mrblue/* endpoints with SSE streaming
 */

import { useState, useEffect } from 'react';
import { Sparkles, X, Maximize2, Minimize2, Brain, Search, MessageSquare, Shield, Send, Loader2, Wand2, Code, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { isSuperAdmin } from '@/utils/accessControl';

// ============ CHAT INTERFACE ============
function MrBlueChatInterface() {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      // Use SSE streaming for real-time AI responses
      const response = await fetch('/api/mrblue/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageContent,
          model: 'gpt-4o'
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

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Conversation Sidebar */}
      <div className="w-64 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-950">
        <div className="p-3 border-b dark:border-gray-700">
          <Button onClick={createNewConversation} className="w-full" size="sm" variant="default">
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
                    ? 'bg-gradient-to-r from-turquoise-100 to-cyan-100 dark:from-turquoise-900 dark:to-cyan-900 text-gray-900 dark:text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(!messages || messages.length === 0) && (
            <Card className="p-6 text-center bg-gradient-to-br from-turquoise-50 to-cyan-50 dark:from-turquoise-950 dark:to-cyan-950">
              <h3 className="font-semibold text-lg mb-2">Welcome to Mr Blue!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">I'm your AI companion. Ask me anything!</p>
            </Card>
          )}
        {messages && messages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {msg.metadata && msg.role === 'assistant' && <Badge variant="secondary" className="text-xs mb-1">AI Agent</Badge>}
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
          {isLoading && <div className="flex items-start"><div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask Mr Blue anything..."
              className="flex-1 min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
  const { data, isLoading } = useQuery<{ success: boolean; agents: any[]; count: number }>({
    queryKey: ['/api/mrblue/agents'],
    queryFn: async () => {
      const res = await fetch('/api/mrblue/agents', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch agents');
      return res.json();
    },
  });

  const agents = data?.agents || [];
  const filteredAgents = agents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4">
      <div className="mb-4">
        <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="text-center py-12">Loading agents...</div>
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search Mundo Tango..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>
      <div className="text-center py-12 text-gray-500">
        {query ? `No results found for "${query}"` : 'Start typing to search...'}
      </div>
    </div>
  );
}

// ============ ADMIN TOOLS TAB ============
function AdminToolsTab() {
  const [, navigate] = useLocation();
  const tools = [
    { id: 'visual-editor', name: 'Visual Page Editor', description: 'Click-to-edit any page element with AI', icon: Wand2, action: () => navigate('/visual-editor') },
    { id: 'site-builder', name: 'AI Site Builder', description: 'Generate pages from text descriptions', icon: Code, action: () => navigate('/admin/site-builder') },
    { id: 'esa-mindmap', name: 'ESA MindMap', description: 'Visualize all 276 agents', icon: Map, action: () => navigate('/admin/esa-mind') },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4">
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: isAdmin ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }}>
        <TabsTrigger value="chat" data-testid="tab-chat">
          <MessageSquare className="h-4 w-4 mr-2" />Chat
        </TabsTrigger>
        <TabsTrigger value="lifeceo" data-testid="tab-lifeceo">
          <Brain className="h-4 w-4 mr-2" />Life CEO<Badge variant="secondary" className="ml-2 text-xs">16</Badge>
        </TabsTrigger>
        <TabsTrigger value="search" data-testid="tab-search">
          <Search className="h-4 w-4 mr-2" />Search
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="admin" data-testid="tab-admin">
            <Shield className="h-4 w-4 mr-2" />Admin<Badge variant="destructive" className="ml-2 text-xs">SA</Badge>
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="chat" className="flex-1 overflow-hidden mt-0"><MrBlueChatInterface /></TabsContent>
      <TabsContent value="lifeceo" className="flex-1 overflow-hidden mt-0"><LifeCEOAgentsTab /></TabsContent>
      <TabsContent value="search" className="flex-1 overflow-hidden mt-0"><PlatformSearchTab /></TabsContent>
      {isAdmin && <TabsContent value="admin" className="flex-1 overflow-hidden mt-0"><AdminToolsTab /></TabsContent>}
    </Tabs>
  );
}

// ============ MAIN COMPONENT ============
export function MrBlueComplete() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  console.log('🔵 [MrBlueComplete] Rendering - user:', user?.name || 'No user');
  if (!user) {
    console.log('🔵 [MrBlueComplete] No user - not rendering button');
    return null;
  }
  console.log('🔵 [MrBlueComplete] User found - rendering button!');
  console.log('🔵 [MrBlueComplete] About to return JSX with fixed positioning');

  const buttonJSX = (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]" data-testid="mr-blue-complete-button" style={{ backgroundColor: 'red', width: '64px', height: '64px' }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white border-2 border-white dark:border-gray-800 transition-all duration-300 hover:scale-110"
          data-testid="button-toggle-mr-blue"
        >
          <Sparkles className="h-7 w-7 animate-pulse" />
        </Button>
      </div>

      {isOpen && (
        <Card className={`fixed z-[9998] shadow-2xl bg-white dark:bg-gray-900 ${isFullScreen ? 'inset-4 max-w-none max-h-none' : 'bottom-24 right-6 w-[900px] max-w-[90vw] h-[700px] max-h-[85vh]'} transition-all duration-300 ease-in-out`} data-testid="mr-blue-complete-panel">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-turquoise-50 to-cyan-50 dark:from-turquoise-950 dark:to-cyan-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Mr Blue AI Companion</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Your intelligent assistant + 16 Life CEO agents</p>
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
            <div className="flex-1 overflow-hidden">
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
