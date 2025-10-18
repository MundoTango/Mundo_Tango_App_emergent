/**
 * App Lead Agents Registry
 * 6 agents managing 3-app architecture
 */

import { m1Agent } from './M1-marketing-site-director';
import { t1Agent } from './T1-talent-match-director';

// Placeholder for remaining app lead agents (to be fully implemented)
const s1Agent = {
  config: {
    id: 'S1',
    name: 'Server API Director',
    app: 'Server API',
    port: 4000,
    status: 'pending' as const,
    scaffolding: 'exists (half-finished)'
  }
};

const i1Agent = {
  config: {
    id: 'I1',
    name: '3-App Coordinator',
    purpose: 'Integrate Marketing Site + Talent Match + Server API',
    status: 'pending' as const
  }
};

const d1Agent = {
  config: {
    id: 'D1',
    name: '/docs Layer Manager',
    purpose: 'Maintain docs/ directory for Server API',
    status: 'pending' as const,
    files: ['ESA.md', 'ESA.json', 'AI_ClarifierLogic.md', 'API.md', 'phases/*']
  }
};

const c1Agent = {
  config: {
    id: 'C1',
    name: 'Resume Interview Agent (AI Clarifier)',
    technology: 'GPT-4o (or multi-model)',
    purpose: 'AI-powered resume analysis and volunteer interview',
    status: 'pending' as const
  }
};

export const appLeadAgents = {
  M1: m1Agent,
  T1: t1Agent,
  S1: s1Agent,
  I1: i1Agent,
  D1: d1Agent,
  C1: c1Agent
};

export function getAllAppLeadAgents() {
  return Object.values(appLeadAgents);
}

export function getAppLeadAgent(id: string) {
  return appLeadAgents[id as keyof typeof appLeadAgents];
}

export function getAppLeadStatus() {
  const agents = getAllAppLeadAgents();
  return {
    total: agents.length,
    pending: agents.filter(a => a.config.status === 'pending').length,
    active: agents.filter(a => a.config.status === 'active').length,
    complete: agents.filter(a => a.config.status === 'complete').length
  };
}
