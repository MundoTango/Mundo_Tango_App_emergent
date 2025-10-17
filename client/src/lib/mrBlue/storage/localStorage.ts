/**
 * ESA Mr Blue - localStorage Persistence (Privacy-First)
 * 
 * Stores conversation history locally without server storage
 * Supports export features and session management
 */

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  agentIcon?: string;
}

interface MrBlueConversation {
  messages: Message[];
  currentAgent: string;
  routingHistory: string[];
  pageContext: {
    page: string;
    url: string;
  };
  lastUpdated: string;
}

interface MrBluePreferences {
  voiceEnabled: boolean;
  avatarQuality: 'auto' | 'high' | 'low';
  aiModel: 'claude-sonnet-4-20250514' | 'claude-3-5-sonnet-20241022' | 'claude' | 'gpt-4o' | 'gpt-3.5-turbo' | 'gemini';
  language: string;
}

interface MrBlueAIContext {
  orchestratorSession: string;
  modelUsage: {
    [model: string]: number;
  };
  embeddings: any[];
}

const STORAGE_KEYS = {
  CONVERSATION: 'mrBlue_conversation',
  PREFERENCES: 'mrBlue_preferences',
  AI_CONTEXT: 'mrBlue_aiContext',
};

// ========================================
// CONVERSATION STORAGE
// ========================================

export function saveConversation(conversation: MrBlueConversation): void {
  try {
    const data = {
      ...conversation,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CONVERSATION, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

export function loadConversation(): MrBlueConversation | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATION);
    if (!data) return null;

    const conversation = JSON.parse(data);
    
    // Convert timestamp strings back to Date objects
    conversation.messages = conversation.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    return conversation;
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
}

export function clearConversation(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION);
  } catch (error) {
    console.error('Failed to clear conversation:', error);
  }
}

export function addMessage(message: Message): void {
  try {
    const conversation = loadConversation() || {
      messages: [],
      currentAgent: 'Mr Blue',
      routingHistory: [],
      pageContext: {
        page: window.location.pathname.split('/').pop() || 'home',
        url: window.location.pathname,
      },
      lastUpdated: new Date().toISOString(),
    };

    conversation.messages.push(message);
    conversation.lastUpdated = new Date().toISOString();
    
    saveConversation(conversation);
  } catch (error) {
    console.error('Failed to add message:', error);
  }
}

export function updateCurrentAgent(agent: string): void {
  try {
    const conversation = loadConversation();
    if (!conversation) return;

    conversation.currentAgent = agent;
    conversation.routingHistory.push(agent);
    conversation.lastUpdated = new Date().toISOString();
    
    saveConversation(conversation);
  } catch (error) {
    console.error('Failed to update agent:', error);
  }
}

// ========================================
// PREFERENCES STORAGE
// ========================================

export function savePreferences(preferences: Partial<MrBluePreferences>): void {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function loadPreferences(): MrBluePreferences {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!data) {
      // Return defaults
      return {
        voiceEnabled: true,
        avatarQuality: 'auto',
        aiModel: 'claude-sonnet-4-20250514',
        language: 'en-US',
      };
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return {
      voiceEnabled: true,
      avatarQuality: 'auto',
      aiModel: 'claude-sonnet-4-20250514',
      language: 'en-US',
    };
  }
}

// ========================================
// AI CONTEXT STORAGE
// ========================================

export function saveAIContext(context: Partial<MrBlueAIContext>): void {
  try {
    const current = loadAIContext();
    const updated = { ...current, ...context };
    localStorage.setItem(STORAGE_KEYS.AI_CONTEXT, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save AI context:', error);
  }
}

export function loadAIContext(): MrBlueAIContext {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AI_CONTEXT);
    if (!data) {
      return {
        orchestratorSession: `session-${Date.now()}`,
        modelUsage: {},
        embeddings: [],
      };
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load AI context:', error);
    return {
      orchestratorSession: `session-${Date.now()}`,
      modelUsage: {},
      embeddings: [],
    };
  }
}

export function trackModelUsage(model: string): void {
  try {
    const context = loadAIContext();
    context.modelUsage[model] = (context.modelUsage[model] || 0) + 1;
    saveAIContext(context);
  } catch (error) {
    console.error('Failed to track model usage:', error);
  }
}

// ========================================
// EXPORT HELPERS
// ========================================

export function getStorageSize(): number {
  try {
    let size = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const data = localStorage.getItem(key);
      if (data) {
        size += data.length;
      }
    }
    return size;
  } catch (error) {
    console.error('Failed to get storage size:', error);
    return 0;
  }
}

export function clearAllMrBlueData(): void {
  try {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Failed to clear Mr Blue data:', error);
  }
}
