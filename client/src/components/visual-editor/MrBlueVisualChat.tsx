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
import { AutonomousToggle } from '../mrBlue/AutonomousToggle';
import { AutonomousProgressPanel } from '../mrBlue/AutonomousProgressPanel';
import { ApprovalModal } from '../mrBlue/ApprovalModal';
import { useAutonomousMode } from '@/hooks/useAutonomousMode';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/utils/accessControl';
import type { SelectedComponent } from './ComponentSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MrBlueVisualChatProps {
  currentPage: string;
  selectedComponent: SelectedComponent | null;
  recentEdits: Array<{
    type: string;
    component: string;
    description: string;
  }>;
}

export function MrBlueVisualChat({
  currentPage,
  selectedComponent,
  recentEdits,
}: MrBlueVisualChatProps) {
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
  
  // AUTONOMOUS MODE (Visual Editor Only)
  const { user } = useAuth();
  const isAdmin = user && isSuperAdmin(user);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [autonomousSteps, setAutonomousSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<string>();
  const [checkpointCount, setCheckpointCount] = useState(0);
  const [approvalRequest, setApprovalRequest] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  const autonomousMode = useAutonomousMode();

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
            setApprovalRequest({
              filePath: data.filePath,
              diff: data.diff,
              risk: data.risk,
              description: data.description,
            });
            setShowApprovalModal(true);
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
            setCheckpointCount(prev => prev + 1);
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

  // Notify about component selection
  useEffect(() => {
    if (selectedComponent) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I see you selected **${selectedComponent.testId}**. What would you like to do with it?`,
        timestamp: new Date(),
      }]);
    }
  }, [selectedComponent]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // STREAM 1.1: Route to autonomous execute when autonomous mode ON
      if (isAutonomous) {
        console.log('🤖 [AUTONOMOUS] Routing to autonomous execution engine...');
        console.log('📍 Selected Component:', selectedComponent);
        
        const response = await fetch('/api/mrblue/autonomous/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            task: inputValue,
            context: {
              page: currentPage,
              url: window.location.href,
              selectedComponent: selectedComponent ? {
                id: selectedComponent.testId,
                name: selectedComponent.testId,
                type: selectedComponent.type,
                element: selectedComponent, // Full element data for file detection
              } : undefined,
              recentEdits,
            },
            maxIterations: 20,
            requireApproval: true,
          }),
        });

        if (!response.ok) throw new Error('Failed to start autonomous execution');

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
      } else {
        // Normal chat mode (non-autonomous)
        const response = await fetch('/api/visual-editor/simple-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: inputValue,
            context: {
              page: currentPage,
              url: window.location.href,
              selectedComponent: selectedComponent ? {
                id: selectedComponent.testId,
                name: selectedComponent.testId,
                type: selectedComponent.type,
              } : undefined,
              recentEdits,
            },
          }),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const data = await response.json();

          setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }]);
      }
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
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Mr Blue</h3>
                  <p className="text-xs text-gray-500">Visual Editor AI + Autonomous Mode</p>
                </div>
              </div>
              
              {/* Autonomous Toggle (Visual Editor Only) */}
              {isAdmin && (
                <AutonomousToggle
                  enabled={isAutonomous}
                  onChange={setIsAutonomous}
                  disabled={false}
                />
              )}
            </div>

            {/* Context badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                {currentPage}
              </Badge>
              {selectedComponent && (
                <Badge variant="default" className="text-xs bg-purple-600">
                  {selectedComponent.testId}
                </Badge>
              )}
              {recentEdits.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {recentEdits.length} edits
                </Badge>
              )}
              {isAutonomous && (
                <Badge variant="default" className="text-xs bg-green-600">
                  <Zap className="w-3 h-3 mr-1" />
                  Autonomous ON
                </Badge>
              )}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
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
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm text-gray-500">{isAutonomous ? 'Executing autonomously...' : 'Thinking...'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isAutonomous ? "Ask me to code autonomously..." : "Ask me anything about editing this page..."}
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-2">
              {!isAutonomous ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setInputValue("What can I edit on this page?")}
                    data-testid="button-quick-what-edit"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    What can I edit?
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setInputValue("Suggest improvements")}
                    data-testid="button-quick-suggest"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Suggest improvements
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setInputValue("Add dark mode to this component")}
                    data-testid="button-quick-autonomous-dark"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Add dark mode
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setInputValue("Fix all TypeScript errors")}
                    data-testid="button-quick-autonomous-fix"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Fix errors
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Autonomous Progress Sidebar (Visual Editor Only) */}
        {isAutonomous && autonomousSteps.length > 0 && (
          <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <AutonomousProgressPanel
              isActive={isAutonomous}
              currentStep={currentStep}
              steps={autonomousSteps}
              checkpointCount={checkpointCount}
              onCancel={() => {
                setIsAutonomous(false);
                setAutonomousSteps([]);
                setCurrentStep(undefined);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Approval Modal (Visual Editor Only) */}
      <ApprovalModal
        open={showApprovalModal}
        request={approvalRequest}
        onApprove={() => {
          setShowApprovalModal(false);
          setApprovalRequest(null);
        }}
        onReject={() => {
          setShowApprovalModal(false);
          setApprovalRequest(null);
        }}
      />
    </>
  );
}
