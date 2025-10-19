/**
 * ESA Mr Blue Complete System - ALL-IN-ONE to avoid Vite HMR deletion bug
 * mb.md lines 988-1012
 */

import { useState } from 'react';
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
  const [messages, setMessages] = useState<Array<{id: string; role: 'user'|'assistant'; content: string; agent?: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/mr-blue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, personality: 'You are Mr. Blue, a friendly AI assistant.' }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        agent: data.agent || 'Mr Blue',
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <Card className="p-6 text-center bg-gradient-to-br from-turquoise-50 to-cyan-50 dark:from-turquoise-950 dark:to-cyan-950">
            <h3 className="font-semibold text-lg mb-2">Welcome to Mr Blue!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">I'm your AI companion. Ask me anything!</p>
          </Card>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {msg.agent && msg.role === 'assistant' && <Badge variant="secondary" className="text-xs mb-1">{msg.agent}</Badge>}
              <div className="text-sm">{msg.content}</div>
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
  );
}

// ============ LIFE CEO AGENTS TAB ============
function LifeCEOAgentsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useQuery<{ success: boolean; agents: any[]; count: number }>({
    queryKey: ['/api/mr-blue/agents'],
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
