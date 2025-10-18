/**
 * Journey Agents Registry
 * 8 journey agents covering 5 audience types
 */

import { j1Agent } from './J1-first-time-visitor';
import { j2Agent } from './J2-dancer-journey';
import { j7Agent } from './J7-volunteer-builder';

// Placeholder for remaining journey agents (to be implemented)
const j3Agent = { config: { id: 'J3', name: 'Organizer Journey', status: 'pending', priority: 'P1' as const } };
const j4Agent = { config: { id: 'J4', name: 'Teacher Journey', status: 'pending', priority: 'P1' as const } };
const j5Agent = { config: { id: 'J5', name: 'DJ/Musician Journey', status: 'pending', priority: 'P1' as const } };
const j6Agent = { config: { id: 'J6', name: 'Power User Journey', status: 'pending', priority: 'P2' as const } };
const j8Agent = { config: { id: 'J8', name: 'Super Admin Journey', status: 'pending', priority: 'P2' as const } };

export const journeyAgents = {
  J1: j1Agent,
  J2: j2Agent,
  J3: j3Agent,
  J4: j4Agent,
  J5: j5Agent,
  J6: j6Agent,
  J7: j7Agent,
  J8: j8Agent
};

export function getAllJourneyAgents() {
  return Object.values(journeyAgents);
}

export function getJourneyAgent(id: string) {
  return journeyAgents[id as keyof typeof journeyAgents];
}

export function getJourneyStatus() {
  const agents = getAllJourneyAgents();
  return {
    total: agents.length,
    pending: agents.filter(a => a.config.status === 'pending').length,
    active: agents.filter(a => a.config.status === 'active').length,
    complete: agents.filter(a => a.config.status === 'complete').length,
    p0: agents.filter(a => a.config.priority === 'P0').length,
    p1: agents.filter(a => a.config.priority === 'P1').length,
    p2: agents.filter(a => a.config.priority === 'P2').length
  };
}
