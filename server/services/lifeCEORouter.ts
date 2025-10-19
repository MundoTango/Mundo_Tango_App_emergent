/**
 * Life CEO Agent Router - 16 Specialized Agents
 */

interface LifeCEOAgent {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  systemPrompt: string;
}

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
];

export function routeToLifeCEOAgent(message: string): string {
  const lowerMessage = message.toLowerCase();
  for (const agent of LIFE_CEO_AGENTS) {
    for (const keyword of agent.keywords) {
      if (lowerMessage.includes(keyword)) {
        console.log(`🎯 Routed to ${agent.name}`);
        return agent.id;
      }
    }
  }
  console.log(`🎯 No specialized agent matched, using Mr Blue Core`);
  return 'mr-blue-core';
}

export function getAgentByName(agentId: string): LifeCEOAgent | null {
  return LIFE_CEO_AGENTS.find(a => a.id === agentId) || null;
}

export function getAllAgents(): LifeCEOAgent[] {
  return LIFE_CEO_AGENTS;
}
