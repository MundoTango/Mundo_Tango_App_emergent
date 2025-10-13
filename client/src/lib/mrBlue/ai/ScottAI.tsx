import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadConversation, 
  addMessage as saveMessage, 
  updateCurrentAgent, 
  loadPreferences,
  trackModelUsage 
} from '../storage/localStorage';

/**
 * ESA Agent #73-80: Scott AI Integration
 * - ESA orchestrator integration
 * - Multi-model routing (GPT-4o, Claude, Gemini)
 * - Scott Boddye voice personality
 * - Web Speech API (multilingual TTS)
 * - 16 Life CEO agents routing
 * - Page context awareness
 */

interface ScottAIConfig {
  orchestratorUrl?: string;
  defaultModel?: 'gpt-4o' | 'claude' | 'gemini';
  scottVoice?: string;
  language?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  agentIcon?: string;
}

export function useScottAI(config: ScottAIConfig = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string>('Mr Blue');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  // Load conversation history on mount
  useEffect(() => {
    const savedConversation = loadConversation();
    if (savedConversation) {
      setMessages(savedConversation.messages);
      setCurrentAgent(savedConversation.currentAgent);
    }
  }, []);

  // ========================================
  // SCOTT'S VOICE PERSONALITY (from blueprint)
  // ========================================
  const scottPersonality = `You are Mr Blue (Scott), the Life CEO AI companion.

VOICE IDENTITY:
- Tone: Decisive, grounded, direct, but human — a builder's tone
- Energy: Focused and efficient, never rushed or robotic
- Empathy Level: Medium-high. Always acknowledges confusion before solving
- Personality: 70% engineer-strategist • 20% creative coach • 10% friend who wants you to win

RESPONSE STYLE:
- Cadence: short, declarative bursts → quick transition → next step
- Example: "Okay, let's lock that in. Now open your dashboard and check the event tag."
- Structure: one task per line or sentence
- Use dashes and line breaks for pacing

KEY PHRASES:
- Directive: build, run, analyze, lock in, go for it
- Transitions: now, next, okay so, alright, here's what's happening
- Approval: perfect, exactly, locked, yes—that's right
- Softeners: no worries, we'll fix that fast, easy win
- Collaborative: let's do this, we're in it together, we've got this

INTERACTION PATTERNS:
- When confused → "No stress. Here's what's actually going on—and what to do next."
- When problem is big → "Let's handle it in three moves. Step one…"
- When emotional → "Yeah, that's frustrating. But we can fix it right now."
- When task done → "Perfect. You're live now—next up, tagging."

NEVER:
- Don't sound formal or corporate ("Dear user," "We apologize…")
- Don't hedge ("Perhaps you could…" → say "Let's do this instead.")
- Don't over-explain; summarize then link`;

  // ========================================
  // PAGE CONTEXT AWARENESS
  // ========================================
  const getCurrentPageContext = () => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'home';
    
    return {
      page,
      url: path,
      title: document.title,
      elements: document.querySelectorAll('[data-testid]').length,
    };
  };

  // ========================================
  // LIFE CEO AGENT ROUTING
  // ========================================
  const routeToAgent = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Automatic routing based on keywords
    const agents = {
      'Schedule Agent': ['schedule', 'calendar', 'appointment', 'meeting', 'event'],
      'Finance Agent': ['money', 'budget', 'expense', 'finance', 'payment'],
      'Health Agent': ['health', 'fitness', 'exercise', 'workout', 'nutrition'],
      'Goals Agent': ['goal', 'objective', 'achieve', 'target', 'plan'],
      'Travel Agent': ['travel', 'trip', 'flight', 'hotel', 'vacation'],
      'Relationship Agent': ['friend', 'family', 'relationship', 'social'],
    };

    for (const [agent, keywords] of Object.entries(agents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        updateCurrentAgent(agent); // Save to localStorage
        return agent;
      }
    }

    return 'Mr Blue'; // Default
  };

  // ========================================
  // AI RESPONSE GENERATION
  // ========================================
  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      // Detect which agent should handle this
      const targetAgent = routeToAgent(userMessage);
      setCurrentAgent(targetAgent);

      // Get page context
      const context = getCurrentPageContext();

      // Get user preferences
      const preferences = loadPreferences();

      // Call Mr Blue AI endpoint
      const response = await fetch('/api/ai/mrblue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          personality: scottPersonality,
          agent: targetAgent,
          context,
          model: preferences.aiModel || config.defaultModel || 'gpt-4o',
        }),
      });

      const data = await response.json();
      
      // Track model usage
      trackModelUsage(data.model || preferences.aiModel);
      
      return data.response || "Let's tackle this together. What specifically needs help?";
    } catch (error) {
      console.error('AI error:', error);
      return "No worries—hit a quick snag. Let's try that again.";
    }
  };

  // ========================================
  // TEXT-TO-SPEECH (Multilingual)
  // ========================================
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Scott's voice settings
      utterance.rate = 1.1; // Slightly faster (focused energy)
      utterance.pitch = 1.0; // Natural pitch
      utterance.lang = config.language || 'en-US';
      
      // Try to find a male voice
      const voices = speechSynthesis.getVoices();
      const maleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('george')
      );
      if (maleVoice) utterance.voice = maleVoice;

      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ========================================
  // SEND MESSAGE
  // ========================================
  const sendMessage = async (content: string, type: 'text' | 'voice') => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage); // Save to localStorage

    // Show typing indicator
    setIsTyping(true);

    // Get AI response
    const response = await generateResponse(content);

    // Add AI message
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      agent: currentAgent,
      agentIcon: getAgentIcon(currentAgent),
    };
    
    setMessages(prev => [...prev, aiMessage]);
    saveMessage(aiMessage); // Save to localStorage
    setIsTyping(false);

    // Speak response if voice mode
    if (type === 'voice') {
      speak(response);
    }
  };

  // ========================================
  // SUGGESTED REPLIES
  // ========================================
  const getSuggestions = (): string[] => {
    if (messages.length === 0) {
      return [
        "What can you help me with?",
        "Show my schedule",
        "Check my goals"
      ];
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      return [
        "Tell me more",
        "How do I do that?",
        "Show me an example"
      ];
    }

    return [];
  };

  return {
    messages,
    isTyping,
    currentAgent,
    isSpeaking,
    sendMessage,
    suggestions: getSuggestions(),
  };
}

// ========================================
// HELPERS
// ========================================
function getAgentIcon(agent: string): string {
  const icons: Record<string, string> = {
    'Mr Blue': '🤖',
    'Schedule Agent': '📅',
    'Finance Agent': '💰',
    'Health Agent': '🏋️',
    'Goals Agent': '🎯',
    'Travel Agent': '✈️',
    'Relationship Agent': '👥',
  };
  return icons[agent] || '🤖';
}

// ========================================
// BACKEND ROUTE (for reference)
// ========================================
// POST /api/ai/chat
// Body: { message, personality, agent, context, model }
// Response: { response, agent, suggestions? }
