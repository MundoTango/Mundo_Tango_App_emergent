/**
 * MR BLUE CHAT INTERFACE - Standalone Reusable Component
 * Extracted from MrBlueComplete.tsx (lines 241-546) for reuse
 * Uses /api/mrblue/conversations (correct API endpoint)
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Plus, Send, Loader2, Menu, Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import VoiceControls from './VoiceControls';
import PersonalitySelector, { PersonalityMode } from './PersonalitySelector';

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

type ModelType = 'gpt-4o' | 'claude-3-sonnet' | 'gemini-pro' | 'all-models';

// ============ CHAT INTERFACE ============
export function ChatInterface() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4o');
  const [personality, setPersonality] = useState<PersonalityMode>('friendly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversations (projects)
  const { data: conversations, isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/chat/projects'],
  });

  // Load messages for active conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/chat/projects', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  // Create new conversation mutation
  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/chat/projects', {
        method: 'POST',
        body: { 
          name: 'New Conversation',
          description: 'Chat with Mr Blue'
        },
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
      setConversationId(data.id);
      toast({ title: 'New conversation started' });
      
      // Send pending message if exists
      if (pendingMessage) {
        sendMessageToConversation(data.id, pendingMessage);
        setPendingMessage(null);
      }
    },
  });

  // Helper function to send message using streaming API
  const sendMessageToConversation = async (projId: number, content: string) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: projId,
          message: content,
          model: selectedModel,
          personality
        }),
      });

      if (!response.ok) throw new Error('Stream failed');

      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/projects', projId, 'messages'] 
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
      
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: conversationId,
          message: content,
          model: selectedModel,
          personality
        }),
      });

      if (!response.ok) throw new Error('Stream failed');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/projects', conversationId, 'messages'] 
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
        {/* Header with Controls */}
        <div className="flex items-center justify-between p-2 border-b border-cyan-200 dark:border-cyan-800/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            data-testid="button-toggle-sidebar"
            aria-label="Toggle sidebar"
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />
          
          {/* Minimize Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="button-minimize-chat"
            aria-label="Minimize chat"
            title="Minimize chat interface"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2 p-3 border-b border-cyan-200 dark:border-cyan-800/50 bg-white/20 dark:bg-black/10 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Model:</span>
          {(['all-models', 'gpt-4o', 'claude-3-sonnet', 'gemini-pro'] as ModelType[]).map((model) => (
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
              {model === 'all-models' ? '🤝 All Models' : model === 'gpt-4o' ? 'GPT-4o' : model === 'claude-3-sonnet' ? 'Claude' : 'Gemini'}
            </Button>
          ))}
          {selectedModel === 'all-models' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Consensus Mode: All models debate & agree)
            </span>
          )}
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

export default ChatInterface;
