/**
 * Journey Agents Index
 * Phase 0 Task 0.5: Journey Orchestration
 * 
 * Exports all journey agents (J1-J4) for registration in agent-coordinator
 */

import j1NewUserAgent from './j1-new-user-agent';
import j2ActiveUserAgent from './j2-active-user-agent';
import j3PowerUserAgent from './j3-power-user-agent';
import j4SuperAdminAgent from './j4-super-admin-agent';

export const journeyAgents = [
  j1NewUserAgent,
  j2ActiveUserAgent,
  j3PowerUserAgent,
  j4SuperAdminAgent,
];

export {
  j1NewUserAgent,
  j2ActiveUserAgent,
  j3PowerUserAgent,
  j4SuperAdminAgent,
};

console.log(`📍 [Journey Agents] 4 agents registered (J1-J4)`);
