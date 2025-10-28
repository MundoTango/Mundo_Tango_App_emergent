/**
 * Life CEO Router - AI Agent Routing Service
 * CRITICAL FIX: Missing module causing Mr Blue startup failure
 * Routes user requests to appropriate Life CEO agents
 * 
 * Created: October 28, 2025
 */

import { MultiModelOrchestrator } from './multiModelOrchestrator';
import type { User } from '@shared/schema';

// Agent registry
const LIFE_CEO_AGENTS = {
  'health': {
    name: 'Health & Wellness Agent',
    id: 73,
    description: 'Manages health tracking, fitness goals, nutrition',
    capabilities: ['fitness_tracking', 'nutrition_planning', 'wellness_goals']
  },
  'finance': {
    name: 'Financial Planning Agent',
    id: 74,
    description: 'Budget management, savings goals, investment tracking',
    capabilities: ['budget_planning', 'expense_tracking', 'savings_goals']
  },
  'productivity': {
    name: 'Productivity Agent',
    id: 75,
    description: 'Task management, time blocking, goal tracking',
    capabilities: ['task_management', 'time_blocking', 'productivity_metrics']
  },
  'relationships': {
    name: 'Relationship Management Agent',
    id: 76,
    description: 'Social connections, networking, communication',
    capabilities: ['relationship_tracking', 'networking', 'social_health']
  },
  'learning': {
    name: 'Learning & Development Agent',
    id: 77,
    description: 'Skill development, course tracking, knowledge management',
    capabilities: ['skill_tracking', 'course_management', 'learning_paths']
  },
  'career': {
    name: 'Career Growth Agent',
    id: 78,
    description: 'Career planning, job tracking, professional development',
    capabilities: ['career_planning', 'job_search', 'professional_growth']
  },
  'mindfulness': {
    name: 'Mindfulness & Mental Health Agent',
    id: 79,
    description: 'Meditation, stress management, mental wellness',
    capabilities: ['meditation_tracking', 'stress_management', 'mental_health']
  },
  'general': {
    name: 'General Life CEO Coordinator',
    id: 80,
    description: 'Coordinates across all Life CEO domains',
    capabilities: ['coordination', 'life_overview', 'goal_synthesis']
  }
};

/**
 * Route a user message to the appropriate Life CEO agent
 * @param message - User's message
 * @param user - Authenticated user (optional)
 * @returns Agent name and response
 */
export async function routeToLifeCEOAgent(
  message: string,
  user?: User
): Promise<{ agent: string; response: string }> {
  const lowerMessage = message.toLowerCase();
  
  // Intent classification
  let selectedAgent = 'general';
  
  if (lowerMessage.includes('health') || lowerMessage.includes('fitness') || lowerMessage.includes('workout')) {
    selectedAgent = 'health';
  } else if (lowerMessage.includes('money') || lowerMessage.includes('budget') || lowerMessage.includes('finance')) {
    selectedAgent = 'finance';
  } else if (lowerMessage.includes('task') || lowerMessage.includes('productive') || lowerMessage.includes('schedule')) {
    selectedAgent = 'productivity';
  } else if (lowerMessage.includes('friend') || lowerMessage.includes('relationship') || lowerMessage.includes('social')) {
    selectedAgent = 'relationships';
  } else if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('course')) {
    selectedAgent = 'learning';
  } else if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
    selectedAgent = 'career';
  } else if (lowerMessage.includes('meditate') || lowerMessage.includes('stress') || lowerMessage.includes('mindful')) {
    selectedAgent = 'mindfulness';
  }
  
  const agent = LIFE_CEO_AGENTS[selectedAgent as keyof typeof LIFE_CEO_AGENTS];
  
  // Use MultiModelOrchestrator for AI response
  const orchestrator = new MultiModelOrchestrator();
  
  const systemPrompt = `You are the ${agent.name} (Agent #${agent.id}), part of the Life CEO framework.

Your role: ${agent.description}

Capabilities: ${agent.capabilities.join(', ')}

Provide helpful, actionable advice in your domain. Be supportive and encouraging.`;

  let responseContent = '';
  
  for await (const chunk of orchestrator.streamResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ], 'claude-3-sonnet')) {
    responseContent += chunk;
  }
  
  return {
    agent: agent.name,
    response: responseContent
  };
}

/**
 * Get agent information by name
 * @param agentName - Name of the agent (health, finance, etc.)
 * @returns Agent information
 */
export function getAgentByName(agentName: string): typeof LIFE_CEO_AGENTS[keyof typeof LIFE_CEO_AGENTS] | null {
  const normalizedName = agentName.toLowerCase().replace(/[^a-z]/g, '');
  return LIFE_CEO_AGENTS[normalizedName as keyof typeof LIFE_CEO_AGENTS] || null;
}

/**
 * Get all available Life CEO agents
 * @returns Array of all agents
 */
export function getAllAgents(): Array<typeof LIFE_CEO_AGENTS[keyof typeof LIFE_CEO_AGENTS]> {
  return Object.values(LIFE_CEO_AGENTS);
}

/**
 * Check if a message is relevant to Life CEO domain
 * @param message - User message
 * @returns Boolean indicating if message is Life CEO related
 */
export function isLifeCEOMessage(message: string): boolean {
  const lifeCEOKeywords = [
    'health', 'fitness', 'workout', 'nutrition',
    'money', 'budget', 'finance', 'savings',
    'task', 'productive', 'schedule', 'goal',
    'friend', 'relationship', 'social', 'network',
    'learn', 'study', 'course', 'skill',
    'career', 'job', 'work', 'professional',
    'meditate', 'stress', 'mindful', 'wellness',
    'life', 'ceo', 'manage', 'track'
  ];
  
  const lowerMessage = message.toLowerCase();
  return lifeCEOKeywords.some(keyword => lowerMessage.includes(keyword));
}
