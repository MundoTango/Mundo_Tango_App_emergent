/**
 * AGENT DISCOVERY SYSTEM
 * MB.MD Stream 3: Map UI elements to responsible agents
 * 
 * When user selects an element, suggest which agents built/maintain it
 */

interface AgentMapping {
  test: (text: string) => boolean;
  agents: string[];
  description: string;
}

// Agent responsibility mapping based on element patterns
const AGENT_MAPPINGS: AgentMapping[] = [
  // Visual Editor Components
  {
    test: (text) => /visual-editor|inspector|element-selector/i.test(text),
    agents: ['Agent #78 - Visual Editor', 'Agent #76 - Code Generator'],
    description: 'Visual page editing & code generation'
  },
  
  // Mr Blue AI Components
  {
    test: (text) => /mr-blue|chat|conversation|message/i.test(text),
    agents: ['Agent #73 - Mr Blue Chat', 'Agent #74 - Voice Mode', 'Agent #77 - Streaming SSE'],
    description: 'AI chat & voice conversation'
  },
  
  // Voice & Audio
  {
    test: (text) => /voice|audio|mic|speaker|realtime/i.test(text),
    agents: ['Agent #74 - Voice Mode', 'Agent #75 - Audio Processing'],
    description: 'Voice & audio features'
  },
  
  // Memory/Post System
  {
    test: (text) => /memory|post|feed|timeline/i.test(text),
    agents: ['Foundation Agent #3 - Memory System', 'Page Agent #1 - Feed'],
    description: 'Posts, memories & social feed'
  },
  
  // Events
  {
    test: (text) => /event|calendar|rsvp/i.test(text),
    agents: ['Foundation Agent #4 - Event System', 'Page Agent #2 - Events'],
    description: 'Event management & calendar'
  },
  
  // Groups
  {
    test: (text) => /group|community|city/i.test(text),
    agents: ['Foundation Agent #5 - Group System', 'Page Agent #3 - Groups'],
    description: 'Groups & communities'
  },
  
  // Profiles
  {
    test: (text) => /profile|user|avatar|bio/i.test(text),
    agents: ['Foundation Agent #6 - Profile System', 'Page Agent #4 - Profile'],
    description: 'User profiles & settings'
  },
  
  // Authentication
  {
    test: (text) => /login|auth|signin|signup/i.test(text),
    agents: ['Foundation Agent #1 - Authentication', 'Core Agent #1 - User Management'],
    description: 'User authentication & access'
  },
  
  // UI Components (shadcn)
  {
    test: (text) => /button|input|dialog|modal|card|dropdown/i.test(text),
    agents: ['Core Agent #3 - Component System', 'UI Foundation'],
    description: 'Reusable UI components'
  },
  
  // Journey System
  {
    test: (text) => /journey|onboarding|welcome/i.test(text),
    agents: ['Journey Agent J1-J5', 'Business Agent #2 - Customer Journey'],
    description: 'User journey & onboarding'
  }
];

/**
 * Discover which agents are responsible for an element
 */
export function discoverAgents(element: {
  tagName?: string;
  id?: string;
  className?: string;
  testId?: string;
}): { agents: string[]; description: string } | null {
  // Build searchable text from element attributes
  const searchText = [
    element.id || '',
    element.className || '',
    element.testId || '',
    element.tagName || ''
  ].join(' ').toLowerCase();
  
  // Find matching agent mapping
  for (const mapping of AGENT_MAPPINGS) {
    if (mapping.test(searchText)) {
      return {
        agents: mapping.agents,
        description: mapping.description
      };
    }
  }
  
  // Default: No specific agent found
  return null;
}

/**
 * Get suggested agents as a formatted string
 */
export function getAgentSuggestion(element: {
  tagName?: string;
  id?: string;
  className?: string;
  testId?: string;
}): string {
  const discovery = discoverAgents(element);
  
  if (!discovery) {
    return 'General UI element';
  }
  
  return `${discovery.agents.join(', ')} • ${discovery.description}`;
}
