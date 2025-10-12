/**
 * ESA AI Intelligence Network - AI Help Button Component
 * Agent #8 (UI Components) + Agent #31 (AI Infrastructure)
 * 
 * 60% Code Reuse: ESAMindMap.tsx + FloatingCreateButton.tsx patterns
 * Aurora Tide Design System + MT Ocean Theme
 */

import { useState, useRef } from 'react';
import { HelpCircle, X, MessageSquare, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton } from '@/components/interactions/MicroInteractions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AIContext {
  sessionId: string;
  conversationHistory: any[];
  userPreferences: any;
  journeyContext: any;
  predictedNextPage?: string;
  suggestedActions?: string[];
}

interface AIHelpButtonProps {
  position?: 'bottom-right' | 'bottom-left';
  offset?: number;
}

export function AIHelpButton({ position = 'bottom-right', offset = 24 }: AIHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [userQuery, setUserQuery] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const [currentRoute] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Get AI context for current page - ESA Agent #33 (Context Management)
  const { data: aiContext, isLoading: contextLoading } = useQuery<AIContext>({
    queryKey: ['/api/ai-intelligence/context', user?.id, sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/ai-intelligence/context?userId=${user?.id || ''}&sessionId=${sessionId || ''}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user && !!sessionId && isOpen,
  });

  // Get smart suggestions based on journey - ESA Agent #71 (Journey Prediction)
  const { data: suggestions } = useQuery({
    queryKey: ['/api/ai-intelligence/suggestions', currentRoute],
    queryFn: async () => {
      const res = await fetch(`/api/ai-intelligence/suggestions?route=${encodeURIComponent(currentRoute)}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user && isOpen,
  });

  // Send AI query mutation
  const sendQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest('/api/ai-intelligence/conversation', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: sessionId || `session_${Date.now()}`,
          pageRoute: currentRoute,
          userQuery: query,
          context: {
            userRole: (user as any)?.role || 'member',
            journeyHistory: aiContext?.journeyContext?.pages || [currentRoute]
          }
        })
      });
    },
    onSuccess: (data: any) => {
      if (!sessionId && data?.sessionId) setSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: ['/api/ai-intelligence/context'] });
      toast({
        title: "✨ AI Response",
        description: "Your AI assistant is here to help!",
      });
    }
  });

  // Magnetic hover effect (60% reuse from FloatingCreateButton.tsx)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current || !isHovered) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const magnetStrength = 0.3;
    const maxDistance = 100;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < maxDistance) {
      const strength = (1 - distance / maxDistance) * magnetStrength;
      setMagneticOffset({
        x: deltaX * strength,
        y: deltaY * strength
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMagneticOffset({ x: 0, y: 0 });
  };

  const handleSendQuery = () => {
    if (!userQuery.trim()) return;
    sendQueryMutation.mutate(userQuery);
    setUserQuery('');
  };

  if (!user) return null;

  const positionClasses = position === 'bottom-right' 
    ? `bottom-${offset} right-${offset}` 
    : `bottom-${offset} left-${offset}`;

  return (
    <>
      {/* Floating AI Help Button (60% reuse from ESAMindMap.tsx) */}
      <motion.div
        ref={buttonRef}
        className={`fixed ${positionClasses} z-40`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          x: magneticOffset.x,
          y: magneticOffset.y
        }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        data-testid="floating-ai-help-button"
      >
        {/* Glow Effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.3 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 blur-2xl opacity-40"
            />
          )}
        </AnimatePresence>

        <MagneticButton
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
            "bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500",
            isOpen ? 'scale-110' : 'hover:scale-110'
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <HelpCircle className="w-6 h-6 text-white" />
          )}
        </MagneticButton>

        {/* Pulse Ring */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* AI Help Panel (60% reuse from ESAMindMap.tsx) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
          data-testid="ai-help-overlay"
        >
          <GlassCard 
            className="w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                    <p className="text-xs text-gray-400">Context-aware help for this page</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                  data-testid="button-close-ai-help"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Smart Suggestions */}
            {aiContext?.suggestedActions && aiContext.suggestedActions.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs font-semibold text-gray-300">Smart Suggestions</p>
                </div>
                <div className="space-y-2">
                  {aiContext.suggestedActions.map((suggestion: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setUserQuery(suggestion)}
                      className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300 flex items-center gap-2 group"
                      data-testid={`suggestion-${idx}`}
                    >
                      <ArrowRight className="w-3 h-3 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Predicted Next Page */}
            {aiContext?.predictedNextPage && (
              <div className="p-3 bg-blue-500/10 border-b border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                    Prediction
                  </Badge>
                  <span className="text-gray-300">
                    Most users go to <span className="font-semibold text-white">{aiContext.predictedNextPage}</span> next
                  </span>
                </div>
              </div>
            )}

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {contextLoading ? (
                <div className="text-center text-gray-400 py-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">Loading AI context...</p>
                </div>
              ) : aiContext?.conversationHistory && aiContext.conversationHistory.length > 0 ? (
                aiContext.conversationHistory.map((conv: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-purple-500/20 rounded-lg p-3 max-w-[80%] border border-purple-500/30">
                        <p className="text-sm text-white">{conv.userQuery}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white/5 rounded-lg p-3 max-w-[80%] border border-white/10">
                        <p className="text-sm text-gray-300">{conv.aiResponse}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Ask me anything about this page!</p>
                  <p className="text-xs mt-1">I have context from your journey and can help you navigate.</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask AI for help..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  data-testid="input-ai-query"
                />
                <Button
                  onClick={handleSendQuery}
                  disabled={!userQuery.trim() || sendQueryMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-send-ai-query"
                >
                  {sendQueryMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
