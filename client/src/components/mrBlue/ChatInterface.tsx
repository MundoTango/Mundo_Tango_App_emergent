/**
 * MR BLUE CHAT INTERFACE - Standalone Reusable Component
 * Extracted from MrBlueComplete.tsx (lines 241-546) for reuse
 * Uses /api/mrblue/conversations (correct API endpoint)
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Plus, Send, Loader2, Menu, Minimize2, Headphones, History, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import PersonalitySelector, { PersonalityMode } from './PersonalitySelector';
import { UnifiedVoiceModal } from './UnifiedVoiceModal';
import { ModelSelector } from './ModelSelector';
import { ConversationHistoryPanel } from './ConversationHistoryPanel';
import { useAppContext } from '@/hooks/useAppContext';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { getAgentSuggestion } from '@/lib/agentDiscovery';

// ============ TYPES ============
interface Conversation {
  id: number;
  name: string;  // API returns 'name' not 'title'
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  model?: string;
  toolsUsed?: string[]; // Track which tools were used
}

type ModelType = 'gpt-4o' | 'claude-3-sonnet' | 'gemini-pro' | 'all-models';

// ============ CHAT INTERFACE ============
export function ChatInterface() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('all-models'); // Default to All Models (consensus)
  const [personality, setPersonality] = useState<PersonalityMode>('friendly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [streamingToolStatus, setStreamingToolStatus] = useState<string | null>(null);
  
  // 🎧 UNIFIED VOICE MODAL: Single headphone button interface (Oct 22, 2025)
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // 📚 CONVERSATION HISTORY: Show past voice conversations (Oct 22, 2025)
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const appContext = useAppContext(); // 🎯 MB.MD: Collect context for AI awareness
  
  // 🎨 VISUAL EDITOR CONTEXT: See selected elements (Oct 22, 2025)
  // NOTE: Only available when ChatInterface is inside VisualEditorWrapper
  const visualEditorContext = useVisualEditorOptional();
  const selectedElement = visualEditorContext?.selectedElement || null;
  
  // 🐛 PHASE 2 DEBUG: Log when selectedElement changes
  useEffect(() => {
    if (selectedElement) {
      console.log('🎨 [ChatInterface] Selected element received from context:', selectedElement);
    } else {
      console.log('⚪ [ChatInterface] No element selected (selectedElement is null)');
    }
  }, [selectedElement]);
  
  // 🎤 VOICE OUTPUT: Premium OpenAI TTS (Oct 22, 2025)
  const { settings: voiceSettings, updateSettings: updateVoiceSettings } = useVoiceOutput();
  
  // Handle model change
  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
  };

  // Load conversations (projects)
  const { data: conversations, isLoading: loadingConversations, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ['/api/chat/projects'],
    queryFn: async () => {
      console.log('🔵 [ChatInterface] Fetching conversations from /api/chat/projects');
      const res = await fetch('/api/chat/projects', { credentials: 'include' });
      if (!res.ok) {
        console.error('🔴 [ChatInterface] Failed to fetch conversations:', res.status);
        throw new Error('Failed to fetch conversations');
      }
      const data = await res.json();
      console.log('🟢 [ChatInterface] Loaded conversations:', data?.length || 0, 'conversations');
      return data;
    },
  });
  
  // Debug: Log conversations state
  useEffect(() => {
    console.log('📊 [ChatInterface] Conversations state:', {
      loading: loadingConversations,
      error: conversationsError,
      count: conversations?.length || 0,
      data: conversations
    });
  }, [conversations, loadingConversations, conversationsError]);

  // Load messages for active conversation
  const { data: messages, isLoading: loadingMessages} = useQuery<Message[]>({
    queryKey: [`/api/chat/projects/${conversationId}/messages`],
    enabled: !!conversationId,
    queryFn: async () => {
      const res = await fetch(`/api/chat/projects/${conversationId}/messages`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return await res.json();
    },
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

  // Delete conversation mutation (Stream C3)
  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/chat/projects/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
      if (conversationId === deletedId) {
        setConversationId(null); // Clear if active conversation was deleted
      }
      toast({ title: 'Conversation deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete conversation', variant: 'destructive' });
    },
  });

  // Helper function to send message using streaming API
  const sendMessageToConversation = async (projId: number, content: string) => {
    try {
      // 🎯 MB.MD INTEGRATION: Prepend "Use mb.md" in API payload only (hidden from user)
      const apiMessage = `Use mb.md: ${content}`;
      
      // 🔧 FIX #1: Route to correct endpoint based on model selection
      const endpoint = selectedModel === 'all-models' 
        ? '/api/multimodel/consensus' 
        : '/api/chat/stream';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: projId,
          message: apiMessage,
          query: apiMessage, // For multi-model endpoint
          question: apiMessage, // For consensus endpoint
          model: selectedModel,
          personality,
          context: {
            ...appContext,
            selectedElement: selectedElement || undefined // 🎨 Include Visual Editor selection
          }
        }),
      });

      if (!response.ok) throw new Error('Stream failed');

      // 🔧 FIX #2: Read stream AND display text chunks in real-time
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                
                // Display text chunks as they arrive
                if (parsed.type === 'text' && parsed.chunk) {
                  accumulatedResponse += parsed.chunk;
                  // TODO: Real-time display in UI (needs optimistic update)
                }
                
                // Handle tool status updates
                if (parsed.type === 'tool_result') {
                  setStreamingToolStatus(`${parsed.tool}: ${parsed.message}`);
                }
              } catch (e) {
                // Skip non-JSON lines
              }
            }
          }
        }
      }

      console.log(`✅ [Stream Complete] Accumulated ${accumulatedResponse.length} chars`);

      // Clear states and refresh messages
      setStreamingToolStatus(null);
      queryClient.invalidateQueries({ 
        queryKey: [`/api/chat/projects/${projId}/messages`]
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
      
      // 🎯 MB.MD INTEGRATION: Prepend "Use mb.md" in API payload only (hidden from user)
      const apiMessage = `Use mb.md: ${content}`;
      
      // 🤝 STREAM 2: Use multi-model consensus for 'all-models' selection
      const endpoint = selectedModel === 'all-models' 
        ? '/api/multimodel/consensus' 
        : '/api/chat/stream';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: conversationId,
          message: apiMessage,
          query: apiMessage, // For multi-model endpoint
          question: apiMessage, // For consensus endpoint
          model: selectedModel,
          personality,
          systemPrompt: `You are Mr Blue, a ${personality} AI assistant for the Mundo Tango community.`,
          context: {
            ...appContext,
            selectedElement: selectedElement || undefined // 🎨 Include Visual Editor selection
          }
        }),
      });

      if (!response.ok) throw new Error('Stream failed');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/chat/projects/${conversationId}/messages`]
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
  

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!conversationId) {
      // Store message to send after conversation creation
      setPendingMessage(input);
      createConversation.mutate();
    } else {
      // Use proper streaming function instead of mutation
      await sendMessageToConversation(conversationId, input);
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
        } md:w-60 flex-shrink-0 border-r border-cyan-200 bg-white/30 transition-all duration-300 overflow-hidden`}
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
              <div 
                key={conv.id}
                className={`group relative w-full rounded-lg transition-colors min-h-[44px] ${
                  conversationId === conv.id
                    ? 'bg-cyan-100 border-2 border-cyan-500'
                    : 'bg-white/50 hover:bg-cyan-50'
                }`}
              >
                <button
                  onClick={() => setConversationId(conv.id)}
                  className="w-full text-left p-3 pr-10"
                  data-testid={`button-conversation-${conv.id}`}
                  aria-label={`Select conversation: ${conv.name}`}
                >
                  <div className="font-medium text-sm truncate">{conv.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>
                
                {/* Delete Button (Stream C3 - Oct 22, 2025) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${conv.name}"?`)) {
                      deleteConversation.mutate(conv.id);
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded transition-all"
                  data-testid={`button-delete-conversation-${conv.id}`}
                  aria-label={`Delete conversation: ${conv.name}`}
                  title="Delete conversation"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Controls */}
        <div className="flex items-center justify-between p-2 border-b border-cyan-200">
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
          
          {/* 🎨 Visual Editor Context Indicator with Agent Discovery (Oct 22, 2025 - STREAM 3) */}
          {selectedElement && (
            <div 
              className="flex flex-col gap-1 px-3 py-2 bg-purple-500/20 border border-purple-500 rounded-lg max-w-md"
              data-testid="visual-editor-context-indicator"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300 font-mono">
                  &lt;{selectedElement.tagName}&gt;
                  {selectedElement.id && ` #${selectedElement.id}`}
                </span>
              </div>
              <span className="text-xs text-purple-200 opacity-80">
                {getAgentSuggestion({
                  tagName: selectedElement.tagName,
                  id: selectedElement.id,
                  className: selectedElement.className,
                  testId: selectedElement.attributes?.['data-testid']
                })}
              </span>
            </div>
          )}
          
          {/* 🎧 UNIFIED VOICE BUTTON (Oct 22, 2025) - Opens modal with transcript + summary */}
          <Button
            variant={showVoiceModal ? "default" : "ghost"}
            size="icon"
            onClick={() => setShowVoiceModal(true)}
            data-testid="button-unified-voice"
            aria-label="Start voice session"
            title="Voice Session - Live transcript & AI summary"
            className={showVoiceModal ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600" : ""}
          >
            <Headphones className="h-4 w-4" />
          </Button>
          
          {/* 📚 Voice Conversation History Toggle */}
          <Button
            variant={showConversationHistory ? "default" : "ghost"}
            size="icon"
            onClick={() => setShowConversationHistory(!showConversationHistory)}
            data-testid="button-conversation-history"
            aria-label="View conversation history"
            title="View past voice conversations"
            className={showConversationHistory ? "bg-purple-500 hover:bg-purple-600" : ""}
          >
            <History className="h-4 w-4" />
          </Button>
          
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

        {/* Model Selector - Single Dropdown (Oct 22, 2025) */}
        <div className="flex items-center gap-3 p-3 border-b border-cyan-200 bg-white/20">
          <span className="text-sm font-medium text-gray-700">Model:</span>
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
        </div>

        {/* Messages Area OR Conversation History */}
        {showConversationHistory && conversationId ? (
          // 📚 CONVERSATION HISTORY PANEL: View past voice conversations
          <div className="flex-1 overflow-hidden p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Voice Conversation History</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversationHistory(false)}
                data-testid="button-close-history"
              >
                Close
              </Button>
            </div>
            <ConversationHistoryPanel projectId={conversationId} />
          </div>
        ) : (
          <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!conversationId && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Welcome to Mr Blue</h3>
                  <p className="text-gray-600">
                    Start a new conversation to begin chatting with your AI assistant
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    <Headphones className="inline w-4 h-4 mr-1" />
                    Click the headphone icon above to start a voice session with live transcript
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Mr Blue is thinking...</span>
              </div>
              {streamingToolStatus && (
                <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm">
                  <span className="animate-pulse">🔧</span>
                  <span className="text-cyan-800">{streamingToolStatus}</span>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-cyan-200 bg-white/20 p-4 space-y-3">
            <div className="flex gap-3">
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
                className="flex-1 min-h-[44px] max-h-32 resize-none bg-white"
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
          </>
        )}
      </div>
      
      {/* 🎧 Unified Voice Modal (Oct 22, 2025) - Agent #128 with Visual Context */}
      <UnifiedVoiceModal 
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        voiceSettings={voiceSettings}
        onVoiceSettingsChange={updateVoiceSettings}
        selectedElement={selectedElement}
      />
    </div>
  );
}

export default ChatInterface;
