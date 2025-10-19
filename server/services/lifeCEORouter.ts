/**
 * Life CEO Agent Router
 * mb.md lines 1000-1007
 * Routes user queries to 16 specialized agents
 */

interface LifeCEOAgent {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  systemPrompt: string;
}

// 16 Life CEO Agents (mb.md #75)
const LIFE_CEO_AGENTS: LifeCEOAgent[] = [
  {
    id: 'schedule',
    name: 'Schedule Agent',
    description: 'Manage your calendar, events, and time management',
    keywords: ['schedule', 'calendar', 'appointment', 'meeting', 'time', 'reminder'],
    systemPrompt: 'You are the Schedule Agent. Help users manage their time, schedule events, set reminders, and optimize their daily routines.',
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    description: 'Track expenses, budgets, and financial goals',
    keywords: ['finance', 'money', 'budget', 'expense', 'income', 'savings', 'debt'],
    systemPrompt: 'You are the Finance Agent. Help users track expenses, create budgets, and achieve financial goals.',
  },
  {
    id: 'health',
    name: 'Health & Wellness Agent',
    description: 'Track fitness, nutrition, and mental wellbeing',
    keywords: ['health', 'fitness', 'exercise', 'nutrition', 'diet', 'wellness', 'mental health'],
    systemPrompt: 'You are the Health & Wellness Agent. Help users track fitness goals, nutrition, and maintain overall wellbeing.',
  },
  {
    id: 'career',
    name: 'Career Coach Agent',
    description: 'Career development, job search, and professional growth',
    keywords: ['career', 'job', 'work', 'professional', 'resume', 'interview', 'skills'],
    systemPrompt: 'You are the Career Coach Agent. Help users advance their careers, prepare for interviews, and develop professional skills.',
  },
  {
    id: 'learning',
    name: 'Learning Agent',
    description: 'Personal development and skill acquisition',
    keywords: ['learn', 'study', 'course', 'skill', 'education', 'training'],
    systemPrompt: 'You are the Learning Agent. Help users acquire new skills and knowledge through structured learning paths.',
  },
  {
    id: 'relationships',
    name: 'Relationships Agent',
    description: 'Improve personal and professional relationships',
    keywords: ['relationship', 'social', 'friends', 'family', 'communication', 'conflict'],
    systemPrompt: 'You are the Relationships Agent. Help users build better relationships through communication and empathy.',
  },
  {
    id: 'productivity',
    name: 'Productivity Agent',
    description: 'Boost efficiency and accomplish goals',
    keywords: ['productivity', 'focus', 'task', 'goal', 'efficiency', 'workflow'],
    systemPrompt: 'You are the Productivity Agent. Help users maximize efficiency and accomplish their goals.',
  },
  {
    id: 'creativity',
    name: 'Creativity Agent',
    description: 'Unlock creative potential and innovation',
    keywords: ['creative', 'art', 'design', 'innovation', 'brainstorm', 'ideas'],
    systemPrompt: 'You are the Creativity Agent. Help users unlock their creative potential and generate innovative ideas.',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness Agent',
    description: 'Meditation, stress reduction, and mental clarity',
    keywords: ['mindfulness', 'meditation', 'stress', 'anxiety', 'calm', 'relax'],
    systemPrompt: 'You are the Mindfulness Agent. Help users reduce stress and achieve mental clarity through mindfulness practices.',
  },
  {
    id: 'habits',
    name: 'Habits Agent',
    description: 'Build positive habits and break bad ones',
    keywords: ['habit', 'routine', 'consistency', 'behavior', 'change'],
    systemPrompt: 'You are the Habits Agent. Help users build positive habits and break negative patterns.',
  },
  {
    id: 'travel',
    name: 'Travel Agent',
    description: 'Plan trips and manage travel logistics',
    keywords: ['travel', 'trip', 'vacation', 'destination', 'itinerary', 'booking'],
    systemPrompt: 'You are the Travel Agent. Help users plan memorable trips and manage travel logistics.',
  },
  {
    id: 'home',
    name: 'Home Management Agent',
    description: 'Organize your living space and household tasks',
    keywords: ['home', 'house', 'cleaning', 'organize', 'chores', 'maintenance'],
    systemPrompt: 'You are the Home Management Agent. Help users organize their living space and manage household tasks.',
  },
  {
    id: 'nutrition',
    name: 'Nutrition Agent',
    description: 'Meal planning and dietary guidance',
    keywords: ['nutrition', 'meal', 'diet', 'food', 'recipe', 'cooking', 'eating'],
    systemPrompt: 'You are the Nutrition Agent. Help users plan healthy meals and maintain a balanced diet.',
  },
  {
    id: 'sleep',
    name: 'Sleep Agent',
    description: 'Improve sleep quality and patterns',
    keywords: ['sleep', 'rest', 'insomnia', 'bedtime', 'tired', 'fatigue'],
    systemPrompt: 'You are the Sleep Agent. Help users improve sleep quality and establish healthy sleep patterns.',
  },
  {
    id: 'social',
    name: 'Social Skills Agent',
    description: 'Enhance communication and social interactions',
    keywords: ['social', 'conversation', 'networking', 'public speaking', 'charisma'],
    systemPrompt: 'You are the Social Skills Agent. Help users improve communication and social interactions.',
  },
  {
    id: 'purpose',
    name: 'Life Purpose Agent',
    description: 'Discover meaning and set life direction',
    keywords: ['purpose', 'meaning', 'values', 'passion', 'direction', 'fulfillment'],
    systemPrompt: 'You are the Life Purpose Agent. Help users discover their life purpose and set meaningful direction.',
  },
];

/**
 * Route message to most relevant Life CEO agent
 */
export function routeToLifeCEOAgent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Check each agent's keywords
  for (const agent of LIFE_CEO_AGENTS) {
    for (const keyword of agent.keywords) {
      if (lowerMessage.includes(keyword)) {
        console.log(`🎯 Routed to ${agent.name}`);
        return agent.id;
      }
    }
  }

  // Default: no specialized agent
  console.log(`🎯 No specialized agent matched, using Mr Blue Core`);
  return 'mr-blue-core';
}

/**
 * Get agent details by ID or name
 */
export function getAgentByName(agentId: string): LifeCEOAgent | null {
  return LIFE_CEO_AGENTS.find(a => a.id === agentId) || null;
}

/**
 * Get all Life CEO agents
 */
export function getAllAgents(): LifeCEOAgent[] {
  return LIFE_CEO_AGENTS;
}
