/**
 * ESA Agent #73: Mr Blue AI Hook
 * Multi-model AI routing (GPT-4o, Claude, Gemini)
 * Renamed from useScottAI to useMrBlueAI
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  agentIcon?: string;
}

interface SemanticContext {
  matchCount?: number;
  eventName?: string;
  relatedData?: any[];
}

interface MrBlueAIOptions {
  defaultModel?: 'gpt-4o' | 'claude' | 'gemini';
  language?: string;
}

export function useMrBlueAI(options: MrBlueAIOptions = {}) {
  const { defaultModel = 'gpt-4o', language = 'en-US' } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('Mr Blue');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSearchingContext, setIsSearchingContext] = useState(false);
  const [semanticContext, setSemanticContext] = useState<SemanticContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: "👋 Hi! I'm Mr Blue, your AI companion. I can help you navigate Mundo Tango, answer questions, and assist with your tango journey. What can I help you with today?",
        timestamp: new Date(),
        agent: 'Mr Blue',
        agentIcon: '🔵'
      }]);

      setSuggestions([
        'Show me upcoming events',
        'Help me find dancers near me',
        'What can you do?',
        'Tell me about my profile'
      ]);
    }
  }, [messages.length]);

  // Mutation for sending messages to AI backend
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, type }: { message: string; type: 'text' | 'voice' }) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          type,
          model: defaultModel,
          language,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setIsTyping(false);
      
      // Add AI response to messages
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        agent: data.agent || 'Mr Blue',
        agentIcon: data.agentIcon || '🔵'
      }]);

      // Update semantic context if available
      if (data.context) {
        setSemanticContext(data.context);
      }

      // Update suggestions
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }

      // Update current agent if routing occurred
      if (data.agent) {
        setCurrentAgent(data.agent);
      }

      // Text-to-speech if enabled
      if (data.speak && 'speechSynthesis' in window) {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = language;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast({
        title: "AI Error",
        description: error.message || "Failed to get response from Mr Blue",
        variant: "destructive",
      });

      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    }
  });

  // Send message function
  const sendMessage = useCallback(async (message: string, type: 'text' | 'voice' = 'text') => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }]);

    // Set typing indicator
    setIsTyping(true);
    
    // Show context search for certain queries
    const needsContext = message.toLowerCase().includes('event') || 
                        message.toLowerCase().includes('find') ||
                        message.toLowerCase().includes('show me');
    
    if (needsContext) {
      setIsSearchingContext(true);
      setTimeout(() => setIsSearchingContext(false), 1000);
    }

    // Send to AI
    await sendMessageMutation.mutateAsync({ message, type });
  }, [sendMessageMutation]);

  return {
    messages,
    isTyping,
    currentAgent,
    isSpeaking,
    isSearchingContext,
    semanticContext,
    sendMessage,
    suggestions,
  };
}

// Named export for backwards compatibility
export const useScottAI = useMrBlueAI;
