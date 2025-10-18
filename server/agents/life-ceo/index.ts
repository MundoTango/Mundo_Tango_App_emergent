/**
 * ESA LIFE CEO 61x21 - Life CEO Agents
 * 16 personality agents for personal life management
 */

import { StubAgent } from '../base/StubAgent';
import type { AgentCategory } from '../base/IAgent';

const lifeCeoDefinitions = [
  { id: 'life-ceo-health', name: 'Life CEO: Health & Wellness' },
  { id: 'life-ceo-career', name: 'Life CEO: Career Coach' },
  { id: 'life-ceo-finance', name: 'Life CEO: Financial Advisor' },
  { id: 'life-ceo-relationship', name: 'Life CEO: Relationship Counselor' },
  { id: 'life-ceo-education', name: 'Life CEO: Education Mentor' },
  { id: 'life-ceo-productivity', name: 'Life CEO: Productivity Optimizer' },
  { id: 'life-ceo-mindfulness', name: 'Life CEO: Mindfulness Guide' },
  { id: 'life-ceo-creative', name: 'Life CEO: Creative Catalyst' },
  { id: 'life-ceo-travel', name: 'Life CEO: Travel Planner' },
  { id: 'life-ceo-home', name: 'Life CEO: Home Organizer' },
  { id: 'life-ceo-nutrition', name: 'Life CEO: Nutrition Specialist' },
  { id: 'life-ceo-fitness', name: 'Life CEO: Fitness Trainer' },
  { id: 'life-ceo-sleep', name: 'Life CEO: Sleep Optimizer' },
  { id: 'life-ceo-habit', name: 'Life CEO: Habit Architect' },
  { id: 'life-ceo-emergency', name: 'Life CEO: Emergency Advisor' },
  { id: 'life-ceo-strategy', name: 'Life CEO: Life Strategist' },
];

export const lifeCeoAgents = lifeCeoDefinitions.map(({ id, name }) => {
  return new class extends StubAgent {
    id = id;
    name = name;
    category: AgentCategory = 'Life CEO';
  }();
});

console.log(`[Life CEO] ${lifeCeoAgents.length} stub agents registered`);

export default lifeCeoAgents;
