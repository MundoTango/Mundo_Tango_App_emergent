/**
 * MR BLUE VISUAL CHAT
 * Integrated chat for Visual Editor with context awareness
 * Knows about current page, selected component, and recent edits
 * Part of Phase 12 Autonomous Learning System
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AutonomousProgressPanel } from '../mrBlue/AutonomousProgressPanel';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/utils/accessControl';
import type { ElementSelection } from '@/lib/visual-editor/iframeMessaging';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MrBlueVisualChatProps {
  selectedElement: ElementSelection | null;
  onGenerateCode: (prompt: string) => Promise<void>;
}

export function MrBlueVisualChat({
  selectedElement,
  onGenerateCode,
}: MrBlueVisualChatProps) {
  // Extract current page from window location
  const currentPage = window.location.pathname;
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hi! I'm Mr Blue, your Visual Editor AI assistant. I can see you're editing **${currentPage}**. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // AUTONOMOUS MODE - ALWAYS ON IN VISUAL EDITOR (no toggle!)
  const { user } = useAuth();
  const [autonomousSteps, setAutonomousSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<string>();

  // STREAM 1.2: SSE Event Listener for real-time updates
  const startSSEListener = (taskId: string) => {
    console.log('🎧 [SSE] Starting event listener for task:', taskId);
    
    const eventSource = new EventSource(`/api/mrblue/autonomous/stream/${taskId}`);

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
              stepId: data.stepId, // ARCHITECT FIX: Store stepId for matching
            }]);
            break;

          case 'stepInProgress':
            setCurrentStep(data.step);
            setAutonomousSteps(prev => prev.map(s => 
              s.stepId === data.stepId ? { ...s, status: 'in_progress' } : s // ARCHITECT FIX: Match by stepId
            ));
            break;

          case 'diffReady':
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `📝 **Code change ready**\n\nFile: \`${data.filePath}\`\n\n\`\`\`diff\n${data.diff}\n\`\`\``,
              timestamp: new Date(),
            }]);
            break;

          case 'approvalRequired':
            // Skip approval - always auto-approve in Visual Editor
            break;

          case 'fileApplied':
            setAutonomousSteps(prev => prev.map(s =>
              s.stepId === data.stepId ? { ...s, status: 'completed' } : s // ARCHITECT FIX: Match by stepId
            ));
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `✅ Applied changes to \`${data.filePath}\``,
              timestamp: new Date(),
            }]);
            break;

          case 'errorOccurred':
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `⚠️ **Error detected**\n\n${data.error}\n\n🔄 Auto-rollback in progress...`,
              timestamp: new Date(),
            }]);
            break;

          case 'taskComplete':
            setCurrentStep(undefined);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `🎉 **Task complete!**\n\nAll changes have been applied. Click the Save button to commit to Git.`,
              timestamp: new Date(),
            }]);
            eventSource.close();
            break;

          case 'taskFailed':
            setCurrentStep(undefined);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `❌ **Task failed**\n\n${data.error}`,
              timestamp: new Date(),
            }]);
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
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Connection lost. Reconnecting...',
        timestamp: new Date(),
      }]);

      // SECURITY FIX: Actually reconnect after error
      setTimeout(() => {
        console.log('🔄 [SSE] Attempting reconnection...');
        startSSEListener(taskId);
      }, 2000);
    };
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // Notify about element selection
  useEffect(() => {
    if (selectedElement) {
      const elementLabel = selectedElement.id || selectedElement.tagName;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I see you selected **${elementLabel}**. What would you like to do with it?`,
        timestamp: new Date(),
      }]);
    }
  }, [selectedElement]);

  // INTELLIGENT INTENT DETECTION - Automatically detect Q&A vs code generation
  const detectIntent = (message: string): 'question' | 'code_generation' => {
    const lowerMsg = message.toLowerCase().trim();
    
    // Keywords that indicate CODE GENERATION intent
    const codeKeywords = [
      'make', 'change', 'update', 'modify', 'add', 'remove', 'delete', 'create',
      'fix', 'build', 'generate', 'implement', 'refactor', 'style', 'color',
      'move', 'resize', 'hide', 'show', 'animate', 'replace'
    ];
    
    // Keywords that indicate QUESTION intent
    const questionKeywords = [
      'what', 'why', 'how', 'when', 'where', 'who', 'which', 'is', 'are',
      'can', 'could', 'would', 'should', 'tell me', 'explain', 'describe',
      'show me', 'help', '?'
    ];
    
    // Check for question indicators first (higher priority)
    const hasQuestionIndicator = questionKeywords.some(kw => 
      lowerMsg.startsWith(kw + ' ') || lowerMsg.includes(' ' + kw + ' ') || lowerMsg.endsWith('?')
    );
    
    // Check for code generation indicators
    const hasCodeIndicator = codeKeywords.some(kw => 
      lowerMsg.startsWith(kw + ' ') || lowerMsg.includes(' ' + kw + ' ')
    );
    
    // If has question indicators and no code indicators = question
    if (hasQuestionIndicator && !hasCodeIndicator) {
      return 'question';
    }
    
    // If has code indicators = code generation
    if (hasCodeIndicator) {
      return 'code_generation';
    }
    
    // Default: if short message (< 10 words) and no code indicator = question
    const wordCount = lowerMsg.split(/\s+/).length;
    return wordCount < 10 ? 'question' : 'code_generation';
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // INTELLIGENT ROUTING - Automatically detect intent
      const intent = detectIntent(messageText);
      console.log('🧠 [INTENT DETECTION]:', intent, 'for message:', messageText);
      
      if (intent === 'question') {
        // SIMPLE Q&A MODE - Stream conversational response
        console.log('💬 [Q&A MODE] Using simple chat endpoint...');
        
        const response = await fetch('/api/visual-editor/simple-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: messageText,
            context: {
              page: currentPage,
              selectedElement: selectedElement ? {
                tag: selectedElement.tagName,
                id: selectedElement.id,
                className: selectedElement.className,
              } : undefined,
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat failed: ${response.status}`);
        }

        const data = await response.json();
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response || 'I understand your question. How can I help you further?',
          timestamp: new Date(),
        }]);
        
        setIsLoading(false);
        return;
      }
      
      // CODE GENERATION MODE - Use autonomous execution
      console.log('🤖 [CODE MODE] Routing to autonomous execution engine...');
      console.log('📍 Selected Element:', selectedElement);
      
      const response = await fetch('/api/mrblue/autonomous/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          task: messageText,
          context: {
            page: currentPage,
            url: window.location.href,
            selectedComponent: selectedElement ? {
              element: {
                tag: selectedElement.tagName,
                id: selectedElement.id,
                className: selectedElement.className,
                xpath: selectedElement.xpath,
                textContent: selectedElement.textContent,
              }
            } : undefined,
          },
          maxIterations: 20,
          requireApproval: false,
        }),
      });

      if (!response.ok) {
        // 🔍 DIAGNOSTIC LOGGING - MB.MD Rule #7: Diagnose Before Fix
        const errorText = await response.text();
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [CHAT ERROR] Response status:', response.status);
        console.error('❌ [CHAT ERROR] Response body:', errorText);
        console.error('❌ [CHAT ERROR] Request payload:', JSON.stringify({
          task: messageText,
          context: {
            page: currentPage,
            url: window.location.href,
            selectedComponent: selectedElement ? {
              element: {
                tag: selectedElement.tagName,
                id: selectedElement.id,
                className: selectedElement.className,
                xpath: selectedElement.xpath,
                textContent: selectedElement.textContent,
              }
            } : undefined,
          },
          maxIterations: 20,
          requireApproval: false,
        }, null, 2));
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error(`Failed to start autonomous execution: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Autonomous task started:', data.data.taskId);

      // STREAM 1.2: Start SSE listener for real-time updates
      const taskId = data.data.taskId;
      startSSEListener(taskId);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🤖 **Autonomous execution started**\n\nTask ID: ${taskId}\n\nI'm working on your request. Watch the progress panel for live updates!`,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="h-full flex" data-testid="mr-blue-visual-chat">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700" data-testid="chat-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center" data-testid="avatar-mrblue">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold" data-testid="text-title">Mr Blue</h3>
                  <p className="text-xs text-gray-500" data-testid="text-subtitle">Visual Editor AI - Autonomous Mode</p>
                </div>
              </div>
            </div>

            {/* Context badges */}
            <div className="flex flex-wrap gap-2 mt-3" data-testid="context-badges">
              <Badge variant="secondary" className="text-xs" data-testid="badge-current-page">
                {currentPage}
              </Badge>
              {selectedElement && (
                <Badge variant="default" className="text-xs bg-purple-600" data-testid="badge-selected-element">
                  {selectedElement.id || selectedElement.tagName}
                </Badge>
              )}
              <Badge variant="default" className="text-xs bg-green-600" data-testid="badge-autonomous-mode">
                <Zap className="w-3 h-3 mr-1" />
                Autonomous Mode
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} data-testid="chat-messages-container">
        <div className="space-y-4" data-testid="messages-list">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              data-testid={`message-${msg.role}-${i}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`} data-testid={`avatar-${msg.role}`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`} data-testid={`message-bubble-${msg.role}`}>
                  <p className="text-sm whitespace-pre-wrap" data-testid={`text-message-content-${i}`}>{msg.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1" data-testid={`text-timestamp-${i}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

            {isLoading && (
              <div className="flex gap-3" data-testid="loading-indicator">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center" data-testid="avatar-loading">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm text-gray-500" data-testid="text-loading-message">Executing autonomously...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700" data-testid="chat-input-area">
            <div className="flex gap-2" data-testid="input-controls">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me what to change... (e.g., 'make this button red')"
                disabled={isLoading}
                data-testid="input-chat-message"
                aria-label="Chat message input"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                data-testid="button-send-message"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" data-testid="icon-loading" />
                ) : (
                  <Send className="w-4 h-4" data-testid="icon-send" />
                )}
              </Button>
            </div>

            {/* Quick autonomous actions */}
            <div className="flex gap-2 mt-2" data-testid="quick-actions-panel">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setInputValue("Make this button red")}
                data-testid="button-quick-autonomous-color"
                aria-label="Quick action: Change color"
              >
                <Zap className="w-3 h-3 mr-1" />
                Change color
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setInputValue("Add a loading spinner")}
                data-testid="button-quick-autonomous-loading"
                aria-label="Quick action: Add loading spinner"
              >
                <Zap className="w-3 h-3 mr-1" />
                Add spinner
              </Button>
            </div>
          </div>
        </div>

        {/* Autonomous Progress Sidebar */}
        {autonomousSteps.length > 0 && (
          <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900" data-testid="autonomous-progress-sidebar">
            <AutonomousProgressPanel
              isActive={true}
              currentStep={currentStep}
              steps={autonomousSteps}
              checkpointCount={0}
              onCancel={() => {
                setAutonomousSteps([]);
                setCurrentStep(undefined);
              }}
            />
          </div>
        )}
      </div>
      
    </>
  );
}
