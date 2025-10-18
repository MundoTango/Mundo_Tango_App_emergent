/**
 * Mundo Tango Agent Registry
 * Consolidated registry for all 276 agents across 13 categories
 * 
 * Agent Count Status:
 * - ESA Infrastructure: 61 agents (Layer 1-61)
 * - Algorithms: 10 agents
 * - Services: 10 agents
 * - Page Agents: 1/125 agents (124 pending)
 * - Leadership: ~5 agents
 * - Operational: ~8 agents
 * - Life CEO: 16 agents
 * - Mr Blue: 8 agents
 * - Journey Agents: 4 agents
 * - UI Sub-Agents: 3 agents
 * - Marketing: ~5 agents
 * - App Leads: ~5 agents
 * - Hire/Volunteer: ~5 agents
 * 
 * Total Operational: ~123 agents (45%)
 * Total Remaining: ~153 agents (55%)
 */

import { IAgent, AgentRegistry } from './base/IAgent';
import { algorithmAgents } from './algorithms';
import { serviceAgents } from './services';
import { pageAgents } from './page-agents';
import { leadershipAgents } from './leadership';
import { operationalAgents } from './operational';
import { lifeCeoAgents } from './life-ceo';
import { mrBlueAgents } from './mr-blue';
import { journeyAgents } from './journey-agents';
import { uiSubAgents } from './ui-sub-agents';
import { marketingAgents } from './marketing';
import { appLeadsAgents } from './app-leads';
import { hireVolunteerAgents } from './hire-volunteer';

const allAgents: IAgent[] = [
  ...algorithmAgents,
  ...serviceAgents,
  ...pageAgents,
  ...leadershipAgents,
  ...operationalAgents,
  ...lifeCeoAgents,
  ...mrBlueAgents,
  ...journeyAgents,
  ...uiSubAgents,
  ...marketingAgents,
  ...appLeadsAgents,
  ...hireVolunteerAgents,
];

export function getAgentRegistry(): AgentRegistry {
  const byCategory = allAgents.reduce((acc, agent) => {
    acc[agent.category] = (acc[agent.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus = allAgents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalAgents: allAgents.length,
    byCategory: byCategory as any,
    byStatus: byStatus as any,
    agents: allAgents,
  };
}

export function getAgentById(id: string): IAgent | undefined {
  return allAgents.find(agent => agent.id === id);
}

export function getAgentsByCategory(category: string): IAgent[] {
  return allAgents.filter(agent => agent.category === category);
}

export function getAgentsByStatus(status: string): IAgent[] {
  return allAgents.filter(agent => agent.status === status);
}

export { allAgents };

const registry = getAgentRegistry();
console.log(`[Agent Registry] ${registry.totalAgents} agents loaded`);
console.log(`[Agent Registry] By Category:`, registry.byCategory);
console.log(`[Agent Registry] By Status:`, registry.byStatus);
