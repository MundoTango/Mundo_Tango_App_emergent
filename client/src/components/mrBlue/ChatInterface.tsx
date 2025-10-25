/**
 * MR BLUE CHAT INTERFACE - Standalone Reusable Component
 * Extracted from MrBlueComplete.tsx (lines 241-546) for reuse
 * Uses /api/mrblue/conversations (correct API endpoint)
 */

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
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
import { ModelSelector } from './ModelSelector';
import { ConversationHistoryPanel } from './ConversationHistoryPanel';
import { useAppContext } from '@/hooks/useAppContext';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { getAgentSuggestion } from '@/lib/agentDiscovery';
import { saveOrchestrator } from '@/services/SaveOrchestrator';
import { executeVibeCoding, applyCodeChange, type CodeChange } from '@/lib/vibeApi';
import ErrorBoundary from '@/components/ErrorBoundary';

// 🚀 BATCH 3: Lazy loading heavy components (Oct 23, 2025)
const UnifiedVoiceModal = lazy(() => import('./UnifiedVoiceModal').then(m => ({ default: m.UnifiedVoiceModal })));
const DiffPreviewModal = lazy(() => import('./DiffPreviewModal').then(m => ({ default: m.DiffPreviewModal })));

// 🚀 SIMULTANEOUS BUILD - ALL 3 STREAMS (Oct 23, 2025)
import { ConversationSidebar } from './ConversationSidebar';
import { ChatEmptyState } from './ChatEmptyState';
import { InspectorBadge } from './InspectorBadge';
import { QuickCommitButton } from './QuickCommitButton';

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
  metadata?: {
    buildIntent?: {
      tool: string;
      params: any;
      status: 'pending' | 'executed' | 'failed';
      executedAt?: string;
    };
  };
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
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  
  // 🚀 VIBE CODING INTEGRATION: Store code changes from AI (Oct 23, 2025)
  const [codeChangesByMessage, setCodeChangesByMessage] = useState<Record<number, CodeChange[]>>({});
  
  // 🎧 UNIFIED VOICE MODAL: Single headphone button interface (Oct 22, 2025)
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // 📚 CONVERSATION HISTORY: Show past voice conversations (Oct 22, 2025)
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  
  // 🚀 STREAM 3: Diff Preview Modal State (Oct 23, 2025)
  const [diffPreview, setDiffPreview] = useState<{
    isOpen: boolean;
    filePath?: string;
    oldCode?: string;
    newCode?: string;
    diffId?: number;
  }>({ isOpen: false });
  
  // 🎯 WEEK 0 UNIFICATION: Autonomous mode state (Oct 24, 2025)
  const [autonomousSteps, setAutonomousSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<string>();
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sseConnectionRef = useRef<EventSource | null>(null);
  const { toast } = useToast();
  const appContext = useAppContext(); // 🎯 MB.MD: Collect context for AI awareness
  
  // 🎨 VISUAL EDITOR CONTEXT: See selected elements (Oct 22, 2025)
  // NOTE: Only available when ChatInterface is inside VisualEditorWrapper
  const visualEditorContext = useVisualEditorOptional();
  
  // 🐛 FIX: Direct reference to avoid null checks failing
  const selectedElement = visualEditorContext?.selectedElement ?? null;
  const previewPath = visualEditorContext?.previewPath ?? null; // 🎯 What page is in preview
  
  // 🎯 PERSIST ELEMENT: Keep reference even when modal closes/reopens
  const [lastKnownElement, setLastKnownElement] = useState<typeof selectedElement>(null);
  
  useEffect(() => {
    if (selectedElement) {
      console.log('💾 [ChatInterface] Persisting element to lastKnownElement');
      setLastKnownElement(selectedElement);
    }
  }, [selectedElement]);
  
  // Use persisted element if current is null
  const activeElement = selectedElement || lastKnownElement;
  
  // 🎯 WEEK 0 UNIFICATION: Auto-enable autonomous mode in Visual Editor (Oct 24, 2025)
  const isInVisualEditor = !!visualEditorContext;
  const isAutonomousMode = isInVisualEditor; // Always on in Visual Editor
  
  // 🎯 WEEK 0 UNIFICATION: SSE Event Listener for autonomous execution (Oct 24, 2025)
  // Copied from MrBlueVisualChat.tsx lines 79-183
  const startSSEListener = useCallback((taskId: string) => {
    console.log('🎧 [SSE] Starting event listener for task:', taskId);
    
    // Close existing connection if any
    if (sseConnectionRef.current) {
      sseConnectionRef.current.close();
    }
    
    const eventSource = new EventSource(`/api/mrblue/autonomous/stream/${taskId}`);
    sseConnectionRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 [SSE] Event received:', data.type, data);

        switch (data.type) {
          case 'taskStarted':
            setAutonomousSteps([]);
            setCurrentStep('Planning...');
            break;

          case 'stepPlanned':
            setAutonomousSteps(prev => [...prev, {
              action: data.step,
              status: 'pending',
              timestamp: new Date(),
              stepId: data.stepId,
            }]);
            break;

          case 'stepInProgress':
            setCurrentStep(data.step);
            setAutonomousSteps(prev => prev.map(s => 
              s.stepId === data.stepId ? { ...s, status: 'in_progress' } : s
            ));
            break;

          case 'diffReady':
            // Show diff in chat
            toast({ 
              title: "Code change ready", 
              description: `File: ${data.filePath}` 
            });
            break;

          case 'fileApplied':
            setAutonomousSteps(prev => prev.map(s =>
              s.stepId === data.stepId ? { ...s, status: 'completed' } : s
            ));
            toast({ 
              title: "Changes applied", 
              description: `Updated ${data.filePath}` 
            });
            break;

          case 'errorOccurred':
            toast({ 
              title: "Error detected", 
              description: data.error,
              variant: "destructive" 
            });
            break;

          case 'taskComplete':
            setCurrentStep(undefined);
            toast({ title: "Task complete!" });
            eventSource.close();
            break;

          case 'taskFailed':
            setCurrentStep(undefined);
            toast({ 
              title: "Task failed", 
              description: data.error,
              variant: "destructive" 
            });
            eventSource.close();
            break;
        }
      } catch (error) {
        console.error('❌ [SSE] Error parsing event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ [SSE] Connection error:', error);
      eventSource.close();
      
      toast({ 
        title: "Connection lost", 
        description: "Reconnecting...",
        variant: "destructive" 
      });

      // Auto-reconnect after 2 seconds
      setTimeout(() => {
        console.log('🔄 [SSE] Attempting reconnection...');
        startSSEListener(taskId);
      }, 2000);
    };
  }, [toast]);
  
  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
      }
    };
  }, []);
  
  // 🐛 PHASE 2 DEBUG: Log when selectedElement changes
  useEffect(() => {
    console.log('🎨 [ChatInterface] Element selection update:', {
      hasElement: !!selectedElement,
      element: selectedElement,
      hasContext: !!visualEditorContext,
      contextElement: visualEditorContext?.selectedElement,
      lastKnown: lastKnownElement,
      activeElement: activeElement,
      previewPath: previewPath
    });
    
    if (activeElement) {
      console.log('🎨 [ChatInterface] ✅ Active element:', activeElement);
    } else {
      console.log('⚪ [ChatInterface] No element active');
      if (visualEditorContext?.selectedElement) {
        console.warn('⚠️ [ChatInterface] MISMATCH: Context has element but activeElement is null!', visualEditorContext.selectedElement);
      }
    }
  }, [selectedElement, visualEditorContext, previewPath, lastKnownElement, activeElement]);
  
  // 🎤 VOICE OUTPUT: Premium OpenAI TTS (Oct 22, 2025)
  const { settings: voiceSettings, updateSettings: updateVoiceSettings } = useVoiceOutput();
  
  // Handle model change
  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
  };
  
  // 🚀 STREAM 3: Keyboard Shortcut for Quick Commit (Cmd/Ctrl+Enter) (Oct 23, 2025)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        // ✅ FIX: Check if QuickCommitButton is mounted AND visible before clicking
        const commitButton = document.querySelector('[data-testid="button-quick-commit"]') as HTMLButtonElement;
        
        // Guard: Only trigger if button exists, is visible, and not disabled
        if (commitButton && 
            !commitButton.disabled && 
            commitButton.offsetParent !== null && // Check if visible (not display:none)
            window.getComputedStyle(commitButton).visibility !== 'hidden') {
          commitButton.click();
          toast({
            title: 'Quick Commit',
            description: 'Committing changes... (Cmd+Enter)',
          });
        } else {
          console.log('⌨️ [Keyboard] Cmd+Enter ignored - QuickCommitButton not available');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toast]);

  // Load conversations (projects)
  // MB.MD FIX: Use default queryFn for centralized auth/error handling
  const { data: conversations, isLoading: loadingConversations, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ['/api/chat/projects'],
    queryFn: async () => {
      const res = await fetch('/api/chat/projects', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
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
  // MB.MD FIX: Use default queryFn + array segments for proper cache invalidation
  const { data: messages, isLoading: loadingMessages} = useQuery<Message[]>({
    queryKey: ['/api/chat/projects', conversationId, 'messages'],
    enabled: !!conversationId,
    queryFn: async () => {
      const res = await fetch(`/api/chat/projects/${conversationId}/messages`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
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

  // 🚀 BATCH 1: Rename conversation mutation (Oct 23, 2025)
  const renameConversation = useMutation({
    mutationFn: async ({ id, newName }: { id: number; newName: string }) => {
      await apiRequest(`/api/chat/projects/${id}`, {
        method: 'PATCH',
        body: { name: newName },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
      toast({ title: 'Conversation renamed' });
    },
    onError: () => {
      toast({ title: 'Failed to rename conversation', variant: 'destructive' });
    },
  });

  // Helper function to send message using streaming API
  const sendMessageToConversation = async (projId: number, content: string) => {
    try {
      // 🎯 OPTIMISTIC UI: Show user message immediately
      setOptimisticMessage(content);
      setStreamingResponse('');
      
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
          systemPrompt: `You are Mr Blue, a ${personality} AI assistant for the Mundo Tango community.`,
          context: {
            ...appContext,
            visualEditorState: activeElement ? {
              isActive: true,
              selectedElement: activeElement,
              previewPath: previewPath || '/' // 🎯 What page is being shown in preview
            } : previewPath ? {
              isActive: true,
              previewPath: previewPath // 📍 Even without element selection, tell Mr Blue which page
            } : undefined
          }
        }),
      });

      if (!response.ok) throw new Error('Stream failed');

      // 🔧 FIX #2: Handle both streaming (SSE) and JSON responses
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Multi-model consensus returns JSON
        const result = await response.json();
        console.log(`✅ [JSON Response] Received consensus result`, result);
        
        // 🚨 BUG FIX: Backend saves message automatically, just display it temporarily
        // The consensus endpoint returns { finalPlan, models, debate, totalTime }
        if (result.finalPlan) {
          setStreamingResponse(result.finalPlan);
        }
      } else {
        // Standard streaming response (SSE)
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
                  
                  // Display text chunks as they arrive - REAL-TIME STREAMING!
                  if (parsed.type === 'text' && parsed.chunk) {
                    accumulatedResponse += parsed.chunk;
                    setStreamingResponse(accumulatedResponse);
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
      }

      // MB.MD FIX: Use array segments to match query key format
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/projects', projId, 'messages']
      });
      
      // STREAM A FIX: Clear states AFTER query invalidation completes
      // This gives React time to render the JSON consensus response before clearing
      setStreamingToolStatus(null);
      setOptimisticMessage(null);
      setStreamingResponse('');
      
      // 🔧 PHASE 2: Extract build intents from AI response
      await extractAndQueueBuildIntents(projId);
      
      // 🚀 VIBE CODING: Detect code change requests and execute (Oct 23, 2025)
      await detectAndExecuteCodeChanges(projId, content);
      
      setInput('');
    } catch (error) {
      setOptimisticMessage(null);
      setStreamingResponse('');
      toast({ 
        title: 'Failed to send message', 
        variant: 'destructive' 
      });
    }
  };
  
  // 🚀 VIBE CODING: Detect code requests and execute (Oct 25, 2025)
  // MB.MD STREAM 1+2: Always-on vibe mode in Visual Editor
  const detectAndExecuteCodeChanges = async (projId: number, userMessage: string) => {
    // ✅ RELAXED: Only check if we're in Visual Editor at all
    const isInVisualEditor = !!visualEditorContext;
    if (!isInVisualEditor) {
      console.log('🚀 [Vibe] Skipped - not in Visual Editor');
      return;
    }
    
    // ✅ EXPANDED: More comprehensive keyword detection
    const codeKeywords = [
      // Original keywords
      'remove', 'delete', 'add', 'create', 'modify', 'change',
      'update', 'fix', 'build', 'implement', 'make', 'style',
      'color', 'size', 'position', 'hide', 'show',
      // New natural language patterns
      'component', 'page', 'form', 'button', 'layout', 'design',
      'refactor', 'improve', 'optimize', 'enhance', 'animate',
      'gradient', 'shadow', 'border', 'padding', 'margin',
      'responsive', 'mobile', 'hover', 'click', 'input'
    ];
    
    const hasCodeIntent = codeKeywords.some(kw => 
      userMessage.toLowerCase().includes(kw)
    );
    
    // ✅ ALWAYS EXECUTE: If in Visual Editor, assume coding intent
    // Keywords are just for logging, not blocking
    if (!hasCodeIntent) {
      console.log('🚀 [Vibe] No keywords detected, executing anyway (Visual Editor mode)');
    }
    
    console.log('🚀 [Vibe] Code change detected, executing vibe coding...');
    
    try {
      // Execute vibe coding with visual editor context
      const result = await executeVibeCoding(userMessage, {
        selectedElement: activeElement || null,
        previewPath: previewPath || '/'
      });
      
      console.log(`🚀 [Vibe] Generated ${result.codeChanges.length} code changes`);
      
      // 🚀 STREAM 2: Store code changes in VisualEditorContext
      if (visualEditorContext && result.codeChanges.length > 0) {
        result.codeChanges.forEach((change, index) => {
          visualEditorContext.addCodeChange({
            id: `${Date.now()}-${index}`,
            taskId: change.taskId,
            filePath: change.filePath,
            diff: change.diff,
            type: change.type,
            status: 'pending',
            timestamp: new Date()
          });
        });
        
        console.log(`📝 [Vibe] Added ${result.codeChanges.length} changes to Visual Editor context`);
      }
      
      // Also store in message-specific state for display in chat
      const messagesData = await queryClient.fetchQuery({
        queryKey: ['/api/chat/projects', projId, 'messages']
      });
      
      if (messagesData && Array.isArray(messagesData) && messagesData.length > 0) {
        const lastMessage = messagesData[messagesData.length - 1];
        if (lastMessage.role === 'assistant') {
          setCodeChangesByMessage(prev => ({
            ...prev,
            [lastMessage.id]: result.codeChanges
          }));
        }
      }
      
      toast({
        title: 'Code Generated! ✨',
        description: `${result.codeChanges.length} file(s) ready to modify`,
      });
    } catch (error) {
      console.error('🚀 [Vibe] Code generation failed:', error);
      console.error('🚀 [Vibe] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userMessage: userMessage.substring(0, 100),
        hasElement: !!activeElement,
        hasPreviewPath: !!previewPath
      });
      // Don't show error toast - user still got text response
    }
  };

  // 🔧 PHASE 2: Extract build intents from messages and queue in SaveOrchestrator
  const extractAndQueueBuildIntents = async (projId: number) => {
    try {
      // Refetch messages to get latest with metadata
      const messagesData = await queryClient.fetchQuery({
        queryKey: ['/api/chat/projects', projId, 'messages'],
      });

      if (!messagesData || !Array.isArray(messagesData)) return;

      // Find assistant messages with pending build intents
      const pendingIntents = (messagesData as Message[])
        .filter(msg => 
          msg.role === 'assistant' && 
          msg.metadata?.buildIntent &&
          msg.metadata.buildIntent.status === 'pending'
        );

      if (pendingIntents.length === 0) return;

      console.log(`🔧 [BuildIntent] Found ${pendingIntents.length} pending build intents`);

      // Queue each build intent in SaveOrchestrator
      for (const msg of pendingIntents) {
        const intent = msg.metadata!.buildIntent!;
        
        saveOrchestrator.addChange({
          type: 'ai-build',
          description: msg.content.substring(0, 200), // First 200 chars as description
          data: {
            messageId: msg.id,
            tool: intent.tool,
            params: intent.params,
            filePath: intent.params.file_path || 'unknown'
          }
        });

        console.log(`✅ [BuildIntent] Queued: ${intent.tool} for message ${msg.id}`);
      }

      // Show toast notification
      toast({
        title: 'Build Intents Ready',
        description: `${pendingIntents.length} changes ready. Click Save to review.`,
      });

    } catch (error) {
      // STREAM B FIX: Log full error details for debugging
      console.error('❌ [BuildIntent] Failed to extract intents:', error);
      console.error('❌ [BuildIntent] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        projectId: projId
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
      
      // 🐛 DEBUG: Build and log context before sending (Oct 23, 2025)
      const contextPayload = {
        ...appContext,
        visualEditorState: activeElement ? {
          isActive: true,
          selectedElement: activeElement,
          previewPath: previewPath || '/' // 🎯 What page is being shown in preview
        } : previewPath ? {
          isActive: true,
          previewPath: previewPath // 📍 Even without element selection, tell Mr Blue which page
        } : undefined
      };
      
      console.log('🚀🚀🚀 [ChatInterface] SENDING MESSAGE DEBUG:');
      console.log('  → Message:', content);
      console.log('  → Active Element:', activeElement);
      console.log('  → Preview Path:', previewPath);
      console.log('  → Full Context Payload:', JSON.stringify(contextPayload, null, 2));
      
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
          context: contextPayload
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

  // Auto-scroll to bottom (for messages AND streaming)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingResponse]);

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
      {/* 🚀 STREAM 1: ConversationSidebar - BATCH 3: Wrapped in ErrorBoundary (Oct 23, 2025) */}
      {!isSidebarOpen ? null : (
        <ErrorBoundary fallback={
          <div className="w-64 bg-gray-900 border-r border-gray-700 flex items-center justify-center p-4">
            <p className="text-red-400 text-sm">Sidebar error. Reload page.</p>
          </div>
        }>
          <ConversationSidebar
            conversations={conversations || []}
            activeConversationId={conversationId}
            onSelectConversation={(id) => setConversationId(id)}
            onNewConversation={() => createConversation.mutate()}
            onDeleteConversation={(id) => {
              if (confirm('Delete this conversation?')) {
                deleteConversation.mutate(id);
              }
            }}
            onRenameConversation={(id, newName) => {
              renameConversation.mutate({ id, newName });
            }}
            isCollapsed={false}
          />
        </ErrorBoundary>
      )}

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
        
        {/* 🚀 STREAM 2: InspectorBadge - Shows selected element (Oct 23, 2025) */}
        {activeElement && (
          <InspectorBadge
            element={activeElement}
            onClear={() => {
              // Clear persisted element
              setLastKnownElement(null);
              // Clear selection in Visual Editor if available
              if (visualEditorContext?.setSelectedElement) {
                visualEditorContext.setSelectedElement(null);
              }
            }}
          />
        )}

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
            {/* 🚀 STREAM 1: ChatEmptyState - Tango-specific prompts (Oct 23, 2025) */}
            {conversationId && messages && messages.length === 0 && !loadingMessages && !streamingResponse && (
              <ChatEmptyState 
                onPromptClick={(prompt) => {
                  setInput(prompt);
                  // Auto-focus textarea
                  setTimeout(() => {
                    const textarea = document.querySelector('[data-testid="input-message"]') as HTMLTextAreaElement;
                    textarea?.focus();
                  }, 100);
                }}
              />
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
              codeChanges={codeChangesByMessage[message.id]}
              onApplyCode={async (change) => {
                // Convert type - only unified_diff and search_replace are supported
                const editType = change.type === 'new_file' ? 'unified_diff' : change.type;
                await applyCodeChange(change.filePath, change.diff, editType);
                // Remove from state after applying
                setCodeChangesByMessage(prev => ({
                  ...prev,
                  [message.id]: prev[message.id]?.filter(c => c !== change) || []
                }));
              }}
              onRejectCode={(change) => {
                // Remove from state
                setCodeChangesByMessage(prev => ({
                  ...prev,
                  [message.id]: prev[message.id]?.filter(c => c !== change) || []
                }));
              }}
              onCopy={() => {
                toast({ title: 'Copied to clipboard' });
              }}
              onRegenerate={async () => {
                // Find the user message before this AI message to regenerate
                const messageIndex = messages!.findIndex(m => m.id === message.id);
                if (messageIndex > 0) {
                  const userMessage = messages![messageIndex - 1];
                  if (userMessage.role === 'user' && conversationId) {
                    await sendMessageToConversation(conversationId, userMessage.content);
                    toast({ title: 'Regenerating response...' });
                  }
                }
              }}
            />
          ))}

          {/* OPTIMISTIC UI: Show user message immediately */}
          {optimisticMessage && (
            <EnhancedMessageBubble
              role="user"
              content={optimisticMessage}
              timestamp={new Date().toLocaleTimeString()}
            />
          )}

          {/* REPLIT-STYLE THINKING INDICATOR */}
          {optimisticMessage && !streamingResponse && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-600">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                </div>
                <span className="text-sm font-medium">Mr Blue is thinking...</span>
              </div>
              {streamingToolStatus && (
                <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm">
                  <span className="animate-pulse">🔧</span>
                  <span className="text-cyan-800">{streamingToolStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* STREAMING RESPONSE: Show AI response word-by-word */}
          {streamingResponse && (
            <EnhancedMessageBubble
              role="assistant"
              content={streamingResponse}
              timestamp={new Date().toLocaleTimeString()}
              metadata={{ agentMode: selectedModel }}
              isStreaming={true}
            />
          )}

          <div ref={messagesEndRef} />
          </div>
          
          {/* 🚀 QuickCommitButton - One-click AI commit (Oct 23, 2025) */}
          <QuickCommitButton />

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
      
      {/* 🎧 Unified Voice Modal (Oct 22, 2025) - BATCH 3: Lazy loaded with Suspense */}
      <ErrorBoundary>
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-500" /></div>}>
          <UnifiedVoiceModal 
            isOpen={showVoiceModal}
            onClose={() => setShowVoiceModal(false)}
            voiceSettings={voiceSettings}
            onVoiceSettingsChange={updateVoiceSettings}
            selectedElement={activeElement}
          />
        </Suspense>
      </ErrorBoundary>
      
      {/* 🚀 STREAM 3: DiffPreviewModal - BATCH 3: Lazy loaded with Suspense */}
      <ErrorBoundary>
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-500" /></div>}>
          <DiffPreviewModal
            isOpen={diffPreview.isOpen}
            onClose={() => setDiffPreview({ isOpen: false })}
            filePath={diffPreview.filePath || ''}
            oldCode={diffPreview.oldCode || ''}
            newCode={diffPreview.newCode || ''}
            onAccept={async () => {
              try {
                const { filePath, oldCode, newCode } = diffPreview;
                if (!filePath || !newCode) return;
                
                // 🚀 STREAM C1: Write file using unified diff
                const diffContent = `--- ${filePath}
+++ ${filePath}
@@ -1,${oldCode?.split('\n').length || 0} +1,${newCode.split('\n').length} @@
-${oldCode || ''}
+${newCode}`;
                
                await apiRequest('/api/vibe/edit-file', {
                  method: 'POST',
                  body: JSON.stringify({
                    filePath,
                    editType: 'unified_diff',
                    diffContent
                  })
                });
                
                // 🚀 STREAM C2: Generate AI commit message and commit
                const commitMsgRes = await fetch('/api/git/generate-message', {
                  method: 'POST',
                  credentials: 'include'
                });
                const { message: commitMsg } = await commitMsgRes.json();
                
                const commitRes: any = await apiRequest('/api/git/commit', {
                  method: 'POST',
                  body: JSON.stringify({
                    message: commitMsg,
                    files: [filePath]
                  })
                });
                
                toast({
                  title: 'Changes Applied! ✨',
                  description: `File written and committed: ${commitRes.commitHash?.substring(0, 7) || 'success'}`,
                });
                setDiffPreview({ isOpen: false });
              } catch (error) {
                toast({
                  title: 'Failed to apply changes',
                  description: error instanceof Error ? error.message : 'Unknown error',
                  variant: 'destructive'
                });
              }
            }}
            onReject={() => {
              toast({
                title: 'Changes Rejected',
                description: 'Code changes have been discarded',
                variant: 'destructive',
              });
              setDiffPreview({ isOpen: false });
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default ChatInterface;
