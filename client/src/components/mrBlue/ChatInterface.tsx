/**
 * MR BLUE CHAT INTERFACE - Standalone Reusable Component
 * Extracted from MrBlueComplete.tsx (lines 241-546) for reuse
 * Uses /api/mrblue/conversations (correct API endpoint)
 */

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { 
  Sparkles, Plus, Send, Loader2, Menu, Minimize2, Headphones, History, Trash2, Save
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
import { AutoQueueBadge } from './AutoQueueBadge'; // 🎯 Auto-queue badge (Oct 28, 2025)
import { useAppContext } from '@/hooks/useAppContext';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { getAgentSuggestion } from '@/lib/agentDiscovery';
import { executeVibeCoding, applyCodeChange, type CodeChange } from '@/lib/vibeApi';
import ErrorBoundary from '@/components/ErrorBoundary';

// 🚀 BATCH 3: Lazy loading heavy components (Oct 23, 2025)
const UnifiedVoiceModal = lazy(() => import('./UnifiedVoiceModal').then(m => ({ default: m.UnifiedVoiceModal })));
const DiffPreviewModal = lazy(() => import('./DiffPreviewModal').then(m => ({ default: m.DiffPreviewModal })));

// 🚀 SIMULTANEOUS BUILD - ALL 3 STREAMS (Oct 23, 2025)
import { ConversationSidebar } from './ConversationSidebar';
import { ChatEmptyState } from './ChatEmptyState';
import { InspectorBadge } from './InspectorBadge';
// Removed: import { QuickCommitButton } from './QuickCommitButton'; // Oct 27 - Replaced by SAVE button

// ============ TYPES ============
// ✅ FIX (Oct 27): Match backend schema (mrBlueConversations)
interface Conversation {
  id: number;
  title: string;  // Backend returns 'title' (mrBlueConversations.title)
  context?: any | null;  // JSON context field
  agentMode?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  toolsUsed?: string[]; // Track which tools were used
  metadata?: {
    agent?: string;
    model?: string;
    buildIntent?: {
      tool: string;
      params: any;
      status: 'pending' | 'executed' | 'failed';
      executedAt?: string;
    };
  } | null;
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
  
  // 🎯 PLANNING/BUILDING MODE: User can clarify work before execution (Oct 28, 2025)
  const [executionMode, setExecutionMode] = useState<'plan' | 'build'>('plan');
  
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
      console.log('💾 [ChatInterface] Persisting element to lastKnownElement:', selectedElement);
      setLastKnownElement(selectedElement);
    } else {
      console.log('⚪ [ChatInterface] No selectedElement, using lastKnownElement:', lastKnownElement);
    }
  }, [selectedElement, lastKnownElement]);
  
  // 🔧 FIX #3: Use persisted element if current is null (Oct 27, 2025)
  const activeElement = selectedElement || lastKnownElement;
  
  // Debug: Log activeElement whenever it changes
  useEffect(() => {
    console.log('🎯 [ChatInterface] activeElement updated:', {
      hasSelectedElement: !!selectedElement,
      hasLastKnownElement: !!lastKnownElement,
      hasActiveElement: !!activeElement,
      activeElement
    });
  }, [selectedElement, lastKnownElement, activeElement]);
  
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
  // ✅ FIX (Oct 27): Use correct Mr Blue endpoint
  const { data: conversations, isLoading: loadingConversations, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ['/api/mrblue/conversations'],
    queryFn: async () => {
      const res = await fetch('/api/mrblue/conversations', { credentials: 'include' });
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
  // ✅ FIX (Oct 27): Use correct Mr Blue endpoint
  const { data: messages, isLoading: loadingMessages} = useQuery<Message[]>({
    queryKey: ['/api/mrblue/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
    queryFn: async () => {
      const res = await fetch(`/api/mrblue/conversations/${conversationId}/messages`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
  });
  
  // 🔍 DEBUG: Log messages state
  useEffect(() => {
    console.log('💬 [ChatInterface] Messages state:', {
      conversationId,
      loading: loadingMessages,
      count: messages?.length || 0,
      messages: messages?.map(m => ({ id: m.id, role: m.role, content: m.content.substring(0, 30) }))
    });
  }, [messages, loadingMessages, conversationId]);

  // Create new conversation mutation
  // ✅ FIX (Oct 27): Use correct Mr Blue endpoint
  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/mrblue/conversations', {
        method: 'POST',
        body: { 
          title: 'New Conversation', // Backend expects 'title' not 'name'
          agentMode: 'chat'
        },
      });
      return await res.json();
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

  // Delete conversation mutation (Stream C3)
  // ✅ FIX (Oct 27): Use correct Mr Blue endpoint
  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/mrblue/conversations/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/conversations'] });
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
  // ✅ FIX (Oct 27): Use correct Mr Blue endpoint
  const renameConversation = useMutation({
    mutationFn: async ({ id, newName }: { id: number; newName: string }) => {
      await apiRequest(`/api/mrblue/conversations/${id}`, {
        method: 'PUT',
        body: { title: newName }, // Backend expects 'title' not 'name'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/conversations'] });
      toast({ title: 'Conversation renamed' });
    },
    onError: () => {
      toast({ title: 'Failed to rename conversation', variant: 'destructive' });
    },
  });

  // Helper function to send message using streaming API
  const sendMessageToConversation = async (projId: number, content: string) => {
    // 🎯 FIX (Oct 27): Reset message ID ref at start of new send to prevent stale IDs
    currentAssistantMessageId.current = null;
    
    console.log('🚀 [ChatInterface] ========== SENDING MESSAGE ==========');
    console.log('🔍 [ChatInterface] Message details:', {
      projectId: projId,
      userContent: content,
      selectedModel,
      personality,
      hasElement: !!activeElement,
      previewPath,
      executionMode
    });
    
    try {
      // 🎯 PLANNING/BUILDING MODE FIX (Oct 28): Call vibe API BEFORE streaming
      if (executionMode) {
        console.log(`⚙️ [ChatInterface] ${executionMode.toUpperCase()} MODE - Triggering vibe execution FIRST`);
        
        // 🛡️ ARCHITECT FIX: Verify conversation exists before calling unified endpoint
        if (!projId || projId === 0) {
          console.error('❌ [ChatInterface] No valid conversation ID - cannot execute vibe coding');
          toast({
            title: 'Conversation Error',
            description: 'Please create a conversation first',
            variant: 'destructive'
          });
          return;
        }
        
        try {
          const vibeResult = await executeVibeCoding(projId, content, {
            selectedElement: activeElement,
            previewPath: previewPath || '/',
            executionMode: executionMode // Pass mode to backend
          });
          
          console.log('✅ [Vibe] Execution result:', vibeResult);
          
          // Handle clarification questions (PLAN mode)
          if (vibeResult.status === 'needs_clarification' && vibeResult.clarificationQuestion) {
            console.log('❓ [Plan Mode] AI needs clarification');
            setOptimisticMessage(content);
            setStreamingResponse(vibeResult.clarificationQuestion);
            
            // Refetch messages to show clarification in chat
            await queryClient.invalidateQueries({ queryKey: ['/api/mrblue/conversations', projId, 'messages'] });
            
            toast({
              title: '❓ Clarifying question',
              description: vibeResult.clarificationQuestion.substring(0, 100) + '...',
              duration: 5000
            });
            
            // Don't proceed to streaming - just show clarification
            setOptimisticMessage(null);
            return;
          }
          
          // Handle code changes (BUILD mode)
          if (vibeResult.codeChanges && vibeResult.codeChanges.length > 0) {
            console.log(`🚀 [Build Mode] Applying ${vibeResult.codeChanges.length} change(s)`);
            
            for (const change of vibeResult.codeChanges) {
              await applyCodeChange(change.filePath, change.diff, change.type || 'unified_diff');
            }
            
            toast({
              title: '✅ Changes applied',
              description: `Updated ${vibeResult.codeChanges.length} file(s)`,
              duration: 3000
            });
          }
          
        } catch (vibeError) {
          console.error('❌ [Vibe] Execution failed:', vibeError);
          toast({
            title: 'Vibe coding failed',
            description: vibeError instanceof Error ? vibeError.message : 'Unknown error',
            variant: 'destructive'
          });
          // Continue to streaming as fallback
        }
      }
      
      // 🎯 OPTIMISTIC UI: Show user message immediately
      setOptimisticMessage(content);
      setStreamingResponse('');
      
      console.log('🔍 [ChatInterface] Optimistic UI states set');
      
      // 🎯 MB.MD INTEGRATION: Prepend "Use mb.md" in API payload only (hidden from user)
      const apiMessage = `Use mb.md: ${content}`;
      
      // ✅ FIX (Oct 27): Use correct Mr Blue streaming endpoint
      const endpoint = '/api/mrblue/stream';
      
      console.log('🔍 [ChatInterface] Using endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: projId,  // Mr Blue endpoint expects conversationId
          message: content,  // Use original content, not apiMessage
          model: selectedModel === 'all-models' ? 'gpt-4o' : selectedModel,
          // 🚨 MB.MD FIX (Oct 27): Send selected element context to backend
          selectedElement: activeElement,
          previewPath: previewPath || '/',
          // 🎯 EXECUTION MODE (Oct 28, 2025): Send mode to backend
          executionMode: executionMode, // 'plan' or 'build'
        }),
      });

      if (!response.ok) throw new Error('Stream failed');

      // 🔧 FIX #2: Handle both streaming (SSE) and JSON responses
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Multi-model consensus returns JSON
        const result = await response.json();
        console.log(`✅ [JSON Response] Received consensus result:`, {
          hasFinalPlan: !!result.finalPlan,
          planLength: result.finalPlan?.length || 0,
          modelsCount: result.models?.length || 0,
          totalTime: result.totalTime || 0
        });
        
        // 🚨 BUG FIX: Backend saves message automatically, just display it temporarily
        // The consensus endpoint returns { finalPlan, models, debate, totalTime }
        if (result.finalPlan) {
          console.log('🔍 [ChatInterface] Setting streamingResponse to finalPlan');
          setStreamingResponse(result.finalPlan);
        } else {
          console.warn('⚠️ [ChatInterface] No finalPlan in response!', result);
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
                  
                  // 🚀 REPLIT-STYLE: Handle MB.MD phase status updates
                  if (parsed.type === 'status') {
                    const phaseEmoji = parsed.icon || '🔍';
                    const statusMessage = `${phaseEmoji} **${parsed.phase}:** ${parsed.message}`;
                    console.log(`📡 [Stream Status] ${statusMessage}`);
                    setStreamingToolStatus(statusMessage);
                  }
                  
                  // Display text chunks as they arrive - REAL-TIME STREAMING!
                  if (parsed.type === 'text' && parsed.chunk) {
                    accumulatedResponse += parsed.chunk;
                    setStreamingResponse(accumulatedResponse);
                    // Keep status visible longer so user can see MB.MD phases
                    if (accumulatedResponse.length === parsed.chunk.length) {
                      // First chunk, keep status visible for 2 seconds
                      setTimeout(() => setStreamingToolStatus(null), 2000);
                    }
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

      // 🔧 PROPER FIX (Oct 26): Clear ONLY after confirming refetch succeeded
      setStreamingToolStatus(null);
      
      console.log('🔄 [ChatInterface] Refetching messages...');
      
      // ✅ FIX (Oct 27): Use correct Mr Blue query key
      await queryClient.refetchQueries({ 
        queryKey: ['/api/mrblue/conversations', projId, 'messages']
      });
      
      // Verify the new messages are actually in the cache
      const freshMessages = queryClient.getQueryData<any[]>(['/api/mrblue/conversations', projId, 'messages']);
      console.log(`✅ [ChatInterface] Refetch complete. Fresh message count: ${freshMessages?.length || 0}`);
      
      // 🎯 CRITICAL FIX (Oct 27): Track the assistant message ID that was just created
      // This is the message we want to attach diff cards to
      if (freshMessages && freshMessages.length > 0) {
        const lastMessage = freshMessages[freshMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          currentAssistantMessageId.current = lastMessage.id;
          console.log(`🎯 [ChatInterface] Tracking assistant message ID: ${lastMessage.id}`);
        }
      }
      
      // Wait for React to render the new messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // NOW clear optimistic states (only after confirming DB has fresh data)
      console.log('🧹 [ChatInterface] Clearing optimistic states');
      setOptimisticMessage(null);
      setStreamingResponse('');
      
      // 🔧 PHASE 2: Extract build intents from AI response
      await extractAndQueueBuildIntents(projId);
      
      // 🚀 VIBE CODING: Detect code change requests and execute (Oct 23, 2025)
      await detectAndExecuteCodeChanges(projId, content);
      
      setInput('');
    } catch (error) {
      console.error('❌ [ChatInterface] Send message failed:', error);
      setOptimisticMessage(null);
      setStreamingResponse('');
      toast({ 
        title: 'Failed to send message', 
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      console.log('🚀 [ChatInterface] ========== MESSAGE SEND COMPLETE ==========');
    }
  };
  
  // 🚀 VIBE CODING: Detect code requests and execute (Oct 25, 2025)
  // 🎯 BATCH 2: Wire to Visual Editor context (Oct 26, 2025)
  // MB.MD STREAM 1+2: Always-on vibe mode in Visual Editor
  // ✅ FIX #1 (Oct 27): Remove Visual Editor gate - execute vibe coding from any chat context
  // ✅ FIX #4 (Oct 27): Add deduplication to prevent double-execution
  const vibeExecutionCache = useRef<Map<string, Promise<any>>>(new Map());
  const detectAndExecuteCodeChanges = async (projId: number, userMessage: string) => {
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
    
    // 🎯 FIX #5 (Oct 27): Bypass keyword filter when Inspector context exists
    // If user clicked an element, ALWAYS execute vibe coding (Replit-style)
    const isInVisualEditor = !!visualEditorContext;
    const hasSelectedElement = !!activeElement;
    
    if (!hasCodeIntent && !hasSelectedElement) {
      console.log('🚀 [Vibe] No code keywords detected and no element selected - skipping vibe execution');
      return;
    }
    
    if (hasSelectedElement && !hasCodeIntent) {
      console.log('🎯 [Vibe] Element selected - bypassing keyword filter (Inspector context)');
    }
    
    // ✅ FIX #4: Deduplicate vibe executions using request cache
    // Generate cache key from message + context  
    const cacheKey = `${userMessage.trim()}_${isInVisualEditor}_${activeElement?.xpath || 'no-element'}`;
    
    // Check if already executing this exact request
    if (vibeExecutionCache.current.has(cacheKey)) {
      console.log('⏭️ [Vibe] Skipping duplicate execution (cache hit)');
      return vibeExecutionCache.current.get(cacheKey);
    }
    
    console.log(`🚀 [Vibe] Executing with${isInVisualEditor ? '' : 'out'} Visual Editor context`);
    console.log('🚀 [Vibe] REPLIT-STYLE: Preparing changes (not applying)...');
    
    try {
      // Execute vibe coding with optional Visual Editor context
      // ✅ FIX #4: Cache the promise to deduplicate concurrent requests
      // 🚨 MB.MD FIX (Oct 28): Pass conversationId + executionMode to unified endpoint
      if (!projId) {
        console.error('❌ [Vibe] No conversation ID available');
        return;
      }
      
      const executionPromise = executeVibeCoding(projId, userMessage, {
        selectedElement: isInVisualEditor ? activeElement : null,
        previewPath: isInVisualEditor ? (previewPath || '/') : '/',
        executionMode // 🎯 Pass plan/build mode to backend
      });
      
      vibeExecutionCache.current.set(cacheKey, executionPromise);
      
      // Auto-cleanup cache after 5 seconds
      setTimeout(() => {
        vibeExecutionCache.current.delete(cacheKey);
      }, 5000);
      
      const result = await executionPromise;
      console.log('✅ [Vibe] Execution complete:', result);
      
      // 🎯 REPLIT-STYLE: Handle clarification questions
      if (result.status === 'needs_clarification' && result.clarificationQuestion) {
        console.log('❓ [Vibe] AI needs clarification');
        
        // Show clarification question as an AI message (will be saved by backend)
        toast({
          title: '❓ Need more details',
          description: result.clarificationQuestion,
          duration: 5000
        });
        
        // AI response will appear in chat automatically
        return;
      }
      
      // 🎯 REPLIT-STYLE: Queue changes in SaveOrchestrator (for SAVE button)
      if (result.codeChanges && result.codeChanges.length > 0) {
        console.log(`🎯 [Vibe] Queueing ${result.codeChanges.length} change(s) for SAVE`);
        
        // ✅ FIX #3 (Oct 27): Apply changes to preview immediately, then queue for Git commit
        // ✅ FIX #3 INTEGRATION: Emit SSE events for AI Work Feed (live activity stream)
        const sessionId = conversationId?.toString() || 'default';
        
        for (const change of result.codeChanges) {
          try {
            // Emit "file edit starting" event
            await fetch(`/api/ai/broadcast/${sessionId}`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                type: 'file_edit',
                title: `Editing ${change.filePath}`,
                file: change.filePath,
                status: 'running'
              })
            }).catch(err => console.error('[SSE] Broadcast failed:', err));
            
            const editType = change.type === 'new_file' ? 'unified_diff' : (change.type || 'unified_diff');
            const applyResult = await applyCodeChange(change.filePath, change.diff, editType);
            
            if (!applyResult.success) {
              console.error(`❌ [Vibe] Failed to apply ${change.filePath}:`, applyResult.error);
              throw new Error(`Failed to apply ${change.filePath}: ${applyResult.error}`);
            }
            
            console.log(`✅ [Vibe] Applied ${change.filePath} to preview`);
            
            // Emit "file edit success" event
            await fetch(`/api/ai/broadcast/${sessionId}`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                type: 'file_edit',
                title: `Updated ${change.filePath}`,
                file: change.filePath,
                status: 'success'
              })
            }).catch(err => console.error('[SSE] Broadcast failed:', err));
          } catch (error) {
            console.error(`❌ [Vibe] Failed to apply ${change.filePath}:`, error);
            
            // Emit error event
            await fetch(`/api/ai/broadcast/${sessionId}`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                type: 'error',
                title: `Failed to edit ${change.filePath}`,
                file: change.filePath,
                details: error instanceof Error ? error.message : 'Unknown error'
              })
            }).catch(err => console.error('[SSE] Broadcast failed:', err));
          }
        }
        
        // ✅ FIX #1 (Oct 27, FINAL): Reload preview iframe after vibe coding applies changes
        console.log('[Vibe] Triggering preview reload...');
        window.dispatchEvent(new CustomEvent('visual-editor-reload'));
        toast({ 
          title: '✨ Changes Applied', 
          description: `Updated ${result.codeChanges.length} file(s) - preview reloaded` 
        });
        
        // Now queue for Git commit via SaveOrchestrator
        const saveOrch = visualEditorContext?.saveOrchestrator;
        if (saveOrch) {
          result.codeChanges.forEach((change) => {
            saveOrch.addChange({
              type: 'ai-build',
              description: `Edit ${change.filePath}`,
              data: {
                filePath: change.filePath,
                diff: change.diff,
                taskId: change.taskId
              }
            });
          });
          
          console.log(`✅ [Vibe] Added ${result.codeChanges.length} changes to SaveOrchestrator`);
          console.log(`🔢 [Vibe] SaveOrchestrator now has ${saveOrch.getPendingChanges().length} pending changes`);
        } else {
          console.error('❌ [Vibe] SaveOrchestrator not available via VisualEditorContext');
        }
        
        // Show subtle notification (no modal!)
        toast({
          title: `✨ ${result.codeChanges.length} Change${result.codeChanges.length > 1 ? 's' : ''} Prepared`,
          description: 'Click SAVE button to apply',
          duration: 3000
        });
        
        // ✅ FIX (Oct 27): Show diff cards in chat UI
        // 🎯 CRITICAL FIX: Use tracked assistant message ID, not messages array
        // The messages array may not be updated yet when vibe coding completes
        const targetMessageId = currentAssistantMessageId.current;
        if (targetMessageId) {
          setCodeChangesByMessage(prev => ({
            ...prev,
            [targetMessageId]: result.codeChanges.map(change => ({
              taskId: change.taskId,
              filePath: change.filePath,
              diff: change.diff,
              type: change.type || 'unified_diff',
              status: change.status || 'pending'
            }))
          }));
          console.log(`🎨 [Vibe] Added ${result.codeChanges.length} diff cards to message ${targetMessageId}`);
        } else {
          console.warn('⚠️ [Vibe] No tracked assistant message ID - diff cards not displayed');
        }
        
      } else if (result.status === 'failed') {
        console.error('❌ [Vibe] Execution failed:', result.errors);
        toast({
          title: 'Planning Failed',
          description: result.errors?.join(', ') || 'Could not plan changes',
          variant: 'destructive'
        });
      } else {
        console.log('💬 [Vibe] AI responded conversationally (no code changes)');
      }
      
    } catch (error) {
      console.error('❌ [Vibe] Execution error:', error);
      toast({
        title: 'Vibe Coding Error',
        description: error instanceof Error ? error.message : 'Failed to execute',
        variant: 'destructive'
      });
    }
  };

  // 🎯 CRITICAL FIX (Oct 27): Track current assistant message ID for diff cards
  const currentAssistantMessageId = useRef<number | null>(null);

  // 🔧 PHASE 2: Extract build intents from messages and queue in SaveOrchestrator
  const extractAndQueueBuildIntents = async (projId: number) => {
    try {
      // 🚨 MB.MD FIX (Oct 28): Use getQueryData instead of fetchQuery (no queryFn needed)
      const messagesData = queryClient.getQueryData<Message[]>(['/api/mrblue/conversations', projId, 'messages']);

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

      // ⚠️ DEPRECATED (Oct 26, 2025): SaveOrchestrator removed, using vibe coding flow instead
      console.log('ℹ️  [BuildIntent] Build intents now handled via vibe coding flow');
      // Build intents are now automatically handled by the vibe coding system
      // which queues changes to visualEditorContext.setPendingCodeChanges

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
      // ✅ FIX (Oct 27): Use correct Mr Blue streaming endpoint
      const endpoint = selectedModel === 'all-models' 
        ? '/api/multimodel/consensus' 
        : '/api/mrblue/stream';
      
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
      // ✅ FIX (Oct 27): Use correct Mr Blue query key
      queryClient.invalidateQueries({ 
        queryKey: [`/api/mrblue/conversations/${conversationId}/messages`]
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
  
  // 🔧 DEFENSIVE GUARD (Oct 26): Clear optimistic states when conversation changes
  // Prevents optimistic state bleed across conversations
  useEffect(() => {
    console.log(`🛡️ [ChatInterface] Conversation changed to ${conversationId}, clearing optimistic states`);
    setOptimisticMessage(null);
    setStreamingResponse('');
    setStreamingToolStatus(null);
    // 🎯 FIX (Oct 27): Reset message ID ref to prevent stale IDs during conversation switches
    currentAssistantMessageId.current = null;
  }, [conversationId]);
  

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
          
          {/* 🚫 REMOVED: Extra SAVE button (Vibe Coding UX violation - Oct 26, 2025)
               REASON: User has requested MULTIPLE TIMES that NO extra Apply/Save buttons exist
               FLOW: AI suggestions → auto-queue immediately → ONLY top-right SAVE commits
               See replit.md: "🚨 CRITICAL: Vibe Coding UX Pattern - NO extra Apply buttons"
           */}
          
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

          {messages?.map((message) => {
            console.log('🎨 [ChatInterface] Rendering message:', {
              id: message.id,
              role: message.role,
              content: message.content.substring(0, 30)
            });
            return (
              <EnhancedMessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={new Date(message.createdAt).toLocaleTimeString()}
                metadata={{ agentMode: message.metadata?.model }}
                codeChanges={codeChangesByMessage[message.id]}
                onApplyCode={async (change) => {
                  const editType = change.type === 'new_file' ? 'unified_diff' : change.type;
                  const result = await applyCodeChange(change.filePath, change.diff, editType);
                  
                  if (!result.success) {
                    toast({
                      title: 'Failed to apply change',
                      description: result.error || 'Unknown error',
                      variant: 'destructive'
                    });
                    return;
                  }
                  
                  setCodeChangesByMessage(prev => ({
                    ...prev,
                    [message.id]: prev[message.id]?.filter(c => c !== change) || []
                  }));
                  
                  toast({
                    title: 'Change applied',
                    description: `Successfully updated ${change.filePath}`
                  });
                }}
                onRejectCode={(change) => {
                  setCodeChangesByMessage(prev => ({
                    ...prev,
                    [message.id]: prev[message.id]?.filter(c => c !== change) || []
                  }));
                }}
                onCopy={() => {
                  toast({ title: 'Copied to clipboard' });
                }}
                onRegenerate={async () => {
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
            );
          })}

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
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-300 rounded-lg text-sm shadow-sm">
                  {/* Extract emoji from status message if present */}
                  <span className="animate-pulse text-base">
                    {streamingToolStatus.match(/^(🔍|🎯|📋|🤖|💾|✅)/)?.[0] || '🔧'}
                  </span>
                  <span 
                    className="text-cyan-900 font-medium"
                    dangerouslySetInnerHTML={{ 
                      __html: streamingToolStatus
                        .replace(/^\S+\s+/, '') // Remove leading emoji
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold syntax
                    }}
                  />
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
          
          {/* 🚫 REMOVED QuickCommitButton - Replaced by SAVE button (Oct 27, 2025)
               REASON: Conflicts with SaveOrchestrator system, confuses users with two save buttons
               ALL changes now go through SaveOrchestrator → SAVE button in Visual Editor header
          */}

          {/* Input Area */}
          <div className="border-t border-cyan-200 bg-white/20 p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <PersonalitySelector value={personality} onChange={setPersonality} />
              </div>
            </div>

            {/* 🎯 PLANNING/BUILDING MODE TOGGLE (Oct 28, 2025) */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
              <span className="text-xs font-medium text-cyan-900">Mode:</span>
              <div className="flex gap-1 bg-white rounded-md p-0.5 shadow-sm">
                <button
                  onClick={() => setExecutionMode('plan')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    executionMode === 'plan' 
                      ? 'bg-cyan-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  data-testid="button-mode-plan"
                >
                  📋 Plan
                </button>
                <button
                  onClick={() => setExecutionMode('build')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    executionMode === 'build' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  data-testid="button-mode-build"
                >
                  🚀 Build
                </button>
              </div>
              <span className="text-xs text-gray-600 ml-2">
                {executionMode === 'plan' 
                  ? 'Clarify work before execution' 
                  : 'Execute immediately to preview'}
              </span>
              
              {/* 🎯 AUTO-QUEUE BADGE: Show queued changes (Oct 28, 2025) */}
              {visualEditorContext && visualEditorContext.pendingChangesCount > 0 && (
                <div className="ml-auto">
                  <AutoQueueBadge 
                    count={visualEditorContext.pendingChangesCount}
                    onClick={() => {
                      // Open save dialog or show changes
                      const count = visualEditorContext.pendingChangesCount;
                      toast({
                        title: `${count} changes queued`,
                        description: 'Click SAVE button to commit all changes',
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={executionMode === 'plan' 
                  ? "Describe what you want to build... (I'll ask clarifying questions first)" 
                  : "Type your message... (I'll execute immediately)"}
                className="flex-1 min-h-[44px] max-h-32 resize-none bg-white"
                data-testid="input-message"
                aria-label="Message input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending || createConversation.isPending}
                className={`min-w-[44px] h-11 ${
                  executionMode === 'plan' 
                    ? 'bg-cyan-500 hover:bg-cyan-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
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
                const { filePath, newCode } = diffPreview;
                if (!filePath || !newCode) return;
                
                console.log('✅ [DiffPreview] Applying changes to', filePath);
                
                // Apply code change via vibe API (handles git commit automatically)
                const result = await applyCodeChange(filePath, newCode, 'unified_diff');
                
                console.log('✅ [DiffPreview] Apply result:', result);
                
                // Invalidate preview cache to show changes
                queryClient.invalidateQueries({ queryKey: ['/api/preview'] });
                
                toast({
                  title: 'Changes Applied! ✨',
                  description: (result as any).gitCommitHash 
                    ? `File updated and committed: ${(result as any).gitCommitHash.substring(0, 7)}`
                    : `File updated: ${filePath}`,
                });
                
                setDiffPreview({ isOpen: false });
              } catch (error) {
                console.error('❌ [DiffPreview] Apply error:', error);
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
