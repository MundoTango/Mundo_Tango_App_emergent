/**
 * Life CEO Agent Router
 * Routes user queries to appropriate specialized agents
 * mb.md lines 84-99 (16 agents)
 */

interface LifeCEOAgent {
  id: number;
  name: string;
  keywords: string[];
  description: string;
}

// All 16 Life CEO agents with keywords
export const LIFE_CEO_AGENTS: LifeCEOAgent[] = [
  {
    id: 84,
    name: 'Schedule Agent',
    keywords: ['schedule', 'calendar', 'appointment', 'meeting', 'event', 'booking', 'plan', 'time'],
    description: 'Manages calendar, appointments, and time scheduling',
  },
  {
    id: 85,
    name: 'Finance Agent',
    keywords: ['money', 'budget', 'expense', 'finance', 'payment', 'bill', 'cost', 'price', 'subscription'],
    description: 'Handles budgeting, expenses, and financial planning',
  },
  {
    id: 86,
    name: 'Health Agent',
    keywords: ['health', 'fitness', 'exercise', 'workout', 'nutrition', 'diet', 'medical', 'wellness'],
    description: 'Tracks health, fitness, and wellness goals',
  },
  {
    id: 87,
    name: 'Career Agent',
    keywords: ['job', 'career', 'resume', 'interview', 'work', 'professional', 'salary', 'promotion'],
    description: 'Career development and job search assistance',
  },
  {
    id: 88,
    name: 'Learning Agent',
    keywords: ['learn', 'study', 'course', 'education', 'training', 'skill', 'tutorial', 'teach'],
    description: 'Educational resources and skill development',
  },
  {
    id: 89,
    name: 'Relationship Agent',
    keywords: ['relationship', 'friend', 'family', 'social', 'dating', 'partner', 'communication'],
    description: 'Relationship advice and social connections',
  },
  {
    id: 90,
    name: 'Travel Agent',
    keywords: ['travel', 'trip', 'vacation', 'destination', 'flight', 'hotel', 'tourism', 'explore'],
    description: 'Travel planning and destination recommendations',
  },
  {
    id: 91,
    name: 'Home Agent',
    keywords: ['home', 'house', 'apartment', 'cleaning', 'maintenance', 'repair', 'organize', 'decor'],
    description: 'Home organization and maintenance',
  },
  {
    id: 92,
    name: 'Shopping Agent',
    keywords: ['shop', 'buy', 'purchase', 'product', 'order', 'delivery', 'amazon', 'store'],
    description: 'Shopping assistance and product recommendations',
  },
  {
    id: 93,
    name: 'Entertainment Agent',
    keywords: ['movie', 'music', 'game', 'entertainment', 'show', 'concert', 'netflix', 'spotify'],
    description: 'Entertainment recommendations and event discovery',
  },
  {
    id: 94,
    name: 'Productivity Agent',
    keywords: ['task', 'todo', 'project', 'organize', 'productivity', 'goal', 'habit', 'focus'],
    description: 'Task management and productivity optimization',
  },
  {
    id: 95,
    name: 'Mindfulness Agent',
    keywords: ['meditate', 'mindful', 'calm', 'relax', 'stress', 'mental', 'breathing', 'peace'],
    description: 'Mindfulness and stress management',
  },
  {
    id: 96,
    name: 'Community Agent',
    keywords: ['community', 'group', 'tango', 'event', 'social', 'meet', 'milonga', 'dance'],
    description: 'Tango community engagement and event discovery',
  },
  {
    id: 97,
    name: 'Legal Agent',
    keywords: ['legal', 'contract', 'law', 'attorney', 'rights', 'document', 'agreement', 'terms'],
    description: 'Legal information and document assistance',
  },
  {
    id: 98,
    name: 'Tax Agent',
    keywords: ['tax', 'filing', 'deduction', 'irs', 'refund', 'accountant', 'income', 'return'],
    description: 'Tax filing and financial compliance',
  },
  {
    id: 99,
    name: 'Pet Agent',
    keywords: ['pet', 'dog', 'cat', 'animal', 'vet', 'care', 'training', 'adoption'],
    description: 'Pet care and veterinary guidance',
  },
];

/**
 * Route message to appropriate Life CEO agent based on keywords
 * Returns agent name (or 'Mr Blue Core' if no match)
 */
export function routeToLifeCEOAgent(message: string): string {
  const lowerMessage = message.toLowerCase();

  for (const agent of LIFE_CEO_AGENTS) {
    for (const keyword of agent.keywords) {
      if (lowerMessage.includes(keyword)) {
        console.log(`🎯 Routed to ${agent.name} (keyword: "${keyword}")`);
        return agent.name;
      }
    }
  }

  console.log('🎯 No specialized agent matched, using Mr Blue Core');
  return 'Mr Blue Core';
}

/**
 * Get agent details by name
 */
export function getAgentByName(agentName: string): LifeCEOAgent | null {
  return LIFE_CEO_AGENTS.find(a => a.name === agentName) || null;
}

/**
 * Get all Life CEO agents (for frontend display)
 */
export function getAllAgents(): LifeCEOAgent[] {
  return LIFE_CEO_AGENTS;
}
